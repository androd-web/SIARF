from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services.auth_service import (
    hash_password, authenticate_user, create_access_token,
    get_user_by_email, get_banque_by_code, verify_token
)
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentification"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Vérifier code activation
    banque = get_banque_by_code(db, request.code_activation)
    if not banque:
        raise HTTPException(
            status_code=400,
            detail="Code d'activation invalide ou expiré"
        )
    # Vérifier email unique
    existing = get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Un compte existe déjà avec cet email"
        )
    # Créer l'utilisateur
    user = User(
        nom=request.nom,
        prenom=request.prenom,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role,
        telephone=request.telephone,
        banque_id=banque.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role
        },
        "banque": {
            "id": str(banque.id),
            "nom": banque.nom
        }
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email ou mot de passe incorrect"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Compte désactivé"
        )
    # Mettre à jour last_login
    user.last_login = datetime.utcnow()
    db.commit()

    banque = user.banque
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role
        },
        "banque": {
            "id": str(banque.id) if banque else None,
            "nom": banque.nom if banque else None
        }
    }

@router.get("/me")
def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {
        "id": str(user.id),
        "nom": user.nom,
        "prenom": user.prenom,
        "email": user.email,
        "role": user.role,
        "banque": {
            "id": str(user.banque.id) if user.banque else None,
            "nom": user.banque.nom if user.banque else None
        }
    }