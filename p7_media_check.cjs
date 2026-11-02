const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:4188';
const ROUTES = [
  '/', '/work', '/work/aura', '/work/nova', '/work/flesh-and-blood',
  '/film', '/narrative', '/about', '/cv', '/contact'
];
const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440' },
  { width: 390, height: 844, name: '390' }
];
const OUT_DIR = path.join(__dirname);

async function checkRoute(page, route, viewportName) {
  const failures = [];
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.url()} -> ${response.status()}`);
    }
  });

  try {
    await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    failures.push(`Navigation failed: ${e.message}`);
    return failures;
  }

  // Wait for hydration/React to finish initial render
  await page.waitForTimeout(2000);

  // Force load all images by setting loading='eager'
  await page.evaluate(() => {
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'eager';
    });
  });

  // Scroll to bottom to trigger lazy loads
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 5);
    });
  });

  // Wait for images to load after scrolling
  await page.waitForTimeout(3000);

  // Wait for all images to decode - loop with check
  await page.evaluate(() => {
    return new Promise(resolve => {
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds at 100ms intervals
      const check = () => {
        const imgs = document.querySelectorAll('img');
        let allComplete = true;
        imgs.forEach(img => {
          if (!img.complete || img.naturalWidth === 0) {
            allComplete = false;
          }
        });
        if (allComplete || attempts >= maxAttempts) {
          resolve({ allComplete, imgsCount: imgs.length });
        }
        attempts++;
        setTimeout(check, 100);
      };
      check();
    });
  });

  // Check for missing/empty src on img/video/source
  const mediaIssues = await page.evaluate(() => {
    const issues = [];
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img, i) => {
      if (!img.src || img.src === window.location.href) {
        issues.push(`img[${i}]: empty src`);
      } else if (img.naturalWidth === 0) {
        issues.push(`img[${i}]: naturalWidth === 0 (${img.src})`);
      }
    });
    const videos = document.querySelectorAll('video');
    videos.forEach((video, i) => {
      const hasPoster = video.poster && video.poster !== window.location.href;
      const sources = video.querySelectorAll('source');
      let hasValidSource = false;
      sources.forEach(s => {
        if (s.src && s.src !== window.location.href) hasValidSource = true;
      });
      if (!hasValidSource && !video.src) {
        issues.push(`video[${i}]: no valid source`);
      }
      if (!hasPoster && !hasValidSource) {
        issues.push(`video[${i}]: no poster and no source`);
      }
    });
    const sources = document.querySelectorAll('source');
    sources.forEach((source, i) => {
      if (!source.src || source.src === window.location.href) {
        issues.push(`source[${i}]: empty src`);
      }
    });
    return issues;
  });

  failures.push(...mediaIssues);

  // Check for media inside Film/Narrative lane sections
  const filmNarrativeMedia = await page.evaluate(() => {
    const issues = [];
    const filmSection = document.querySelector('[data-page="film"], .film-lane, #film');
    if (filmSection) {
      const media = filmSection.querySelectorAll('img, video');
      if (media.length > 0) {
        issues.push(`Film lane has ${media.length} media elements (should be copy-only)`);
      }
    }
    const narrativeSection = document.querySelector('[data-page="narrative"], .narrative-lane, #narrative');
    if (narrativeSection) {
      const media = narrativeSection.querySelectorAll('img, video');
      if (media.length > 0) {
        issues.push(`Narrative lane has ${media.length} media elements (should be copy-only)`);
      }
    }
    return issues;
  });

  failures.push(...filmNarrativeMedia);

  // Check horizontal overflow at 390
  if (viewportName === '390') {
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (overflow) {
      failures.push('Horizontal overflow detected (scrollWidth > innerWidth)');
    }
  }

  // Check console errors
  if (consoleErrors.length > 0) {
    failures.push(...consoleErrors.map(e => `Console error: ${e}`));
  }

  // Check failed requests
  if (failedRequests.length > 0) {
    failures.push(...failedRequests.map(r => `Failed request: ${r}`));
  }

  // Screenshot
  const safeRoute = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-');
  const screenshotPath = path.join(OUT_DIR, `${safeRoute}_${viewportName}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);

  return failures;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();

    for (const route of ROUTES) {
      console.log(`\nChecking ${route} at ${viewport.name}...`);
      const failures = await checkRoute(page, route, viewport.name);
      if (failures.length > 0) {
        allPassed = false;
        console.log(`  FAIL: ${route} (${viewport.name})`);
        failures.forEach(f => console.log(`    - ${f}`));
      } else {
        console.log(`  PASS: ${route} (${viewport.name})`);
      }
    }

    await context.close();
  }

  await browser.close();

  if (allPassed) {
    console.log('\nPASS all asserts');
    process.exit(0);
  } else {
    console.log('\nFAIL: some checks failed');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
