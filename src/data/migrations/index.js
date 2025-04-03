/**
 * Migration Runner
 * Runs database migrations in order
 */

const { initDatabase, getDatabase } = require('../../config/database');
const createUsersTable = require('./001_create_users_table');
const createLeadsTable = require('./create_leads_table');
const createAppointmentsTable = require('./create_appointments_table');
const createFormsTable = require('./003_create_forms_table');

// List of migrations in order
const migrations = [
  createUsersTable,
  createLeadsTable,
  createAppointmentsTable,
  createFormsTable
];

/**
 * Run migrations
 * @param {string} direction - 'up' or 'down'
 * @returns {Promise<void>}
 */
const runMigrations = async (direction = 'up') => {
  try {
    console.log(`Running migrations: ${direction}`);
    
    // Initialize database connection
    await initDatabase();
    const db = getDatabase();
    
    // Run migrations in order (or reverse order for down)
    const migrationList = direction === 'down' ? [...migrations].reverse() : migrations;
    
    for (const migration of migrationList) {
      console.log(`Executing migration: ${migration.name}`);
      await migration[direction](db);
    }
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

// Check if running as script
if (require.main === module) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  runMigrations(direction);
}

module.exports = {
  runMigrations
}; 