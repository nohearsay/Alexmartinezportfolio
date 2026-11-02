const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    // Try blocking cache
    httpCredentials: false,
  });
  const page = await context.newPage();
  
  // Add a listener for console errors
  page.on('console', msg => console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`));
  
  await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Check the loop posters
  const imgs = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      complete: img.complete,
    }))
  );
  
  console.log('Loop posters after load:');
  imgs.forEach((img, i) => {
    if (img.src && img.src.includes('loop-poster')) {
      console.log(`  img[${i}]: src=${img.src.substring(0, 50)} naturalWidth=${img.naturalWidth} complete=${img.complete}`);
    }
  });
  
  // Try setting crossorigin
  await page.evaluate(() => {
    document.querySelectorAll('img[src*="loop-poster"]').forEach(img => {
      img.crossOrigin = 'anonymous';
    });
  });
  
  await page.waitForTimeout(3000);
  
  const imgs2 = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      complete: img.complete,
    }))
  );
  
  console.log('Loop posters after crossorigin:');
  imgs2.forEach((img, i) => {
    if (img.src && img.src.includes('loop-poster')) {
      console.log(`  img[${i}]: src=${img.src.substring(0, 50)} naturalWidth=${img.naturalWidth} complete=${img.complete}`);
    }
  });
  
  await browser.close();
})().catch(e => console.error(e));
