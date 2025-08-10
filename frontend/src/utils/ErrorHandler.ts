/**
 * Centralized Error Handler
 * Based on Node.js best practices for error handling
 */

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    name: string, 
    httpCode: HttpStatusCode, 
    description: string, 
    isOperational: boolean,
    context?: Record<string, any>
  ) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this);
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public async handleError(error: Error): Promise<void> {
    await this.logError(error);
    await this.fireMonitoringMetric(error);
    
    if (!this.isTrustedError(error)) {
      console.error('❌ Untrusted error detected:', error);
    }
  }

  public isTrustedError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  private async logError(error: Error): Promise<void> {
    const errorLog = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...(error instanceof AppError && {
        httpCode: error.httpCode,
        isOperational: error.isOperational,
        context: error.context,
      }),
    };

    console.error('🔴 Error logged:', errorLog);
  }

  private async fireMonitoringMetric(error: Error): Promise<void> {
    // In a production environment, you would send this to monitoring services
    // like DataDog, New Relic, Sentry, etc.
    console.warn('📊 Monitoring metric fired for error:', {
      errorName: error.name,
      errorType: error instanceof AppError ? 'operational' : 'programming',
      timestamp: Date.now(),
    });
  }
}

// Common error types for the application
export const CommonErrors = {
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  CORS_BLOCKED: 'CORS_BLOCKED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

// Global error handler for uncaught exceptions (client-side)
export const setupGlobalErrorHandling = () => {
  const errorHandler = ErrorHandler.getInstance();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    
    const error = new AppError(
      CommonErrors.NETWORK_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Unhandled promise rejection: ${event.reason}`,
      false,
      { type: 'unhandledrejection', reason: event.reason }
    );
    
    errorHandler.handleError(error);
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('🚨 Global JavaScript error:', event.error);
    
    const error = new AppError(
      'JAVASCRIPT_ERROR',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      event.error?.message || 'Unknown JavaScript error',
      false,
      { 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack 
      }
    );
    
    errorHandler.handleError(error);
  });
};

export const errorHandler = ErrorHandler.getInstance();