const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://127.0.0.1:4188/work', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check all responses
  const responses = await page.waitForResponse(() => true);
  
  // Find responses for the loop poster images
  for (const resp of page.request() ? [page.request()] : []) {
    // Just print all request/response info
  }
  
  // Let's evaluate the request patterns
  const requests = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      requestId: img._requestId || 'unknown'
    }))
  );
  
  console.log('Requests done');
  
  await browser.close();
})().catch(e => console.error(e));
