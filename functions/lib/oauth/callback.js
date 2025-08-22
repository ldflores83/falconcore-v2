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
const crypto_1 = require("../utils/crypto");
const configService_1 = require("../services/configService");
const logger_1 = require("../utils/logger");
const rateLimiter_1 = require("../utils/rateLimiter");
// Cache para validar state parameters (prevenir replay attacks)
const usedStates = new Map();
const STATE_CACHE_TTL = 5 * 60 * 1000; // 5 minutos
// Limpiar states expirados
setInterval(() => {
    const now = Date.now();
    for (const [state, timestamp] of usedStates.entries()) {
        if (now - timestamp > STATE_CACHE_TTL) {
            usedStates.delete(state);
        }
    }
}, 60000); // Limpiar cada minuto
const callback = async (req, res) => {
    try {
        logger_1.logger.startOperation('oauth_callback', {
            projectId: req.query.state,
            ip: req.ip || req.connection.remoteAddress || 'unknown'
        });
        const { code, state } = req.query;
        if (!code || !state) {
            logger_1.logger.error('OAuth callback missing parameters', {
                projectId: req.query.state
            });
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: code and state"
            });
        }
        const projectId = state;
        // Validar rate limiting
        const rateLimitKey = {
            projectId,
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            endpoint: '/oauth/callback'
        };
        if (!rateLimiter_1.rateLimiter.isAllowed(rateLimitKey)) {
            logger_1.logger.security('Rate limit exceeded for OAuth callback', {
                projectId,
                ip: req.ip || req.connection.remoteAddress || 'unknown'
            });
            return res.status(429).json({
                success: false,
                message: "Too many OAuth callback attempts"
            });
        }
        // Validar state parameter (prevenir replay attacks)
        if (usedStates.has(projectId)) {
            logger_1.logger.security('OAuth state parameter already used', {
                projectId,
                ip: req.ip || req.connection.remoteAddress || 'unknown'
            });
            return res.status(400).json({
                success: false,
                message: "Invalid or expired state parameter"
            });
        }
        // Marcar state como usado
        usedStates.set(projectId, Date.now());
        // Validar que el proyecto está configurado
        if (!configService_1.ConfigService.isProductConfigured(projectId)) {
            logger_1.logger.error('OAuth callback for unconfigured project', { projectId });
            const errorUrl = configService_1.ConfigService.getErrorUrl(projectId, 'project_not_configured');
            return res.redirect(errorUrl);
        }
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
            await (0, crypto_1.validateEncryptionKey)();
        }
        catch (error) {
            logger_1.logger.error('ENCRYPTION_KEY validation failed', { projectId }, error instanceof Error ? error : new Error(String(error)));
            const errorUrl = configService_1.ConfigService.getErrorUrl(projectId, 'encryption_failed');
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
            logger_1.logger.info('Creating admin session', { projectId });
            const sessionToken = await (0, check_1.createAdminSession)(authenticatedEmail, projectId);
            logger_1.logger.info('Admin session created', { projectId });
            // Redirigir directamente al admin panel
            const adminUrl = configService_1.ConfigService.getAdminUrl(projectId, sessionToken);
            logger_1.logger.info('Redirecting to admin panel', { projectId });
            return res.redirect(adminUrl);
        }
        catch (error) {
            logger_1.logger.error('Error in folder creation or data saving', { projectId }, error instanceof Error ? error : new Error(String(error)));
            // En caso de error, redirigir a una página de error
            const errorUrl = configService_1.ConfigService.getErrorUrl(projectId, 'auth_failed');
            return res.redirect(errorUrl);
        }
    }
    catch (error) {
        const projectId = req.query.state || 'unknown';
        logger_1.logger.error('OAuth callback general error', { projectId }, error instanceof Error ? error : new Error(String(error)));
        // En caso de error general, redirigir a login
        const errorUrl = configService_1.ConfigService.getErrorUrl('onboardingaudit', 'oauth_failed');
        return res.redirect(errorUrl);
    }
    finally {
        const projectId = req.query.state || 'unknown';
        logger_1.logger.endOperation('oauth_callback', { projectId });
    }
};
exports.callback = callback;
