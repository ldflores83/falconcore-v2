// functions/src/oauth/logout.ts

import { Request, Response } from "express";
import * as admin from 'firebase-admin';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    // Inicializar Firebase sin credenciales de servicio automáticas
    // para evitar conflictos con OAuth
    admin.initializeApp({
      projectId: 'falconcore-v2',
      // No especificar credential para usar la autenticación por defecto
      // que funciona mejor con OAuth
    });
  }
  return admin.firestore();
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.body;

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

    // Eliminar credenciales OAuth de Firestore
    const db = getFirestore();
    await db.collection('oauth_credentials').doc(userId).delete();

    console.log('✅ OAuth logout successful:', {
      userId,
      projectId
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