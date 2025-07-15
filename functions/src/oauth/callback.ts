// /src/oauth/callback.ts
import { Request, Response } from 'express';
import { google } from 'googleapis';
import { OAUTH_CONFIG_BY_PROJECT } from './oauth_projects';
import { GoogleDriveProvider } from '../storage/providers/GoogleDriveProvider';
import { saveTokensAndFolder } from '../storage/utils/saveTokens';

export const oauthCallbackHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('[OAuth Debug] Inició oauthCallbackHandler');

  try {
    const code = req.query.code as string;

    /**
     * Nota:
     * Google OAuth retorna automáticamente el parámetro `state` en el callback.
     * En nuestro caso, lo usamos como `project_id` para modularizar el contexto.
     * Esto permite mantener una sola ruta de callback limpia para todos los MVPs.
     */
    const projectId = (req.query.project_id || req.query.state) as string;

    if (!code || !projectId) {
      res.status(400).json({ error: 'Faltan parámetros: code o project_id' });
      return;
    }

    const config = OAUTH_CONFIG_BY_PROJECT[projectId];
    if (!config) {
      res.status(400).json({ error: 'project_id inválido' });
      return;
    }

    const oauth2Client = new google.auth.OAuth2({
      clientId: config.client_id,
      clientSecret: config.client_secret,
      redirectUri: config.redirect_uri,
    });

    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    if (!accessToken) {
      res.status(400).json({ error: 'No se recibió access_token' });
      return;
    }

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    if (!email) {
      res.status(400).json({ error: 'No se pudo obtener el email del usuario' });
      return;
    }

    const driveProvider = new GoogleDriveProvider(accessToken);
    const folderId = await driveProvider.createFolder(email, projectId);

    await saveTokensAndFolder(email, projectId, {
      access_token: accessToken,
      refresh_token: tokens.refresh_token ?? undefined,
    }, folderId);

    res.status(200).json({ email, folderId });
  } catch (error: any) {
    console.error('[OAuth Error]', error);
    res.status(500).json({ error: 'Error en el callback OAuth' });
  }
};
