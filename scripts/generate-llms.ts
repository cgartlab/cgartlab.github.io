/**
 * 自动生成 llms.txt 文件
 * 遵循 llmstxt.org 规范
 * 使用：pnpm build（自动调用）
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const SITE_URL = 'https://cgartlab.com'
const OUTPUT_PATH = 'public/llms.txt'

interface Frontmatter {
  title: string
  published: string
  description: string
  tags: string[]
  draft: boolean
  lang: string
  abbrlink: string
}

interface Post {
  frontmatter: Frontmatter
  isWeekly: boolean
  isEnglish: boolean
  slug: string
}

function parseFrontmatter(content: string): Frontmatter {
  const lines = content.split('\n')
  let inFm = false
  const fm: Frontmatter = {
    title: '',
    published: '',
    description: '',
    tags: [],
    draft: false,
    lang: '',
    abbrlink: '',
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '---') {
      inFm = !inFm
      continue
    }
    if (!inFm)
      break
    if (trimmed.startsWith('title:')) {
      fm.title = trimmed.slice(6).replace(/^["']|["']$/g, '').trim()
    }
    else if (trimmed.startsWith('published:')) {
      fm.published = trimmed.slice(10).trim()
    }
    else if (trimmed.startsWith('description:')) {
      fm.description = trimmed.slice(12).replace(/^["']|["']$/g, '').trim()
    }
    else if (trimmed.startsWith('draft:')) {
      fm.draft = trimmed.slice(6).trim() === 'true'
    }
    else if (trimmed.startsWith('lang:')) {
      fm.lang = trimmed.slice(5).replace(/^["']|["']$/g, '').trim()
    }
    else if (trimmed.startsWith('abbrlink:')) {
      fm.abbrlink = trimmed.slice(9).replace(/^["']|["']$/g, '').trim()
    }
    else if (trimmed.startsWith('- ')) {
      const tag = trimmed.slice(2).replace(/^"|"$/g, '').trim()
      if (tag)
        fm.tags.push(tag)
    }
  }

  return fm
}

async function scanDir(dir: string, isWeekly: boolean): Promise<Post[]> {
  const posts: Post[] = []

  try {
    const entries = await readdir(dir)
    for (const entry of entries) {
      if (!entry.endsWith('.md'))
        continue

      const filePath = path.join(dir, entry)
      const content = await readFile(filePath, 'utf-8')
      const fm = parseFrontmatter(content)

      if (!fm.title || fm.draft)
        continue

      const isEnglish = fm.lang === 'en' || entry.endsWith('-en.md')
      const slug = entry.replace('.md', '').replace('-en.md', '')

      posts.push({
        frontmatter: fm,
        isWeekly,
        isEnglish,
        slug,
      })
    }
  }
  catch {
    // ignore
  }

  return posts
}

function generateUrl(post: Post): string {
  const langPrefix = post.isEnglish ? '/en' : '/zh'
  const type = post.isWeekly ? 'weekly' : 'posts'
  const slug = post.frontmatter.abbrlink || post.slug
  return `${SITE_URL}${langPrefix}/${type}/${slug}`
}

async function main() {
  console.log('🔍 正在生成 llms.txt...')

  const cwd = process.cwd()
  const postsDir = path.join(cwd, 'src/content/posts')
  const weeklyDir = path.join(cwd, 'src/content/posts/weekly')

  const allPosts = [
    ...await scanDir(postsDir, false),
    ...await scanDir(weeklyDir, true),
  ]

  allPosts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.published).getTime()
    const dateB = new Date(b.frontmatter.published).getTime()
    return dateB - dateA
  })

  console.log(`📦 找到 ${allPosts.length} 篇文章`)

  const chinesePosts = allPosts.filter(p => !p.isEnglish)
  const englishPosts = allPosts.filter(p => p.isEnglish)

  const chineseArticles = chinesePosts.filter(p => !p.isWeekly)
  const chineseWeekly = chinesePosts.filter(p => p.isWeekly)
  const englishArticles = englishPosts.filter(p => !p.isWeekly)
  const englishWeekly = englishPosts.filter(p => p.isWeekly)

  let output = `# CG艺术实验室

> 专注于数字艺术、动态视觉设计、技术分享和知识管理的创意工作室。

`

  if (chineseArticles.length > 0) {
    output += `## 近期文章

`
    for (const post of chineseArticles.slice(0, 20)) {
      output += `- [${post.frontmatter.title}](${generateUrl(post)}): ${post.frontmatter.description}
`
    }
  }

  if (chineseWeekly.length > 0) {
    output += `
## 玄光周刊

`
    for (const post of chineseWeekly) {
      output += `- [${post.frontmatter.title}](${generateUrl(post)}): ${post.frontmatter.description}
`
    }
  }

  if (englishArticles.length > 0) {
    output += `
## English Articles

`
    for (const post of englishArticles.slice(0, 20)) {
      output += `- [${post.frontmatter.title}](${generateUrl(post)}): ${post.frontmatter.description}
`
    }
  }

  if (englishWeekly.length > 0) {
    output += `
## Weekly Newsletter

`
    for (const post of englishWeekly) {
      output += `- [${post.frontmatter.title}](${generateUrl(post)}): ${post.frontmatter.description}
`
    }
  }

  await writeFile(OUTPUT_PATH, output, 'utf-8')
  console.log(`✅ 已生成 ${OUTPUT_PATH}`)
}

main().catch(console.error)
