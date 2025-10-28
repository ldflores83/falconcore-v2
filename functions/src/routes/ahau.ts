import * as admin from 'firebase-admin';
import { Router } from 'express';
import { verifyFirebaseIdToken } from '../middleware/verifyFirebaseIdToken';
import { verifyTenantAccess, verifyAdminAccess } from '../middleware/verifyTenantAccess';
import { makeTenantId } from '../products/ahau/helpers/makeTenantId';

export const ahauRouter = Router();

// Get Firestore instance when needed
const getDb = () => admin.firestore();

ahauRouter.use(verifyFirebaseIdToken);
ahauRouter.use((req, _res, next) => {
  // asegurar JSON
  if (!req.is('application/json')) {
    // permitir vacíos en /session/verify
  }
  next();
});

// POST /api/ahau/session/verify
ahauRouter.post('/session/verify', async (req, res) => {
  const { uid, email } = (req as any).auth;
  const db = getDb();
  const userSnap = await db.doc(`users/${uid}`).get();
  const data = userSnap.exists ? userSnap.data() as any : null;

  return res.json({
    uid,
    email,
    displayName: data?.displayName ?? null,
    tenantId: data?.tenantId ?? null,
    role: data?.role ?? null,
  });
});

// POST /api/ahau/tenants.create
ahauRouter.post('/tenants.create', async (req, res) => {
  const { uid, email } = (req as any).auth;
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({ code: 'invalid/name' });
  }

  const db = getDb();
  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const currentTenant = userSnap.exists ? (userSnap.data() as any).tenantId : null;
  if (currentTenant) {
    return res.status(409).json({ code: 'tenant/already-assigned', tenantId: currentTenant });
  }

  // idempotencia: si ya creó uno
  const existing = await db.collection('accounts').where('createdBy', '==', uid).limit(1).get();
  if (!existing.empty) {
    const acc = existing.docs[0];
    await userRef.set(
      { authUid: uid, email: email ?? null, tenantId: acc.id, role: 'admin' },
      { merge: true }
    );
    return res.json({ tenantId: acc.id });
  }

  const tenantId = makeTenantId(name);
  
  // Create tenant in accounts collection (Milestone A compatibility)
  await db.doc(`accounts/${tenantId}`).set({
    name: name.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: uid,
    status: 'active',
  });

  // Create tenant in tenants collection (Milestone B structure)
  await db.doc(`tenants/${tenantId}`).set({
    id: tenantId,
    name: name.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: uid,
  });

  // Create admin user in tenant
  await db.doc(`tenants/${tenantId}/users/${uid}`).set({
    uid,
    email: email?.toLowerCase() ?? null,
    role: 'admin',
    status: 'active',
    addedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await userRef.set(
    { authUid: uid, email: email ?? null, tenantId, role: 'admin' },
    { merge: true }
  );

  return res.json({ tenantId });
});

// POST /api/ahau/users.invite
ahauRouter.post('/users.invite', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  const { uid } = (req as any).auth;
  const { tenantId, email } = req.body;
  const context = (req as any).context;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'invalid-email',
        message: 'Valid email is required'
      }
    });
  }

  try {
    const db = getDb();
    
    // Check if user already exists in tenant
    const existingUser = await db.collection(`tenants/${tenantId}/users`)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'user-already-invited',
          message: 'User is already a member or has been invited'
        }
      });
    }

    // Create invitation document
    const inviteRef = db.collection(`tenants/${tenantId}/users`).doc();
    await inviteRef.set({
      email: email.toLowerCase(),
      role: 'member',
      status: 'invited',
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      invitedBy: uid
    });

    console.log(`User ${uid} invited ${email} to tenant ${tenantId}`);

    return res.json({
      success: true,
      data: {
        inviteId: inviteRef.id,
        email,
        status: 'invited'
      }
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to invite user'
      }
    });
  }
});

// GET /api/ahau/users.list
ahauRouter.get('/users.list', verifyTenantAccess, async (req, res) => {
  const { tenantId } = req.query;
  const context = (req as any).context;

  try {
    const db = getDb();
    const usersSnapshot = await db.collection(`tenants/${tenantId}/users`).get();
    
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to list users'
      }
    });
  }
});

