const { chromium } = require('playwright');
const path = require('path');

const base = 'http://localhost:5199';
const routes = [
  ['aura', '/work/aura'],
  ['nova', '/work/nova'],
  ['flesh', '/work/flesh-and-blood']
];
const viewports = [[1440, 900], [390, 844]];

async function checkRoute(page, name, route) {
  await page.goto(base + route, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const cs = getComputedStyle;
    const h1 = document.querySelector('h1');
    const sections = document.querySelectorAll('main section');
    
    let sectionPadding = null;
    sections.forEach(s => {
      const pt = parseFloat(cs(s).paddingTop);
      if (pt > 0 && (sectionPadding === null || pt > sectionPadding)) {
        sectionPadding = pt;
      }
    });
    
    return {
      h1FontSize: h1 ? parseFloat(cs(h1).fontSize) : null,
      sectionPaddingTop: sectionPadding,
      h1Text: h1 ? h1.innerText.trim() : null
    };
  });
  
  return result;
}

(async () => {
  const browser = await chromium.launch();
  const results = {};
  
  for (const [w, h] of viewports) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    
    for (const [name, route] of routes) {
      try {
        const r = await checkRoute(page, name, route);
        const key = `${name}_${w}`;
        results[key] = r;
        console.log(`${key}: h1=${r.h1FontSize}px, section-padding-top=${r.sectionPaddingTop}px, h1="${r.h1Text}"`);
      } catch (e) {
        console.log(`${name}_${w}: ERROR - ${e.message}`);
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  
  console.log('\n--- SUMMARY ---');
  for (const [name, route] of routes) {
    const r1440 = results[`${name}_1440`];
    const r390 = results[`${name}_390`];
    if (r1440 && r390) {
      console.log(`${name}: 1440 -> h1:${r1440.h1FontSize} section:${r1440.sectionPaddingTop} | 390 -> h1:${r390.h1FontSize} section:${r390.sectionPaddingTop}`);
    }
  }
})().catch(console.error);