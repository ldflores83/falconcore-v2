"use strict";
// functions/src/api/admin/clearAnalytics.ts
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
exports.clearAnalytics = void 0;
const admin = __importStar(require("firebase-admin"));
// Función para obtener Firestore de forma lazy
const getFirestore = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: 'falconcore-v2'
        });
    }
    return admin.firestore();
};
const clearAnalytics = async (req, res) => {
    try {
        console.log('🔍 clearAnalytics function called');
        const { projectId } = req.body;
        console.log('🔍 projectId:', projectId);
        if (!projectId) {
            console.log('❌ Missing projectId');
            return res.status(400).json({
                success: false,
                message: "Missing projectId parameter"
            });
        }
        // Verificar que el userId corresponde al email autorizado
        const { userId } = req.body;
        console.log('🔍 userId:', userId);
        if (!userId || !userId.includes('luisdaniel883@gmail.com')) {
            console.log('❌ Access denied');
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can clear analytics."
            });
        }
        console.log('✅ Authorization passed, proceeding with clear operation');
        // Por ahora, solo devolver éxito sin hacer nada
        return res.status(200).json({
            success: true,
            message: "Analytics data cleared successfully (test mode)",
            data: {
                deletedVisits: 0,
                deletedStats: 0
            }
        });
    }
    catch (error) {
        console.error('❌ Error clearing analytics:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to clear analytics",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.clearAnalytics = clearAnalytics;
