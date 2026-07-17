from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum

class NiveauEnum(str, enum.Enum):
    critique = "critique"
    moyen = "moyen"
    faible = "faible"

class StatutAlerteEnum(str, enum.Enum):
    en_attente = "en_attente"
    en_cours = "en_cours"
    traite = "traite"
    rejete = "rejete"

class Alerte(Base):
    __tablename__ = "alertes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(100), unique=True, nullable=False)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"))
    banque_id = Column(UUID(as_uuid=True), ForeignKey("banques.id"))
    agent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    score_risque = Column(Integer, nullable=False)
    niveau = Column(Enum(NiveauEnum), nullable=False)
    signaux = Column(JSONB, nullable=False)
    statut = Column(Enum(StatutAlerteEnum), default=StatutAlerteEnum.en_attente)
    commentaire_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    transaction = relationship("Transaction", back_populates="alerte")
    banque = relationship("Banque", back_populates="alertes")
    agent = relationship("User", back_populates="alertes")
    declaration = relationship("Declaration", back_populates="alerte", uselist=False)