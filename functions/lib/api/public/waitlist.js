"use strict";
// /functions/src/api/public/waitlist.ts
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
exports.addToWaitlist = exports.checkLimit = void 0;
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
// Verificar si se puede enviar el formulario
const checkLimit = async (req, res) => {
    console.log('🔍 checkLimit handler called with:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: projectId"
            });
        }
        const db = getFirestore();
        const limit = 6; // Límite configurable
        // Contar submissions activas (pending, synced, in_progress)
        const submissionsSnapshot = await db
            .collection('onboardingaudit_submissions')
            .where('projectId', '==', projectId)
            .where('status', 'in', ['pending', 'synced', 'in_progress'])
            .get();
        const activeSubmissions = submissionsSnapshot.size;
        const canSubmit = activeSubmissions < limit;
        console.log('📊 Limit check result:', {
            projectId,
            activeSubmissions,
            limit,
            canSubmit
        });
        const response = {
            success: true,
            canSubmit,
            activeSubmissions,
            limit,
            message: canSubmit
                ? `You can submit your request. Currently ${activeSubmissions} active submissions.`
                : `We're currently working on ${activeSubmissions} other reports. Please join our waitlist to be notified when a slot becomes available.`
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in checkLimit:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};
exports.checkLimit = checkLimit;
// Agregar entrada al waitlist
const addToWaitlist = async (req, res) => {
    console.log('➕ addToWaitlist handler called with:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    try {
        const { productName, website, email, projectId } = req.body;
        // Validaciones
        if (!productName || !website || !email || !projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: productName, website, email, projectId"
            });
        }
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        const db = getFirestore();
        // Determinar la colección basada en el projectId
        const collectionName = `waitlist_${projectId}`;
        // Verificar si ya existe en waitlist
        const existingEntry = await db
            .collection(collectionName)
            .where('email', '==', email)
            .where('projectId', '==', projectId)
            .get();
        if (!existingEntry.empty) {
            return res.status(400).json({
                success: false,
                message: "You're already on the waitlist for this project"
            });
        }
        // Crear entrada en waitlist
        const waitlistData = {
            productName,
            website,
            email,
            projectId,
            timestamp: new Date(),
            status: 'waiting'
        };
        const docRef = await db.collection(collectionName).add(waitlistData);
        console.log('✅ Waitlist entry added:', {
            entryId: docRef.id,
            email,
            productName,
            projectId
        });
        const response = {
            success: true,
            message: "Successfully added to waitlist. We'll notify you when a slot becomes available!",
            entryId: docRef.id
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in addToWaitlist:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};
exports.addToWaitlist = addToWaitlist;
