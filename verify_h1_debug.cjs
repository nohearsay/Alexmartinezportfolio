const { chromium } = require('playwright');

const base = 'http://localhost:5199';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  await page.goto(base + '/work/aura', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const cs = getComputedStyle(h1);
    return {
      fontSize: cs.fontSize,
      fontFamily: cs.fontFamily,
      className: h1.className,
      id: h1.id,
      // Check all matched rules
      matchedRules: Array.from(document.styleSheets).flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules || []).filter(rule => {
            if (rule.selectorText && h1.matches(rule.selectorText)) {
              return true;
            }
            return false;
          }).map(r => ({ selector: r.selectorText, cssText: r.cssText }));
        } catch (e) {
          return [];
        }
      })
    };
  });
  
  console.log('h1 computed fontSize:', result.fontSize);
  console.log('h1 class:', result.className);
  console.log('Matched rules for h1:');
  result.matchedRules.forEach(r => console.log('  ', r.selector, '->', r.cssText));
  
  await browser.close();
})().catch(console.error);