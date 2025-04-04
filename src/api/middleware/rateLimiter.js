/**
 * Rate Limiting Middleware
 * Provides configurable rate limiting for API endpoints
 * Supports different strategies and storage backends
 */

const { getRedisClient } = require('../../config/redis');
const config = require('../../config/app');

// Default options
const DEFAULT_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  statusCode: 429,
  keyGenerator: (req) => req.ip,
  skip: () => false,
  headers: true, // Add X-RateLimit headers to response
  handler: null, // Custom handler function
  onLimitReached: null, // Function to call when rate limit is reached
  distributed: false, // Use distributed rate limiting (requires Redis)
};

// Store for tracking request counts (for non-distributed mode)
const inMemoryStore = new Map();

/**
 * Rate limiter middleware factory
 * 
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware function
 */
function createRateLimiter(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const redisClient = opts.distributed ? getRedisClient() : null;

  // Create middleware function
  return async function rateLimiter(req, res, next) {
    // Skip rate limiting if configured to do so
    if (opts.skip(req, res)) {
      return next();
    }

    // Generate key for this request
    const key = typeof opts.keyGenerator === 'function' 
      ? opts.keyGenerator(req)
      : opts.keyGenerator;
    
    const rateKey = `ratelimit:${key}`;
    
    try {
      let currentCount;
      let resetTime;
      
      // Use different storage backends based on configuration
      if (opts.distributed && redisClient) {
        // Distributed rate limiting with Redis
        const now = Date.now();
        const windowStart = now - opts.windowMs;
        
        // Atomic operation to increment counter and expire old entries
        const multi = redisClient.multi();
        multi.zadd(rateKey, now, `${now}`);
        multi.zremrangebyscore(rateKey, 0, windowStart);
        multi.zcard(rateKey);
        multi.pexpire(rateKey, opts.windowMs);
        
        const results = await multi.exec();
        currentCount = results[2][1];
        resetTime = now + opts.windowMs;
      } else {
        // In-memory rate limiting
        const now = Date.now();
        const windowStart = now - opts.windowMs;
        
        // Get or create entry
        let entry = inMemoryStore.get(rateKey);
        if (!entry) {
          entry = { count: 0, resetTime: now + opts.windowMs, hits: [] };
          inMemoryStore.set(rateKey, entry);
        }
        
        // Remove old hits
        entry.hits = entry.hits.filter(hit => hit > windowStart);
        
        // Add current hit
        entry.hits.push(now);
        entry.count = entry.hits.length;
        
        // Update reset time if needed
        if (now > entry.resetTime) {
          entry.resetTime = now + opts.windowMs;
        }
        
        currentCount = entry.count;
        resetTime = entry.resetTime;
        
        // Clean up old entries
        if (inMemoryStore.size > 10000) {
          const oldEntries = [];
          inMemoryStore.forEach((val, key) => {
            if (val.resetTime < now) {
              oldEntries.push(key);
            }
          });
          oldEntries.forEach(key => inMemoryStore.delete(key));
        }
      }
      
      // Set headers if enabled
      if (opts.headers) {
        res.setHeader('X-RateLimit-Limit', opts.max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.max - currentCount));
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
      }
      
      // Check if rate limit exceeded
      if (currentCount > opts.max) {
        // Call onLimitReached callback if provided
        if (typeof opts.onLimitReached === 'function') {
          opts.onLimitReached(req, res);
        }
        
        // Use custom handler if provided
        if (typeof opts.handler === 'function') {
          return opts.handler(req, res, next);
        }
        
        // Default response for rate limiting
        return res.status(opts.statusCode).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: opts.message,
          },
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        });
      }
      
      // Continue to next middleware if not rate limited
      next();
    } catch (error) {
      // On error, allow the request to proceed but log the error
      console.error('Rate limiting error:', error);
      next();
    }
  };
}

/**
 * Factory for creating rate limiters with different presets
 */
module.exports = {
  // Default rate limiter (100 requests per minute)
  default: createRateLimiter(),
  
  // Strict rate limiter for auth endpoints (30 requests per minute)
  auth: createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many authentication attempts, please try again later.',
    keyGenerator: (req) => req.ip,
  }),
  
  // Moderate rate limiter for public API (60 requests per minute)
  api: createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: 'Rate limit exceeded, please slow down requests.',
  }),
  
  // Custom rate limiter factory
  create: createRateLimiter,
  
  // Helper for getting client IP
  getClientIp: (req) => {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.connection.socket.remoteAddress;
  }
}; 