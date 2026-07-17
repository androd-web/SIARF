from sqlalchemy import Column, String, DateTime, Text, Boolean, Date, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum

class StatutDSEnum(str, enum.Enum):
    brouillon = "brouillon"
    en_attente = "en_attente"
    transmise = "transmise"
    rejetee = "rejetee"
    archivee = "archivee"

class ClientTypeEnum(str, enum.Enum):
    physique = "physique"
    morale = "morale"

class Declaration(Base):
    __tablename__ = "declarations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(100), unique=True, nullable=False)
    alerte_id = Column(UUID(as_uuid=True), ForeignKey("alertes.id"))
    banque_id = Column(UUID(as_uuid=True), ForeignKey("banques.id"))
    agent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Section 1 - Déclarant
    declarant_nom = Column(String(200))
    declarant_adresse = Column(Text)
    declarant_tel = Column(String(20))
    declarant_id_unique = Column(String(50))

    # Section 2 - Correspondant ANIF
    correspondant_nom = Column(String(200))
    correspondant_fonction = Column(String(100))
    correspondant_email = Column(String(255))
    correspondant_tel = Column(String(20))

    # Section 3 - Client
    client_type = Column(Enum(ClientTypeEnum), default=ClientTypeEnum.physique)
    client_nom = Column(String(200))
    client_prenom = Column(String(200))
    client_ddn = Column(Date)
    client_nationalite = Column(String(100))
    client_cni = Column(String(50))
    client_compte = Column(String(50))

    # Sections 4-8
    autres_personnes = Column(JSONB)
    nature_operation = Column(String(100))
    montant_operation = Column(String(50))
    description_operation = Column(Text)
    typologies = Column(JSONB)
    description_blanchiment = Column(Text)
    commentaires_agent = Column(Text)
    annexes = Column(JSONB)

    # Signature
    signataire_nom = Column(String(200))
    signataire_qualite = Column(String(100))
    date_signature = Column(DateTime(timezone=True))
    statut = Column(Enum(StatutDSEnum), default=StatutDSEnum.brouillon)
    reference_anif = Column(String(100))
    date_transmission = Column(DateTime(timezone=True))
    genere_par_ia = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    alerte = relationship("Alerte", back_populates="declaration")
    banque = relationship("Banque", back_populates="declarations")
    agent = relationship("User", back_populates="declarations")