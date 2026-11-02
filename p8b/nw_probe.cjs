/**
 * nw_probe.cjs - playwright probe for naturalWidth 0 issue
 * Tests NOVA images at 1440px and 390px viewport widths, scrolling each into view
 */
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5199';
const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440' },
  { width: 390, height: 844, name: '390' }
];

async function scrollAndWaitForImage(page, img) {
  // Scroll image into view
  await img.scrollIntoViewIfNeeded();
  // Wait a bit for lazy loading
  await page.waitForTimeout(500);
  // Wait for image to complete loading
  await img.evaluate(el => {
    if (el.complete) return Promise.resolve();
    return new Promise(resolve => {
      el.addEventListener('load', resolve, { once: true });
      el.addEventListener('error', resolve, { once: true });
      // Timeout after 5 seconds
      setTimeout(resolve, 5000);
    });
  });
}

async function testNaturalWidth(page, viewportName) {
  console.log(`\n=== Testing at ${viewportName}px viewport ===`);
  
  // Navigate to NOVA case study
  await page.goto(`${BASE_URL}/work/nova`);
  await page.waitForLoadState('networkidle');
  
  // Wait for initial load
  await page.waitForTimeout(2000);
  
  // Find all images in the NOVA case study
  const images = await page.locator('img').all();
  console.log(`Found ${images.length} images`);
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = await img.getAttribute('src');
    
    // Only test NOVA-related images
    if (src && (src.includes('nova') || src.includes('feature') || src.includes('life'))) {
      // Scroll into view and wait for load
      await scrollAndWaitForImage(page, img);
      
      const currentSrc = await img.evaluate(el => el.currentSrc);
      const complete = await img.evaluate(el => el.complete);
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const loading = await img.getAttribute('loading');
      const srcset = await img.getAttribute('srcset');
      
      console.log(`  img[${i}]: src=${src}`);
      console.log(`    currentSrc: ${currentSrc}`);
      console.log(`    complete: ${complete}`);
      console.log(`    naturalWidth: ${naturalWidth}`);
      console.log(`    loading: ${loading}`);
      console.log(`    srcset: ${srcset || 'none'}`);
      
      if (naturalWidth === 0) {
        console.log(`    ⚠️  NATURALWIDTH 0!`);
      }
    }
  }
}

async function testWithEagerLoading(page, viewportName) {
  console.log(`\n=== Testing at ${viewportName}px viewport WITH loading=eager (in-page flip) ===`);
  
  await page.goto(`${BASE_URL}/work/nova`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Flip all NOVA images to loading=eager
  await page.evaluate(() => {
    document.querySelectorAll('img[src*="nova"], img[src*="feature"], img[src*="life"]').forEach(img => {
      img.loading = 'eager';
    });
  });
  
  await page.waitForTimeout(2000);
  
  const images = await page.locator('img').all();
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = await img.getAttribute('src');
    if (src && (src.includes('nova') || src.includes('feature') || src.includes('life'))) {
      await scrollAndWaitForImage(page, img);
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const loading = await img.getAttribute('loading');
      console.log(`  img[${i}] (eager): src=${src} naturalWidth=${naturalWidth} loading=${loading}`);
    }
  }
}

async function testWithoutSrcset(page, viewportName) {
  console.log(`\n=== Testing at ${viewportName}px viewport WITHOUT srcset (in-page removal) ===`);
  
  await page.goto(`${BASE_URL}/work/nova`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Remove srcset from all NOVA images
  await page.evaluate(() => {
    document.querySelectorAll('img[src*="nova"], img[src*="feature"], img[src*="life"]').forEach(img => {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    });
  });
  
  await page.waitForTimeout(2000);
  
  const images = await page.locator('img').all();
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = await img.getAttribute('src');
    if (src && (src.includes('nova') || src.includes('feature') || src.includes('life'))) {
      await scrollAndWaitForImage(page, img);
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const srcset = await img.getAttribute('srcset');
      console.log(`  img[${i}] (no srcset): src=${src} naturalWidth=${naturalWidth} srcset=${srcset || 'none'}`);
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await testNaturalWidth(page, vp.name);
      await page.close();
      
      // Test with eager loading
      const page2 = await browser.newPage();
      await page2.setViewportSize({ width: vp.width, height: vp.height });
      await testWithEagerLoading(page2, vp.name);
      await page2.close();
      
      // Test without srcset
      const page3 = await browser.newPage();
      await page3.setViewportSize({ width: vp.width, height: vp.height });
      await testWithoutSrcset(page3, vp.name);
      await page3.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);