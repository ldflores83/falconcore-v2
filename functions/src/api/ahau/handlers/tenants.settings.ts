import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore';
import { TenantSettingsUpdateRequest } from '../types';

export class TenantSettingsHandler {
  private firestoreService: FirestoreService;

  constructor() {
    this.firestoreService = new FirestoreService();
  }

  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { user } = (req as any);

      console.log(`Getting settings for tenant ${tenantId} by user ${user.uid}`);

      const settings = await this.firestoreService.getTenantSettings(tenantId);
      
      if (!settings) {
        // Return default settings structure
        res.json({
          success: true,
          data: {
            tenantName: '',
            logoUrl: '',
            primaryTopic: '',
            about: ''
          }
        });
        return;
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting tenant settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'internal-error',
          message: 'Failed to get tenant settings'
        }
      });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { user } = (req as any);
      const updateData: TenantSettingsUpdateRequest = req.body;

      console.log(`Updating settings for tenant ${tenantId} by user ${user.uid}`);

      // Validate required fields
      if (!updateData.tenantName || !updateData.primaryTopic) {
        res.status(400).json({
          success: false,
          error: {
            code: 'missing-required-fields',
            message: 'tenantName and primaryTopic are required'
          }
        });
        return;
      }

      await this.firestoreService.upsertTenantSettings(tenantId, updateData, user.uid);

      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating tenant settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'internal-error',
          message: 'Failed to update tenant settings'
        }
      });
    }
  }
}
