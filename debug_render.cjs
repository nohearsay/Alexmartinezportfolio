const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check specifically the home page loop posters
  const imgs = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      complete: img.complete,
      width: img.width,
      height: img.height,
      alt: img.alt,
      loading: img.loading,
      className: img.className,
      style: img.getAttribute('style'),
    }))
  );
  
  console.log('Home page images:');
  imgs.forEach((img, i) => {
    console.log(`img[${i}]: src=${img.src?.substring(0, 60)} naturalWidth=${img.naturalWidth} complete=${img.complete} w=${img.width} h=${img.height} loading=${img.loading} alt=${img.alt}`);
  });
  
  // Check if there are any picture elements or source tags
  const sources = await page.$$eval('source', sources => 
    sources.map(s => ({
      src: s.src,
    }))
  );
  console.log('\nSource tags:');
  sources.forEach((s, i) => console.log(`  source[${i}]: src=${s.src?.substring(0, 60)}`));
  
  // Check video tags
  const videos = await page.$$eval('video', videos => 
    videos.map(v => ({
      src: v.src,
      poster: v.poster,
    }))
  );
  console.log('\nVideo tags:');
  videos.forEach((v, i) => console.log(`  video[${i}]: src=${v.src?.substring(0, 60)} poster=${v.poster?.substring(0, 60)}`));
  
  await browser.close();
})().catch(e => console.error(e));
