import axios from 'axios';
import { Product, ProductStats, WaitlistEntry, Submission, GlobalStats, ActivityItem } from '../types/admin';

// Configuración de la API centralizada
const API_BASE_URL = 'https://api-fu54nvsqfa-uc.a.run.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class AdminAPI {
  private clientId: string | null = null;

  setClientId(clientId: string) {
    this.clientId = clientId;
  }

  // Autenticación
  async checkAuth(projectId: string, sessionToken: string) {
    const response = await api.post('/auth/check', {
      projectId,
      sessionToken
    });
    return response.data;
  }

  // Obtener estadísticas globales
  async getGlobalStats(): Promise<GlobalStats> {
    const response = await api.get('/admin/global-stats');
    return response.data;
  }

  // Obtener lista de productos
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/admin/products');
    return response.data;
  }

  // Obtener estadísticas de un producto específico
  async getProductStats(productId: string): Promise<ProductStats> {
    const response = await api.post('/admin/analytics', {
      projectId: productId,
      clientId: this.clientId
    });
    return response.data;
  }

  // Obtener waitlist de un producto
  async getProductWaitlist(productId: string): Promise<WaitlistEntry[]> {
    const response = await api.post('/admin/waitlist', {
      projectId: productId,
      clientId: this.clientId
    });
    return response.data.waitlist || [];
  }

  // Obtener submissions de un producto
  async getProductSubmissions(productId: string): Promise<Submission[]> {
    const response = await api.post('/admin/submissions', {
      projectId: productId,
      clientId: this.clientId
    });
    return response.data.submissions || [];
  }

  // Actualizar estado de waitlist
  async updateWaitlistStatus(
    productId: string, 
    entryId: string, 
    newStatus: 'waiting' | 'notified' | 'converted'
  ) {
    const response = await api.post('/admin/updateWaitlistStatus', {
      projectId: productId,
      clientId: this.clientId,
      entryId,
      newStatus
    });
    return response.data;
  }

  // Obtener actividad reciente
  async getRecentActivity(productId?: string): Promise<ActivityItem[]> {
    const params = productId ? { productId } : {};
    const response = await api.get('/admin/recent-activity', { params });
    return response.data;
  }
}

export default new AdminAPI();
