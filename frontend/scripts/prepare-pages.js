const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const workerSrc = path.join(rootDir, '.open-next', 'worker.js');
const workerDest = path.join(rootDir, '.open-next', 'assets', '_worker.js');
const cacheDir = path.join(rootDir, '.next', 'cache');

if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest);
  console.log('✓ Successfully created .open-next/assets/_worker.js for Cloudflare Pages');
}

if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✓ Removed .next/cache to satisfy Cloudflare Pages 25MB file limit');
}
