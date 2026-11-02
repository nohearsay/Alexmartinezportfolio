const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check the loop poster styles
  const styles = await page.evaluate(() => {
    const results = [];
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img, i) => {
      if (img.src && img.src.includes('loop-poster')) {
        const style = window.getComputedStyle(img);
        results.push({
          src: img.src,
          naturalWidth: img.naturalWidth,
          complete: img.complete,
          width: img.width,
          height: img.height,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          position: style.position,
          width: style.width,
          height: style.height,
          maxWidth: style.maxWidth,
          maxHeight: style.maxHeight,
          objectFit: style.objectFit,
          objectPosition: style.objectPosition
        });
      }
    });
    return results;
  });
  
  console.log('Loop poster styles:', JSON.stringify(styles, null, 2));
  
  await browser.close();
})().catch(e => console.error(e));
