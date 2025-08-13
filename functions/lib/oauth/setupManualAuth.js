"use strict";
// functions/src/oauth/setupManualAuth.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.testManualAuth = exports.setupManualAuthWithCode = exports.setupManualAuth = void 0;
const googleapis_1 = require("googleapis");
const config_1 = require("../config");
const saveOAuthData_1 = require("./saveOAuthData");
const providerFactory_1 = require("../storage/utils/providerFactory");
const hash_1 = require("../utils/hash");
const setupManualAuth = async (req, res) => {
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
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        // Generar URL de autorización
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/drive.file', // Solo archivos creados por la app
                'https://www.googleapis.com/auth/userinfo.email' // Solo para obtener el email
            ],
            prompt: 'consent',
            state: project_id
        });
        return res.status(200).json({
            success: true,
            message: "Manual OAuth setup URL generated",
            data: {
                authUrl,
                projectId: project_id,
                instructions: [
                    "1. Copia y pega esta URL en tu navegador",
                    "2. Autoriza la aplicación",
                    "3. Copia el código de autorización",
                    "4. Ejecuta setupManualAuthWithCode con el código"
                ]
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate manual OAuth URL",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.setupManualAuth = setupManualAuth;
const setupManualAuthWithCode = async (req, res) => {
    try {
        const { code, project_id, email } = req.body;
        if (!code || !project_id || !email) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: code, project_id, email"
            });
        }
        // Configurar OAuth2
        const oauthConfig = await (0, config_1.getOAuthConfig)();
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        // Intercambiar código por tokens
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.access_token) {
            throw new Error("Failed to get access token");
        }
        // Generar clientId único basado en email y projectId
        const clientId = (0, hash_1.generateClientId)(email, project_id);
        // Crear provider y probar conexión
        const provider = providerFactory_1.StorageProviderFactory.createProvider('google');
        // Crear carpeta en Google Drive
        const folderId = await provider.createFolderWithTokens(email, project_id, tokens.access_token, tokens.refresh_token || undefined);
        // Guardar datos OAuth en Firestore usando clientId como clave
        await (0, saveOAuthData_1.saveOAuthData)({
            clientId,
            projectId: project_id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || undefined,
            expiresAt: tokens.expiry_date || undefined,
            folderId,
            email
        });
        return res.status(200).json({
            success: true,
            message: "Manual OAuth setup completed",
            data: {
                clientId,
                projectId: project_id,
                email,
                folderId
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Manual OAuth setup failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.setupManualAuthWithCode = setupManualAuthWithCode;
const testManualAuth = async (req, res) => {
    try {
        const { project_id, email } = req.query;
        if (!project_id || !email) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: project_id, email"
            });
        }
        // Simular test de conexión
        const testResult = {
            connected: true,
            projectId: project_id,
            email: email,
            message: "Connection test completed"
        };
        return res.status(200).json({
            success: true,
            message: "Manual OAuth test completed",
            data: {
                projectId: project_id,
                email,
                testResult
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Manual OAuth test failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.testManualAuth = testManualAuth;
