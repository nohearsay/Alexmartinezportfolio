const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = 'http://127.0.0.1:4188';
const outDir = path.join(process.cwd(), 'Q', 't2r2');
const routesToCheck = ['/work'];

const RESULTS = {};

async function run() {
  const b = await chromium.launch();
  
  for (const route of routesToCheck) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      
      await p.goto(base + route, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(500);
      
      RESULTS[`${route}_${w}`] = { route, w, h, issues: [], videos: [] };
      
      // Check 1: List/Grid toggle exists
      if (route === '/work') {
        const toggle = await p.$('.work-view-toggle');
        if (!toggle) {
          RESULTS[`${route}_${w}`].issues.push('List/Grid toggle (.work-view-toggle) not found');
        } else {
          const ariaPressed = await toggle.$('button[aria-pressed]');
          if (!ariaPressed) {
            RESULTS[`${route}_${w}`].issues.push('No button with aria-pressed found in toggle');
          }
        }
        
        // Check for brand-index rows
        const rows = await p.$$('.brand-index__row');
        RESULTS[`${route}_${w}`].brandRows = rows.length;
        
        // Check role/year column exists
        if (rows.length > 0) {
          const hasRole = await rows[0].$('.brand-index__role');
          if (!hasRole) {
            RESULTS[`${route}_${w}`].issues.push('brand-index__role span missing on row');
          } else {
            const roleText = await hasRole.innerText();
            RESULTS[`${route}_${w}`].roleText = roleText;
          }
        }
      }
      
      // Check 2: Hover behavior at 1440
      if (w === 1440 && route === '/work') {
        const rows = await p.$$('.brand-index__row');
        if (rows.length > 0) {
          await rows[0].hover({ force: true });
          await p.waitForTimeout(500);
          
          // Check for video preview
          const videos = await p.$$('video');
          RESULTS[`${route}_${w}`].videosAfterHover = videos.length;
          
          if (videos.length > 0) {
            for (const vid of videos) {
              const src = await vid.getAttribute('src');
              const muted = await vid.getAttribute('muted');
              RESULTS[`${route}_${w}`].videoSrc = src;
              RESULTS[`${route}_${w}`].videoMuted = muted;
            }
          }
          
          // Check for preview div
          const previews = await p.$$('.brand-index__preview');
          RESULTS[`${route}_${w}`].previewsAfterHover = previews.length;
        }
      }
      
      // Check 3: At 390, no video mounted on rows (touch emulation)
      if (w === 390 && route === '/work') {
        // Emulate touch
        await p.emulateMediaFeatures([{ name: 'pointer', value: 'coarse' }]);
        await p.emulateMediaFeatures([{ name: 'reduce', value: true }]);
        
        const rows = await p.$$('.brand-index__row');
        for (const row of rows) {
          const videos = await row.$$('video');
          if (videos.length > 0) {
            RESULTS[`${route}_${w}`].issues.push('Video found inside brand-index__row at 390');
          }
        }
        
        // Check WorkCards
        const cards = await p.$$('.work-card');
        for (const card of cards) {
          const videos = await card.$$('video');
          if (videos.length > 0) {
            RESULTS[`${route}_${w}`].issues.push('Video found inside work-card at 390');
          }
        }
      }
      
      // Check 4: reducedMotion at 1440 - hovering does not play video
      if (w === 1440 && route === '/work') {
        // Emulate reduced-motion media query
        await p.emulateMediaFeatures([{ name: 'reduce', value: true }]);
        const rows = await p.$$('.brand-index__row');
        if (rows.length > 0) {
          await rows[0].hover({ force: true });
          await p.waitForTimeout(500);
          
          const videos = await p.$$('video');
          if (videos.length > 0) {
            RESULTS[`${route}_${w}`].issues.push('Video played despite reduced-motion at 1440');
          }
        }
      }
      
      await p.close();
    }
  }
  
  await b.close();
  
  // Print results
  console.log('=== ITEM CHECK RESULTS ===');
  for (const [key, data] of Object.entries(RESULTS)) {
    console.log(`\n${key}:`);
    if (data.issues.length > 0) {
      console.log('  ISSUES:');
      for (const issue of data.issues) {
        console.log(`   - ${issue}`);
      }
    } else {
      console.log('  OK');
    }
  }
}

run().catch(console.error);
