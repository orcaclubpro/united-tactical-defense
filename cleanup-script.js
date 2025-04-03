/**
 * Cleanup Script
 * Safely removes redundant files and directories after migration
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);
const existsAsync = promisify(fs.exists);
const renameAsync = promisify(fs.rename);
const mkdirAsync = promisify(fs.mkdir);

// Files to be removed
const filesToRemove = [
  // Root directory test files (already migrated)
  'test-auth.js',
  'test-db.js',
  'test-insert.js',
  'test-integration.js',
  'check-tables.js',
  'check-ports.js',
  
  // Database initialization scripts (replaced by migration system)
  'init-db.js',
  'update-tables.js',
  
  // Redundant database file (now consolidated)
  'unitedDT.db',
  
  // Frontend artifacts that shouldn't be in root
  'UI-UX-TEST.md',
  
  // Deprecated/unused files
  'App.tsx'
];

// Directories to be moved to backup before removal
const dirsToBackup = [
  'backend',
  'oldsite'
];

// Create backup directory
const createBackupDir = async () => {
  const backupDir = path.join(process.cwd(), 'backup-deprecated');
  
  if (!await existsAsync(backupDir)) {
    console.log('Creating backup directory...');
    await mkdirAsync(backupDir, { recursive: true });
  }
  
  return backupDir;
};

// Backup a directory before removal
const backupDirectory = async (dir, backupDir) => {
  const sourcePath = path.join(process.cwd(), dir);
  const destPath = path.join(backupDir, dir);
  
  if (!await existsAsync(sourcePath)) {
    console.log(`Directory not found: ${dir}`);
    return false;
  }
  
  try {
    // Create target directory
    await mkdirAsync(path.dirname(destPath), { recursive: true });
    
    // Use rsync to copy
    console.log(`Backing up ${dir} to ${destPath}...`);
    await execAsync(`cp -R "${sourcePath}" "${destPath}"`);
    
    return true;
  } catch (error) {
    console.error(`Error backing up ${dir}:`, error.message);
    return false;
  }
};

// Remove a file safely
const removeFile = async (file) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!await existsAsync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  try {
    console.log(`Removing file: ${file}`);
    // Using git rm if this is a git repository, otherwise regular fs.unlink
    try {
      await execAsync(`git ls-files --error-unmatch "${file}" > /dev/null 2>&1 && git rm "${file}" || rm "${filePath}"`);
    } catch {
      // If git command fails (not a git repo or file not tracked), use regular rm
      await promisify(fs.unlink)(filePath);
    }
    console.log(`Successfully removed: ${file}`);
  } catch (error) {
    console.error(`Error removing ${file}:`, error.message);
  }
};

// Remove a directory safely
const removeDirectory = async (dir) => {
  const dirPath = path.join(process.cwd(), dir);
  
  if (!await existsAsync(dirPath)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  try {
    console.log(`Removing directory: ${dir}`);
    await execAsync(`rm -rf "${dirPath}"`);
    console.log(`Successfully removed: ${dir}`);
  } catch (error) {
    console.error(`Error removing ${dir}:`, error.message);
  }
};

// Main execution
const cleanup = async () => {
  console.log('Starting cleanup process...');
  
  // Create backup directory
  const backupDir = await createBackupDir();
  
  // Backup directories before removal
  for (const dir of dirsToBackup) {
    const backedUp = await backupDirectory(dir, backupDir);
    if (backedUp) {
      await removeDirectory(dir);
    }
  }
  
  // Remove files
  for (const file of filesToRemove) {
    await removeFile(file);
  }
  
  console.log('\nCleanup complete!');
  console.log(`Backed up directories can be found in: ${backupDir}`);
  console.log('Please verify that everything is working correctly before removing the backup.');
};

// Add a confirmation prompt for safety
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('This script will remove redundant files and backup/remove deprecated directories.');
console.log('The following files will be removed:');
filesToRemove.forEach(file => console.log(`- ${file}`));
console.log('\nThe following directories will be backed up and then removed:');
dirsToBackup.forEach(dir => console.log(`- ${dir}`));

rl.question('\nAre you sure you want to proceed? (yes/no): ', async (answer) => {
  if (answer.toLowerCase() === 'yes') {
    await cleanup();
  } else {
    console.log('Cleanup aborted.');
  }
  rl.close();
}); 