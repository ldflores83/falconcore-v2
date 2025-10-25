import { Router } from 'express';
import { verifyFirebaseIdToken, enforceTenantMembership, requireAdmin } from './middleware/auth';
import { TenantSettingsHandler } from './handlers/tenants.settings';
import { TenantMembersHandler } from './handlers/tenants.members';
import { ContentGenerationHandler } from './handlers/content.generate';
import { FirestoreService } from './services/firestore';

export const ahauRouter = Router();

// Initialize handlers
const settingsHandler = new TenantSettingsHandler();
const membersHandler = new TenantMembersHandler();
const contentHandler = new ContentGenerationHandler();
const firestoreService = new FirestoreService();

// Apply authentication middleware to all routes
ahauRouter.use(verifyFirebaseIdToken);

// Tenant Settings routes
ahauRouter.get('/tenants/:tenantId/settings', enforceTenantMembership, settingsHandler.getSettings.bind(settingsHandler));
ahauRouter.put('/tenants/:tenantId/settings', enforceTenantMembership, requireAdmin, settingsHandler.updateSettings.bind(settingsHandler));

// Tenant Members routes
ahauRouter.get('/tenants/:tenantId/members', enforceTenantMembership, requireAdmin, membersHandler.listMembers.bind(membersHandler));
ahauRouter.post('/tenants/:tenantId/members/invite', enforceTenantMembership, requireAdmin, membersHandler.inviteMember.bind(membersHandler));
ahauRouter.patch('/tenants/:tenantId/members/:memberId', enforceTenantMembership, requireAdmin, membersHandler.updateMemberRole.bind(membersHandler));

// Content Generation routes
ahauRouter.post('/content/generate', contentHandler.generateContent.bind(contentHandler));

// Drafts routes
ahauRouter.post('/tenants/:tenantId/drafts', enforceTenantMembership, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { user } = (req as any);
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
  } catch (error) {
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

ahauRouter.get('/tenants/:tenantId/drafts', enforceTenantMembership, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { user } = (req as any);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    console.log(`Listing drafts for tenant ${tenantId} by user ${user.uid}`);

    const drafts = await firestoreService.listDrafts(tenantId, limit);

    res.json({
      success: true,
      data: drafts
    });
  } catch (error) {
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
ahauRouter.get('/health', (req, res) => {
  res.json({ success: true, message: 'AHAU API is running' });
});
