"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
class OpenAIService {
    constructor() {
        this.apiKey = null;
        this.secretManager = new secret_manager_1.SecretManagerServiceClient();
    }
    async getApiKey() {
        if (this.apiKey) {
            return this.apiKey;
        }
        try {
            const [version] = await this.secretManager.accessSecretVersion({
                name: 'projects/falconcore-v2/secrets/OPENAI_API_KEY/versions/latest'
            });
            this.apiKey = version.payload?.data?.toString() || '';
            return this.apiKey;
        }
        catch (error) {
            console.error('Error getting OpenAI API key from Secret Manager:', error);
            throw new Error('Failed to retrieve OpenAI API key');
        }
    }
    async generateLinkedInPost(params) {
        try {
            const apiKey = await this.getApiKey();
            const systemPrompt = `You are a concise content assistant that writes LinkedIn-ready posts (120–180 words), professional tone, clear structure: Hook / Development / Closing. Avoid hype and buzzwords. Consider the tenant's primaryTopic as context.`;
            const userPrompt = `Generate a LinkedIn post about ${params.prompt}. 
      
Context: The tenant focuses on ${params.topic}.
Company: ${params.tenantName}

Requirements:
- Output in markdown format
- No emojis
- No hashtags
- 120-180 words
- Professional tone
- Clear structure: Hook / Development / Closing`;
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('OpenAI API error:', errorData);
                throw new Error(`OpenAI API error: ${response.status}`);
            }
            const data = await response.json();
            const generatedText = data.choices[0]?.message?.content || '';
            // Clean up the response
            return generatedText.trim();
        }
        catch (error) {
            console.error('Error generating LinkedIn post:', error);
            throw new Error('Failed to generate content');
        }
    }
}
exports.OpenAIService = OpenAIService;
