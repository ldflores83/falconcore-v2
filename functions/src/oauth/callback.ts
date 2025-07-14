import { Request, Response } from 'express';
import { google } from 'googleapis';
import fetch from 'node-fetch'; // Asegúrate de tenerlo en tu `package.json`
import { OAUTH_CONFIG_BY_PROJECT } from './oauth_projects';

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

    console.log('[OAuth Debug] Config obtenida:', {
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
    });

    const oauth2Client = new google.auth.OAuth2(
      config.client_id,
      config.client_secret,
      config.redirect_uri
    );

    console.log('[OAuth Debug] Cliente OAuth2 creado');

    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('[OAuth Debug] Tokens obtenidos:', tokens);

    oauth2Client.setCredentials({ access_token: tokens.access_token });
    console.log('[OAuth Debug] Credenciales seteadas');

    // 🔍 Hacemos llamada manual a userinfo con fetch + header
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userinfoResponse.ok) {
      const errorData = await userinfoResponse.text();
      console.error('[OAuth Debug] Error en userinfo:', userinfoResponse.status, errorData);
      res.status(500).json({ error: 'Failed to fetch user info' });
      return;
    }

    const userinfo = await userinfoResponse.json();
    console.log('[OAuth Debug] Userinfo response:', userinfo);

    const userEmail = userinfo.email || 'unknown@email.com';
    console.log('[OAuth Debug] Email del usuario:', userEmail);

    // 🔚 Por ahora solo regresamos info básica
    res.status(200).json({
      success: true,
      email: userEmail,
      tokens,
    });

  } catch (error: any) {
    console.error('[OAuth Callback Error – Exception]:', error.message);
    console.error('[OAuth Callback Error – Stack]:', error.stack);
    res.status(500).json({ error: 'Internal server error during OAuth callback' });
  }
};
