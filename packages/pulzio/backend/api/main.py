from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import health, integrations, signals

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Revenue Intelligence Platform for B2B SaaS"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, tags=["health"])
app.include_router(
    integrations.router,
    prefix="/api/integrations",
    tags=["integrations"]
)
app.include_router(
    signals.router,
    prefix="/api/signals",
    tags=["signals"]
)

@app.get("/")
def read_root():
    return {
        "message": "Pulzio API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }
