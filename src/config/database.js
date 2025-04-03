/**
 * Database Configuration Module
 * Handles database connection and initialization
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('./app');

// Database connection instance
let db = null;

/**
 * Initialize the database
 * Creates connection and runs migrations if they don't exist
 * @returns {Object} Database connection
 */
const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      // Get database path from config
      const dbPath = config.database.path;
      
      // Make sure directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      // Create database connection
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          return reject(err);
        }
        
        console.log('Connected to the SQLite database');
        
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
        
        console.log('Database connection initialized');
        resolve(db);
      });
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
    const { runMigrations } = require('../data/migrations');
    await runMigrations('up');
    
    console.log('Database migrations completed');
  } catch (err) {
    console.error('Error running migrations:', err);
    throw err;
  }
};

/**
 * Get the database connection
 * @returns {Object} Database connection
 */
const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          return reject(err);
        }
        console.log('Database connection closed');
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initDatabase,
  runMigrations,
  getDatabase,
  closeDatabase
}; 