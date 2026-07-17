from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    agent = "agent"
    responsable = "responsable"
    admin = "admin"

class RegisterRequest(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.agent
    telephone: Optional[str] = None
    code_activation: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    banque: dict

class UserResponse(BaseModel):
    id: str
    nom: str
    prenom: str
    email: str
    role: str
    banque_id: Optional[str] = None

    class Config:
        from_attributes = True