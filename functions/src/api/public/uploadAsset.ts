// /functions/src/api/public/uploadAsset.ts

import { Request, Response } from "express";
import { uploadToStorage } from "../../services/storage";
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

interface UploadAssetRequest {
  submissionId: string;
  folderId: string;
  projectId?: string;
  userEmail: string;
  files: Array<{
    filename: string;
    content: string; // Base64 encoded
    mimeType: string;
    size: number;
  }>;
}

interface UploadAssetResponse {
  success: boolean;
  fileIds?: string[];
  totalSize?: number;
  message: string;
}

export const uploadAsset = async (req: Request, res: Response) => {
  try {
    console.log('🔍 uploadAsset handler called with body:', JSON.stringify(req.body, null, 2));
    
    const { submissionId, folderId, projectId, userEmail, files }: UploadAssetRequest = req.body;

    // Validaciones básicas
    console.log('🔍 Validating required fields:', {
      submissionId: !!submissionId,
      folderId: !!folderId,
      userEmail: !!userEmail,
      files: !!files,
      filesLength: files?.length || 0
    });
    
    if (!submissionId || !folderId || !userEmail || !files || files.length === 0) {
      const missingFields = [];
      if (!submissionId) missingFields.push('submissionId');
      if (!folderId) missingFields.push('folderId');
      if (!userEmail) missingFields.push('userEmail');
      if (!files || files.length === 0) missingFields.push('files');
      
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validar límite de tamaño total (10MB) y archivos individuales (10MB)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 10 * 1024 * 1024; // 10MB total
    const maxIndividualSize = 10 * 1024 * 1024; // 10MB por archivo

    // Validar archivos individuales
    const oversizedFiles = files.filter(file => file.size > maxIndividualSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.filename).join(', ');
      return res.status(400).json({
        success: false,
        message: `File(s) exceed 10MB limit: ${fileNames}. Please compress or split large files.`
      });
    }

    // Validar tamaño total
    if (totalSize > maxTotalSize) {
      const totalMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
      return res.status(400).json({
        success: false,
        message: `Total file size (${totalMB}MB) exceeds 10MB limit. Please reduce file sizes or upload fewer files.`
      });
    }

    console.log('File upload received:', {
      submissionId,
      folderId,
      userEmail,
      filesCount: files.length,
      totalSize,
      timestamp: new Date().toISOString(),
    });

    // Subir archivos a Cloud Storage y guardar referencias en Firestore
    console.log('🔧 Uploading files to Cloud Storage...');
    
    try {
      const uploadedFiles = [];
      const filePaths = [];
      const db = getFirestore();

      for (const file of files) {
        // Decodificar contenido Base64
        const contentBuffer = Buffer.from(file.content, 'base64');
        
        // Generar ruta única para el archivo en Cloud Storage
        const filePath = `submissions/${submissionId}/attachments/${Date.now()}_${file.filename}`;
        
        // Subir archivo a Cloud Storage
        const storageUrl = await uploadToStorage(
          'falconcore-onboardingaudit-uploads',
          filePath,
          contentBuffer,
          file.mimeType
        );

        uploadedFiles.push({
          filename: file.filename,
          filePath: filePath,
          storageUrl: storageUrl,
          size: file.size,
          mimeType: file.mimeType
        });
        
        filePaths.push(filePath);

        console.log('✅ File uploaded to Cloud Storage:', {
          filename: file.filename,
          filePath: filePath,
          storageUrl: storageUrl,
          size: file.size
        });
      }

      // Actualizar Firestore con las referencias de los archivos
      const docRef = db.collection('onboardingaudit_submissions').doc(submissionId);
      await docRef.update({
        hasAttachments: true,
        attachments: uploadedFiles,
        updatedAt: new Date()
      });

      console.log('✅ Files uploaded successfully and Firestore updated:', {
        submissionId,
        filesCount: uploadedFiles.length,
        totalSize,
        filePaths
      });

      // Respuesta exitosa
      const response: UploadAssetResponse = {
        success: true,
        fileIds: filePaths, // Usar filePaths como IDs
        totalSize,
        message: `Successfully uploaded ${files.length} file(s) to Cloud Storage`,
      };

      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ Error uploading files:', error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to upload files to Google Drive. Please try again later.",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error("❌ Error in uploadAsset:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}; 