"use strict";
// functions/src/oauth/callback.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = void 0;
const googleapis_1 = require("googleapis");
const providerFactory_1 = require("../storage/utils/providerFactory");
const oauth_projects_1 = require("./oauth_projects");
const saveOAuthData_1 = require("./saveOAuthData");
const oauth_projects_2 = require("./oauth_projects");
const check_1 = require("../api/auth/check");
const hash_1 = require("../utils/hash");
const secret_manager_1 = require("@google-cloud/secret-manager");
const secretManagerClient = new secret_manager_1.SecretManagerServiceClient();
// Helper function to validate ENCRYPTION_KEY
async function validateEncryptionKey() {
    try {
        const projectId = 'falconcore-v2';
        const secretName = `projects/${projectId}/secrets/ENCRYPTION_KEY/versions/latest`;
        const [version] = await secretManagerClient.accessSecretVersion({ name: secretName });
        const key = version.payload?.data?.toString().trim() || '';
        if (!key || Buffer.from(key, 'hex').length !== 32) {
            throw new Error("ENCRYPTION_KEY must be defined and 32 bytes long (hex string).");
        }
    }
    catch (error) {
        throw new Error(`Missing or invalid ENCRYPTION_KEY, aborting OAuth flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
const callback = async (req, res) => {
    try {
        console.log('🔄 OAuth Callback: Starting OAuth callback process...');
        const { code, state } = req.query;
        if (!code || !state) {
            console.log('❌ OAuth Callback: Missing code or state parameters');
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: code and state"
            });
        }
        // El state es directamente el projectId según el flujo documentado
        const projectId = state;
        // Configurar OAuth2
        const oauthConfig = await (0, oauth_projects_1.getOAuthConfig)();
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        // Intercambiar código por tokens
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.access_token) {
            throw new Error("Failed to get access token");
        }
        // 🔐 VALIDATE ENCRYPTION_KEY IMMEDIATELY AFTER RECEIVING TOKENS
        // This prevents any Drive operations if encryption is not properly configured
        try {
            await validateEncryptionKey();
        }
        catch (error) {
            console.error('❌ OAuth Callback: ENCRYPTION_KEY validation failed:', error);
            const errorUrl = `https://uaylabs.web.app/${projectId}/login?error=encryption_failed`;
            return res.redirect(errorUrl);
        }
        // Obtener información real del usuario autenticado
        const userInfo = await (0, oauth_projects_2.getUserInfoFromToken)(tokens);
        const authenticatedEmail = userInfo.email;
        if (!authenticatedEmail) {
            throw new Error("Could not retrieve user email from OAuth");
        }
        // Generar clientId único basado en email y projectId
        const clientId = (0, hash_1.generateClientId)(authenticatedEmail, projectId);
        // Crear provider y probar conexión
        const provider = providerFactory_1.StorageProviderFactory.createProvider('google');
        try {
            // Verificar si ya existe la carpeta de trabajo
            const folderName = `${projectId}_${authenticatedEmail}`;
            let folderId = await provider.findOrCreateFolder(folderName, projectId, tokens.access_token, tokens.refresh_token || undefined);
            // Guardar datos OAuth en Firestore usando clientId como clave
            await (0, saveOAuthData_1.saveOAuthData)({
                clientId,
                projectId,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || undefined,
                expiresAt: tokens.expiry_date || undefined,
                folderId,
                email: authenticatedEmail
            });
            // Crear sesión de administrador
            console.log('🔄 OAuth Callback: Creating admin session for:', authenticatedEmail, projectId);
            const sessionToken = await (0, check_1.createAdminSession)(authenticatedEmail, projectId);
            console.log('✅ OAuth Callback: Admin session created with token:', sessionToken);
            // Redirigir directamente al admin panel
            const adminUrl = `https://uaylabs.web.app/${projectId}/admin?token=${sessionToken}`;
            console.log('🔄 OAuth Callback: Redirecting to admin panel:', adminUrl);
            return res.redirect(adminUrl);
        }
        catch (error) {
            console.error('❌ OAuth Callback: Error in folder creation or data saving:', error);
            // En caso de error, redirigir a una página de error
            const errorUrl = `https://uaylabs.web.app/${projectId}/login?error=auth_failed`;
            return res.redirect(errorUrl);
        }
    }
    catch (error) {
        console.error('❌ OAuth Callback: General error:', error);
        // En caso de error general, redirigir a login
        const errorUrl = `https://uaylabs.web.app/onboardingaudit/login?error=oauth_failed`;
        return res.redirect(errorUrl);
    }
};
exports.callback = callback;
