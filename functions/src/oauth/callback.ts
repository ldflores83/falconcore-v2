// /src/oauth/callback.ts

import { Request, Response } from 'express';
import { google, drive_v3 } from 'googleapis';
import { providerFactory } from '../storage/utils/providerFactory';
import {
  exchangeCodeForTokens,
  getUserInfoFromToken,
  getOAuthClient
} from './oauth_projects';

// 🎯 Handler que recibe la redirección después del login con Google
export const oauthCallbackHandler = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const projectId = req.query.state as string; // lo mandamos en login

    // 🛑 Validación mínima
    if (!code || !projectId) {
      return res.status(400).send('Missing code or projectId in callback.');
    }

    // 🔄 Intercambiamos el code por los tokens de acceso
    const tokens = await exchangeCodeForTokens(code, projectId);

    const accessToken = tokens.access_token;
    if (!accessToken) {
      return res.status(400).send('No access token received');
    }

    // 🔐 Instanciamos el cliente OAuth con los tokens
    const oauth2Client = getOAuthClient(projectId);
    oauth2Client.setCredentials(tokens);

    // 👤 Obtenemos el correo del usuario
    const userInfo = await getUserInfoFromToken(tokens);
    const email = userInfo?.email;

    if (!email) {
      return res.status(400).send('No user email received');
    }

    // 📁 Inicializamos provider (Google Drive en este caso)
    const drive: drive_v3.Drive = google.drive({ version: 'v3', auth: oauth2Client });
    const provider = providerFactory('google', email, drive);

    // 📂 Creamos carpeta raíz para el usuario + producto
    const folderId = await provider.createFolder(email, projectId);

    // ✅ Respondemos con éxito y los datos básicos
    return res.status(200).json({
      message: 'OAuth callback successful',
      email,
      folderId
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).send('Internal Server Error during OAuth callback');
  }
};
