// functions/src/oauth/callback.ts

import { Request, Response } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { StorageProviderFactory } from '../storage/utils/providerFactory';
import { getOAuthConfig } from './oauth_projects';
import { saveOAuthData } from './saveOAuthData';
import { getUserInfoFromToken } from './oauth_projects';
import { createAdminSession } from '../api/auth/check';
import { generateClientId } from '../utils/hash';
import { validateEncryptionKey } from '../utils/crypto';
import { ConfigService } from '../services/configService';
import { logger } from '../utils/logger';
import { rateLimiter } from '../utils/rateLimiter';

// Cache para validar state parameters (prevenir replay attacks)
const usedStates = new Map<string, number>();
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

export const callback = async (req: Request, res: Response) => {
  try {
    logger.startOperation('oauth_callback', {
      projectId: req.query.state as string,
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    });

    const { code, state } = req.query;

    if (!code || !state) {
      logger.error('OAuth callback missing parameters', {
        projectId: req.query.state as string
      });
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: code and state"
      });
    }

    const projectId = state as string;
    
    // Validar rate limiting
    const rateLimitKey = {
      projectId,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      endpoint: '/oauth/callback'
    };
    
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      logger.security('Rate limit exceeded for OAuth callback', {
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
      logger.security('OAuth state parameter already used', {
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
    if (!ConfigService.isProductConfigured(projectId)) {
      logger.error('OAuth callback for unconfigured project', { projectId });
      const errorUrl = ConfigService.getErrorUrl(projectId, 'project_not_configured');
      return res.redirect(errorUrl);
    }

    // Configurar OAuth2
    const oauthConfig = await getOAuthConfig();
    
    const oauth2Client = new google.auth.OAuth2(
      oauthConfig.clientId,
      oauthConfig.clientSecret,
      oauthConfig.redirectUri
    );

    // Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    
    if (!tokens.access_token) {
      throw new Error("Failed to get access token");
    }

    // 🔐 VALIDATE ENCRYPTION_KEY IMMEDIATELY AFTER RECEIVING TOKENS
    // This prevents any Drive operations if encryption is not properly configured
    try {
      await validateEncryptionKey();
    } catch (error) {
      logger.error('ENCRYPTION_KEY validation failed', { projectId }, error instanceof Error ? error : new Error(String(error)));
      const errorUrl = ConfigService.getErrorUrl(projectId, 'encryption_failed');
      return res.redirect(errorUrl);
    }

    // Obtener información real del usuario autenticado
    const userInfo = await getUserInfoFromToken(tokens);
    const authenticatedEmail = userInfo.email;

    if (!authenticatedEmail) {
      throw new Error("Could not retrieve user email from OAuth");
    }

    // Generar clientId único basado en email y projectId
    const clientId = generateClientId(authenticatedEmail, projectId);

    // Crear provider y probar conexión
    const provider = StorageProviderFactory.createProvider('google');
    
    try {
      // Verificar si ya existe la carpeta de trabajo
      const folderName = `${projectId}_${authenticatedEmail}`;
      
      let folderId = await provider.findOrCreateFolder(
        folderName,
        projectId,
        tokens.access_token,
        tokens.refresh_token || undefined
      );
      
      // Guardar datos OAuth en Firestore usando clientId como clave
      await saveOAuthData({
        clientId,
        projectId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expiry_date || undefined,
        folderId,
        email: authenticatedEmail
      });
      
      // Crear sesión de administrador
      logger.info('Creating admin session', { projectId });
      const sessionToken = await createAdminSession(authenticatedEmail, projectId);
      logger.info('Admin session created', { projectId });
      
      // Redirigir directamente al admin panel
      const adminUrl = ConfigService.getAdminUrl(projectId, sessionToken);
      logger.info('Redirecting to admin panel', { projectId });
      
      return res.redirect(adminUrl);
      
    } catch (error) {
      logger.error('Error in folder creation or data saving', { projectId }, error instanceof Error ? error : new Error(String(error)));
      // En caso de error, redirigir a una página de error
      const errorUrl = ConfigService.getErrorUrl(projectId, 'auth_failed');
      return res.redirect(errorUrl);
    }
    
  } catch (error) {
    const projectId = req.query.state as string || 'unknown';
    logger.error('OAuth callback general error', { projectId }, error instanceof Error ? error : new Error(String(error)));
    // En caso de error general, redirigir a login
    const errorUrl = ConfigService.getErrorUrl('onboardingaudit', 'oauth_failed');
    return res.redirect(errorUrl);
  } finally {
    const projectId = req.query.state as string || 'unknown';
    logger.endOperation('oauth_callback', { projectId });
  }
};

