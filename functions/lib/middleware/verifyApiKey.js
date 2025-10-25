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
exports.verifyApiKey = verifyApiKey;
const admin = __importStar(require("firebase-admin"));
const getDb = () => admin.firestore();
async function verifyApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'missing-api-key',
                message: 'API key is required'
            }
        });
    }
    try {
        const db = getDb();
        // Buscar tenant por API key
        const tenantsSnapshot = await db.collection('tenants')
            .where('apiKey', '==', apiKey)
            .limit(1)
            .get();
        if (tenantsSnapshot.empty) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'invalid-api-key',
                    message: 'Invalid API key'
                }
            });
        }
        const tenantDoc = tenantsSnapshot.docs[0];
        const tenantData = tenantDoc.data();
        // Verificar límite de requests diarios
        const today = new Date().toISOString().split('T')[0];
        const usageKey = `usage.${today}`;
        const currentUsage = tenantData[usageKey] || 0;
        if (currentUsage >= 100) {
            return res.status(429).json({
                success: false,
                error: {
                    code: 'rate-limit-exceeded',
                    message: 'Daily request limit exceeded (100 requests/day)'
                }
            });
        }
        // Incrementar contador de uso
        await tenantDoc.ref.update({
            [usageKey]: currentUsage + 1
        });
        // Adjuntar información del tenant al request
        req.tenant = {
            id: tenantDoc.id,
            name: tenantData.name,
            apiKey: apiKey
        };
        next();
    }
    catch (error) {
        console.error('Error verifying API key:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'internal-error',
                message: 'Failed to verify API key'
            }
        });
    }
}
