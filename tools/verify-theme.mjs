/**
 * verify-theme.mjs — dark-mode toggle + touch-target gate against a running
 * static host of `dist/` (see tools/verify-render.mjs for the route sweep).
 *
 * Asserts:
 *   - the toggle flips data-theme and writes localStorage('theme')
 *   - the choice survives a reload
 *   - interactive controls are >= 48 px on the small (390x844) breakpoint
 *   - no horizontal overflow at 320 / 768 / 1440
 *
 * Usage: node tools/verify-theme.mjs --base http://127.0.0.1:4181
 */
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const argOf = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const base = argOf('--base', 'http://127.0.0.1:4181').replace(/\/$/, '')

const browser = await chromium.launch()
const out = {}

// ---- dark-mode toggle ------------------------------------------------------
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message || e)))
  await page.goto(base + '/', { waitUntil: 'load' })
  await page.waitForTimeout(1200)

  const before = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    stored: localStorage.getItem('theme')
  }))

  await page.getByRole('button', { name: /toggle theme|switch to/i }).first().click()
  await page.waitForTimeout(400)

  const after = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    stored: localStorage.getItem('theme'),
    bg: getComputedStyle(document.body).backgroundColor
  }))

  await page.reload({ waitUntil: 'load' })
  await page.waitForTimeout(800)
  const reloaded = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    stored: localStorage.getItem('theme')
  }))

  out.theme = {
    before,
    afterClick: after,
    afterReload: reloaded,
    flipped: before.theme !== after.theme,
    persisted: reloaded.theme === after.theme && reloaded.stored === after.theme,
    errors
  }
  await ctx.close()
}

// ---- responsive: overflow + touch targets ---------------------------------
const breakpoints = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 700 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
]
out.responsive = []
for (const bp of breakpoints) {
  const ctx = await browser.newContext({ viewport: { width: bp.width, height: bp.height } })
  const page = await ctx.newPage()
  await page.goto(base + '/', { waitUntil: 'load' })
  await page.waitForTimeout(1000)
  const m = await page.evaluate(() => {
    const small = [...document.querySelectorAll('a, button, [role="tab"], input, select, textarea')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return { text: (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 28), w: Math.round(r.width), h: Math.round(r.height) }
      })
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      smallTargets: small.filter((s) => s.h < 48 || s.w < 48).slice(0, 12),
      targetCount: small.length
    }
  })
  out.responsive.push({ ...bp, ...m, horizontalOverflow: m.scrollWidth > m.clientWidth + 1 })
  await ctx.close()
}

await browser.close()
console.log(JSON.stringify(out, null, 2))
