from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.alerte import Alerte
import numpy as np
import uuid
from datetime import datetime

# Seuils de risque
SEUIL_CRITIQUE = 70
SEUIL_SURVEILLANCE = 30

def extraire_features(transaction: Transaction) -> list:
    """
    Extrait les 7 indicateurs comportementaux d'une transaction.
    """
    heure = transaction.date_transaction.hour
    # 1. Montant brut
    montant = float(transaction.montant)
    # 2. Transaction nocturne (23h-5h = suspect)
    est_nocturne = 1 if (heure >= 23 or heure <= 5) else 0
    # 3. Montant proche seuil de déclaration (juste en dessous de 5M XAF)
    proche_seuil = 1 if 4_500_000 <= montant <= 5_000_000 else 0
    # 4. Heure de transaction (0-23)
    heure_norm = heure / 23
    # 5. Jour de semaine (0=lundi, 6=dimanche)
    jour = transaction.date_transaction.weekday()
    est_weekend = 1 if jour >= 5 else 0
    # 6. Montant > 10M XAF
    gros_montant = 1 if montant > 10_000_000 else 0
    # 7. Montant normalisé (log)
    montant_log = np.log1p(montant)

    return [montant, est_nocturne, proche_seuil,
            heure_norm, est_weekend, gros_montant, montant_log]

def calculer_score_aml(transaction: Transaction, db: Session) -> float:
    """
    Calcule le Score de Risque AML (0-100) avec Isolation Forest.
    Entraîne le modèle sur l'historique de la banque.
    Retourne 0-100 (100 = très suspect).
    """
    # Récupérer l'historique des transactions de la même banque
    historique = db.query(Transaction).filter(
        Transaction.banque_id == transaction.banque_id,
        Transaction.id != transaction.id
    ).limit(1000).all()

    features_cible = extraire_features(transaction)

    # Si pas assez d'historique, on utilise des règles simples
    if len(historique) < 10:
        return _score_regles_simples(transaction)

    # Construire la matrice d'entraînement
    X = np.array([extraire_features(t) for t in historique])
    X_cible = np.array([features_cible])

    # Entraîner Isolation Forest
    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,  # 5% de transactions suspectes attendues
        random_state=42
    )
    model.fit(X)

    # Score brut : entre -1 (anomalie) et +1 (normal)
    score_brut = model.score_samples(X_cible)[0]

    # Convertir en score 0-100 (plus c'est haut, plus c'est suspect)
    # score_brut varie typiquement entre -0.5 et 0.1
    score_normalise = _normaliser_score(score_brut)

    # Bonus de risque sur règles métier
    bonus = _bonus_risque(transaction)

    score_final = min(100, score_normalise + bonus)
    return round(score_final, 2)

def _normaliser_score(score_brut: float) -> float:
    """Convertit le score Isolation Forest en 0-100."""
    # Les valeurs typiques sont entre -0.6 et 0.1
    MIN_BRUT = -0.6
    MAX_BRUT = 0.1
    score_clip = max(MIN_BRUT, min(MAX_BRUT, score_brut))
    # Inverser : score brut bas = anomalie = score AML haut
    score = (MAX_BRUT - score_clip) / (MAX_BRUT - MIN_BRUT) * 100
    return round(score, 2)

def _score_regles_simples(transaction: Transaction) -> float:
    """Score basé sur règles métier quand l'historique est insuffisant."""
    score = 0
    montant = float(transaction.montant)
    heure = transaction.date_transaction.hour

    if montant > 10_000_000:
        score += 40
    elif montant > 5_000_000:
        score += 25

    if heure >= 23 or heure <= 5:
        score += 20

    if 4_500_000 <= montant <= 5_000_000:
        score += 25  # Fractionnement potentiel

    return min(100, float(score))

def _bonus_risque(transaction: Transaction) -> float:
    """Bonus de risque basé sur règles métier CEMAC."""
    bonus = 0
    montant = float(transaction.montant)
    heure = transaction.date_transaction.hour

    # Transaction nocturne suspecte
    if heure >= 23 or heure <= 5:
        bonus += 10

    # Montant proche du seuil de déclaration (fractionnement)
    if 4_500_000 <= montant <= 5_000_000:
        bonus += 15

    # Très gros montant
    if montant > 50_000_000:
        bonus += 20

    return bonus

def determiner_niveau_risque(score: float) -> str:
    if score >= SEUIL_CRITIQUE:
        return "CRITIQUE"
    elif score >= SEUIL_SURVEILLANCE:
        return "SURVEILLANCE"
    else:
        return "NORMAL"

def creer_alerte_si_necessaire(
    transaction: Transaction,
    score: float,
    niveau: str,
    db: Session
) -> Alerte | None:
    """Crée une alerte automatique si le score dépasse le seuil."""
    if score < SEUIL_SURVEILLANCE:
        return None

    # Mapper niveau vers l'enum du modèle
    niveau_map = {
        "CRITIQUE": "critique",
        "SURVEILLANCE": "moyen",
        "NORMAL": "faible"
    }

    import random, string
    ref = "ALR-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

    alerte = Alerte(
        id=uuid.uuid4(),
        reference=ref,
        transaction_id=transaction.id,
        banque_id=transaction.banque_id,
        score_risque=int(score),
        niveau=niveau_map.get(niveau, "moyen"),
        signaux={
            "montant": float(transaction.montant),
            "heure": transaction.date_transaction.hour,
            "score_aml": score,
            "niveau_risque": niveau,
            "description": _generer_description(transaction, score, niveau)
        },
        statut="en_attente"
    )
    db.add(alerte)
    return alerte

def _generer_description(transaction, score: float, niveau: str) -> str:
    """Génère une description automatique de l'alerte."""
    return (
        f"Transaction {transaction.reference} détectée comme suspecte. "
        f"Montant : {transaction.montant} {transaction.devise}. "
        f"Score AML : {score}/100. "
        f"Niveau de risque : {niveau}. "
        f"Émetteur : {transaction.compte_emetteur} → "
        f"Destinataire : {transaction.compte_destinataire}. "
        f"Heure : {transaction.date_transaction.strftime('%H:%M')}."
    )