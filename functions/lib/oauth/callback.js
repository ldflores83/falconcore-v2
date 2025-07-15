"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthCallbackHandler = void 0;
const googleapis_1 = require("googleapis");
const oauth_projects_1 = require("./oauth_projects");
const GoogleDriveProvider_1 = require("../storage/providers/GoogleDriveProvider");
const oauthCallbackHandler = async (req, res) => {
    console.log('[OAuth Debug] Inició oauthCallbackHandler');
    try {
        const { code, state } = req.query;
        const project_id = state;
        console.log('[OAuth Debug] Params recibidos:', { code, project_id });
        const config = oauth_projects_1.OAUTH_CONFIG_BY_PROJECT[project_id];
        if (!config) {
            res.status(400).json({ error: 'Invalid project_id' });
            return;
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(config.client_id, config.client_secret, config.redirect_uri);
        console.log('[OAuth Debug] Cliente OAuth2 creado');
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        console.log('[OAuth Debug] Tokens recibidos:', tokens);
        const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfoResult = await oauth2.userinfo.get();
        const userInfo = userInfoResult.data;
        if (!userInfo.email) {
            throw new Error('No se pudo obtener el email del usuario.');
        }
        const email = userInfo.email;
        console.log('[OAuth Debug] Email del usuario:', email);
        const provider = new GoogleDriveProvider_1.GoogleDriveProvider(tokens.access_token);
        const folderId = await provider.createFolder(`Root - ${email}`);
        console.log('[OAuth Debug] Carpeta creada, ID:', folderId);
        res.json({
            status: 'ok',
            email,
            folderId
        });
    }
    catch (error) {
        console.error('[OAuth Error]', error);
        res.status(500).json({ error: error.message || 'OAuth callback failed' });
    }
};
exports.oauthCallbackHandler = oauthCallbackHandler;
