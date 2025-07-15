import { Request, Response } from 'express';
import { google, oauth2_v2 } from 'googleapis';
import { OAUTH_CONFIG_BY_PROJECT } from './oauth_projects';
import { GoogleDriveProvider } from '../storage/providers/GoogleDriveProvider';

export const oauthCallbackHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('[OAuth Debug] Inició oauthCallbackHandler');

  try {
    const { code, state } = req.query;
    const project_id = state as string;

    console.log('[OAuth Debug] Params recibidos:', { code, project_id });

    const config = OAUTH_CONFIG_BY_PROJECT[project_id];
    if (!config) {
      res.status(400).json({ error: 'Invalid project_id' });
      return;
    }

    const oauth2Client = new google.auth.OAuth2(
      config.client_id,
      config.client_secret,
      config.redirect_uri
    );

    console.log('[OAuth Debug] Cliente OAuth2 creado');

    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    console.log('[OAuth Debug] Tokens recibidos:', tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfoResult = await oauth2.userinfo.get();
    const userInfo: oauth2_v2.Schema$Userinfo = userInfoResult.data;

    if (!userInfo.email) {
      throw new Error('No se pudo obtener el email del usuario.');
    }

    const email = userInfo.email;
    console.log('[OAuth Debug] Email del usuario:', email);

    const provider = new GoogleDriveProvider(tokens.access_token!);
    const folderId = await provider.createFolder(`Root - ${email}`);

    console.log('[OAuth Debug] Carpeta creada, ID:', folderId);

    res.json({
      status: 'ok',
      email,
      folderId
    });

  } catch (error: any) {
    console.error('[OAuth Error]', error);
    res.status(500).json({ error: error.message || 'OAuth callback failed' });
  }
};
