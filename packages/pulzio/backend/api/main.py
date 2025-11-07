from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import get_settings
from middleware.error_handler import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Import routes
from api.routes import health, auth, companies
from api.routes.integrations import hubspot, gmail, slack

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(hubspot.router, prefix="/api/integrations")
app.include_router(gmail.router, prefix="/api/integrations")
app.include_router(slack.router, prefix="/api/integrations")


@app.get("/")
async def root():
    return {
        "message": "Pulzio API",
        "version": settings.app_version,
        "environment": settings.environment,
    }
