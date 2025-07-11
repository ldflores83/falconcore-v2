"use strict";
// src/oauth/login.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthLoginHandler = void 0;
const oauth_projects_1 = require("./oauth_projects");
const oauthLoginHandler = (req, res) => {
    const projectId = req.query.project_id;
    console.log('[OAuth Debug] projectId:', projectId);
    const config = oauth_projects_1.OAUTH_CONFIG_BY_PROJECT[projectId];
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
        `&state=${encodeURIComponent(projectId)}`;
    +console.log('[OAuth Debug] redirect_uri enviado a Google:', redirect_uri);
    console.log('[OAuth Debug] state enviado a Google:', projectId);
    res.redirect(authUrl);
};
exports.oauthLoginHandler = oauthLoginHandler;
