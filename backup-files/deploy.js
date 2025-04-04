#!/usr/bin/env node

/**
 * United Tactical Defense - Deployment Script
 * 
 * This script automates the deployment process for the United Tactical Defense application.
 * It performs the following tasks:
 * 1. Validates the production environment configuration
 * 2. Creates a production build
 * 3. Sets up the PM2 process manager for the Node.js application
 * 4. Sets up database backup
 * 
 * Prerequisites:
 * - PM2 installed globally: npm install -g pm2
 * - Server environment set up with Node.js >= 14
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Log utility functions
const log = {
  info: (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`),
  warning: (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`),
  section: (message) => console.log(`\n${colors.bright}${colors.magenta}=== ${message} ===${colors.reset}\n`)
};

// Execute command and log output
function exec(command, options = {}) {
  log.info(`Executing: ${command}`);
  try {
    return execSync(command, { 
      stdio: 'inherit',
      ...options
    });
  } catch (error) {
    log.error(`Command failed: ${command}`);
    throw error;
  }
}

// Prompt user for confirmation
function confirm(message) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message} (y/n)${colors.reset} `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Create production environment file
async function setupEnvironment() {
  log.section('Setting Up Production Environment');
  
  // Check if production .env file exists
  if (!fs.existsSync('.env.production')) {
    log.warning('.env.production file not found, creating from .env.example');
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env.production');
      log.success('Created .env.production file from .env.example');
      
      // Update with production values
      let envContent = fs.readFileSync('.env.production', 'utf8');
      envContent = envContent
        .replace(/NODE_ENV=development/g, 'NODE_ENV=production')
        .replace(/CORS_ORIGINS=.*/, `CORS_ORIGINS=${await promptInput('Enter production CORS origins (comma-separated): ', 'https://unitedtacticaldefense.com')}`)
        .replace(/JWT_SECRET=.*/, `JWT_SECRET=${generateSecureToken()}`);
      
      fs.writeFileSync('.env.production', envContent);
      log.success('Updated .env.production with production values');
    } else {
      log.error('.env.example file not found. Please create a .env.production file manually.');
      process.exit(1);
    }
  }
  
  // Ask user if they want to use the existing .env.production file
  const useExisting = await confirm('Use existing .env.production file?');
  if (!useExisting) {
    // Back up the existing file
    if (fs.existsSync('.env.production')) {
      const backupName = `.env.production.backup.${Date.now()}`;
      fs.copyFileSync('.env.production', backupName);
      log.info(`Backed up existing .env.production to ${backupName}`);
    }
    
    // Create a new production environment file
    let envContent = fs.readFileSync('.env.example', 'utf8');
    envContent = envContent
      .replace(/NODE_ENV=development/g, 'NODE_ENV=production')
      .replace(/CORS_ORIGINS=.*/, `CORS_ORIGINS=${await promptInput('Enter production CORS origins (comma-separated): ', 'https://unitedtacticaldefense.com')}`)
      .replace(/JWT_SECRET=.*/, `JWT_SECRET=${generateSecureToken()}`);
    
    fs.writeFileSync('.env.production', envContent);
    log.success('Created new .env.production file with production values');
  }
  
  log.success('Production environment setup completed');
}

// Generate a secure random token for JWT
function generateSecureToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Prompt user for input with a default value
function promptInput(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset}${defaultValue ? ` (${defaultValue})` : ''} `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Build the application for production
async function buildForProduction() {
  log.section('Building Application for Production');
  
  try {
    // Install dependencies
    log.info('Installing dependencies...');
    exec('npm ci');
    exec('cd frontend && npm ci');
    
    // Build frontend
    log.info('Building frontend...');
    exec('npm run build');
    
    log.success('Application built successfully for production');
  } catch (error) {
    log.error('Failed to build application for production');
    process.exit(1);
  }
}

// Set up PM2 process manager
async function setupPM2() {
  log.section('Setting Up PM2 Process Manager');
  
  try {
    // Check if PM2 is installed
    try {
      exec('pm2 --version', { stdio: 'pipe' });
    } catch (error) {
      log.warning('PM2 is not installed. Installing globally...');
      exec('npm install -g pm2');
    }
    
    // Create PM2 ecosystem file if it doesn't exist
    if (!fs.existsSync('ecosystem.config.js')) {
      const serverName = await promptInput('Enter a name for the server process: ', 'united-tactical-defense');
      const instances = await promptInput('Enter number of instances (or "max" for auto): ', 'max');
      
      const ecosystemConfig = `
