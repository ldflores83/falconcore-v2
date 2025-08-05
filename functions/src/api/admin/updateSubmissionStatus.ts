import { Request, Response } from 'express';
import { getOAuthCredentials } from '../../oauth/getOAuthCredentials';
import * as admin from 'firebase-admin';

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
  console.log('🚀 updateSubmissionStatus handler called');
  
  try {
    const { projectId, userId, submissionId, newStatus } = req.body;

    if (!projectId || !userId || !submissionId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId, userId, submissionId, and newStatus"
      });
    }

    // Verificar autenticación del admin
    if (!userId.includes('luisdaniel883@gmail.com')) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can update submission status."
      });
    }

    // Obtener credenciales OAuth del admin
    const credentials = await getOAuthCredentials(userId);
    
    if (!credentials) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first.",
        requiresLogin: true
      });
    }

    // Validar que el nuevo estado sea válido
    const validStatuses = ['pending', 'synced', 'in_progress', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    console.log(`🔄 Updating submission ${submissionId} status to: ${newStatus}`);

    // Actualizar estado en Firestore
    const db = getFirestore();
    const docRef = db.collection('onboardingaudit_submissions').doc(submissionId);
    
    if (newStatus === 'completed') {
      // Si el estado es 'completed', borrar el documento de Firestore
      console.log(`🗑️ Deleting submission ${submissionId} from Firestore (completed)`);
      await docRef.delete();
      
      console.log(`✅ Submission ${submissionId} deleted from Firestore (completed)`);
      
      return res.status(200).json({
        success: true,
        message: `Submission completed and deleted from database`,
        submissionId,
        newStatus
      });
    } else {
      // Para otros estados, actualizar normalmente
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: userId
      };

      // Agregar campos específicos según el estado
      if (newStatus === 'in_progress') {
        updateData.startedAt = new Date();
      }

      await docRef.update(updateData);

      console.log(`✅ Submission ${submissionId} status updated to: ${newStatus}`);

      return res.status(200).json({
        success: true,
        message: `Submission status updated to: ${newStatus}`,
        submissionId,
        newStatus
      });
    }

  } catch (error) {
    console.error('❌ Error in updateSubmissionStatus:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to update submission status",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 