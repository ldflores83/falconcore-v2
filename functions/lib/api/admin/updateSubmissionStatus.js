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
exports.updateSubmissionStatus = void 0;
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
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
const updateSubmissionStatus = async (req, res) => {
    console.log('🚀 updateSubmissionStatus handler called');
    try {
        const { projectId, userId, submissionId, newStatus } = req.body;
        if (!projectId || !userId || !submissionId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId, userId, submissionId, and newStatus"
            });
        }
        // Verificar autenticación del admin
        if (!userId.includes('luisdaniel883@gmail.com')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can update submission status."
            });
        }
        // Obtener credenciales OAuth del admin
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(userId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first.",
                requiresLogin: true
            });
        }
        // Validar que el nuevo estado sea válido
        const validStatuses = ['pending', 'synced', 'in_progress', 'completed'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        console.log(`🔄 Updating submission ${submissionId} status to: ${newStatus}`);
        // Actualizar estado en Firestore
        const db = getFirestore();
        const docRef = db.collection('onboardingaudit_submissions').doc(submissionId);
        if (newStatus === 'completed') {
            // Si el estado es 'completed', borrar el documento de Firestore
            console.log(`🗑️ Deleting submission ${submissionId} from Firestore (completed)`);
            await docRef.delete();
            console.log(`✅ Submission ${submissionId} deleted from Firestore (completed)`);
            return res.status(200).json({
                success: true,
                message: `Submission completed and deleted from database`,
                submissionId,
                newStatus
            });
        }
        else {
            // Para otros estados, actualizar normalmente
            const updateData = {
                status: newStatus,
                updatedAt: new Date(),
                updatedBy: userId
            };
            // Agregar campos específicos según el estado
            if (newStatus === 'in_progress') {
                updateData.startedAt = new Date();
            }
            await docRef.update(updateData);
            console.log(`✅ Submission ${submissionId} status updated to: ${newStatus}`);
            return res.status(200).json({
                success: true,
                message: `Submission status updated to: ${newStatus}`,
                submissionId,
                newStatus
            });
        }
    }
    catch (error) {
        console.error('❌ Error in updateSubmissionStatus:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update submission status",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateSubmissionStatus = updateSubmissionStatus;
