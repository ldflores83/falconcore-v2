// /functions/src/api/public/config.ts
import { ConfigService } from '../../services/configService';

// Tipos MIME permitidos
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/markdown',
];

// Templates de Google
export const TEMPLATES = {
  ONBOARDING_AUDIT_DOCS: process.env.ONBOARDING_AUDIT_DOCS_TEMPLATE_ID,
  ONBOARDING_AUDIT_SLIDES: process.env.ONBOARDING_AUDIT_SLIDES_TEMPLATE_ID,
};

// Configuración de carpetas
export const FOLDER_STRUCTURE = {
  ROOT: 'FalconCore',
  SUBMISSIONS: 'submissions',
  ASSETS: 'assets',
  REPORTS: 'reports',
};

// Configuración de respuestas
export const MESSAGES = {
  SUCCESS: {
    FORM_SUBMITTED: "Form submitted successfully. Report will be generated within 48 hours.",
    FILES_UPLOADED: "Files uploaded successfully.",
    DOCUMENT_GENERATED: "Document generated successfully.",
    USAGE_RETRIEVED: "Usage status retrieved successfully.",
  },
  ERROR: {
    MISSING_FIELDS: "Missing required fields",
    INVALID_FILE_TYPE: "Invalid file type",
    FILE_TOO_LARGE: "File size exceeds limit",
    TEMPLATE_NOT_FOUND: "Template not found or access denied",
    SUBMISSION_NOT_FOUND: "Submission folder not found. Please submit the form first.",
    UPLOAD_FAILED: "File upload failed",
    GENERATION_FAILED: "Document generation failed",
  },
};

// Función para obtener configuración dinámica por proyecto
export function getProjectConfig(projectId: string) {
  return {
    maxFileSize: ConfigService.getMaxFileSize(projectId),
    maxFilesPerUpload: ConfigService.getMaxFilesPerUpload(projectId),
    rateLimit: ConfigService.getRateLimitConfig(projectId),
    isFileUploadEnabled: ConfigService.isFeatureEnabled(projectId, 'fileUpload'),
    isDocumentGenerationEnabled: ConfigService.isFeatureEnabled(projectId, 'documentGeneration'),
    isAnalyticsEnabled: ConfigService.isFeatureEnabled(projectId, 'analytics'),
    isWaitlistEnabled: ConfigService.isFeatureEnabled(projectId, 'waitlist'),
  };
}

export const validateFileUpload = (files: Array<{ size: number; mimeType: string }>, projectId: string = 'default') => {
  const errors: string[] = [];
  const config = getProjectConfig(projectId);
  
  // Verificar si file upload está habilitado
  if (!config.isFileUploadEnabled) {
    errors.push('File upload is not enabled for this project');
    return errors;
  }
  
  // Verificar número de archivos
  if (files.length > config.maxFilesPerUpload) {
    errors.push(`Maximum ${config.maxFilesPerUpload} files allowed per upload`);
  }
  
  // Verificar tamaño total
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > config.maxFileSize) {
    const maxSizeMB = Math.round(config.maxFileSize / 1024 / 1024 * 100) / 100;
    const actualSizeMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
    errors.push(`Total file size (${actualSizeMB}MB) exceeds ${maxSizeMB}MB limit`);
  }
  
  // Verificar tipos MIME
  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      errors.push(`File type ${file.mimeType} is not allowed`);
    }
  }
  
  return errors;
}; 