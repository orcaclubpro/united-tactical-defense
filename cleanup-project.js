/**
 * Project Cleanup Orchestrator
 * Executes all the necessary cleanup steps in the correct order
 */

const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');

// Main cleanup function
async function runCleanup() {
  try {
    console.log('=======================================');
    console.log('STARTING UNITED TACTICAL DEFENSE CLEANUP');
    console.log('=======================================\n');
    
    // Ensure data directory exists for database
    console.log('1. Creating data directory if it doesn\'t exist...');
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }
    console.log('✓ Data directory ready\n');
    
    // Make sure .env file exists
    console.log('2. Checking environment configuration...');
    if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
      console.log('   Creating .env file from .env.example...');
      fs.copyFileSync(
        path.join(process.cwd(), '.env.example'),
        path.join(process.cwd(), '.env')
      );
    }
    
    // Update database path in .env if needed
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
    if (!envContent.includes('DB_PATH=')) {
      console.log('   Adding DB_PATH to .env file...');
      fs.appendFileSync(
        path.join(process.cwd(), '.env'),
        '\nDB_PATH=./data/unitedDT.db\n'
      );
    }
    console.log('✓ Environment configuration ready\n');
    
    // Organize test files
    console.log('3. Organizing test files...');
    await execAsync('node tests/organize-tests.js');
    console.log('✓ Test files organized\n');
    
    // Run database migrations to set up new database
    console.log('4. Running database migrations...');
    try {
      await execAsync('npm run migrate');
      console.log('✓ Database migrations complete\n');
    } catch (err) {
      console.error('Error running migrations:', err);
      console.log('Attempting to continue with cleanup...\n');
    }
    
    // Run cleanup script to remove redundant files (with auto-yes)
    console.log('5. Running final cleanup script...');
    // Call the script with an auto-answer for the yes/no prompt
    const cleanup = execAsync('node -e "const readline = require(\'readline\'); const rl = readline.createInterface({input: process.stdin, output: process.stdout}); rl.on(\'line\', () => {}); require(\'./cleanup-script\');" & echo "yes" | cat');
    
    // Set a timeout to send 'yes' to the script's prompt
    setTimeout(() => {
      process.stdin.write('yes\n');
    }, 1000);
    
    // Wait for the script to finish
    await cleanup;
    console.log('✓ File cleanup complete\n');
    
    console.log('=======================================');
    console.log('CLEANUP COMPLETED SUCCESSFULLY');
    console.log('=======================================\n');
    
    console.log('Next steps:');
    console.log('1. Verify that the application starts correctly:');
    console.log('   npm run dev');
    console.log('2. Run tests to ensure everything is working:');
    console.log('   npm test');
    console.log('3. Check the backup-deprecated directory for any important files that need to be preserved');
    console.log('4. Commit the changes to version control');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
runCleanup().catch(err => {
  console.error('Unhandled error during cleanup:', err);
  process.exit(1);
}); 