// POST /api/ahau/users.acceptInvite
ahauRouter.post('/users.acceptInvite', async (req, res) => {
  const { uid, email } = (req as any).auth;
  const { tenantId } = req.body;

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
    const db = getDb();
    
    // Find invitation by email
    const inviteSnapshot = await db.collection(`tenants/${tenantId}/users`)
      .where('email', '==', email?.toLowerCase())
      .where('status', '==', 'invited')
      .limit(1)
      .get();

    if (inviteSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'invitation-not-found',
          message: 'No pending invitation found for this email'
        }
      });
    }

    const inviteDoc = inviteSnapshot.docs[0];
    
    // Update invitation to active user
    await inviteDoc.ref.update({
      uid,
      status: 'active',
      acceptedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`User ${uid} accepted invitation to tenant ${tenantId}`);

    return res.json({
      success: true,
      data: {
        tenantId,
        role: inviteDoc.data().role,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to accept invitation'
      }
    });
  }
});

// POST /api/ahau/tenant.update
ahauRouter.post('/tenant.update', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  const { tenantId, name, logoUrl } = req.body;
  const context = (req as any).context;

  try {
    const db = getDb();
    const updateData: any = {};
    
    if (name && typeof name === 'string' && name.trim().length >= 3) {
      updateData.name = name.trim();
    }
    
    if (logoUrl && typeof logoUrl === 'string') {
      updateData.logoUrl = logoUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'no-updates',
          message: 'No valid updates provided'
        }
      });
    }

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updateData.updatedBy = (req as any).auth.uid;

    await db.doc(`tenants/${tenantId}`).update(updateData);

    console.log(`Tenant ${tenantId} updated by user ${(req as any).auth.uid}`);

    return res.json({
      success: true,
      data: updateData
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to update tenant'
      }
    });
  }
});

