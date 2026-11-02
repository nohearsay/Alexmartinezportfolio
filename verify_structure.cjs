const { chromium } = require('playwright');

const base = 'http://localhost:5199';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  await page.goto(base + '/work/aura', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? main.innerHTML.substring(0, 5000) : 'no main';
  });
  
  console.log(result);
  
  await browser.close();
})().catch(console.error);