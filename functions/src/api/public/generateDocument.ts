// /functions/src/api/public/generateDocument.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { google } from "googleapis";
import { getValidAccessToken } from "../../oauth/getOAuthCredentials";

interface GenerateDocumentRequest {
  projectId?: string;
  templateId: string;
  filename: string;
  data: Record<string, any>;
}

interface GenerateDocumentResponse {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  message: string;
}

export const generateDocument = async (req: Request, res: Response) => {
  try {
    const { projectId, templateId, filename, data }: GenerateDocumentRequest = req.body;

    // Validaciones básicas
    if (!templateId || !filename || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: templateId, filename, and data"
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

    // Crear carpeta para el proyecto
    const folderId = await storageProvider.createFolder('onboardingaudit', projectIdFinal);

    // Verificar que el template existe
    try {
      await drive.files.get({
        fileId: templateId,
        fields: "id,name,mimeType",
      });
    } catch (templateError) {
      return res.status(404).json({
        success: false,
        message: "Template not found or access denied"
      });
    }

    // Generar documento desde template
    const document = await storageProvider.createDocumentFromTemplate({
      templateId,
      folderId,
      filename,
      data,
    });

    // Respuesta exitosa
    const response: GenerateDocumentResponse = {
      success: true,
      documentId: document.id,
      documentUrl: document.webViewLink,
      message: "Document generated successfully",
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in generateDocument:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}; 