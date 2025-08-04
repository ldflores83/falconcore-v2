// functions/src/oauth/getOAuthCredentials.ts

import { google } from 'googleapis';
import * as admin from 'firebase-admin';
import { getOAuthConfig } from '../config';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    // Inicializar Firebase sin credenciales de servicio automáticas
    // para evitar conflictos con OAuth
    admin.initializeApp({
      projectId: 'falconcore-v2',
      // No especificar credential para usar la autenticación por defecto
      // que funciona mejor con OAuth
    });
  }
  return admin.firestore();
};

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  scope?: string;
  tokenType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getOAuthCredentials = async (userId: string = 'onboardingaudit_user'): Promise<OAuthCredentials | null> => {
  try {
    const db = getFirestore();
    const doc = await db.collection('oauth_credentials').doc(userId).get();
    
    if (!doc.exists) {
      console.log('❌ No se encontraron credenciales OAuth para:', userId);
      return null;
    }

    const data = doc.data();
    if (!data?.accessToken) {
      console.log('❌ Credenciales OAuth incompletas para:', userId);
      return null;
    }

    console.log('✅ Credenciales OAuth obtenidas para:', userId);
    return data as OAuthCredentials;

  } catch (error) {
    console.error('❌ Error obteniendo credenciales OAuth:', error);
    return null;
  }
};

export const getValidAccessToken = async (userId: string = 'onboardingaudit_user'): Promise<string | null> => {
  try {
    const credentials = await getOAuthCredentials(userId);
    
    if (!credentials) {
      return null;
    }

    // Verificar si el token ha expirado
    if (credentials.expiryDate && Date.now() > credentials.expiryDate) {
      console.log('⚠️ Token expirado, intentando refresh...');
      
      // Intentar refresh del token
      const oauthConfig = await getOAuthConfig();
      const oauth2Client = new google.auth.OAuth2(
        oauthConfig.clientId,
        oauthConfig.clientSecret,
        oauthConfig.redirectUri
      );

      oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        expiry_date: credentials.expiryDate
      });

      try {
        const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
        
        if (newCredentials.access_token) {
          // Actualizar tokens en Firestore
          const db = getFirestore();
          await db.collection('oauth_credentials').doc(userId).update({
            accessToken: newCredentials.access_token,
            expiryDate: newCredentials.expiry_date,
            updatedAt: new Date()
          });

          console.log('✅ Token refrescado exitosamente');
          return newCredentials.access_token;
        }
      } catch (refreshError) {
        console.error('❌ Error refrescando token:', refreshError);
        return null;
      }
    }

    return credentials.accessToken;

  } catch (error) {
    console.error('❌ Error obteniendo access token válido:', error);
    return null;
  }
}; 