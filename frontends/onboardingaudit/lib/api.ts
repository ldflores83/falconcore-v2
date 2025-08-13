import axios from 'axios';
import { OnboardingAuditForm } from '../types/form';

// Configuración de la API - URLs absolutas del backend
const API_BASE_URL = 'https://api-fu54nvsqfa-uc.a.run.app/api/public';

// Configurar axios con interceptors para mejor performance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para cache de requests
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

api.interceptors.request.use((config) => {
  // Cache para requests GET
  if (config.method === 'get') {
    const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Retornar una respuesta simulada para requests cacheados
      const cachedResponse = {
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config,
        request: {}
      };
      return Promise.reject({
        __cached: true,
        response: cachedResponse
      });
    }
  }
  return config;
});

api.interceptors.response.use((response) => {
  // Guardar en cache para requests GET
  if (response.config.method === 'get') {
    const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
    requestCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
  }
  return response;
}, (error) => {
  // Manejar respuestas cacheadas
  if (error.__cached) {
    return Promise.resolve(error.response);
  }
  return Promise.reject(error);
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

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Web Worker para procesamiento de archivos
class FileProcessor {
  private worker: Worker | null = null;
  private callbacks = new Map<string, { resolve: Function; reject: Function }>();

  constructor() {
    if (typeof window !== 'undefined') {
      // Detectar si es dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('🔧 FileProcessor: Device type - Mobile:', isMobile, 'User Agent:', navigator.userAgent);
      
      // En móviles, usar fallback por defecto para evitar problemas de compatibilidad
      if (isMobile) {
        console.log('📱 Mobile device detected, using FileReader fallback by default');
        this.worker = null;
        return;
      }
      
      try {
        console.log('🔧 FileProcessor: Attempting to create Web Worker...');
        this.worker = new Worker('/onboardingaudit/worker.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        this.worker.onerror = (error) => {
          console.error('❌ Web Worker error:', error);
        };
        console.log('✅ Web Worker created successfully');
      } catch (error) {
        console.error('❌ Failed to create Web Worker, will use fallback:', error);
        this.worker = null;
      }
    } else {
      console.log('🔧 FileProcessor: Not in browser environment, Web Worker not available');
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { id, result, error } = event.data;
    const callback = this.callbacks.get(id);
    
    if (callback) {
      this.callbacks.delete(id);
      if (error) {
        callback.reject(new Error(error));
      } else {
        callback.resolve(result);
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async convertToBase64(file: File): Promise<string> {
    console.log('🔄 convertToBase64 called for file:', file.name, 'size:', file.size, 'type:', file.type);
    
    if (!this.worker) {
      console.log('🔄 No Web Worker available, using fallback method');
      return this.fileToBase64Fallback(file);
    }

    console.log('🔄 Using Web Worker for file conversion');
    
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      this.callbacks.set(id, { resolve, reject });
      
      // Timeout para evitar que se quede colgado
      const timeout = setTimeout(() => {
        console.error('❌ Web Worker timeout for file:', file.name);
        this.callbacks.delete(id);
        reject(new Error('Web Worker timeout'));
      }, 30000); // 30 segundos
      
      try {
        this.worker!.postMessage({ id, type: 'CONVERT_TO_BASE64', file });
        console.log('📤 Message sent to Web Worker for file:', file.name);
      } catch (error) {
        console.error('❌ Error sending message to Web Worker:', error);
        clearTimeout(timeout);
        this.callbacks.delete(id);
        reject(error);
      }
    }).then(result => {
      console.log('🔍 Web Worker result received for file:', file.name, 'type:', typeof result);
      
      if (typeof result === 'object' && result !== null) {
        if ((result as any).base64) {
          const base64Content = (result as any).base64;
          console.log('✅ Extracted base64 from Web Worker result, length:', base64Content.length);
          return base64Content;
        } else {
          console.error('❌ Web Worker result object missing base64 property:', result);
          throw new Error('Web Worker result missing base64 content');
        }
      } else if (typeof result === 'string') {
        console.log('✅ Web Worker returned string directly, length:', result.length);
        return result;
      } else {
        console.error('❌ Unexpected Web Worker result type:', typeof result, result);
        throw new Error(`Unexpected Web Worker result type: ${typeof result}`);
      }
    }).catch(error => {
      console.error('❌ Error in convertToBase64 for file:', file.name, error);
      // Si falla el Web Worker, intentar con el fallback
      console.log('🔄 Falling back to FileReader method for file:', file.name);
      return this.fileToBase64Fallback(file);
    });
  }

  async validateFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    if (!this.worker) {
      return this.validateFileFallback(file);
    }

    return new Promise((resolve, reject) => {
      const id = this.generateId();
      this.callbacks.set(id, { resolve, reject });
      this.worker!.postMessage({ id, type: 'VALIDATE_FILE', file });
    });
  }

  async compressImage(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number; compressionRatio: string }> {
    if (!this.worker) {
      return this.compressImageFallback(file);
    }

    return new Promise((resolve, reject) => {
      const id = this.generateId();
      this.callbacks.set(id, { resolve, reject });
      this.worker!.postMessage({ id, type: 'COMPRESS_IMAGE', file });
    });
  }

  private fileToBase64Fallback(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 Using FileReader fallback for file:', file.name);
        
        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const result = reader.result as string;
            console.log('📖 FileReader result type:', typeof result, 'length:', result.length);
            
            if (typeof result === 'string' && result.includes(',')) {
              // Extraer solo el contenido base64, sin el prefijo data:image/jpeg;base64,
              const base64Content = result.split(',')[1];
              console.log('✅ Extracted base64 from FileReader, length:', base64Content.length);
              resolve(base64Content);
            } else {
              console.error('❌ FileReader result format unexpected:', result);
              reject(new Error('FileReader result format unexpected'));
            }
          } catch (error) {
            console.error('❌ Error processing FileReader result:', error);
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error('❌ FileReader error for file:', file.name, error);
          reject(error);
        };
        
        reader.onabort = () => {
          console.error('❌ FileReader aborted for file:', file.name);
          reject(new Error('FileReader aborted'));
        };
        
        console.log('📖 Starting FileReader.readAsDataURL for file:', file.name);
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('❌ Error setting up FileReader fallback:', error);
        reject(error);
      }
    });
  }

  private validateFileFallback(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validation: { isValid: boolean; errors: string[] } = {
      isValid: true,
      errors: []
    };

    if (file.size > maxSize) {
      validation.isValid = false;
      validation.errors.push('File size exceeds 10MB limit');
    }

    return Promise.resolve(validation);
  }

  private async compressImageFallback(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number; compressionRatio: string }> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 Using fallback compression for:', file.name);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('❌ Canvas 2D context not available');
          reject(new Error('Canvas 2D context not available'));
          return;
        }
        
        const img = new Image();
        
        img.onload = () => {
          try {
            // Redimensionar si es muy grande
            const maxWidth = 1200;
            const maxHeight = 1200;
            
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const originalSize = file.size;
                const compressedSize = blob.size;
                const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                
                console.log('✅ Fallback compression successful:', {
                  filename: file.name,
                  originalSize,
                  compressedSize,
                  ratio: `${compressionRatio}%`
                });
                
                resolve({
                  blob,
                  originalSize,
                  compressedSize,
                  compressionRatio: `${compressionRatio}%`
                });
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            }, 'image/jpeg', 0.8);
          } catch (error) {
            console.error('❌ Error in fallback compression:', error);
            reject(error);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error('❌ Error setting up fallback compression:', error);
        reject(error);
      }
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export class OnboardingAuditClient {
  private static generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cache para clientId
  private static cachedClientId: string | null = null;
  private static clientIdTimestamp = 0;
  private static CLIENT_ID_CACHE_DURATION = 60 * 1000; // 1 minuto

  private static getClientId(): string {
    const now = Date.now();
    if (!this.cachedClientId || (now - this.clientIdTimestamp) > this.CLIENT_ID_CACHE_DURATION) {
      this.cachedClientId = this.generateClientId();
      this.clientIdTimestamp = now;
    }
    return this.cachedClientId;
  }

  static async submitForm(formData: OnboardingAuditForm): Promise<FormSubmissionResponse> {
    try {
      const response = await api.post('/receiveForm', {
        formData,
        projectId: 'onboardingaudit',
        clientId: this.getClientId()
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit form'
      };
    }
  }

  static async uploadAsset(file: File, submissionId: string, folderId: string, userEmail: string): Promise<FileUploadResponse> {
    try {
      const fileProcessor = new FileProcessor();
      const base64Content = await fileProcessor.convertToBase64(file);
      
      const response = await api.post('/uploadAsset', {
        submissionId,
        folderId,
        userEmail,
        files: [{
          filename: file.name,
          content: base64Content,
          mimeType: file.type,
          size: file.size
        }],
        projectId: 'onboardingaudit'
      });

      fileProcessor.destroy();
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload file'
      };
    }
  }

  // Nuevo método para subir múltiples archivos de una vez
  static async uploadMultipleAssets(files: File[], submissionId: string, folderId: string, userEmail: string): Promise<FileUploadResponse> {
    try {
      console.log('🚀 uploadMultipleAssets called with:', {
        filesCount: files.length,
        fileNames: files.map(f => f.name),
        fileSizes: files.map(f => f.size),
        fileTypes: files.map(f => f.type),
        submissionId,
        folderId,
        userEmail
      });
      
      const fileProcessor = new FileProcessor();
      
      // Procesar todos los archivos en paralelo
      const filePromises = files.map(async (file, index) => {
        console.log(`🔄 Processing file ${index + 1}/${files.length}: ${file.name}`);
        try {
          const base64Content = await fileProcessor.convertToBase64(file);
          console.log(`✅ File ${file.name} converted to base64, length: ${base64Content.length}`);
          
          return {
            filename: file.name,
            content: base64Content, // Usar la misma estructura que uploadAsset
            mimeType: file.type,
            size: file.size
          };
        } catch (error) {
          console.error(`❌ Error converting file ${file.name} to base64:`, error);
          throw error;
        }
      });
      
      const processedFiles = await Promise.all(filePromises);
      
      console.log('🔍 uploadMultipleAssets processed files:', {
        submissionId,
        folderId,
        userEmail,
        filesCount: processedFiles.length,
        fileNames: processedFiles.map(f => f.filename),
        totalContentLength: processedFiles.reduce((sum, f) => sum + (f.content?.length || 0), 0)
      });
      
      const response = await api.post('/uploadAsset', {
        submissionId,
        folderId,
        userEmail,
        files: processedFiles, // Enviar todos los archivos procesados
        projectId: 'onboardingaudit'
      });

      console.log('📤 API response received:', response.data);
      
      fileProcessor.destroy();
      return response.data;
    } catch (error) {
      console.error('❌ Error in uploadMultipleAssets:', error);
      return {
        success: false,
        message: 'Failed to upload files'
      };
    }
  }

  static async validateFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    const fileProcessor = new FileProcessor();
    const result = await fileProcessor.validateFile(file);
    fileProcessor.destroy();
    return result;
  }

  static async compressImage(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number; compressionRatio: string }> {
    const fileProcessor = new FileProcessor();
    const result = await fileProcessor.compressImage(file);
    fileProcessor.destroy();
    return result;
  }

  static getUsageStatus = debounce(async (): Promise<UsageStatusResponse> => {
    try {
      const response = await api.post('/getUsageStatus', {
        projectId: 'onboardingaudit',
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get usage status'
      };
    }
  }, 300);

  static async generateDocument(templateId: string, filename: string, data: Record<string, any>): Promise<DocumentGenerationResponse> {
    try {
      const response = await api.post('/generateDocument', {
        templateId,
        filename,
        data,
        projectId: 'onboardingaudit'
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate document'
      };
    }
  }

  static clearCache(): void {
    this.cachedClientId = null;
    this.clientIdTimestamp = 0;
  }

  static destroy(): void {
    this.clearCache();
  }
} 