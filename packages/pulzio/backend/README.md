# Pulzio Backend API

FastAPI backend for Pulzio Customer Success platform.

## 🔒 Secrets Management

**ALL secrets are stored in Google Secret Manager** - no .env files.

### Secret Naming Convention

Secrets are prefixed by environment:

- `dev-*` for development
- `prod-*` for production

Example:

- `dev-database-url`
- `prod-database-url`
- `dev-hubspot-client-id`
- `prod-hubspot-client-id`

### Initial Setup

#### 1. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project falconcore-v2
```

#### 2. Setup Development Secrets

```bash
cd scripts
chmod +x setup_secrets_dev.sh
./setup_secrets_dev.sh
```

This will prompt you for all necessary credentials and create them in Secret Manager.

#### 3. Grant IAM Access

If using a service account:

```bash
# Get your service account email
SA_EMAIL="YOUR-SA@falconcore-v2.iam.gserviceaccount.com"

# Grant access to all dev secrets
for secret in database-url hubspot-client-id hubspot-client-secret google-client-id google-client-secret slack-client-id slack-client-secret anthropic-api-key firebase-service-account-json; do
  gcloud secrets add-iam-policy-binding "dev-$secret" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --project=falconcore-v2
done
```

For local development with your user account, IAM is automatic.

#### 4. Start Local Database

```bash
docker-compose up -d
```

#### 5. Run Migrations

```bash
alembic upgrade head
```

#### 6. Start API

```bash
# Set environment
export ENVIRONMENT=development
export GCP_PROJECT_ID=falconcore-v2

# Start server
uvicorn api.main:app --reload
```

## 🚀 Development

### Environment Variables

Only 2 environment variables needed:

```bash
export ENVIRONMENT=development  # or production
export GCP_PROJECT_ID=falconcore-v2
```

Everything else comes from Secret Manager.

### Adding New Secrets

```bash
# Development
echo -n "secret-value" | gcloud secrets create dev-my-new-secret \
  --data-file=- \
  --replication-policy="automatic" \
  --project=falconcore-v2

# Production
echo -n "secret-value" | gcloud secrets create prod-my-new-secret \
  --data-file=- \
  --replication-policy="automatic" \
  --project=falconcore-v2
```

### Updating Secrets

```bash
# Add new version
echo -n "new-value" | gcloud secrets versions add dev-my-secret \
  --data-file=- \
  --project=falconcore-v2
```

### Viewing Secrets (for debugging)

```bash
# List all secrets
gcloud secrets list --project=falconcore-v2

# View secret value
gcloud secrets versions access latest --secret="dev-database-url" --project=falconcore-v2
```

## 📝 Common Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Start API
export ENVIRONMENT=development
uvicorn api.main:app --reload

# Run tests
pytest

# Format code
black .
ruff check .
```

## 🏗️ Architecture Benefits

### Why No .env Files?

✅ **Single source of truth** - All secrets in Secret Manager
✅ **No accidents** - Impossible to commit secrets
✅ **Audit trail** - Every secret access is logged
✅ **IAM control** - Fine-grained access control
✅ **Rotation** - Easy secret rotation without code changes
✅ **Team onboarding** - Just grant IAM access, no file sharing

### Secret Manager Free Tier

- 10,000 access operations/month FREE
- Sufficient for development and MVP

## 🔐 Security Best Practices

1. ✅ Never hardcode secrets in code
2. ✅ Use separate dev/prod secrets
3. ✅ Rotate secrets regularly
4. ✅ Audit secret access logs
5. ✅ Use least-privilege IAM roles
6. ✅ Never share secrets via Slack/email
