const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

console.log('Starting asset optimization process...');
console.log(`Using ffmpeg from: ${ffmpegStatic}`);

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const ASSETS_DIR = path.join(__dirname, '../public/assets');
const BUILD_ASSETS_DIR = path.join(__dirname, '../build/assets');

console.log(`Source assets directory: ${ASSETS_DIR}`);
console.log(`Build assets directory: ${BUILD_ASSETS_DIR}`);

// Ensure build directories exist
if (!fs.existsSync(BUILD_ASSETS_DIR)) {
  console.log('Creating build assets directory...');
  fs.mkdirSync(BUILD_ASSETS_DIR, { recursive: true });
  fs.mkdirSync(path.join(BUILD_ASSETS_DIR, 'images'), { recursive: true });
  fs.mkdirSync(path.join(BUILD_ASSETS_DIR, 'videos'), { recursive: true });
  console.log('Build directories created successfully');
} else {
  console.log('Build directories already exist');
}

// Create videos directory in public if it doesn't exist
const PUBLIC_VIDEOS_DIR = path.join(ASSETS_DIR, 'videos');
if (!fs.existsSync(PUBLIC_VIDEOS_DIR)) {
  console.log('Creating public videos directory...');
  fs.mkdirSync(PUBLIC_VIDEOS_DIR, { recursive: true });
  console.log('Public videos directory created successfully');
} else {
  console.log('Public videos directory already exists');
}

// Move video file if it's in the wrong location
const oldVideoPath = path.join(ASSETS_DIR, 'images', 'ty.MOV');
const newVideoPath = path.join(PUBLIC_VIDEOS_DIR, 'ty.MOV');
if (fs.existsSync(oldVideoPath) && !fs.existsSync(newVideoPath)) {
  console.log(`Moving video file from ${oldVideoPath} to ${newVideoPath}...`);
  fs.renameSync(oldVideoPath, newVideoPath);
  console.log('Video file moved successfully');
} else if (fs.existsSync(newVideoPath)) {
  console.log('Video file already in correct location');
} else if (!fs.existsSync(oldVideoPath)) {
  console.log('Warning: Video file not found in images directory');
}

