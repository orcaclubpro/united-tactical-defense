#!/usr/bin/env node

/**
 * Image optimization script for frontend assets
 * To use: npm install sharp glob
 * Then run: node optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sharp = require('sharp');

// Configuration
const config = {
  inputPattern: 'src/assets/**/*.{jpg,jpeg,png}',
  quality: 75, // JPEG/WebP quality
  resizeThreshold: 1920, // Max width for resizing larger images
  createWebp: true, // Also create WebP versions
  createAvif: true, // Also create AVIF versions for modern browsers
};

// Stats tracking
const stats = {
  totalImages: 0,
  optimizedImages: 0,
  skippedImages: 0,
  totalSavingsMB: 0,
};

async function optimizeImage(filePath) {
  try {
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath).toLowerCase();
    const fileBaseName = path.basename(fileName, fileExt);
    const originalSize = fs.statSync(filePath).size;

    // Load the image
    let sharpInstance = sharp(filePath);
    
    // Get metadata to check dimensions
    const metadata = await sharpInstance.metadata();
    
    // Resize if image is larger than threshold
    if (metadata.width > config.resizeThreshold) {
      sharpInstance = sharpInstance.resize({
        width: config.resizeThreshold,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Output optimized version in original format
    let outputPath;
    if (fileExt === '.jpg' || fileExt === '.jpeg') {
      outputPath = path.join(fileDir, fileName);
      await sharpInstance.jpeg({ quality: config.quality }).toFile(outputPath + '.temp');
    } else if (fileExt === '.png') {
      outputPath = path.join(fileDir, fileName);
      await sharpInstance.png({ quality: config.quality }).toFile(outputPath + '.temp');
    } else {
      console.log(`Skipping unsupported format: ${filePath}`);
      stats.skippedImages++;
      return;
    }

    // Compare sizes and replace if smaller
    const optimizedSize = fs.statSync(outputPath + '.temp').size;
    if (optimizedSize < originalSize) {
      fs.unlinkSync(filePath);
      fs.renameSync(outputPath + '.temp', filePath);
      stats.optimizedImages++;
      const savings = (originalSize - optimizedSize) / (1024 * 1024);
      stats.totalSavingsMB += savings;
      console.log(`✓ Optimized: ${fileName} - Saved ${savings.toFixed(2)}MB`);
    } else {
      fs.unlinkSync(outputPath + '.temp');
      console.log(`→ Skipped: ${fileName} (original is smaller)`);
      stats.skippedImages++;
    }

    // Generate WebP version if enabled
    if (config.createWebp) {
      const webpPath = path.join(fileDir, `${fileBaseName}.webp`);
      await sharp(filePath)
        .webp({ quality: config.quality })
        .toFile(webpPath);
      console.log(`✓ Created WebP: ${webpPath}`);
    }

    // Generate AVIF version if enabled
    if (config.createAvif) {
      const avifPath = path.join(fileDir, `${fileBaseName}.avif`);
      await sharp(filePath)
        .avif({ quality: config.quality })
        .toFile(avifPath);
      console.log(`✓ Created AVIF: ${avifPath}`);
    }
  } catch (err) {
    console.error(`Error optimizing ${filePath}:`, err);
    stats.skippedImages++;
  }
}

// Main function
async function run() {
  console.log('🔍 Finding images...');
  
  const files = glob.sync(config.inputPattern);
  stats.totalImages = files.length;
  
  if (files.length === 0) {
    console.log('No images found. Check your input pattern.');
    return;
  }
  
  console.log(`Found ${files.length} images. Optimizing...`);
  
  // Process images sequentially to avoid memory issues
  for (const file of files) {
    await optimizeImage(file);
  }
  
  // Print summary
  console.log('\n📊 Optimization Summary:');
  console.log(`Total images: ${stats.totalImages}`);
  console.log(`Optimized: ${stats.optimizedImages}`);
  console.log(`Skipped: ${stats.skippedImages}`);
  console.log(`Total space saved: ${stats.totalSavingsMB.toFixed(2)}MB`);
}

run().catch(err => {
  console.error('Error running optimization:', err);
  process.exit(1);
}); 