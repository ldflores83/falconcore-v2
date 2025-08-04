"use strict";
// functions/src/oauth/callback.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = void 0;
const googleapis_1 = require("googleapis");
const providerFactory_1 = require("../storage/utils/providerFactory");
const oauth_projects_1 = require("./oauth_projects");
const saveOAuthData_1 = require("./saveOAuthData");
const config_1 = require("../config");
const callback = async (req, res) => {
    console.log('🔧 OAuth callback started - UPDATED VERSION');
    console.log('🔧 Callback request query:', req.query);
    try {
        const { code, state } = req.query;
        console.log('🔧 Callback parameters:', { code: !!code, state });
        if (!code || !state) {
            console.error('❌ Missing required parameters:', { code: !!code, state });
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: code and state"
            });
        }
        // El state es directamente el projectId según el flujo documentado
        const projectId = state;
        console.log('🔧 Project ID from state:', projectId);
        // Configurar OAuth2
        console.log('🔧 Getting OAuth config...');
        const oauthConfig = await (0, config_1.getOAuthConfig)();
        console.log('🔧 OAuth config obtained:', {
            hasClientId: !!oauthConfig.clientId,
            hasClientSecret: !!oauthConfig.clientSecret,
            redirectUri: oauthConfig.redirectUri
        });
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        // Intercambiar código por tokens
        console.log('🔧 Exchanging code for tokens...');
        const { tokens } = await oauth2Client.getToken(code);
        console.log('🔧 Tokens obtained:', {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            hasExpiryDate: !!tokens.expiry_date
        });
        if (!tokens.access_token) {
            throw new Error("Failed to get access token");
        }
        // Obtener información real del usuario autenticado
        console.log('🔧 Getting user info from token...');
        const userInfo = await (0, oauth_projects_1.getUserInfoFromToken)(tokens);
        const authenticatedEmail = userInfo.email;
        console.log('🔧 User info obtained:', {
            email: authenticatedEmail,
            name: userInfo.name,
            picture: userInfo.picture
        });
        if (!authenticatedEmail) {
            throw new Error("Could not retrieve user email from OAuth");
        }
        console.log('✅ OAuth tokens obtained:', {
            authenticatedEmail,
            projectId,
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token
        });
        // Crear provider y probar conexión
        console.log('🔧 Creating storage provider...');
        const provider = providerFactory_1.StorageProviderFactory.createProvider('google');
        try {
            // Probar creación de carpeta con el email real del usuario
            console.log('🔧 Creating folder in Google Drive...');
            // Pasar los tokens directamente al provider en lugar de usar Firestore
            const folderId = await provider.createFolderWithTokens(authenticatedEmail, projectId, tokens.access_token, tokens.refresh_token || undefined);
            console.log('🔧 Folder created:', folderId);
            // Guardar datos OAuth en Firestore
            console.log('🔧 Saving OAuth data to Firestore...');
            const userId = `${authenticatedEmail}_${projectId}`;
            await (0, saveOAuthData_1.saveOAuthData)({
                userId,
                projectId,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || undefined,
                expiresAt: tokens.expiry_date || undefined,
                folderId,
                email: authenticatedEmail
            });
            console.log('🔧 OAuth data saved to Firestore');
            console.log('✅ OAuth callback successful:', {
                authenticatedEmail,
                projectId,
                folderId,
                timestamp: new Date().toISOString()
            });
            // Redirigir al dashboard en lugar de mostrar JSON
            const dashboardUrl = `https://uaylabs.web.app/onboardingaudit/admin`;
            return res.redirect(dashboardUrl);
        }
        catch (error) {
            console.error('❌ Error testing provider after OAuth:', error);
            return res.status(500).json({
                success: false,
                message: "OAuth successful but provider test failed",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        console.error('❌ Error in OAuth callback:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: "OAuth callback failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.callback = callback;
