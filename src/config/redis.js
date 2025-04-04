/**
 * Redis Configuration
 * Provides Redis client for distributed caching and rate limiting
 */

const config = require('./app');
let redisClient = null;

/**
 * Initialize the Redis client if enabled in configuration
 * @returns {Promise<Object|null>} Redis client or null if not enabled
 */
const initRedisClient = async () => {
  // Skip initialization if Redis is not enabled in config
  if (!config.redisEnabled) {
    console.log('Redis is disabled in configuration. Using in-memory storage instead.');
    return null;
  }
  
  try {
    // Dynamic import to avoid requiring redis when not needed
    const { createClient } = await import('redis');
    
    const client = createClient({
      url: config.redisUrl || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          // Exponential backoff with max 10 seconds
          const delay = Math.min(Math.pow(2, retries) * 100, 10000);
          return delay;
        }
      }
    });
    
    // Setup event handlers
    client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
    
    client.on('connect', () => {
      console.log('Connected to Redis server');
    });
    
    client.on('reconnecting', () => {
      console.log('Reconnecting to Redis server...');
    });
    
    // Connect to Redis server
    await client.connect();
    
    redisClient = client;
    return client;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    console.log('Falling back to in-memory storage');
    return null;
  }
};

/**
 * Get the Redis client instance
 * @returns {Object|null} Redis client or null if not initialized
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Close the Redis client connection
 * @returns {Promise<void>}
 */
const closeRedisClient = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
    redisClient = null;
  }
};

module.exports = {
  initRedisClient,
  getRedisClient,
  closeRedisClient
}; 