import { Request, Response } from 'express';
import { ConfigService } from '../../services/configService';
import { logger } from '../../utils/logger';

export const getProducts = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    logger.startOperation('get_products', { 
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    });

    const configuredProducts = ConfigService.getConfiguredProducts();
    
    const products = configuredProducts.map(projectId => {
      const config = ConfigService.getProductConfig(projectId);
      
      // Determinar el estado del producto basado en sus características
      let status = 'development';
      if (config.features.formSubmission && config.features.analytics) {
        status = 'active';
      } else if (config.features.waitlist) {
        status = 'beta';
      }
      
      // Descripción basada en las características
      const enabledFeatures = Object.entries(config.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature, _]) => feature);
      
      let description = `Features: ${enabledFeatures.join(', ')}`;
      
      // Descripciones personalizadas por producto
      const customDescriptions: Record<string, string> = {
        'onboardingaudit': 'Onboarding audit platform with file uploads and document generation',
        'ignium': 'Professional landing page with waitlist functionality',
        'jobpulse': 'Job market analytics and tracking platform',
        'pulziohq': 'Business intelligence and analytics platform',
        'uaylabs': 'Main company website and portfolio',
        'ahau': 'Leadership synchronization and LinkedIn amplification platform',
        'ld': 'Centralized admin dashboard for all products'
      };
      
      if (customDescriptions[projectId]) {
        description = customDescriptions[projectId];
      }
      
      return {
        id: projectId,
        name: projectId.charAt(0).toUpperCase() + projectId.slice(1),
        description,
        status,
        frontendUrl: config.frontendUrl,
        features: config.features,
        collections: config.collections,
        storageBucket: config.storageBucket,
        lastUpdated: new Date().toISOString()
      };
    });
    
    logger.info('Products list retrieved successfully');
    
    res.json(products);
    
  } catch (error) {
    logger.error('Error getting products list', {}, error instanceof Error ? error : new Error(String(error)));
    
    res.status(500).json({
      error: 'Error retrieving products list',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    const duration = Date.now() - startTime;
    logger.endOperation('get_products', { duration });
  }
};
