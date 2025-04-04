/**
 * Database Migration Runner
 * 
 * This script runs the database migrations using the migration index file.
 * Usage:
 * - To run migrations up: node run-migrations.js up
 * - To run migrations down: node run-migrations.js down
 */

const runMigrations = require('./index');

async function main() {
  try {
    // Get the direction from command line args
    const direction = process.argv[2] || 'up';
    
    if (direction !== 'up' && direction !== 'down') {
      console.error('Invalid direction. Use "up" or "down".');
      process.exit(1);
    }
    
    console.log(`Running migrations: ${direction}`);
    
    // Run migrations in the specified direction
    await runMigrations(direction === 'down');
    
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 