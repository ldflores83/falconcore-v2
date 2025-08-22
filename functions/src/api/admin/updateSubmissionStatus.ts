import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../services/configService';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2',
    });
  }
  return admin.firestore();
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { projectId, userId, submissionId, newStatus } = req.body;

    if (!projectId || !submissionId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId, submissionId, and newStatus"
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

    // Validar que el nuevo estado sea válido según el flujo
    const validStatuses = ['pending', 'synced', 'in_progress', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Obtener el documento actual para verificar el estado actual
    const db = getFirestore();
    const collectionName = ConfigService.getCollectionName(projectId, 'submissions');
    const docRef = db.collection(collectionName).doc(submissionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    const currentData = doc.data();
    const currentStatus = currentData?.status;

    // Validar transiciones de estado permitidas
    const allowedTransitions: Record<string, string[]> = {
      'pending': ['synced'], // pending solo puede ir a synced (via processSubmissions)
      'synced': ['in_progress'], // synced solo puede ir a in_progress
      'in_progress': ['completed'], // in_progress solo puede ir a completed
      'completed': [], // completed es estado final
      'error': ['pending'] // TEMPORAL: permitir resetear errores a pending
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedTransitions[currentStatus]?.join(', ') || 'none'}`
      });
    }

    // Actualizar estado en Firestore
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };

    if (userId) {
      updateData.updatedBy = userId;
    }

    // Agregar campos específicos según el estado
    if (newStatus === 'in_progress') {
      updateData.startedAt = new Date();
    }

    if (newStatus === 'completed') {
      // Si el estado es 'completed', borrar el documento de Firestore
      // porque la fuente de verdad ahora es Google Drive
      await docRef.delete();
      
      return res.status(200).json({
        success: true,
        message: `Submission completed and deleted from database. Work continues in Google Drive.`,
        submissionId,
        newStatus
      });
    } else {
      // Para otros estados, actualizar normalmente
      await docRef.update(updateData);

      return res.status(200).json({
        success: true,
        message: `Submission status updated to: ${newStatus}`,
        submissionId,
        newStatus
      });
    }

  } catch (error) {
    console.error('Error in updateSubmissionStatus:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to update submission status",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 