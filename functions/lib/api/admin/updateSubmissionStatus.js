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
    try {
        const { projectId, userId, submissionId, newStatus } = req.body;
        if (!projectId || !submissionId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId, submissionId, and newStatus"
            });
        }
        // Validar que el nuevo estado sea válido según el flujo
        const validStatuses = ['pending', 'synced', 'in_progress', 'completed'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        // Obtener el documento actual para verificar el estado actual
        const db = getFirestore();
        const docRef = db.collection('onboardingaudit_submissions').doc(submissionId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }
        const currentData = doc.data();
        const currentStatus = currentData?.status;
        // Validar transiciones de estado permitidas
        const allowedTransitions = {
            'pending': ['synced'], // pending solo puede ir a synced (via processSubmissions)
            'synced': ['in_progress'], // synced solo puede ir a in_progress
            'in_progress': ['completed'], // in_progress solo puede ir a completed
            'completed': [], // completed es estado final
            'error': ['pending'] // TEMPORAL: permitir resetear errores a pending
        };
        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedTransitions[currentStatus]?.join(', ') || 'none'}`
            });
        }
        // Actualizar estado en Firestore
        const updateData = {
            status: newStatus,
            updatedAt: new Date()
        };
        if (userId) {
            updateData.updatedBy = userId;
        }
        // Agregar campos específicos según el estado
        if (newStatus === 'in_progress') {
            updateData.startedAt = new Date();
        }
        if (newStatus === 'completed') {
            // Si el estado es 'completed', borrar el documento de Firestore
            // porque la fuente de verdad ahora es Google Drive
            await docRef.delete();
            return res.status(200).json({
                success: true,
                message: `Submission completed and deleted from database. Work continues in Google Drive.`,
                submissionId,
                newStatus
            });
        }
        else {
            // Para otros estados, actualizar normalmente
            await docRef.update(updateData);
            return res.status(200).json({
                success: true,
                message: `Submission status updated to: ${newStatus}`,
                submissionId,
                newStatus
            });
        }
    }
    catch (error) {
        console.error('Error in updateSubmissionStatus:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update submission status",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateSubmissionStatus = updateSubmissionStatus;
