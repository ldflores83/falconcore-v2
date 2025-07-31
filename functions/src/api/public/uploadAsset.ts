// /functions/src/api/public/uploadAsset.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { google } from "googleapis";
import { getValidAccessToken } from "../../oauth/getOAuthCredentials";

interface UploadAssetRequest {
  submissionId: string;
  projectId?: string;
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
    const { submissionId, projectId, files }: UploadAssetRequest = req.body;

    // Validaciones básicas
    if (!submissionId || !files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: submissionId and files"
      });
    }

    // Validar límite de tamaño total (10MB)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (totalSize > maxSize) {
      return res.status(400).json({
        success: false,
        message: `Total file size (${Math.round(totalSize / 1024 / 1024 * 100) / 100}MB) exceeds 10MB limit`
      });
    }

    // Obtener credenciales OAuth del usuario registrado (tu cuenta)
    const userId = process.env.ONBOARDING_AUDIT_USER_ID || 'default_user';
    const projectIdFinal = projectId || 'onboardingaudit';
    
    const accessToken = await getValidAccessToken(userId, projectIdFinal);
    if (!accessToken) {
      console.error("No valid OAuth credentials found for onboarding audit");
      return res.status(500).json({
        success: false,
        message: "Service not configured properly. Please contact support."
      });
    }

    // Configurar Google APIs con tus credenciales
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const slides = google.slides({ version: 'v1', auth: oauth2Client });

    // Crear provider de storage con tus credenciales
    const storageProvider = new GoogleDriveProvider(accessToken, drive, docs, slides);

    // Buscar la carpeta de submission usando el submissionId
    const submissionFolders = await drive.files.list({
      q: `name contains '${submissionId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id,name)",
    });

    if (!submissionFolders.data.files || submissionFolders.data.files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission folder not found. Please submit the form first."
      });
    }

    const submissionFolderId = submissionFolders.data.files[0].id!;

    // Subir cada archivo
    const fileIds: string[] = [];
    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Decodificar contenido Base64
        const contentBuffer = Buffer.from(file.content, 'base64');

        // Validar tipo MIME
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'application/json'
        ];

        if (!allowedMimeTypes.includes(file.mimeType)) {
          console.warn(`Skipping file ${file.filename}: unsupported MIME type ${file.mimeType}`);
          continue;
        }

        // Subir archivo
        const uploadedFile = await storageProvider.uploadFile({
          folderId: submissionFolderId,
          filename: file.filename,
          contentBuffer,
          mimeType: file.mimeType,
        });

        fileIds.push(uploadedFile.id);
        uploadedFiles.push({
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: uploadedFile.size,
          webViewLink: uploadedFile.webViewLink,
        });

      } catch (fileError) {
        console.error(`Error uploading file ${file.filename}:`, fileError);
        // Continuar con otros archivos
      }
    }

    if (fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded successfully"
      });
    }

    // Respuesta exitosa
    const response: UploadAssetResponse = {
      success: true,
      fileIds,
      totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
      message: `Successfully uploaded ${fileIds.length} file(s)`,
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in uploadAsset:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}; 