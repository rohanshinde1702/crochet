const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  try {
    sharp = require('./backend/node_modules/sharp');
  } catch (err) {
    sharp = require(path.join(__dirname, 'backend/node_modules/sharp'));
  }
}

// Preset target dimensions for key template assets
const CUSTOM_DIMENSIONS = {
  // Hero sliders & Page Banners
  'slider-1.png': { width: 1905, height: 680 },
  'slider-2.png': { width: 1905, height: 680 },
  'slider-3.png': { width: 1905, height: 680 },
  'shop-hero.jpg': { width: 1905, height: 680 },
  'blog_hero_banner_1787376863197.jpg': { width: 1905, height: 680 },

  // Blog Covers
  'blog_yarn_selection_1787376883256.jpg': { width: 1200, height: 750 },
  'blog_amigurumi_making_1787376901909.jpg': { width: 1200, height: 750 },
  'blog_crochet_care_1787376919974.jpg': { width: 1200, height: 750 },

  // Auth pages
  'signin_banner.jpg': { width: 896, height: 1200 },
  'signup_art.jpg': { width: 896, height: 1200 },

  // Contact cards
  'contact_bunny.jpg': { width: 1000, height: 1000 },
  'contact_flowers.jpg': { width: 1000, height: 1000 },
  'contact_hearts_basket.jpg': { width: 1000, height: 1000 },

  // About / Features / Newsletter
  'madeByHand.png': { width: 750, height: 1000 },
  'maker.png': { width: 1200, height: 800 },
  'newsletter.png': { width: 1900, height: 500 },
  'ourStory.png': { width: 1200, height: 900 },

  // Logos
  'logo.png': { width: 600, height: 200 },
  'logo.webp': { width: 600, height: 200 }
};

/**
 * Creates an SVG buffer with clean, centered dimension text on a gray background
 */
function createPlaceholderSvg(width, height) {
  let fontSize = Math.round(Math.min(width * 0.08, height * 0.16));
  if (fontSize < 16) fontSize = 16;
  if (fontSize > 130) fontSize = 130;

  const text = `${width} × ${height}`;

  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#CBCBCB"/>
    <text 
      x="50%" 
      y="50%" 
      dominant-baseline="central" 
      text-anchor="middle" 
      fill="#1E1E1E" 
      font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
      font-size="${fontSize}px" 
      font-weight="400"
      letter-spacing="0.5px"
    >${text}</text>
  </svg>`);
}

/**
 * Generate a single placeholder image file with given dimensions and format
 */
async function generatePlaceholderFile(filePath, width, height) {
  const ext = path.extname(filePath).toLowerCase();
  const svg = createPlaceholderSvg(width, height);
  const sharpInstance = sharp(svg);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (ext === '.jpg' || ext === '.jpeg') {
    await sharpInstance.jpeg({ quality: 90 }).toFile(filePath);
  } else if (ext === '.webp') {
    await sharpInstance.webp({ quality: 90 }).toFile(filePath);
  } else if (ext === '.png') {
    await sharpInstance.png().toFile(filePath);
  }
}

/**
 * Recursively scan directory and replace all images with placeholders
 */
async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
      const filename = entry.name;
      let width = 600;
      let height = 600;

      if (CUSTOM_DIMENSIONS[filename]) {
        width = CUSTOM_DIMENSIONS[filename].width;
        height = CUSTOM_DIMENSIONS[filename].height;
      } else if (fullPath.includes('products')) {
        width = 600;
        height = 600;
      } else {
        try {
          const meta = await sharp(fullPath).metadata();
          if (meta.width && meta.height) {
            width = meta.width;
            height = meta.height;
          }
        } catch (e) {
          // Fallback to default
        }
      }

      console.log(`Generating placeholder for: ${path.relative(__dirname, fullPath)} (${width} × ${height})`);
      await generatePlaceholderFile(fullPath, width, height);
    }
  }
}

async function main() {
  console.log('=== THEMEFOREST PLACEHOLDER GENERATION START ===\n');

  const targets = [
    path.join(__dirname, 'backend/uploads'),
    path.join(__dirname, 'frontend/public/uploads')
  ];

  for (const target of targets) {
    console.log(`\nScanning & replacing in: ${path.relative(__dirname, target)}`);
    await processDirectory(target);
  }

  // Also sync any missing files between backend/uploads and frontend/public/uploads
  const backendUploads = path.join(__dirname, 'backend/uploads');
  const frontendUploads = path.join(__dirname, 'frontend/public/uploads');

  function copyDirRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  console.log('\nSynchronizing backend/uploads <-> frontend/public/uploads...');
  copyDirRecursive(backendUploads, frontendUploads);
  copyDirRecursive(frontendUploads, backendUploads);

  console.log('\n=== ALL IMAGES SUCCESSFULLY REPLACED WITH THEMEFOREST PLACEHOLDERS! ===');
}

main().catch(err => {
  console.error('Error generating placeholders:', err);
  process.exit(1);
});
