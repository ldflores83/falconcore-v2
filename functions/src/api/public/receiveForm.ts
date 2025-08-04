// /functions/src/api/public/receiveForm.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { getOAuthCredentials } from "../../oauth/getOAuthCredentials";
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
  message: string;
}

export const receiveForm = async (req: Request, res: Response) => {
  console.log('🚀 receiveForm handler called with:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  
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

    // Generar IDs únicos
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectIdFinal = projectId || 'onboardingaudit';
    const clientIdFinal = clientId || formData.email.split('@')[0];

    console.log('📝 Form submission received:', {
      submissionId,
      email: formData.email,
      productName: formData.productName,
      projectId: projectIdFinal,
      clientId: clientIdFinal,
      timestamp: new Date().toISOString(),
    });

    // Usar credenciales OAuth del administrador (luisdaniel883@gmail.com)
    const adminUserId = `luisdaniel883@gmail.com_${projectIdFinal}`;
    const credentials = await getOAuthCredentials(adminUserId);
    
    if (!credentials) {
      console.log('⚠️ No OAuth credentials found for admin user:', adminUserId);
      return res.status(500).json({
        success: false,
        message: "Service temporarily unavailable. Please try again later.",
      });
    }

    // Crear carpeta para el formulario usando credenciales del admin
    console.log('🔧 Creating folder for form submission...');
    const provider = new GoogleDriveProvider();
    
    try {
      // Usar las credenciales específicas del admin
      const adminFolderId = await provider.createFolderWithTokens(
        'luisdaniel883@gmail.com', 
        projectIdFinal, 
        credentials.accessToken,
        credentials.refreshToken
      );
      
      // Crear carpeta específica para este formulario
      const formFolderName = `${formData.productName}_${formData.email}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
      const formFolderId = await provider.findOrCreateFolder(formFolderName, adminFolderId);
      
      console.log('✅ Form folder created:', {
        adminFolderId,
        formFolderName,
        formFolderId
      });

      // Generar documento del formulario
      console.log('📄 Generating form document...');
      const documentContent = generateFormDocument(formData);
      
      // Subir documento al Drive
      const fileName = `Onboarding_Audit_${formData.productName}_${new Date().toISOString().slice(0, 10)}.md`;
      const contentBuffer = Buffer.from(documentContent, 'utf-8');
      const uploadResult = await provider.uploadFile({
        folderId: formFolderId,
        filename: fileName,
        contentBuffer: contentBuffer,
        mimeType: 'text/markdown'
      });
      
      console.log('✅ Form document uploaded to Drive:', {
        fileName,
        fileId: uploadResult.id,
        folderId: formFolderId,
        webViewLink: uploadResult.webViewLink
      });

      // Respuesta exitosa
      const response: ReceiveFormResponse = {
        success: true,
        submissionId,
        folderId: formFolderId,
        message: "Form submitted successfully. Document created in Google Drive.",
      };

      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ Error creating folder:', error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to create folder. Please try again later.",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error("❌ Error in receiveForm:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// Función para generar el documento del formulario
function generateFormDocument(formData: OnboardingAuditForm): string {
  const timestamp = new Date().toISOString();
  
  return `# Onboarding Audit Request

**Submitted:** ${timestamp}
**Product:** ${formData.productName}
**Email:** ${formData.email}

## Product Basics
- **Product Name:** ${formData.productName}
- **Product URL:** ${formData.productUrl}
- **Target User:** ${formData.targetUser}

## Current Onboarding Flow
- **Signup Method:** ${formData.signupMethod}${formData.signupMethodOther ? ` (${formData.signupMethodOther})` : ''}
- **First Time Experience:** ${formData.firstTimeExperience}${formData.firstTimeExperienceOther ? ` (${formData.firstTimeExperienceOther})` : ''}
- **Track Dropoff:** ${formData.trackDropoff}

## Goal & Metrics
- **Main Goal:** ${formData.mainGoal}
- **Know Churn Rate:** ${formData.knowChurnRate}
- **Churn Timing:** ${formData.churnTiming}
- **Specific Concerns:** ${formData.specificConcerns || 'None specified'}

## Delivery Preferences
- **Preferred Format:** ${formData.preferredFormat}

---
*This audit request was submitted through the Onboarding Audit form and will be processed within 48 hours.*
`;
} 