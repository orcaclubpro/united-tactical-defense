#!/usr/bin/env node

/**
 * Critical Assets Extraction Script
 * 
 * This script extracts and inlines critical CSS for faster initial page load.
 * It identifies critical-path CSS needed for above-the-fold content.
 * 
 * Usage: node scripts/critical-assets.js
 */

const fs = require('fs');
const path = require('path');
const critical = require('critical');
const glob = require('glob');

// Configuration
const config = {
  base: 'build/',
  width: 1300,
  height: 900,
  target: {
    css: 'build/critical.css',
    html: 'build/index.html',
    uncritical: 'build/non-critical.css',
  },
  extract: true,
  inline: true,
  dimensions: [
    {
      width: 375,
      height: 667,
    },
    {
      width: 1024,
      height: 768,
    },
    {
      width: 1920,
      height: 1080,
    }
  ],
  ignore: {
    atrule: ['@font-face', '@import'],
    rule: [/print/],
    decl: (node, value) => /url\(/.test(value),
  },
};

/**
 * Process HTML files to extract and inline critical CSS
 */
async function processCriticalCSS() {
  console.log('🔍 Finding HTML files...');
  
  try {
    // Get all HTML files
    const htmlFiles = glob.sync('build/**/*.html');
    console.log(`Found ${htmlFiles.length} HTML files.`);
    
    if (htmlFiles.length === 0) {
      console.log('No HTML files found. Make sure you have run the build script first.');
      return;
    }
    
    console.log('⚙️ Extracting critical CSS...');
    
    // Process each HTML file
    for (const htmlFile of htmlFiles) {
      const relativePath = path.relative('build', htmlFile);
      console.log(`Processing: ${relativePath}`);
      
      await critical.generate({
        ...config,
        src: relativePath,
        target: {
          ...config.target,
          html: htmlFile,
          css: `${path.dirname(htmlFile)}/critical-${path.basename(relativePath, '.html')}.css`,
        },
      });
      
      console.log(`✅ Processed: ${relativePath}`);
    }
    
    console.log('🎉 All HTML files processed successfully!');
  } catch (err) {
    console.error('Error processing critical CSS:', err);
    process.exit(1);
  }
}

/**
 * Optimize font loading by preloading critical fonts
 */
function optimizeFontLoading() {
  console.log('⚙️ Optimizing font loading...');
  
  try {
    const indexHtmlPath = path.join('build', 'index.html');
    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Find all CSS font imports
    const cssFiles = glob.sync('build/**/*.css');
    let fontFiles = [];
    
    for (const cssFile of cssFiles) {
      const cssContent = fs.readFileSync(cssFile, 'utf8');
      const fontFaces = cssContent.match(/@font-face\s*{[^}]*}/g) || [];
      
      for (const fontFace of fontFaces) {
        const urls = fontFace.match(/url\(['"]?([^'")]+)['"]?\)/g) || [];
        
        for (const url of urls) {
          // Extract URL from url() function
          const fontUrl = url.match(/url\(['"]?([^'")]+)['"]?\)/)[1];
          
          // Skip data URIs
          if (fontUrl.startsWith('data:')) continue;
          
          // Skip already preloaded fonts
          if (htmlContent.includes(`rel="preload" href="${fontUrl}"`)) continue;
          
          const fontFormat = fontFace.includes('woff2') ? 'woff2' : 
                             fontFace.includes('woff') ? 'woff' : 'truetype';
          
          fontFiles.push({ url: fontUrl, format: fontFormat });
        }
      }
    }
    
    // Create preload tags for primary fonts
    const preloadTags = fontFiles
      .filter((font, index, self) => 
        // Only keep first occurrence of each URL
        index === self.findIndex(f => f.url === font.url)
      )
      .slice(0, 2) // Preload only the most important fonts
      .map(font => 
        `<link rel="preload" href="${font.url}" as="font" type="font/${font.format}" crossorigin>`
      )
      .join('\n    ');
    
    // Add preload tags to head
    if (preloadTags) {
      htmlContent = htmlContent.replace(
        '</head>', 
        `    <!-- Preloaded critical fonts -->\n    ${preloadTags}\n</head>`
      );
      
      // Write modified HTML
      fs.writeFileSync(indexHtmlPath, htmlContent);
      console.log(`✅ Added font preloading for ${fontFiles.slice(0, 2).length} critical fonts`);
    } else {
      console.log('No fonts found for preloading');
    }
  } catch (err) {
    console.error('Error optimizing font loading:', err);
  }
}

// Run the script
async function main() {
  console.log('🚀 Starting critical assets extraction...');
  
  await processCriticalCSS();
  optimizeFontLoading();
  
  console.log('✨ Critical assets extraction complete!');
}

main().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
}); 