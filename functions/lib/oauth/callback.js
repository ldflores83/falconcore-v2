"use strict";
// src/oauth/callback.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthCallback = void 0;
const oauth_projects_1 = require("./oauth_projects");
const undici_1 = require("undici");
const oauthCallback = async (req, res) => {
    const projectId = req.query.state; // Aquí viene ahora el contexto
    console.log('[OAuth Debug] state recibido (como projectId):', projectId);
    const config = oauth_projects_1.OAUTH_CONFIG_BY_PROJECT[projectId];
    if (!config) {
        res.status(400).json({ error: 'Invalid project_id (from state)' });
        return;
    }
    const { client_id, client_secret, redirect_uri } = config;
    const code = req.query.code;
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
        const tokenRes = await (0, undici_1.fetch)(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            console.error('[OAuth Error]', tokenData);
            res.status(400).json(tokenData);
            return;
        }
        res.json({ status: 'success', token: tokenData, project_id: projectId });
    }
    catch (err) {
        console.error('[OAuth Error]', err);
        res.status(500).json({ error: 'Error exchanging code for token' });
    }
};
exports.oauthCallback = oauthCallback;
