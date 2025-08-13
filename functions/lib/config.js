"use strict";
// functions/src/config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseConfig = exports.getOAuthConfig = void 0;
const secretManager_1 = require("./services/secretManager");
// Configuración de OAuth
const getOAuthConfig = async () => {
    try {
        const secrets = await (0, secretManager_1.getOAuthSecrets)();
        // Verificar que los secrets no estén vacíos
        if (!secrets.clientId || secrets.clientId === 'TU_CLIENT_ID_REAL_AQUI') {
            throw new Error('OAuth secrets not properly configured');
        }
        return secrets;
    }
    catch (error) {
        // Fallback a credenciales hardcodeadas
        const hardcodedConfig = {
            clientId: '1038906476883-6o30selbiuqetptejps1lnk04o1nl08d.apps.googleusercontent.com',
            clientSecret: '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',
            redirectUri: 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback'
        };
        return hardcodedConfig;
    }
};
exports.getOAuthConfig = getOAuthConfig;
// Configuración de Firebase
const getFirebaseConfig = () => {
    return {
        projectId: process.env.FIREBASE_PROJECT_ID || 'falconcore-v2'
    };
};
exports.getFirebaseConfig = getFirebaseConfig;
