const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  const iconsDir = path.join(__dirname, '..', 'build', 'icons');
  
  // Create directories
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Read SVG content
  const svgContent = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon.svg'), 'utf8');
  
  // For each size, create a PNG
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create a data URL from SVG
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    try {
      const img = await loadImage(svgDataUrl);
      ctx.drawImage(img, 0, 0, size, size);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(iconsDir, `${size}x${size}.png`), buffer);
      console.log(`Created ${size}x${size}.png`);
    } catch (err) {
      console.error(`Error creating ${size}x${size}.png:`, err);
    }
  }
  
  // Create icon.png as the main 512x512 icon
  const mainCanvas = createCanvas(512, 512);
  const mainCtx = mainCanvas.getContext('2d');
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  const img = await loadImage(svgDataUrl);
  mainCtx.drawImage(img, 0, 0, 512, 512);
  
  const mainBuffer = mainCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '..', 'build', 'icon.png'), mainBuffer);
  console.log('Created main icon.png');
}

convertSvgToPng().catch(console.error);