from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.transaction import Transaction
from app.models.alerte import Alerte
from app.models.declaration import Declaration
from app.models.user import User
from app.routers.auth import oauth2_scheme
from app.services.auth_service import verify_token
from fastapi import HTTPException

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    banque_id = current_user.banque_id

    # Transactions
    total_transactions = db.query(Transaction).filter(
        Transaction.banque_id == banque_id
    ).count()

    transactions_normales = db.query(Transaction).filter(
        Transaction.banque_id == banque_id,
        Transaction.niveau_risque == "NORMAL"
    ).count()

    transactions_surveillance = db.query(Transaction).filter(
        Transaction.banque_id == banque_id,
        Transaction.niveau_risque == "SURVEILLANCE"
    ).count()

    transactions_critiques = db.query(Transaction).filter(
        Transaction.banque_id == banque_id,
        Transaction.niveau_risque == "CRITIQUE"
    ).count()

    # Alertes
    total_alertes = db.query(Alerte).filter(
        Alerte.banque_id == banque_id
    ).count()

    alertes_en_attente = db.query(Alerte).filter(
        Alerte.banque_id == banque_id,
        Alerte.statut == "en_attente"
    ).count()

    alertes_en_cours = db.query(Alerte).filter(
        Alerte.banque_id == banque_id,
        Alerte.statut == "en_cours"
    ).count()

    alertes_traitees = db.query(Alerte).filter(
        Alerte.banque_id == banque_id,
        Alerte.statut == "traite"
    ).count()

    # Déclarations
    total_declarations = db.query(Declaration).filter(
        Declaration.banque_id == banque_id
    ).count()

    declarations_brouillon = db.query(Declaration).filter(
        Declaration.banque_id == banque_id,
        Declaration.statut == "brouillon"
    ).count()

    declarations_transmises = db.query(Declaration).filter(
        Declaration.banque_id == banque_id,
        Declaration.statut == "transmise"
    ).count()

    # Score AML moyen
    from sqlalchemy import text
    result = db.execute(
        text("SELECT AVG(score_aml) FROM transactions WHERE banque_id = :bid AND score_aml IS NOT NULL"),
        {"bid": str(banque_id)}
    ).fetchone()
    score_moyen = round(float(result[0]), 2) if result[0] else 0

    # 5 dernières alertes critiques
    dernieres_alertes = db.query(Alerte).filter(
        Alerte.banque_id == banque_id,
        Alerte.niveau == "critique"
    ).order_by(Alerte.created_at.desc()).limit(5).all()

    return {
        "banque": current_user.banque.nom if current_user.banque else "N/A",
        "transactions": {
            "total": total_transactions,
            "normal": transactions_normales,
            "surveillance": transactions_surveillance,
            "critique": transactions_critiques,
        },
        "alertes": {
            "total": total_alertes,
            "en_attente": alertes_en_attente,
            "en_cours": alertes_en_cours,
            "traitees": alertes_traitees,
        },
        "declarations": {
            "total": total_declarations,
            "brouillon": declarations_brouillon,
            "transmises": declarations_transmises,
        },
        "score_aml_moyen": score_moyen,
        "dernieres_alertes_critiques": [
            {
                "id": str(a.id),
                "reference": a.reference,
                "score_risque": a.score_risque,
                "statut": a.statut,
                "created_at": a.created_at,
            }
            for a in dernieres_alertes
        ]
    }