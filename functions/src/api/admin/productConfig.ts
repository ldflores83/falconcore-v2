import { Request, Response } from 'express';
import { ConfigService } from '../../services/configService';
import { PRODUCT_CONFIG } from '../../config/productConfig';

interface GetProductConfigRequest {
  projectId: string;
}

interface ProductConfigResponse {
  success: boolean;
  config?: any;
  message: string;
}

// Obtener configuración de un producto específico
export const getProductConfig = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query; // Cambiar de req.body a req.query para GET

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: projectId"
      });
    }

    // Validar que el producto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: `Product ${projectId} is not configured`
      });
    }

    // Obtener la configuración del producto
    const config = PRODUCT_CONFIG[projectId];
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration not found for product ${projectId}`
      });
    }

    // Formatear la respuesta para el frontend
    const formattedConfig = {
      id: projectId,
      name: projectId.charAt(0).toUpperCase() + projectId.slice(1), // Capitalizar
      frontendUrl: config.frontendUrl,
      features: config.features,
      collections: config.collections,
      storageBucket: config.storageBucket,
      rateLimits: {
        requestsPerMinute: Math.floor(config.rateLimit.maxRequests / (config.rateLimit.windowMs / (60 * 1000))),
        requestsPerHour: config.rateLimit.maxRequests * 4 // Aproximación
      },
      maxFileSize: config.maxFileSize,
      maxFilesPerUpload: config.maxFilesPerUpload
    };

    const response: ProductConfigResponse = {
      success: true,
      config: formattedConfig,
      message: `Retrieved configuration for ${projectId}`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in getProductConfig:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Obtener configuración de todos los productos
export const getAllProductConfigs = async (req: Request, res: Response) => {
  try {
    const configs = Object.keys(PRODUCT_CONFIG).map(projectId => {
      const config = PRODUCT_CONFIG[projectId];
      return {
        id: projectId,
        name: projectId.charAt(0).toUpperCase() + projectId.slice(1),
        frontendUrl: config.frontendUrl,
        features: config.features,
        collections: config.collections,
        storageBucket: config.storageBucket,
        rateLimits: {
          requestsPerMinute: Math.floor(config.rateLimit.maxRequests / (config.rateLimit.windowMs / (60 * 1000))),
          requestsPerHour: config.rateLimit.maxRequests * 4
        },
        maxFileSize: config.maxFileSize,
        maxFilesPerUpload: config.maxFilesPerUpload
      };
    });

    return res.status(200).json({
      success: true,
      configs,
      message: `Retrieved ${configs.length} product configurations`
    });

  } catch (error) {
    console.error("❌ Error in getAllProductConfigs:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
