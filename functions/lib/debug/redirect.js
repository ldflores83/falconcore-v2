"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugRedirect = void 0;
const oauth_projects_1 = require("../oauth/oauth_projects");
const debugRedirect = (req, res) => {
    const projectId = req.query.project_id;
    if (!projectId) {
        res.status(400).json({ error: 'Falta project_id en query' });
        return;
    }
    const config = oauth_projects_1.OAUTH_CONFIG_BY_PROJECT[projectId];
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
exports.debugRedirect = debugRedirect;
