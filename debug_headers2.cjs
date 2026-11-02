const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Intercept requests
  page.on('request', req => {
    if (req.url().includes('aura-loop-poster') || req.url().includes('nova-loop-poster') || req.url().includes('pulse-loop-poster')) {
      console.log(`Request: ${req.url()}`);
      console.log(`  Method: ${req.method()}`);
      console.log(`  Headers: ${JSON.stringify(req.headers(), (key, value) => typeof value === 'string' ? value : 'binary')}`);
    }
  });
  
  page.on('response', resp => {
    if (resp.url().includes('aura-loop-poster') || resp.url().includes('nova-loop-poster') || resp.url().includes('pulse-loop-poster')) {
      console.log(`Response: ${resp.url()}`);
      console.log(`  Status: ${resp.status()}`);
      console.log(`  Headers: ${JSON.stringify(resp.headers(), (key, value) => typeof value === 'string' ? value : 'binary')}`);
    }
  });
  
  await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  await browser.close();
})().catch(e => console.error(e));
