import axios from 'axios';

// Configuración de la API - URLs absolutas del backend (misma que onboardingaudit)
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
export interface WaitlistResponse {
  success: boolean;
  message: string;
  waitlistId?: string;
}

export interface WaitlistData {
  email: string;
  name?: string;
  company?: string;
  role?: string;
  language: 'es' | 'en';
  source: 'ahau-landing';
}

// Cliente principal para Ahau
export class AhauClient {
  private static generateClientId(): string {
    return 'ahau-' + Math.random().toString(36).substr(2, 9);
  }

  private static cachedClientId: string | null = null;
  private static clientIdTimestamp = 0;
  private static CLIENT_ID_CACHE_DURATION = 60 * 1000; // 1 minuto

  private static getClientId(): string {
    const now = Date.now();
    if (!this.cachedClientId || now - this.clientIdTimestamp > this.CLIENT_ID_CACHE_DURATION) {
      this.cachedClientId = this.generateClientId();
      this.clientIdTimestamp = now;
    }
    return this.cachedClientId;
  }

  // Método principal para unirse al waitlist
  static async joinWaitlist(data: WaitlistData): Promise<WaitlistResponse> {
    try {
      const response = await api.post('/addToWaitlist', {
        productName: 'Ahau - Leadership Synchronization',
        website: 'https://uaylabs.web.app/ahau',
        email: data.email,
        projectId: 'ahau',
        name: data.name,
        company: data.company,
        role: data.role,
        language: data.language,
        source: data.source
      });

      return {
        success: true,
        message: response.data.message || 'Successfully joined the waitlist!',
        waitlistId: response.data.entryId,
      };
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }
      
      return {
        success: false,
        message: 'Error joining waitlist. Please try again.',
      };
    }
  }

  // Método para verificar si un email ya está en el waitlist
  static async checkWaitlistStatus(email: string): Promise<WaitlistResponse> {
    try {
      const response = await api.get(`/waitlist/check`, {
        params: { email, product: 'ahau' }
      });

      return {
        success: true,
        message: response.data.message || 'Email found in waitlist',
        waitlistId: response.data.waitlistId,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Email not found in waitlist',
        };
      }
      
      return {
        success: false,
        message: 'Error checking waitlist status',
      };
    }
  }

  // Limpiar cache
  static clearCache(): void {
    requestCache.clear();
  }

  // Destruir instancia
  static destroy(): void {
    this.clearCache();
  }
}

// Exportar instancia por defecto
export default AhauClient;
