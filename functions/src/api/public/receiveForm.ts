// /functions/src/api/public/receiveForm.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { getOAuthCredentials } from "../../oauth/getOAuthCredentials";
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

    // Verificar si el usuario ya tiene una submission pendiente
    const adminUserId = `luisdaniel883@gmail.com_${projectIdFinal}`;
    const credentials = await getOAuthCredentials(adminUserId);
    
    if (credentials) {
      const provider = new GoogleDriveProvider();
      const adminFolderId = await provider.createFolderWithTokens(
        'luisdaniel883@gmail.com', 
        projectIdFinal, 
        credentials.accessToken,
        credentials.refreshToken
      );
      
      // Listar todas las subcarpetas para verificar submissions existentes
      const folders = await provider.listFilesWithTokens(
        adminFolderId, 
        credentials.accessToken,
        credentials.refreshToken
      );
      
      // Verificar si ya existe una submission de este email
      const existingSubmission = folders.find(folder => 
        folder.mimeType === 'application/vnd.google-apps.folder' && 
        folder.name.includes(formData.email)
      );
      
                if (existingSubmission) {
            return res.status(400).json({
              success: false,
              message: "You already have a pending request. Please wait for it to be completed before submitting another."
            });
          }

      // Verificar límite de submissions pendientes (máximo 6)
      const pendingSubmissions = folders.filter(folder => 
        folder.mimeType === 'application/vnd.google-apps.folder'
      );
      
                if (pendingSubmissions.length >= 6) {
            return res.status(400).json({
              success: false,
              message: "We are currently working on pending requests. Please try again later when more slots become available."
            });
          }
    }

    console.log('📝 Form submission received:', {
      submissionId,
      email: formData.email,
      productName: formData.productName,
      projectId: projectIdFinal,
      clientId: clientIdFinal,
      timestamp: new Date().toISOString(),
    });

    // Guardar en Firestore primero (sin depender de OAuth)
    console.log('💾 Saving submission to Firestore...');
    const db = getFirestore();
    
    try {
      // Crear documento en Firestore
      const submissionData = {
        ...formData,
        submissionId,
        projectId: projectIdFinal,
        clientId: clientIdFinal,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await db.collection('onboardingaudit_submissions').add(submissionData);
      
      console.log('✅ Submission saved to Firestore:', docRef.id);

      // Generar documento del formulario
      console.log('📄 Generating form document...');
      const documentContent = generateFormDocument(formData);
      
      // Subir documento a Cloud Storage
      const fileName = `Onboarding_Audit_${formData.productName}_${new Date().toISOString().slice(0, 10)}.md`;
      const contentBuffer = Buffer.from(documentContent, 'utf-8');
      
      const storagePath = `submissions/${docRef.id}/${fileName}`;
      const storageUrl = await uploadToStorage(
        'falconcore-onboardingaudit-uploads',
        storagePath,
        contentBuffer,
        'text/markdown'
      );

      // Actualizar Firestore con la URL del documento y preparar para imágenes
      await docRef.update({
        documentUrl: storageUrl,
        documentPath: storagePath,
        hasAttachments: false, // Se actualizará cuando se suban imágenes
        attachments: [] // Array para guardar info de imágenes
      });

      console.log('✅ Form document uploaded to Cloud Storage:', storageUrl);

      // Respuesta exitosa
      const response: ReceiveFormResponse = {
        success: true,
        submissionId: docRef.id,
        folderId: storagePath,
        message: "Form submitted successfully. Your audit request has been received and will be processed within 48 hours.",
      };

      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ Error saving submission:', error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to save submission. Please try again later.",
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