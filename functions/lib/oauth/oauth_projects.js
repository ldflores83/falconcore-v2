"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfoFromToken = exports.exchangeCodeForTokens = exports.getOAuthClient = exports.OAUTH_SCOPES = void 0;
const googleapis_1 = require("googleapis");
const secretManager_1 = require("../services/secretManager");
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
const getOAuthConfig = async (projectId) => {
    try {
        // Intentar obtener desde Secret Manager
        const secrets = await (0, secretManager_1.getOAuthSecrets)();
        return {
            clientId: secrets.clientId,
            clientSecret: secrets.clientSecret,
            redirectUri: secrets.redirectUri,
        };
    }
    catch (error) {
        // Fallback a variables de entorno
        return {
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.YEKA_REDIRECT_URI,
        };
    }
};
// 📤 Scopes que solicitamos al usuario al hacer login
exports.OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];
// 🔄 Devuelve un cliente OAuth configurado para el producto correspondiente
const getOAuthClient = async (projectId) => {
    const config = await getOAuthConfig(projectId);
    if (!config) {
        throw new Error(`No OAuth config found for project_id: ${projectId}`);
    }
    return new googleapis_1.google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
};
exports.getOAuthClient = getOAuthClient;
// 🔁 Intercambia el código de autorización recibido por los tokens reales
const exchangeCodeForTokens = async (code, projectId) => {
    const oauth2Client = await (0, exports.getOAuthClient)(projectId);
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
