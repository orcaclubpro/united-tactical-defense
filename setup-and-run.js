#!/usr/bin/env node

/**
 * United Tactical Defense - Setup and Run Script
 * 
 * This script sets up the application and gets it running by:
 * 1. Setting up environment configuration
 * 2. Installing dependencies with appropriate flags
 * 3. Running database migrations if needed
 * 4. Starting the application in development mode
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Check and setup environment
function setupEnvironment() {
  log.section('Setting Up Environment');
  
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    log.warning('.env file not found, creating from .env.example');
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      log.success('Created .env file from .env.example');
    } else {
      log.error('.env.example file not found. Please create a .env file manually.');
      process.exit(1);
    }
  }
  
  log.success('Environment setup completed');
}

// Install dependencies with appropriate flags
function installDependencies() {
  log.section('Installing Dependencies');
  
  try {
    log.info('Installing backend dependencies...');
    exec('npm install --legacy-peer-deps');
    
    log.info('Installing frontend dependencies...');
    exec('cd frontend && npm install --legacy-peer-deps');
    
    log.success('All dependencies installed successfully');
  } catch (error) {
    log.error('Failed to install dependencies');
    process.exit(1);
  }
}

// Create data directory if needed
function setupDataDirectory() {
  log.section('Setting Up Data Directory');
  
  try {
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data', { recursive: true });
      log.success('Created data directory');
    } else {
      log.info('Data directory already exists');
    }
  } catch (error) {
    log.error('Failed to create data directory');
    console.error(error);
    process.exit(1);
  }
}

// Run database migrations if needed
function runMigrations() {
  log.section('Running Database Migrations');
  
  try {
    // First check if the migration script exists
    if (fs.existsSync(path.join(__dirname, 'src', 'data', 'migrations', 'run-migrations.js'))) {
      exec('npm run migrate');
      log.success('Database migrations completed successfully');
    } else {
      log.warning('Migration script not found. Skipping migrations.');
    }
  } catch (error) {
    log.warning('Database migration failed. Continuing anyway as this might be a first run.');
    console.error(error);
  }
}

// Start the application in development mode
function startApplication() {
  log.section('Starting Application');
  
  try {
    log.info('Starting frontend and backend in development mode...');
    log.info('Press Ctrl+C to stop the application.');
    exec('npm run dev');
  } catch (error) {
    log.error('Failed to start application');
    console.error(error);
    process.exit(1);
  }
}

// Run the setup process
async function main() {
  try {
    log.section('Starting Setup and Run Process');
    
    setupEnvironment();
    setupDataDirectory();
    installDependencies();
    runMigrations();
    startApplication();
    
  } catch (error) {
    log.error('Setup and run process failed');
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main(); 