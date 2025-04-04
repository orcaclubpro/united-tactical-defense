/**
 * Caching Middleware
 * Provides configurable caching for API responses
 * Supports in-memory and Redis caching backends
 */

const { getRedisClient } = require('../../config/redis');
const config = require('../../config/app');

// Default cache options
const DEFAULT_OPTIONS = {
  ttl: 60, // Cache TTL in seconds
  keyGenerator: (req) => `cache:${req.originalUrl || req.url}`,
  exclude: [], // Paths to exclude from caching
  methods: ['GET'], // HTTP methods to cache
  cacheNullValues: false, // Whether to cache null/undefined values
  useRedis: false, // Use Redis if available
  statusCodes: [200], // HTTP status codes to cache
  varyByHeaders: [], // Headers to include in cache key
  onHit: null, // Function to call on cache hit
  onMiss: null, // Function to call on cache miss
};

// In-memory cache store
const memoryCache = new Map();

/**
 * Clean up expired cache entries periodically
 */
setInterval(() => {
  const now = Date.now();
  let expired = 0;
  
  memoryCache.forEach((value, key) => {
    if (value.expiresAt < now) {
      memoryCache.delete(key);
      expired++;
    }
  });
  
  if (expired > 0 && config.nodeEnv === 'development') {
    console.log(`Cache cleanup: removed ${expired} expired entries`);
  }
}, 60000); // Run every minute

/**
 * Create cache middleware
 * @param {Object} options - Cache options
 * @returns {Function} Express middleware function
 */
function createCacheMiddleware(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const redisClient = opts.useRedis ? getRedisClient() : null;
  
  return async function cache(req, res, next) {
    // Skip caching for non-cacheable methods
    if (!opts.methods.includes(req.method)) {
      return next();
    }
    
    // Skip excluded paths
    const path = req.originalUrl || req.url;
    if (opts.exclude.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(path);
      }
      return path.includes(pattern);
    })) {
      return next();
    }
    
    // Generate cache key
    let key = typeof opts.keyGenerator === 'function' 
      ? opts.keyGenerator(req)
      : `cache:${path}`;
    
    // Vary by headers if specified
    if (opts.varyByHeaders.length > 0) {
      const headerValues = opts.varyByHeaders
        .map(header => {
          const headerValue = req.get(header);
          return headerValue ? `${header}=${headerValue}` : '';
        })
        .filter(Boolean)
        .join('|');
      
      if (headerValues) {
        key = `${key}|${headerValues}`;
      }
    }
    
    // Try to get from cache
    try {
      let cachedData;
      
      if (redisClient) {
        // Get from Redis
        const data = await redisClient.get(key);
        if (data) {
          cachedData = JSON.parse(data);
        }
      } else {
        // Get from memory cache
        const entry = memoryCache.get(key);
        if (entry && entry.expiresAt > Date.now()) {
          cachedData = entry.data;
        }
      }
      
      // If found in cache, send response
      if (cachedData) {
        // Call onHit callback if provided
        if (typeof opts.onHit === 'function') {
          opts.onHit(req, cachedData);
        }
        
        // Set cache hit header
        res.setHeader('X-Cache', 'HIT');
        
        // Send cached response
        return res.status(cachedData.status)
          .set(cachedData.headers || {})
          .send(cachedData.data);
      }
      
      // Call onMiss callback if provided
      if (typeof opts.onMiss === 'function') {
        opts.onMiss(req);
      }
      
      // Set cache miss header
      res.setHeader('X-Cache', 'MISS');
      
      // Capture the original response methods
      const originalSend = res.send;
      const originalJson = res.json;
      const originalEnd = res.end;
      
      // Override response.send
      res.send = function(body) {
        // Store original arguments to pass to the original method later
        const args = arguments;
        
        // Only cache if status code is in the allowed list
        if (!opts.statusCodes.includes(res.statusCode)) {
          return originalSend.apply(res, args);
        }
        
        // Skip caching null values if configured
        if (!opts.cacheNullValues && (body === null || body === undefined)) {
          return originalSend.apply(res, args);
        }
        
        // Get response headers to cache
        const headers = {};
        const headersToCache = ['content-type', 'content-language', 'cache-control'];
        headersToCache.forEach(header => {
          const value = res.get(header);
          if (value) {
            headers[header] = value;
          }
        });
        
        // Cache the response
        const responseToCache = {
          data: body,
          status: res.statusCode,
          headers,
          cached: Date.now()
        };
        
        // Store in cache
        if (redisClient) {
          // Store in Redis
          redisClient.setEx(key, opts.ttl, JSON.stringify(responseToCache))
            .catch(err => console.error('Redis cache error:', err));
        } else {
          // Store in memory cache
          memoryCache.set(key, {
            data: responseToCache,
            expiresAt: Date.now() + (opts.ttl * 1000)
          });
        }
        
        // Call original method
        return originalSend.apply(res, args);
      };
      
      // Override response.json
      res.json = function(body) {
        // Use the overridden send method
        return res.send(body);
      };
      
      // Call next middleware
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Clear cache entries matching a pattern
 * @param {string|RegExp} pattern - Pattern to match cache keys
 * @returns {Promise<number>} Number of entries removed
 */
async function clearCache(pattern) {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    // Clear from Redis
    try {
      const keys = await redisClient.keys(pattern instanceof RegExp ? '*' : pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error('Redis clear cache error:', error);
      return 0;
    }
  } else {
    // Clear from memory cache
    let count = 0;
    const patternObj = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    
    memoryCache.forEach((_, key) => {
      if (patternObj.test(key)) {
        memoryCache.delete(key);
        count++;
      }
    });
    
    return count;
  }
}

module.exports = {
  // Default cache middleware (60 seconds)
  default: createCacheMiddleware(),
  
  // Short-lived cache (5 seconds)
  short: createCacheMiddleware({ ttl: 5 }),
  
  // Medium-lived cache (5 minutes)
  medium: createCacheMiddleware({ ttl: 300 }),
  
  // Long-lived cache (1 hour)
  long: createCacheMiddleware({ ttl: 3600 }),
  
  // Factory for creating custom cache middleware
  create: createCacheMiddleware,
  
  // Clear cache entries
  clear: clearCache
}; 