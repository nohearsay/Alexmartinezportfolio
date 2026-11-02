const { chromium } = require('playwright');

const base = 'http://localhost:5199';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  await page.goto(base + '/work/aura', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      sectionY: cs.getPropertyValue('--section-y').trim(),
      gutter: cs.getPropertyValue('--gutter').trim(),
    };
  });
  
  console.log('CSS Variables:', result);
  
  // Also check the .section computed style
  const sectionStyle = await page.evaluate(() => {
    const s = document.querySelector('main section.section');
    const cs = getComputedStyle(s);
    return {
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      paddingBlock: cs.paddingBlock,
    };
  });
  
  console.log('Section style:', sectionStyle);
  
  await browser.close();
})().catch(console.error);