import { google, oauth2_v2 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getOAuthSecrets } from '../services/secretManager';

/**
 * Configuración OAuth por proyecto (MVP / Módulo).
 * 
 * Cada `project_id` se utiliza para:
 * - Aislar carpetas creadas en Drive (`Root - {email}/{project_id}`)
 * - Guardar tokens por módulo en Firestore
 * - Escalar a múltiples productos desde la misma base (Falcon Core)
 * 
 * En MVPs iniciales se reutiliza la misma app OAuth (misma client_id),
 * pero puede migrarse luego a apps separadas si se desea aislamiento total.
 */

// 🔐 Configuración modular por producto
export const getOAuthConfig = async (projectId?: string) => {
  try {
    // Intentar obtener desde Secret Manager
    const secrets = await getOAuthSecrets();
    return {
      clientId: secrets.clientId,
      clientSecret: secrets.clientSecret,
      redirectUri: secrets.redirectUri,
    };
  } catch (error) {
    // Fallback a variables de entorno
    return {
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      redirectUri: process.env.YEKA_REDIRECT_URI!,
    };
  }
};

// 📤 Scopes que solicitamos al usuario al hacer login
export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Solo archivos creados por la app
  'https://www.googleapis.com/auth/userinfo.email' // Solo para obtener el email
];

// 🔧 Función para crear cliente OAuth2
export const getOAuthClient = (config: { clientId: string; clientSecret: string; redirectUri: string }) => {
  return new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );
};

// 🔄 Función para intercambiar código por tokens
export const exchangeCodeForTokens = async (
  oauth2Client: OAuth2Client,
  code: string
) => {
  return await oauth2Client.getToken(code);
};

// 👤 Función para obtener información del usuario desde el token
export const getUserInfoFromToken = async (tokens: any) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(tokens);
  
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  
  return {
    email: userInfo.data.email,
    name: userInfo.data.name,
    picture: userInfo.data.picture
  };
};
