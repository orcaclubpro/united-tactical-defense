const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const dbPath = path.join(__dirname, 'unitedDT.db');
console.log(`Initializing database at: ${dbPath}`);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to the unitedDT database.');
  }
});

// Promise wrapper for db.run
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error running SQL: ' + sql);
        console.error(err);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create leads table
    await run(`
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
    console.log('Leads table created');

    // Create appointments table
    await run(`
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
    console.log('Appointments table created');

    // Ensure page_visits table exists
    await run(`
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
    console.log('Page visits table checked/created');

    // Ensure page_engagement table exists
    await run(`
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
    console.log('Page engagement table checked/created');

    // Ensure conversions table exists
    await run(`
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
    console.log('Conversions table checked/created');

    // Create metrics_snapshots table
    await run(`
      CREATE TABLE IF NOT EXISTS metrics_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        landing_page_visits INTEGER NOT NULL,
        conversions INTEGER NOT NULL,
        referral_counts TEXT NOT NULL,
        snapshot_time DATETIME NOT NULL
      )
    `);
    console.log('Metrics snapshots table created');

    // Migrate data from newLeads to leads if newLeads exists
    const tableExists = await new Promise((resolve) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='newLeads'", (err, row) => {
        resolve(!!row);
      });
    });
    
    if (tableExists) {
      console.log('Found legacy newLeads table, migrating data...');
      
      // Get newLeads structure
      const columns = await new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(newLeads)", (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.name));
        });
      });
      
      console.log('newLeads columns:', columns);
      
      // Check if there's already data in the leads table
      const leadsCount = await new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM leads", (err, row) => {
          resolve(err ? 0 : row.count);
        });
      });
      
      if (leadsCount === 0) {
        // Migrate data based on common fields
        const commonFields = ['firstName', 'lastName', 'email', 'phone', 'source']
          .filter(field => columns.includes(field));
        
        if (commonFields.length > 0) {
          const fieldsStr = commonFields.join(', ');
          await run(`INSERT INTO leads (${fieldsStr}) SELECT ${fieldsStr} FROM newLeads`);
          console.log(`Migrated ${commonFields.length} fields from newLeads to leads table`);
        }
      } else {
        console.log('Skipping migration - leads table already has data');
      }
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
};

// Run initialization
initDatabase(); 