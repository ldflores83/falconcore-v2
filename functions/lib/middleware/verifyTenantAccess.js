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
exports.verifyTenantAccess = verifyTenantAccess;
exports.verifyAdminAccess = verifyAdminAccess;
const admin = __importStar(require("firebase-admin"));
async function verifyTenantAccess(req, res, next) {
    const { uid } = req.auth;
    const tenantId = req.body?.tenantId || req.query?.tenantId;
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
        const getDb = () => admin.firestore();
        const userDoc = await getDb().doc(`tenants/${tenantId}/users/${uid}`).get();
        if (!userDoc.exists) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'tenant-access-denied',
                    message: 'User does not have access to this tenant'
                }
            });
        }
        const userData = userDoc.data();
        req.context = {
            ...req.context,
            tenantId,
            role: userData.role,
            userStatus: userData.status
        };
        next();
    }
    catch (error) {
        console.error('Error verifying tenant access:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'internal-error',
                message: 'Internal server error'
            }
        });
    }
}
async function verifyAdminAccess(req, res, next) {
    const context = req.context;
    if (!context || context.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: {
                code: 'admin-access-required',
                message: 'Admin access required'
            }
        });
    }
    next();
}
