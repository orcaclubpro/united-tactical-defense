/**
 * Simple Express Server for Testing
 * Demonstrates rate limiting and caching middleware
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import middleware
const rateLimiter = require('./api/middleware/rateLimiter');
const cache = require('./api/middleware/cache');

// Basic JSON parsing
app.use(express.json());

// Apply global rate limiter
app.use(rateLimiter.default);

// Status endpoint with caching
app.get('/api/status', cache.short, (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint with caching
app.get('/api/health', cache.short, (req, res) => {
  res.json({ status: 'ok' });
});

// Rate-limited test endpoint
app.get('/api/test/rate-limit', rateLimiter.create({ max: 5, windowMs: 60 * 1000 }), (req, res) => {
  res.json({ message: 'This endpoint is rate limited to 5 requests per minute' });
});

// Cached endpoint that simulates a slow operation
app.get('/api/test/cached', cache.create({ ttl: 10 }), (req, res) => {
  // Simulate slow operation
  const startTime = Date.now();
  
  // Artificial delay of 1 second
  setTimeout(() => {
    const processingTime = Date.now() - startTime;
    
    res.json({
      message: 'This response is cached for 10 seconds',
      cachedAt: new Date().toISOString(),
      processingTime: `${processingTime}ms`
    });
  }, 1000);
});

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('United Tactical Defense API is running with rate limiting and caching enabled');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log('Endpoints:');
  console.log('  GET /               - Root endpoint');
  console.log('  GET /api/status     - Status endpoint (cached for 5s)');
  console.log('  GET /api/health     - Health check endpoint (cached for 5s)');
  console.log('  GET /api/test/rate-limit - Rate limited to 5 requests per minute');
  console.log('  GET /api/test/cached     - Response cached for 10s');
}); 