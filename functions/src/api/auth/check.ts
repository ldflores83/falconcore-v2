// functions/src/api/auth/check.ts

import { Request, Response } from 'express';
import { getOAuthCredentials } from '../../oauth/getOAuthCredentials';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { generateClientId } from '../../utils/hash';
import { isProjectAdmin } from '../../config/projectAdmins';

export const createAdminSession = async (email: string, projectId: string): Promise<string> => {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const clientId = generateClientId(email, projectId);
  
  console.log('🔐 createAdminSession: Creating session for:', { email, projectId, clientId, sessionToken });
  
  const sessionData = {
    clientId,
    projectId,
    email,
    createdAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + (24 * 60 * 60 * 1000)), // 24 horas
    userAgent: 'admin-session',
    ipAddress: 'admin-creation'
  };
  
  console.log('🔐 createAdminSession: Session data to save:', sessionData);
  
  await admin.firestore().collection('admin_sessions').doc(sessionToken).set(sessionData);
  console.log('✅ createAdminSession: Session saved to Firestore successfully');
  
  return sessionToken;
};

export const check = async (req: Request, res: Response) => {
  try {
    console.log('🔐 check: Request received:', { 
      body: req.body, 
      hasProjectId: !!req.body.projectId,
      hasClientId: !!req.body.clientId,
      hasSessionToken: !!req.body.sessionToken
    });
    
    const { projectId, clientId, sessionToken } = req.body;

    if (!projectId) {
      console.log('❌ check: Missing projectId');
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: projectId"
      });
    }

    // Si hay sessionToken, verificar la sesión de administrador
    if (sessionToken) {
      console.log('🔐 check: Checking session with token:', sessionToken);
      
      const sessionDoc = await admin.firestore().collection('admin_sessions').doc(sessionToken).get();
      
      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();
        console.log('🔐 check: Session found:', sessionData);
        
        const now = admin.firestore.Timestamp.now();
        
        // Verificar que la sesión no ha expirado
        if (sessionData?.expiresAt && sessionData.expiresAt.toMillis() > now.toMillis()) {
          console.log('🔐 check: Session not expired, checking admin permissions');
          
          // Verificar que el usuario es admin del proyecto
          if (isProjectAdmin(sessionData.email, sessionData.projectId) && sessionData.projectId === projectId) {
            console.log('✅ check: Admin session verified successfully');
            return res.status(200).json({
              success: true,
              message: "Admin session verified",
              email: sessionData.email,
              projectId: sessionData.projectId,
              clientId: sessionData.clientId,
              sessionToken
            });
          } else {
            console.log('❌ check: Admin permissions check failed:', { 
              email: sessionData.email, 
              projectId: sessionData.projectId,
              isAdmin: isProjectAdmin(sessionData.email, sessionData.projectId),
              projectMatch: sessionData.projectId === projectId
            });
          }
        } else {
          console.log('❌ check: Session expired, deleting');
          // Sesión expirada, eliminarla
          await admin.firestore().collection('admin_sessions').doc(sessionToken).delete();
        }
      } else {
        console.log('❌ check: Session not found in Firestore');
      }
    } else {
      console.log('🔐 check: No sessionToken provided');
    }

    // Si no hay sessionToken válido, verificar credenciales OAuth
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: clientId"
      });
    }

    // Obtener credenciales OAuth
    const credentials = await getOAuthCredentials(clientId);
    
    if (!credentials) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first."
      });
    }

    // Verificar que el token es válido
    if (!credentials.accessToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again."
      });
    }

    // Verificar que el usuario es admin del proyecto
    if (!isProjectAdmin(credentials.email, credentials.projectId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized as an administrator for this project."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authentication verified",
      email: credentials.email,
      projectId: credentials.projectId
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication check failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}; 