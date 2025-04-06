const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logger } = require('./utils/logger');

const dbPath = path.join(__dirname, 'udt-db.db');

logger.info('Initializing database connection', { dbPath });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Could not connect to SQLite database', { 
      error: err.message,
      dbPath
    });
  } else {
    logger.info('Connected to SQLite database', { dbPath });
  }
});

db.serialize(() => {
  logger.debug('Creating appointment table if it does not exist');
  db.run(`CREATE TABLE IF NOT EXISTS appointment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    sel_time TEXT NOT NULL,
    duration INTEGER DEFAULT 90,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      logger.error('Error creating appointment table', { error: err.message });
    } else {
      logger.debug('Appointment table created or already exists');
    }
  });
});

module.exports = db;
