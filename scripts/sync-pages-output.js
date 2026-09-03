const fs = require('fs');
const path = require('path');

const rootDir = fs.existsSync(path.join(__dirname, 'frontend'))
  ? __dirname
  : path.resolve(__dirname, '..');

const frontendOut = path.join(rootDir, 'frontend', 'out');
const rootOut = path.join(rootDir, 'out');
const openNextAssets = path.join(rootDir, 'frontend', '.open-next', 'assets');
const rootOpenNextAssets = path.join(rootDir, '.open-next', 'assets');

const source = fs.existsSync(frontendOut)
  ? frontendOut
  : fs.existsSync(rootOut)
  ? rootOut
  : null;

if (source) {
  const targets = [rootOut, frontendOut, openNextAssets, rootOpenNextAssets];
  for (const target of targets) {
    if (target !== source) {
      fs.mkdirSync(target, { recursive: true });
      fs.cpSync(source, target, { recursive: true });
    }
  }
  console.log('✓ Successfully synchronized build output to all Pages output targets');
}
