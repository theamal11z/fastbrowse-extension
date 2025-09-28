#!/usr/bin/env node
/* Build Firefox distribution by copying repo (excluding dev artifacts) and swapping manifest */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = root;
const distDir = path.join(root, 'dist-firefox');

const IGNORE = new Set(['node_modules', '.git', 'dist-firefox', '.DS_Store']);

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.promises.copyFile(src, dest);
}

async function copyDir(src, dest) {
  await ensureDir(dest);
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else {
      await copyFile(from, to);
    }
  }
}

(async () => {
  try {
    // Clean dist
    await fs.promises.rm(distDir, { recursive: true, force: true });
    await ensureDir(distDir);

    // Copy everything except ignored
    await copyDir(srcDir, distDir);

    // Replace manifest.json with Firefox MV2 variant when available (preferred for stable Firefox)
    const ffV2Path = path.join(srcDir, 'manifest.firefox.v2.json');
    const ffV3Path = path.join(srcDir, 'manifest.firefox.json');
    const outManifestPath = path.join(distDir, 'manifest.json');

    let chosenPath = null;
    if (fs.existsSync(ffV2Path)) chosenPath = ffV2Path;
    else if (fs.existsSync(ffV3Path)) chosenPath = ffV3Path;
    if (!chosenPath) throw new Error('No Firefox manifest found');

    const ffManifest = await fs.promises.readFile(chosenPath, 'utf8');
    await fs.promises.writeFile(outManifestPath, ffManifest, 'utf8');

    // Remove variant files from dist root if they were copied
    try { await fs.promises.rm(path.join(distDir, 'manifest.firefox.v2.json')); } catch (_) {}
    try { await fs.promises.rm(path.join(distDir, 'manifest.firefox.json')); } catch (_) {}

    console.log('dist-firefox ready. Load dist-firefox as a temporary add-on in Firefox or run:');
    console.log('  npx web-ext run --source-dir dist-firefox');
  } catch (e) {
    console.error('build-firefox failed:', e.message);
    process.exit(1);
  }
})();
