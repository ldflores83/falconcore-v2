import { Request, Response } from 'express';
import { OAUTH_CONFIG_BY_PROJECT } from './oauth_projects';
import { getGoogleAuthUrl } from './providers/google';
import { getMicrosoftAuthUrl } from './providers/microsoft';

export const oauthLoginHandler = (req: Request, res: Response): void => {
  const projectId = req.query.project_id as string;

  const config = OAUTH_CONFIG_BY_PROJECT[projectId];
  if (!config) {
    res.status(400).json({ error: 'Invalid project_id' });
    return;
  }

  let authUrl = '';
  switch (config.provider) {
    case 'google':
      authUrl = getGoogleAuthUrl(config, projectId);
      break;
    case 'microsoft':
      authUrl = getMicrosoftAuthUrl(config);
      break;
    default:
      res.status(400).json({ error: 'Unsupported provider' });
      return;
  }

  res.redirect(authUrl);
};
