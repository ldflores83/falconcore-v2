// src/oauth/login.ts

import { Request, Response } from 'express';
import { OAUTH_CONFIG_BY_PROJECT } from './oauth_projects';

export const oauthLoginHandler = (req: Request, res: Response): void => {
  const projectId = req.query.project_id as string;

  console.log('[OAuth Debug] projectId:', projectId);

  const config = OAUTH_CONFIG_BY_PROJECT[projectId];
  if (!config) {
    res.status(400).json({ error: 'Invalid project_id' });
    return;
  }

  const { client_id, redirect_uri, scopes } = config;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(projectId)}`; + //cambio 2:30pm

  console.log('[OAuth Debug] redirect_uri enviado a Google:', redirect_uri);
  console.log('[OAuth Debug] state enviado a Google:', projectId);

  res.redirect(authUrl);
};
