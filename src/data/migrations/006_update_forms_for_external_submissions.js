/**
 * Migration: Update Forms Table for External Submissions
 * Adds support for storing external appointment form submissions
 */

/**
 * Up Migration
 * @param {Object} db - Database connection
 * @returns {Promise<void>} - Promise representing the migration
 */
async function up(db) {
  return new Promise((resolve, reject) => {
    // Check if metadata and forwardingResult columns already exist
    db.all("PRAGMA table_info(forms)", [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      const hasMetadata = rows.some(row => row.name === 'metadata');
      const hasForwardingResult = rows.some(row => row.name === 'forwarding_result');
      const hasSource = rows.some(row => row.name === 'source');
      
      // If all columns exist, resolve early
      if (hasMetadata && hasForwardingResult && hasSource) {
        console.log('Form external submission columns already exist');
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
            console.log('Added metadata column to forms table');
          });
        }
        
        // Add forwarding_result column if it doesn't exist
        if (!hasForwardingResult) {
          db.run(`ALTER TABLE forms ADD COLUMN forwarding_result TEXT`, (err) => {
            if (err) {
              db.run("ROLLBACK", () => reject(err));
              return;
            }
            console.log('Added forwarding_result column to forms table');
          });
        }
        
        // Add source column if it doesn't exist
        if (!hasSource) {
          db.run(`ALTER TABLE forms ADD COLUMN source TEXT DEFAULT 'internal'`, (err) => {
            if (err) {
              db.run("ROLLBACK", () => reject(err));
              return;
            }
            console.log('Added source column to forms table');
          });
        }
        
        // Commit the transaction
        db.run("COMMIT", (err) => {
          if (err) {
            db.run("ROLLBACK", () => reject(err));
            return;
          }
          
          console.log('Updated forms table for external submissions');
          resolve();
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
async function down(db) {
  // SQLite doesn't support dropping columns, so we can't easily revert this migration
  // In a production system, we'd need to create a new table without these columns and migrate data
  console.log('Down migration for update_forms_for_external_submissions is a no-op');
  return Promise.resolve();
}

module.exports = {
  up,
  down
}; 