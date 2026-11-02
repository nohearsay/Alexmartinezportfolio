import { test, expect } from '@playwright/test'
import { createServer } from 'vite'

const PORT = 4183

async function runTests() {
  // Build first
  console.log('Building for P3 verification...')
  
  // Start dev server
  const app = await createServer({
    configFile: false,
    config: {
      plugins: [],
      build: {
        outDir: 'dist_p3',
        minify: 'esbuild',
      },
    },
  })
  
  await app.listen(PORT, 'localhost')
  
  try {
    const browser = await test.info().project.browser
    
    const tests = [
      { route: '/', width: 1440 },
      { route: '/', width: 390 },
      { route: '/work', width: 1440 },
      { route: '/work/aura', width: 1440 },
      { route: '/work/nova', width: 1440 },
      { route: '/film', width: 1440 },
      { route: '/about', width: 1440 },
      { route: '/cv', width: 1440 },
      { route: '/contact', width: 1440 },
    ]
    
    for (const { route, width } of tests) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      })
      const page = await context.newPage()
      await page.goto(`http://localhost${route}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
      
      // Check no loader visible
      const loader = page.locator('.loader')
      const loaderVisible = await loader.isVisible()
      const loaderHasDoneClass = await loader.getAttribute('data-state') === 'done'
      
      // Check no .boot in DOM (boot is the pre-hydration shell in index.html)
      const bootCount = await page.locator('.boot').count()
      
      // Check hero/h1 visible
      const h1 = page.locator('h1').first()
      const h1Visible = await h1.isVisible()
      
      // Check console errors
      const consoleErrors = []
      page.on('console', msg => consoleErrors.push({ type: msg.type(), text: msg.text() }))
      page.on('pageerror', err => consoleErrors.push({ type: 'pageerror', text: err.message }))
      
      await page.waitForTimeout(500)
      
      console.log(`\n${route} @ ${width}px:`)
      console.log(`  Loader visible: ${loaderVisible} (done class: ${loaderHasDoneClass})`)
      console.log(`  .boot in DOM: ${bootCount} elements`)
      console.log(`  h1 visible: ${h1Visible}`)
      console.log(`  Console errors: ${consoleErrors.length}`)
      
      // Save screenshot
      const screenshotDir = 'portfolio\\scratchpad\\hermes-reports\\portfolio-webdev\\shots_p3_finish'
      await page.screenshot({ path: `${screenshotDir}/${route.replace(/\\//g, '_')}_${width}.png` })
      await context.close()
    }
    
    // Test reduced motion
    console.log('\n--- Reduced Motion Test ---')
    const rmContext = await browser.newContext({
      viewport: { width: 1440, height: 844 },
      userAgent: 'Mozilla/5.0',
      reducedMotion: 'reduce',
    })
    const rmPage = await rmContext.newPage()
    await rmPage.goto(`http://localhost/`)
    await rmPage.waitForLoadState('networkidle')
    await rmPage.waitForTimeout(3000)
    
    const loaderRm = rmPage.locator('.loader')
    const loaderRmVisible = await loaderRm.isVisible()
    console.log(`Loader with reducedMotion: ${loaderRmVisible} (should be false/hidden)`)
    
    // Scroll test
    await rmPage.evaluate(() => {
      window.scrollBy(0, 100)
    })
    const scrollY = await rmPage.evaluate(() => window.scrollY)
    console.log(`Scroll Y after wheel: ${scrollY} (should be > 0)`)
    
    await rmContext.close()
    
    console.log('\nAll tests completed!')
    
  } finally {
    await app.close()
  }
}

runTests().catch(console.error)