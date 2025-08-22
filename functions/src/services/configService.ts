import { PRODUCT_CONFIG, DEFAULT_PRODUCT_CONFIG, ProductConfig } from '../config/productConfig';

export class ConfigService {
  /**
   * Obtiene la configuración completa de un producto
   * @param projectId ID del proyecto
   * @returns Configuración del producto o configuración por defecto
   */
  static getProductConfig(projectId: string): ProductConfig {
    return PRODUCT_CONFIG[projectId] || DEFAULT_PRODUCT_CONFIG;
  }

  /**
   * Obtiene la URL del frontend para un producto
   * @param projectId ID del proyecto
   * @returns URL del frontend
   */
  static getFrontendUrl(projectId: string): string {
    const config = this.getProductConfig(projectId);
    return config.frontendUrl;
  }

  /**
   * Obtiene el nombre de una colección para un producto
   * @param projectId ID del proyecto
   * @param type Tipo de colección (submissions, waitlist, etc.)
   * @returns Nombre de la colección
   */
  static getCollectionName(projectId: string, type: keyof ProductConfig['collections']): string {
    const config = this.getProductConfig(projectId);
    return config.collections[type];
  }

  /**
   * Obtiene el bucket de storage para un producto
   * @param projectId ID del proyecto
   * @returns Nombre del bucket de storage
   */
  static getStorageBucket(projectId: string): string {
    const config = this.getProductConfig(projectId);
    return config.storageBucket;
  }

  /**
   * Verifica si una característica está habilitada para un producto
   * @param projectId ID del proyecto
   * @param feature Nombre de la característica
   * @returns true si la característica está habilitada
   */
  static isFeatureEnabled(projectId: string, feature: keyof ProductConfig['features']): boolean {
    const config = this.getProductConfig(projectId);
    return config.features[feature];
  }

  /**
   * Obtiene el tamaño máximo de archivo para un producto
   * @param projectId ID del proyecto
   * @returns Tamaño máximo en bytes
   */
  static getMaxFileSize(projectId: string): number {
    const config = this.getProductConfig(projectId);
    return config.maxFileSize;
  }

  /**
   * Obtiene el número máximo de archivos por upload para un producto
   * @param projectId ID del proyecto
   * @returns Número máximo de archivos
   */
  static getMaxFilesPerUpload(projectId: string): number {
    const config = this.getProductConfig(projectId);
    return config.maxFilesPerUpload;
  }

  /**
   * Obtiene la configuración de rate limiting para un producto
   * @param projectId ID del proyecto
   * @returns Configuración de rate limiting
   */
  static getRateLimitConfig(projectId: string): { windowMs: number; maxRequests: number } {
    const config = this.getProductConfig(projectId);
    return config.rateLimit;
  }

  /**
   * Valida que un producto existe y está configurado
   * @param projectId ID del proyecto
   * @returns true si el producto está configurado
   */
  static isProductConfigured(projectId: string): boolean {
    return projectId in PRODUCT_CONFIG;
  }

  /**
   * Obtiene la lista de todos los productos configurados
   * @returns Array de IDs de productos
   */
  static getConfiguredProducts(): string[] {
    return Object.keys(PRODUCT_CONFIG);
  }

  /**
   * Genera una URL de error para un producto
   * @param projectId ID del proyecto
   * @param errorType Tipo de error
   * @returns URL completa de error
   */
  static getErrorUrl(projectId: string, errorType: string): string {
    const baseUrl = this.getFrontendUrl(projectId);
    return `${baseUrl}/${projectId}/login?error=${errorType}`;
  }

  /**
   * Genera una URL de admin para un producto
   * @param projectId ID del proyecto
   * @param token Token de sesión
   * @returns URL completa del panel de admin
   */
  static getAdminUrl(projectId: string, token: string): string {
    const baseUrl = this.getFrontendUrl(projectId);
    return `${baseUrl}/${projectId}/admin?token=${token}`;
  }
}
