"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.loggingMiddleware = loggingMiddleware;
exports.logOperation = logOperation;
class Logger {
    constructor() {
        this.requestId = null;
        this.startTime = null;
    }
    /**
     * Inicia el tracking de una operación
     */
    startOperation(operation, context = {}) {
        this.requestId = this.generateRequestId();
        this.startTime = Date.now();
        this.info(`🚀 Operation started: ${operation}`, {
            ...context,
            operation,
            requestId: this.requestId
        });
    }
    /**
     * Finaliza el tracking de una operación
     */
    endOperation(operation, context = {}) {
        const duration = this.startTime ? Date.now() - this.startTime : 0;
        this.info(`✅ Operation completed: ${operation}`, {
            ...context,
            operation,
            requestId: this.requestId,
            duration
        });
        this.requestId = null;
        this.startTime = null;
    }
    /**
     * Log de información
     */
    info(message, context = {}, data) {
        this.log('info', message, context, data);
    }
    /**
     * Log de advertencia
     */
    warn(message, context = {}, data) {
        this.log('warn', message, context, data);
    }
    /**
     * Log de error
     */
    error(message, context = {}, error, data) {
        this.log('error', message, context, data, error);
    }
    /**
     * Log de debug
     */
    debug(message, context = {}, data) {
        this.log('debug', message, context, data);
    }
    /**
     * Log de seguridad
     */
    security(message, context = {}, data) {
        this.log('warn', `🔐 SECURITY: ${message}`, context, data);
    }
    /**
     * Log de performance
     */
    performance(message, context = {}, data) {
        this.log('info', `⚡ PERFORMANCE: ${message}`, context, data);
    }
    /**
     * Log de auditoría
     */
    audit(message, context = {}, data) {
        this.log('info', `📋 AUDIT: ${message}`, context, data);
    }
    /**
     * Método principal de logging
     */
    log(level, message, context = {}, data, error) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: {
                ...context,
                requestId: this.requestId || context.requestId,
                duration: this.startTime ? Date.now() - this.startTime : context.duration
            },
            data,
            error
        };
        // Formato estructurado para Cloud Functions
        const logObject = {
            timestamp: logEntry.timestamp,
            level: logEntry.level,
            message: logEntry.message,
            projectId: logEntry.context.projectId || 'unknown',
            clientId: logEntry.context.clientId || 'unknown',
            operation: logEntry.context.operation || 'unknown',
            userId: logEntry.context.userId || 'unknown',
            sessionId: logEntry.context.sessionId || 'unknown',
            requestId: logEntry.context.requestId || 'unknown',
            duration: logEntry.context.duration || 0,
            ip: logEntry.context.ip || 'unknown',
            userAgent: logEntry.context.userAgent || 'unknown',
            data: logEntry.data,
            error: logEntry.error ? {
                name: logEntry.error.name,
                message: logEntry.error.message,
                stack: logEntry.error.stack
            } : undefined
        };
        // Usar console.log con formato estructurado
        const emoji = this.getLevelEmoji(level);
        const prefix = `${emoji} [${level.toUpperCase()}]`;
        console.log(`${prefix} ${message}`, JSON.stringify(logObject, null, 2));
    }
    /**
     * Genera un ID único para la request
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Obtiene el emoji correspondiente al nivel de log
     */
    getLevelEmoji(level) {
        switch (level) {
            case 'info': return 'ℹ️';
            case 'warn': return '⚠️';
            case 'error': return '❌';
            case 'debug': return '🔍';
            default: return '📝';
        }
    }
    /**
     * Crea un logger con contexto predefinido
     */
    withContext(context) {
        const childLogger = new Logger();
        childLogger.requestId = this.requestId;
        childLogger.startTime = this.startTime;
        // Extender los métodos para incluir el contexto
        const originalLog = childLogger.log.bind(childLogger);
        childLogger.log = (level, message, ctx, data, error) => {
            originalLog(level, message, { ...context, ...ctx }, data, error);
        };
        return childLogger;
    }
}
// Instancia global del logger
exports.logger = new Logger();
/**
 * Middleware de logging para Express
 */
function loggingMiddleware(req, res, next) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Agregar requestId al request
    req.requestId = requestId;
    // Log de inicio de request
    exports.logger.info(`📥 Request received`, {
        projectId: req.body?.projectId || req.query?.project_id || 'unknown',
        clientId: req.body?.clientId || req.query?.clientId || 'anonymous',
        operation: `${req.method} ${req.path}`,
        requestId,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
    });
    // Interceptar el final de la response
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        exports.logger.info(`📤 Response sent`, {
            projectId: req.body?.projectId || req.query?.project_id || 'unknown',
            clientId: req.body?.clientId || req.query?.clientId || 'anonymous',
            operation: `${req.method} ${req.path}`,
            requestId,
            duration,
            statusCode: res.statusCode
        });
        return originalSend.call(this, data);
    };
    next();
}
/**
 * Decorator para logging automático de funciones
 */
function logOperation(operationName) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const context = {
                operation: operationName,
                projectId: args[0]?.projectId || 'unknown',
                clientId: args[0]?.clientId || 'unknown'
            };
            exports.logger.startOperation(operationName, context);
            try {
                const result = await method.apply(this, args);
                exports.logger.endOperation(operationName, context);
                return result;
            }
            catch (error) {
                exports.logger.error(`Operation failed: ${operationName}`, context, error instanceof Error ? error : new Error(String(error)));
                throw error;
            }
        };
    };
}
