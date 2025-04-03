/**
 * Database Migration System
 * Handles running migrations in order based on filename
 */

const fs = require('fs').promises;
const path = require('path');
const { initDatabase, getDatabase } = require('../../config/database');

/**
 * Run all available migrations
 * @param {boolean} down - Whether to run down migrations
 * @returns {Promise<void>}
 */
const runMigrations = async (down = false) => {
  try {
    // Initialize database before getting it
    await initDatabase();
    const db = getDatabase();
    
    // Ensure migrations table exists
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    // Get executed migrations
    const executedMigrations = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM migrations ORDER BY id ASC', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => row.name));
      });
    });
    
    // Get migration files
    const migrationFiles = (await fs.readdir(__dirname))
      .filter(file => 
        file.endsWith('.js') && 
        file !== 'index.js' && 
        !file.startsWith('.')
      )
      .sort();
    
    if (down) {
      // Run down migrations in reverse order
      for (const migrationName of [...executedMigrations].reverse()) {
        try {
          const migrationFile = migrationFiles.find(file => file === migrationName);
          if (!migrationFile) continue;
          
          const migration = require(path.join(__dirname, migrationFile));
          
          if (typeof migration.down === 'function') {
            console.log(`Rolling back migration: ${migrationFile}`);
            await migration.down(db);
            
            await new Promise((resolve, reject) => {
              db.run('DELETE FROM migrations WHERE name = ?', [migrationFile], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
            
            console.log(`Migration rolled back: ${migrationFile}`);
          }
        } catch (error) {
          console.error(`Error rolling back migration ${migrationName}:`, error);
          throw error;
        }
      }
    } else {
      // Run up migrations
      for (const migrationFile of migrationFiles) {
        try {
          // Skip already executed migrations
          if (executedMigrations.includes(migrationFile)) {
            continue;
          }
          
          const migration = require(path.join(__dirname, migrationFile));
          
          if (typeof migration.up === 'function') {
            console.log(`Running migration: ${migrationFile}`);
            await migration.up(db);
            
            await new Promise((resolve, reject) => {
              db.run('INSERT INTO migrations (name) VALUES (?)', [migrationFile], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
            
            console.log(`Migration completed: ${migrationFile}`);
          }
        } catch (error) {
          console.error(`Error running migration ${migrationFile}:`, error);
          throw error;
        }
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

// If this file is run directly, execute migrations
if (require.main === module) {
  const down = process.argv.includes('down');
  runMigrations(down)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}

module.exports = runMigrations; 