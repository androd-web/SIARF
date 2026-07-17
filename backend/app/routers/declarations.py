from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.declaration import Declaration
from app.models.alerte import Alerte
from app.models.user import User
from app.services.ds_service import generer_ds_depuis_alerte
from app.routers.auth import oauth2_scheme
from app.services.auth_service import verify_token
from datetime import datetime
import uuid

router = APIRouter(prefix="/declarations", tags=["Déclarations de Soupçon"])

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user

@router.post("/generer/{alerte_id}")
def generer_declaration(
    alerte_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Génère automatiquement une DS depuis une alerte."""
    alerte = db.query(Alerte).filter(
        Alerte.id == alerte_id,
        Alerte.banque_id == current_user.banque_id
    ).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")

    # Vérifier qu'une DS n'existe pas déjà
    existante = db.query(Declaration).filter(
        Declaration.alerte_id == alerte_id
    ).first()
    if existante:
        raise HTTPException(
            status_code=400,
            detail=f"Une DS existe déjà pour cette alerte : {existante.reference}"
        )

    declaration = generer_ds_depuis_alerte(alerte, current_user, db)

    return {
        "message": "Déclaration de Soupçon générée automatiquement par SIARF",
        "reference": declaration.reference,
        "id": str(declaration.id),
        "statut": declaration.statut,
        "genere_par_ia": declaration.genere_par_ia,
        "declarant": declaration.declarant_nom,
        "client_nom": declaration.client_nom,
        "montant_operation": declaration.montant_operation,
        "typologies": declaration.typologies,
        "description": declaration.description_operation,
    }

@router.get("/")
def lister_declarations(
    statut: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste les déclarations de la banque."""
    query = db.query(Declaration).filter(
        Declaration.banque_id == current_user.banque_id
    )
    if statut:
        query = query.filter(Declaration.statut == statut)

    total = query.count()
    declarations = query.order_by(Declaration.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "declarations": [
            {
                "id": str(d.id),
                "reference": d.reference,
                "statut": d.statut,
                "client_nom": d.client_nom,
                "montant_operation": d.montant_operation,
                "genere_par_ia": d.genere_par_ia,
                "created_at": d.created_at,
            }
            for d in declarations
        ]
    }

@router.put("/{declaration_id}/valider")
def valider_declaration(
    declaration_id: uuid.UUID,
    commentaire: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validation humaine obligatoire avant transmission à l'ANIF."""
    declaration = db.query(Declaration).filter(
        Declaration.id == declaration_id,
        Declaration.banque_id == current_user.banque_id
    ).first()
    if not declaration:
        raise HTTPException(status_code=404, detail="Déclaration introuvable")

    if declaration.statut not in ["brouillon", "en_attente"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cette DS ne peut pas être validée (statut actuel : {declaration.statut})"
        )

    declaration.statut = "en_attente"
    declaration.agent_id = current_user.id
    declaration.signataire_nom = f"{current_user.prenom} {current_user.nom}"
    declaration.signataire_qualite = current_user.role
    declaration.date_signature = datetime.utcnow()
    if commentaire:
        declaration.commentaires_agent = commentaire

    db.commit()

    return {
        "message": "DS validée — prête pour transmission à l'ANIF",
        "reference": declaration.reference,
        "statut": declaration.statut,
        "validee_par": declaration.signataire_nom,
        "date_validation": declaration.date_signature,
    }

@router.put("/{declaration_id}/transmettre")
def transmettre_declaration(
    declaration_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marque la DS comme transmise à l'ANIF."""
    declaration = db.query(Declaration).filter(
        Declaration.id == declaration_id,
        Declaration.banque_id == current_user.banque_id
    ).first()
    if not declaration:
        raise HTTPException(status_code=404, detail="Déclaration introuvable")

    if declaration.statut != "en_attente":
        raise HTTPException(
            status_code=400,
            detail="La DS doit être validée avant transmission"
        )

    import random, string
    ref_anif = "ANIF-" + "".join(random.choices(string.digits, k=10))

    declaration.statut = "transmise"
    declaration.date_transmission = datetime.utcnow()
    declaration.reference_anif = ref_anif

    # Fermer l'alerte associée
    if declaration.alerte:
        declaration.alerte.statut = "traite"

    db.commit()

    return {
        "message": "DS transmise à l'ANIF avec succès",
        "reference": declaration.reference,
        "reference_anif": ref_anif,
        "date_transmission": declaration.date_transmission,
        "statut": "transmise",
    }