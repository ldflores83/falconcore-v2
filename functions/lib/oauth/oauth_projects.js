"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAUTH_CONFIG_BY_PROJECT = void 0;
exports.OAUTH_CONFIG_BY_PROJECT = {
    devproject: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        scopes: [
            'https://www.googleapis.com/auth/drive.file', // Permite crear/modificar archivos y carpetas
            'https://www.googleapis.com/auth/userinfo.email', // Permite acceder al email
            'https://www.googleapis.com/auth/userinfo.profile' // Permite acceder al nombre y foto del usuario
        ],
        provider: 'google'
    },
};
