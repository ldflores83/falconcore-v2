import axios from 'axios';
import { OnboardingAuditForm } from '../types/form';

// Configuración de la API
const API_BASE_URL = '/onboardingaudit';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  withCredentials: false,
});

// Interfaces para las respuestas de la API
export interface FormSubmissionResponse {
  success: boolean;
  submissionId?: string;
  folderId?: string;
  message: string;
}

export interface FileUploadResponse {
  success: boolean;
  fileIds?: string[];
  totalSize?: number;
  message: string;
}

export interface UsageStatusResponse {
  success: boolean;
  filesUploaded?: number;
  mbUsed?: number;
  resetIn?: string;
  message: string;
}

export interface DocumentGenerationResponse {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  message: string;
}

export class OnboardingAuditAPI {
  private static generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

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
      throw new Error('Failed to submit form. Please try again.');
    }
  }

  static async uploadAsset(file: File, submissionId: string, folderId: string, userEmail: string): Promise<FileUploadResponse> {
    try {
      const base64Content = await this.fileToBase64(file);
      const response = await api.post('/api/public/uploadAsset', {
        submissionId,
        folderId,
        userEmail,
        projectId: 'onboardingaudit',
        files: [{ 
          filename: file.name, 
          content: base64Content, 
          mimeType: file.type, 
          size: file.size 
        }],
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading asset:', error);
      throw new Error('Failed to upload file. Please try again.');
    }
  }

  static async getUsageStatus(): Promise<UsageStatusResponse> {
    try {
      const response = await api.post('/api/public/getUsageStatus', {
        projectId: 'onboardingaudit',
      });
      return response.data;
    } catch (error) {
      console.error('Error getting usage status:', error);
      throw new Error('Failed to get usage status. Please try again.');
    }
  }

  static async generateDocument(templateId: string, filename: string, data: Record<string, any>): Promise<DocumentGenerationResponse> {
    try {
      const response = await api.post('/api/public/generateDocument', {
        projectId: 'onboardingaudit',
        templateId,
        filename,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error('Failed to generate document. Please try again.');
    }
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/jpeg;base64," y obtener solo el contenido base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
} 