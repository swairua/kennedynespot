import sharp from 'sharp';
import https from 'https';
import fs from 'fs';
import path from 'path';

const logoUrl = 'https://cdn.builder.io/api/v1/image/assets%2Fb86ebd4367ad439bb01c133c4a5fc3ad%2F893a535077b44c029adbe34c1f855d29?format=webp&width=800';
const outputPath = path.join(process.cwd(), 'public', 'favicon.ico');

// Ensure public directory exists
const publicDir = path.dirname(outputPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download the image and convert to ICO
https.get(logoUrl, async (response) => {
  const chunks = [];
  
  response.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  response.on('end', async () => {
    try {
      const buffer = Buffer.concat(chunks);
      
      // Convert to ICO format with multiple sizes for better compatibility
      // 32x32 is the standard size
      await sharp(buffer)
        .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .toFile(outputPath);
      
      console.log(`✓ Favicon generated successfully at ${outputPath}`);
    } catch (error) {
      console.error('Error generating favicon:', error);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('Error downloading image:', error);
  process.exit(1);
});
