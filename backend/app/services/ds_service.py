from sqlalchemy.orm import Session
from app.models.declaration import Declaration
from app.models.alerte import Alerte
from app.models.user import User
from app.config import settings
import uuid
import random
import string
from datetime import datetime

def generer_reference_ds() -> str:
    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"DS-SIARF-{datetime.now().year}-{code}"

def generer_ds_depuis_alerte(
    alerte: Alerte,
    agent: User,
    db: Session
) -> Declaration:
    """
    Génère automatiquement une Déclaration de Soupçon
    à partir d'une alerte et de la transaction associée.
    """
    transaction = alerte.transaction
    banque = alerte.banque

    # Déterminer les typologies détectées
    typologies = []
    montant = float(transaction.montant)
    heure = transaction.date_transaction.hour

    if montant > 10_000_000:
        typologies.append("Virement de montant anormalement élevé")
    if 4_500_000 <= montant <= 5_000_000:
        typologies.append("Possible fractionnement pour éviter le seuil de déclaration")
    if heure >= 23 or heure <= 5:
        typologies.append("Transaction effectuée à une heure inhabituelle (nuit)")
    if alerte.score_risque >= 70:
        typologies.append("Score de risque AML critique détecté par le système")

    if not typologies:
        typologies.append("Comportement transactionnel anormal détecté par analyse IA")

    # Description motivée de l'opération
    description = (
        f"Le système SIARF a détecté une transaction suspecte référencée {transaction.reference}, "
        f"d'un montant de {transaction.montant} {transaction.devise}, "
        f"effectuée le {transaction.date_transaction.strftime('%d/%m/%Y à %H:%M')}, "
        f"du compte {transaction.compte_emetteur} "
        f"({transaction.nom_emetteur or 'identité non renseignée'}) "
        f"vers le compte {transaction.compte_destinataire} "
        f"({transaction.nom_destinataire or 'identité non renseignée'}). "
        f"Le score de risque AML calculé est de {alerte.score_risque}/100, "
        f"classant cette opération au niveau {alerte.niveau.upper()}. "
        f"L'opération présente les caractéristiques suivantes : "
        f"{'; '.join(typologies)}."
    )

    declaration = Declaration(
        id=uuid.uuid4(),
        reference=generer_reference_ds(),
        alerte_id=alerte.id,
        banque_id=banque.id if banque else None,
        agent_id=agent.id,

        # Section 1 - Déclarant (infos banque)
        declarant_nom=banque.nom if banque else "N/A",
        declarant_adresse=banque.adresse if banque else "N/A",
        declarant_tel=banque.telephone if banque else "N/A",
        declarant_id_unique=banque.identifiant_unique if banque else "N/A",

        # Section 2 - Correspondant ANIF
        correspondant_nom=f"{agent.prenom} {agent.nom}",
        correspondant_fonction=agent.role,
        correspondant_email=agent.email,
        correspondant_tel=agent.telephone or "N/A",

        # Section 3 - Client
        client_type="physique",
        client_nom=transaction.nom_destinataire or "INCONNU",
        client_compte=transaction.compte_destinataire,

        # Sections 4-8
        nature_operation=transaction.type_operation,
        montant_operation=f"{transaction.montant} {transaction.devise}",
        description_operation=description,
        typologies=typologies,
        description_blanchiment=description,

        # Statut
        statut="brouillon",
        genere_par_ia=True,
    )

    db.add(declaration)

    # Mettre à jour le statut de l'alerte
    alerte.statut = "en_cours"
    alerte.agent_id = agent.id

    db.commit()
    db.refresh(declaration)
    return declaration