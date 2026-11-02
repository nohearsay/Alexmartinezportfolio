const { chromium } = require('playwright');

const base = 'http://localhost:5199';

async function checkRoute(page, name, route) {
  await page.goto(base + route, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const cs = getComputedStyle;
    const sections = document.querySelectorAll('main section');
    const sectionData = [];
    sections.forEach((s, i) => {
      const pt = parseFloat(cs(s).paddingTop);
      const pb = parseFloat(cs(s).paddingBottom);
      sectionData.push({
        index: i,
        className: s.className,
        id: s.id,
        paddingTop: pt,
        paddingBottom: pb
      });
    });
    
    const h1 = document.querySelector('h1');
    return {
      h1FontSize: h1 ? parseFloat(cs(h1).fontSize) : null,
      h1Text: h1 ? h1.innerText.trim() : null,
      sections: sectionData
    };
  });
  
  return result;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  for (const [name, route] of [['aura', '/work/aura'], ['nova', '/work/nova']]) {
    const r = await checkRoute(page, name, route);
    console.log(`\n=== ${name.toUpperCase()} (1440) ===`);
    console.log(`h1: ${r.h1FontSize}px - "${r.h1Text}"`);
    r.sections.forEach(s => {
      if (s.paddingTop > 0 || s.paddingBottom > 0) {
        console.log(`  section[${s.index}]: class="${s.className}" id="${s.id}" pt=${s.paddingTop} pb=${s.paddingBottom}`);
      }
    });
  }
  
  await browser.close();
})().catch(console.error);