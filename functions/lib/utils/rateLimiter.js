"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
exports.rateLimitMiddleware = rateLimitMiddleware;
exports.checkRateLimit = checkRateLimit;
const configService_1 = require("../services/configService");
class RateLimiter {
    constructor() {
        this.limits = new Map();
    }
    /**
     * Genera una clave única para el rate limiting
     */
    generateKey(key) {
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
    isAllowed(key) {
        const config = configService_1.ConfigService.getRateLimitConfig(key.projectId);
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
    getStatus(key) {
        const config = configService_1.ConfigService.getRateLimitConfig(key.projectId);
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
    cleanup() {
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
    clear() {
        this.limits.clear();
    }
    /**
     * Obtiene estadísticas del rate limiter
     */
    getStats() {
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
exports.rateLimiter = new RateLimiter();
/**
 * Middleware de rate limiting para Express
 */
function rateLimitMiddleware(req, res, next) {
    const projectId = req.body?.projectId || req.query?.project_id || 'default';
    const clientId = req.body?.clientId || req.query?.clientId;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const endpoint = req.path;
    const key = {
        projectId,
        clientId,
        ip,
        endpoint
    };
    const status = exports.rateLimiter.getStatus(key);
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
function checkRateLimit(key) {
    const allowed = exports.rateLimiter.isAllowed(key);
    const status = exports.rateLimiter.getStatus(key);
    return {
        allowed,
        status
    };
}
