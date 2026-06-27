/**
 * rehype-glossary
 *
 * 遍历文章 AST，对每个文本节点扫描术语表，
 * 将首次出现（或每次出现，由 linkStrategy 决定）的术语包裹为
 * 指向维基百科的 <a class="wiki-link"> 链接。
 *
 * 跳过：
 * - <pre><code>、<code>（代码块）
 * - 已有 <a> 内的文本
 * - <h1>-<h6>（标题）
 * - 周刊文章（tags 含 '周刊' 或 'Weekly'）
 *
 * 样式继承普通链接（无 .wiki-link 专属 CSS）
 */

import { visit, SKIP } from 'unist-util-visit'
import { glossary } from '../data/glossary.ts'
import { getMatchCandidates, resolveLinkUrl } from '../utils/glossary.ts'
import type { TermEntry } from '../data/glossary.ts'
import type { Language } from '../i18n/config.ts'

interface Match {
  start: number
  end: number
  termId: string
  display: string
  href: string
}

type FragmentText = { type: 'text'; value: string }
type FragmentElement = { type: 'element'; tagName: string; properties: Record<string, any>; children: Array<{ type: 'text'; value: string }> }
type Fragment = FragmentText | FragmentElement

/**
 * 检测文章是否周刊
 */
function isWeeklyPost(frontmatter: any): boolean {
  const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : []
  return tags.some((t: any) => {
    if (typeof t !== 'string') return false
    const lower = t.toLowerCase()
    return lower === '周刊' || lower === 'weekly'
  })
}

/**
 * 为单个文本节点找出所有需要链接的位置
 */
function findTermMatches(text: string, activeTerms: TermEntry[], lang: Language, usedIds: Set<string>): Match[] {
  if (!text || text.length === 0) return []
  const matches: Match[] = []

  for (const entry of activeTerms) {
    // first-per-article 策略：已用过的术语跳过
    if (usedIds.has(entry.id)) continue
    const candidates = getMatchCandidates(entry, lang)
    for (const candidate of candidates) {
      if (!candidate || candidate.length === 0) continue
      const index = text.indexOf(candidate)
      if (index === -1) continue
      // 单词边界检查：英文/数字组成的术语要求 \b 边界
      const isAscii = /^[\x20-\x7E]+$/.test(candidate)
      if (isAscii) {
        const before = index > 0 ? text[index - 1] : ''
        const after = index + candidate.length < text.length ? text[index + candidate.length] : ''
        if (before && /[\w]/.test(before)) continue
        if (after && /[\w]/.test(after)) continue
      }
      matches.push({
        start: index,
        end: index + candidate.length,
        termId: entry.id,
        display: candidate,
        href: resolveLinkUrl(entry, lang),
      })
      // 找到第一个匹配后跳出（同一术语在单节点里只链接一次）
      break
    }
  }

  // 按 start 升序，重叠时保留前者
  matches.sort((a, b) => a.start - b.start)
  const nonOverlapping: Match[] = []
  let lastEnd = -1
  for (const m of matches) {
    if (m.start >= lastEnd) {
      nonOverlapping.push(m)
      lastEnd = m.end
    }
  }
  return nonOverlapping
}

/**
 * 将文本节点按 matches 拆分为 text 节点 + <a> 节点混合序列
 */
function splitIntoFragments(text: string, matches: Match[]): Fragment[] {
  if (matches.length === 0) return [{ type: 'text', value: text }]
  const fragments: Fragment[] = []
  let cursor = 0
  for (const m of matches) {
    if (m.start > cursor) {
      fragments.push({ type: 'text', value: text.slice(cursor, m.start) })
    }
    fragments.push({
      type: 'element',
      tagName: 'a',
      properties: {
        className: ['wiki-link'],
        href: m.href,
        dataUmamiEvent: 'wiki-term-click',
        dataUmamiEventTerm: m.termId,
      },
      children: [{ type: 'text', value: m.display }],
    })
    cursor = m.end
  }
  if (cursor < text.length) {
    fragments.push({ type: 'text', value: text.slice(cursor) })
  }
  return fragments
}

export function rehypeGlossary(): any {
  return (tree: any, vfile: any) => {
    const frontmatter = vfile?.data?.astro?.frontmatter ?? {}
    // 跳过周刊
    if (isWeeklyPost(frontmatter)) return
    const lang = vfile?.data?.glossaryLang ?? 'zh'

    // 一篇文章一个 Set 记录已链接术语（first-per-article）
    const usedIds = new Set<string>()

    visit(tree, (node: any, index: any, parent: any) => {
      if (!parent || index == null) return
      // 只处理 text 节点
      if (node.type !== 'text') return
      const parentTag = parent.tagName
      if (
        parentTag === 'code' ||
        parentTag === 'pre' ||
        parentTag === 'a' ||
        parentTag === 'script' ||
        parentTag === 'style' ||
        /^h[1-6]$/.test(parentTag) ||
        parentTag === 'input' ||
        parentTag === 'button' ||
        parentTag === 'select' ||
        parentTag === 'textarea'
      ) {
        return
      }

      const matches = findTermMatches(node.value, glossary, lang as Language, usedIds)
      if (matches.length === 0) return

      // 记录已用术语
      for (const m of matches) usedIds.add(m.termId)

      const fragments = splitIntoFragments(node.value, matches)
      const newChildren = fragments.map((frag) => {
        if (frag.type === 'text') {
          return { type: 'text' as const, value: frag.value }
        }
        return {
          type: 'element' as const,
          tagName: frag.tagName,
          properties: frag.properties,
          children: frag.children,
        }
      })

      // 替换原节点
      parent.children.splice(index, 1, ...newChildren)
      // 跳过新插入的节点，避免重复访问
      return [SKIP, index + newChildren.length]
    })
  }
}