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
const getOAuthConfig = async (projectId: string) => {
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
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// 🔄 Devuelve un cliente OAuth configurado para el producto correspondiente
export const getOAuthClient = async (projectId: string): Promise<OAuth2Client> => {
  const config = await getOAuthConfig(projectId);

  if (!config) {
    throw new Error(`No OAuth config found for project_id: ${projectId}`);
  }

  return new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );
};

// 🔁 Intercambia el código de autorización recibido por los tokens reales
export const exchangeCodeForTokens = async (code: string, projectId: string) => {
  const oauth2Client = await getOAuthClient(projectId);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// 👤 Usa los tokens para obtener los datos del usuario (email, nombre, etc.)
export const getUserInfoFromToken = async (tokens: any): Promise<oauth2_v2.Schema$Userinfo> => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
};
