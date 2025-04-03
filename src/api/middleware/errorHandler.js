/**
 * Error Handler Middleware
 * Centralized error handling for the API
 */

/**
 * Application Error class
 * Used for creating structured error responses
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error types mapping
 */
const errorTypes = {
  VALIDATION_ERROR: {
    statusCode: 400,
    errorCode: 'VALIDATION_ERROR'
  },
  AUTHENTICATION_ERROR: {
    statusCode: 401,
    errorCode: 'AUTHENTICATION_ERROR'
  },
  AUTHORIZATION_ERROR: {
    statusCode: 403,
    errorCode: 'AUTHORIZATION_ERROR'
  },
  NOT_FOUND_ERROR: {
    statusCode: 404,
    errorCode: 'NOT_FOUND_ERROR'
  },
  CONFLICT_ERROR: {
    statusCode: 409,
    errorCode: 'CONFLICT_ERROR'
  },
  INTERNAL_ERROR: {
    statusCode: 500,
    errorCode: 'INTERNAL_ERROR'
  }
};

/**
 * Create an application error
 * @param {string} type - Error type from errorTypes
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {AppError} App error instance
 */
const createError = (type, message, details = null) => {
  const errorInfo = errorTypes[type] || errorTypes.INTERNAL_ERROR;
  return new AppError(
    message,
    errorInfo.statusCode,
    errorInfo.errorCode,
    details
  );
};

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 internal server error
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';
  let details = err.details || null;
  
  // Log the error
  console.error(`[ERROR] ${errorCode}: ${message}`, {
    path: req.path,
    method: req.method,
    statusCode,
    stack: err.stack,
    details
  });

  // Handle specific error types from third-party libraries
  if (err.name === 'ValidationError') {
    // Handle validation library errors (like Joi, express-validator)
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    details = err.details || err.errors || null;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // Handle JWT errors
    statusCode = 401;
    errorCode = 'AUTHENTICATION_ERROR';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    // Handle SQLite constraint errors
    statusCode = 409;
    errorCode = 'CONFLICT_ERROR';
    message = 'Database constraint violation';
  }

  // Different response format in dev vs production
  if (process.env.NODE_ENV === 'production') {
    // In production, don't expose error details or stack trace
    // for internal errors to avoid security risks
    if (statusCode === 500) {
      return res.status(statusCode).json({
        error: errorCode,
        message: 'An unexpected error occurred'
      });
    }
  }

  // Send error response
  res.status(statusCode).json({
    error: errorCode,
    message,
    details: details,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
};

/**
 * Not found middleware
 * Handles 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const err = createError(
    'NOT_FOUND_ERROR',
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  next(err);
};

module.exports = {
  AppError,
  createError,
  errorTypes,
  errorHandler,
  notFoundHandler
}; 