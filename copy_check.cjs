// copy_check.cjs — rendered text check for forbidden terms
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';
const ROUTES = ['/', '/work', '/work/aura', '/work/nova', '/work/flesh-and-blood', '/film', '/narrative', '/about', '/cv', '/contact'];
const FORBIDDEN = ['fictional', 'fictitious', 'mockup', 'mock-up', 'no real products'];

async function main() {
  const browser = await chromium.launch();
  let allHits = [];

  // Test at desktop viewport
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const route of ROUTES) {
    await page.goto(base + route, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const text = await page.evaluate(() => document.body.innerText);
    const hits = FORBIDDEN.filter(term => text.toLowerCase().includes(term.toLowerCase()));
    if (hits.length > 0) {
      allHits.push({ route, hits });
      console.log(`FAIL ${route}: ${hits.join(', ')}`);
    } else {
      console.log(`PASS ${route} (desktop)`);
    }
  }

  // Test at mobile viewport (390px) with menu open
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const route of ROUTES) {
    await mobilePage.goto(base + route, { waitUntil: 'load' });
    await mobilePage.waitForTimeout(1000);

    // Try to open menu at mobile
    const menuBtn = await mobilePage.$('.menu-btn, button[aria-label*="menu" i], button:has(svg)');
    if (menuBtn && await menuBtn.isVisible()) {
      await menuBtn.click();
      await mobilePage.waitForTimeout(500);
    }

    const text = await mobilePage.evaluate(() => document.body.innerText);
    const hits = FORBIDDEN.filter(term => text.toLowerCase().includes(term.toLowerCase()));
    if (hits.length > 0) {
      allHits.push({ route: route + '_mobile', hits });
      console.log(`FAIL ${route} (mobile): ${hits.join(', ')}`);
    } else {
      console.log(`PASS ${route} (mobile)`);
    }
  }

  await browser.close();

  if (allHits.length === 0) {
    console.log('\nRENDERED TEXT CHECK: PASS (0 hits on all routes)');
  } else {
    console.log('\nRENDERED TEXT CHECK: FAIL');
    allHits.forEach(h => console.log(`  ${h.route}: ${h.hits.join(', ')}`));
  }

  // Write output
  const fs = require('fs');
  const outDir = 'C:/Alex stuff/AI vault/portfolio/scratchpad/hermes-reports/portfolio-webdev/S8d_shots';
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'copy_check.txt'), 
    allHits.length === 0 ? 'PASS: 0 hits on all routes' : 'FAIL: ' + JSON.stringify(allHits, null, 2)
  );
}

main().catch(e => { console.error(e); process.exit(1); });