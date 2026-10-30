import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function getDirStats(dirPath, excludeRegex = null) {
  let totalBytes = 0;
  let fileCount = 0;
  const files = [];

  function walk(current) {
    if (!fs.existsSync(current)) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (excludeRegex && excludeRegex.test(fullPath)) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const stat = fs.statSync(fullPath);
        totalBytes += stat.size;
        fileCount++;
        files.push({ path: fullPath, size: stat.size });
      }
    }
  }

  walk(dirPath);
  return { totalBytes, fileCount, files };
}

function getCompressedStats(fileList) {
  let uncompressed = 0;
  let gzipped = 0;
  let brotli = 0;

  for (const f of fileList) {
    try {
      const content = fs.readFileSync(f.path);
      uncompressed += content.length;
      gzipped += zlib.gzipSync(content).length;
      brotli += zlib.brotliCompressSync(content).length;
    } catch (e) {
      // ignore
    }
  }

  return { uncompressed, gzipped, brotli };
}

const rootDir = path.resolve('..');
const frontendDir = path.resolve('.');

console.log('===========================================================');
console.log('UTSAVAI PRODUCTION FRONTEND QUALITY & PERFORMANCE SIZE AUDIT');
console.log('===========================================================');

console.log('\n--- 1. PROJECT SOURCE SIZE (excluding node_modules, .git, .next) ---');
const projectSource = getDirStats(rootDir, /[\\/](\.git|node_modules|\.next)[\\/]/);
console.log(`Source files: ${projectSource.fileCount}`);
console.log(`Uncompressed: ${(projectSource.totalBytes / 1024 / 1024).toFixed(3)} MB (${projectSource.totalBytes} bytes)`);

console.log('\n--- 2. NODE_MODULES SIZE ---');
const nodeModules = getDirStats(path.join(frontendDir, 'node_modules'));
console.log(`Files: ${nodeModules.fileCount}`);
console.log(`Size: ${(nodeModules.totalBytes / 1024 / 1024).toFixed(2)} MB (${nodeModules.totalBytes} bytes)`);

console.log('\n--- 3. PRODUCTION BUILD SIZE (.next) ---');
const dotNext = getDirStats(path.join(frontendDir, '.next'));
console.log(`Files: ${dotNext.fileCount}`);
console.log(`Size: ${(dotNext.totalBytes / 1024 / 1024).toFixed(2)} MB (${dotNext.totalBytes} bytes)`);

console.log('\n--- 4. CLIENT-SIDE JS CHUNKS (.next/static/chunks) ---');
const chunks = getDirStats(path.join(frontendDir, '.next', 'static', 'chunks'));
const chunksComp = getCompressedStats(chunks.files.filter(f => f.path.endsWith('.js')));
console.log(`JS Files count: ${chunks.files.filter(f => f.path.endsWith('.js')).length}`);
console.log(`Raw uncompressed: ${(chunksComp.uncompressed / 1024 / 1024).toFixed(3)} MB (${chunksComp.uncompressed} bytes)`);
console.log(`Gzipped: ${(chunksComp.gzipped / 1024 / 1024).toFixed(3)} MB (${chunksComp.gzipped} bytes)`);
console.log(`Brotli: ${(chunksComp.brotli / 1024 / 1024).toFixed(3)} MB (${chunksComp.brotli} bytes)`);

console.log('\n--- 5. CSS SIZE (.next/static/css) ---');
const css = getDirStats(path.join(frontendDir, '.next', 'static', 'css'));
const cssComp = getCompressedStats(css.files.filter(f => f.path.endsWith('.css')));
console.log(`CSS Files count: ${css.files.filter(f => f.path.endsWith('.css')).length}`);
console.log(`Raw uncompressed: ${(cssComp.uncompressed / 1024).toFixed(2)} KB (${cssComp.uncompressed} bytes)`);
console.log(`Gzipped: ${(cssComp.gzipped / 1024).toFixed(2)} KB (${cssComp.gzipped} bytes)`);
console.log(`Brotli: ${(cssComp.brotli / 1024).toFixed(2)} KB (${cssComp.brotli} bytes)`);

console.log('\n--- 6. PUBLIC ASSETS & IMAGES (frontend/public) ---');
const publicDir = getDirStats(path.join(frontendDir, 'public'));
console.log(`Public files: ${publicDir.fileCount}`);
console.log(`Size: ${(publicDir.totalBytes / 1024 / 1024).toFixed(3)} MB (${publicDir.totalBytes} bytes)`);

