// aura_computed.cjs — check computed styles on /work/aura
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';
const VIEWS = [[1440, 900], [390, 844]];

async function main() {
  const browser = await chromium.launch();
  const results = [];

  for (const [w, h] of VIEWS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(base + '/work/aura', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const computed = await page.evaluate((viewportWidth) => {
      const csHero = document.querySelector('main section.cs-hero');
      const h1 = document.querySelector('.cs-hero h1');
      const csEssaySection = document.querySelector('.cs-essay .section');

      const getVal = (el, prop) => el ? parseFloat(getComputedStyle(el)[prop]) : null;

      return {
        viewport: viewportWidth,
        csHeroPaddingTop: getVal(csHero, 'paddingTop'),
        h1FontSize: getVal(h1, 'fontSize'),
        csEssayPaddingBlockStart: getVal(csEssaySection, 'paddingBlockStart'),
        csEssayPaddingBlockEnd: getVal(csEssaySection, 'paddingBlockEnd'),
        sectionYVar: csEssaySection ? getComputedStyle(csEssaySection).getPropertyValue('--section-y') : null,
        h1ComputedStyle: h1 ? getComputedStyle(h1).cssText : null,
      };
    }, w);

    results.push(computed);
    await page.close();
  }

  await browser.close();

  console.log('AURA Computed Styles:');
  results.forEach(r => {
    console.log(`\nViewport ${r.viewport}:`);
    console.log(`  main section.cs-hero padding-top: ${r.csHeroPaddingTop}px (expected 96)`);
    console.log(`  .cs-hero h1 font-size: ${r.h1FontSize}px (expected 36)`);
    console.log(`  .cs-essay .section padding-block-start: ${r.csEssayPaddingBlockStart}px`);
    console.log(`  .cs-essay .section padding-block-end: ${r.csEssayPaddingBlockEnd}px`);
    console.log(`  --section-y value: ${r.sectionYVar}`);
  });

  // Write to file
  const fs = require('fs');
  fs.writeFileSync('C:/Alex stuff/AI vault/portfolio/scratchpad/hermes-reports/portfolio-webdev/S8c_shots/aura_computed.txt', JSON.stringify(results, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });