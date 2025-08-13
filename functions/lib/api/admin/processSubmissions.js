"use strict";
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
exports.processSubmissions = void 0;
const admin = __importStar(require("firebase-admin"));
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
const providerFactory_1 = require("../../storage/utils/providerFactory");
const hash_1 = require("../../utils/hash");
const processSubmissions = async (req, res) => {
    try {
        const { projectId, clientId } = req.body;
        if (!projectId || !clientId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId and clientId"
            });
        }
        // Verificar que el clientId corresponde al email autorizado
        const expectedClientId = (0, hash_1.generateClientId)('luisdaniel883@gmail.com', projectId);
        if (clientId !== expectedClientId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can process submissions."
            });
        }
        // Obtener credenciales OAuth del admin
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(clientId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first.",
                requiresLogin: true
            });
        }
        // Obtener SOLO submissions pendientes de sincronización
        const submissionsRef = admin.firestore().collection('onboardingaudit_submissions');
        const submissionsToProcess = await submissionsRef
            .where('status', '==', 'pending')
            .get();
        if (submissionsToProcess.empty) {
            return res.status(200).json({
                success: true,
                message: "No submissions to process found",
                data: {
                    processed: 0,
                    total: 0
                }
            });
        }
        let processedCount = 0;
        let errorCount = 0;
        // 2. Obtener la carpeta de trabajo del admin (carpeta padre)
        const provider = providerFactory_1.StorageProviderFactory.createProvider('google');
        const adminEmail = 'luisdaniel883@gmail.com';
        const adminWorkFolderName = `${projectId}_${adminEmail}`;
        const adminWorkFolderId = await provider.findOrCreateFolder(adminWorkFolderName, projectId, credentials.accessToken, credentials.refreshToken);
        console.log(`✅ Using admin work folder: ${adminWorkFolderName} with ID: ${adminWorkFolderId}`);
        // 3. Procesar cada submission individualmente y crear su carpeta específica DENTRO de la carpeta de trabajo
        for (const doc of submissionsToProcess.docs) {
            const submission = doc.data();
            console.log(`📋 Processing submission ${doc.id} for user ${submission.email}`);
            // 1. Crear carpeta específica para esta submission DENTRO de la carpeta de trabajo del admin
            const submissionFolderName = `${submission.email}_${projectId}`;
            const submissionFolderId = await provider.findOrCreateFolder(submissionFolderName, projectId, credentials.accessToken, credentials.refreshToken, adminWorkFolderId // Carpeta padre donde crear la subcarpeta
            );
            console.log(`✅ Created submission folder: ${submissionFolderName} with ID: ${submissionFolderId} inside admin work folder`);
            // 2. Verificar y subir archivos adjuntos de esta submission desde Cloud Storage
            if (submission.attachments && submission.attachments.length > 0) {
                console.log(`📁 Processing ${submission.attachments.length} attachments for ${submission.email}`);
                const bucket = admin.storage().bucket('falconcore-onboardingaudit-uploads');
                let validAttachments = 0;
                for (const attachment of submission.attachments) {
                    try {
                        console.log(`📄 Processing attachment: ${attachment.filename} for ${submission.email}`);
                        // Verificar que el archivo existe en Cloud Storage
                        const file = bucket.file(attachment.filePath);
                        const [exists] = await file.exists();
                        if (!exists) {
                            console.log(`⚠️ File not found in Cloud Storage: ${attachment.filePath}, skipping...`);
                            continue;
                        }
                        // Obtener archivo desde Cloud Storage
                        const fileBuffer = await file.download();
                        console.log(`✅ Downloaded from Cloud Storage: ${attachment.filename}`);
                        // Subir a Google Drive en la carpeta específica de esta submission
                        const uploadResult = await provider.uploadFile({
                            folderId: submissionFolderId,
                            filename: attachment.filename,
                            contentBuffer: fileBuffer[0],
                            mimeType: attachment.mimeType,
                            accessToken: credentials.accessToken,
                            refreshToken: credentials.refreshToken
                        });
                        console.log(`✅ File uploaded to Drive: ${uploadResult.id} in folder ${submissionFolderName}`);
                        validAttachments++;
                    }
                    catch (fileError) {
                        console.error(`❌ Error processing file ${attachment.filename}:`, fileError);
                        errorCount++;
                    }
                }
                console.log(`📊 Successfully processed ${validAttachments}/${submission.attachments.length} attachments for ${submission.email}`);
            }
            // 3. Crear documento del formulario para esta submission
            try {
                const documentContent = generateFormDocument(submission);
                const documentBuffer = Buffer.from(documentContent, 'utf-8');
                const documentFilename = `Onboarding_Audit_${submission.email}_${new Date().toISOString().split('T')[0]}.md`;
                const documentResult = await provider.uploadFile({
                    folderId: submissionFolderId,
                    filename: documentFilename,
                    contentBuffer: documentBuffer,
                    mimeType: 'text/markdown',
                    accessToken: credentials.accessToken,
                    refreshToken: credentials.refreshToken
                });
                console.log(`✅ Document created in Drive: ${documentResult.id} for ${submission.email} in folder ${submissionFolderName}`);
                processedCount++;
            }
            catch (docError) {
                console.error(`❌ Error creating document for ${submission.email}:`, docError);
                errorCount++;
            }
        }
        // 5. Limpiar completamente el directorio submissions en Cloud Storage
        try {
            console.log(`🧹 Cleaning up Cloud Storage submissions directory...`);
            const bucket = admin.storage().bucket('falconcore-onboardingaudit-uploads');
            // Listar todos los archivos en el directorio submissions
            const [files] = await bucket.getFiles({ prefix: 'submissions/' });
            if (files.length > 0) {
                console.log(`🗑️ Found ${files.length} files to delete in Cloud Storage`);
                // Eliminar todos los archivos
                await Promise.all(files.map(file => file.delete()));
                console.log(`✅ All files deleted from Cloud Storage submissions directory`);
            }
            else {
                console.log(`📁 No files found in Cloud Storage submissions directory`);
            }
        }
        catch (cleanupError) {
            console.error(`❌ Error cleaning up Cloud Storage:`, cleanupError);
        }
        // 6. Actualizar estado de TODAS las submissions a 'synced' en Firestore
        console.log(`📝 Updating Firestore status for ${submissionsToProcess.size} submissions...`);
        for (const doc of submissionsToProcess.docs) {
            try {
                const submission = doc.data();
                const submissionFolderName = `${submission.email}_${projectId}`;
                await doc.ref.update({
                    status: 'synced',
                    syncedAt: admin.firestore.Timestamp.now(),
                    syncedBy: clientId,
                    driveFolderName: submissionFolderName
                });
                console.log(`✅ Submission ${doc.id} marked as synced in Firestore with folder: ${submissionFolderName}`);
            }
            catch (updateError) {
                console.error(`❌ Error updating submission ${doc.id}:`, updateError);
                errorCount++;
            }
        }
        console.log(`🎉 All submissions processed successfully!`);
        return res.status(200).json({
            success: true,
            message: "Submissions synced to Google Drive successfully",
            data: {
                processed: processedCount,
                errors: errorCount,
                total: submissionsToProcess.size
            }
        });
    }
    catch (error) {
        console.error('Error in processSubmissions:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to process submissions",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.processSubmissions = processSubmissions;
// Función para generar el documento del formulario
function generateFormDocument(submission) {
    const timestamp = new Date().toISOString();
    return `# Onboarding Audit Request

**Submitted:** ${timestamp}
**Product:** ${submission.productName}
**Email:** ${submission.email}

## Product Basics
- **Product Name:** ${submission.productName}
- **Product URL:** ${submission.productUrl}
- **Target User:** ${submission.targetUser}

## Current Onboarding Flow
- **Signup Method:** ${submission.signupMethod}${submission.signupMethodOther ? ` (${submission.signupMethodOther})` : ''}
- **First Time Experience:** ${submission.firstTimeExperience}${submission.firstTimeExperienceOther ? ` (${submission.firstTimeExperienceOther})` : ''}
- **Track Dropoff:** ${submission.trackDropoff}

## Goal & Metrics
- **Main Goal:** ${submission.mainGoal}
- **Know Churn Rate:** ${submission.knowChurnRate}
- **Churn Timing:** ${submission.churnTiming}
- **Specific Concerns:** ${submission.specificConcerns || 'None specified'}

## Delivery Preferences
- **Preferred Format:** ${submission.preferredFormat}

---
*This audit request was submitted through the Onboarding Audit form and will be processed within 48 hours.*
`;
}
