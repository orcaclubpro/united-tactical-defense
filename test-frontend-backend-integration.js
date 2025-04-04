#!/usr/bin/env node

/**
 * United Tactical Defense - Frontend/Backend Integration Test
 * 
 * This script runs tests to ensure the frontend components
 * are correctly integrated with the backend API endpoints
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);

// Configuration
const CONFIG = {
  backendPort: 5050,
  frontendPort: 3000,
  testTimeout: 120000, // 2 minutes timeout for tests
  startupWaitTime: 5000, // Wait 5 seconds for services to start
};

// Store the running processes
const runningProcesses = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Log messages with colors
 */
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Check if a port is in use
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

/**
 * Start the backend server
 */
async function startBackend() {
  log('Starting backend server...', colors.cyan);
  
  // Check if port is already in use
  const portInUse = await isPortInUse(CONFIG.backendPort);
  if (portInUse) {
    log(`Port ${CONFIG.backendPort} is already in use.`, colors.yellow);
    log('Please stop any running backend instances or change the port.', colors.yellow);
    process.exit(1);
  }
  
  const backendProcess = spawn('node', ['src/server.js'], {
    env: { ...process.env, PORT: CONFIG.backendPort },
    stdio: 'pipe',
  });
  
  runningProcesses.push(backendProcess);
  
  backendProcess.stdout.on('data', (data) => {
    log(`Backend: ${data}`, colors.cyan);
    
    // Check if the server is listening
    if (data.toString().includes('Server listening on port')) {
      log('Backend server started successfully based on log message', colors.green);
    }
  });
  
  backendProcess.stderr.on('data', (data) => {
    log(`Backend Error: ${data}`, colors.red);
  });
  
  // Return a promise that resolves when the server is ready
  return new Promise((resolve, reject) => {
    // Set a timeout for the whole operation
    const timeout = setTimeout(() => {
      log('Backend startup timed out', colors.red);
      reject(new Error('Backend startup timed out'));
    }, 30000); // 30 seconds timeout
    
    // Function to check if the server is up
    const checkHealth = () => {
      try {
        const req = http.request({
          hostname: 'localhost',
          port: CONFIG.backendPort,
          path: '/api/health',
          method: 'GET',
          timeout: 1000,
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              clearTimeout(timeout);
              log('Health check successful!', colors.green);
              resolve(backendProcess);
            } else {
              log(`Health check returned status: ${res.statusCode}`, colors.yellow);
              // Try again after a delay
              setTimeout(checkHealth, 1000);
            }
          });
        });
        
        req.on('error', (err) => {
          log(`Health check error: ${err.message}`, colors.yellow);
          // Try again after a delay
          setTimeout(checkHealth, 1000);
        });
        
        req.end();
      } catch (error) {
        log(`Error during health check: ${error.message}`, colors.red);
        // Try again after a delay
        setTimeout(checkHealth, 1000);
      }
    };
    
    // Wait a bit before first check
    setTimeout(() => {
      checkHealth();
    }, CONFIG.startupWaitTime);
  });
}

/**
 * Run frontend tests
 */
