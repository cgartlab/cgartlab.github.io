/**
 * 自动生成 llms.txt 文件
 * 遵循 llmstxt.org 规范
 * 使用：pnpm build（自动调用）
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const SITE_URL = 'https://cgartlab.com'
// public/ 供 git 展示；dist/ 是部署产物（astro build 后运行，public 不会再被拷进 dist）
const OUTPUT_PATHS = ['public/llms.txt', 'dist/llms.txt']

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
  // zh 是默认语言，无 URL 前缀（不能用 /zh/）；weekly 文章走 /posts/weekly-XX/ 路由（无 /weekly/ 单篇路由）
  const langPrefix = post.isEnglish ? '/en' : ''
  const slug = post.frontmatter.abbrlink || post.slug
  return `${SITE_URL}${langPrefix}/posts/${slug}/`
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

  let output = `# CG艺术实验室

> 专注于数字艺术、动态视觉设计，技术分享和知识管理的创意工作室。

`

  if (chinesePosts.length > 0) {
    output += `## 近期文章

`
    for (const post of chinesePosts.slice(0, 30)) {
      output += `- [${post.frontmatter.title}](${generateUrl(post)}): ${post.frontmatter.description}
`
    }
  }

  if (englishPosts.length > 0) {
    output += `
## English Articles

`
    for (const post of englishPosts.slice(0, 30)) {
      output += `- [${post.frontmatter.title}](${generateUrl(post)}): ${post.frontmatter.description}
`
    }
  }

  for (const outputPath of OUTPUT_PATHS) {
    // dist/ 只在 astro build 后存在；单独运行本脚本时跳过 dist 写入
    const dir = path.dirname(outputPath)
    if (dir === 'dist' && !existsSync(dir))
      continue
    await writeFile(outputPath, output, 'utf-8')
    console.log(`✅ 已生成 ${outputPath}`)
  }
}

main().catch(console.error)
