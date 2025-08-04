// /functions/src/api/public/generateDocument.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { getOAuthCredentials } from "../../oauth/getOAuthCredentials";

interface GenerateDocumentRequest {
  submissionId: string;
  folderId: string;
  formData: {
    productName: string;
    productUrl: string;
    targetUser: string;
    signupMethod: string;
    signupMethodOther?: string;
    firstTimeExperience: string;
    firstTimeExperienceOther?: string;
    trackDropoff: string;
    mainGoal: string;
    knowChurnRate: string;
    churnTiming: string;
    specificConcerns?: string;
    email: string;
    preferredFormat: 'Google Doc' | 'Google Slides';
  };
  projectId?: string;
}

interface GenerateDocumentResponse {
  success: boolean;
  documentId?: string;
  documentLink?: string;
  message: string;
}

export const generateDocument = async (req: Request, res: Response) => {
  try {
    const { submissionId, folderId, formData, projectId }: GenerateDocumentRequest = req.body;

    // Validaciones básicas
    if (!submissionId || !folderId || !formData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: submissionId, folderId, and formData"
      });
    }

    console.log('🔧 Generating document for submission:', {
      submissionId,
      folderId,
      productName: formData.productName,
      email: formData.email
    });

    // Verificar OAuth credentials para el usuario
    const userId = `${formData.email}_${projectId || 'onboardingaudit'}`;
    const credentials = await getOAuthCredentials(userId);
    
    if (!credentials) {
      console.log('⚠️ No OAuth credentials found for user:', userId);
      return res.status(401).json({
        success: false,
        message: "OAuth authentication required. Please login first.",
      });
    }

    // Generar documento con respuestas
    console.log('🔧 Creating document with form responses...');
    const provider = new GoogleDriveProvider();
    
    try {
      // Preparar datos del documento
      const documentData = {
        productName: formData.productName,
        productUrl: formData.productUrl,
        targetUser: formData.targetUser,
        signupMethod: formData.signupMethod,
        signupMethodOther: formData.signupMethodOther || '',
        firstTimeExperience: formData.firstTimeExperience,
        firstTimeExperienceOther: formData.firstTimeExperienceOther || '',
        trackDropoff: formData.trackDropoff,
        mainGoal: formData.mainGoal,
        knowChurnRate: formData.knowChurnRate,
        churnTiming: formData.churnTiming,
        specificConcerns: formData.specificConcerns || '',
        email: formData.email,
        preferredFormat: formData.preferredFormat,
        submissionId,
        projectId: projectId || 'onboardingaudit',
        createdAt: new Date().toISOString(),
      };

      // Crear documento Google Docs
      const documentName = `Onboarding_Audit_${formData.productName}_${new Date().toISOString().slice(0, 10)}`;
      const document = await provider.createDocumentFromTemplate({
        templateId: '', // Crear documento vacío
        folderId: folderId,
        filename: documentName,
        data: documentData
      });

      console.log('✅ Document created:', {
        documentId: document.id,
        documentName: document.name,
        webViewLink: document.webViewLink
      });

      // Respuesta exitosa
      const response: GenerateDocumentResponse = {
        success: true,
        documentId: document.id,
        documentLink: document.webViewLink,
        message: "Document generated successfully in Google Drive.",
      };

      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ Error creating document:', error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to generate document. Please try again later.",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error("❌ Error in generateDocument:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}; 