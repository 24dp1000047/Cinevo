const fs = require('fs');
const path = require('path');

const cacheDir = path.resolve(__dirname, '..', '.next', 'cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✓ Cleaned .next/cache to satisfy Cloudflare Pages 25MB limit');
}
