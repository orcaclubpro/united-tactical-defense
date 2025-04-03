/**
 * Database migration script
 * Migrates data from old newLeads table to new leads and appointments tables
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const dbPath = path.join(__dirname, '../../unitedDT.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the unitedDT database for migration.');
});

// Check if newLeads table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='newLeads'", (err, table) => {
  if (err) {
    console.error('Error checking for newLeads table:', err.message);
    closeAndExit(1);
  }
  
  if (!table) {
    console.log('No newLeads table found. No migration needed.');
    closeAndExit(0);
  }
  
  console.log('Found newLeads table. Starting migration...');
  migrateData();
});

// Migrate data from old structure to new structure
function migrateData() {
  // Create new tables if they don't exist
  createNewTables(() => {
    // Get all records from newLeads
    db.all('SELECT * FROM newLeads', [], (err, rows) => {
      if (err) {
        console.error('Error retrieving data from newLeads:', err.message);
        closeAndExit(1);
      }
      
      if (rows.length === 0) {
        console.log('No data found in newLeads table.');
        closeAndExit(0);
      }
      
      console.log(`Found ${rows.length} records to migrate.`);
      
      // Begin transaction
      db.run('BEGIN TRANSACTION', err => {
        if (err) {
          console.error('Error starting transaction:', err.message);
          closeAndExit(1);
        }
        
        let completedCount = 0;
        
        // Process each record
        rows.forEach(oldRecord => {
          // Insert into leads
          db.run(`
            INSERT INTO leads (firstName, lastName, email, phone, source, potentialValue, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            oldRecord.firstName,
            oldRecord.lastName,
            oldRecord.email,
            oldRecord.phone,
            oldRecord.source || 'Website',
            oldRecord.potentialValue || '$0',
            'new',
            oldRecord.created_at
          ], function(err) {
            if (err) {
              console.error(`Error migrating lead record ${oldRecord.id}:`, err.message);
              db.run('ROLLBACK', () => closeAndExit(1));
              return;
            }
            
            const leadId = this.lastID;
            
            // If there's appointment data, create appointment record
            if (oldRecord.appointmentTime) {
              db.run(`
                INSERT INTO appointments (lead_id, title, appointment_time, duration, notes, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [
                leadId,
                oldRecord.appointmentTitle || 'Free Introductory Class',
                oldRecord.appointmentTime,
                oldRecord.duration || 60,
                oldRecord.appointmentNotes || '',
                'scheduled',
                oldRecord.created_at
              ], err => {
                if (err) {
                  console.error(`Error migrating appointment for lead ${leadId}:`, err.message);
                  db.run('ROLLBACK', () => closeAndExit(1));
                  return;
                }
                
                completedCount++;
                checkCompletion(completedCount, rows.length);
              });
            } else {
              completedCount++;
              checkCompletion(completedCount, rows.length);
            }
          });
        });
      });
    });
  });
}

// Check if migration is complete
function checkCompletion(completed, total) {
  if (completed === total) {
    // Commit transaction
    db.run('COMMIT', err => {
      if (err) {
        console.error('Error committing transaction:', err.message);
        db.run('ROLLBACK', () => closeAndExit(1));
        return;
      }
      
      console.log(`Successfully migrated ${completed} records.`);
      console.log('Migration complete.');
      
      // Optionally rename old table
      db.run('ALTER TABLE newLeads RENAME TO newLeads_old', err => {
        if (err) {
          console.warn('Warning: Could not rename old table:', err.message);
        } else {
          console.log('Renamed old table to newLeads_old.');
        }
        
        closeAndExit(0);
      });
    });
  }
}

// Create new tables
function createNewTables(callback) {
  // Create leads table
  db.run(`
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
  `, err => {
    if (err) {
      console.error('Error creating leads table:', err.message);
      closeAndExit(1);
    }
    
    // Create appointments table
    db.run(`
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
    `, err => {
      if (err) {
        console.error('Error creating appointments table:', err.message);
        closeAndExit(1);
      }
      
      callback();
    });
  });
}

// Close database connection and exit
function closeAndExit(code) {
  db.close(err => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(code);
  });
} 