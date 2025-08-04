"use strict";
// functions/src/oauth/login.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const googleapis_1 = require("googleapis");
const config_1 = require("../config");
const login = async (req, res) => {
    console.log('🔧 OAuth login function called - UPDATED VERSION');
    try {
        const { project_id } = req.query;
        if (!project_id) {
            return res.status(400).json({
                success: false,
                message: "Missing project_id parameter"
            });
        }
        // Configurar OAuth2
        const oauthConfig = await (0, config_1.getOAuthConfig)();
        // Debug: Verificar que las credenciales se están leyendo correctamente
        console.log('🔧 OAuth Config Debug:', {
            clientId: oauthConfig.clientId ? `${oauthConfig.clientId.substring(0, 10)}...` : 'NULL',
            hasClientSecret: !!oauthConfig.clientSecret,
            redirectUri: oauthConfig.redirectUri
        });
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        // Crear estado solo con projectId - el email se obtendrá del usuario autenticado
        const state = project_id;
        // Generar URL de autorización según el flujo documentado
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'openid',
                'email',
                'profile',
                'https://www.googleapis.com/auth/drive.file'
            ],
            prompt: 'consent',
            state: state
        });
        console.log('🔗 OAuth login URL generated:', {
            projectId: project_id,
            timestamp: new Date().toISOString()
        });
        return res.redirect(authUrl);
    }
    catch (error) {
        console.error('❌ Error in OAuth login:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate OAuth URL",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.login = login;
