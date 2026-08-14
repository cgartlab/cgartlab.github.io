/**
 * sync-doc-facts
 *
 * 把核心文档中的关键数据抽象为「事实源 → 生成 → 注入」三明治，
 * 让文档数据自动跟随项目变动，不再手写维护（避免数字腐烂）。
 *
 * 数据源（单一事实源）：
 * - package.json     → 版本号、脚本列表
 * - astro.config.ts  → remark/rehype 插件管线
 * - 文件系统         → 文章/周刊统计
 *
 * 支持目标文档（marker 区块）：
 * - README.md
 * - AGENTS.md
 *
 * 使用（npm scripts 封装）：
 *   pnpm sync-docs           # 写入所有目标的标记区块
 *   pnpm sync-docs:check     # 校验区块是否最新（stale 则退出码 1，供 CI 使用）
 *   pnpm exec tsx scripts/sync-doc-facts.ts          # 只打印生成的数据块
 *
 * 标记区块格式：
 *   <!-- DOC-FACTS:START -->
 *   ... 自动生成内容 ...
 *   <!-- DOC-FACTS:END -->
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const MARKER_START = '<!-- DOC-FACTS:START -->'
const MARKER_END = '<!-- DOC-FACTS:END -->'

interface Target {
  file: string
  /** 区块不存在时，插入到该锚点之前（锚点须唯一） */
  anchor: string
}

const TARGETS: Target[] = [
  { file: 'README.md', anchor: '## 项目结构' },
  { file: 'AGENTS.md', anchor: '## ARCHITECTURE' },
]

interface Facts {
  astro: string
  typescript: string
  unocss: string
  pnpm: string
  node: string
  remarkCount: number
  rehypeCount: number
  total: number
  cn: number
  en: number
  weeklyIssues: number
  scripts: string[]
}

/** 递归收集指定扩展名的文件路径 */
async function walk(dir: string, ext: string): Promise<string[]> {
  let out: string[] = []
  try {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory())
        out = out.concat(await walk(full, ext))
      else if (entry.name.endsWith(ext))
        out.push(full)
    }
  }
  catch {
    /* 目录不存在时忽略 */
  }
  return out
}

/** 从 markdown 配置数组中统计插件数量（数组块内每行一个标识符） */
function countPlugins(astroCfg: string, key: string): number {
  const block = astroCfg.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\n\\s*\\],`))?.[1]
  if (!block)
    return 0
  const ids = block.match(/^\s*\[?([a-z]\w*)/gim) ?? []
  return ids.length
}

/** 从真实数据源提取事实 */
async function collectFacts(): Promise<Facts> {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'))
  const astroCfg = await readFile(path.join(ROOT, 'astro.config.ts'), 'utf8')

  const pick = (name: string) =>
    (pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? '').replace(/^[\^~]/, '')
  // Node 版本事实源：.github/workflows/ci.yml（无 .nvmrc / engines 字段）
  const ciYml = await readFile(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8')
  const node = ciYml.match(/node-version:\s*([\d.]+)/)?.[1] ?? '?'

  const remarkCount = countPlugins(astroCfg, 'remarkPlugins')
  const rehypeCount = countPlugins(astroCfg, 'rehypePlugins')

  const postsDir = path.join(ROOT, 'src/content/posts')
  const files = await walk(postsDir, '.md')
  const weeklyFiles = await walk(path.join(postsDir, 'weekly'), '.md')

  return {
    astro: pick('astro') || '?',
    typescript: pick('typescript') || '?',
    unocss: pick('unocss') || '?',
    pnpm: pkg.packageManager?.split('@')[1] ?? '?',
    node,
    remarkCount,
    rehypeCount,
    total: files.length,
    cn: files.filter(f => !f.endsWith('-en.md')).length,
    en: files.filter(f => f.endsWith('-en.md')).length,
    weeklyIssues: weeklyFiles.filter(f => !f.endsWith('-en.md')).length,
    scripts: Object.keys(pkg.scripts ?? {}).sort(),
  }
}

/** 渲染数据块 */
function renderBlock(f: Facts): string {
  return [
    MARKER_START,
    '> 自动生成数据（由 `pnpm sync-docs` 更新，勿手改）',
    '',
    `> 技术栈：Astro ${f.astro} · TypeScript ${f.typescript} · UnoCSS ${f.unocss} · pnpm ${f.pnpm} · Node ${f.node}`,
    `> 内容：${f.total} 个文章文件（${f.cn} 中文 + ${f.en} 英文），周刊 ${f.weeklyIssues} 期`,
    `> Markdown 管线：${f.remarkCount} remark + ${f.rehypeCount} rehype 插件`,
    `> 脚本：${f.scripts.length} 个（${f.scripts.join(' / ')}）`,
    MARKER_END,
  ].join('\n')
}

/** 用数据块替换/插入目标文档中的标记区块 */
function replaceMarked(content: string, block: string, anchor: string): string {
  const start = content.indexOf(MARKER_START)
  const end = content.indexOf(MARKER_END)
  if (start !== -1 && end !== -1) {
    return content.slice(0, start) + block + content.slice(end + MARKER_END.length)
  }
  const idx = content.indexOf(anchor)
  if (idx === -1)
    throw new Error(`未找到插入锚点: "${anchor}"`)
  return `${content.slice(0, idx)}${block}\n\n${content.slice(idx)}`
}

/** 提取现有区块（无则返回 null） */
function extractBlock(content: string): string | null {
  const start = content.indexOf(MARKER_START)
  const end = content.indexOf(MARKER_END)
  if (start === -1 || end === -1)
    return null
  return content.slice(start, end + MARKER_END.length)
}

async function main() {
  const mode = process.argv.includes('--check') ? 'check' : process.argv.includes('--write') ? 'write' : 'print'
  const facts = await collectFacts()
  const block = renderBlock(facts)

  // 合理性校验：插件计数为 0 或 Node 版本未知时，说明事实源解析可能失败
  // （如 astro.config.ts 格式化变更导致正则失配），避免文档静默显示错误数据
  if (facts.remarkCount === 0 || facts.rehypeCount === 0)
    console.error('[warn] remark/rehype 插件计数为 0 — 请检查 astro.config.ts 中插件数组格式是否变化')
  if (facts.node === '?')
    console.error('[warn] 未从 .github/workflows/ci.yml 解析到 node-version')

  if (mode === 'print') {
    console.log(block)
    console.log('\n--- 使用 `pnpm sync-docs` 写入 / `pnpm sync-docs:check` 校验 ---')
    return
  }

  let stale = false
  for (const target of TARGETS) {
    const filePath = path.join(ROOT, target.file)
    const content = await readFile(filePath, 'utf8')
    const current = extractBlock(content)

    if (mode === 'check') {
      if (current !== block) {
        stale = true
        console.error(`[stale] ${target.file} — 数据块过时，请运行 pnpm sync-docs`)
      }
      continue
    }

    const updated = replaceMarked(content, block, target.anchor)
    if (updated !== content) {
      await writeFile(filePath, updated, 'utf8')
      console.log(`已更新 ${target.file}`)
    }
    else {
      console.log(`无变化 ${target.file}（数据已最新）`)
    }
  }

  if (mode === 'check' && stale)
    process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
