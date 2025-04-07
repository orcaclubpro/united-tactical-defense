#!/usr/bin/env node

/**
 * Critical Assets Script
 * 
 * Identifies and preloads critical assets for faster page loading.
 * Adds preload links to index.html for critical images, videos, and fonts.
 * 
 * Usage: node scripts/critical-assets.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
  indexHtmlPath: 'public/index.html',
  criticalAssets: {
    images: [
      'assets/images/logo.png',
      'assets/images/hero-fallback.jpg',
      'assets/images/video-poster.jpg'
    ],
    videos: [
      'assets/videos/ty.mp4'
    ],
    fonts: [
      'fonts/main-font.woff2'
    ]
  }
};

// Read the index.html file
let indexHtml = fs.readFileSync(config.indexHtmlPath, 'utf8');

// Function to add preload links
const addPreloadLinks = () => {
  let preloadLinks = '';
  
  // Add preload for critical images
  config.criticalAssets.images.forEach(image => {
    const ext = path.extname(image).toLowerCase();
    const type = ext === '.svg' ? 'image/svg+xml' : 
                 ext === '.webp' ? 'image/webp' : 
                 ext === '.png' ? 'image/png' : 'image/jpeg';
    
    preloadLinks += `    <link rel="preload" href="%PUBLIC_URL%/${image}" as="image" type="${type}">\n`;
  });
  
  // Add preload for critical videos
  config.criticalAssets.videos.forEach(video => {
    const ext = path.extname(video).toLowerCase();
    const type = ext === '.webm' ? 'video/webm' : 'video/mp4';
    
    preloadLinks += `    <link rel="preload" href="%PUBLIC_URL%/${video}" as="video" type="${type}">\n`;
  });
  
  // Add preload for critical fonts
  config.criticalAssets.fonts.forEach(font => {
    preloadLinks += `    <link rel="preload" href="%PUBLIC_URL%/${font}" as="font" type="font/woff2" crossorigin>\n`;
  });
  
  // Insert preload links after the existing preload links
  const preloadMarker = '<!-- Preload critical images -->';
  if (indexHtml.includes(preloadMarker)) {
    indexHtml = indexHtml.replace(preloadMarker, `${preloadMarker}\n${preloadLinks}`);
  } else {
    // If marker doesn't exist, add after the first preload link or after the meta tags
    const metaTagEnd = indexHtml.indexOf('</head>');
    if (metaTagEnd !== -1) {
      indexHtml = indexHtml.slice(0, metaTagEnd) + `\n${preloadLinks}` + indexHtml.slice(metaTagEnd);
    }
  }
};

// Add preload links
addPreloadLinks();

// Write the updated index.html file
fs.writeFileSync(config.indexHtmlPath, indexHtml);

console.log('Critical assets preload links added to index.html'); 