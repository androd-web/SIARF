from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate, TransactionResponse, TransactionListResponse
)
from app.services.aml_service import (
    calculer_score_aml, determiner_niveau_risque, creer_alerte_si_necessaire
)
from app.routers.auth import oauth2_scheme
from app.services.auth_service import verify_token
import uuid

router = APIRouter(prefix="/transactions", tags=["Transactions"])

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user

@router.post("/", response_model=TransactionResponse)
def soumettre_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soumet une transaction et lance l'analyse AML automatique."""

    # Vérifier unicité référence
    existante = db.query(Transaction).filter(
        Transaction.reference == data.reference
    ).first()
    if existante:
        raise HTTPException(
            status_code=400,
            detail=f"Transaction avec référence '{data.reference}' déjà enregistrée"
        )

    # Créer et sauvegarder la transaction d'abord
    transaction = Transaction(
        id=uuid.uuid4(),
        reference=data.reference,
        banque_id=current_user.banque_id,
        compte_emetteur=data.compte_emetteur,
        nom_emetteur=data.nom_emetteur,
        compte_destinataire=data.compte_destinataire,
        nom_destinataire=data.nom_destinataire,
        montant=data.montant,
        devise=data.devise,
        type_operation=data.type_operation,
        date_transaction=data.date_transaction,
        statut="completee",
        analysee=False
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Calcul du score AML
    score = calculer_score_aml(transaction, db)
    niveau = determiner_niveau_risque(score)

    # Mettre à jour score via SQL direct (colonnes ajoutées manuellement)
    db.execute(
        text("UPDATE transactions SET score_aml = :score, niveau_risque = :niveau, analysee = true WHERE id = :id"),
        {"score": score, "niveau": niveau, "id": str(transaction.id)}
    )

    # Créer alerte si nécessaire
    creer_alerte_si_necessaire(transaction, score, niveau, db)

    db.commit()

    # Recharger la transaction avec les nouvelles valeurs
    transaction = db.query(Transaction).filter(Transaction.id == transaction.id).first()

    return transaction

@router.get("/", response_model=TransactionListResponse)
def lister_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    niveau_risque: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste les transactions de la banque de l'utilisateur connecté."""
    query = db.query(Transaction).filter(
        Transaction.banque_id == current_user.banque_id
    )
    if niveau_risque:
        query = query.filter(Transaction.niveau_risque == niveau_risque)

    total = query.count()
    transactions = query.order_by(
        Transaction.date_transaction.desc()
    ).offset(skip).limit(limit).all()

    return {"total": total, "transactions": transactions}

@router.get("/{transaction_id}", response_model=TransactionResponse)
def detail_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Détail d'une transaction spécifique."""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.banque_id == current_user.banque_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    return transaction