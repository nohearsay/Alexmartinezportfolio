const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const imgs = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      complete: img.complete,
      width: img.width,
      height: img.height,
      alt: img.alt,
      srcset: img.srcset,
      currentSrc: img.currentSrc
    }))
  );
  
  console.log(`Total imgs: ${imgs.length}`);
  imgs.forEach((img, i) => {
    console.log(`img[${i}]:`);
    console.log(`  src: ${img.src?.substring(0, 100)}`);
    console.log(`  naturalWidth: ${img.naturalWidth}`);
    console.log(`  complete: ${img.complete}`);
    console.log(`  width: ${img.width}`);
    console.log(`  height: ${img.height}`);
    console.log(`  alt: ${img.alt}`);
    console.log(`  srcset: ${img.srcset?.substring(0, 100)}`);
    console.log(`  currentSrc: ${img.currentSrc?.substring(0, 100)}`);
    console.log('');
  });
  
  await browser.close();
})().catch(e => console.error(e));
