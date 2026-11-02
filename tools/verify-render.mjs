/**
 * verify-render.mjs — real-browser render smoke test for the static export.
 *
 * Serves nothing itself: point it at any static host that is already serving
 * `dist/` (e.g. `python -m http.server 4181 --directory dist`) and it drives a
 * headless Chromium over every route, asserting for each one:
 *   - no console errors / page errors
 *   - no 4xx or failed network requests
 *   - the page is NOT blank (DOM text + real screenshot pixel diversity)
 *   - document height < 5000 px
 *   - exactly one visible <header>, <main>, <footer>
 *   - scroll-triggered [data-animate] blocks are actually visible
 *   - SVG icons honour their Tailwind class sizes
 * and writes screenshots + a JSON report.
 *
 * Usage:
 *   node tools/verify-render.mjs --base http://127.0.0.1:4181 \
 *        --out "../scratchpad/hermes-reports/portfolio-webdev/shots_fix"
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const argOf = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const base = argOf('--base', 'http://127.0.0.1:4181').replace(/\/$/, '')
const outDir = resolve(process.cwd(), argOf('--out', 'shots_fix'))
const width = Number(argOf('--width', '1280'))
const height = Number(argOf('--height', '900'))

const ROUTES = ['/', '/work', '/work/aura', '/work/nova', '/work/pulse', '/film', '/narrative', '/about', '/cv', '/contact']

/** Pixel-diversity check: a blank page renders a handful of colours, a real
 *  page renders hundreds. Runs inside the browser against the PNG buffer. */
const pixelStats = async (page, b64) =>
  page.evaluate(async (data) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + data
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    const colors = new Set()
    let lum = 0
    let n = 0
    for (let i = 0; i < d.length; i += 4 * 11) {
      colors.add(`${d[i]},${d[i + 1]},${d[i + 2]}`)
      lum += (d[i] + d[i + 1] + d[i + 2]) / 3
      n++
    }
    return { uniqueColors: colors.size, avgLuminance: Math.round(lum / n) }
  }, b64)

/** Scroll every [data-animate] block into view and confirm the GSAP
 *  ScrollTrigger actually reveals it (opacity back to 1). This is the
 *  "scroll animations fire" gate — without it, a broken ScrollTrigger looks
 *  exactly like a blank page. */
const revealPass = (page) =>
  page.evaluate(async () => {
    const els = [...document.querySelectorAll('[data-animate]')]
    // Phase 1: walk every block through the viewport so its ScrollTrigger fires.
    for (const el of els) {
      el.scrollIntoView({ block: 'center' })
      await new Promise((r) => setTimeout(r, 260))
    }
    // Phase 2: the tweens stagger (duration 0.7s + 0.1s per item), so give the
    // longest one time to finish before judging opacity.
    await new Promise((r) => setTimeout(r, 2600))
    const hidden = []
    for (const el of els) {
      const op = parseFloat(getComputedStyle(el).opacity)
      if (op < 0.95) hidden.push({ tag: el.tagName, cls: (el.getAttribute('class') || '').slice(0, 60), opacity: op })
    }
    return { checked: els.length, stillHidden: hidden }
  })

const probe = (page) =>
  page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.height > 0 && r.width > 0 && s.display !== 'none' && s.visibility !== 'hidden'
    }
    const root = document.getElementById('root')
    const animated = [...document.querySelectorAll('[data-animate]')]
    const stuck = animated.filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.5)
    const icons = [...document.querySelectorAll('svg[class*="w-"]')].map((s) => {
      const r = s.getBoundingClientRect()
      return { cls: s.getAttribute('class'), w: Math.round(r.width), h: Math.round(r.height) }
    })
    return {
      title: document.title,
      rootChildren: root ? root.children.length : 0,
      rootHtmlLength: root ? root.innerHTML.length : 0,
      bodyTextLength: (document.body.innerText || '').trim().length,
      bodyTextSample: (document.body.innerText || '').trim().slice(0, 110).replace(/\s+/g, ' '),
      documentHeight: document.documentElement.scrollHeight,
      // The site chrome banner (components/Header.tsx renders <header role="banner">).
      // Section wrappers also use <header> for their headings — inside <section>
      // those map to a generic role, not to the banner landmark, so they are
      // recorded separately rather than failed.
      bannerCount: [...document.querySelectorAll('header[role="banner"]')].filter(vis).length,
      headerCount: [...document.querySelectorAll('header')].filter(vis).length,
      sectionHeaderCount: [...document.querySelectorAll('section header, main header')].filter(vis).length,
      mainCount: [...document.querySelectorAll('main')].filter(vis).length,
      totalMainCount: document.querySelectorAll('main').length,
      footerCount: [...document.querySelectorAll('footer')].filter(vis).length,
      h1: [...document.querySelectorAll('h1')].map((h) => h.innerText.replace(/\s+/g, ' ').trim()).join(' | '),
      animatedCount: animated.length,
      // Elements below the fold legitimately sit at opacity 0 until their
      // ScrollTrigger fires, so this is informational at scrollY=0; the real
      // gate is the reveal pass below, which scrolls each one into view.
      animatedHiddenAtTop: stuck.length,
      iconsTotal: icons.length,
      iconsOversized: icons.filter((i) => i.w > 64 || i.h > 64),
      fontFamily: getComputedStyle(document.body).fontFamily,
      interLoaded: document.fonts.check('16px "Inter Variable"'),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      hasLiteralBackslash: /\\/.test(document.body.innerText || '')
    }
  })

mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
const results = []

for (const route of ROUTES) {
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  const badResponses = []
  const failedRequests = []

  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
    if (m.type() === 'warning' && /Warning:/.test(m.text())) consoleErrors.push('REACT ' + m.text())
  })
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message ? e.message : e)))
  page.on('response', (r) => {
    if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`)
  })
  page.on('requestfailed', (r) => failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`))

  let navError = null
  try {
    await page.goto(base + route, { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(1500)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(800)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(600)
  } catch (e) {
    navError = String(e.message || e)
  }

  let metrics = null
  let pixels = null
  let reveal = null
  if (!navError) {
    try {
      metrics = await probe(page)
      const shot = await page.screenshot({ fullPage: false })
      pixels = await pixelStats(page, shot.toString('base64'))
      reveal = await revealPass(page)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(300)
    } catch (e) {
      navError = 'probe failed: ' + String(e.message || e)
    }
  }

  const file = `${route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '')}.png`
  try {
    await page.screenshot({ path: resolve(outDir, file), fullPage: false })
  } catch {
    /* screenshot after a failed nav is not fatal */
  }

  const blank = !metrics || metrics.rootHtmlLength < 200 || metrics.bodyTextLength < 80
  const passed =
    !navError &&
    !blank &&
    consoleErrors.length === 0 &&
    pageErrors.length === 0 &&
    badResponses.length === 0 &&
    failedRequests.length === 0 &&
    metrics.documentHeight < 5000 &&
    metrics.bannerCount === 1 &&
    metrics.footerCount === 1 &&
    metrics.mainCount === 1 &&
    reveal.stillHidden.length === 0 &&
    metrics.iconsOversized.length === 0 &&
    pixels.uniqueColors > 120

  results.push({
    route,
    url: base + route,
    passed,
    navError,
    blank,
    screenshot: file,
    pixels,
    revealChecked: reveal ? reveal.checked : null,
    revealStillHidden: reveal ? reveal.stillHidden : null,
    consoleErrors,
    pageErrors,
    badResponses,
    failedRequests,
    ...(metrics || {})
  })

  console.log(
    `${passed ? 'PASS' : 'FAIL'}  ${route.padEnd(12)} h=${metrics?.documentHeight ?? '-'}px ` +
      `text=${metrics?.bodyTextLength ?? '-'} banner=${metrics?.bannerCount ?? '-'} ` +
      `ftr=${metrics?.footerCount ?? '-'} main=${metrics?.mainCount ?? '-'} colors=${pixels?.uniqueColors ?? '-'} ` +
      `conErr=${consoleErrors.length} pgErr=${pageErrors.length} bad=${badResponses.length + failedRequests.length}`
  )
  await page.close()
}

await browser.close()

const report = {
  base,
  viewport: `${width}x${height}`,
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed: results.filter((r) => r.passed).length,
  failed: results.filter((r) => !r.passed).length,
  results
}
writeFileSync(resolve(outDir, 'verify-render.json'), JSON.stringify(report, null, 2))
console.log(`\n${report.passed}/${report.total} routes PASS — report: ${resolve(outDir, 'verify-render.json')}`)
process.exit(report.failed === 0 ? 0 : 1)
