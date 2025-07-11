// src/oauth/callback.ts

import { Request, Response } from 'express';
import { OAUTH_CONFIG_BY_PROJECT } from './oauth_projects';
import { fetch } from 'undici';

export const oauthCallback = async (req: Request, res: Response): Promise<void> => {
  const projectId = req.query.state as string; // Aquí viene ahora el contexto

  console.log('[OAuth Debug] state recibido (como projectId):', projectId);

  const config = OAUTH_CONFIG_BY_PROJECT[projectId];
  if (!config) {
    res.status(400).json({ error: 'Invalid project_id (from state)' });
    return;
  }

  const { client_id, client_secret, redirect_uri } = config;

  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  console.log('[OAuth Debug] code:', code);

  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const params = new URLSearchParams({
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code',
  });

  try {
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData: any = await tokenRes.json();

    if (tokenData.error) {
      console.error('[OAuth Error]', tokenData);
      res.status(400).json(tokenData);
      return;
    }

    res.json({ status: 'success', token: tokenData, project_id: projectId });
  } catch (err) {
    console.error('[OAuth Error]', err);
    res.status(500).json({ error: 'Error exchanging code for token' });
  }
};
