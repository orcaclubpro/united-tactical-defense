/**
 * Migration: Create Forms Table
 * Adds the forms table to the database schema
 */

/**
 * Run the migration
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
async function up(db) {
  try {
    // Create forms table
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS forms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          fields TEXT NOT NULL,
          validation_rules TEXT NOT NULL,
          data TEXT NOT NULL,
          submitted_at DATETIME NOT NULL,
          status TEXT NOT NULL,
          processing_result TEXT,
          converted_to TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    // Create indexes for faster querying
    await new Promise((resolve, reject) => {
      db.run('CREATE INDEX IF NOT EXISTS idx_forms_type ON forms(type)', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status)', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('CREATE INDEX IF NOT EXISTS idx_forms_submitted_at ON forms(submitted_at)', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    console.log('Forms table created successfully');
  } catch (error) {
    console.error('Error creating forms table:', error);
    throw error;
  }
}

/**
 * Rollback the migration
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
async function down(db) {
  try {
    // Drop table and indexes
    await new Promise((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS forms', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log('Forms table dropped successfully');
  } catch (error) {
    console.error('Error dropping forms table:', error);
    throw error;
  }
}

module.exports = {
  up,
  down
}; 