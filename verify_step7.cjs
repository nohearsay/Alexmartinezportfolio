// Playwright verification for SITE P5 STEP 7 + 6e QA
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4188';
const ROUTES = ['/', '/work', '/work/aura', '/about', '/cv', '/film', '/narrative', '/contact'];
const VIEWS = [[1440, 900], [390, 844]];

const PHONE_PATTERN = /\+?\d[\d\s().-]{7,}\d/g;
const YEAR_PATTERN = /\b\d{4}\b/g;
const STREET_WORDS = /Calle|Avenida|Av\.?|Street|St\.?|Suite|Apt/gi;

async function run() {
  const results = [];
  const badLinks = {};
  const badVideos = {};
  const phoneIssues = {};
  const overflowIssues = {};
  const dupTextIssues = {};

  for (const [w, h] of VIEWS) {
    for (const route of ROUTES) {
      const key = `${route}_${w}`;
      const p = await chromium.launch();
      const page = await p.newPage({ viewport: { width: w, height: h } });
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 1. Internal links
      const links = await page.$$eval('a[href^="/"]', anchors => 
        anchors.map(a => ({ href: a.href, text: a.innerText.trim() }))
      );
      const bad = links.filter(l => !l.href.includes('://') && l.href.startsWith('http://127.0.0.1') === false && l.href.startsWith('http://localhost') === false);
      if (bad.length > 0) badLinks[key] = bad.map(l => `${l.text} (${l.href})`).join(', ');

      // 2. Video embeds
      const videoSrcs = [];
      const filmPage = route === '/film' || route === '/narrative' || route === '/work/aura';
      if (filmPage) {
        const iframes = await page.$$('iframe');
        for (const iframe of iframes) {
          const src = await iframe.getAttribute('src');
          if (src) videoSrcs.push(src);
        }
        const videos = await page.$$('video');
        for (const video of videos) {
          const src = await video.getAttribute('src');
          if (src) videoSrcs.push(src);
        }
      }

      // 3. No phone / street address
      const mainElement = await page.$('main');
      const mainText = await mainElement.evaluate(el => el.innerText);
      const phoneMatches = mainText.match(PHONE_PATTERN) || [];
      const validPhones = phoneMatches.filter(m => !YEAR_PATTERN.test(m));
      const streetMatches = mainText.match(STREET_WORDS) || [];
      let phoneIssue = '';
      if (validPhones.length > 0) phoneIssue += `Phone-like patterns: ${validPhones.join('; ')}; `;
      if (streetMatches.length > 0) phoneIssue += `Street words: ${streetMatches.join('; ')}`;
      if (phoneIssue) phoneIssues[key] = phoneIssue.replace('; $', '');

      // 4. Mobile horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const hasOverflow = w === 390 && scrollWidth > 391;
      if (hasOverflow) overflowIssues[key] = `Horizontal overflow: ${scrollWidth}px > 391px`;

      // 5. Duplicated text in main
      const lines = mainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const lineCounts = {};
      for (const line of lines) {
        lineCounts[line] = (lineCounts[line] || 0) + 1;
      }
      const duplicated = Object.entries(lineCounts).filter(([_, count]) => count > 1);
      if (duplicated.length > 0) dupTextIssues[key] = `${duplicated.length} duplicated line(s)`;

      await p.close();

      results.push({
        key,
        route,
        width: w,
        badLinks: badLinks[key] || undefined,
        videoSrcs: videoSrcs.length > 0 ? videoSrcs : undefined,
        phoneIssues: Object.keys(phoneIssues).includes(key) ? phoneIssues[key] : undefined,
        overflow: hasOverflow ? overflowIssues[key] : undefined,
        dupText: Object.keys(dupTextIssues).includes(key) ? dupTextIssues[key] : undefined
      });
    }
  }

  console.log('=== VERIFICATION SUMMARY ===');
  for (const r of results) {
    console.log(`\n${r.key} (${r.width}w):`);
    if (r.badLinks) console.log(`  BAD LINKS: ${r.badLinks}`);
    if (r.videoSrcs) console.log(`  VIDEO/SRC: ${r.videoSrcs.join(', ')}`);
    if (r.phoneIssues) console.log(`  PHONE/STREEW: ${r.phoneIssues}`);
    if (r.overflow) console.log(`  OVERFLOW: ${r.overflow}`);
    if (r.dupText) console.log(`  DUPLICATE TEXT: ${r.dupText}`);
  }

  const allPass = !Object.keys(badLinks).length && !Object.keys(badVideos).length && 
                  !Object.keys(phoneIssues).length && !Object.keys(overflowIssues).length && 
                  !Object.keys(dupTextIssues).length;
  console.log(`\n=== OVERALL: ${allPass ? 'PASS' : 'FAIL'} ===`);
  process.exit(allPass ? 0 : 1);
}

run().catch(e => { console.error(e); process.exit(1); });
