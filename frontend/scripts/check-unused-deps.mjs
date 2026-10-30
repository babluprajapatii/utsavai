import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys(pkg.dependencies || {});

function getAllSrcFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllSrcFiles(full));
    } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const srcFiles = getAllSrcFiles('src');
const fileContents = srcFiles.map(f => ({ path: f, content: fs.readFileSync(f, 'utf8') }));

console.log(`Checking ${deps.length} dependencies across ${srcFiles.length} source files...\n`);

const unused = [];
const used = [];

for (const dep of deps) {
  let isUsed = false;
  for (const file of fileContents) {
    if (file.content.includes(dep)) {
      isUsed = true;
      break;
    }
  }
  if (!isUsed) {
    unused.push(dep);
  } else {
    used.push(dep);
  }
}

console.log('--- POTENTIALLY UNUSED IN SRC ---');
for (const u of unused) {
  console.log(`- ${u}`);
}

console.log(`\nUsed count: ${used.length}, Unused count: ${unused.length}`);

console.log('\nChecking whole frontend folder (excluding node_modules, .next, lockfiles, package.json)...');
function getAllFrontendFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFrontendFiles(full));
    } else if (entry.isFile() && !entry.name.endsWith('.lock') && !entry.name.endsWith('package.json') && !entry.name.endsWith('package-lock.json')) {
      files.push(full);
    }
  }
  return files;
}

const allFrontendFiles = getAllFrontendFiles('.');
const allContents = allFrontendFiles.map(f => ({ path: f, content: fs.readFileSync(f, 'utf8') }));

console.log(`\n--- COMPLETELY UNUSED IN FRONTEND REPO ---`);
for (const u of unused) {
  let found = 0;
  for (const file of allContents) {
    if (file.content.includes(u)) {
      found++;
    }
  }
  if (found === 0) {
    console.log(`- ${u} (0 references anywhere)`);
  } else {
    console.log(`- ${u} (referenced in ${found} non-src files)`);
  }
}

