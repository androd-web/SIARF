from pydantic import BaseModel, validator
from datetime import datetime
from decimal import Decimal
from typing import Optional
import uuid

class TransactionCreate(BaseModel):
    reference: str
    compte_emetteur: str
    nom_emetteur: Optional[str] = None
    compte_destinataire: str
    nom_destinataire: Optional[str] = None
    montant: Decimal
    devise: str = "XAF"
    type_operation: str
    date_transaction: datetime

    @validator("montant")
    def montant_positif(cls, v):
        if v <= 0:
            raise ValueError("Le montant doit être positif")
        return v

class TransactionResponse(BaseModel):
    id: uuid.UUID
    reference: str
    compte_emetteur: str
    compte_destinataire: str
    montant: Decimal
    devise: str
    type_operation: str
    date_transaction: datetime
    statut: str
    analysee: bool
    score_aml: Optional[float] = None
    niveau_risque: Optional[str] = None

    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    total: int
    transactions: list[TransactionResponse]