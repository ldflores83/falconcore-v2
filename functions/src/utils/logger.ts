export interface LogContext {
  projectId?: string;
  clientId?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string | null;
  duration?: number;
  ip?: string;
  userAgent?: string;
  statusCode?: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context: LogContext;
  data?: any;
  error?: Error;
}

class Logger {
  private requestId: string | null = null;
  private startTime: number | null = null;

  /**
   * Inicia el tracking de una operación
   */
  startOperation(operation: string, context: Partial<LogContext> = {}): void {
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
  endOperation(operation: string, context: Partial<LogContext> = {}): void {
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
  info(message: string, context: Partial<LogContext> = {}, data?: any): void {
    this.log('info', message, context, data);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, context: Partial<LogContext> = {}, data?: any): void {
    this.log('warn', message, context, data);
  }

  /**
   * Log de error
   */
  error(message: string, context: Partial<LogContext> = {}, error?: Error, data?: any): void {
    this.log('error', message, context, data, error);
  }

  /**
   * Log de debug
   */
  debug(message: string, context: Partial<LogContext> = {}, data?: any): void {
    this.log('debug', message, context, data);
  }

  /**
   * Log de seguridad
   */
  security(message: string, context: Partial<LogContext> = {}, data?: any): void {
    this.log('warn', `🔐 SECURITY: ${message}`, context, data);
  }

  /**
   * Log de performance
   */
  performance(message: string, context: Partial<LogContext> = {}, data?: any): void {
    this.log('info', `⚡ PERFORMANCE: ${message}`, context, data);
  }

  /**
   * Log de auditoría
   */
  audit(message: string, context: Partial<LogContext> = {}, data?: any): void {
    this.log('info', `📋 AUDIT: ${message}`, context, data);
  }

  /**
   * Método principal de logging
   */
  private log(
    level: LogEntry['level'],
    message: string,
    context: Partial<LogContext> = {},
    data?: any,
    error?: Error
  ): void {
    const logEntry: LogEntry = {
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
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene el emoji correspondiente al nivel de log
   */
  private getLevelEmoji(level: LogEntry['level']): string {
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
  withContext(context: Partial<LogContext>): Logger {
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
export const logger = new Logger();

/**
 * Middleware de logging para Express
 */
export function loggingMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Agregar requestId al request
  req.requestId = requestId;
  
  // Log de inicio de request
  logger.info(`📥 Request received`, {
    projectId: req.body?.projectId || req.query?.project_id || 'unknown',
    clientId: req.body?.clientId || req.query?.clientId || 'anonymous',
    operation: `${req.method} ${req.path}`,
    requestId,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown'
  });

  // Interceptar el final de la response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    
    logger.info(`📤 Response sent`, {
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
export function logOperation(operationName: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const context: Partial<LogContext> = {
        operation: operationName,
        projectId: args[0]?.projectId || 'unknown',
        clientId: args[0]?.clientId || 'unknown'
      };

      logger.startOperation(operationName, context);
      
      try {
        const result = await method.apply(this, args);
        logger.endOperation(operationName, context);
        return result;
      } catch (error) {
        logger.error(`Operation failed: ${operationName}`, context, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };
  };
}
