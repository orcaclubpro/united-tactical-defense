// Environment settings with defaults
const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Server
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  
  // CORS settings
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:3001', 'https://unitedtacticaldefense.com'],
  
  // Security
  rateLimitMax: process.env.RATE_LIMIT_MAX || 100,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes

  // Database
  dbPath: process.env.DB_PATH || '../unitedDT.db'
};

module.exports = config; 