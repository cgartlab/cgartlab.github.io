import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = join(process.cwd(), 'dist/_astro')

function fail(msg) {
  console.error('\n  \u2717 构建验证失败: ' + msg)
  process.exit(1)
}

function ok(msg) {
  console.log('  \u2705 ' + msg)
}

async function main() {
  console.log('\n  \u{1F50D} 验证构建产物...\n')

  // 1. Find Layout CSS
  const files = readdirSync(distDir).filter(f => f.startsWith('Layout.') && f.endsWith('.css'))
  if (!files.length) fail('在 dist/_astro 中未找到 Layout CSS 文件')
  ok('找到布局 CSS: ' + files[0])

  const cssPath = join(distDir, files[0])
  const css = readFileSync(cssPath, 'utf-8')

  // 2. Check responsive injection marker
  if (!css.includes('unocss-responsive-injection'))
    fail('缺少 unocss-responsive-injection 标记 - generate-responsive.mjs 未执行')
  ok('unocss-responsive-injection 标记存在')

  // 3. Check desktop layout injection marker
  if (!css.includes('desktop-layout-injected'))
    fail('缺少 desktop-layout-injected 标记 - inject-desktop-layout.ts 未执行')
  ok('desktop-layout-injected 标记存在')

  // 4. Check search overlay styles
  if (!/\.search-overlay\s*\{/.test(css))
    fail('缺少 .search-overlay{} 样式')
  ok('搜索样式存在 (.search-overlay)')

  // 5. Check responsive @media rules
  const mediaCount = (css.match(/@media\s*\(min-width/g) || []).length
  if (mediaCount === 0)
    fail('缺少响应式 @media 规则')
  ok('响应式 @media 规则: ' + mediaCount + ' 条')

  // 6. Check desktop layout rules (attribute selectors)
  const desktopRules = [
    ['uno-desktop-column', '[class*="lg:uno-desktop-column"]'],
    ['fixed', '[class*="lg:fixed"]'],
    ['hidden', '[class*="lg:hidden"]'],
  ]
  for (const [name, selector] of desktopRules) {
    if (!css.includes(selector))
      fail('缺少桌面布局规则: ' + name)
  }
  ok('桌面布局规则完整 (' + desktopRules.length + '/' + desktopRules.length + ')')

  console.log('\n  \u2705 构建验证通过\n')
}

main().catch(e => { console.error(e); process.exit(1) })
