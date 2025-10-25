"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGenerationHandler = void 0;
const openai_1 = require("../services/openai");
const firestore_1 = require("../services/firestore");
class ContentGenerationHandler {
    constructor() {
        this.openaiService = new openai_1.OpenAIService();
        this.firestoreService = new firestore_1.FirestoreService();
    }
    async generateContent(req, res) {
        try {
            const { user } = req;
            const requestData = req.body;
            console.log(`Generating content for tenant ${requestData.tenantId} by user ${user.uid}`);
            // Validate required fields
            if (!requestData.tenantId || !requestData.prompt) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'missing-required-fields',
                        message: 'tenantId and prompt are required'
                    }
                });
                return;
            }
            // Get tenant settings to get primaryTopic
            const settings = await this.firestoreService.getTenantSettings(requestData.tenantId);
            if (!settings) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'tenant-settings-not-found',
                        message: 'Tenant settings not found'
                    }
                });
                return;
            }
            // Generate content using OpenAI
            const generatedText = await this.openaiService.generateLinkedInPost({
                topic: requestData.topic || settings.primaryTopic,
                prompt: requestData.prompt,
                tenantName: settings.tenantName || 'Your Company'
            });
            res.json({
                success: true,
                data: {
                    text: generatedText
                }
            });
        }
        catch (error) {
            console.error('Error generating content:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'internal-error',
                    message: 'Failed to generate content'
                }
            });
        }
    }
}
exports.ContentGenerationHandler = ContentGenerationHandler;
