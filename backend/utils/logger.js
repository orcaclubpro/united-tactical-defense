const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log formats
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create transports array, conditionally add file transports based on env
const transports = [];

// Add console transport if enabled or not specified
if (process.env.LOG_CONSOLE_ENABLED !== 'false') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Add file transports if enabled
if (process.env.LOG_FILE_ENABLED === 'true') {
  transports.push(
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: parseInt(process.env.LOG_MAX_SIZE || '5242880'), // 5MB default
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat,
      maxsize: parseInt(process.env.LOG_MAX_SIZE || '5242880'),
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'united-tactical-defense' },
  transports: transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat,
      maxsize: parseInt(process.env.LOG_MAX_SIZE || '5242880'),
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
    })
  ]
});

// Add request context for easier tracking
logger.setRequestContext = (requestId) => {
  return {
    info: (message, meta = {}) => logger.info(message, { ...meta, requestId }),
    error: (message, meta = {}) => logger.error(message, { ...meta, requestId }),
    warn: (message, meta = {}) => logger.warn(message, { ...meta, requestId }),
    debug: (message, meta = {}) => logger.debug(message, { ...meta, requestId }),
    verbose: (message, meta = {}) => logger.verbose(message, { ...meta, requestId }),
  };
};

// Create HTTP request logger middleware with request ID generation
const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  req.requestId = requestId;
  req.logger = logger.setRequestContext(requestId);
  
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.info('HTTP Request', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
}; 