console.log('\n--- 7. TOTAL CLIENT-FACING / DEPLOYABLE FRONTEND ASSETS ---');
const staticDir = getDirStats(path.join(frontendDir, '.next', 'static'));
const staticAndPublicBytes = staticDir.totalBytes + publicDir.totalBytes;
const allStaticFiles = [...staticDir.files, ...publicDir.files];
const allStaticComp = getCompressedStats(allStaticFiles);
console.log(`.next/static raw: ${(staticDir.totalBytes / 1024 / 1024).toFixed(3)} MB`);
console.log(`public raw: ${(publicDir.totalBytes / 1024 / 1024).toFixed(3)} MB`);
console.log(`Total static + public raw uncompressed: ${(staticAndPublicBytes / 1024 / 1024).toFixed(3)} MB (${staticAndPublicBytes} bytes)`);
console.log(`Total static + public Gzipped: ${(allStaticComp.gzipped / 1024 / 1024).toFixed(3)} MB (${allStaticComp.gzipped} bytes)`);
console.log(`Total static + public Brotli: ${(allStaticComp.brotli / 1024 / 1024).toFixed(3)} MB (${allStaticComp.brotli} bytes)`);

// Standalone deployment bundle
const standaloneDir = getDirStats(path.join(frontendDir, '.next', 'standalone'));
console.log(`\nStandalone server bundle (.next/standalone): ${(standaloneDir.totalBytes / 1024 / 1024).toFixed(2)} MB (${standaloneDir.fileCount} files)`);

console.log('\n--- 8. INITIAL PAGE-LOAD (/) TRANSFERRED RESOURCES ---');
const buildManifest = JSON.parse(fs.readFileSync('.next/build-manifest.json', 'utf8'));
const manifestJs = fs.readFileSync('.next/server/app/page_client-reference-manifest.js', 'utf8');

const initialChunkSet = new Set();
for (const f of buildManifest.rootMainFiles || []) {
  initialChunkSet.add('.next/' + f.replace(/^[\\/]/, ''));
}

const chunkMatch = manifestJs.match(/"static\/chunks\/[^"]+"/g) || [];
for (const m of chunkMatch) {
  const p = m.replace(/"/g, '');
  initialChunkSet.add('.next/' + p);
}

const cssMatch = manifestJs.match(/"path":"static\/css\/[^"]+"/g) || [];
for (const m of cssMatch) {
  const p = m.replace(/"path":"/, '').replace(/"/, '');
  initialChunkSet.add('.next/' + p);
}

const initialFiles = Array.from(initialChunkSet);
let initUncomp = 0;
let initGzip = 0;
let initBrotli = 0;

for (const rel of initialFiles) {
  const full = path.join(frontendDir, rel);
  if (fs.existsSync(full)) {
    const buf = fs.readFileSync(full);
    const gz = zlib.gzipSync(buf).length;
    const br = zlib.brotliCompressSync(buf).length;
    initUncomp += buf.length;
    initGzip += gz;
    initBrotli += br;
    console.log(`  - ${path.basename(rel)}: ${(buf.length / 1024).toFixed(1)} KB (gzip: ${(gz / 1024).toFixed(1)} KB, br: ${(br / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`  - ${rel}: NOT FOUND`);
  }
}
console.log(`\nInitial page load Total Uncompressed: ${(initUncomp / 1024).toFixed(1)} KB (${(initUncomp / 1024 / 1024).toFixed(3)} MB)`);
console.log(`Initial page load HTTP Transferred (Gzip): ${(initGzip / 1024).toFixed(1)} KB (${(initGzip / 1024 / 1024).toFixed(3)} MB)`);
console.log(`Initial page load HTTP Transferred (Brotli): ${(initBrotli / 1024).toFixed(1)} KB (${(initBrotli / 1024 / 1024).toFixed(3)} MB)`);

console.log('\n--- TOP 10 LARGEST ASSETS IN PUBLIC & STATIC ---');
allStaticFiles.sort((a, b) => b.size - a.size);
for (const item of allStaticFiles.slice(0, 10)) {
  const rel = path.relative(frontendDir, item.path);
  console.log(`- ${rel}: ${(item.size / 1024).toFixed(1)} KB`);
}
console.log('===========================================================');
