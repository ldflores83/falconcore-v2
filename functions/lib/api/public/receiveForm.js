"use strict";
// /functions/src/api/public/receiveForm.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveForm = void 0;
const storage_1 = require("../../services/storage");
const admin = __importStar(require("firebase-admin"));
// Función para obtener Firestore de forma lazy
const getFirestore = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: 'falconcore-v2',
        });
    }
    return admin.firestore();
};
const receiveForm = async (req, res) => {
    console.log('🚀 receiveForm handler called with:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    try {
        const { formData, projectId, clientId } = req.body;
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
            const fileName = `Onboarding_Audit_${formData.productName}_${new Date().toISOString().slice(0, 10)}.md`;
            const contentBuffer = Buffer.from(documentContent, 'utf-8');
            const storagePath = `submissions/${docRef.id}/${fileName}`;
            const storageUrl = await (0, storage_1.uploadToStorage)('falconcore-onboardingaudit-uploads', storagePath, contentBuffer, 'text/markdown');
            // Actualizar Firestore con la URL del documento y preparar para imágenes
            await docRef.update({
                documentUrl: storageUrl,
                documentPath: storagePath,
                hasAttachments: false, // Se actualizará cuando se suban imágenes
                attachments: [] // Array para guardar info de imágenes
            });
            console.log('✅ Form document uploaded to Cloud Storage:', storageUrl);
            // Respuesta exitosa
            const response = {
                success: true,
                submissionId: docRef.id,
                folderId: storagePath,
                message: "Form submitted successfully. Your audit request has been received and will be processed within 48 hours.",
            };
            return res.status(200).json(response);
        }
        catch (error) {
            console.error('❌ Error saving submission:', error);
            return res.status(500).json({
                success: false,
                message: "Failed to save submission. Please try again later.",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        console.error("❌ Error in receiveForm:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};
exports.receiveForm = receiveForm;
// Función para generar el documento del formulario
function generateFormDocument(formData) {
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
