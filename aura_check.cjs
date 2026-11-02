// aura_check.cjs — verify AURA page hero and process
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto(base + '/work/aura', { waitUntil: 'load' });
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

  // Check hero video
  const heroInfo = await page.evaluate(() => {
    const video = document.querySelector('.cs-hero__video');
    if (!video) return { found: false };
    return {
      found: true,
      src: video.src,
      poster: video.poster,
      videoWidth: video.videoWidth,
      muted: video.muted,
      controls: video.controls,
      playsInline: video.playsInline
    };
  });
  console.log('Hero video:', heroInfo);

  // Check process stills
  const processInfo = await page.evaluate(() => {
    const stills = document.querySelectorAll('.cs-process__still');
    return Array.from(stills).map((img, i) => ({
      index: i,
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      className: img.className
    }));
  });
  console.log('\nProcess stills:');
  processInfo.forEach(s => console.log(`  [${s.index}] ${s.src} - ${s.naturalWidth}x${s.naturalHeight}, complete: ${s.complete}, class: ${s.className}`));

  // Check process stage dimensions
  const stageInfo = await page.evaluate(() => {
    const stage = document.querySelector('.cs-process__stage');
    if (!stage) return { found: false };
    const rect = stage.getBoundingClientRect();
    const style = getComputedStyle(stage);
    return {
      found: true,
      width: rect.width,
      height: rect.height,
      aspectRatio: (rect.width / rect.height).toFixed(2)
    };
  });
  console.log('\nProcess stage:', stageInfo);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });