#!/usr/bin/env node

/**
 * Asset Compression Script
 * 
 * Compresses static assets to improve load performance.
 * Creates Brotli and Gzip versions of JavaScript, CSS, HTML, and font files.
 * 
 * Usage: node scripts/compress-assets.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const zlib = require('zlib');
const util = require('util');

// Convert to promise-based functions
const gzip = util.promisify(zlib.gzip);
const brotliCompress = util.promisify(zlib.brotliCompress);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Configuration
const config = {
  // Directories to compress (relative to build/)
  targets: ['static/**/*.{js,css,html}', '**/*.{js,css,html}', 'static/media/**/*.{woff,woff2}'],
  // Base directory
  baseDir: 'build',
  // Compression options
  gzip: {
    level: 9, // Maximum compression level
  },
  brotli: {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Maximum quality
    },
  },
  // File size threshold in bytes (don't compress files smaller than this)
  sizeThreshold: 1024, // 1KB
};

/**
 * Get all files matching patterns
 * @returns {string[]} Array of file paths
 */
function getTargetFiles() {
  const files = [];
  
  for (const pattern of config.targets) {
    const matches = glob.sync(path.join(config.baseDir, pattern));
    files.push(...matches);
  }
  
  return [...new Set(files)]; // Remove duplicates
}

/**
 * Compress a single file with both Gzip and Brotli
 * @param {string} filePath Path to the file to compress
 */
async function compressFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    
    // Skip small files
    if (stats.size < config.sizeThreshold) {
      return;
    }
    
    const content = await readFile(filePath);
    
    // Create gzip version
    try {
      const gzipped = await gzip(content, config.gzip);
      await writeFile(`${filePath}.gz`, gzipped);
      
      const compressionRatio = ((content.length - gzipped.length) / content.length * 100).toFixed(2);
      console.log(`✓ Gzip: ${path.relative(config.baseDir, filePath)} (${compressionRatio}% reduction)`);
    } catch (err) {
      console.error(`Error creating gzip for ${filePath}:`, err.message);
    }
    
    // Create brotli version
    try {
      const compressed = await brotliCompress(content, config.brotli);
      await writeFile(`${filePath}.br`, compressed);
      
      const compressionRatio = ((content.length - compressed.length) / content.length * 100).toFixed(2);
      console.log(`✓ Brotli: ${path.relative(config.baseDir, filePath)} (${compressionRatio}% reduction)`);
    } catch (err) {
      console.error(`Error creating brotli for ${filePath}:`, err.message);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting asset compression...');
  
  // Get all target files
  const files = getTargetFiles();
  console.log(`Found ${files.length} files to compress.`);
  
  if (files.length === 0) {
    console.log('No files found for compression. Make sure you have built the project first.');
    return;
  }
  
  // Process files in batches to avoid memory issues
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map(compressFile));
  }
  
  console.log('✨ Asset compression complete!');
  
  // Print summary
  const gzipFiles = glob.sync(path.join(config.baseDir, '**/*.gz'));
  const brotliFiles = glob.sync(path.join(config.baseDir, '**/*.br'));
  
  console.log('\n📊 Compression Summary:');
  console.log(`Total files processed: ${files.length}`);
  console.log(`Gzip files created: ${gzipFiles.length}`);
  console.log(`Brotli files created: ${brotliFiles.length}`);
}

// Run the script
main().catch(err => {
  console.error('Error running compression script:', err);
  process.exit(1);
});