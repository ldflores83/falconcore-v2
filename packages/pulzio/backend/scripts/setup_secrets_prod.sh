#!/bin/bash
# Setup production secrets in Google Secret Manager

PROJECT_ID="falconcore-v2"
ENV="prod"

echo "🔐 Setting up PRODUCTION secrets in Secret Manager..."
echo "Project: $PROJECT_ID"
echo "Environment: $ENV"
echo ""
echo "⚠️  WARNING: You are setting up PRODUCTION secrets!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Function to create secret
create_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    echo "Creating secret: ${ENV}-${secret_name}"
    
    # Check if secret exists
    if gcloud secrets describe "${ENV}-${secret_name}" --project=$PROJECT_ID &>/dev/null; then
        echo "  ✅ Secret already exists, updating..."
        echo -n "$secret_value" | gcloud secrets versions add "${ENV}-${secret_name}" \
            --data-file=- \
            --project=$PROJECT_ID
    else
        echo "  ➕ Creating new secret..."
        echo -n "$secret_value" | gcloud secrets create "${ENV}-${secret_name}" \
            --data-file=- \
            --replication-policy="automatic" \
            --project=$PROJECT_ID
    fi
    echo ""
}

# Database (production PostgreSQL)
read -sp "Production Database URL: " PROD_DB_URL
echo ""
create_secret "database-url" "$PROD_DB_URL"

# HubSpot (prod credentials)
read -p "HubSpot Client ID (prod): " HUBSPOT_CLIENT_ID
read -sp "HubSpot Client Secret (prod): " HUBSPOT_CLIENT_SECRET
echo ""
create_secret "hubspot-client-id" "$HUBSPOT_CLIENT_ID"
create_secret "hubspot-client-secret" "$HUBSPOT_CLIENT_SECRET"

# Google (prod credentials)
read -p "Google Client ID (prod): " GOOGLE_CLIENT_ID
read -sp "Google Client Secret (prod): " GOOGLE_CLIENT_SECRET
echo ""
create_secret "google-client-id" "$GOOGLE_CLIENT_ID"
create_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET"

# Slack (prod credentials)
read -p "Slack Client ID (prod): " SLACK_CLIENT_ID
read -sp "Slack Client Secret (prod): " SLACK_CLIENT_SECRET
echo ""
create_secret "slack-client-id" "$SLACK_CLIENT_ID"
create_secret "slack-client-secret" "$SLACK_CLIENT_SECRET"

# Anthropic (prod API key)
read -sp "Anthropic API Key (prod): " ANTHROPIC_API_KEY
echo ""
create_secret "anthropic-api-key" "$ANTHROPIC_API_KEY"

# Firebase Service Account
read -p "Path to Firebase service account JSON (prod): " FIREBASE_JSON_PATH
if [ -f "$FIREBASE_JSON_PATH" ]; then
    create_secret "firebase-service-account-json" "$(cat $FIREBASE_JSON_PATH)"
else
    echo "⚠️  File not found: $FIREBASE_JSON_PATH"
fi

echo "✅ Production secrets setup complete!"
echo ""
echo "📝 Grant access to your service account:"
echo "   gcloud secrets add-iam-policy-binding ${ENV}-database-url \\"
echo "     --member='serviceAccount:YOUR-SA@falconcore-v2.iam.gserviceaccount.com' \\"
echo "     --role='roles/secretmanager.secretAccessor' \\"
echo "     --project=$PROJECT_ID"

