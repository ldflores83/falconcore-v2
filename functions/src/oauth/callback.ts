// /src/oauth/callback.ts

import { Request, Response } from 'express';
import { google, drive_v3 } from 'googleapis';
import { providerFactory } from '../storage/utils/providerFactory';

import { getUserIdFromEmail } from "../utils/hash";        // 🔐 Convierte email → userId (hash persistente)
import { saveOAuthData } from "./saveOAuthData";           // 💾 Guarda token + folderId en Firestore

import {
  exchangeCodeForTokens,         // 🔄 Intercambia código por access_token + refresh_token
  getUserInfoFromToken,          // 👤 Extrae email del usuario usando el token
  getOAuthClient                 // 🔧 Genera cliente OAuth configurado por proyecto
} from './oauth_projects';

export const oauthCallbackHandler = async (req: Request, res: Response) => {
  try {
    // 📝 Log al inicio del handler
    console.log('[OAuth] Callback handler invoked', {
      query: req.query,
      time: new Date().toISOString()
    });

    // 🎯 Extraemos `code` y `projectId` (enviado en `state` durante login)
    const code = req.query.code as string;
    const projectId = req.query.state as string;

    // Log después de recibir code y projectId
    console.log('[OAuth] Received code and projectId', { code: !!code, projectId });

    if (!code || !projectId) {
      console.warn('[OAuth] Missing code or projectId in callback', { code, projectId });
      return res.status(400).send('Missing code or projectId in callback.');
    }

    // 🔐 Intercambiamos el `code` por tokens de acceso usando el cliente OAuth
    let tokens;
    try {
      tokens = await exchangeCodeForTokens(code, projectId);
    } catch (error: any) {
      if (error?.response?.data?.error === 'invalid_grant') {
        console.error('[OAuth] Código de autorización inválido o expirado');
        return res.status(400).json({ error: 'El código de autorización ya fue usado o expiró. Intenta iniciar sesión de nuevo.' });
      }
      // Otros errores
      console.error('[OAuth] Error inesperado al intercambiar código por tokens:', error);
      return res.status(500).send('Internal Server Error during OAuth callback');
    }
    const accessToken = tokens.access_token;

    // Log después de obtener los tokens
    console.log('[OAuth] Tokens received', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date
    });

    if (!accessToken) {
      console.warn('[OAuth] No access token received', { tokens });
      return res.status(400).send('No access token received');
    }

    // 🛠 Configuramos cliente OAuth con las credenciales recibidas
    const oauth2Client = getOAuthClient(projectId);
    oauth2Client.setCredentials(tokens);

    // 👤 Obtenemos información del usuario (incluyendo email) usando el token
    const userInfo = await getUserInfoFromToken(tokens);
    const email = userInfo?.email;

    // Log después de obtener el email
    console.log('[OAuth] User info received', { email });

    if (!email) {
      console.warn('[OAuth] No user email received', { userInfo });
      return res.status(400).send('No user email received');
    }

    // 🧠 Generamos `userId` como hash del email — clave interna segura
    const userId = getUserIdFromEmail(email);

    // 📁 Inicializamos Google Drive Provider con instancia autorizada
    const drive: drive_v3.Drive = google.drive({ version: 'v3', auth: oauth2Client });
    const provider = providerFactory('google', email, drive); // email aún necesario para nombre visible de carpeta

    // 🗂️ Creamos carpeta raíz de proyecto (si no existe ya) → "Root - {email} / {projectId}"
    const folderId = await provider.createFolder(email, projectId);

    // Log después de crear la carpeta en Drive
    console.log('[OAuth] Drive folder created or found', { folderId, email, projectId });

    // 🧪 Logging defensivo: detecta si faltan `refresh_token` o `expiry_date`
    const missing: string[] = [];
    if (!tokens.refresh_token) missing.push("refresh_token");
    if (!tokens.expiry_date) missing.push("expiry_date");

    if (missing.length > 0) {
      console.warn(`[OAuth] Missing token fields: ${missing.join(", ")} — user: ${email}, project: ${projectId}`);
    }

    // 💾 Guardamos token, folderId y metadatos en Firestore bajo `/users/{userId}/tokens/{projectId}.json`
    await saveOAuthData({
      userId,
      projectId,
      accessToken: tokens.access_token!,
      folderId,
      refreshToken: tokens.refresh_token ?? undefined, // null → undefined
      expiresAt: tokens.expiry_date ?? undefined       // null → undefined
    });

    // Log antes de retornar la respuesta JSON
    console.log('[OAuth] Callback successful, responding to client', {
      userId,
      email,
      folderId,
      projectId
    });

    // ✅ Confirmamos al frontend (respuesta temporal para pruebas)
    return res.status(200).json({
      message: 'OAuth callback successful',
      userId,
      email,
      folderId
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).send('Internal Server Error during OAuth callback');
  }
};
