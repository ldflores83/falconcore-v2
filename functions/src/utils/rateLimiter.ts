import { ConfigService } from '../services/configService';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitKey {
  projectId: string;
  clientId?: string;
  ip: string;
  endpoint: string;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Genera una clave única para el rate limiting
   */
  private generateKey(key: RateLimitKey): string {
    const parts = [
      key.projectId,
      key.clientId || 'anonymous',
      key.ip,
      key.endpoint
    ];
    return parts.join('|');
  }

  /**
   * Verifica si una solicitud está dentro de los límites
   */
  isAllowed(key: RateLimitKey): boolean {
    const config = ConfigService.getRateLimitConfig(key.projectId);
    const limitKey = this.generateKey(key);
    const now = Date.now();

    // Limpiar entradas expiradas
    this.cleanup();

    const entry = this.limits.get(limitKey);
    
    if (!entry) {
      // Primera solicitud
      this.limits.set(limitKey, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (now > entry.resetTime) {
      // Ventana expirada, reiniciar
      this.limits.set(limitKey, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      // Límite excedido
      return false;
    }

    // Incrementar contador
    entry.count++;
    return true;
  }

  /**
   * Obtiene información sobre el estado del rate limiting
   */
  getStatus(key: RateLimitKey): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    limit: number;
  } {
    const config = ConfigService.getRateLimitConfig(key.projectId);
    const limitKey = this.generateKey(key);
    const now = Date.now();

    const entry = this.limits.get(limitKey);
    
    if (!entry || now > entry.resetTime) {
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        limit: config.maxRequests
      };
    }

    return {
      allowed: entry.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      limit: config.maxRequests
    };
  }

  /**
   * Limpia entradas expiradas del mapa
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Limpia todas las entradas (útil para testing)
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Obtiene estadísticas del rate limiter
   */
  getStats(): {
    totalEntries: number;
    activeEntries: number;
  } {
    const now = Date.now();
    let activeEntries = 0;

    for (const entry of this.limits.values()) {
      if (now <= entry.resetTime) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.limits.size,
      activeEntries
    };
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter();

/**
 * Middleware de rate limiting para Express
 */
export function rateLimitMiddleware(req: any, res: any, next: any) {
  const projectId = req.body?.projectId || req.query?.project_id || 'default';
  const clientId = req.body?.clientId || req.query?.clientId;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const endpoint = req.path;

  const key: RateLimitKey = {
    projectId,
    clientId,
    ip,
    endpoint
  };

  const status = rateLimiter.getStatus(key);

  if (!status.allowed) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded',
      error: 'TOO_MANY_REQUESTS',
      data: {
        remaining: status.remaining,
        resetTime: new Date(status.resetTime).toISOString(),
        limit: status.limit
      }
    });
  }

  // Agregar headers de rate limiting
  res.set({
    'X-RateLimit-Limit': status.limit,
    'X-RateLimit-Remaining': status.remaining,
    'X-RateLimit-Reset': new Date(status.resetTime).toISOString()
  });

  next();
}

/**
 * Función helper para verificar rate limiting en handlers específicos
 */
export function checkRateLimit(key: RateLimitKey): {
  allowed: boolean;
  status: {
    remaining: number;
    resetTime: number;
    limit: number;
  };
} {
  const allowed = rateLimiter.isAllowed(key);
  const status = rateLimiter.getStatus(key);

  return {
    allowed,
    status
  };
}
