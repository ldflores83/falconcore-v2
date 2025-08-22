// functions/src/api/admin/cleanupSessions.ts

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../services/configService';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2'
    });
  }
  return admin.firestore();
};

export const cleanupSessions = async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId and userId"
      });
    }

    // Validar que el proyecto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project configuration"
      });
    }

    // Validar que las características necesarias estén habilitadas
    if (!ConfigService.isFeatureEnabled(projectId, 'adminPanel')) {
      return res.status(400).json({
        success: false,
        message: "Admin panel is not enabled for this project"
      });
    }

    // Verificar que el userId corresponde al email autorizado
    if (!userId.includes('luisdaniel883@gmail.com')) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can cleanup sessions."
      });
    }

    const db = getFirestore();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    // Buscar sesiones expiradas
    const collectionName = ConfigService.getCollectionName(projectId, 'admin_sessions');
    const sessionsRef = db.collection(collectionName);
    const expiredSessions = await sessionsRef
      .where('expiresAt', '<', admin.firestore.Timestamp.fromMillis(now))
      .get();

    const deletedCount = expiredSessions.size;
    
    // Eliminar sesiones expiradas
    const deletePromises = expiredSessions.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log('✅ Cleanup sessions successful:', {
      projectId,
      userId,
      deletedCount
    });

    return res.status(200).json({
      success: true,
      message: "Sessions cleanup completed",
      deletedCount
    });

  } catch (error) {
    console.error('❌ Error in sessions cleanup:', error);
    
    return res.status(500).json({
      success: false,
      message: "Sessions cleanup failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 