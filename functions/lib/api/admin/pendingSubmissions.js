"use strict";
// functions/src/api/admin/pendingSubmissions.ts
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
exports.getPendingSubmissions = void 0;
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
const getPendingSubmissions = async (req, res) => {
    try {
        const { projectId, userId } = req.body;
        if (!projectId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId and userId"
            });
        }
        // Verificar que el userId corresponde al email autorizado
        if (!userId.includes('luisdaniel883@gmail.com')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can access submissions."
            });
        }
        // Verificar credenciales OAuth
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(userId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first."
            });
        }
        // Obtener submissions pendientes desde Firestore
        const db = getFirestore();
        console.log('📋 Loading pending submissions from Firestore...');
        const snapshot = await db.collection('onboardingaudit_submissions')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        console.log('📋 Pending submissions found:', {
            totalPending: snapshot.docs.length,
            submissionIds: snapshot.docs.map(doc => doc.id)
        });
        const pendingSubmissions = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('📋 Processing pending submission:', {
                id: doc.id,
                email: data.email,
                productName: data.productName,
                status: data.status
            });
            return {
                id: doc.id,
                email: data.email || 'Unknown',
                productName: data.productName || 'Unknown',
                productUrl: data.productUrl || '',
                targetUser: data.targetUser || 'Unknown',
                mainGoal: data.mainGoal || 'Unknown',
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
                status: data.status || 'pending',
                documentPath: data.documentPath || null,
                documentUrl: data.documentUrl || null
            };
        });
        console.log('✅ Pending submissions loaded:', {
            projectId,
            userId,
            pendingCount: pendingSubmissions.length
        });
        return res.status(200).json({
            success: true,
            pendingSubmissions,
            pendingCount: pendingSubmissions.length
        });
    }
    catch (error) {
        console.error('❌ Error loading pending submissions:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to load pending submissions",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPendingSubmissions = getPendingSubmissions;
