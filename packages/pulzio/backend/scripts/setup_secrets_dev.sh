#!/bin/bash
# Setup development secrets in Google Secret Manager

PROJECT_ID="falconcore-v2"
ENV="dev"

echo "🔐 Setting up development secrets in Secret Manager..."
echo "Project: $PROJECT_ID"
echo "Environment: $ENV"
echo ""

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

# Database (local PostgreSQL)
create_secret "database-url" "postgresql://pulzio:pulzio_dev@localhost:5432/pulzio"

# HubSpot (dev credentials)
read -p "HubSpot Client ID (dev): " HUBSPOT_CLIENT_ID
read -sp "HubSpot Client Secret (dev): " HUBSPOT_CLIENT_SECRET
echo ""
create_secret "hubspot-client-id" "$HUBSPOT_CLIENT_ID"
create_secret "hubspot-client-secret" "$HUBSPOT_CLIENT_SECRET"

# Google (dev credentials)
read -p "Google Client ID (dev): " GOOGLE_CLIENT_ID
read -sp "Google Client Secret (dev): " GOOGLE_CLIENT_SECRET
echo ""
create_secret "google-client-id" "$GOOGLE_CLIENT_ID"
create_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET"

# Slack (dev credentials)
read -p "Slack Client ID (dev): " SLACK_CLIENT_ID
read -sp "Slack Client Secret (dev): " SLACK_CLIENT_SECRET
echo ""
create_secret "slack-client-id" "$SLACK_CLIENT_ID"
create_secret "slack-client-secret" "$SLACK_CLIENT_SECRET"

# Anthropic (dev API key)
read -sp "Anthropic API Key (dev): " ANTHROPIC_API_KEY
echo ""
create_secret "anthropic-api-key" "$ANTHROPIC_API_KEY"

# Firebase Service Account
read -p "Path to Firebase service account JSON: " FIREBASE_JSON_PATH
if [ -f "$FIREBASE_JSON_PATH" ]; then
    create_secret "firebase-service-account-json" "$(cat $FIREBASE_JSON_PATH)"
else
    echo "⚠️  File not found: $FIREBASE_JSON_PATH"
fi

echo "✅ Development secrets setup complete!"
echo ""
echo "📝 Grant access to your service account:"
echo "   gcloud secrets add-iam-policy-binding ${ENV}-database-url \\"
echo "     --member='serviceAccount:YOUR-SA@falconcore-v2.iam.gserviceaccount.com' \\"
echo "     --role='roles/secretmanager.secretAccessor' \\"
echo "     --project=$PROJECT_ID"

