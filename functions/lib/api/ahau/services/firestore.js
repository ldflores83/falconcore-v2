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
exports.FirestoreService = void 0;
const admin = __importStar(require("firebase-admin"));
class FirestoreService {
    constructor() {
        this.db = admin.firestore();
    }
    async getTenantSettings(tenantId) {
        try {
            const doc = await this.db.doc(`tenants/${tenantId}/settings/default`).get();
            return doc.exists ? doc.data() : null;
        }
        catch (error) {
            console.error('Error getting tenant settings:', error);
            throw error;
        }
    }
    async upsertTenantSettings(tenantId, settings, updatedBy) {
        try {
            const updateData = {
                ...settings,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy
            };
            await this.db.doc(`tenants/${tenantId}/settings/default`).set(updateData, { merge: true });
        }
        catch (error) {
            console.error('Error upserting tenant settings:', error);
            throw error;
        }
    }
    async listMembers(tenantId) {
        try {
            const snapshot = await this.db.collection(`tenants/${tenantId}/members`).get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                };
            });
        }
        catch (error) {
            console.error('Error listing members:', error);
            throw error;
        }
    }
    async inviteMember(tenantId, email, role, createdBy) {
        try {
            const memberData = {
                email: email.toLowerCase(),
                role: role,
                status: 'invited',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy
            };
            // Use email hash as document ID to avoid duplicates
            const emailHash = this.hashEmail(email);
            await this.db.doc(`tenants/${tenantId}/members/${emailHash}`).set(memberData);
        }
        catch (error) {
            console.error('Error inviting member:', error);
            throw error;
        }
    }
    async updateMemberRole(tenantId, memberId, role) {
        try {
            await this.db.doc(`tenants/${tenantId}/members/${memberId}`).update({
                role: role
            });
        }
        catch (error) {
            console.error('Error updating member role:', error);
            throw error;
        }
    }
    async createDraft(tenantId, draft, createdBy) {
        try {
            const draftData = {
                ...draft,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            const docRef = await this.db.collection(`tenants/${tenantId}/drafts`).add(draftData);
            return docRef.id;
        }
        catch (error) {
            console.error('Error creating draft:', error);
            throw error;
        }
    }
    async listDrafts(tenantId, limit) {
        try {
            let query = this.db.collection(`tenants/${tenantId}/drafts`).orderBy('createdAt', 'desc');
            if (limit) {
                query = query.limit(limit);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                };
            });
        }
        catch (error) {
            console.error('Error listing drafts:', error);
            throw error;
        }
    }
    hashEmail(email) {
        // Simple hash function for email
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
}
exports.FirestoreService = FirestoreService;
