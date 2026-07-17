import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import SessionLocal
from app.models.transaction import Transaction
from app.models.alerte import Alerte
from app.services.aml_service import (
    calculer_score_aml, determiner_niveau_risque, creer_alerte_si_necessaire
)
from sqlalchemy import text
import uuid
import random
from datetime import datetime, timedelta

db = SessionLocal()

# Récupérer la banque existante
from app.models.banque import Banque
banque = db.query(Banque).first()
if not banque:
    print("❌ Aucune banque trouvée. Insère une banque d'abord.")
    sys.exit(1)

print(f"✅ Banque : {banque.nom}")

# Transactions normales (80%)
transactions_normales = [
    {"montant": random.randint(50_000, 2_000_000),
     "heure": random.randint(8, 17),
     "type": "virement"}
    for _ in range(60)
]

# Transactions suspectes (20%)
transactions_suspectes = [
    {"montant": random.randint(4_500_000, 4_999_999),
     "heure": random.randint(0, 5),
     "type": "virement"},
    {"montant": 15_000_000, "heure": 2, "type": "virement"},
    {"montant": 4_750_000, "heure": 3, "type": "retrait"},
    {"montant": 4_800_000, "heure": 23, "type": "virement"},
    {"montant": 52_000_000, "heure": 1, "type": "virement"},
    {"montant": 4_900_000, "heure": 4, "type": "transfert"},
    {"montant": 4_600_000, "heure": 0, "type": "virement"},
    {"montant": 25_000_000, "heure": 3, "type": "virement"},
    {"montant": 4_850_000, "heure": 2, "type": "retrait"},
    {"montant": 4_700_000, "heure": 23, "type": "virement"},
]

toutes = transactions_normales + transactions_suspectes
random.shuffle(toutes)

comptes_emetteurs = [
    "CM21-1001-0001", "CM21-1001-0002", "CM21-1001-0003",
    "CM21-1001-0004", "CM21-1001-0005", "CM21-1001-0006",
]
comptes_destinataires = [
    "CM21-2001-0001", "CM21-2001-0002", "CM21-2001-0003",
    "CM21-2001-0004", "CM21-2001-0005",
]
noms = [
    "Jean Dupont", "Marie Ngono", "Paul Essomba",
    "Fatima Bello", "André Mbarga", "Sophie Talla",
    "Ibrahim Moussa", "Cécile Ateba", "Roger Fopa", "Aïcha Yaya"
]

print("⏳ Génération des transactions...")
created = 0

for i, t in enumerate(toutes):
    ref = f"TXN-SEED-{str(i+1).zfill(4)}"

    # Vérifier si déjà existant
    existante = db.query(Transaction).filter(
        Transaction.reference == ref
    ).first()
    if existante:
        continue

    date_base = datetime.now() - timedelta(days=random.randint(1, 90))
    date_tx = date_base.replace(
        hour=t["heure"],
        minute=random.randint(0, 59),
        second=random.randint(0, 59)
    )

    transaction = Transaction(
        id=uuid.uuid4(),
        reference=ref,
        banque_id=banque.id,
        compte_emetteur=random.choice(comptes_emetteurs),
        nom_emetteur=random.choice(noms),
        compte_destinataire=random.choice(comptes_destinataires),
        nom_destinataire=random.choice(noms),
        montant=t["montant"],
        devise="XAF",
        type_operation=t["type"],
        date_transaction=date_tx,
        statut="completee",
        analysee=False
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Calcul score AML
    score = float(calculer_score_aml(transaction, db))
    niveau = determiner_niveau_risque(score)

    db.execute(
        text("UPDATE transactions SET score_aml = :score, niveau_risque = :niveau, analysee = true WHERE id = :id"),
        {"score": score, "niveau": niveau, "id": str(transaction.id)}
    )

    creer_alerte_si_necessaire(transaction, score, niveau, db)
    db.commit()
    created += 1
    print(f"  ✅ {ref} | {t['montant']:,} XAF | {t['heure']}h | score: {score} | {niveau}")

print(f"\n🎉 {created} transactions générées avec succès !")

# Stats finales
total = db.query(Transaction).filter(Transaction.banque_id == banque.id).count()
alertes = db.query(Alerte).filter(Alerte.banque_id == banque.id).count()
print(f"📊 Total transactions : {total}")
print(f"🚨 Total alertes      : {alertes}")

db.close()