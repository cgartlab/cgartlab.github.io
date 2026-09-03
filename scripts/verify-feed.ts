/**
 * 校验 RSS Feed 内容与实际发布的文章是否一致
 * 用法: pnpm verify-feed 或 tsx scripts/verify-feed.ts
 *
 * 注意: RSS Feed 默认只包含最新的 25 篇文章，因此"文章存在但 Feed 中缺失"
 * 不是问题。只有"Feed 中存在但文章已删除"才是真正的数据不一致问题。
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import glob from 'fast-glob'

interface Discrepancy {
  type: 'missing_in_posts'
  slug: string
  title?: string
}

interface FeedItem {
  link: string
  title: string
}

interface PostFrontmatterPartial {
  title?: string
  published?: string
  draft?: boolean
  abbrlink?: string
}

interface PostMeta {
  slug: string
  title: string
}

async function parseRssFeed(xmlPath: string): Promise<FeedItem[]> {
  const content = await fs.readFile(xmlPath, 'utf-8')
  const items: FeedItem[] = []

  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while (true) {
    match = itemRegex.exec(content)
    if (!match)
      break
    const itemContent = match[1]
    const linkMatch = itemContent.match(/<link>([^<]*)<\/link>/)
    const titleMatch = itemContent.match(/<title><!\[CDATA\[([^\]]*)\]\]><\/title>/)
      || itemContent.match(/<title>([^<]*)<\/title>/)

    if (linkMatch) {
      items.push({
        link: linkMatch[1].trim().replace(/\/$/, ''),
        title: titleMatch ? titleMatch[1].trim() : '',
      })
    }
  }

  return items
}

async function getPublishedPosts(contentDir: string): Promise<PostMeta[]> {
  const files = await glob('**/*.md', {
    cwd: contentDir,
    ignore: ['_images/**', '_files/**', '**/_*/**'],
  })

  const posts: PostMeta[] = []

  for (const file of files) {
    try {
      const filePath = path.join(contentDir, file)
      const content = await fs.readFile(filePath, 'utf-8')

      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatterMatch)
        continue

      const fmContent = frontmatterMatch[1]
      const frontmatter: PostFrontmatterPartial = {}

      for (const line of fmContent.split('\n')) {
        const colonIndex = line.indexOf(':')
        if (colonIndex === -1)
          continue

        const key = line.slice(0, colonIndex).trim()
        let value = line.slice(colonIndex + 1).trim()

        if ((value.startsWith('"') && value.endsWith('"'))
          || (value.startsWith('\'') && value.endsWith('\''))) {
          value = value.slice(1, -1)
        }

        if (key === 'title')
          frontmatter.title = value
        else if (key === 'published')
          frontmatter.published = value
        else if (key === 'draft')
          frontmatter.draft = value === 'true'
        else if (key === 'abbrlink')
          frontmatter.abbrlink = value // Fixed: was 'abrlink'
      }

      if (frontmatter.draft)
        continue

      let slug = path.basename(file, path.extname(file))
      if (frontmatter.abbrlink)
        slug = frontmatter.abbrlink

      posts.push({ slug, title: frontmatter.title ?? slug })
    }
    catch {
      // Skip files that can't be read
    }
  }

  return posts
}

function extractSlugFromUrl(url: string): string {
  const match = url.match(/\/posts\/([^/]+)\/?$/)
  return match ? match[1] : ''
}

async function verifyFeedConsistency(feedPath: string): Promise<{
  feedItems: FeedItem[]
  postSlugs: Set<string>
  discrepancies: Discrepancy[]
}> {
  const contentDir = 'src/content/posts'

  try {
    await fs.access(feedPath)
  }
  catch {
    console.warn(`⚠️  RSS Feed 文件不存在，跳过校验: ${feedPath}`)
    return { feedItems: [], postSlugs: new Set(), discrepancies: [] }
  }

  const feedItems = await parseRssFeed(feedPath)
  const feedSlugs = feedItems.map(item => extractSlugFromUrl(item.link)).filter(Boolean)

  const posts = await getPublishedPosts(contentDir)
  const postSlugs = new Set(posts.map(p => p.slug))

  const discrepancies: Discrepancy[] = []

  // Only report truly problematic cases: deleted posts still in feed
  for (const slug of feedSlugs) {
    if (!postSlugs.has(slug)) {
      const item = feedItems.find(i => extractSlugFromUrl(i.link) === slug)
      discrepancies.push({
        type: 'missing_in_posts',
        slug,
        title: item?.title,
      })
    }
  }

  return { feedItems, postSlugs, discrepancies }
}

function printReport(result: Awaited<ReturnType<typeof verifyFeedConsistency>>, label: string): void {
  const { feedItems, postSlugs, discrepancies } = result

  console.log(`\n📋 ${label} 校验报告`)
  console.log('='.repeat(50))
  console.log(`📬 Feed 条目数: ${feedItems.length}`)
  console.log(`📝 已发布文章数: ${postSlugs.size}`)
  console.log(`📌 Feed 限制: 最多显示 25 篇最新文章`)

  if (discrepancies.length === 0) {
    console.log(`\n✅ ${label} 内容与已发布文章完全一致！`)
    return
  }

  console.log(`\n🔴 ${label} 发现 ${discrepancies.length} 个问题:`)

  for (const item of discrepancies) {
    console.log(`   ⚠️  ${item.slug}${item.title ? ` (${item.title})` : ''} — 已删除但仍在 Feed 中`)
  }
}

async function main() {
  console.log('🔍 开始校验 RSS Feed...')

  const feedChecks = [
    { path: path.join('dist', 'rss.xml'), label: 'RSS Feed (zh)' },
    { path: path.join('dist', 'en', 'rss.xml'), label: 'RSS Feed (en)' },
  ]

  let hasDiscrepancy = false

  try {
    for (const { path: feedPath, label } of feedChecks) {
      const result = await verifyFeedConsistency(feedPath)
      printReport(result, label)

      if (result.discrepancies.length > 0) {
        console.log('\n💡 提示: 重新构建网站以更新 Feed')
        hasDiscrepancy = true
      }
    }

    if (hasDiscrepancy) {
      process.exit(1)
    }
  }
  catch (error) {
    console.error('❌ 校验失败:', error)
    process.exit(1)
  }
}

main()
