const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('./app');

// Database path
const dbPath = path.join(__dirname, config.dbPath);

// Create database connection function
const getDbConnection = () => {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
      throw err;
    } else {
      console.log('Connected to the unitedDT database.');
    }
  });
};

// Promise-based wrapper for database operations
const db = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.run(sql, params, function(err) {
        db.close();
        if (err) {
          console.error('Error running SQL: ' + sql);
          console.error(err);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  },
  
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get(sql, params, (err, result) => {
        db.close();
        if (err) {
          console.error('Error running SQL: ' + sql);
          console.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) {
          console.error('Error running SQL: ' + sql);
          console.error(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create leads table
    await db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        source TEXT,
        potentialValue TEXT,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create appointments table
    await db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        duration INTEGER DEFAULT 60,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads (id)
      )
    `);

    // Create analytics tables
    await db.run(`
      CREATE TABLE IF NOT EXISTS page_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_url TEXT NOT NULL,
        referrer TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        user_agent TEXT,
        ip_address TEXT,
        is_landing_page INTEGER DEFAULT 0,
        visit_time DATETIME NOT NULL
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS page_engagement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        time_on_page INTEGER,
        scroll_depth INTEGER,
        click_count INTEGER,
        form_interactions INTEGER,
        engagement_time DATETIME NOT NULL,
        FOREIGN KEY (visit_id) REFERENCES page_visits (id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        conversion_type TEXT NOT NULL,
        conversion_value REAL DEFAULT 0,
        conversion_data TEXT,
        conversion_time DATETIME NOT NULL,
        FOREIGN KEY (visit_id) REFERENCES page_visits (id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS metrics_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        landing_page_visits INTEGER NOT NULL,
        conversions INTEGER NOT NULL,
        referral_counts TEXT NOT NULL,
        snapshot_time DATETIME NOT NULL
      )
    `);

    // Check for legacy data
    const legacyTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='newLeads'");
    if (legacyTable) {
      console.log('Found legacy newLeads table, migration may be required.');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  getDbConnection,
  initDatabase,
  db
}; 