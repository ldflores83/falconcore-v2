// functions/src/config.ts

import { getOAuthSecrets } from './services/secretManager';

// Configuración de OAuth
export const getOAuthConfig = async () => {
  try {
    const secrets = await getOAuthSecrets();
    
    // Verificar que los secrets no estén vacíos
    if (!secrets.clientId || secrets.clientId === 'TU_CLIENT_ID_REAL_AQUI') {
      throw new Error('OAuth secrets not properly configured');
    }
    
    return secrets;
  } catch (error) {
    // Fallback a credenciales hardcodeadas
    const hardcodedConfig = {
      clientId: '1038906476883-6o30selbiuqetptejps1lnk04o1nl08d.apps.googleusercontent.com',
      clientSecret: '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',
      redirectUri: 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback'
    };
    
    return hardcodedConfig;
  }
};

// Configuración de Firebase
export const getFirebaseConfig = () => {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || 'falconcore-v2'
  };
}; 