// Optimize images
async function optimizeImages() {
  console.log('\nStarting image optimization...');
  const imagesDir = path.join(ASSETS_DIR, 'images');
  console.log(`Scanning directory: ${imagesDir}`);
  
  if (!fs.existsSync(imagesDir)) {
    console.error(`Error: Images directory not found at ${imagesDir}`);
    return;
  }
  
  const files = fs.readdirSync(imagesDir);
  console.log(`Found ${files.length} files in images directory`);
  
  let optimizedCount = 0;
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(imagesDir, file);
      const outputPath = path.join(BUILD_ASSETS_DIR, 'images', file);
      
      console.log(`\nOptimizing: ${file}`);
      console.log(`Input path: ${inputPath}`);
      console.log(`Output path: ${outputPath}`);
      
      try {
        const stats = fs.statSync(inputPath);
        console.log(`Original file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        
        await sharp(inputPath)
          .resize(1920, 1080, { // Max dimensions while maintaining aspect ratio
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 }) // Adjust quality as needed
          .toFile(outputPath);
        
        const newStats = fs.statSync(outputPath);
        console.log(`Optimized file size: ${(newStats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Size reduction: ${((1 - newStats.size / stats.size) * 100).toFixed(2)}%`);
        
        optimizedCount++;
      } catch (error) {
        console.error(`Error optimizing ${file}:`, error);
      }
    } else {
      console.log(`Skipping non-image file: ${file}`);
    }
  }
  
  console.log(`\nImage optimization completed. Optimized ${optimizedCount} images.`);
}

// Convert video to web formats
async function convertVideo() {
  console.log('\nStarting video conversion...');
  const inputPath = path.join(PUBLIC_VIDEOS_DIR, 'ty.MOV');
  const outputPathMP4 = path.join(BUILD_ASSETS_DIR, 'videos', 'ty.mp4');
  const outputPathWebM = path.join(BUILD_ASSETS_DIR, 'videos', 'ty.webm');

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Video file not found at ${inputPath}`);
    return;
  }
  
  console.log(`Input video: ${inputPath}`);
  console.log(`Output MP4: ${outputPathMP4}`);
  console.log(`Output WebM: ${outputPathWebM}`);
  
  const stats = fs.statSync(inputPath);
  console.log(`Original video size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Remove any existing video files in the build directory
  if (fs.existsSync(outputPathMP4)) {
    console.log(`Removing existing MP4 file: ${outputPathMP4}`);
    fs.unlinkSync(outputPathMP4);
  }
  if (fs.existsSync(outputPathWebM)) {
    console.log(`Removing existing WebM file: ${outputPathWebM}`);
    fs.unlinkSync(outputPathWebM);
  }
  
  // Remove the original MOV file if it was copied
  const originalMovInBuild = path.join(BUILD_ASSETS_DIR, 'videos', 'ty.MOV');
  if (fs.existsSync(originalMovInBuild)) {
    console.log(`Removing original MOV file from build directory: ${originalMovInBuild}`);
    fs.unlinkSync(originalMovInBuild);
  }

  // Convert to MP4
  console.log('\nConverting to MP4...');
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264', // Use H.264 codec
        '-c:a aac',     // Use AAC audio codec
        '-b:v 2M',      // Video bitrate
        '-b:a 128k',    // Audio bitrate
        '-movflags +faststart' // Enable fast start for web playback
      ])
      .output(outputPathMP4)
      .on('start', (commandLine) => {
        console.log(`Started MP4 conversion with command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`MP4 conversion progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        const mp4Stats = fs.statSync(outputPathMP4);
        console.log(`MP4 conversion completed. File size: ${(mp4Stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Size reduction: ${((1 - mp4Stats.size / stats.size) * 100).toFixed(2)}%`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during MP4 conversion:', err);
        reject(err);
      })
      .run();
  });

  // Convert to WebM
  console.log('\nConverting to WebM...');
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libvpx-vp9', // Use VP9 codec
        '-c:a libopus',    // Use Opus audio codec
        '-b:v 2M',         // Video bitrate
        '-b:a 128k'        // Audio bitrate
      ])
      .output(outputPathWebM)
      .on('start', (commandLine) => {
        console.log(`Started WebM conversion with command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`WebM conversion progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        const webmStats = fs.statSync(outputPathWebM);
        console.log(`WebM conversion completed. File size: ${(webmStats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Size reduction: ${((1 - webmStats.size / stats.size) * 100).toFixed(2)}%`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during WebM conversion:', err);
        reject(err);
      })
      .run();
  });
  
  console.log('\nVideo conversion completed successfully');
}

// Run optimizations
async function optimizeAssets() {
  console.log('\n=== ASSET OPTIMIZATION STARTED ===');
  const startTime = Date.now();
  
  try {
    await optimizeImages();
    await convertVideo();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n=== ASSET OPTIMIZATION COMPLETED SUCCESSFULLY ===');
    console.log(`Total duration: ${duration.toFixed(2)} seconds`);
    
    // Verify final build directory
    console.log('\nVerifying build directory contents:');
    const buildImages = fs.readdirSync(path.join(BUILD_ASSETS_DIR, 'images'));
    const buildVideos = fs.readdirSync(path.join(BUILD_ASSETS_DIR, 'videos'));
    
    console.log(`Images in build: ${buildImages.length}`);
    console.log(`Videos in build: ${buildVideos.length}`);
    
    buildImages.forEach(file => {
      const filePath = path.join(BUILD_ASSETS_DIR, 'images', file);
      const stats = fs.statSync(filePath);
      console.log(`- ${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    });
    
    buildVideos.forEach(file => {
      const filePath = path.join(BUILD_ASSETS_DIR, 'videos', file);
      const stats = fs.statSync(filePath);
      console.log(`- ${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    });
    
  } catch (error) {
    console.error('\n=== ASSET OPTIMIZATION FAILED ===');
    console.error('Error during asset optimization:', error);
    process.exit(1);
  }
}

optimizeAssets(); 