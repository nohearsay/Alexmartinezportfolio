// screenshots_s8d.cjs — footer_1440.png and menu_390.png
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';
const OUT_DIR = 'C:/Alex stuff/AI vault/portfolio/scratchpad/hermes-reports/portfolio-webdev/S8d_shots';

async function main() {
  const browser = await chromium.launch();

  // Footer screenshot at 1440
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'footer_1440.png'), fullPage: true });
  console.log('footer_1440.png saved');

  // Menu screenshot at 390
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(base + '/', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(1000);
  const menuBtn = await mobilePage.$('.menu-btn, button[aria-label*="menu" i], button:has(svg)');
  if (menuBtn && await menuBtn.isVisible()) {
    await menuBtn.click();
    await mobilePage.waitForTimeout(500);
  }
  await mobilePage.screenshot({ path: path.join(OUT_DIR, 'menu_390.png'), fullPage: true });
  console.log('menu_390.png saved');

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });