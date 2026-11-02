// screenshot_routes.cjs — full page screenshots for aura, nova, flesh
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';
const ROUTES = [
  ['aura', '/work/aura'],
  ['nova', '/work/nova'],
  ['flesh', '/work/flesh-and-blood'],
];
const VIEWS = [[1440, 900], [390, 844]];
const OUT_DIR = 'C:/Alex stuff/AI vault/portfolio/scratchpad/hermes-reports/portfolio-webdev/S8c_shots';

async function main() {
  const browser = await chromium.launch();
  
  for (const [w, h] of VIEWS) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    
    for (const [name, route] of ROUTES) {
      if (w === 390 && name !== 'aura') continue; // only aura at 390
      await page.goto(base + route, { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      const safeRoute = name + '_' + w;
      const screenshotPath = path.join(OUT_DIR, `${safeRoute}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    }
    await context.close();
  }
  
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });