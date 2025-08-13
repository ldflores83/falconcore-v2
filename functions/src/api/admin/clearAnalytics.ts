// functions/src/api/admin/clearAnalytics.ts

import { Request, Response } from 'express';
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

export const clearAnalytics = async (req: Request, res: Response) => {
  try {
    console.log('🔍 clearAnalytics function called');
    
    const { projectId } = req.body;
    console.log('🔍 projectId:', projectId);

    if (!projectId) {
      console.log('❌ Missing projectId');
      return res.status(400).json({
        success: false,
        message: "Missing projectId parameter"
      });
    }

    // Verificar que el userId corresponde al email autorizado
    const { userId } = req.body;
    console.log('🔍 userId:', userId);
    
    if (!userId || !userId.includes('luisdaniel883@gmail.com')) {
      console.log('❌ Access denied');
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can clear analytics."
      });
    }

    console.log('✅ Authorization passed, proceeding with clear operation');
    
    // Por ahora, solo devolver éxito sin hacer nada
    return res.status(200).json({
      success: true,
      message: "Analytics data cleared successfully (test mode)",
      data: {
        deletedVisits: 0,
        deletedStats: 0
      }
    });

  } catch (error) {
    console.error('❌ Error clearing analytics:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to clear analytics",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 