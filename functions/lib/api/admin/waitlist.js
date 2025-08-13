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
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
const projectAdmins_1 = require("../../config/projectAdmins");
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
// Obtener lista de waitlist
const getWaitlist = async (req, res) => {
    console.log('📋 getWaitlist handler called with:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    try {
        const { projectId, clientId } = req.body;
        console.log('🔍 getWaitlist: Received parameters:', { projectId, clientId });
        if (!projectId || !clientId) {
            console.log('❌ getWaitlist: Missing required parameters');
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId, clientId"
            });
        }
        console.log('🔐 getWaitlist: Verifying OAuth credentials for clientId:', clientId);
        // Verificar credenciales OAuth
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(clientId);
        console.log('🔐 getWaitlist: OAuth credentials result:', {
            hasCredentials: !!credentials,
            email: credentials?.email,
            projectId: credentials?.projectId
        });
        if (!credentials) {
            console.log('❌ getWaitlist: No OAuth credentials found');
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first."
            });
        }
        console.log('🔐 getWaitlist: Checking admin permissions for:', {
            email: credentials.email,
            projectId: credentials.projectId,
            targetProjectId: projectId
        });
        // Verificar que el usuario es admin del proyecto
        const isAdmin = (0, projectAdmins_1.isProjectAdmin)(credentials.email, credentials.projectId);
        console.log('🔐 getWaitlist: Admin check result:', { isAdmin });
        if (!isAdmin) {
            console.log('❌ getWaitlist: User is not admin');
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized as an administrator for this project."
            });
        }
        console.log('🗄️ getWaitlist: Getting Firestore instance');
        const db = getFirestore();
        console.log('🗄️ getWaitlist: Querying waitlist collection for projectId:', projectId);
        // Obtener waitlist del proyecto
        console.log('🗄️ getWaitlist: Querying waitlist collection...');
        let waitlistSnapshot;
        try {
            // Intentar con orderBy primero
            waitlistSnapshot = await db
                .collection('waitlist_onboarding_audit')
                .where('projectId', '==', projectId)
                .orderBy('timestamp', 'desc')
                .get();
            console.log('🗄️ getWaitlist: Query with orderBy successful');
        }
        catch (queryError) {
            console.log('🗄️ getWaitlist: Query with orderBy failed, trying without orderBy...', queryError);
            // Si falla con orderBy, intentar sin ordenamiento
            waitlistSnapshot = await db
                .collection('waitlist_onboarding_audit')
                .where('projectId', '==', projectId)
                .get();
            console.log('🗄️ getWaitlist: Query without orderBy successful');
        }
        console.log('🗄️ getWaitlist: Firestore query completed, docs count:', waitlistSnapshot.size);
        const waitlist = waitlistSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
        }));
        console.log('🗄️ getWaitlist: Processed waitlist data:', {
            count: waitlist.length,
            sampleEntry: waitlist.length > 0 ? waitlist[0] : null
        });
        console.log('✅ Waitlist retrieved:', {
            projectId,
            count: waitlist.length
        });
        const response = {
            success: true,
            waitlist,
            message: `Retrieved ${waitlist.length} waitlist entries`
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in getWaitlist:", error);
        // Log más detalles del error
        if (error instanceof Error) {
            console.error("❌ getWaitlist error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
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
    console.log('🔄 updateWaitlistStatus handler called with:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    try {
        const { projectId, clientId, entryId, newStatus } = req.body;
        if (!projectId || !clientId || !entryId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId, clientId, entryId, newStatus"
            });
        }
        // Verificar credenciales OAuth
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(clientId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first."
            });
        }
        // Verificar que el usuario es admin del proyecto
        if (!(0, projectAdmins_1.isProjectAdmin)(credentials.email, credentials.projectId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized as an administrator for this project."
            });
        }
        const db = getFirestore();
        // Actualizar estado en Firestore
        await db
            .collection('waitlist_onboarding_audit')
            .doc(entryId)
            .update({
            status: newStatus,
            updatedAt: new Date()
        });
        console.log('✅ Waitlist status updated:', {
            entryId,
            newStatus,
            projectId
        });
        const response = {
            success: true,
            message: `Waitlist entry status updated to ${newStatus}`
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in updateWaitlistStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};
exports.updateWaitlistStatus = updateWaitlistStatus;
