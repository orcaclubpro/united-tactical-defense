#!/usr/bin/env node

/**
 * Video optimization script for frontend assets
 * Converts videos to web-optimized formats (MP4 and WebM)
 * 
 * To use: npm install ffmpeg-static
 * Then run: node scripts/optimize-videos.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Configuration
const config = {
  inputPattern: 'public/assets/images/*.{mov,MOV,mp4,MP4}',
  outputDir: 'public/assets/videos',
  createPoster: true,
  posterQuality: 80,
  mp4Settings: {
    codec: 'libx264',
    preset: 'medium',
    crf: 23,
    maxWidth: 1280,
    maxHeight: 720
  },
  webmSettings: {
    codec: 'libvpx',
    quality: 30,
    maxWidth: 1280,
    maxHeight: 720
  }
};

// Stats tracking
const stats = {
  totalVideos: 0,
  processedVideos: 0,
  skippedVideos: 0,
  totalSavingsMB: 0
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Get all video files
const videoFiles = glob.sync(config.inputPattern);
stats.totalVideos = videoFiles.length;

console.log(`Found ${stats.totalVideos} video files to process`);

// Process each video
videoFiles.forEach(filePath => {
  try {
    const fileName = path.basename(filePath);
    const fileBaseName = path.basename(fileName, path.extname(fileName));
    const originalSize = fs.statSync(filePath).size / (1024 * 1024); // Size in MB
    
    console.log(`Processing: ${fileName} (${originalSize.toFixed(2)} MB)`);
    
    // Generate MP4 version
    const mp4OutputPath = path.join(config.outputDir, `${fileBaseName}.mp4`);
    const mp4Command = `ffmpeg -i "${filePath}" -c:v ${config.mp4Settings.codec} -preset ${config.mp4Settings.preset} -crf ${config.mp4Settings.crf} -vf "scale=w=${config.mp4Settings.maxWidth}:h=${config.mp4Settings.maxHeight}:force_original_aspect_ratio=decrease" -c:a aac -b:a 128k "${mp4OutputPath}"`;
    
    execSync(mp4Command, { stdio: 'inherit' });
    
    // Generate WebM version
    const webmOutputPath = path.join(config.outputDir, `${fileBaseName}.webm`);
    const webmCommand = `ffmpeg -i "${filePath}" -c:v ${config.webmSettings.codec} -b:v 1M -vf "scale=w=${config.webmSettings.maxWidth}:h=${config.webmSettings.maxHeight}:force_original_aspect_ratio=decrease" -c:a libvorbis "${webmOutputPath}"`;
    
    execSync(webmCommand, { stdio: 'inherit' });
    
    // Generate poster image if enabled
    if (config.createPoster) {
      const posterPath = path.join('public/assets/images', `${fileBaseName}-poster.jpg`);
      const posterCommand = `ffmpeg -i "${filePath}" -ss 00:00:01 -frames:v 1 -q:v ${config.posterQuality} "${posterPath}"`;
      
      execSync(posterCommand, { stdio: 'inherit' });
    }
    
    // Calculate size savings
    const mp4Size = fs.statSync(mp4OutputPath).size / (1024 * 1024);
    const webmSize = fs.existsSync(webmOutputPath) ? fs.statSync(webmOutputPath).size / (1024 * 1024) : 0;
    const savings = originalSize - Math.max(mp4Size, webmSize);
    
    stats.processedVideos++;
    stats.totalSavingsMB += savings;
    
    console.log(`✓ Processed: ${fileName} - Saved ${savings.toFixed(2)} MB`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    stats.skippedVideos++;
  }
});

// Print summary
console.log('\nVideo Optimization Summary:');
console.log(`Total videos: ${stats.totalVideos}`);
console.log(`Processed: ${stats.processedVideos}`);
console.log(`Skipped: ${stats.skippedVideos}`);
console.log(`Total size savings: ${stats.totalSavingsMB.toFixed(2)} MB`); 