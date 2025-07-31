// /functions/src/api/public/config.ts

export const API_CONFIG = {
  // Límites de archivos
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 10,
  
  // Tipos MIME permitidos
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json',
    'text/markdown',
  ],
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: 100, // 100 requests por ventana
  },
  
  // Templates de Google
  TEMPLATES: {
    ONBOARDING_AUDIT_DOCS: process.env.ONBOARDING_AUDIT_DOCS_TEMPLATE_ID,
    ONBOARDING_AUDIT_SLIDES: process.env.ONBOARDING_AUDIT_SLIDES_TEMPLATE_ID,
  },
  
  // Configuración de proyectos
  PROJECTS: {
    ONBOARDING_AUDIT: 'onboardingaudit',
    DEFAULT: 'onboardingaudit',
  },
  
  // Configuración de carpetas
  FOLDER_STRUCTURE: {
    ROOT: 'FalconCore',
    SUBMISSIONS: 'submissions',
    ASSETS: 'assets',
    REPORTS: 'reports',
  },
  
  // Configuración de respuestas
  MESSAGES: {
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
  },
};

export const validateFileUpload = (files: Array<{ size: number; mimeType: string }>) => {
  const errors: string[] = [];
  
  // Verificar número de archivos
  if (files.length > API_CONFIG.MAX_FILES_PER_UPLOAD) {
    errors.push(`Maximum ${API_CONFIG.MAX_FILES_PER_UPLOAD} files allowed per upload`);
  }
  
  // Verificar tamaño total
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > API_CONFIG.MAX_FILE_SIZE) {
    errors.push(`Total file size (${Math.round(totalSize / 1024 / 1024 * 100) / 100}MB) exceeds ${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
  
  // Verificar tipos MIME
  for (const file of files) {
    if (!API_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      errors.push(`File type ${file.mimeType} is not allowed`);
    }
  }
  
  return errors;
}; 