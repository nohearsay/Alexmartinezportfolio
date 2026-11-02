/**
 * yavg_check.cjs - check YAVG (average luminance) of referenced images using sharp
 * YAVG should be > 10 and < 245 (not flat black or flat white)
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SITE_ROOT = 'C:/Alex stuff/AI vault/portfolio/web/site';
const PROJECTS_TS = path.join(SITE_ROOT, 'src/data/projects.ts');
const PUBLIC_ROOT = path.join(SITE_ROOT, 'public');

function extractMediaPaths(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /\/media\/[^'"\s\)]+/g;
  const matches = content.match(regex) || [];
  return [...new Set(matches)];
}

function getPublicPath(mediaPath) {
  return path.join(PUBLIC_ROOT, mediaPath.replace(/^\/media\//, 'media/'));
}

async function getYAVG(filePath) {
  try {
    const image = sharp(filePath);
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // data is Uint8Array in RGB order (or RGBA)
    // Calculate luminance: Y = 0.299*R + 0.587*G + 0.114*B
    let sumY = 0;
    const channels = info.channels;
    const pixelCount = info.width * info.height;
    
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      sumY += y;
    }
    
    return sumY / pixelCount;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('=== YAVG Check (using sharp) ===\n');
  
  const content = fs.readFileSync(PROJECTS_TS, 'utf8');
  const allPaths = extractMediaPaths(PROJECTS_TS);
  
  // Filter for AURA frames, hero-posters, loop-posters
  const auraFrames = allPaths.filter(p => p.includes('/aura/frame-') && p.endsWith('.webp'));
  const heroPosters = allPaths.filter(p => p.includes('hero-poster') || p.includes('heroPoster'));
  const loopPosters = allPaths.filter(p => p.includes('loop-poster'));
  
  const checkPaths = [...new Set([...auraFrames, ...heroPosters, ...loopPosters])];
  
  console.log('Image                                    YAVG    Status');
  console.log('------------------------------------------------------------');
  
  let allPass = true;
  for (const p of checkPaths) {
    const fullPath = getPublicPath(p);
    const yavg = await getYAVG(fullPath);
    if (yavg === null) {
      console.log(`${p.padEnd(42)}  ERR    FAIL`);
      allPass = false;
    } else {
      const status = (yavg > 10 && yavg < 245) ? 'PASS' : 'FAIL';
      if (status === 'FAIL') allPass = false;
      console.log(`${p.padEnd(42)}  ${yavg.toFixed(1).padStart(6)}  ${status}`);
    }
  }
  
  console.log(`\nOverall: ${allPass ? 'ALL PASS' : 'SOME FAIL'}`);
  if (!allPass) process.exit(1);
}

main().catch(console.error);