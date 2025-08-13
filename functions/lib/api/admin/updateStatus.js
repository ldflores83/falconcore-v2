"use strict";
// functions/src/api/admin/updateStatus.ts
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
exports.updateStatus = void 0;
const admin = __importStar(require("firebase-admin"));
const providerFactory_1 = require("../../storage/utils/providerFactory");
const updateStatus = async (req, res) => {
    try {
        const { submissionId, newStatus, projectId } = req.body;
        if (!submissionId || !newStatus || !projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: submissionId, newStatus, projectId"
            });
        }
        // Validar status permitidos
        const allowedStatuses = ['pending', 'processing', 'completed', 'error', 'cancelled'];
        if (!allowedStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Allowed values: pending, processing, completed, error, cancelled"
            });
        }
        // Obtener la submission
        const submissionRef = admin.firestore().collection('submissions').doc(submissionId);
        const submissionDoc = await submissionRef.get();
        if (!submissionDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }
        const submission = submissionDoc.data();
        // Si el nuevo status es 'completed', procesar archivos
        if (newStatus === 'completed' && submission?.files && submission.files.length > 0) {
            try {
                const provider = providerFactory_1.StorageProviderFactory.createProvider('google');
                // Crear carpeta si no existe
                let folderId = submission.folderId;
                if (!folderId) {
                    folderId = await provider.createFolder(submission.userEmail, projectId);
                }
                // Subir archivos usando la interfaz estándar
                for (const file of submission.files) {
                    try {
                        await provider.uploadFile({
                            folderId,
                            filename: file.filename,
                            contentBuffer: Buffer.from(file.content, 'base64'),
                            mimeType: file.mimeType
                        });
                    }
                    catch (fileError) {
                        console.error(`❌ Error uploading file ${file.filename}:`, fileError);
                    }
                }
                // Actualizar con folderId
                await submissionRef.update({
                    status: newStatus,
                    folderId,
                    updatedAt: admin.firestore.Timestamp.now()
                });
            }
            catch (error) {
                console.error('❌ Error processing files:', error);
                // Marcar como error si falla el procesamiento
                await submissionRef.update({
                    status: 'error',
                    errorMessage: 'Failed to process files',
                    updatedAt: admin.firestore.Timestamp.now()
                });
                return res.status(500).json({
                    success: false,
                    message: "Failed to process files",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        }
        else {
            // Actualizar status sin procesar archivos
            await submissionRef.update({
                status: newStatus,
                updatedAt: admin.firestore.Timestamp.now()
            });
        }
        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: {
                submissionId,
                newStatus,
                updatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.updateStatus = updateStatus;
