/**
 * Test Organization Script
 * Moves and organizes tests from the root directory to the tests directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to move and their target directories
const filesToMove = [
  { source: 'test-auth.js', target: 'tests/services/auth' },
  { source: 'test-db.js', target: 'tests/data' },
  { source: 'test-insert.js', target: 'tests/data' },
  { source: 'test-integration.js', target: 'tests/integration' },
  { source: 'check-tables.js', target: 'tests/data' },
];

// Create directories if they don't exist
const createDirectories = () => {
  const directories = [
    'tests/services',
    'tests/services/auth',
    'tests/services/lead',
    'tests/services/appointment',
    'tests/services/form',
    'tests/services/analytics',
    'tests/api',
    'tests/api/controllers',
    'tests/api/middleware',
    'tests/api/routes',
    'tests/data',
    'tests/data/repositories',
    'tests/data/models',
    'tests/core',
    'tests/integration',
    'tests/utils',
  ];

  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Move files
const moveFiles = () => {
  filesToMove.forEach(({ source, target }) => {
    const sourcePath = path.join(process.cwd(), source);
    const targetDir = path.join(process.cwd(), target);
    const fileName = path.basename(source);
    const targetPath = path.join(targetDir, fileName);
    
    if (fs.existsSync(sourcePath)) {
      // Make sure target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy the file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${source} to ${target}/${fileName}`);
      
      // Check if the file was copied successfully
      if (fs.existsSync(targetPath)) {
        // Don't delete the original file automatically for safety
        console.log(`You can now safely delete the original file: ${source}`);
      } else {
        console.error(`Failed to copy ${source}`);
      }
    } else {
      console.log(`Source file not found: ${source}`);
    }
  });
};

// Create example test files for missing test categories
const createExampleTests = () => {
  const exampleTests = [
    {
      file: 'tests/api/controllers/example.test.js',
      content: `/**
 * Example API Controller Test
 */
const { expect } = require('chai');
const sinon = require('sinon');

describe('API Controllers', () => {
  describe('Example Controller', () => {
    it('should be implemented', () => {
      // This is just a placeholder test
      expect(true).to.be.true;
    });
  });
});`
    },
    {
      file: 'tests/data/repositories/example.test.js',
      content: `/**
 * Example Repository Test
 */
const { expect } = require('chai');
const sinon = require('sinon');

describe('Data Repositories', () => {
  describe('Example Repository', () => {
    it('should be implemented', () => {
      // This is just a placeholder test
      expect(true).to.be.true;
    });
  });
});`
    }
  ];
  
  exampleTests.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`Created example test file: ${file}`);
    }
  });
};

// Update package.json test script if needed
const updatePackageJson = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if test script needs updating
    if (!packageJson.scripts.test || !packageJson.scripts.test.includes('tests/')) {
      packageJson.scripts.test = 'mocha tests/**/*.test.js';
      
      // Add test:coverage script if it doesn't exist
      if (!packageJson.scripts['test:coverage']) {
        packageJson.scripts['test:coverage'] = 'nyc mocha tests/**/*.test.js';
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Updated package.json test scripts');
    }
  }
};

// Main execution
console.log('Starting test organization...');

try {
  createDirectories();
  moveFiles();
  createExampleTests();
  updatePackageJson();
  
  console.log('Test organization complete!');
  console.log('Please review the changes and delete the original test files if everything is working correctly.');
} catch (error) {
  console.error('Error during test organization:', error);
} 