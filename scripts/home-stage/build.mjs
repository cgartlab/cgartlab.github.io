import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../../src/lib/anatomy/iso-kit.mjs'
import {
  buildChassis,
  buildChannelOverlay,
  CABINET,
  chassisDefs,
  PLATFORM_Z,
  TOP,
} from '../../src/lib/home/chassis.mjs'
import { buildTypewriter, typewriterBounds } from '../../src/lib/home/typewriter.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const OUT = join(ROOT, '.temp', 'home-stage')

const W = 760
const H = 620
const LABELS = ['文章', '作品', '专栏', '资源', '标签', '关于', '搜索']

const bounds = [
  ...k.boxCorners(CABINET, -22, TOP),
  ...typewriterBounds(),
]
const P = k.fitProjection(bounds, W, H, { pad: 30, azimuth: 88, elevation: 18 })

const moduleGroup = `<g class="home-module" data-module="posts">${buildTypewriter(P, { title: '慢一点比较快：当执行变得廉价，判断力才是稀缺物' })}</g>`

const svg = k.figureSvg({
  width: W,
  height: H,
  label: 'CGArtLab 首页：一台铸铁控制台，升降台上是一台复古打字机，纸上打着最新的文章标题。',
  body: [
    chassisDefs(P),
    buildChassis(P, { labels: LABELS }),
    moduleGroup,
    buildChannelOverlay(P, { active: 0 }),
  ],
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
main { position: relative; width: min(760px, 96vw); aspect-ratio: 760 / 620; }
`

const theme = process.argv.includes('--light') ? 'light' : 'dark'
const boxArg = process.argv.find((a) => a.startsWith('--box='))
const box = boxArg ? boxArg.slice(6).split(',').map(Number) : null
const tiltArg = process.argv.find((a) => a.startsWith('--tilt='))
const tilt = tiltArg ? tiltArg.slice(7).split(',').map(Number) : null
const tiltStyle = tilt ? ` style="--tilt-y:${tilt[0]};--tilt-x:${tilt[1]}"` : ''
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
<body class="home-stage"${tiltStyle}><main>${fitted}</main></body>
</html>`

const tb = typewriterBounds().map((p) => k.iso(p, P))
const xs = tb.map((p) => p[0]); const ys = tb.map((p) => p[1])
const typewriterBox = [Math.floor(Math.min(...xs)) - 14, Math.floor(Math.min(...ys)) - 14, Math.ceil(Math.max(...xs) - Math.min(...xs)) + 28, Math.ceil(Math.max(...ys) - Math.min(...ys)) + 28]
console.log('typewriterBox', typewriterBox.join(','))

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, `index-${theme}.html`), html)
console.log(`wrote index-${theme}.html  (platform z=${PLATFORM_Z})`)
