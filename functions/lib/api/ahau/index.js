"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ahauRouter = void 0;
const express_1 = require("express");
const auth_1 = require("./middleware/auth");
const tenants_settings_1 = require("./handlers/tenants.settings");
const tenants_members_1 = require("./handlers/tenants.members");
const content_generate_1 = require("./handlers/content.generate");
const firestore_1 = require("./services/firestore");
exports.ahauRouter = (0, express_1.Router)();
// Initialize handlers
const settingsHandler = new tenants_settings_1.TenantSettingsHandler();
const membersHandler = new tenants_members_1.TenantMembersHandler();
const contentHandler = new content_generate_1.ContentGenerationHandler();
const firestoreService = new firestore_1.FirestoreService();
// Apply authentication middleware to all routes
exports.ahauRouter.use(auth_1.verifyFirebaseIdToken);
// Tenant Settings routes
exports.ahauRouter.get('/tenants/:tenantId/settings', auth_1.enforceTenantMembership, settingsHandler.getSettings.bind(settingsHandler));
exports.ahauRouter.put('/tenants/:tenantId/settings', auth_1.enforceTenantMembership, auth_1.requireAdmin, settingsHandler.updateSettings.bind(settingsHandler));
// Tenant Members routes
exports.ahauRouter.get('/tenants/:tenantId/members', auth_1.enforceTenantMembership, auth_1.requireAdmin, membersHandler.listMembers.bind(membersHandler));
exports.ahauRouter.post('/tenants/:tenantId/members/invite', auth_1.enforceTenantMembership, auth_1.requireAdmin, membersHandler.inviteMember.bind(membersHandler));
exports.ahauRouter.patch('/tenants/:tenantId/members/:memberId', auth_1.enforceTenantMembership, auth_1.requireAdmin, membersHandler.updateMemberRole.bind(membersHandler));
// Content Generation routes
exports.ahauRouter.post('/content/generate', contentHandler.generateContent.bind(contentHandler));
// Drafts routes
exports.ahauRouter.post('/tenants/:tenantId/drafts', auth_1.enforceTenantMembership, async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { user } = req;
        const { title, content, topic } = req.body;
        console.log(`Creating draft for tenant ${tenantId} by user ${user.uid}`);
        if (!title || !content) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'missing-required-fields',
                    message: 'title and content are required'
                }
            });
            return;
        }
        const draftId = await firestoreService.createDraft(tenantId, { title, content, topic }, user.uid);
        res.json({
            success: true,
            data: { id: draftId }
        });
    }
    catch (error) {
        console.error('Error creating draft:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'internal-error',
                message: 'Failed to create draft'
            }
        });
    }
});
exports.ahauRouter.get('/tenants/:tenantId/drafts', auth_1.enforceTenantMembership, async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { user } = req;
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        console.log(`Listing drafts for tenant ${tenantId} by user ${user.uid}`);
        const drafts = await firestoreService.listDrafts(tenantId, limit);
        res.json({
            success: true,
            data: drafts
        });
    }
    catch (error) {
        console.error('Error listing drafts:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'internal-error',
                message: 'Failed to list drafts'
            }
        });
    }
});
// Health check
exports.ahauRouter.get('/health', (req, res) => {
    res.json({ success: true, message: 'AHAU API is running' });
});
