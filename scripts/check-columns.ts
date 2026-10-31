/**
 * check-columns
 *
 * 校验 src/content/posts/column/ 下的每一期，三条硬要求：
 *
 *  1. 带专栏标签（「专栏」或「Journal」）—— 首页报架与 /column/ 都靠它列出
 *  2. abbrlink 能解析出期号（weekly-NN 或 column-NN）—— 报架与封面墙靠它显示 No.xx
 *  3. 同一语言内期号不重复
 *
 * 三条里任何一条不满足，那一期都会以「静默缺失」或「空白期号」的形式漏掉：构建通过、
 * CI 通过、页面上只是少了一期。2026-11-01 的 No.25 就是 tags 漏写 + abbrlink 写成
 * column-25 两条一起犯的，直到读者发现报架没更新才暴露。
 *
 * 使用：pnpm check-columns
 */

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const COLUMN_DIR = path.join(process.cwd(), 'src/content/posts/column')
const COLUMN_TAGS = ['专栏', 'Journal']
/** 期号：历史前缀 weekly-NN，栏目改名后新写的可能是 column-NN */
const ISSUE = /(?:weekly|column)-(\d+)/i

interface Frontmatter {
  title: string
  lang: string
  abbrlink: string
  tags: string[]
}

function unquote(value: string): string {
  return value.replace(/^['"]|['"]$/g, '').trim()
}

/** 只读本脚本关心的几个字段：够用，且不引入 YAML 依赖。 */
function parseFrontmatter(source: string): Frontmatter {
  const fm: Frontmatter = { title: '', lang: '', abbrlink: '', tags: [] }
  const block = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block)
    return fm

  let inTags = false
  for (const line of block[1].split(/\r?\n/)) {
    const text = line.trim()

    // 块状写法：
    //   tags:
    //     - 专栏
    if (inTags) {
      if (text.startsWith('-')) {
        fm.tags.push(unquote(text.slice(1)))
        continue
      }
      if (text)
        inTags = false
    }

    // 行内写法：tags: [] / tags: [专栏, Journal]
    if (text.startsWith('tags:')) {
      const rest = text.slice('tags:'.length).trim()
      if (!rest) {
        inTags = true
        continue
      }
      if (rest.startsWith('[') && rest.endsWith(']')) {
        fm.tags = rest.slice(1, -1).split(',').map(unquote).filter(Boolean)
        continue
      }
    }

    if (text.startsWith('abbrlink:'))
      fm.abbrlink = unquote(text.slice('abbrlink:'.length))
    else if (text.startsWith('lang:'))
      fm.lang = unquote(text.slice('lang:'.length))
    else if (text.startsWith('title:'))
      fm.title = unquote(text.slice('title:'.length))
  }

  return fm
}

const files = (await readdir(COLUMN_DIR)).filter(name => name.endsWith('.md')).sort()
const problems: string[] = []
const seen = new Map<string, string>()

for (const file of files) {
  const fm = parseFrontmatter(await readFile(path.join(COLUMN_DIR, file), 'utf8'))

  if (!fm.tags.some(tag => COLUMN_TAGS.includes(tag))) {
    problems.push(
      `${file}\n      缺少专栏标签：tags 里要有「专栏」或「Journal」，否则首页报架与 /column/ 都不会列出这一期`,
    )
  }

  const number = fm.abbrlink.match(ISSUE)?.[1] ?? ''
  if (!number) {
    problems.push(
      `${file}\n      abbrlink「${fm.abbrlink || '（空）'}」解析不出期号：要写成 weekly-25 或 column-25`,
    )
    continue
  }

  // 中英两版共用同一个 abbrlink，所以按语言分开查重
  const key = `${fm.lang || 'zh'}:${number}`
  const twin = seen.get(key)
  if (twin)
    problems.push(`${file}\n      期号 ${number} 与 ${twin} 重复`)
  else
    seen.set(key, file)
}

if (problems.length) {
  console.error(`✗ 专栏校验未通过（${problems.length} 处 / 共 ${files.length} 篇）：\n`)
  for (const problem of problems)
    console.error(`  - ${problem}\n`)
  process.exit(1)
}

console.log(`✓ 专栏校验通过：${files.length} 篇，${seen.size} 个期号，标签与期号齐全`)
