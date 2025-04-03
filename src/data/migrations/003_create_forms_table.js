/**
 * Migration: Create Forms Table
 * Adds the forms table to the database schema
 */

const db = require('../../config/database').getDatabase();

/**
 * Run the migration
 * @returns {Promise<void>}
 */
async function up() {
  try {
    // Create forms table
    await db.query(`
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
    `);
    
    // Create indexes for faster querying
    await db.query('CREATE INDEX IF NOT EXISTS idx_forms_type ON forms(type)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_forms_submitted_at ON forms(submitted_at)');
    
    console.log('Forms table created successfully');
  } catch (error) {
    console.error('Error creating forms table:', error);
    throw error;
  }
}

/**
 * Rollback the migration
 * @returns {Promise<void>}
 */
async function down() {
  try {
    // Drop table and indexes
    await db.query('DROP TABLE IF EXISTS forms');
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