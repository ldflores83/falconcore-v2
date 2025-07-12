"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAUTH_CONFIG_BY_PROJECT = void 0;
// Aquí defines qué configuración usar por proyecto (por ahora solo 'devproject')
exports.OAUTH_CONFIG_BY_PROJECT = {
    devproject: {
        provider: 'google', // ✅ Agregado
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    },
};
