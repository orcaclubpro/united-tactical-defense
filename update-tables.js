const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const dbPath = path.join(__dirname, 'unitedDT.db');
console.log(`Updating database at: ${dbPath}`);

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

// Check if column exists
const columnExists = async (table, column) => {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (rows && rows.length > 0) {
        const cols = rows.map(row => row.name);
        resolve(cols.includes(column));
      } else {
        resolve(false);
      }
    });
  });
};

// Update database tables
const updateDatabase = async () => {
  try {
    // Update page_visits table
    const pageVisitsCols = [
      { name: 'session_id', type: 'TEXT' },
      { name: 'device_type', type: 'TEXT' },
      { name: 'browser', type: 'TEXT' },
      { name: 'country', type: 'TEXT' },
      { name: 'region', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'is_bot', type: 'INTEGER DEFAULT 0' }
    ];
    
    for (const col of pageVisitsCols) {
      const exists = await columnExists('page_visits', col.name);
      if (!exists) {
        await run(`ALTER TABLE page_visits ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name} to page_visits table`);
      } else {
        console.log(`Column ${col.name} already exists in page_visits table`);
      }
    }
    
    // Update metrics_snapshots table
    const metricsSnapshotCols = [
      { name: 'devices', type: 'TEXT' },
      { name: 'geography', type: 'TEXT' },
      { name: 'average_time_per_user', type: 'REAL DEFAULT 0' },
      { name: 'report_type', type: 'TEXT DEFAULT \'daily\'' }
    ];
    
    for (const col of metricsSnapshotCols) {
      const exists = await columnExists('metrics_snapshots', col.name);
      if (!exists) {
        await run(`ALTER TABLE metrics_snapshots ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name} to metrics_snapshots table`);
      } else {
        console.log(`Column ${col.name} already exists in metrics_snapshots table`);
      }
    }
    
    console.log('Database update completed successfully');
  } catch (error) {
    console.error('Error updating database:', error);
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

// Run update
updateDatabase(); 