module.exports = {
  apps: [{
    name: "${serverName}",
    script: "src/server.js",
    instances: "${instances}",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: ${await promptInput('Enter production port: ', '3000')}
    }
  }]
};
      `;
      
      fs.writeFileSync('ecosystem.config.js', ecosystemConfig);
      log.success('Created PM2 ecosystem.config.js file');
    }
    
    // Start or reload the application with PM2
    const isRunning = execSync('pm2 list | grep -c "united-tactical-defense" || echo "0"', { stdio: 'pipe' }).toString().trim() !== "0";
    
    if (isRunning) {
      log.info('Application is already running in PM2. Reloading...');
      exec('pm2 reload ecosystem.config.js');
    } else {
      log.info('Starting application with PM2...');
      exec('pm2 start ecosystem.config.js');
    }
    
    // Save PM2 process list to auto-start on system restart
    exec('pm2 save');
    log.info('PM2 process list saved');
    
    log.success('PM2 setup completed');
  } catch (error) {
    log.error('Failed to set up PM2');
    console.error(error);
    process.exit(1);
  }
}

// Set up database backup
async function setupDatabaseBackup() {
  log.section('Setting Up Database Backup');
  
  try {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'unitedDT.db');
    const backupDir = path.join(__dirname, 'data', 'backups');
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create backup script
    const backupScriptPath = path.join(__dirname, 'backup-database.js');
    const backupScript = `
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = '${dbPath}';
const backupDir = '${backupDir}';
const timestamp = new Date().toISOString().replace(/:/g, '-');
const backupPath = path.join(backupDir, \`backup-\${timestamp}.db\`);

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  // Copy database file
  fs.copyFileSync(dbPath, backupPath);
  console.log(\`Database backup created at \${backupPath}\`);
  
  // Clean up old backups (keep last 10)
  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
    .sort()
    .reverse();
  
  if (backups.length > 10) {
    for (let i = 10; i < backups.length; i++) {
      fs.unlinkSync(path.join(backupDir, backups[i]));
      console.log(\`Removed old backup: \${backups[i]}\`);
    }
  }
} catch (error) {
  console.error('Database backup failed:', error);
  process.exit(1);
}
    `;
    
    fs.writeFileSync(backupScriptPath, backupScript);
    fs.chmodSync(backupScriptPath, '755');
    log.success('Created database backup script');
    
    // Create cron entry for daily backup
    const setupCron = await confirm('Set up automatic daily database backup with cron?');
    if (setupCron) {
      const cronEntry = `0 2 * * * cd ${__dirname} && node backup-database.js >> data/backups/backup.log 2>&1`;
      const tempFile = path.join(__dirname, 'temp-crontab');
      
      // Export current crontab
      execSync(`crontab -l > ${tempFile} 2>/dev/null || echo "# United Tactical Defense Backups" > ${tempFile}`);
      
      // Check if entry already exists
      const currentCrontab = fs.readFileSync(tempFile, 'utf8');
      if (!currentCrontab.includes('backup-database.js')) {
        // Add new entry
        fs.appendFileSync(tempFile, `\n${cronEntry}\n`);
        // Install new crontab
        execSync(`crontab ${tempFile}`);
        log.success('Added cron job for daily database backup at 2 AM');
      } else {
        log.info('Cron job for database backup already exists');
      }
      
      // Remove temp file
      fs.unlinkSync(tempFile);
    }
    
    log.success('Database backup setup completed');
  } catch (error) {
    log.error('Failed to set up database backup');
    console.error(error);
    process.exit(1);
  }
}

// Verify deployment
async function verifyDeployment() {
  log.section('Verifying Deployment');
  
  try {
    // Wait for server to start
    log.info('Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check server status
    const port = process.env.PORT || 3000;
    log.info(`Checking server status at http://localhost:${port}/api/status...`);
    
    try {
      const output = execSync(`curl -s http://localhost:${port}/api/status`, { stdio: 'pipe' }).toString();
      const status = JSON.parse(output);
      
      if (status.status === 'online') {
        log.success(`Server is running in ${status.environment} mode`);
      } else {
        log.warning(`Server returned unexpected status: ${status.status}`);
      }
    } catch (error) {
      log.error('Failed to connect to server');
      throw error;
    }
    
    log.success('Deployment verification completed');
  } catch (error) {
    log.error('Deployment verification failed');
    console.error(error);
    process.exit(1);
  }
}

// Run the deployment process
async function main() {
  try {
    log.section('Starting Deployment Process');
    
    await setupEnvironment();
    
    const proceed = await confirm('Proceed with deployment?');
    if (!proceed) {
      log.info('Deployment cancelled');
      rl.close();
      return;
    }
    
    await buildForProduction();
    await setupPM2();
    await setupDatabaseBackup();
    await verifyDeployment();
    
    log.section('Deployment Process Completed Successfully');
    log.info('The application has been deployed to production');
    
    rl.close();
  } catch (error) {
    log.error('Deployment process failed');
    console.error(error);
    rl.close();
    process.exit(1);
  }
}

// Run the main function
main(); 