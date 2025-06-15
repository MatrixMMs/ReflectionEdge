const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512
};

const sourceIcon = path.join(__dirname, '../src/assets/icon.svg');

async function generateIcons() {
  try {
    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Generate each icon size
    for (const [filename, size] of Object.entries(sizes)) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(publicDir, filename));
      console.log(`Generated ${filename}`);
    }

    // Generate favicon.svg
    fs.copyFileSync(
      sourceIcon,
      path.join(publicDir, 'favicon.svg')
    );
    console.log('Generated favicon.svg');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 