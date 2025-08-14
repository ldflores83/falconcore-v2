// /functions/src/api/public/receiveForm.ts

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

// Tipos para el formulario de onboarding audit
interface OnboardingAuditForm {
  // Step 1 - Product Basics
  product_name: string;
  signup_link: string;
  target_user: '' | 'founders' | 'product_managers' | 'growth' | 'customer_success' | 'marketing' | 'sales' | 'operations' | 'other';
  value_prop: string;
  icp_company_size: '' | 'startup_1_20' | 'smb_21_200' | 'mid_200_1000' | 'enterprise_1000_plus';
  icp_industry: '' | 'saas' | 'fintech' | 'ecommerce' | 'healthtech' | 'edtech' | 'cybersecurity' | 'logistics' | 'productivity' | 'devtools' | 'other';
  icp_primary_role: '' | 'admin' | 'end_user' | 'technical_champion' | 'buyer' | 'finance_procurement' | 'other';
  day1_jtbd: string;
  pricing_tier: '' | 'free' | 'trial' | 'starter' | 'pro' | 'business' | 'enterprise';
  main_competitor?: string;
  
  // Step 2 - Current Onboarding Flow
  signup_methods: string[];
  first_screen: '' | 'walkthrough' | 'empty_dashboard' | 'welcome_page' | 'setup_wizard' | 'task_checklist' | 'other';
  track_dropoffs: '' | 'full' | 'partial' | 'no' | 'not_sure';
  activation_definition: string;
  aha_moment?: string;
  time_to_aha_minutes?: number;
  blocking_steps?: string[];
  platforms?: string[];
  compliance_constraints?: string[];
  
  // Step 2.5 - Analytics & Access
  analytics_tool: '' | 'ga4' | 'amplitude' | 'mixpanel' | 'heap' | 'in_house' | 'other';
  key_events?: string[];
  signups_per_week?: number;
  mau?: number;
  mobile_percent?: number;
  readonly_access?: 'yes' | 'no';
  access_instructions?: string;
  
  // Step 3 - Goal & Metrics
  main_goal: '' | 'activation_rate' | 'time_to_aha' | 'trial_to_paid' | 'retention_30' | 'retention_90' | 'other';
  know_churn_rate?: 'yes' | 'no' | 'not_sure';
  churn_when?: 'during_onboarding' | 'first_week' | 'first_month' | 'one_to_three_months' | 'after_three_months' | 'not_sure';
  target_improvement_percent?: number;
  time_horizon?: '4_weeks' | '8_weeks' | '12_weeks';
  main_segments?: string[];
  constraints?: string;
  
  // Step 4 - Delivery
  report_email: string;
  include_benchmarks?: boolean;
  want_ab_plan?: boolean;
  screenshots?: File[];
  walkthrough_url?: string;
  demo_account?: string;
  
  // Optional Evidence
  feature_flags?: 'yes' | 'no';
  ab_tool?: string;
  languages?: string[];
  empty_states_urls?: string;
  notifications_provider?: string;
  
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

    if (!formData.report_email || !formData.product_name) {
      return res.status(400).json({
        success: false,
        message: "Missing required form fields: report_email and product_name"
      });
    }

    // Generar IDs únicos
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectIdFinal = projectId || 'onboardingaudit';
    const clientIdFinal = clientId || formData.report_email.split('@')[0];

    console.log('📝 Form submission received:', {
      submissionId,
      email: formData.report_email,
      productName: formData.product_name,
      projectId: projectIdFinal,
      clientId: clientIdFinal,
      timestamp: new Date().toISOString(),
    });

    // Guardar en Firestore (sin depender de OAuth)
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
            const fileName = `Onboarding_Audit_${formData.product_name}_${new Date().toISOString().slice(0, 10)}.md`;
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
**Product:** ${formData.product_name}
**Email:** ${formData.report_email}

## Product Basics
- **Product Name:** ${formData.product_name}
- **Signup Link:** ${formData.signup_link}
- **Target User:** ${formData.target_user}
- **Value Proposition:** ${formData.value_prop}
- **ICP Company Size:** ${formData.icp_company_size}
- **ICP Industry:** ${formData.icp_industry}
- **ICP Primary Role:** ${formData.icp_primary_role}
- **Day-1 JTBD:** ${formData.day1_jtbd}
- **Pricing Tier:** ${formData.pricing_tier}
- **Main Competitor:** ${formData.main_competitor || 'None specified'}

## Current Onboarding Flow
- **Signup Methods:** ${formData.signup_methods.join(', ')}
- **First Screen:** ${formData.first_screen}
- **Track Dropoffs:** ${formData.track_dropoffs}
- **Activation Definition:** ${formData.activation_definition}
- **Aha Moment:** ${formData.aha_moment || 'None specified'}
- **Time to Aha:** ${formData.time_to_aha_minutes ? `${formData.time_to_aha_minutes} minutes` : 'Not specified'}
- **Blocking Steps:** ${formData.blocking_steps?.join(', ') || 'None'}
- **Platforms:** ${formData.platforms?.join(', ') || 'Not specified'}
- **Compliance Constraints:** ${formData.compliance_constraints?.join(', ') || 'None'}

## Analytics & Access
- **Analytics Tool:** ${formData.analytics_tool}
- **Key Events:** ${formData.key_events?.join(', ') || 'Not specified'}
- **Signups/Week:** ${formData.signups_per_week || 'Not specified'}
- **MAU:** ${formData.mau || 'Not specified'}
- **Mobile %:** ${formData.mobile_percent ? `${formData.mobile_percent}%` : 'Not specified'}
- **Read-only Access:** ${formData.readonly_access || 'Not specified'}
- **Access Instructions:** ${formData.access_instructions || 'None provided'}

## Goal & Metrics
- **Main Goal:** ${formData.main_goal}
- **Know Churn Rate:** ${formData.know_churn_rate || 'Not specified'}
- **Churn When:** ${formData.churn_when || 'Not specified'}
- **Target Improvement:** ${formData.target_improvement_percent ? `${formData.target_improvement_percent}%` : 'Not specified'}
- **Time Horizon:** ${formData.time_horizon || 'Not specified'}
- **Main Segments:** ${formData.main_segments?.join(', ') || 'Not specified'}
- **Constraints:** ${formData.constraints || 'None specified'}

## Delivery Preferences
- **Include Benchmarks:** ${formData.include_benchmarks ? 'Yes' : 'No'}
- **Want A/B Plan:** ${formData.want_ab_plan ? 'Yes' : 'No'}
- **Walkthrough URL:** ${formData.walkthrough_url || 'None provided'}
- **Demo Account:** ${formData.demo_account || 'None provided'}

## Optional Evidence
- **Feature Flags:** ${formData.feature_flags || 'Not specified'}
- **A/B Tool:** ${formData.ab_tool || 'None specified'}
- **Languages:** ${formData.languages?.join(', ') || 'Not specified'}
- **Empty States:** ${formData.empty_states_urls || 'None provided'}
- **Notifications Provider:** ${formData.notifications_provider || 'None specified'}

---
*This audit request was submitted through the Onboarding Audit form and will be processed within 48 hours.*
`;
} 