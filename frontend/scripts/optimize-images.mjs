import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await optimizeDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      const origBuf = fs.readFileSync(fullPath);
      try {
        const optBuf = await sharp(origBuf)
          .png({ compressionLevel: 9, effort: 10, palette: true })
          .toBuffer();
        if (optBuf.length < origBuf.length) {
          fs.writeFileSync(fullPath, optBuf);
          console.log(`Optimized ${entry.name}: ${(origBuf.length / 1024).toFixed(1)} KB -> ${(optBuf.length / 1024).toFixed(1)} KB (-${(((origBuf.length - optBuf.length) / origBuf.length) * 100).toFixed(1)}%)`);
        } else {
          console.log(`Skipped ${entry.name} (already optimal)`);
        }
      } catch (err) {
        console.error(`Error optimizing ${entry.name}:`, err.message);
      }
    }
  }
}

console.log('Optimizing PNG assets in public directory...');
await optimizeDirectory(path.resolve('public'));
console.log('Done optimizing images.');

