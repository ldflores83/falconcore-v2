"use strict";
// /functions/src/api/admin/waitlist.ts
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
exports.updateWaitlistStatus = exports.getWaitlist = void 0;
const admin = __importStar(require("firebase-admin"));
const configService_1 = require("../../services/configService");
const getFirestore = () => admin.firestore();
// Obtener lista de waitlist
const getWaitlist = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: projectId"
            });
        }
        // Validar que el producto esté configurado
        if (!configService_1.ConfigService.isProductConfigured(projectId)) {
            return res.status(400).json({
                success: false,
                message: `Product ${projectId} is not configured`
            });
        }
        // Validar que waitlist esté habilitado
        if (!configService_1.ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
            return res.status(400).json({
                success: false,
                message: `Waitlist feature is not enabled for ${projectId}`
            });
        }
        const db = getFirestore();
        const waitlistCollection = configService_1.ConfigService.getCollectionName(projectId, 'waitlist');
        // Obtener waitlist entries ordenados por fecha de creación
        const waitlistSnapshot = await db.collection(waitlistCollection)
            .orderBy('timestamp', 'desc')
            .limit(100) // Limitar a 100 entradas para evitar timeouts
            .get();
        const waitlist = [];
        waitlistSnapshot.forEach(doc => {
            const data = doc.data();
            // Procesar timestamp
            let timestamp;
            if (data.timestamp) {
                if (data.timestamp.toDate) {
                    timestamp = data.timestamp.toDate().toISOString();
                }
                else if (data.timestamp instanceof Date) {
                    timestamp = data.timestamp.toISOString();
                }
                else if (typeof data.timestamp === 'string') {
                    timestamp = data.timestamp;
                }
                else {
                    timestamp = new Date().toISOString();
                }
            }
            else {
                timestamp = new Date().toISOString();
            }
            waitlist.push({
                id: doc.id,
                email: data.email || data.userEmail || 'No email',
                projectId: data.projectId || projectId,
                status: data.status || 'waiting',
                timestamp: timestamp,
                name: data.name || data.userName || '',
                phone: data.phone || data.userPhone || '',
                source: data.source || 'unknown',
                ...data
            });
        });
        const response = {
            success: true,
            waitlist,
            message: `Retrieved ${waitlist.length} waitlist entries for ${projectId}`
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in getWaitlist:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getWaitlist = getWaitlist;
// Actualizar estado de entrada en waitlist
const updateWaitlistStatus = async (req, res) => {
    try {
        const { projectId, entryId, newStatus } = req.body;
        if (!projectId || !entryId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId, entryId, newStatus"
            });
        }
        // Validar que el producto esté configurado
        if (!configService_1.ConfigService.isProductConfigured(projectId)) {
            return res.status(400).json({
                success: false,
                message: `Product ${projectId} is not configured`
            });
        }
        // Validar que waitlist esté habilitado
        if (!configService_1.ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
            return res.status(400).json({
                success: false,
                message: `Waitlist feature is not enabled for ${projectId}`
            });
        }
        // Validar el status
        const validStatuses = ['waiting', 'notified', 'converted'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        const db = getFirestore();
        const waitlistCollection = configService_1.ConfigService.getCollectionName(projectId, 'waitlist');
        // Verificar que el documento existe
        const docRef = db.collection(waitlistCollection).doc(entryId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: `Waitlist entry with ID ${entryId} not found`
            });
        }
        // Actualizar el estado en Firestore
        await docRef.update({
            status: newStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: 'admin' // TODO: Add actual user ID when auth is implemented
        });
        const response = {
            success: true,
            message: `Status updated to ${newStatus} for entry ${entryId}`
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in updateWaitlistStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.updateWaitlistStatus = updateWaitlistStatus;
