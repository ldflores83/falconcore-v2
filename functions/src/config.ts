// functions/src/config.ts

import { getOAuthSecrets } from './services/secretManager';

// Configuración de OAuth
export const getOAuthConfig = async () => {
  try {
    console.log('🔧 Attempting to get OAuth secrets from Secret Manager...');
    
    // Intentar obtener secrets desde Secret Manager
    const secrets = await getOAuthSecrets();
    
    console.log('🔧 Secrets retrieved from Secret Manager:', {
      hasClientId: !!secrets.clientId,
      clientIdLength: secrets.clientId?.length || 0,
      hasClientSecret: !!secrets.clientSecret,
      redirectUri: secrets.redirectUri
    });
    
    // Verificar que los secrets no estén vacíos
    if (!secrets.clientId || secrets.clientId === 'TU_CLIENT_ID_REAL_AQUI') {
      console.error('❌ Invalid client ID from Secret Manager:', secrets.clientId);
      throw new Error('OAuth secrets not properly configured');
    }
    
    console.log('✅ Using Secret Manager credentials');
    return secrets;
  } catch (error) {
    console.error('❌ Error getting OAuth config from Secret Manager:', error);
    console.log('🔧 Using hardcoded credentials as fallback...');
    
    // SOLUCIÓN TEMPORAL: Usar credenciales hardcodeadas
    const hardcodedConfig = {
      clientId: '1038906476883-6o30selbiuqetptejps1lnk04o1nl08d.apps.googleusercontent.com',
      clientSecret: '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',
      redirectUri: 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback'
    };
    
    console.log('🔧 Using hardcoded config:', {
      hasClientId: !!hardcodedConfig.clientId,
      clientId: hardcodedConfig.clientId,
      hasClientSecret: !!hardcodedConfig.clientSecret,
      redirectUri: hardcodedConfig.redirectUri
    });
    
    return hardcodedConfig;
  }
};

// Configuración de Firebase
export const getFirebaseConfig = () => {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || 'falconcore-v2'
  };
}; 