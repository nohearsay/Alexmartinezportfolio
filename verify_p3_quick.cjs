const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch();
  const url = process.argv[2] || 'http://localhost:4182';
  const routes = ['/', '/work', '/work/aura', '/work/nova', '/work/film', '/film', '/about', '/cv', '/contact'];
  
  let allPassed = true;

  for (const route of routes) {
    const page = await browser.newPage();
    await page.goto(`${url}${route}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const loader = page.locator('.loader');
    const loaderVisible = await loader.isVisible();

    const h1 = page.locator('h1').first();
    const h1Visible = await h1.isVisible();

    const links = page.locator('.site-nav a');
    const count = await links.count();
    let rows = 1;
    for (let i = 1; i < count; i++) {
      const prevBox = await page.locator('.site-nav a').nth(i - 1).boundingBox();
      const currBox = await links.nth(i).boundingBox();
      if (currBox && prevBox && Math.abs(currBox.y - prevBox.y) > 1) {
        rows++;
      }
    }

    const navOk = rows <= 1;
    console.log(`${route} 1440: navRows=${rows} loaderHidden=${!loaderVisible} h1Visible=${h1Visible}`);

    if (!navOk) allPassed = false;
    if (!h1Visible) allPassed = false;
    if (loaderVisible) allPassed = false;

    await page.close();
  }

  await browser.close();

  console.log('\n=== SUMMARY ===');
  console.log(`navRows == 1: ${allPassed ? 'PASS' : 'FAIL'}`);
  console.log(`loaderVisible false: ${allPassed ? 'PASS' : 'FAIL'}`);
  console.log(`h1Visible true: ${allPassed ? 'PASS' : 'FAIL'}`);

  process.exit(allPassed ? 0 : 1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
