// fab_check.cjs — verify Flesh and Blood page details
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';
const OUT_DIR = 'C:/Alex stuff/AI vault/portfolio/scratchpad/hermes-reports/portfolio-verify/Q/p8';

async function main() {
  const browser = await chromium.launch();
  let allPass = true;

  // Desktop check
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/work/flesh-and-blood', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // Check all media loads
  const mediaResults = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const videos = Array.from(document.querySelectorAll('video'));
    const results = { images: [], videos: [] };
    
    imgs.forEach(img => {
      results.images.push({
        src: img.src,
        naturalWidth: img.naturalWidth,
        complete: img.complete
      });
    });
    
    videos.forEach(video => {
      results.videos.push({
        src: video.src,
        poster: video.poster,
        videoWidth: video.videoWidth,
        paused: video.paused,
        muted: video.muted,
        controls: video.controls
      });
    });
    
    return results;
  });

  console.log('=== DESKTOP (1440) ===');
  console.log('Images:', mediaResults.images.length);
  mediaResults.images.forEach((img, i) => {
    const status = img.naturalWidth > 0 && img.complete ? 'OK' : 'FAIL';
    if (status === 'FAIL') allPass = false;
    console.log(`  [${i}] ${img.src} - naturalWidth: ${img.naturalWidth}, complete: ${img.complete} - ${status}`);
  });
  
  console.log('Videos:', mediaResults.videos.length);
  mediaResults.videos.forEach((vid, i) => {
    const status = (vid.videoWidth > 0 || (vid.poster && vid.poster !== window.location.href)) && vid.muted && vid.controls ? 'OK' : 'FAIL';
    if (status === 'FAIL') allPass = false;
    console.log(`  [${i}] src: ${vid.src}, poster: ${vid.poster}, videoWidth: ${vid.videoWidth}, muted: ${vid.muted}, controls: ${vid.controls} - ${status}`);
  });

  // Check carousel order (How to Play Sealed 1-7, Meet the Heroes 1-4)
  const carouselCaptions = await page.evaluate(() => {
    const figures = document.querySelectorAll('.cs-gallery figure, .cs-features figure');
    return Array.from(figures).map(f => {
      const cap = f.querySelector('figcaption');
      return cap ? cap.textContent.trim() : '';
    });
  });
  
  console.log('\nCarousel captions:');
  carouselCaptions.forEach((c, i) => console.log(`  [${i}] ${c}`));

  // Mobile check
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(base + '/work/flesh-and-blood', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(2000);

  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`\n=== MOBILE (390) ===`);
  console.log(`Horizontal overflow: ${overflow ? 'FAIL' : 'PASS'}`);
  if (overflow) allPass = false;

  // Check intro video click-to-play with sound
  const introCheck = await mobilePage.evaluate(() => {
    const video = document.querySelector('video');
    if (!video) return { found: false };
    return {
      found: true,
      muted: video.muted,
      controls: video.controls,
      playsInline: video.playsInline
    };
  });
  console.log('\nIntro video:', introCheck);

  await browser.close();
  
  console.log(`\nOverall: ${allPass ? 'PASS' : 'FAIL'}`);
  process.exit(allPass ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });