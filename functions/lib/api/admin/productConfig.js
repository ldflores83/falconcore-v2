"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductConfigs = exports.getProductConfig = void 0;
const configService_1 = require("../../services/configService");
const productConfig_1 = require("../../config/productConfig");
// Obtener configuración de un producto específico
const getProductConfig = async (req, res) => {
    try {
        const { projectId } = req.query; // Cambiar de req.body a req.query para GET
        if (!projectId || typeof projectId !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: projectId"
            });
        }
        // Validar que el producto esté configurado
        if (!configService_1.ConfigService.isProductConfigured(projectId)) {
            return res.status(400).json({
                success: false,
                message: `Product ${projectId} is not configured`
            });
        }
        // Obtener la configuración del producto
        const config = productConfig_1.PRODUCT_CONFIG[projectId];
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
        const response = {
            success: true,
            config: formattedConfig,
            message: `Retrieved configuration for ${projectId}`
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in getProductConfig:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getProductConfig = getProductConfig;
// Obtener configuración de todos los productos
const getAllProductConfigs = async (req, res) => {
    try {
        const configs = Object.keys(productConfig_1.PRODUCT_CONFIG).map(projectId => {
            const config = productConfig_1.PRODUCT_CONFIG[projectId];
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
    }
    catch (error) {
        console.error("❌ Error in getAllProductConfigs:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getAllProductConfigs = getAllProductConfigs;
