/**
 * Database Configuration Module
 * Handles database connection and initialization
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('./app');

// Database connection pool
let connectionPool = {
  connections: [],
  maxConnections: 10,
  inUseConnections: new Map(),
  initializePool: false
};

// Database connection instance (legacy, kept for compatibility)
let db = null;

/**
 * Initialize the database connection pool
 * Creates connections and runs migrations if they don't exist
 * @param {Number} size - Size of the connection pool (default 10)
 * @returns {Promise<Boolean>} Success status
 */
const initConnectionPool = async (size = 10) => {
  return new Promise((resolve, reject) => {
    try {
      // Get database path from config
      const dbPath = config.database.path;
      
      // Configure pool size based on environment or passed parameter
      connectionPool.maxConnections = size || config.database.poolSize || 10;
      
      // Make sure directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      console.log(`Initializing database connection pool with ${connectionPool.maxConnections} connections`);
      
      // Create initial connections
      for (let i = 0; i < connectionPool.maxConnections; i++) {
        const connection = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error('Database connection error:', err.message);
            return reject(err);
          }
          
          // Enable foreign keys for this connection
          connection.run('PRAGMA foreign_keys = ON');
        });
        
        // Add connection to the pool
        connectionPool.connections.push(connection);
      }
      
      // Set legacy db for backward compatibility
      db = connectionPool.connections[0];
      
      console.log('Database connection pool initialized');
      connectionPool.initializePool = true;
      resolve(true);
    } catch (err) {
      console.error('Database pool initialization error:', err);
      reject(err);
    }
  });
};

/**
 * Initialize the database (legacy function, uses pool internally)
 * Creates connection and runs migrations if they don't exist
 * @returns {Object} Database connection
 */
const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      // Initialize the connection pool if not already initialized
      if (!connectionPool.initializePool) {
        initConnectionPool()
          .then(() => {
            console.log('Connected to the SQLite database');
            resolve(db);
          })
          .catch(err => {
            reject(err);
          });
      } else {
        resolve(db);
      }
    } catch (err) {
      console.error('Database initialization error:', err);
      reject(err);
    }
  });
};

/**
 * Run database migrations
 * @returns {Promise<void>}
 */
const runMigrations = async () => {
  try {
    if (!db) {
      await initDatabase();
    }
    
    // Import migration runner
    const migrationsRunner = require('../data/migrations');
    await migrationsRunner();
    
    console.log('Database migrations completed');
  } catch (err) {
    console.error('Error running migrations:', err);
    throw err;
  }
};

/**
 * Get a database connection from the pool
 * @returns {Object} Database connection
 */
const getConnection = () => {
  if (!connectionPool.initializePool) {
    throw new Error('Database pool not initialized. Call initConnectionPool first.');
  }
  
  // Find an available connection
  const availableConnection = connectionPool.connections.find(conn => 
    !connectionPool.inUseConnections.has(conn));
  
  if (availableConnection) {
    // Mark connection as in use with timestamp
    connectionPool.inUseConnections.set(availableConnection, Date.now());
    return availableConnection;
  } else {
    console.warn('All connections in use, waiting for an available connection');
    // Wait for a short time and try again (simple retry mechanism)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getConnection());
      }, 50);
    });
  }
};

/**
 * Release a connection back to the pool
 * @param {Object} connection The connection to release
 */
const releaseConnection = (connection) => {
  if (connectionPool.inUseConnections.has(connection)) {
    connectionPool.inUseConnections.delete(connection);
  }
};

/**
 * Get the database connection (legacy function)
 * @returns {Object} Database connection
 */
const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

/**
 * Handle database operation with automatic connection management
 * @param {Function} operation Function that uses the database connection
 * @returns {Promise<any>} Result of the operation
 */
const withConnection = async (operation) => {
  const connection = await getConnection();
  try {
    return await new Promise((resolve, reject) => {
      operation(connection, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  } finally {
    releaseConnection(connection);
  }
};

/**
 * Monitor connection pool health and recover stale connections
 * @returns {void}
 */
const monitorConnectionPool = () => {
  // Check for connections that have been in use for too long (stale)
  const now = Date.now();
  const staleTimeout = 30000; // 30 seconds
  
  connectionPool.inUseConnections.forEach((timestamp, connection) => {
    if (now - timestamp > staleTimeout) {
      console.warn('Recovering stale database connection');
      releaseConnection(connection);
    }
  });
};

// Set up periodic connection pool monitoring
setInterval(monitorConnectionPool, 10000);

/**
 * Close the database connection pool
 * @returns {Promise<void>}
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      if (connectionPool.initializePool) {
        const closePromises = connectionPool.connections.map(conn => {
          return new Promise((res, rej) => {
            conn.close(err => {
              if (err) rej(err);
              else res();
            });
          });
        });
        
        Promise.all(closePromises)
          .then(() => {
            console.log('All database connections closed');
            connectionPool.connections = [];
            connectionPool.inUseConnections.clear();
            connectionPool.initializePool = false;
            db = null;
            resolve();
          })
          .catch(err => {
            console.error('Error closing some database connections:', err);
            reject(err);
          });
      } else {
        resolve();
      }
    } catch (err) {
      console.error('Error closing database pool:', err);
      reject(err);
    }
  });
};

module.exports = {
  initDatabase,
  runMigrations,
  getDatabase,
  closeDatabase,
  // New pooling functions
  initConnectionPool,
  getConnection,
  releaseConnection,
  withConnection
}; 