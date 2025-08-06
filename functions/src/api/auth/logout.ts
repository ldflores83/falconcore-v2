// functions/src/api/auth/logout.ts

import { Request, Response } from "express";
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

export const logout = async (req: Request, res: Response) => {
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
        message: "Access denied. Only authorized administrators can logout."
      });
    }

    const db = getFirestore();

    // Si se proporciona un sessionToken, eliminarlo
    if (sessionToken) {
      await db.collection('admin_sessions').doc(sessionToken).delete();
      console.log('✅ Session token deleted:', sessionToken);
    }

    // Eliminar credenciales OAuth de Firestore
    await db.collection('oauth_credentials').doc(userId).delete();

    console.log('✅ OAuth logout successful:', {
      userId,
      projectId,
      sessionToken: sessionToken || 'none'
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error('❌ Error in OAuth logout:', error);
    
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 