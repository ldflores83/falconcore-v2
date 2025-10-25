"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSettingsHandler = void 0;
const firestore_1 = require("../services/firestore");
class TenantSettingsHandler {
    constructor() {
        this.firestoreService = new firestore_1.FirestoreService();
    }
    async getSettings(req, res) {
        try {
            const { tenantId } = req.params;
            const { user } = req;
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
        }
        catch (error) {
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
    async updateSettings(req, res) {
        try {
            const { tenantId } = req.params;
            const { user } = req;
            const updateData = req.body;
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
        }
        catch (error) {
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
exports.TenantSettingsHandler = TenantSettingsHandler;
