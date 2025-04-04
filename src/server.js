/**
 * Server Entry Point
 */

const initializeApp = require('./app');
const config = require('./config/app');
const { closeDatabase } = require('./config/database');
const { closeRedisClient } = require('./config/redis');

// Port to listen on
const PORT = process.env.PORT || config.port;

// Initialize and start the application
const startServer = async () => {
  try {
    // Initialize the application
    const app = await initializeApp();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server gracefully...');
      
      // Close database connection
      await closeDatabase();
      console.log('Database connection closed');
      
      // Close Redis connections if enabled
      if (config.redisEnabled) {
        await closeRedisClient();
        console.log('Redis connection closed');
      }
      
      // Close server
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      
      // Force close after timeout
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });
    
    return server;
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = startServer; 