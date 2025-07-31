// /functions/src/api/public/receiveForm.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { google } from "googleapis";
import { getValidAccessToken } from "../../oauth/getOAuthCredentials";

// Tipos para el formulario de onboarding audit
interface OnboardingAuditForm {
  // Section 1 - Product Basics
  productName: string;
  productUrl: string;
  targetUser: string;
  
  // Section 2 - Current Onboarding Flow
  signupMethod: string;
  signupMethodOther?: string;
  firstTimeExperience: string;
  firstTimeExperienceOther?: string;
  trackDropoff: string;
  
  // Section 3 - Goal & Metrics
  mainGoal: string;
  knowChurnRate: string;
  churnTiming: string;
  specificConcerns?: string;
  
  // Section 4 - Delivery
  email: string;
  preferredFormat: 'Google Doc' | 'Google Slides';
  
  // Metadata
  projectId?: string;
  clientId?: string;
  timestamp?: Date;
}

interface ReceiveFormRequest {
  formData: OnboardingAuditForm;
  projectId?: string;
  clientId?: string;
}

interface ReceiveFormResponse {
  success: boolean;
  submissionId?: string;
  folderId?: string;
  formFileId?: string;
  documentId?: string;
  documentUrl?: string;
  message: string;
}

export const receiveForm = async (req: Request, res: Response) => {
  try {
    const { formData, projectId, clientId }: ReceiveFormRequest = req.body;

    // Validaciones básicas
    if (!formData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: formData"
      });
    }

    if (!formData.email || !formData.productName) {
      return res.status(400).json({
        success: false,
        message: "Missing required form fields: email and productName"
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

    // Generar IDs únicos
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientIdFinal = clientId || formData.email.split('@')[0];

    // Crear carpeta organizada por el email del formulario (pero usando tus credenciales)
    const folderId = await storageProvider.createFolder(formData.email, projectIdFinal);

    // Crear subcarpeta para este submission específico
    const submissionFolderName = `${submissionId}_${formData.productName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Crear subcarpeta
    const submissionFolder = await drive.files.create({
      requestBody: {
        name: submissionFolderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [folderId],
      },
      fields: "id",
    });

    const submissionFolderId = submissionFolder.data.id;
    if (!submissionFolderId) {
      throw new Error("Failed to create submission folder");
    }

    // Guardar formulario como archivo JSON
    const formContent = JSON.stringify({
      ...formData,
      submissionId,
      timestamp: new Date().toISOString(),
      projectId: projectIdFinal,
      clientId: clientIdFinal,
    }, null, 2);

    const formFile = await storageProvider.uploadFile({
      folderId: submissionFolderId,
      filename: `form_${submissionId}.json`,
      contentBuffer: Buffer.from(formContent, 'utf-8'),
      mimeType: 'application/json',
    });

    // Generar documento de reporte
    const templateId = formData.preferredFormat === 'Google Slides' 
      ? process.env.ONBOARDING_AUDIT_SLIDES_TEMPLATE_ID
      : process.env.ONBOARDING_AUDIT_DOCS_TEMPLATE_ID;

    let documentId: string | undefined;
    let documentUrl: string | undefined;

    if (templateId) {
      const document = await storageProvider.createDocumentFromTemplate({
        templateId,
        folderId: submissionFolderId,
        filename: `Onboarding_Audit_${formData.productName}_${submissionId}`,
        data: {
          productName: formData.productName,
          productUrl: formData.productUrl,
          targetUser: formData.targetUser,
          signupMethod: formData.signupMethod,
          signupMethodOther: formData.signupMethodOther || 'N/A',
          firstTimeExperience: formData.firstTimeExperience,
          firstTimeExperienceOther: formData.firstTimeExperienceOther || 'N/A',
          trackDropoff: formData.trackDropoff,
          mainGoal: formData.mainGoal,
          knowChurnRate: formData.knowChurnRate,
          churnTiming: formData.churnTiming,
          specificConcerns: formData.specificConcerns || 'N/A',
          email: formData.email,
          preferredFormat: formData.preferredFormat,
          submissionDate: new Date().toLocaleDateString(),
        },
      });

      documentId = document.id;
      documentUrl = document.webViewLink;
    }

    // Respuesta exitosa
    const response: ReceiveFormResponse = {
      success: true,
      submissionId,
      folderId: submissionFolderId,
      formFileId: formFile.id,
      documentId,
      documentUrl,
      message: "Form submitted successfully. Report will be generated within 48 hours.",
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in receiveForm:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}; 