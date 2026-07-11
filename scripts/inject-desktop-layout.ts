import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = 'dist/_astro'
const files = readdirSync(distDir).filter(f => f.startsWith('Layout.') && f.endsWith('.css'))
if (files.length === 0) {
  console.error('No Layout CSS file found in', distDir)
  process.exit(1)
}

const cssPath = join(distDir, files[0])
const css = readFileSync(cssPath, 'utf-8')

const fallback = "\n\n/* desktop-layout-injected */\n@media (min-width: 1024px) {\n[class*=\"lg:uno-desktop-column\"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\n[class*=\"lg:fixed\"]{position:fixed}\n[class*=\"lg:top-20\"]{top:5rem}\n[class*=\"lg:bottom-16.5rem\"]{bottom:16.5rem}\n[class*=\"lg:bottom-28\"]{bottom:7rem}\n[class*=\"lg:leading-2.45em\"]{line-height:2.45em}\n[lg~=\"uno-desktop-column\"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\n[lg~=\"fixed\"]{position:fixed}\n[lg~=\"bottom-28\"]{bottom:7rem}\n}\n"

writeFileSync(cssPath, css + fallback)
console.log('Injected desktop layout CSS into', files[0])
