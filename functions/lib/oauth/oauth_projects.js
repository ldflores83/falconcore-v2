"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfoFromToken = exports.exchangeCodeForTokens = exports.getOAuthClient = exports.OAUTH_SCOPES = void 0;
const googleapis_1 = require("googleapis");
/**
 * Configuración OAuth por proyecto (MVP / Módulo).
 *
 * Cada `project_id` se utiliza para:
 * - Aislar carpetas creadas en Drive (`Root - {email}/{project_id}`)
 * - Guardar tokens por módulo en Firestore
 * - Escalar a múltiples productos desde la misma base (Falcon Core)
 *
 * En MVPs iniciales se reutiliza la misma app OAuth (misma client_id),
 * pero puede migrarse luego a apps separadas si se desea aislamiento total.
 */
// 🔐 Configuración modular por producto
const oauthConfigs = {
    yeka: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.YEKA_REDIRECT_URI,
    },
    // Agrega más project_ids aquí si usas otros productos
};
// 📤 Scopes que solicitamos al usuario al hacer login
exports.OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];
// 🔄 Devuelve un cliente OAuth configurado para el producto correspondiente
const getOAuthClient = (projectId) => {
    const config = oauthConfigs[projectId];
    if (!config) {
        throw new Error(`No OAuth config found for project_id: ${projectId}`);
    }
    return new googleapis_1.google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
};
exports.getOAuthClient = getOAuthClient;
// 🔁 Intercambia el código de autorización recibido por los tokens reales
const exchangeCodeForTokens = async (code, projectId) => {
    const oauth2Client = (0, exports.getOAuthClient)(projectId);
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};
exports.exchangeCodeForTokens = exchangeCodeForTokens;
// 👤 Usa los tokens para obtener los datos del usuario (email, nombre, etc.)
const getUserInfoFromToken = async (tokens) => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    return userInfo.data;
};
exports.getUserInfoFromToken = getUserInfoFromToken;
