from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app import models
from app.routers import auth
from app.routers import transactions
from app.routers import alertes, declarations
from app.routers import dashboard

# 1. Créer l'app EN PREMIER
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Système Intelligent d'Analyse des Risques Financiers"
)

# 2. Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Créer les tables
Base.metadata.create_all(bind=engine)

# 4. Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")

# 5. Routes de base
@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "opérationnel",
        "message": "L'analyse intelligente au service de la confiance financière"
    }
# 6. Routes pour les alertes et déclarations

app.include_router(alertes.router, prefix="/api/v1")
app.include_router(declarations.router, prefix="/api/v1")

# 7. Routes pour le dashboard
app.include_router(dashboard.router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}