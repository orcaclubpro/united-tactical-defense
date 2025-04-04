/**
 * Main server entry point
 */

const http = require('http');
const process = require('process');
const express = require('express');
const initializeApp = require('./app');
const config = require('./config/app');
const { closeDatabase } = require('./config/database');
const { closeRedisClient } = require('./config/redis');

// Read environment variables
const PORT = process.env.PORT || 3004;

/**
 * Normalize port into a number or string
 * @param {string|number} val - Port value
 * @returns {number|string} - Normalized port
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('Starting server...');
    
    // Create a simple Express app for health check
    const healthApp = express();
    
    // Add the health endpoint
    healthApp.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });
    
    // Initialize the Express app
    const app = await initializeApp();
    
    // Combine with the health endpoint
    app.use(healthApp);
    
    // Create HTTP server
    const server = http.createServer(app);

    // Listen on port
    server.listen(PORT);

    // Event listeners
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
      console.log(`Server listening on ${bind}`);
      
      // Add a console log specifically for health check
      console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        closeDatabase().then(() => {
          console.log('Database connection closed');
          closeRedisClient().then(() => {
            console.log('Redis connection closed');
            process.exit(0);
          });
        });
      });
    });
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        closeDatabase().then(() => {
          console.log('Database connection closed');
          closeRedisClient().then(() => {
            console.log('Redis connection closed');
            process.exit(0);
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = startServer; 