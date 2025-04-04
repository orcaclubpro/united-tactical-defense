#!/usr/bin/env node

/**
 * Comprehensive Test Runner for United Tactical Defense
 * 
 * This script runs all the test suites and generates a summary report.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_SUITES = [
  { name: 'Backend API Tests', command: 'npm', args: ['run', 'test:api'] },
  { name: 'Backend Service Tests', command: 'npm', args: ['run', 'test:services'] },
  { name: 'Backend Integration Tests', command: 'npm', args: ['run', 'test:integration'] },
  { name: 'Frontend Component Tests', command: 'cd', args: ['frontend', '&&', 'npm', 'run', 'test:components', '--', '--watchAll=false'] },
  { name: 'Frontend Service Tests', command: 'cd', args: ['frontend', '&&', 'npm', 'run', 'test:services', '--', '--watchAll=false'] }
];

// Optional test suites that need to be explicitly enabled
const OPTIONAL_TEST_SUITES = [
  { name: 'Performance Tests', command: 'npm', args: ['run', 'test:performance'], enabled: false },
  { name: 'End-to-End Tests', command: 'npm', args: ['run', 'test:e2e'], enabled: false }
];

// Parse command line arguments
const args = process.argv.slice(2);
const runPerformance = args.includes('--performance');
const runE2E = args.includes('--e2e');
const generateCoverage = args.includes('--coverage');
const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;

// Results object
const results = {
  startTime: new Date(),
  endTime: null,
  testSuites: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  }
};

// Enable optional test suites if requested
if (runPerformance) {
  OPTIONAL_TEST_SUITES.find(suite => suite.name === 'Performance Tests').enabled = true;
}

if (runE2E) {
  OPTIONAL_TEST_SUITES.find(suite => suite.name === 'End-to-End Tests').enabled = true;
}

// Add coverage tests if requested
if (generateCoverage) {
  TEST_SUITES.push(
    { name: 'Backend Coverage', command: 'npm', args: ['run', 'test:coverage'] },
    { name: 'Frontend Coverage', command: 'cd', args: ['frontend', '&&', 'npm', 'run', 'test:coverage'] }
  );
}

// Add enabled optional test suites
TEST_SUITES.push(...OPTIONAL_TEST_SUITES.filter(suite => suite.enabled));

// Function to run a command and return a promise
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n==== Running ${command} ${args.join(' ')} ====\n`);
    
    // For cd commands, we need special handling
    if (command === 'cd') {
      const cdIndex = args.indexOf('&&');
      const directory = args.slice(0, cdIndex).join(' ');
      const actualCommand = args[cdIndex + 1];
      const actualArgs = args.slice(cdIndex + 2);
      
      const child = spawn(actualCommand, actualArgs, { 
        cwd: path.join(process.cwd(), directory),
        shell: true,
        stdio: 'inherit'
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, code });
        } else {
          resolve({ success: false, code });
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    } else {
      const child = spawn(command, args, { 
        stdio: 'inherit',
        shell: true
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, code });
        } else {
          resolve({ success: false, code });
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    }
  });
}

// Run tests sequentially
async function runTests() {
  console.log('\n==== United Tactical Defense Test Runner ====\n');
  console.log(`Started at: ${results.startTime.toLocaleString()}`);
  console.log(`Running ${TEST_SUITES.length} test suites...\n`);
  
  const startTime = Date.now();
  
  for (const suite of TEST_SUITES) {
    const suiteStartTime = Date.now();
    console.log(`\n----- Running Test Suite: ${suite.name} -----\n`);
    
    try {
      const result = await runCommand(suite.command, suite.args);
      const duration = (Date.now() - suiteStartTime) / 1000;
      
      const suiteResult = {
        name: suite.name,
        success: result.success,
        exitCode: result.code,
        duration
      };
      
      results.testSuites.push(suiteResult);
      
      if (result.success) {
        results.summary.passed++;
        console.log(`\n✅ ${suite.name} passed (${duration.toFixed(2)}s)\n`);
      } else {
        results.summary.failed++;
        console.log(`\n❌ ${suite.name} failed with exit code ${result.code} (${duration.toFixed(2)}s)\n`);
      }
    } catch (error) {
      console.error(`\n❌ Error running ${suite.name}: ${error.message}\n`);
      results.testSuites.push({
        name: suite.name,
        success: false,
        error: error.message,
        duration: (Date.now() - suiteStartTime) / 1000
      });
      results.summary.failed++;
    }
  }
  
  results.summary.total = TEST_SUITES.length;
  results.summary.duration = (Date.now() - startTime) / 1000;
  results.endTime = new Date();
  
  // Generate summary
  generateSummary();
}

// Generate summary report
function generateSummary() {
  console.log('\n==== Test Summary ====\n');
  console.log(`Total test suites: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Duration: ${results.summary.duration.toFixed(2)} seconds`);
  console.log(`Started at: ${results.startTime.toLocaleString()}`);
  console.log(`Completed at: ${results.endTime.toLocaleString()}`);
  
  console.log('\nDetailed Results:');
  results.testSuites.forEach(suite => {
    const status = suite.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${suite.name} (${suite.duration.toFixed(2)}s)`);
  });
  
  // Write report to file if requested
  if (outputFile) {
    const jsonOutput = JSON.stringify(results, null, 2);
    fs.writeFileSync(outputFile, jsonOutput);
    console.log(`\nTest report written to ${outputFile}`);
  }
  
  // Exit with appropriate code
  if (results.summary.failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 