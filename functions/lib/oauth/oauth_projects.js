"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfoFromToken = exports.exchangeCodeForTokens = exports.getOAuthClient = exports.OAUTH_SCOPES = exports.getOAuthConfig = void 0;
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
exports.getOAuthConfig = getOAuthConfig;
// 📤 Scopes que solicitamos al usuario al hacer login
exports.OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/drive.file', // Solo archivos creados por la app
    'https://www.googleapis.com/auth/userinfo.email' // Solo para obtener el email
];
// 🔧 Función para crear cliente OAuth2
const getOAuthClient = (config) => {
    return new googleapis_1.google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
};
exports.getOAuthClient = getOAuthClient;
// 🔄 Función para intercambiar código por tokens
const exchangeCodeForTokens = async (oauth2Client, code) => {
    return await oauth2Client.getToken(code);
};
exports.exchangeCodeForTokens = exchangeCodeForTokens;
// 👤 Función para obtener información del usuario desde el token
const getUserInfoFromToken = async (tokens) => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    return {
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture
    };
};
exports.getUserInfoFromToken = getUserInfoFromToken;
