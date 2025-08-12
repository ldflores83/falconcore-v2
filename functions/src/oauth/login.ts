// functions/src/oauth/login.ts

import { Request, Response } from 'express';
import { google } from 'googleapis';
import { getOAuthConfig } from '../config';

export const login = async (req: Request, res: Response) => {
  try {
    console.log('🔐 OAuth Login: Starting OAuth login process...');
    const { project_id } = req.query;

    if (!project_id) {
      console.log('❌ OAuth Login: Missing project_id parameter');
      return res.status(400).json({
        success: false,
        message: "Missing project_id parameter"
      });
    }

    console.log('🔐 OAuth Login: Project ID:', project_id);

    // Configurar OAuth2
    console.log('🔐 OAuth Login: Getting OAuth config...');
    const oauthConfig = await getOAuthConfig();
    console.log('🔐 OAuth Login: OAuth config retrieved:', {
      hasClientId: !!oauthConfig.clientId,
      hasClientSecret: !!oauthConfig.clientSecret,
      redirectUri: oauthConfig.redirectUri
    });
    
    const oauth2Client = new google.auth.OAuth2(
      oauthConfig.clientId,
      oauthConfig.clientSecret,
      oauthConfig.redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive.file', // Solo archivos creados por la app
      'https://www.googleapis.com/auth/userinfo.email' // Solo para obtener el email
    ];

    console.log('🔐 OAuth Login: Generating auth URL with scopes:', scopes);

    // Generar URL de autorización
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: project_id as string
    });

    console.log('✅ OAuth Login: Auth URL generated successfully');
    console.log('🔐 OAuth Login: Auth URL:', authUrl);

    return res.status(200).json({
      success: true,
      message: "OAuth login URL generated",
      data: {
        authUrl,
        projectId: project_id
      }
    });

  } catch (error) {
    console.error('❌ OAuth Login: Error generating auth URL:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate OAuth login URL",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
