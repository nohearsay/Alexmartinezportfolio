// fab_check3.cjs — verify Flesh and Blood with full hydration wait
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  
  await page.goto(base + '/work/flesh-and-blood', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Get page content after hydration
  const content = await page.content();
  console.log('Page contains "How to Play Sealed":', content.includes('How to Play Sealed'));
  console.log('Page contains "Meet the Heroes":', content.includes('Meet the Heroes'));
  console.log('Page contains "fab-intro":', content.includes('fab-intro'));

  // Check for media elements
  const mediaInfo = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const videos = Array.from(document.querySelectorAll('video'));
    const figures = document.querySelectorAll('figure');
    return {
      images: imgs.map(img => ({ src: img.src, naturalWidth: img.naturalWidth, complete: img.complete })),
      videos: videos.map(v => ({ src: v.src, poster: v.poster, videoWidth: v.videoWidth, muted: v.muted, controls: v.controls, playsInline: v.playsInline })),
      figureCount: figures.length
    };
  });
  
  console.log('\n=== Media ===');
  console.log('Figure count:', mediaInfo.figureCount);
  console.log('Images:', mediaInfo.images.length);
  mediaInfo.images.forEach((img, i) => console.log(`  [${i}] ${img.src} - w: ${img.naturalWidth}, complete: ${img.complete}`));
  console.log('Videos:', mediaInfo.videos.length);
  mediaInfo.videos.forEach((v, i) => console.log(`  [${i}] src: ${v.src}, poster: ${v.poster}, vw: ${v.videoWidth}, muted: ${v.muted}, controls: ${v.controls}, playsInline: ${v.playsInline}`));

  // Check carousel captions
  const captions = await page.evaluate(() => {
    const figcaps = document.querySelectorAll('figcaption');
    return Array.from(figcaps).map(fc => fc.textContent.trim());
  });
  console.log('\nFigcaptions:', captions);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });