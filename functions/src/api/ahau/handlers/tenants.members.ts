import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore';
import { MemberInviteRequest, MemberUpdateRequest } from '../types';

export class TenantMembersHandler {
  private firestoreService: FirestoreService;

  constructor() {
    this.firestoreService = new FirestoreService();
  }

  async listMembers(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { user } = (req as any);

      console.log(`Listing members for tenant ${tenantId} by user ${user.uid}`);

      const members = await this.firestoreService.listMembers(tenantId);

      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Error listing members:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'internal-error',
          message: 'Failed to list members'
        }
      });
    }
  }

  async inviteMember(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { user } = (req as any);
      const inviteData: MemberInviteRequest = req.body;

      console.log(`Inviting member to tenant ${tenantId} by user ${user.uid}`);

      // Validate required fields
      if (!inviteData.email || !inviteData.role) {
        res.status(400).json({
          success: false,
          error: {
            code: 'missing-required-fields',
            message: 'email and role are required'
          }
        });
        return;
      }

      // Validate role
      if (!['admin', 'member'].includes(inviteData.role)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'invalid-role',
            message: 'role must be either "admin" or "member"'
          }
        });
        return;
      }

      await this.firestoreService.inviteMember(tenantId, inviteData.email, inviteData.role, user.uid);

      res.json({
        success: true,
        message: 'Member invited successfully'
      });
    } catch (error) {
      console.error('Error inviting member:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'internal-error',
          message: 'Failed to invite member'
        }
      });
    }
  }

  async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId, memberId } = req.params;
      const { user } = (req as any);
      const updateData: MemberUpdateRequest = req.body;

      console.log(`Updating member role in tenant ${tenantId} by user ${user.uid}`);

      if (!updateData.role) {
        res.status(400).json({
          success: false,
          error: {
            code: 'missing-role',
            message: 'role is required'
          }
        });
        return;
      }

      // Validate role
      if (!['admin', 'member'].includes(updateData.role)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'invalid-role',
            message: 'role must be either "admin" or "member"'
          }
        });
        return;
      }

      await this.firestoreService.updateMemberRole(tenantId, memberId, updateData.role);

      res.json({
        success: true,
        message: 'Member role updated successfully'
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'internal-error',
          message: 'Failed to update member role'
        }
      });
    }
  }
}
