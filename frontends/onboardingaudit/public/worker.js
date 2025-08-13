// Web Worker para procesamiento de archivos
self.onmessage = function(e) {
  const { type, file, id } = e.data;
  
  switch (type) {
    case 'CONVERT_TO_BASE64':
      convertFileToBase64(file, id);
      break;
    case 'VALIDATE_FILE':
      validateFile(file, id);
      break;
    case 'COMPRESS_IMAGE':
      compressImage(file, id);
      break;
    default:
      self.postMessage({ 
        type: 'ERROR', 
        id, 
        error: 'Unknown operation type' 
      });
  }
};

// Convertir archivo a base64
function convertFileToBase64(file, id) {
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const result = event.target.result;
    const base64 = result.split(',')[1]; // Remover el prefijo data URL
    
    self.postMessage({
      type: 'CONVERT_TO_BASE64_SUCCESS',
      id,
      result: {
        base64,
        filename: file.name,
        size: file.size,
        mimeType: file.type
      }
    });
  };
  
  reader.onerror = function() {
    self.postMessage({
      type: 'CONVERT_TO_BASE64_ERROR',
      id,
      error: 'Failed to read file'
    });
  };
  
  reader.readAsDataURL(file);
}

// Validar archivo
function validateFile(file, id) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ];
  
  const validation = {
    isValid: true,
    errors: []
  };
  
  // Validar tamaño
  if (file.size > maxSize) {
    validation.isValid = false;
    validation.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`);
  }
  
  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    validation.isValid = false;
    validation.errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Validar nombre
  if (file.name.length > 100) {
    validation.isValid = false;
    validation.errors.push('File name is too long');
  }
  
  self.postMessage({
    type: 'VALIDATE_FILE_SUCCESS',
    id,
    result: validation
  });
}

// Comprimir imagen (si es posible)
function compressImage(file, id) {
  if (!file.type.startsWith('image/')) {
    self.postMessage({
      type: 'COMPRESS_IMAGE_ERROR',
      id,
      error: 'File is not an image'
    });
    return;
  }
  
  // Verificar si createImageBitmap está disponible
  if (typeof createImageBitmap === 'undefined') {
    self.postMessage({
      type: 'COMPRESS_IMAGE_ERROR',
      id,
      error: 'createImageBitmap not supported in this environment'
    });
    return;
  }
  
  // Verificar si OffscreenCanvas está disponible
  if (typeof OffscreenCanvas === 'undefined') {
    self.postMessage({
      type: 'COMPRESS_IMAGE_ERROR',
      id,
      error: 'OffscreenCanvas not supported in this environment'
    });
    return;
  }
  
  try {
    // Usar createImageBitmap que SÍ está disponible en Web Workers
    createImageBitmap(file)
      .then(bitmap => {
        // Redimensionar si es muy grande
        const maxWidth = 1200;
        const maxHeight = 1200;
        
        let { width, height } = bitmap;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Dibujar la imagen redimensionada
        ctx.drawImage(bitmap, 0, 0, width, height);
        
        // Convertir a blob
        return canvas.convertToBlob({ 
          type: 'image/jpeg', 
          quality: 0.8 
        });
      })
      .then(blob => {
        self.postMessage({
          type: 'COMPRESS_IMAGE_SUCCESS',
          id,
          result: {
            blob,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1)
          }
        });
      })
      .catch(error => {
        console.error('Error in createImageBitmap:', error);
        self.postMessage({
          type: 'COMPRESS_IMAGE_ERROR',
          id,
          error: error.message || 'Image compression failed'
        });
      });
  } catch (error) {
    console.error('Error setting up image compression:', error);
    self.postMessage({
      type: 'COMPRESS_IMAGE_ERROR',
      id,
      error: error.message || 'Image compression setup failed'
    });
  }
} 