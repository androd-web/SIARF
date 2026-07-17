from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Banque(Base):
    __tablename__ = "banques"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String(200), nullable=False)
    code_activation = Column(String(50), unique=True, nullable=False)
    adresse = Column(String(500))
    telephone = Column(String(20))
    email = Column(String(255))
    identifiant_unique = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="banque")
    transactions = relationship("Transaction", back_populates="banque")
    alertes = relationship("Alerte", back_populates="banque")
    declarations = relationship("Declaration", back_populates="banque")