"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const productConfig_1 = require("../config/productConfig");
class ConfigService {
    /**
     * Obtiene la configuración completa de un producto
     * @param projectId ID del proyecto
     * @returns Configuración del producto o configuración por defecto
     */
    static getProductConfig(projectId) {
        return productConfig_1.PRODUCT_CONFIG[projectId] || productConfig_1.DEFAULT_PRODUCT_CONFIG;
    }
    /**
     * Obtiene la URL del frontend para un producto
     * @param projectId ID del proyecto
     * @returns URL del frontend
     */
    static getFrontendUrl(projectId) {
        const config = this.getProductConfig(projectId);
        return config.frontendUrl;
    }
    /**
     * Obtiene el nombre de una colección para un producto
     * @param projectId ID del proyecto
     * @param type Tipo de colección (submissions, waitlist, etc.)
     * @returns Nombre de la colección
     */
    static getCollectionName(projectId, type) {
        const config = this.getProductConfig(projectId);
        return config.collections[type];
    }
    /**
     * Obtiene el bucket de storage para un producto
     * @param projectId ID del proyecto
     * @returns Nombre del bucket de storage
     */
    static getStorageBucket(projectId) {
        const config = this.getProductConfig(projectId);
        return config.storageBucket;
    }
    /**
     * Verifica si una característica está habilitada para un producto
     * @param projectId ID del proyecto
     * @param feature Nombre de la característica
     * @returns true si la característica está habilitada
     */
    static isFeatureEnabled(projectId, feature) {
        const config = this.getProductConfig(projectId);
        return config.features[feature];
    }
    /**
     * Obtiene el tamaño máximo de archivo para un producto
     * @param projectId ID del proyecto
     * @returns Tamaño máximo en bytes
     */
    static getMaxFileSize(projectId) {
        const config = this.getProductConfig(projectId);
        return config.maxFileSize;
    }
    /**
     * Obtiene el número máximo de archivos por upload para un producto
     * @param projectId ID del proyecto
     * @returns Número máximo de archivos
     */
    static getMaxFilesPerUpload(projectId) {
        const config = this.getProductConfig(projectId);
        return config.maxFilesPerUpload;
    }
    /**
     * Obtiene la configuración de rate limiting para un producto
     * @param projectId ID del proyecto
     * @returns Configuración de rate limiting
     */
    static getRateLimitConfig(projectId) {
        const config = this.getProductConfig(projectId);
        return config.rateLimit;
    }
    /**
     * Valida que un producto existe y está configurado
     * @param projectId ID del proyecto
     * @returns true si el producto está configurado
     */
    static isProductConfigured(projectId) {
        return projectId in productConfig_1.PRODUCT_CONFIG;
    }
    /**
     * Obtiene la lista de todos los productos configurados
     * @returns Array de IDs de productos
     */
    static getConfiguredProducts() {
        return Object.keys(productConfig_1.PRODUCT_CONFIG);
    }
    /**
     * Genera una URL de error para un producto
     * @param projectId ID del proyecto
     * @param errorType Tipo de error
     * @returns URL completa de error
     */
    static getErrorUrl(projectId, errorType) {
        const baseUrl = this.getFrontendUrl(projectId);
        return `${baseUrl}/${projectId}/login?error=${errorType}`;
    }
    /**
     * Genera una URL de admin para un producto
     * @param projectId ID del proyecto
     * @param token Token de sesión
     * @returns URL completa del panel de admin
     */
    static getAdminUrl(projectId, token) {
        const baseUrl = this.getFrontendUrl(projectId);
        return `${baseUrl}/${projectId}/admin?token=${token}`;
    }
}
exports.ConfigService = ConfigService;
