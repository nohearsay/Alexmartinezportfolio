/**
 * prerender-shell.mjs — static route shells for the Vite SPA export.
 *
 * The built app is a single index.html shell, so `curl` (or any crawler)
 * would only ever see the home <title>. This post-build step copies the
 * shell into one directory per known route with that route's <title>, so
 * /work/aura etc. resolve to real static HTML on any file host (Netlify,
 * Vercel, GitHub Pages) with no server-side code and no extra dependency.
 *
 * Client-side routing still owns navigation after hydration; this only
 * fixes what a non-JS fetch sees and how link previews/crawlers read.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Determine output dir: --out <dir> CLI arg, else default to dist_p5
const cliOut = process.argv.find(arg => arg.startsWith('--out='))?.split('=')[1]
const outDir = cliOut ? join(root, cliOut) : join(root, 'dist_p5')
console.log(`prerender-shell: resolved output dir = ${outDir}`)
const shellPath = join(outDir, 'index.html')

if (!existsSync(shellPath)) {
  console.error('prerender-shell: dist/index.html not found — run `vite build` first.')
  process.exit(1)
}

const meta = JSON.parse(readFileSync(join(root, 'src', 'site-meta.json'), 'utf8'))
const shell = readFileSync(shellPath, 'utf8')

if (!/<title>[\s\S]*?<\/title>/.test(shell)) {
  console.error('prerender-shell: no <title> in dist/index.html — refusing to write shells.')
  process.exit(1)
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const withTitle = (html, title) =>
  html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

const written = []

writeFileSync(shellPath, withTitle(shell, meta.titles['/']))
written.push('index.html')

for (const [route, title] of Object.entries(meta.titles)) {
  if (route === '/' ) continue
  const rel = route.replace(/^\//, '')
  const outFile = route === '/404' ? join(outDir, '404.html') : join(outDir, rel, 'index.html')
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, withTitle(shell, title))
  written.push(route === '/404' ? '404.html' : `${rel}/index.html`)
}

console.log(`prerender-shell: wrote ${written.length} static route shells`)
for (const file of written) console.log(`  ${basename(outDir)}/${file}`)
