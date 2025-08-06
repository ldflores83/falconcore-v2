// functions/src/oauth/callback.ts

import { Request, Response } from "express";
import { google } from 'googleapis';
import { StorageProviderFactory } from '../storage/utils/providerFactory';
import { getUserInfoFromToken } from './oauth_projects';
import { saveOAuthData } from './saveOAuthData';
import { getOAuthConfig } from '../config';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

export const callback = async (req: Request, res: Response) => {
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
    const projectId = state as string;
    console.log('🔧 Project ID from state:', projectId);

    // Configurar OAuth2
    console.log('🔧 Getting OAuth config...');
    const oauthConfig = await getOAuthConfig();
    console.log('🔧 OAuth config obtained:', {
      hasClientId: !!oauthConfig.clientId,
      hasClientSecret: !!oauthConfig.clientSecret,
      redirectUri: oauthConfig.redirectUri
    });
    
    const oauth2Client = new google.auth.OAuth2(
      oauthConfig.clientId,
      oauthConfig.clientSecret,
      oauthConfig.redirectUri
    );

    // Intercambiar código por tokens
    console.log('🔧 Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code as string);
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
    const userInfo = await getUserInfoFromToken(tokens);
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
    const provider = StorageProviderFactory.createProvider('google');
    
    try {
      // Probar creación de carpeta con el email real del usuario
      console.log('🔧 Creating folder in Google Drive...');
      
      // Pasar los tokens directamente al provider en lugar de usar Firestore
      const folderId = await provider.createFolderWithTokens(
        authenticatedEmail, 
        projectId, 
        tokens.access_token,
        tokens.refresh_token || undefined
      );
      
      console.log('🔧 Folder created:', folderId);
      
      // Guardar datos OAuth en Firestore
      console.log('🔧 Saving OAuth data to Firestore...');
      const userId = `${authenticatedEmail}_${projectId}`;
      await saveOAuthData({
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

    } catch (error) {
      console.error('❌ Error testing provider after OAuth:', error);
      
      return res.status(500).json({
        success: false,
        message: "OAuth successful but provider test failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('❌ Error in OAuth callback:', error);
    console.error('❌ Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack
    });
    
    return res.status(500).json({
      success: false,
      message: "OAuth callback failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
