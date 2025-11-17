import sharp from 'sharp';
import https from 'https';
import fs from 'fs';
import path from 'path';

const logoUrl = 'https://cdn.builder.io/api/v1/image/assets%2Fb86ebd4367ad439bb01c133c4a5fc3ad%2F893a535077b44c029adbe34c1f855d29?format=webp&width=800';
const publicDir = path.join(process.cwd(), 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download the image and convert to favicons
https.get(logoUrl, async (response) => {
  const chunks = [];
  
  response.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  response.on('end', async () => {
    try {
      const buffer = Buffer.concat(chunks);
      
      // Convert to favicon with proper sizing (32x32 is standard)
      const faviconBuffer = await sharp(buffer)
        .png()
        .resize(32, 32, { 
          fit: 'contain', 
          background: { r: 255, g: 255, b: 255, alpha: 1 } 
        })
        .toBuffer();
      
      // Save as favicon.ico (browsers will accept PNG format)
      fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconBuffer);
      console.log(`✓ favicon.ico generated`);
      
      // Also save as favicon.png for redundancy
      const faviconLargeBuffer = await sharp(buffer)
        .png()
        .resize(192, 192, { 
          fit: 'contain', 
          background: { r: 255, g: 255, b: 255, alpha: 1 } 
        })
        .toBuffer();
      
      fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconLargeBuffer);
      console.log(`✓ favicon.png generated`);
      console.log(`✓ All favicons generated successfully`);
    } catch (error) {
      console.error('Error generating favicon:', error);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('Error downloading image:', error);
  process.exit(1);
});
