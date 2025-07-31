import axios from 'axios';
import { OnboardingAuditForm, FormSubmissionResponse, FileUploadResponse } from '../types/form';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-falconcore-v2.cloudfunctions.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export class OnboardingAuditAPI {
  // Submit the main form
  static async submitForm(formData: OnboardingAuditForm): Promise<FormSubmissionResponse> {
    try {
      const response = await api.post('/api/public/receiveForm', {
        formData,
        projectId: 'onboardingaudit',
        clientId: this.generateClientId(),
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting form:', error);
      return {
        success: false,
        message: 'Error submitting form. Please try again.',
      };
    }
  }

  // Upload additional assets (screenshots, etc.)
  static async uploadAsset(file: File, submissionId: string): Promise<FileUploadResponse> {
    try {
      // Convertir archivo a Base64
      const base64Content = await this.fileToBase64(file);
      
      const response = await api.post('/api/public/uploadAsset', {
        submissionId,
        projectId: 'onboardingaudit',
        files: [{
          filename: file.name,
          content: base64Content,
          mimeType: file.type,
          size: file.size,
        }],
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading asset:', error);
      return {
        success: false,
        message: 'Error uploading file. Please try again.',
      };
    }
  }

  // Generate document from template
  static async generateDocument(submissionId: string, template: string): Promise<FormSubmissionResponse> {
    try {
      const response = await api.post('/api/public/generateDocument', {
        projectId: 'onboardingaudit',
        templateId: template,
        filename: `Onboarding_Audit_${submissionId}`,
        data: {
          // Datos del template
          submissionId,
          generatedAt: new Date().toISOString(),
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating document:', error);
      return {
        success: false,
        message: 'Error generating document. Please try again.',
      };
    }
  }

  // Get usage status
  static async getUsageStatus(): Promise<{ filesUploaded: number; mbUsed: number; resetIn: string }> {
    try {
      const response = await api.post('/api/public/getUsageStatus', {
        projectId: 'onboardingaudit',
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting usage status:', error);
      return {
        filesUploaded: 0,
        mbUsed: 0,
        resetIn: '24h',
      };
    }
  }

  // Convert file to Base64
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/jpeg;base64," y obtener solo el Base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Generate a unique client ID
  private static generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 