// fab_check2.cjs — verify Flesh and Blood page details with proper waiting
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
  await page.waitForTimeout(3000);

  // Scroll to trigger lazy loads
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
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
        muted: video.muted,
        controls: video.controls,
        playsInline: video.playsInline
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
    const hasPoster = vid.poster && vid.poster !== window.location.href;
    const status = (vid.videoWidth > 0 || hasPoster) && vid.muted && vid.controls ? 'OK' : 'FAIL';
    if (status === 'FAIL') allPass = false;
    console.log(`  [${i}] src: ${vid.src}, poster: ${vid.poster}, videoWidth: ${vid.videoWidth}, muted: ${vid.muted}, controls: ${vid.controls}, playsInline: ${vid.playsInline} - ${status}`);
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
  await mobilePage.waitForTimeout(3000);

  // Scroll on mobile too
  await mobilePage.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
  await mobilePage.waitForTimeout(2000);

  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`\n=== MOBILE (390) ===`);
  console.log(`Horizontal overflow: ${overflow ? 'FAIL' : 'PASS'}`);
  if (overflow) allPass = false;

  // Check intro video (should be click-to-play with sound)
  const introCheck = await mobilePage.evaluate(() => {
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return { found: false };
    const video = videos[0]; // first video should be intro
    return {
      found: true,
      muted: video.muted,
      controls: video.controls,
      playsInline: video.playsInline
    };
  });
  console.log('\nIntro video:', introCheck);
  if (introCheck.found && (introCheck.muted || !introCheck.controls)) {
    console.log('  FAIL: Intro video should be click-to-play with sound (not muted, has controls)');
    allPass = false;
  }

  await browser.close();
  
  console.log(`\nOverall: ${allPass ? 'PASS' : 'FAIL'}`);
  process.exit(allPass ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });