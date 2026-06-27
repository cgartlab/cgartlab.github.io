/**
 * audit-glossary
 *
 * 扫描所有文章，发现高频未收录术语，输出审计报告
 * 使用：pnpm exec tsx scripts/audit-glossary.ts
 */

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts')

interface Frontmatter {
  title: string
  draft: boolean
  lang: string
  tags: string[]
}

function parseFrontmatter(content: string): Frontmatter {
  const lines = content.split('\n')
  let inFm = false
  const fm: Frontmatter = { title: '', draft: false, lang: '', tags: [] }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '---') {
      if (!inFm) { inFm = true; continue }
      break
    }
    if (!inFm) continue
    if (trimmed.startsWith('title:')) {
      fm.title = trimmed.slice(6).replace(/^["']|["']$/g, '').trim()
    } else if (trimmed.startsWith('draft:')) {
      fm.draft = trimmed.slice(6).trim() === 'true'
    } else if (trimmed.startsWith('lang:')) {
      fm.lang = trimmed.slice(5).replace(/^["']|["']$/g, '').trim()
    } else if (trimmed.startsWith('- ')) {
      const tag = trimmed.slice(2).replace(/^"|"$/g, '').trim()
      if (tag) fm.tags.push(tag)
    }
  }
  return fm
}

// 已有术语的所有匹配形式（term + aliases）
// 手动维护，与 src/data/glossary.ts 保持同步
function getExistingTerms(): Set<string> {
  // prettier-ignore
  const entries: Array<{ term: string; aliases?: string[] }> = [
    { term: 'RSS', aliases: ['Really Simple Syndication', 'Rich Site Summary'] },
    { term: 'XML', aliases: ['Extensible Markup Language'] },
    { term: 'Git' }, { term: 'Docker' }, { term: 'winget', aliases: ['Windows Package Manager'] },
    { term: 'API', aliases: ['Application Programming Interface', 'application programming interface'] },
    { term: '代理', aliases: ['Proxy server', 'proxy server'] },
    { term: '私有云', aliases: ['Private cloud'] },
    { term: '终端', aliases: ['Terminal emulator', 'terminal'] },
    { term: 'RAID' },
    { term: 'macOS' }, { term: 'Windows' }, { term: 'Linux' }, { term: 'GitHub' },
    { term: 'Markdown' },
    { term: 'NAS', aliases: ['网络附加存储', 'Network-attached storage', 'network-attached storage'] },
    { term: 'DNS' }, { term: 'SSH' }, { term: 'HTTP' },
    { term: 'AI', aliases: ['人工智能', 'Artificial intelligence', 'artificial intelligence', '人工智慧'] },
    { term: 'WordPress' }, { term: 'Telegram' }, { term: 'Photoshop' }, { term: 'Cloudflare' },
    { term: 'Notion' }, { term: 'Obsidian' },
    { term: '印象笔记', aliases: ['Evernote'] },
    { term: '印象派', aliases: ['Impressionism'] },
    { term: 'AppleScript' }, { term: 'Procreate' },
  ]
  const terms = new Set<string>()
  for (const entry of entries) {
    terms.add(entry.term)
    if (entry.aliases) for (const a of entry.aliases) terms.add(a)
  }
  return terms
}

const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'is', 'it', 'of', 'in', 'to', 'and', 'or', 'for',
  'on', 'at', 'by', 'with', 'from', 'as', 'be', 'are', 'was', 'were',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'not',
  'no', 'but', 'if', 'so', 'than', 'that', 'this', 'these', 'those',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'only', 'own', 'same', 'too', 'very', 'just',
  'also', 'well', 'now', 'then', 'here', 'there', 'when', 'where',
  'why', 'how', 'what', 'which', 'who', 'whom', 'i', 'my', 'me',
  'we', 'our', 'us', 'you', 'your', 'he', 'him', 'his', 'she',
  'her', 'it', 'its', 'they', 'them', 'their', 'one', 'two',
  'new', 'like', 'use', 'used', 'using', 'make', 'made', 'get',
  'got', 'see', 'seen', 'know', 'known', 'time', 'way', 'work',
])

function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word.toLowerCase())
}

function extractCandidates(body: string): Map<string, number> {
  const freq = new Map<string, number>()

  // 大写首字母英文词（如 Notion, Obsidian, Docker, ChatGPT）
  const capWords = body.match(/\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?\b/g) || []
  for (const w of capWords) {
    if (!isCommonWord(w)) freq.set(w, (freq.get(w) || 0) + 1)
  }

  // 全大写缩写（如 CSS, HTML, DNS, SSH）
  const acronyms = body.match(/\b[A-Z]{2,}\b/g) || []
  for (const w of acronyms) {
    if (!isCommonWord(w)) freq.set(w, (freq.get(w) || 0) + 1)
  }

  // 中英文混合产品名（如 macOS, iOS, iPhone, iPad）
  const mixed = body.match(/\b[a-z]+[A-Z][a-zA-Z]{1,}\b/g) || []
  for (const w of mixed) {
    if (!isCommonWord(w)) freq.set(w, (freq.get(w) || 0) + 1)
  }

  // 数字 + 英文（如 C4D）
  const numWords = body.match(/\b[A-Za-z]+\d[A-Za-z0-9]*\b/g) || []
  for (const w of numWords) freq.set(w, (freq.get(w) || 0) + 1)

  return freq
}

interface ArticleInfo {
  title: string
  slug: string
  isWeekly: boolean
}

async function scanDir(dir: string, isWeekly: boolean): Promise<Map<string, ArticleInfo[]>> {
  const termArticles = new Map<string, ArticleInfo[]>()

  try {
    const entries = await readdir(dir)
    for (const entry of entries) {
      if (!entry.endsWith('.md') && !entry.endsWith('.mdx')) continue
      const filePath = path.join(dir, entry)
      const content = await readFile(filePath, 'utf-8')
      const fm = parseFrontmatter(content)
      if (!fm.title || fm.draft) continue

      const slug = entry.replace(/\.(md|mdx)$/, '').replace('-en.md', '').replace('-en.mdx', '')
      const body = content.replace(/---[\s\S]*?---/, '').trim()
      const candidates = extractCandidates(body)

      for (const [term] of candidates) {
        if (!termArticles.has(term)) termArticles.set(term, [])
        termArticles.get(term)!.push({ title: fm.title, slug, isWeekly })
      }
    }
  } catch { /* ignore */ }

  return termArticles
}

async function main() {
  console.log('正在扫描文章...')

  const [mainArticles, weeklyArticles] = await Promise.all([
    scanDir(POSTS_DIR, false),
    scanDir(path.join(POSTS_DIR, 'weekly'), true),
  ])

  // 合并
  const allTermArticles = new Map<string, ArticleInfo[]>()
  for (const [term, articles] of mainArticles) {
    allTermArticles.set(term, articles)
  }
  for (const [term, articles] of weeklyArticles) {
    if (allTermArticles.has(term)) {
      allTermArticles.get(term)!.push(...articles)
    } else {
      allTermArticles.set(term, articles)
    }
  }

  // 过滤太短的（<3次）和已收录的
  const existingTerms = getExistingTerms()
  const candidates = [...allTermArticles.entries()]
    .filter(([term, articles]) => {
      if (term.length < 2) return false
      if (existingTerms.has(term)) return false
      // 排除常见英文单词、单字母等
      if (/^[A-Z][a-z]{0,2}$/.test(term) && !isCommonWord(term) && term.length <= 2) return false
      return articles.length >= 2 // 至少出现 2 篇文章
    })
    .sort((a, b) => b[1].length - a[1].length)

  console.log(`\n=== 审计报告：未收录术语候选（${candidates.length} 个）===\n`)
  for (const [term, articles] of candidates) {
    const uniqueSlugs = [...new Set(articles.map(a => a.slug))]
    console.log(`  ${term} (${articles.length}次) → ${uniqueSlugs.slice(0, 5).join(', ')}${uniqueSlugs.length > 5 ? '...' : ''}`)
  }

  console.log(`\n总文章数: ${[...allTermArticles.values()].flat().length / [...allTermArticles.keys()].length || 0}`)
}

main().catch(console.error)