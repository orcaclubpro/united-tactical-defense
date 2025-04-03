/**
 * Request Logger Middleware
 * Logs incoming requests and their responses
 */

/**
 * Configuration options
 */
const defaultOptions = {
  logRequestBody: false,
  logResponseBody: false,
  logRequestHeaders: false,
  excludePaths: ['/api/health', '/api/metrics'],
  sensitiveHeaders: ['authorization', 'cookie', 'x-auth-token'],
  sensitiveBodyFields: ['password', 'token', 'secret', 'creditCard']
};

/**
 * Sanitize sensitive data from object
 * @param {Object} obj - Object to sanitize
 * @param {Array} sensitiveFields - List of sensitive field names
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, sensitiveFields) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  sensitiveFields.forEach(field => {
    const fieldLower = field.toLowerCase();
    Object.keys(sanitized).forEach(key => {
      if (key.toLowerCase().includes(fieldLower)) {
        sanitized[key] = '[REDACTED]';
      }
    });
  });
  
  return sanitized;
};

/**
 * Request logger middleware factory
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const requestLogger = (options = {}) => {
  // Merge options with defaults
  const config = { ...defaultOptions, ...options };
  
  return (req, res, next) => {
    // Skip logging for excluded paths
    if (config.excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Capture original end method to intercept response
    const originalEnd = res.end;
    
    // Timing info
    const startTime = Date.now();
    
    // Create request identifier
    const requestId = Math.random().toString(36).substring(2, 15);
    
    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);
    
    // Prepare request log
    const requestLog = {
      id: requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    
    // Add request headers if enabled
    if (config.logRequestHeaders) {
      requestLog.headers = sanitizeObject(req.headers, config.sensitiveHeaders);
    }
    
    // Add request body if enabled and exists
    if (config.logRequestBody && req.body) {
      requestLog.body = sanitizeObject(req.body, config.sensitiveBodyFields);
    }
    
    // Log the request
    console.log(`[REQUEST] ${requestLog.method} ${requestLog.path}`, requestLog);
    
    // Override res.end to capture and log response
    res.end = function(chunk, encoding) {
      // Calculate request duration
      const duration = Date.now() - startTime;
      
      // Prepare response log
      const responseLog = {
        id: requestId,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
      };
      
      // Add response body if enabled and exists
      if (config.logResponseBody && chunk) {
        try {
          const body = chunk.toString('utf8');
          if (body && body.length < 1024) { // Only log if not too large
            try {
              // Try to parse as JSON
              responseLog.body = sanitizeObject(JSON.parse(body), config.sensitiveBodyFields);
            } catch (e) {
              // Not JSON, store as is
              responseLog.body = body;
            }
          }
        } catch (err) {
          // Ignore errors when trying to read response body
        }
      }
      
      // Log the response
      console.log(`[RESPONSE] ${requestLog.method} ${requestLog.path} ${res.statusCode} ${duration}ms`, responseLog);
      
      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

module.exports = requestLogger; 