// functions/src/api/admin/updateStatus.ts

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { StorageProviderFactory } from '../../storage/utils/providerFactory';

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { submissionId, newStatus, projectId } = req.body;

    if (!submissionId || !newStatus || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: submissionId, newStatus, projectId"
      });
    }

    // Validar status permitidos
    const allowedStatuses = ['pending', 'processing', 'completed', 'error', 'cancelled'];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: pending, processing, completed, error, cancelled"
      });
    }

    // Obtener la submission
    const submissionRef = admin.firestore().collection('submissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    const submission = submissionDoc.data();

    // Si el nuevo status es 'completed', procesar archivos
    if (newStatus === 'completed' && submission?.files && submission.files.length > 0) {
      try {
        const provider = StorageProviderFactory.createProvider('google');
        
        // Crear carpeta si no existe
        let folderId = submission.folderId;
        if (!folderId) {
          folderId = await provider.createFolder(submission.userEmail, projectId);
        }

        // Subir archivos usando la interfaz estándar
        for (const file of submission.files) {
          try {
            await provider.uploadFile({
              folderId,
              filename: file.filename,
              contentBuffer: Buffer.from(file.content, 'base64'),
              mimeType: file.mimeType
            });
          } catch (fileError) {
            console.error(`❌ Error uploading file ${file.filename}:`, fileError);
          }
        }

        // Actualizar con folderId
        await submissionRef.update({
          status: newStatus,
          folderId,
          updatedAt: admin.firestore.Timestamp.now()
        });

      } catch (error) {
        console.error('❌ Error processing files:', error);
        
        // Marcar como error si falla el procesamiento
        await submissionRef.update({
          status: 'error',
          errorMessage: 'Failed to process files',
          updatedAt: admin.firestore.Timestamp.now()
        });

        return res.status(500).json({
          success: false,
          message: "Failed to process files",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } else {
      // Actualizar status sin procesar archivos
      await submissionRef.update({
        status: newStatus,
        updatedAt: admin.firestore.Timestamp.now()
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: {
        submissionId,
        newStatus,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}; 