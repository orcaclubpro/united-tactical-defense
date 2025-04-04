/**
 * Application Configuration Module
 * Centralizes configuration management with environment variable support
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

/**
 * Environment-specific configurations
 */
const environments = {
  development: {
    port: process.env.PORT || 3004,
    nodeEnv: 'development',
    logLevel: 'debug',
    corsOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3004', 'http://localhost:4000'],
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    uploadDir: path.join(process.cwd(), 'uploads'),
    serveStaticFiles: true,
    analyticsEnabled: true,
    sessionTimeout: 30, // minutes
    redisEnabled: process.env.REDIS_ENABLED === 'true',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    rateLimiting: {
      enabled: true,
      defaultLimit: 1000, // requests per windowMs
      authLimit: 100,     // for auth endpoints
      apiLimit: 500,      // for API endpoints
      windowMs: 60 * 1000 // 1 minute window
    },
    caching: {
      enabled: true,
      defaultTtl: 60, // seconds
      longTtl: 3600   // 1 hour
    }
  },
  
  test: {
    port: process.env.PORT || 4001,
    nodeEnv: 'test',
    logLevel: 'error',
    corsOrigins: ['http://localhost:3000'],
    jwtSecret: 'test-secret-key',
    jwtExpiresIn: '1h',
    jwtRefreshExpiresIn: '24h',
    uploadDir: path.join(process.cwd(), 'test/uploads'),
    serveStaticFiles: false,
    analyticsEnabled: false,
    sessionTimeout: 5, // minutes
    redisEnabled: false,
    rateLimiting: {
      enabled: false
    },
    caching: {
      enabled: false
    }
  },
  
  production: {
    port: process.env.PORT || 4000,
    nodeEnv: 'production',
    logLevel: 'info',
    corsOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',') 
      : ['https://unitedtacticaldefense.com'],
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    serveStaticFiles: true,
    analyticsEnabled: true,
    sessionTimeout: process.env.SESSION_TIMEOUT 
      ? parseInt(process.env.SESSION_TIMEOUT, 10) 
      : 30, // minutes
    redisEnabled: process.env.REDIS_ENABLED === 'true',
    redisUrl: process.env.REDIS_URL,
    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      defaultLimit: process.env.RATE_LIMIT_DEFAULT 
        ? parseInt(process.env.RATE_LIMIT_DEFAULT, 10) 
        : 500, // requests per windowMs
      authLimit: process.env.RATE_LIMIT_AUTH
        ? parseInt(process.env.RATE_LIMIT_AUTH, 10)
        : 50, // for auth endpoints
      apiLimit: process.env.RATE_LIMIT_API
        ? parseInt(process.env.RATE_LIMIT_API, 10)
        : 300, // for API endpoints
      windowMs: process.env.RATE_LIMIT_WINDOW_MS
        ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
        : 60 * 1000 // 1 minute window
    },
    caching: {
      enabled: process.env.CACHING_ENABLED !== 'false',
      defaultTtl: process.env.CACHE_DEFAULT_TTL
        ? parseInt(process.env.CACHE_DEFAULT_TTL, 10)
        : 60, // seconds
      longTtl: process.env.CACHE_LONG_TTL
        ? parseInt(process.env.CACHE_LONG_TTL, 10)
        : 3600 // 1 hour
    }
  }
};

// Determine current environment
const currentEnv = process.env.NODE_ENV || 'development';

// Get environment configuration
const envConfig = environments[currentEnv] || environments.development;

// Feature flags
const features = {
  emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS === 'true',
  smsNotifications: process.env.FEATURE_SMS_NOTIFICATIONS === 'true',
  autoLeadAssignment: process.env.FEATURE_AUTO_LEAD_ASSIGNMENT === 'true',
  advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
  calendarIntegration: process.env.FEATURE_CALENDAR_INTEGRATION === 'true',
  distributedRateLimiting: process.env.FEATURE_DISTRIBUTED_RATE_LIMITING === 'true',
  responseCompression: process.env.FEATURE_RESPONSE_COMPRESSION === 'true',
  metricCollection: process.env.FEATURE_METRIC_COLLECTION === 'true'
};

// Final configuration with feature flags
const config = {
  ...envConfig,
  features,
  
  // Database configuration
  database: {
    path: process.env.DB_PATH || path.join(process.cwd(), 'data', 'unitedDT.db')
  },
  
  // Email configuration (if enabled)
  email: features.emailNotifications ? {
    from: process.env.EMAIL_FROM || 'noreply@unitedtacticaldefense.com',
    transport: {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }
  } : null,
  
  // SMS configuration (if enabled)
  sms: features.smsNotifications ? {
    accountSid: process.env.SMS_ACCOUNT_SID,
    authToken: process.env.SMS_AUTH_TOKEN,
    phoneNumber: process.env.SMS_PHONE_NUMBER
  } : null
};

// Validate critical configuration values
if (currentEnv === 'production') {
  if (!config.jwtSecret || config.jwtSecret === 'dev-secret-key-change-in-production') {
    console.error('WARNING: JWT_SECRET is not set for production environment!');
  }
  
  if (features.emailNotifications && 
      (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    console.error('WARNING: Email notifications enabled but credentials not configured!');
  }
  
  if (features.smsNotifications && 
      (!process.env.SMS_ACCOUNT_SID || !process.env.SMS_AUTH_TOKEN)) {
    console.error('WARNING: SMS notifications enabled but credentials not configured!');
  }
  
  if (config.redisEnabled && !config.redisUrl) {
    console.error('WARNING: Redis enabled but REDIS_URL not configured!');
  }
  
  if (features.distributedRateLimiting && !config.redisEnabled) {
    console.error('WARNING: Distributed rate limiting enabled but Redis is not configured!');
  }
}

module.exports = config; 