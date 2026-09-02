const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const workerSrc = path.join(rootDir, '.open-next', 'worker.js');
const workerAssetsDest = path.join(rootDir, '.open-next', 'assets', '_worker.js');
const workerNextDest = path.join(rootDir, '.next', '_worker.js');
const cacheDir = path.join(rootDir, '.next', 'cache');

// Ensure worker is available in both .open-next/assets and .next
if (fs.existsSync(workerSrc)) {
  const assetsDir = path.join(rootDir, '.open-next', 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.copyFileSync(workerSrc, workerAssetsDest);
    console.log('✓ Copied worker to .open-next/assets/_worker.js');
  }
  const nextDir = path.join(rootDir, '.next');
  if (fs.existsSync(nextDir)) {
    fs.copyFileSync(workerSrc, workerNextDest);
    console.log('✓ Copied worker to .next/_worker.js');
  }
}

// Clean compiler cache
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✓ Cleaned .next/cache to satisfy Cloudflare Pages 25MB limit');
}
