from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Float 
from app.database import Base
from sqlalchemy import Float
import uuid
 

score_aml = Column(Float, nullable=True)
niveau_risque = Column(String(20), nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(100), unique=True, nullable=False)
    banque_id = Column(UUID(as_uuid=True), ForeignKey("banques.id"))
    compte_emetteur = Column(String(50), nullable=False)
    nom_emetteur = Column(String(200))
    compte_destinataire = Column(String(50), nullable=False)
    nom_destinataire = Column(String(200))
    montant = Column(Numeric(15, 2), nullable=False)
    devise = Column(String(10), default="XAF")
    type_operation = Column(String(50))
    date_transaction = Column(DateTime(timezone=True), nullable=False)
    statut = Column(String(50), default="completee")
    analysee = Column(Boolean, default=False)
    score_aml = Column(Float, nullable=True)
    niveau_risque = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    banque = relationship("Banque", back_populates="transactions")
    alerte = relationship("Alerte", back_populates="transaction", uselist=False)