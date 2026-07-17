from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.alerte import Alerte
from app.models.user import User
from app.routers.auth import oauth2_scheme
from app.services.auth_service import verify_token
import uuid

router = APIRouter(prefix="/alertes", tags=["Alertes"])

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user

@router.get("/")
def lister_alertes(
    statut: str = Query(None),
    niveau: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste les alertes de la banque de l'utilisateur connecté."""
    query = db.query(Alerte).filter(
        Alerte.banque_id == current_user.banque_id
    )
    if statut:
        query = query.filter(Alerte.statut == statut)
    if niveau:
        query = query.filter(Alerte.niveau == niveau)

    total = query.count()
    alertes = query.order_by(Alerte.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "alertes": [
            {
                "id": str(a.id),
                "reference": a.reference,
                "transaction_id": str(a.transaction_id),
                "score_risque": a.score_risque,
                "niveau": a.niveau,
                "statut": a.statut,
                "signaux": a.signaux,
                "created_at": a.created_at,
            }
            for a in alertes
        ]
    }

@router.get("/{alerte_id}")
def detail_alerte(
    alerte_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Détail d'une alerte avec sa transaction associée."""
    alerte = db.query(Alerte).filter(
        Alerte.id == alerte_id,
        Alerte.banque_id == current_user.banque_id
    ).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")

    transaction = alerte.transaction
    return {
        "id": str(alerte.id),
        "reference": alerte.reference,
        "score_risque": alerte.score_risque,
        "niveau": alerte.niveau,
        "statut": alerte.statut,
        "signaux": alerte.signaux,
        "created_at": alerte.created_at,
        "transaction": {
            "id": str(transaction.id),
            "reference": transaction.reference,
            "montant": float(transaction.montant),
            "devise": transaction.devise,
            "compte_emetteur": transaction.compte_emetteur,
            "nom_emetteur": transaction.nom_emetteur,
            "compte_destinataire": transaction.compte_destinataire,
            "nom_destinataire": transaction.nom_destinataire,
            "type_operation": transaction.type_operation,
            "date_transaction": transaction.date_transaction,
        } if transaction else None
    }

@router.put("/{alerte_id}/statut")
def mettre_a_jour_statut(
    alerte_id: uuid.UUID,
    statut: str,
    commentaire: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Met à jour le statut d'une alerte."""
    alerte = db.query(Alerte).filter(
        Alerte.id == alerte_id,
        Alerte.banque_id == current_user.banque_id
    ).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")

    statuts_valides = ["en_attente", "en_cours", "traite", "rejete"]
    if statut not in statuts_valides:
        raise HTTPException(
            status_code=400,
            detail=f"Statut invalide. Valeurs acceptées : {statuts_valides}"
        )

    alerte.statut = statut
    alerte.agent_id = current_user.id
    if commentaire:
        alerte.commentaire_agent = commentaire
    db.commit()

    return {"message": "Statut mis à jour", "statut": statut}