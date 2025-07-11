import { Request, Response } from 'express';
import { OAUTH_CONFIG_BY_PROJECT } from '../oauth/oauth_projects';

export const debugRedirect = (req: Request, res: Response): void => {
  const projectId = req.query.project_id as string;

  if (!projectId) {
    res.status(400).json({ error: 'Falta project_id en query' });
    return;
  }

  const config = OAUTH_CONFIG_BY_PROJECT[projectId];
  if (!config) {
    res.status(404).json({ error: 'project_id no registrado en oauth_projects' });
    return;
  }

  res.json({
    status: 'ok',
    project_id: projectId,
    redirect_uri: config.redirect_uri,
    client_id: config.client_id,
    source: 'debugRedirect endpoint',
  });
};
