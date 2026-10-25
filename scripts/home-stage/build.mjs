import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../../src/lib/anatomy/iso-kit.mjs'
import { buildChassis, CABINET, chassisDefs, PLATFORM_Z, TOP } from '../../src/lib/home/chassis.mjs'
import { buildPlaceholder, placeholderBounds } from '../../src/lib/home/placeholder.mjs'
import { buildNewsrack, newsrackBounds } from '../../src/lib/home/newsrack.mjs'
import { buildTypewriter, typewriterBounds } from '../../src/lib/home/typewriter.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const OUT = join(ROOT, '.temp', 'home-stage')

const W = 760
const H = 620
const LABELS = ['文章', '作品', '专栏', '资源', '标签', '关于', '搜索']
const LETTERS = ['文', '作', '专', '资', '标', '关', '搜']

const bounds = [
  ...k.boxCorners(CABINET, -22, TOP),
  ...typewriterBounds(),
  ...placeholderBounds(),
  ...newsrackBounds(),
]
const P = k.fitProjection(bounds, W, H, { pad: 30, azimuth: 88, elevation: 18, focal: 1200, center: [0, 0, 55] })

const ISSUES = ['16', '15', '14', '13', '12', '11'].map((n, i) => ({
  number: `No.${n}`,
  label: `No.${n}`,
  href: '#',
}))

const activeArg = process.argv.find((a) => a.startsWith('--module='))
const active = activeArg ? Number(activeArg.slice(9)) : 0

const modules = LABELS.map((label, index) => {
  const body = index === 0
    ? buildTypewriter(P, { title: '慢一点比较快：当执行变得廉价，判断力才是稀缺物' })
    : index === 2
      ? buildNewsrack(P, { issues: ISSUES })
      : buildPlaceholder(P, { letter: LETTERS[index], caption: label, index })
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
