import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../../src/lib/anatomy/iso-kit.mjs'
import { buildChassis, CABINET, chassisDefs, PLATFORM_Z, TOP } from '../../src/lib/home/chassis.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const OUT = join(ROOT, '.temp', 'home-stage')

const W = 760
const H = 620
const LABELS = ['文章', '作品', '专栏', '资源', '标签']

// Every device is optional here: an agent can preview its own module while the
// others are still being rewritten. Missing modules are skipped, not fatal.
const DEVICES = [
  { file: 'typewriter.mjs', build: 'buildTypewriter', bounds: 'typewriterBounds' },
  { file: 'cinema.mjs', build: 'buildCinema', bounds: 'cinemaBounds' },
  { file: 'newsrack.mjs', build: 'buildNewsrack', bounds: 'newsrackBounds' },
  { file: 'toolbox.mjs', build: 'buildToolbox', bounds: 'toolboxBounds' },
  { file: 'labels.mjs', build: 'buildLabels', bounds: 'labelsBounds' },
]

const loaded = []
for (const device of DEVICES) {
  try {
    const mod = await import(`../../src/lib/home/${device.file}`)
    loaded.push({ ...device, mod })
  }
  catch (error) {
    loaded.push({ ...device, mod: null, error: error.message })
  }
}

const bounds = [...k.boxCorners(CABINET, -22, TOP)]
for (const device of loaded) {
  if (!device.mod)
    continue
  const fn = device.mod[device.bounds]
  if (typeof fn === 'function')
    bounds.push(...fn())
}

const P = k.fitProjection(bounds, W, H, { pad: 30, azimuth: 90, elevation: 18, focal: 1200, center: [0, 0, 55] })

const SAMPLE = [
  '慢一点比较快：当执行变得廉价，',
  '判断力才是稀缺物。工具在变便宜，',
  '判断没有。把时间花在看清问题上，',
  '而不是更快地做错。',
]

const ISSUES = ['20', '19', '18', '17'].map((n) => ({
  number: `No.${n}`,
  label: `No.${n}`,
  href: '#',
}))

const TAGS = ['设计', '动效', 'Astro', 'AI', 'Obsidian', 'Three.js', '排版', '工具链']

const activeArg = process.argv.find((a) => a.startsWith('--module='))
const active = activeArg ? Number(activeArg.slice(9)) : 0

const modules = LABELS.map((label, index) => {
  const device = loaded[index]
  const fn = device?.mod?.[device.build]
  let body
  if (typeof fn !== 'function')
    body = `<text class="iso-face-text" data-tone="lo" font-size="10" text-anchor="middle" x="${W / 2}" y="${H / 2}">${device?.file || ''} missing</text>`
  else if (index === 0)
    body = fn(P, { lines: SAMPLE })
  else if (index === 2)
    body = fn(P, { issues: ISSUES })
  else if (index === 4)
    body = fn(P, { tags: TAGS })
  else
    body = fn(P, { caption: label })
  return `<g class="home-module${index === active ? ' is-active' : ''}" data-index="${index}">${body}</g>`
}).join('')

const svg = k.figureSvg({
  width: W,
  height: H,
  label: 'CGArtLab 首页机座与装置',
  body: [chassisDefs(P), buildChassis(P, { labels: LABELS }), modules],
})

const css = readFileSync(join(ROOT, 'src', 'styles', 'home.css'), 'utf8')

const SITE_TOKENS = `
:root {
  --un-preset-theme-colors-background: 98% 0.012 85;
  --un-preset-theme-colors-primary: 25% 0.005 298;
  --un-preset-theme-colors-secondary: 40% 0.005 298;
  --un-preset-theme-colors-highlight: 41% 0.12 138;
  --un-preset-theme-font-family-sans: OPPOSans, ui-sans-serif, system-ui, sans-serif;
  --un-preset-theme-font-family-serif: STIX, EarlySummer, ui-serif, Georgia, serif;
}
html.dark {
  --un-preset-theme-colors-background: 22% 0.005 298;
  --un-preset-theme-colors-primary: 92% 0.005 298;
  --un-preset-theme-colors-secondary: 77% 0.005 298;
  --un-preset-theme-colors-highlight: 72% 0.14 138;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: oklch(var(--un-preset-theme-colors-background));
  color: oklch(var(--un-preset-theme-colors-primary));
  font-family: var(--un-preset-theme-font-family-sans);
}
main.home-stage { position: relative; width: min(760px, 96vw); height: auto; aspect-ratio: 760 / 620; }
main.home-stage .home-module { animation: none !important; }
main.home-stage .home-module.is-active { opacity: 1 !important; }
main.home-stage .home-module:not(.is-active) { display: none; }
`

const theme = process.argv.includes('--light') ? 'light' : 'dark'
const boxArg = process.argv.find((a) => a.startsWith('--box='))
const box = boxArg ? boxArg.slice(6).split(',').map(Number) : null
const camArg = process.argv.find((a) => a.startsWith('--cam='))
const cam = camArg ? camArg.slice(6).split(',').map(Number) : null
const camStyle = cam ? ` style="--cam-y:${cam[0]};--cam-x:${cam[1]}"` : ''
const fitted = box
  ? svg.replace(`viewBox="0 0 ${W} ${H}"`, `viewBox="${box[0]} ${box[1]} ${box[2]} ${box[3]}"`)
  : svg

const html = `<!doctype html>
<html lang="zh" class="${theme === 'dark' ? 'dark' : ''}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>home stage — ${theme}</title>
<style>${SITE_TOKENS}${css}</style>
</head>
<body><main class="home-stage"${camStyle}>${fitted}</main></body>
</html>`

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, `index-${theme}.html`), html)
console.log(`wrote index-${theme}.html  module=${active}  platform z=${PLATFORM_Z}`)
console.log(loaded.map((d) => `${d.file}: ${d.mod ? 'ok' : `MISSING (${d.error})`}`).join('\n'))
