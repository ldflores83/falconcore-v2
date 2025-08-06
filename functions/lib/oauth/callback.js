"use strict";
// functions/src/oauth/callback.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = void 0;
const googleapis_1 = require("googleapis");
const providerFactory_1 = require("../storage/utils/providerFactory");
const oauth_projects_1 = require("./oauth_projects");
const saveOAuthData_1 = require("./saveOAuthData");
const config_1 = require("../config");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
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
            // Crear sesión de administrador
            console.log('🔧 Creating admin session...');
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const sessionData = {
                userId,
                projectId,
                email: authenticatedEmail,
                createdAt: admin.firestore.Timestamp.now(),
                expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + (24 * 60 * 60 * 1000)), // 24 horas
                userAgent: req.headers['user-agent'] || 'unknown',
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
            };
            await admin.firestore().collection('admin_sessions').doc(sessionToken).set(sessionData);
            console.log('🔧 Admin session created:', sessionToken);
            console.log('✅ OAuth callback successful:', {
                authenticatedEmail,
                projectId,
                folderId,
                sessionToken,
                timestamp: new Date().toISOString()
            });
            // Redirigir al dashboard con el token de sesión
            const dashboardUrl = `https://uaylabs.web.app/onboardingaudit/admin?session=${sessionToken}`;
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
