// /functions/src/api/public/uploadAsset.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { getOAuthCredentials, getValidAccessToken } from "../../oauth/getOAuthCredentials";

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

    // Validar límite de tamaño total (10MB) y archivos individuales (5MB)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 10 * 1024 * 1024; // 10MB total
    const maxIndividualSize = 5 * 1024 * 1024; // 5MB por archivo

    // Validar archivos individuales
    const oversizedFiles = files.filter(file => file.size > maxIndividualSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.filename).join(', ');
      return res.status(400).json({
        success: false,
        message: `File(s) exceed 5MB limit: ${fileNames}. Please compress or split large files.`
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

    // Usar credenciales del administrador para subir archivos
    const adminEmail = 'luisdaniel883@gmail.com';
    const adminUserId = `${adminEmail}_${projectId || 'onboardingaudit'}`;
    
    // Obtener access token válido (con refresh automático si es necesario)
    const accessToken = await getValidAccessToken(adminUserId);
    
    if (!accessToken) {
      console.log('⚠️ No valid OAuth credentials found for admin:', adminUserId);
      return res.status(401).json({
        success: false,
        message: "Admin OAuth authentication required. Please setup admin credentials first.",
      });
    }
    
    // Obtener credenciales completas para el refresh token
    const credentials = await getOAuthCredentials(adminUserId);
    if (!credentials) {
      console.log('⚠️ No OAuth credentials found for admin:', adminUserId);
      return res.status(401).json({
        success: false,
        message: "Admin OAuth authentication required. Please setup admin credentials first.",
      });
    }

    // Subir archivos a Google Drive usando credenciales del administrador
    console.log('🔧 Uploading files to Google Drive with admin credentials...');
    const provider = new GoogleDriveProvider();
    
    try {
      const uploadedFiles = [];
      const fileIds = [];

      for (const file of files) {
        // Decodificar contenido Base64
        const contentBuffer = Buffer.from(file.content, 'base64');
        
        // Subir archivo a la carpeta del formulario usando credenciales del administrador
        const uploadedFile = await provider.uploadFileWithTokens({
          folderId: folderId,
          filename: file.filename,
          contentBuffer: contentBuffer,
          mimeType: file.mimeType,
          accessToken: accessToken, // Usar el token refrescado
          refreshToken: credentials.refreshToken
        });

        uploadedFiles.push(uploadedFile);
        fileIds.push(uploadedFile.id);

        console.log('✅ File uploaded with admin credentials:', {
          filename: file.filename,
          fileId: uploadedFile.id,
          size: uploadedFile.size,
          webViewLink: uploadedFile.webViewLink
        });
      }

      console.log('✅ Files uploaded successfully:', {
        submissionId,
        filesCount: uploadedFiles.length,
        totalSize,
        fileIds
      });

      // Respuesta exitosa
      const response: UploadAssetResponse = {
        success: true,
        fileIds,
        totalSize,
        message: `Successfully uploaded ${files.length} file(s) to Google Drive`,
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