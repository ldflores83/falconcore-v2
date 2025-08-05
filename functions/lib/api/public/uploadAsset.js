"use strict";
// /functions/src/api/public/uploadAsset.ts
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
exports.uploadAsset = void 0;
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
const uploadAsset = async (req, res) => {
    try {
        console.log('🔍 uploadAsset handler called with body:', JSON.stringify(req.body, null, 2));
        const { submissionId, folderId, projectId, userEmail, files } = req.body;
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
            if (!submissionId)
                missingFields.push('submissionId');
            if (!folderId)
                missingFields.push('folderId');
            if (!userEmail)
                missingFields.push('userEmail');
            if (!files || files.length === 0)
                missingFields.push('files');
            console.log('❌ Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        // Validar límite de tamaño total (10MB) y archivos individuales (10MB)
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const maxTotalSize = 10 * 1024 * 1024; // 10MB total
        const maxIndividualSize = 10 * 1024 * 1024; // 10MB por archivo
        // Validar archivos individuales
        const oversizedFiles = files.filter(file => file.size > maxIndividualSize);
        if (oversizedFiles.length > 0) {
            const fileNames = oversizedFiles.map(f => f.filename).join(', ');
            return res.status(400).json({
                success: false,
                message: `File(s) exceed 10MB limit: ${fileNames}. Please compress or split large files.`
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
        // Subir archivos a Cloud Storage y guardar referencias en Firestore
        console.log('🔧 Uploading files to Cloud Storage...');
        try {
            const uploadedFiles = [];
            const filePaths = [];
            const db = getFirestore();
            for (const file of files) {
                // Decodificar contenido Base64
                const contentBuffer = Buffer.from(file.content, 'base64');
                // Generar ruta única para el archivo en Cloud Storage
                const filePath = `submissions/${submissionId}/attachments/${Date.now()}_${file.filename}`;
                // Subir archivo a Cloud Storage
                const storageUrl = await (0, storage_1.uploadToStorage)('falconcore-onboardingaudit-uploads', filePath, contentBuffer, file.mimeType);
                uploadedFiles.push({
                    filename: file.filename,
                    filePath: filePath,
                    storageUrl: storageUrl,
                    size: file.size,
                    mimeType: file.mimeType
                });
                filePaths.push(filePath);
                console.log('✅ File uploaded to Cloud Storage:', {
                    filename: file.filename,
                    filePath: filePath,
                    storageUrl: storageUrl,
                    size: file.size
                });
            }
            // Actualizar Firestore con las referencias de los archivos
            const docRef = db.collection('onboardingaudit_submissions').doc(submissionId);
            await docRef.update({
                hasAttachments: true,
                attachments: uploadedFiles,
                updatedAt: new Date()
            });
            console.log('✅ Files uploaded successfully and Firestore updated:', {
                submissionId,
                filesCount: uploadedFiles.length,
                totalSize,
                filePaths
            });
            // Respuesta exitosa
            const response = {
                success: true,
                fileIds: filePaths, // Usar filePaths como IDs
                totalSize,
                message: `Successfully uploaded ${files.length} file(s) to Cloud Storage`,
            };
            return res.status(200).json(response);
        }
        catch (error) {
            console.error('❌ Error uploading files:', error);
            return res.status(500).json({
                success: false,
                message: "Failed to upload files to Google Drive. Please try again later.",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        console.error("❌ Error in uploadAsset:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};
exports.uploadAsset = uploadAsset;
