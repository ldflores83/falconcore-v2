# Pulzio Backend - Cloud Run Deployment

## Production URL
https://pulzio-api-fu54nvsqfa-uc.a.run.app

## Endpoints
- Root: https://pulzio-api-fu54nvsqfa-uc.a.run.app/
- Health: https://pulzio-api-fu54nvsqfa-uc.a.run.app/health
- Ready: https://pulzio-api-fu54nvsqfa-uc.a.run.app/ready
- API Docs (Swagger): https://pulzio-api-fu54nvsqfa-uc.a.run.app/docs
- ReDoc: https://pulzio-api-fu54nvsqfa-uc.a.run.app/redoc
- Integrations: https://pulzio-api-fu54nvsqfa-uc.a.run.app/api/integrations/
- Signals: https://pulzio-api-fu54nvsqfa-uc.a.run.app/api/signals/

## Deployment Info
- **Deployed:** 2025-10-29 19:15:37
- **Region:** us-central1
- **Platform:** Google Cloud Run
- **Project:** falconcore-v2
- **Service Name:** pulzio-api
- **Memory:** 512Mi
- **CPU:** 1
- **Min Instances:** 0
- **Max Instances:** 10
- **Timeout:** 300s
- **Port:** 8080

## Configuration
- Python: 3.13
- FastAPI: 0.115.0
- Uvicorn: 0.32.0
- SQLAlchemy: 2.0.36
- Pydantic: 2.10.3

## Access
- Authentication: Public (allow-unauthenticated)
- CORS: Enabled for all origins

## Next Steps
- [ ] Setup Cloud SQL PostgreSQL database
- [ ] Connect Cloud Run to Cloud SQL
- [ ] Add HubSpot integration
- [ ] Implement authentication
