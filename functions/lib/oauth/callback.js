"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthCallbackHandler = void 0;
const googleapis_1 = require("googleapis");
const oauth_projects_1 = require("./oauth_projects");
const GoogleDriveProvider_1 = require("../storage/providers/GoogleDriveProvider");
const saveTokens_1 = require("../storage/utils/saveTokens");
const oauthCallbackHandler = async (req, res) => {
    console.log('[OAuth Debug] Inició oauthCallbackHandler');
    try {
        const code = req.query.code;
        /**
         * Nota:
         * Google OAuth retorna automáticamente el parámetro `state` en el callback.
         * En nuestro caso, lo usamos como `project_id` para modularizar el contexto.
         * Esto permite mantener una sola ruta de callback limpia para todos los MVPs.
         */
        const projectId = (req.query.project_id || req.query.state);
        if (!code || !projectId) {
            res.status(400).json({ error: 'Faltan parámetros: code o project_id' });
            return;
        }
        const config = oauth_projects_1.OAUTH_CONFIG_BY_PROJECT[projectId];
        if (!config) {
            res.status(400).json({ error: 'project_id inválido' });
            return;
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2({
            clientId: config.client_id,
            clientSecret: config.client_secret,
            redirectUri: config.redirect_uri,
        });
        const { tokens } = await oauth2Client.getToken(code);
        const accessToken = tokens.access_token;
        if (!accessToken) {
            res.status(400).json({ error: 'No se recibió access_token' });
            return;
        }
        oauth2Client.setCredentials(tokens);
        const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;
        if (!email) {
            res.status(400).json({ error: 'No se pudo obtener el email del usuario' });
            return;
        }
        const driveProvider = new GoogleDriveProvider_1.GoogleDriveProvider(accessToken);
        const folderId = await driveProvider.createFolder(email, projectId);
        await (0, saveTokens_1.saveTokensAndFolder)(email, projectId, {
            access_token: accessToken,
            refresh_token: tokens.refresh_token ?? undefined,
        }, folderId);
        res.status(200).json({ email, folderId });
    }
    catch (error) {
        console.error('[OAuth Error]', error);
        res.status(500).json({ error: 'Error en el callback OAuth' });
    }
};
exports.oauthCallbackHandler = oauthCallbackHandler;
