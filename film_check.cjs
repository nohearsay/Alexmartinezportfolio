// film_check.cjs — verify Film page copy and no frames
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';

async function main() {
  const browser = await chromium.launch();
  
  // Desktop check
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/film', { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  const filmInfo = await page.evaluate(() => {
    const title = document.querySelector('h1')?.textContent;
    const lede = document.querySelector('.lede')?.textContent;
    const listItems = Array.from(document.querySelectorAll('.lane__list li')).map(li => li.textContent);
    const frames = document.querySelectorAll('.frame, .film-tiles__item');
    return {
      title,
      lede,
      points: listItems,
      frameCount: frames.length
    };
  });
  
  console.log('=== FILM PAGE (Desktop) ===');
  console.log('Title:', filmInfo.title);
  console.log('Lede:', filmInfo.lede);
  console.log('Points:', filmInfo.points);
  console.log('Empty frames found:', filmInfo.frameCount);
  
  // Mobile check
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(base + '/film', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(1000);

  const mobileInfo = await mobilePage.evaluate(() => {
    const listItems = Array.from(document.querySelectorAll('.lane__list li')).map(li => li.textContent);
    const frames = document.querySelectorAll('.frame, .film-tiles__item');
    return {
      points: listItems,
      frameCount: frames.length
    };
  });
  
  console.log('\n=== FILM PAGE (Mobile 390) ===');
  console.log('Points:', mobileInfo.points);
  console.log('Empty frames found:', mobileInfo.frameCount);

  await browser.close();
  
  const pass = filmInfo.frameCount === 0 && mobileInfo.frameCount === 0 && filmInfo.points.length === 3;
  console.log(`\nOverall: ${pass ? 'PASS' : 'FAIL'}`);
  process.exit(pass ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });