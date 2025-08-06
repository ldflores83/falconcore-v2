// functions/src/api/auth/check.ts

import { Request, Response } from 'express';
import { getOAuthCredentials, getValidAccessToken } from '../../oauth/getOAuthCredentials';
import * as admin from 'firebase-admin';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2'
    });
  }
  return admin.firestore();
};

export const check = async (req: Request, res: Response) => {
  try {
    const { projectId, userId, sessionToken } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId and userId"
      });
    }

    // Verificar que el userId corresponde al email autorizado
    if (!userId.includes('luisdaniel883@gmail.com')) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can access this panel."
      });
    }

    // Si se proporciona un sessionToken, validarlo primero
    if (sessionToken) {
      const db = getFirestore();
      const sessionDoc = await db.collection('admin_sessions').doc(sessionToken).get();
      
      if (!sessionDoc.exists) {
        console.log('❌ Invalid session token:', sessionToken);
        return res.status(401).json({
          success: false,
          message: "Invalid session. Please login again.",
          requiresLogin: true
        });
      }

      const sessionData = sessionDoc.data();
      if (!sessionData || sessionData.userId !== userId || sessionData.projectId !== projectId) {
        console.log('❌ Session token mismatch:', { sessionToken, userId, projectId });
        return res.status(401).json({
          success: false,
          message: "Session mismatch. Please login again.",
          requiresLogin: true
        });
      }

      // Verificar que la sesión no haya expirado (24 horas)
      const sessionAge = Date.now() - sessionData.createdAt.toMillis();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      
      if (sessionAge > maxAge) {
        console.log('❌ Session expired:', sessionToken);
        await db.collection('admin_sessions').doc(sessionToken).delete();
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
          requiresLogin: true
        });
      }

      console.log('✅ Session token valid:', { sessionToken, userId, projectId });
      return res.status(200).json({
        success: true,
        message: "Authentication verified",
        email: 'luisdaniel883@gmail.com',
        projectId,
        sessionToken
      });
    }

    // Si no hay sessionToken, requerir login (NO fallback a OAuth)
    console.log('❌ No session token provided, requiring login');
    return res.status(401).json({
      success: false,
      message: "No valid session. Please login first.",
      requiresLogin: true
    });

  } catch (error) {
    console.error('❌ Error in OAuth check:', error);
    
    return res.status(500).json({
      success: false,
      message: "Authentication check failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 