async function runFrontendTests() {
  log('Running frontend integration tests...', colors.magenta);
  
  try {
    // Use spawn instead of exec to stream the output
    const testProcess = spawn('npm', ['run', 'test:integration'], {
      cwd: path.join(process.cwd(), 'frontend'),
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' },
    });
    
    runningProcesses.push(testProcess);
    
    return new Promise((resolve, reject) => {
      testProcess.on('close', (code) => {
        if (code === 0) {
          log('Frontend tests completed successfully', colors.green);
          resolve();
        } else {
          reject(new Error(`Frontend tests failed with exit code ${code}`));
        }
      });
    });
  } catch (error) {
    log(`Error running frontend tests: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Test form submission integration
 */
async function testFormSubmission() {
  log('Testing Form Submission Integration...', colors.yellow);
  
  try {
    // Submit a test form using curl or similar
    const response = await execPromise(`curl -X POST -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","phone":"555-123-4567","program":"tactical-defense"}' http://localhost:${CONFIG.backendPort}/api/form/free-class`);
    
    // Check the response
    const result = JSON.parse(response.stdout);
    if (result.success) {
      log('Form submission integration test passed', colors.green);
    } else {
      throw new Error(`Form submission failed: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    log(`Error testing form submission: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Test appointment booking integration
 */
async function testAppointmentBooking() {
  log('Testing Appointment Booking Integration...', colors.yellow);
  
  try {
    // Get available time slots
    const slotsResponse = await execPromise(`curl -X GET "http://localhost:${CONFIG.backendPort}/api/appointment/available?date=2023-06-15&program=tactical-defense"`);
    const slotsResult = JSON.parse(slotsResponse.stdout);
    
    if (!slotsResult.success || !slotsResult.data || !slotsResult.data.timeSlots || slotsResult.data.timeSlots.length === 0) {
      throw new Error('Failed to get available time slots');
    }
    
    // Find an available slot
    const availableSlot = slotsResult.data.timeSlots.find(slot => slot.available);
    if (!availableSlot) {
      throw new Error('No available time slots found');
    }
    
    // Book the appointment
    const bookingResponse = await execPromise(`curl -X POST -H "Content-Type: application/json" -d '{"leadId":"test_lead_123","timeSlotId":"${availableSlot.id}"}' http://localhost:${CONFIG.backendPort}/api/appointment/reserve`);
    const bookingResult = JSON.parse(bookingResponse.stdout);
    
    if (bookingResult.success) {
      log('Appointment booking integration test passed', colors.green);
    } else {
      throw new Error(`Appointment booking failed: ${JSON.stringify(bookingResult)}`);
    }
  } catch (error) {
    log(`Error testing appointment booking: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Clean up processes on exit
 */
function cleanup() {
  log('Cleaning up...', colors.blue);
  for (const process of runningProcesses) {
    if (!process.killed) {
      process.kill();
    }
  }
}

/**
 * Run integration tests manually by providing steps
 */
async function runManualTests() {
  log('Running manual integration tests...', colors.magenta);
  
  log('1. Start the backend server', colors.yellow);
  log('2. Open a new terminal and navigate to the frontend directory', colors.yellow);
  log('3. Run "npm start" to start the frontend development server', colors.yellow);
  log('4. Open a browser and navigate to http://localhost:3000', colors.yellow);
  log('5. Test the form submission flow by clicking "Book Your Free Class"', colors.yellow);
  log('6. Fill in the form and submit it', colors.yellow);
  log('7. Check the backend logs to verify the form was received', colors.yellow);
  
  // Ask the user if the tests passed
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    readline.question('Did the manual tests pass? (y/n): ', (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        log('Manual tests passed!', colors.green);
        resolve();
      } else {
        reject(new Error('Manual tests failed'));
      }
    });
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Check if manual testing is requested
    const shouldRunManually = process.argv.includes('--manual');
    
    // Register cleanup handler
    process.on('SIGINT', () => {
      cleanup();
      process.exit(1);
    });
    process.on('SIGTERM', () => {
      cleanup();
      process.exit(1);
    });

    // Start backend server
    await startBackend();
    
    if (shouldRunManually) {
      // Run manual tests
      log('Running in manual testing mode', colors.magenta);
      await runManualTests();
    } else {
      // Run frontend tests
      await runFrontendTests();
      
      // Test specific integrations
      await testFormSubmission();
      await testAppointmentBooking();
    }
    
    log('All integration tests passed successfully!', colors.green);
    
    // Clean up
    cleanup();
    process.exit(0);
  } catch (error) {
    log(`Integration testing failed: ${error.message}`, colors.red);
    cleanup();
    process.exit(1);
  }
}

// Run the main function
main(); 