// POST /api/ahau/drafts.create
ahauRouter.post('/drafts.create', verifyTenantAccess, async (req, res) => {
  const { uid } = (req as any).auth;
  const { tenantId, title, content } = req.body;
  const context = (req as any).context;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'invalid-title',
        message: 'Valid title is required'
      }
    });
  }

  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'invalid-content',
        message: 'Content is required'
      }
    });
  }

  try {
    const db = getDb();
    const draftRef = db.collection(`tenants/${tenantId}/drafts`).doc();
    
    await draftRef.set({
      title: title.trim(),
      content,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Draft created by user ${uid} in tenant ${tenantId}`);

    return res.json({
      success: true,
      data: {
        id: draftRef.id,
        title: title.trim(),
        content,
        createdBy: uid
      }
    });
  } catch (error) {
    console.error('Error creating draft:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to create draft'
      }
    });
  }
});

// GET /api/ahau/drafts.list
ahauRouter.get('/drafts.list', verifyTenantAccess, async (req, res) => {
  const { tenantId } = req.query;
  const context = (req as any).context;

  try {
    const db = getDb();
    const draftsSnapshot = await db.collection(`tenants/${tenantId}/drafts`)
      .orderBy('createdAt', 'desc')
      .get();
    
    const drafts = draftsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      data: drafts
    });
  } catch (error) {
    console.error('Error listing drafts:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to list drafts'
      }
    });
  }
});

// ===== MILESTONE C ROUTES =====

// GET /api/ahau/tenants/:tenantId/settings
ahauRouter.get('/tenants/:tenantId/settings', verifyTenantAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const db = getDb();

    console.log(`Getting settings for tenant ${tenantId} by user ${uid}`);

    const settingsDoc = await db.doc(`tenants/${tenantId}/settings/default`).get();
    
    if (!settingsDoc.exists) {
      // Return default settings structure
      return res.json({
        success: true,
        data: {
          tenantName: '',
          logoUrl: '',
          primaryTopic: '',
          about: ''
        }
      });
    }

    const settings = settingsDoc.data();
    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting tenant settings:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to get tenant settings'
      }
    });
  }
});

// PUT /api/ahau/tenants/:tenantId/settings
ahauRouter.put('/tenants/:tenantId/settings', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const { tenantName, logoUrl, primaryTopic, about } = req.body;
    const db = getDb();

    console.log(`Updating settings for tenant ${tenantId} by user ${uid}`);

    // Validate required fields
    if (!tenantName || !primaryTopic) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-required-fields',
          message: 'tenantName and primaryTopic are required'
        }
      });
    }

    const updateData = {
      tenantName: tenantName.trim(),
      logoUrl: logoUrl || null,
      primaryTopic: primaryTopic.trim(),
      about: about || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: uid
    };

    await db.doc(`tenants/${tenantId}/settings/default`).set(updateData, { merge: true });

    return res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating tenant settings:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to update tenant settings'
      }
    });
  }
});

// GET /api/ahau/tenants/:tenantId/members
ahauRouter.get('/tenants/:tenantId/members', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const db = getDb();

    console.log(`Listing members for tenant ${tenantId} by user ${uid}`);

    const membersSnapshot = await db.collection(`tenants/${tenantId}/members`).get();
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error listing members:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to list members'
      }
    });
  }
});

// POST /api/ahau/tenants/:tenantId/members/invite
ahauRouter.post('/tenants/:tenantId/members/invite', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const { email, role } = req.body;
    const db = getDb();

    console.log(`Inviting member to tenant ${tenantId} by user ${uid}`);

    // Validate required fields
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-required-fields',
          message: 'email and role are required'
        }
      });
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid-role',
          message: 'role must be either "admin" or "member"'
        }
      });
    }

    // Use email hash as document ID to avoid duplicates
    const emailHash = hashEmail(email.toLowerCase());
    
    const memberData = {
      email: email.toLowerCase(),
      role,
      status: 'invited',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid
    };

    await db.doc(`tenants/${tenantId}/members/${emailHash}`).set(memberData);

    return res.json({
      success: true,
      message: 'Member invited successfully'
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to invite member'
      }
    });
  }
});

// PATCH /api/ahau/tenants/:tenantId/members/:memberId
ahauRouter.patch('/tenants/:tenantId/members/:memberId', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId, memberId } = req.params;
    const { uid } = (req as any).auth;
    const { role } = req.body;
    const db = getDb();

    console.log(`Updating member role in tenant ${tenantId} by user ${uid}`);

    if (!role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-role',
          message: 'role is required'
        }
      });
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid-role',
          message: 'role must be either "admin" or "member"'
        }
      });
    }

    await db.doc(`tenants/${tenantId}/members/${memberId}`).update({
      role
    });

    return res.json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to update member role'
      }
    });
  }
});

// POST /api/ahau/content/generate
ahauRouter.post('/content/generate', async (req, res) => {
  try {
    const { uid } = (req as any).auth;
    const { tenantId, prompt, topic, profileId, templateId } = req.body;

    console.log(`Generating content for tenant ${tenantId} by user ${uid}`);

    // Validate required fields
    if (!tenantId || !prompt) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-required-fields',
          message: 'tenantId and prompt are required'
        }
      });
    }

    const db = getDb();
    let profile = null;
    let template = null;

    // Get profile if specified
    if (profileId) {
      const profileDoc = await db.doc(`tenants/${tenantId}/profiles/${profileId}`).get();
      if (profileDoc.exists) {
        profile = profileDoc.data();
      }
    }

    // Get template if specified
    if (templateId) {
      const templateDoc = await db.doc(`tenants/${tenantId}/templates/${templateId}`).get();
      if (templateDoc.exists) {
        template = templateDoc.data();
      }
    }

    // Enhanced prompt with profile tone and template structure
    let enhancedPrompt = prompt;
    if (profile?.tone) {
      enhancedPrompt += `\n\nTone: Clarity ${profile.tone.clarity}/10, Warmth ${profile.tone.warmth}/10, Energy ${profile.tone.energy}/10, Sobriety ${profile.tone.sobriety}/10`;
    }
    if (template?.blocks) {
      enhancedPrompt += `\n\nTemplate structure: ${template.blocks.join(' → ')}`;
    }

    // For now, return a mock response with enhanced context
    const mockResponse = `# LinkedIn Post Generated

**Profile**: ${profile?.displayName || 'Default'} (${profile?.role || 'Team Member'})
**Template**: ${template?.name || 'Standard Post'}

This is a professional LinkedIn post about ${prompt}.

**Key Points:**
- Professional tone and structure
- Clear hook, development, and closing
- Focused on ${topic || 'your business area'}
- Optimized for engagement
- Tone applied: ${profile?.tone ? `Clarity ${profile.tone.clarity}, Warmth ${profile.tone.warmth}, Energy ${profile.tone.energy}, Sobriety ${profile.tone.sobriety}` : 'Default'}

*Generated by AHAU Content Copilot*`;

    return res.json({
      success: true,
      data: {
        text: mockResponse,
        profile: profile?.displayName,
        template: template?.name
      }
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to generate content'
      }
    });
  }
});

// ===== MILESTONE D ROUTES =====

// GET /api/ahau/tenants/:tenantId/profiles
ahauRouter.get('/tenants/:tenantId/profiles', verifyTenantAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const db = getDb();

    console.log(`Getting profiles for tenant ${tenantId} by user ${uid}`);

    const profilesSnapshot = await db.collection(`tenants/${tenantId}/profiles`).get();
    const profiles = profilesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Error getting profiles:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to get profiles'
      }
    });
  }
});

// POST /api/ahau/tenants/:tenantId/profiles
ahauRouter.post('/tenants/:tenantId/profiles', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const { displayName, role, avatarUrl, tone, dos, donts, samples } = req.body;
    const db = getDb();

    console.log(`Creating profile for tenant ${tenantId} by user ${uid}`);

    // Validate required fields
    if (!displayName || !role || !tone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-required-fields',
          message: 'displayName, role, and tone are required'
        }
      });
    }

    const profileData = {
      displayName: displayName.trim(),
      role: role.trim(),
      avatarUrl: avatarUrl || null,
      tone: {
        clarity: tone.clarity || 5,
        warmth: tone.warmth || 5,
        energy: tone.energy || 5,
        sobriety: tone.sobriety || 5
      },
      dos: dos || [],
      donts: donts || [],
      samples: samples || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid
    };

    const profileRef = await db.collection(`tenants/${tenantId}/profiles`).add(profileData);

    return res.json({
      success: true,
      data: {
        id: profileRef.id,
        ...profileData
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to create profile'
      }
    });
  }
});

// PUT /api/ahau/tenants/:tenantId/profiles/:id
ahauRouter.put('/tenants/:tenantId/profiles/:id', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId, id } = req.params;
    const { uid } = (req as any).auth;
    const { displayName, role, avatarUrl, tone, dos, donts, samples } = req.body;
    const db = getDb();

    console.log(`Updating profile ${id} for tenant ${tenantId} by user ${uid}`);

    const updateData: any = {};
    
    if (displayName) updateData.displayName = displayName.trim();
    if (role) updateData.role = role.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (tone) updateData.tone = tone;
    if (dos) updateData.dos = dos;
    if (donts) updateData.donts = donts;
    if (samples) updateData.samples = samples;

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updateData.updatedBy = uid;

    await db.doc(`tenants/${tenantId}/profiles/${id}`).update(updateData);

    return res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to update profile'
      }
    });
  }
});

// GET /api/ahau/tenants/:tenantId/templates
ahauRouter.get('/tenants/:tenantId/templates', verifyTenantAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const db = getDb();

    console.log(`Getting templates for tenant ${tenantId} by user ${uid}`);

    const templatesSnapshot = await db.collection(`tenants/${tenantId}/templates`).get();
    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to get templates'
      }
    });
  }
});

// POST /api/ahau/tenants/:tenantId/templates
ahauRouter.post('/tenants/:tenantId/templates', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const { name, description, blocks } = req.body;
    const db = getDb();

    console.log(`Creating template for tenant ${tenantId} by user ${uid}`);

    // Validate required fields
    if (!name || !blocks) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-required-fields',
          message: 'name and blocks are required'
        }
      });
    }

    const templateData = {
      name: name.trim(),
      description: description || '',
      blocks: blocks,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid
    };

    const templateRef = await db.collection(`tenants/${tenantId}/templates`).add(templateData);

    return res.json({
      success: true,
      data: {
        id: templateRef.id,
        ...templateData
      }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to create template'
      }
    });
  }
});

// POST /api/ahau/tenants/:tenantId/drafts/:id/review
ahauRouter.post('/tenants/:tenantId/drafts/:id/review', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId, id } = req.params;
    const { uid } = (req as any).auth;
    const { status, notes } = req.body;
    const db = getDb();

    console.log(`Reviewing draft ${id} for tenant ${tenantId} by user ${uid}`);

    // Validate status
    if (!['reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid-status',
          message: 'status must be reviewed, approved, or rejected'
        }
      });
    }

    const reviewData = {
      status,
      review: {
        reviewerUid: uid,
        notes: notes || '',
        reviewedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.doc(`tenants/${tenantId}/drafts/${id}`).update(reviewData);

    // Award points for review/approval
    if (status === 'approved') {
      await awardPoints(tenantId, uid, 'approve', 10);
    }

    return res.json({
      success: true,
      message: 'Draft reviewed successfully'
    });
  } catch (error) {
    console.error('Error reviewing draft:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to review draft'
      }
    });
  }
});

// POST /api/ahau/tenants/:tenantId/calendar/schedule
ahauRouter.post('/tenants/:tenantId/calendar/schedule', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const { dateISO, time, ownerProfileId, draftId } = req.body;
    const db = getDb();

    console.log(`Scheduling content for tenant ${tenantId} by user ${uid}`);

    // Validate required fields
    if (!dateISO || !time || !ownerProfileId || !draftId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-required-fields',
          message: 'dateISO, time, ownerProfileId, and draftId are required'
        }
      });
    }

    const slotData = {
      dateISO,
      time,
      ownerProfileId,
      draftId,
      status: 'scheduled',
      scheduledAt: admin.firestore.FieldValue.serverTimestamp(),
      scheduledBy: uid
    };

    const slotId = `${dateISO}_${time.replace(':', '-')}`;
    await db.doc(`tenants/${tenantId}/calendar/${dateISO.substring(0, 7)}/${slotId}`).set(slotData);

    // Award points for scheduling
    await awardPoints(tenantId, uid, 'schedule', 5);

    return res.json({
      success: true,
      data: {
        slotId,
        ...slotData
      }
    });
  } catch (error) {
    console.error('Error scheduling content:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to schedule content'
      }
    });
  }
});

// GET /api/ahau/tenants/:tenantId/metrics/summary
ahauRouter.get('/tenants/:tenantId/metrics/summary', verifyTenantAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const db = getDb();

    console.log(`Getting metrics summary for tenant ${tenantId} by user ${uid}`);

    // Get drafts by status
    const draftsSnapshot = await db.collection(`tenants/${tenantId}/drafts`).get();
    const drafts = draftsSnapshot.docs.map(doc => doc.data());

    const metrics = {
      totalDrafts: drafts.length,
      draftsByStatus: {
        idea: drafts.filter(d => d.status === 'idea').length,
        draft: drafts.filter(d => d.status === 'draft').length,
        reviewed: drafts.filter(d => d.status === 'reviewed').length,
        approved: drafts.filter(d => d.status === 'approved').length
      },
      draftsByOwner: {} as Record<string, number>
    };

    // Group by owner
    drafts.forEach(draft => {
      const owner = (draft as any).ownerProfileId || 'unknown';
      metrics.draftsByOwner[owner] = (metrics.draftsByOwner[owner] || 0) + 1;
    });

    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to get metrics'
      }
    });
  }
});

// Helper function for email hashing
function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Helper function to award points
async function awardPoints(tenantId: string, uid: string, action: string, points: number) {
  try {
    const db = getDb();
    const week = getWeekKey();
    
    const pointsRef = db.doc(`tenants/${tenantId}/points/${uid}/${week}`);
    const pointsDoc = await pointsRef.get();
    
    const currentPoints = pointsDoc.exists ? pointsDoc.data()?.points || 0 : 0;
    const currentStreak = pointsDoc.exists ? pointsDoc.data()?.streak || 0 : 0;
    
    await pointsRef.set({
      points: currentPoints + points,
      streak: currentStreak + 1,
      lastAction: action,
      lastActionAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`Awarded ${points} points to user ${uid} for action ${action}`);
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

// Helper function to get week key (YYYY-WW format)
function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil(days / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

// ===== MILESTONE E ROUTES =====

// POST /api/ahau/publish
ahauRouter.post('/publish', verifyTenantAccess, async (req, res) => {
  try {
    const { uid } = (req as any).auth;
    const { tenantId } = (req as any).tenant;
    const { draftId, isCompanyPage = false } = req.body;

    console.log(`Publishing draft ${draftId} for tenant ${tenantId} by user ${uid}`);

    if (!draftId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-draft-id',
          message: 'draftId is required'
        }
      });
    }

    const db = getDb();

    // Get draft
    const draftDoc = await db.doc(`tenants/${tenantId}/drafts/${draftId}`).get();
    if (!draftDoc.exists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'draft-not-found',
          message: 'Draft not found'
        }
      });
    }

    const draftData = draftDoc.data();
    if (draftData?.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'draft-not-approved',
          message: 'Only approved drafts can be published'
        }
      });
    }

    // Publish to LinkedIn
    const { LinkedInClient } = require('../products/ahau/helpers/linkedinClient');
    const linkedInClient = await LinkedInClient.getClientForTenant(tenantId);
    const linkedInPostId = await linkedInClient.publishPost(draftData.content, isCompanyPage);

    // Save post to Firestore
    const postRef = db.collection(`tenants/${tenantId}/posts`).doc();
    await postRef.set({
      draftId,
      linkedInId: linkedInPostId,
      content: draftData.content,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagementRate: 0,
      isCompanyPage,
      publishedBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update draft status
    await draftDoc.ref.update({
      status: 'published',
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      linkedInPostId: linkedInPostId
    });

    // Award points for publishing
    await awardPoints(tenantId, uid, 'publish', 20);

    return res.json({
      success: true,
      data: {
        postId: postRef.id,
        linkedInPostId,
        message: 'Post published successfully'
      }
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to publish post'
      }
    });
  }
});

// GET /api/ahau/metrics/posts
ahauRouter.get('/metrics/posts', verifyTenantAccess, async (req, res) => {
  try {
    const { uid } = (req as any).auth;
    const { tenantId } = (req as any).tenant;
    const db = getDb();

    console.log(`Getting posts metrics for tenant ${tenantId} by user ${uid}`);

    const postsSnapshot = await db.collection(`tenants/${tenantId}/posts`).get();
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Calculate aggregated metrics
    const totalPosts = posts.length;
    const totalImpressions = posts.reduce((sum, post) => sum + (post.impressions || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
    const avgEngagementRate = totalPosts > 0 
      ? posts.reduce((sum, post) => sum + (post.engagementRate || 0), 0) / totalPosts 
      : 0;

    // Group by profile tone (if available)
    const postsByProfile: Record<string, { count: number; totalImpressions: number; totalEngagement: number }> = {};
    for (const post of posts) {
      const draftDoc = await db.doc(`tenants/${tenantId}/drafts/${post.draftId}`).get();
      if (draftDoc.exists) {
        const draftData = draftDoc.data();
        const profileId = draftData?.ownerProfileId;
        if (profileId) {
          if (!postsByProfile[profileId]) {
            postsByProfile[profileId] = {
              count: 0,
              totalImpressions: 0,
              totalEngagement: 0
            };
          }
          postsByProfile[profileId].count++;
          postsByProfile[profileId].totalImpressions += post.impressions || 0;
          postsByProfile[profileId].totalEngagement += (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
        }
      }
    }

    return res.json({
      success: true,
      data: {
        totalPosts,
        totalImpressions,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        postsByProfile,
        posts: posts.map(post => ({
          id: post.id,
          draftId: post.draftId,
          linkedInId: post.linkedInId,
          impressions: post.impressions,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          engagementRate: post.engagementRate,
          createdAt: post.createdAt,
          isCompanyPage: post.isCompanyPage
        }))
      }
    });
  } catch (error) {
    console.error('Error getting posts metrics:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to get posts metrics'
      }
    });
  }
});

// GET /api/ahau/metrics/posts/:id
ahauRouter.get('/metrics/posts/:id', verifyTenantAccess, async (req, res) => {
  try {
    const { uid } = (req as any).auth;
    const { tenantId } = (req as any).tenant;
    const { id } = req.params;
    const db = getDb();

    console.log(`Getting metrics for post ${id} in tenant ${tenantId} by user ${uid}`);

    const postDoc = await db.doc(`tenants/${tenantId}/posts/${id}`).get();
    if (!postDoc.exists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'post-not-found',
          message: 'Post not found'
        }
      });
    }

    const postData = postDoc.data() as any;

    // Try to refresh metrics from LinkedIn
    try {
      const { LinkedInClient } = require('../products/ahau/helpers/linkedinClient');
      const linkedInClient = await LinkedInClient.getClientForTenant(tenantId);
      const freshMetrics = await linkedInClient.getPostMetrics(postData.linkedInId);

      // Update Firestore with fresh metrics
      await postDoc.ref.update({
        ...freshMetrics,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.json({
        success: true,
        data: {
          id: postDoc.id,
          draftId: postData.draftId,
          linkedInId: postData.linkedInId,
          ...freshMetrics,
          createdAt: postData.createdAt,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      });
    } catch (linkedInError) {
      console.error('Error fetching LinkedIn metrics:', linkedInError);
      // Return cached metrics if LinkedIn is unavailable
      return res.json({
        success: true,
        data: {
          id: postDoc.id,
          draftId: postData.draftId,
          linkedInId: postData.linkedInId,
          impressions: postData.impressions,
          likes: postData.likes,
          comments: postData.comments,
          shares: postData.shares,
          engagementRate: postData.engagementRate,
          createdAt: postData.createdAt,
          updatedAt: postData.updatedAt,
          note: 'Using cached metrics (LinkedIn API unavailable)'
        }
      });
    }
  } catch (error) {
    console.error('Error getting post metrics:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to get post metrics'
      }
    });
  }
});

// POST /api/ahau/tenants/:tenantId/generate-api-key
ahauRouter.post('/tenants/:tenantId/generate-api-key', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const db = getDb();

    console.log(`Generating API key for tenant ${tenantId} by user ${uid}`);

    // Generate a secure API key
    const apiKey = 'ahau_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Update tenant with new API key
    await db.doc(`tenants/${tenantId}`).update({
      apiKey,
      apiKeyGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      apiKeyGeneratedBy: uid
    });

    return res.json({
      success: true,
      data: {
        apiKey,
        message: 'API key generated successfully'
      }
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to generate API key'
      }
    });
  }
});

// POST /api/ahau/tenants/:tenantId/linkedin-config
ahauRouter.post('/tenants/:tenantId/linkedin-config', verifyTenantAccess, verifyAdminAccess, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { uid } = (req as any).auth;
    const { linkedInToken, linkedInOrganizationId } = req.body;
    const db = getDb();

    console.log(`Configuring LinkedIn for tenant ${tenantId} by user ${uid}`);

    if (!linkedInToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing-linkedin-token',
          message: 'LinkedIn token is required'
        }
      });
    }

    // Update tenant with LinkedIn configuration
    await db.doc(`tenants/${tenantId}`).update({
      linkedInToken,
      linkedInOrganizationId: linkedInOrganizationId || null,
      linkedInConfiguredAt: admin.firestore.FieldValue.serverTimestamp(),
      linkedInConfiguredBy: uid
    });

    return res.json({
      success: true,
      data: {
        message: 'LinkedIn configuration updated successfully'
      }
    });
  } catch (error) {
    console.error('Error configuring LinkedIn:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to configure LinkedIn'
      }
    });
  }
});

// Public API routes removed; verifyApiKey middleware no longer available
