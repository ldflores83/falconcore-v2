// functions/src/oauth/login.ts

import { Request, Response } from 'express';
import { getOAuthClient, OAUTH_SCOPES } from './oauth_projects';

// 🚀 Handler para la ruta /oauth/login
// Espera recibir un query param como: ?project_id=yeka
export default function loginHandler(req: Request, res: Response) {
  const projectId = req.query.project_id as string;

  // ⛔️ Validación mínima: si no hay project_id, respondemos con error
  if (!projectId) {
    return res.status(400).json({ error: 'Missing project_id in query' });
  }

  try {
    // 🔑 Obtenemos el cliente OAuth configurado para este producto
    const oauth2Client = getOAuthClient(projectId);

    // 🌐 Construimos la URL de autorización
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: OAUTH_SCOPES,
      prompt: 'consent',
      state: projectId, // Se usa luego en callback para saber a qué producto pertenece
    });

    // 🔁 Redirigimos al usuario a Google OAuth
    return res.redirect(authUrl);

  } catch (error) {
    console.error('OAuth login error:', error);
    return res.status(500).json({ error: 'Failed to generate auth URL' });
  }
}
