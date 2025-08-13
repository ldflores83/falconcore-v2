// functions/src/services/secretManager.ts

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export interface OAuthSecrets {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export const getOAuthSecrets = async (): Promise<OAuthSecrets> => {
  try {
    // Nombres de los secrets en Secret Manager
    const projectId = 'falconcore-v2';
    const clientIdSecretName = `projects/${projectId}/secrets/GOOGLE_CLIENT_ID/versions/latest`;
    const clientSecretSecretName = `projects/${projectId}/secrets/GOOGLE_CLIENT_SECRET/versions/latest`;
    const redirectUriSecretName = `projects/${projectId}/secrets/GOOGLE_REDIRECT_URI/versions/latest`;

    // Obtener los secrets
    const [clientIdResponse] = await client.accessSecretVersion({ name: clientIdSecretName });
    const [clientSecretResponse] = await client.accessSecretVersion({ name: clientSecretSecretName });
    const [redirectUriResponse] = await client.accessSecretVersion({ name: redirectUriSecretName });

    const secrets = {
      clientId: clientIdResponse.payload?.data?.toString().trim() || '',
      clientSecret: clientSecretResponse.payload?.data?.toString().trim() || '',
      redirectUri: redirectUriResponse.payload?.data?.toString().trim() || 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback'
    };

    return secrets;
  } catch (error) {
    // Fallback a variables de entorno para desarrollo
    const fallbackSecrets = {
      clientId: (process.env.GOOGLE_CLIENT_ID || 'TU_CLIENT_ID_REAL_AQUI').trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || 'TU_CLIENT_SECRET_REAL_AQUI').trim(),
      redirectUri: (process.env.GOOGLE_REDIRECT_URI || 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback').trim()
    };
    
    return fallbackSecrets;
  }
}; 