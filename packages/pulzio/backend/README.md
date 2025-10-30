# Pulzio Backend

Python + FastAPI backend for Pulzio Revenue Intelligence Platform.

## Development
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Setup environment
Copy-Item .env.example .env
# Edit .env with your credentials

# Run development server
uvicorn api.main:app --reload --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deploy
```bash
gcloud run deploy pulzio-api \
  --source=. \
  --region=us-central1 \
  --allow-unauthenticated
```
