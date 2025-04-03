/**
 * Migration: Update Forms Table for External Submissions
 * Adds support for storing external appointment form submissions
 */

const db = require('../db');

/**
 * Up Migration
 * @param {Object} db - Database connection
 * @returns {Promise<void>} - Promise representing the migration
 */
async function up() {
  return new Promise((resolve, reject) => {
    // Check if metadata and forwardingResult columns already exist
    db.get("PRAGMA table_info(forms)", [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      const hasMetadata = rows.some(row => row.name === 'metadata');
      const hasForwardingResult = rows.some(row => row.name === 'forwardingResult');
      
      // If both columns exist, resolve early
      if (hasMetadata && hasForwardingResult) {
        return resolve();
      }
      
      // Create a transaction for atomicity
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          return reject(err);
        }
        
        // Add metadata column if it doesn't exist
        if (!hasMetadata) {
          db.run(`ALTER TABLE forms ADD COLUMN metadata TEXT`, (err) => {
            if (err) {
              db.run("ROLLBACK", () => reject(err));
              return;
            }
          });
        }
        
        // Add forwardingResult column if it doesn't exist
        if (!hasForwardingResult) {
          db.run(`ALTER TABLE forms ADD COLUMN forwardingResult TEXT`, (err) => {
            if (err) {
              db.run("ROLLBACK", () => reject(err));
              return;
            }
          });
        }
        
        // Add source column if it doesn't exist
        db.run(`ALTER TABLE forms ADD COLUMN source TEXT DEFAULT 'internal'`, (err) => {
          if (err) {
            db.run("ROLLBACK", () => reject(err));
            return;
          }
          
          // Commit the transaction
          db.run("COMMIT", (err) => {
            if (err) {
              db.run("ROLLBACK", () => reject(err));
              return;
            }
            
            resolve();
          });
        });
      });
    });
  });
}

/**
 * Down Migration
 * @param {Object} db - Database connection
 * @returns {Promise<void>} - Promise representing the migration
 * @note SQLite doesn't support dropping columns, so this is a no-op
 */
async function down() {
  // SQLite doesn't support dropping columns, so we can't easily revert this migration
  // In a production system, we'd need to create a new table without these columns and migrate data
  return Promise.resolve();
}

module.exports = {
  up,
  down
}; 