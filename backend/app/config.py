from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Base de données
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://siarf_user:siarf_password_2026@localhost:5432/siarf_db")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "siarf_jwt_secret_key_2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Gemini API
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    
    # Seuils IA
    SEUIL_CRITIQUE: int = int(os.getenv("SEUIL_CRITIQUE", "70"))
    SEUIL_MOYEN: int = int(os.getenv("SEUIL_MOYEN", "40"))
    CONTAMINATION_RATE: float = 0.05
    
    # App
    APP_NAME: str = "SIARF"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"

settings = Settings()
