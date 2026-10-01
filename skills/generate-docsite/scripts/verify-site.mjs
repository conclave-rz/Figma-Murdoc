#!/usr/bin/env node
// verify-site.mjs — verificación headless de un sitio generado por generate-docsite (o docu-alx).
// Usa el Chrome local vía puppeteer-core (dependencia de Murdoc). Sin servidor: carga por file://.
//
// Uso: node verify-site.mjs <carpeta-del-sitio> [--out <carpeta-capturas>] [--no-nav-check] [--offline]
// Sale con 0 si todo pasa, 1 si algo falla. Imprime un reporte JSON.

import { existsSync, readFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const siteDir = args.find(a => !a.startsWith('--'))
if (!siteDir || !existsSync(siteDir)) {
  console.error('Uso: node verify-site.mjs <carpeta-del-sitio> [--out <carpeta-capturas>] [--no-nav-check]')
  process.exit(2)
}
const outIndex = args.indexOf('--out')
const shotsDir = resolve(outIndex >= 0 ? args[outIndex + 1] : join(siteDir, '..', `${siteDir.replace(/\/$/, '').split('/').pop()}-verify`))
const checkNav = !args.includes('--no-nav-check')
const offline = args.includes('--offline') // docu-alx: cero solicitudes de red
mkdirSync(shotsDir, { recursive: true })

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(p => p && existsSync(p))

if (CHROME_CANDIDATES.length === 0) {
  console.error('No se encontró Chrome/Chromium. Define CHROME_PATH o instala Google Chrome.')
  process.exit(2)
}

let puppeteer
try {
  puppeteer = (await import('puppeteer-core')).default
} catch {
  console.error('Falta puppeteer-core. Corre este script desde el repo de Murdoc (npm install) o instala puppeteer-core.')
  process.exit(2)
}

const htmlFiles = (dir) => readdirSync(dir).flatMap(entry => {
  const full = join(dir, entry)
  if (statSync(full).isDirectory()) return ['assets', 'node_modules', 'tools'].includes(entry) ? [] : htmlFiles(full)
  return entry.endsWith('.html') ? [full] : []
})

const report = { site: resolve(siteDir), screenshots: shotsDir, pages: [], tokens: null, failures: [] }
const fail = (where, message) => report.failures.push({ where, message })

// tokens.json (DTCG) — solo si el sitio lo declara (generate-docsite); docu-alx no lo usa
const tokensPath = join(siteDir, 'assets', 'tokens.json')
if (existsSync(tokensPath)) {
  try {
    const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'))
    const isDtcg = JSON.stringify(tokens).includes('"$value"')
    report.tokens = { path: tokensPath, valid: true, dtcg: isDtcg }
    if (!isDtcg) fail('assets/tokens.json', 'No tiene forma DTCG ($value/$type)')
  } catch (err) {
    report.tokens = { path: tokensPath, valid: false }
    fail('assets/tokens.json', `JSON inválido: ${err.message}`)
  }
}

// Se ejecuta dentro de la página: pares texto/fondo visibles con su contraste WCAG
function contrastAudit() {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(',').map(Number); return { r, g, b, a } }
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  // Fondo real bajo el centro del texto según el apilado (cubre indicadores/thumbs que son hermanos, no ancestros)
  const bgOf = (el) => {
    const rect = el.getBoundingClientRect()
    const stack = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    const candidates = stack.length ? stack : (() => { const chain = []; for (let n = el; n; n = n.parentElement) chain.push(n); return chain })()
    for (const n of candidates) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.5) return c }
    return { r: 255, g: 255, b: 255, a: 1 }
  }
  const issues = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement
    if (!el || seen.has(el) || !walker.currentNode.textContent.trim()) continue
    seen.add(el)
    const style = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    if (style.visibility === 'hidden' || style.display === 'none' || rect.width === 0 || el.closest('[hidden],[aria-hidden="true"],.sr-only')) continue
    // Texto invisible por opacidad (tooltips, estados ocultos) no se evalúa
    let faded = false; for (let n = el; n; n = n.parentElement) { if (Number(getComputedStyle(n).opacity) < 0.1) { faded = true; break } }
    if (faded) continue
    const fg = parse(style.color); if (!fg) continue
    const bg = bgOf(el)
    const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a)
    const ratio = (l1 + 0.05) / (l2 + 0.05)
    const size = parseFloat(style.fontSize); const bold = Number(style.fontWeight) >= 700
    const min = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5
    if (ratio < min) issues.push({ text: walker.currentNode.textContent.trim().slice(0, 40), ratio: Math.round(ratio * 100) / 100, min })
  }
  return issues.slice(0, 20)
}

const browser = await puppeteer.launch({ executablePath: CHROME_CANDIDATES[0], headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] })
try {
  for (const file of htmlFiles(siteDir).sort()) {
    const rel = relative(siteDir, file)
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    const consoleErrors = []
    const externalRequests = []
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', err => consoleErrors.push(err.message))
    page.on('requestfailed', req => consoleErrors.push(`recurso faltante: ${req.url()}`))
    page.on('request', req => { if (/^https?:/.test(req.url())) externalRequests.push(req.url()) })

    await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'load' })
    const facts = await page.evaluate(() => ({
      lang: document.documentElement.getAttribute('lang'),
      activeNav: [...document.querySelectorAll('.is-active')].filter(el => el.closest('nav, aside') && el.offsetParent !== null).length,
      fontImports: [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.cssText.startsWith('@import') && /font/i.test(r.cssText)) } catch { return false } }),
    }))
    const contrastLight = await page.evaluate(contrastAudit)
    const slug = rel.replace(/[\\/]/g, '__').replace(/\.html$/, '')
    await page.screenshot({ path: join(shotsDir, `${slug}.light.png`), fullPage: true })
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
    const contrastDark = await page.evaluate(contrastAudit)
    await page.screenshot({ path: join(shotsDir, `${slug}.dark.png`), fullPage: true })
    await page.close()

    const pageReport = { page: rel, ...facts, consoleErrors, externalRequests, contrastLight, contrastDark }
    report.pages.push(pageReport)
    if (!facts.lang) fail(rel, 'Falta <html lang>')
    if (checkNav && facts.activeNav !== 1) fail(rel, `Estados activos en navegación: ${facts.activeNav} (debe ser 1)`)
    if (offline && externalRequests.length) fail(rel, `Solicitudes de red externas: ${externalRequests.length}`)
    if (facts.fontImports) fail(rel, 'Fuentes cargadas con @import (usa <link>)')
    if (consoleErrors.length) fail(rel, `Errores de consola: ${consoleErrors.length}`)
    if (contrastLight.length) fail(rel, `Contraste insuficiente (light): ${contrastLight.length} pares`)
    if (contrastDark.length) fail(rel, `Contraste insuficiente (dark): ${contrastDark.length} pares`)
  }
} finally {
  await browser.close()
}

report.summary = { pages: report.pages.length, failures: report.failures.length, ok: report.failures.length === 0 }
console.log(JSON.stringify(report, null, 2))
process.exit(report.summary.ok ? 0 : 1)
