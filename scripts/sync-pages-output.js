const fs = require('fs');
const path = require('path');

// Dynamically locate the repository root containing root package.json
let rootDir = __dirname;
while (rootDir !== path.dirname(rootDir)) {
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name === 'cinevo') break;
    } catch (_) {}
  }
  rootDir = path.dirname(rootDir);
}

const frontendOut = path.join(rootDir, 'frontend', 'out');
const rootOut = path.join(rootDir, 'out');

const source = fs.existsSync(frontendOut)
  ? frontendOut
  : fs.existsSync(rootOut)
  ? rootOut
  : null;

if (source) {
  const targets = [rootOut, frontendOut];
  for (const target of targets) {
    if (target !== source) {
      fs.mkdirSync(target, { recursive: true });
      fs.cpSync(source, target, { recursive: true });
    }

    // Always ensure _redirects matches the latest source
    const redirectsSrc = path.join(rootDir, 'frontend', 'public', '_redirects');
    if (fs.existsSync(redirectsSrc)) {
      fs.copyFileSync(redirectsSrc, path.join(target, '_redirects'));
    }

    // Eradicate any rogue worker files or route interceptors
    const rogueFiles = [
      path.join(target, '_worker.js'),
      path.join(target, '_routes.json'),
    ];
    for (const file of rogueFiles) {
      if (fs.existsSync(file)) {
        fs.rmSync(file, { force: true });
      }
    }
  }

  // Clean up any remaining .open-next folders
  const openNextDirs = [
    path.join(rootDir, '.open-next'),
    path.join(rootDir, 'frontend', '.open-next'),
  ];
  for (const d of openNextDirs) {
    if (fs.existsSync(d)) {
      fs.rmSync(d, { recursive: true, force: true });
    }
  }

  console.log('✓ Successfully synchronized pure static build output to both frontend/out and out');
}
