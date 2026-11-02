/**
 * media_paths.cjs - collect all /media/... paths from projects.ts and brandLogos.ts
 * and verify they exist in public/
 */
const fs = require('fs');
const path = require('path');

const SITE_ROOT = 'C:/Alex stuff/AI vault/portfolio/web/site';
const PROJECTS_TS = path.join(SITE_ROOT, 'src/data/projects.ts');
const BRAND_LOGOS_TS = path.join(SITE_ROOT, 'src/components/brandLogos.ts');
const PUBLIC_ROOT = path.join(SITE_ROOT, 'public');

function extractMediaPaths(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /\/media\/[^'"\s\)]+/g;
  const matches = content.match(regex) || [];
  return [...new Set(matches)]; // deduplicate
}

function checkExists(mediaPath) {
  // Convert /media/... to public/media/...
  const publicPath = path.join(PUBLIC_ROOT, mediaPath.replace(/^\/media\//, 'media/'));
  return fs.existsSync(publicPath);
}

console.log('=== Media Path Verification ===\n');

const projectsPaths = extractMediaPaths(PROJECTS_TS);
const brandLogosPaths = extractMediaPaths(BRAND_LOGOS_TS);
const allPaths = [...new Set([...projectsPaths, ...brandLogosPaths])];

console.log(`Found ${allPaths.length} unique media paths:\n`);

let missing = 0;
for (const p of allPaths) {
  const exists = checkExists(p);
  const status = exists ? 'OK' : 'MISSING';
  if (!exists) missing++;
  console.log(`  ${status}  ${p}`);
}

console.log(`\nMISSING ${missing}`);
if (missing > 0) {
  process.exit(1);
}