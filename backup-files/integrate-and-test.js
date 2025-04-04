#!/usr/bin/env node

/**
 * United Tactical Defense - Integration and Testing Script
 * 
 * This script automates the integration and testing process before deployment.
 * It performs the following tasks:
 * 1. Validates environment configuration
 * 2. Installs dependencies for both frontend and backend
 * 3. Runs database migrations
 * 4. Runs all tests
 * 5. Builds the frontend for production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

// Validate environment configuration
function validateEnvironment() {
  log.section('Validating Environment Configuration');
  
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
  
  // Validate required environment variables
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'CORS_ORIGINS',
    'JWT_SECRET',
    'DB_PATH'
  ];
  
  const missingVars = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    log.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    log.error('Please update your .env file with the required variables.');
    process.exit(1);
  }
  
  log.success('Environment configuration validated');
}

// Install dependencies
function installDependencies() {
  log.section('Installing Dependencies');
  
  try {
    log.info('Installing root dependencies...');
    exec('npm install');
    
    log.info('Installing frontend dependencies...');
    exec('cd frontend && npm install');
    
    log.success('All dependencies installed successfully');
  } catch (error) {
    log.error('Failed to install dependencies');
    process.exit(1);
  }
}

// Run database migrations
function runMigrations() {
  log.section('Running Database Migrations');
  
  try {
    exec('npm run migrate');
    log.success('Database migrations completed successfully');
  } catch (error) {
    log.error('Database migration failed');
    process.exit(1);
  }
}

// Run tests
function runTests() {
  log.section('Running Tests');
  
  try {
    // Run backend tests
    log.info('Running backend tests...');
    exec('npm run test');
    
    // Run API tests
    log.info('Running API tests...');
    exec('npm run test:api');
    
    // Run service tests
    log.info('Running service tests...');
    exec('npm run test:services');
    
    // Run database connection pooling tests
    log.info('Running database connection pooling tests...');
    exec('npm run test:db-pooling');
    
    // Run frontend tests
    log.info('Running frontend tests...');
    exec('npm run test:frontend');
    
    log.success('All tests passed successfully');
  } catch (error) {
    log.error('Tests failed');
    process.exit(1);
  }
}

// Build frontend
function buildFrontend() {
  log.section('Building Frontend for Production');
  
  try {
    exec('npm run build');
    log.success('Frontend built successfully for production');
  } catch (error) {
    log.error('Frontend build failed');
    process.exit(1);
  }
}

// Check database connection
function checkDatabaseConnection() {
  log.section('Checking Database Connection');
  
  try {
    // Create a small script to test the database connection
    const testScript = `
    const { initDatabase, closeDatabase } = require('./src/config/database');
    
    async function testConnection() {
      try {
        await initDatabase();
        console.log('Database connection successful');
        await closeDatabase();
        process.exit(0);
      } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
      }
    }
    
    testConnection();
    `;
    
    const tempScriptPath = path.join(__dirname, 'temp-db-test.js');
    fs.writeFileSync(tempScriptPath, testScript);
    
    exec(`node ${tempScriptPath}`);
    fs.unlinkSync(tempScriptPath);
    
    log.success('Database connection verified');
  } catch (error) {
    log.error('Database connection check failed');
    process.exit(1);
  }
}

// Run the complete integration process
async function main() {
  try {
    log.section('Starting Integration and Testing Process');
    
    validateEnvironment();
    installDependencies();
    checkDatabaseConnection();
    runMigrations();
    runTests();
    buildFrontend();
    
    log.section('Integration and Testing Process Completed Successfully');
    log.info('The system is ready for deployment');
    log.info('For deployment instructions, please refer to the integration-deployment-plan.md file');
  } catch (error) {
    log.error('Integration and testing process failed');
    process.exit(1);
  }
}

// Run the main function
main(); 