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
exports.verifyFirebaseIdToken = verifyFirebaseIdToken;
exports.enforceTenantMembership = enforceTenantMembership;
exports.requireAdmin = requireAdmin;
const admin = __importStar(require("firebase-admin"));
async function verifyFirebaseIdToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'missing-auth-token',
                message: 'Authorization header with Bearer token is required'
            }
        });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({
            success: false,
            error: {
                code: 'invalid-auth-token',
                message: 'Invalid or expired authentication token'
            }
        });
    }
}
async function enforceTenantMembership(req, res, next) {
    const { user } = req;
    const tenantId = req.params.tenantId || req.body.tenantId;
    if (!tenantId) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'missing-tenant-id',
                message: 'Tenant ID is required'
            }
        });
    }
    try {
        const db = admin.firestore();
        const memberDoc = await db.doc(`tenants/${tenantId}/members/${user.uid}`).get();
        if (!memberDoc.exists) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'tenant-access-denied',
                    message: 'User does not have access to this tenant'
                }
            });
        }
        const memberData = memberDoc.data();
        if (memberData?.status !== 'active' && memberData?.status !== 'invited') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'inactive-member',
                    message: 'User membership is not active'
                }
            });
        }
        req.context = {
            ...req.context,
            tenantId,
            userRole: memberData?.role || 'member',
            memberData
        };
        next();
    }
    catch (error) {
        console.error('Error enforcing tenant membership:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'internal-error',
                message: 'Internal server error'
            }
        });
    }
}
async function requireAdmin(req, res, next) {
    const context = req.context;
    if (!context || context.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            error: {
                code: 'admin-required',
                message: 'Admin access required'
            }
        });
    }
    next();
}
