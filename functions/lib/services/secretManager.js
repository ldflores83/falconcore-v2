"use strict";
// functions/src/services/secretManager.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOAuthSecrets = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
const client = new secret_manager_1.SecretManagerServiceClient();
const getOAuthSecrets = async () => {
    try {
        console.log('🔧 SecretManager: Starting to access secrets...');
        // Nombres de los secrets en Secret Manager
        const projectId = 'falconcore-v2';
        const clientIdSecretName = `projects/${projectId}/secrets/GOOGLE_CLIENT_ID/versions/latest`;
        const clientSecretSecretName = `projects/${projectId}/secrets/GOOGLE_CLIENT_SECRET/versions/latest`;
        const redirectUriSecretName = `projects/${projectId}/secrets/GOOGLE_REDIRECT_URI/versions/latest`;
        console.log('🔧 SecretManager: Secret names:', {
            clientId: clientIdSecretName,
            clientSecret: clientSecretSecretName,
            redirectUri: redirectUriSecretName
        });
        // Obtener los secrets
        console.log('🔧 SecretManager: Accessing GOOGLE_CLIENT_ID...');
        const [clientIdResponse] = await client.accessSecretVersion({ name: clientIdSecretName });
        console.log('🔧 SecretManager: GOOGLE_CLIENT_ID accessed successfully');
        console.log('🔧 SecretManager: Accessing GOOGLE_CLIENT_SECRET...');
        const [clientSecretResponse] = await client.accessSecretVersion({ name: clientSecretSecretName });
        console.log('🔧 SecretManager: GOOGLE_CLIENT_SECRET accessed successfully');
        console.log('🔧 SecretManager: Accessing GOOGLE_REDIRECT_URI...');
        const [redirectUriResponse] = await client.accessSecretVersion({ name: redirectUriSecretName });
        console.log('🔧 SecretManager: GOOGLE_REDIRECT_URI accessed successfully');
        const secrets = {
            clientId: clientIdResponse.payload?.data?.toString().trim() || '',
            clientSecret: clientSecretResponse.payload?.data?.toString().trim() || '',
            redirectUri: redirectUriResponse.payload?.data?.toString().trim() || 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback'
        };
        console.log('🔧 SecretManager: All secrets retrieved successfully:', {
            hasClientId: !!secrets.clientId,
            clientIdLength: secrets.clientId?.length || 0,
            hasClientSecret: !!secrets.clientSecret,
            redirectUri: secrets.redirectUri
        });
        return secrets;
    }
    catch (error) {
        console.error('❌ SecretManager: Error accessing Secret Manager:', error);
        console.error('❌ SecretManager: Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            status: error.status
        });
        // Fallback a variables de entorno para desarrollo
        const fallbackSecrets = {
            clientId: (process.env.GOOGLE_CLIENT_ID || 'TU_CLIENT_ID_REAL_AQUI').trim(),
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || 'TU_CLIENT_SECRET_REAL_AQUI').trim(),
            redirectUri: (process.env.GOOGLE_REDIRECT_URI || 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback').trim()
        };
        console.log('🔧 SecretManager: Using fallback secrets:', {
            hasClientId: !!fallbackSecrets.clientId,
            clientId: fallbackSecrets.clientId,
            hasClientSecret: !!fallbackSecrets.clientSecret,
            redirectUri: fallbackSecrets.redirectUri
        });
        return fallbackSecrets;
    }
};
exports.getOAuthSecrets = getOAuthSecrets;
