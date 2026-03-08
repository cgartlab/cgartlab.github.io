#!/usr/bin/env tsx

import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
import MarkdownIt from 'markdown-it'
import { parse as parseHTML } from 'node-html-parser'
import { createWechatAPI, WechatAPIError } from '../src/utils/wechat/api.js'
import { isWechatSyncEnabled } from '../src/utils/wechat/config.js'
import {
  getSyncRecord,
  saveSyncRecord,
  getSyncStats,
  needsResync,
} from '../src/utils/wechat/state.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

try {
  const envPath = path.join(process.cwd(), '.env')
  const envContent = await fs.readFile(envPath, 'utf-8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0 && !key.trim().startsWith('#')) {
      const value = valueParts.join('=').trim()
      process.env[key.trim()] = value
    }
  }
}
catch {
  console.warn('未找到 .env 文件，将使用环境变量')
}

interface PostFrontmatter {
  title: string
  published: Date
  description?: string
  draft?: boolean
  tags?: string[]
}

interface SyncResult {
  slug: string
  title: string
  success: boolean
  error?: string
  publish_id?: string
  media_id?: string
}

interface SyncOptions {
  syncAll?: boolean
  recentDays?: number
  slugs?: string[]
  dryRun?: boolean
}

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

function parseFrontmatter(content: string): { frontmatter: PostFrontmatter; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    console.warn('Warning: Invalid frontmatter format, using empty frontmatter')
    return {
      frontmatter: {
        title: 'Untitled',
        published: new Date(),
        description: '',
        draft: false,
        tags: [],
      },
      body: content,
    }
  }

  const frontmatterStr = match[1]
  const body = match[2]

  const frontmatter: any = {
    title: 'Untitled',
    published: new Date(),
    description: '',
    draft: false,
    tags: [],
  }

  const lines = frontmatterStr.split('\n')
  let currentKey: string | null = null
  let multilineValue: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 检查是否是新的键值对
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) {
      // 可能是多行值的延续
      if (currentKey && line.trim().startsWith('-')) {
        // 列表项
        const listItem = line.trim().substring(1).trim()
        if (!frontmatter[currentKey]) {
          frontmatter[currentKey] = []
        }
        frontmatter[currentKey].push(listItem.replace(/^['"]|['"]$/g, ''))
      }
      else if (currentKey && line.trim() && !line.trim().startsWith('#')) {
        // 多行文本的延续
        multilineValue.push(line.trim())
      }
      continue
    }

    // 保存之前的多行值
    if (currentKey && multilineValue.length > 0) {
      frontmatter[currentKey] = multilineValue.join(' ')
      multilineValue = []
    }

    const key = line.substring(0, colonIndex).trim()
    let value = line.substring(colonIndex + 1).trim()

    if (!key) continue

    // 检查是否是列表的开始
    if (value === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
      currentKey = key
      frontmatter[key] = []
      continue
    }

    currentKey = key

    // 处理值
    value = value.replace(/^['"]|['"]$/g, '')

    if (key === 'published' || key === 'date') {
      const parsedDate = new Date(value)
      if (!isNaN(parsedDate.getTime())) {
        frontmatter.published = parsedDate
      }
    }
    else if (key === 'draft') {
      frontmatter.draft = value.toLowerCase() === 'true'
    }
    else if (key === 'tags') {
      // 如果 tags 在同一行已经有值
      if (value && value !== '[]') {
        const tagsStr = value.replace(/^\[|\]$/g, '')
        if (tagsStr.trim()) {
          frontmatter.tags = tagsStr.split(',').map((t: string) => t.trim().replace(/^['"]|['"]$/g, ''))
        }
      }
      // 否则等待后续列表项
    }
    else if (key === 'description' || key === 'desc') {
      frontmatter.description = value
    }
    else if (key === 'title') {
      frontmatter.title = value
    }
  }

  // 处理最后一个多行值
  if (currentKey && multilineValue.length > 0) {
    frontmatter[currentKey] = multilineValue.join(' ')
  }

  return { frontmatter, body }
}

async function extractCoverImage(html: string, slug: string): Promise<{
  imageBuffer: Buffer
  filename: string
  htmlWithoutCover: string
} | null> {
  const root = parseHTML(html)
  const firstImg = root.querySelector('img')

  if (!firstImg) {
    console.warn(`文章 ${slug} 没有找到封面图片，将使用默认图片`)
    return null
  }

  const imgSrc = firstImg.getAttribute('src')
  if (!imgSrc) {
    return null
  }

  try {
    let imageBuffer: Buffer
    let filename = `${slug}-cover.jpg`

    if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
      const response = await fetch(imgSrc)
      const arrayBuffer = await response.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }
    else if (imgSrc.startsWith('/')) {
      const imagePath = path.join(process.cwd(), 'dist', imgSrc)
      const imageData = await fs.readFile(imagePath)
      imageBuffer = Buffer.from(imageData)
    }
    else {
      console.warn(`不支持的图片路径：${imgSrc}`)
      return null
    }

    firstImg.remove()
    const htmlWithoutCover = root.toString()

    return {
      imageBuffer,
      filename,
      htmlWithoutCover,
    }
  }
  catch (error) {
    console.error(`提取封面图片失败：${error}`)
    return null
  }
}

function getDefaultCoverImage(): { imageBuffer: Buffer; filename: string } {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500">
    <rect width="900" height="500" fill="#4a90d9"/>
    <text x="450" y="250" text-anchor="middle" fill="white" font-size="48" font-family="Arial">
      尘光造梦
    </text>
  </svg>`

  return {
    imageBuffer: Buffer.from(svg),
    filename: 'default-cover.svg',
  }
}

function convertMarkdownToHtml(markdown: string): string {
  return md.render(markdown)
}

async function getPostFiles(postsDir: string): Promise<Array<{ slug: string; filePath: string }>> {
  const files: Array<{ slug: string; filePath: string }> = []

  async function scanDir(dir: string, baseSlug: string = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await scanDir(fullPath, baseSlug ? `${baseSlug}/${entry.name}` : entry.name)
      }
      else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const slug = baseSlug ? `${baseSlug}/${entry.name.replace(/\.(md|mdx)$/, '')}` : entry.name.replace(/\.(md|mdx)$/, '')
        const slugFromPath = path.relative(postsDir, fullPath).replace(/^(index\.)?(md|mdx)$/, '').replace(/\\/g, '/').replace(/\/index$/, '').replace(/\.mdx?$/, '')
        
        files.push({ 
          slug: slugFromPath, 
          filePath: fullPath,
        })
      }
    }
  }

  await scanDir(postsDir)
  return files
}

export async function syncPostToWechat(
  slug: string,
  options: { dryRun?: boolean; force?: boolean } = {},
): Promise<SyncResult> {
  if (!isWechatSyncEnabled()) {
    return {
      slug,
      title: slug,
      success: false,
      error: '微信公众号同步功能未启用',
    }
  }

  try {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts')
    const postFiles = await getPostFiles(postsDir)

    const postFile = postFiles.find(p => {
      const postSlug = p.slug
      // 精确匹配
      if (postSlug === slug) return true
      // 匹配 weekly/前缀
      if (postSlug === `weekly/${slug}`) return true
      // 匹配结尾（用于短 slug）
      if (postSlug.endsWith(`/${slug}`)) return true
      // 匹配文件名部分（不含路径）
      const fileName = postSlug.split('/').pop()
      if (fileName === slug) return true
      // 部分匹配（用于模糊搜索）
      if (postSlug.includes(slug)) return true
      
      return false
    })

    if (!postFile) {
      return {
        slug,
        title: slug,
        success: false,
        error: `未找到文章：${slug}`,
      }
    }

    const content = await fs.readFile(postFile.filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(content)

    if (frontmatter.draft) {
      return {
        slug,
        title: frontmatter.title,
        success: false,
        error: '草稿文章不同步',
      }
    }

    // 检查是否需要同步
    if (!options.force && !options.dryRun) {
      const existingRecord = await getSyncRecord(postFile.slug)
      if (existingRecord) {
        console.log(`文章已同步过：${frontmatter.title} (publish_id: ${existingRecord.publish_id})`)
        // 可以选择跳过或使用已有记录
        return {
          slug: postFile.slug,
          title: frontmatter.title,
          success: true,
          publish_id: existingRecord.publish_id,
          media_id: existingRecord.media_id,
        }
      }
    }

    console.log(`准备同步文章：${frontmatter.title}`)

    if (options.dryRun) {
      console.log(`[预演] 将同步文章：${frontmatter.title}`)
      return {
        slug,
        title: frontmatter.title,
        success: true,
      }
    }

    const html = convertMarkdownToHtml(body)
    const coverImage = await extractCoverImage(html, postFile.slug)

    const { imageBuffer, filename } = coverImage || getDefaultCoverImage()
    const contentHtml = coverImage ? coverImage.htmlWithoutCover : html

    const wechatApi = createWechatAPI()

    const result = await wechatApi.syncArticle(
      frontmatter.title,
      contentHtml,
      imageBuffer,
      filename,
      '尘光造梦',
      frontmatter.description || '',
    )

    // 保存同步记录
    await saveSyncRecord({
      slug: postFile.slug,
      title: frontmatter.title,
      media_id: result.media_id,
      publish_id: result.publish_id,
      syncedAt: new Date().toISOString(),
      status: result.status,
    })

    return {
      slug,
      title: frontmatter.title,
      success: true,
      publish_id: result.publish_id,
      media_id: result.media_id,
    }
  }
  catch (error) {
    console.error(`同步文章 ${slug} 失败:`, error)
    return {
      slug,
      title: slug,
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

export async function syncPostsToWechat(
  options: SyncOptions = {},
): Promise<SyncResult[]> {
  if (!isWechatSyncEnabled()) {
    console.warn('微信公众号同步功能未启用，跳过同步')
    return []
  }

  const { syncAll = false, recentDays = 7, slugs, dryRun = false } = options

  try {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts')
    let postFiles = await getPostFiles(postsDir)

    // 如果指定了 slugs，只同步这些文章
    if (slugs && slugs.length > 0) {
      postFiles = postFiles.filter(post => {
        return slugs.some(slug => {
          const postSlug = post.slug
          if (postSlug === slug) return true
          if (postSlug.endsWith(`/${slug}`)) return true
          const fileName = postSlug.split('/').pop()
          if (fileName === slug) return true
          return false
        })
      })
    }

    console.log(`找到 ${postFiles.length} 篇需要同步的文章`)

    const results: SyncResult[] = []
    const processedTitles = new Map<string, { slug: string; isChinese: boolean }>() // 用于去重，优先中文

    // 第一轮：收集所有文章，标记中英文
    const articlesToProcess: Array<{ 
      postFile: { slug: string; filePath: string }
      frontmatter: PostFrontmatter
      isChinese: boolean
    }> = []

    for (const postFile of postFiles) {
      const content = await fs.readFile(postFile.filePath, 'utf-8')
      const { frontmatter } = parseFrontmatter(content)

      // 跳过草稿
      if (frontmatter.draft) {
        continue
      }

      // 如果不是同步全部且没有时间范围限制，跳过旧文章
      if (!syncAll && slugs?.length === 0) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - recentDays)

        if (frontmatter.published < cutoffDate) {
          continue
        }
      }

      // 判断是否为中文
      const hasChineseChar = /[⼀ - 龟]/.test(frontmatter.title)
      articlesToProcess.push({
        postFile,
        frontmatter,
        isChinese: hasChineseChar,
      })
    }

    // 第二轮：按标题分组，优先选择中文版本
    const titleGroups = new Map<string, Array<typeof articlesToProcess[0]>>()
    for (const article of articlesToProcess) {
      // 使用英文标题作为 key（如果没有中文标题）
      const titleKey = article.isChinese ? article.frontmatter.title : article.frontmatter.title
      if (!titleGroups.has(titleKey)) {
        titleGroups.set(titleKey, [])
      }
      titleGroups.get(titleKey)!.push(article)
    }

    // 第三轮：处理每组文章，优先中文
    for (const [titleKey, articles] of titleGroups.entries()) {
      let selectedArticle = articles[0]
      
      if (articles.length > 1) {
        // 优先选择中文版本
        const chineseArticle = articles.find(a => a.isChinese)
        if (chineseArticle) {
          selectedArticle = chineseArticle
          console.log(`检测到多语言版本，优先选择中文：${titleKey}`)
        }
      }

      const result = await syncPostToWechat(selectedArticle.postFile.slug, { dryRun })
      results.push(result)

      if (result.success) {
        processedTitles.set(titleKey, { 
          slug: selectedArticle.postFile.slug, 
          isChinese: selectedArticle.isChinese 
        })
        console.log(`✓ 同步成功：${selectedArticle.frontmatter.title}`)
      }
      else {
        console.error(`✗ 同步失败：${selectedArticle.frontmatter.title} - ${result.error}`)
      }

      if (!dryRun) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`\n同步完成：${successCount} 成功，${failCount} 失败`)

    return results
  }
  catch (error) {
    console.error('批量同步失败:', error)
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
微信公众号文章同步工具

用法:
  pnpm sync-to-wechat [选项]

选项:
  --all          同步所有文章（默认只同步最近 7 天的文章）
  --recent <n>   同步最近 n 天的文章（默认：7）
  --post <slug>  同步指定文章（slug 为文章路径，不含.md 扩展名）
  --force        强制重新同步已同步过的文章
  --status       查看同步状态统计
  --dry-run      预演模式，不实际执行同步
  --help         显示此帮助信息

示例:
  pnpm sync-to-wechat                    # 同步最近 7 天的文章
  pnpm sync-to-wechat --all              # 同步所有文章
  pnpm sync-to-wechat --recent 30        # 同步最近 30 天的文章
  pnpm sync-to-wechat --post weekly-01   # 同步指定文章
  pnpm sync-to-wechat --status           # 查看同步状态
  pnpm sync-to-wechat --dry-run          # 预演模式

环境变量:
  WECHAT_APP_ID        微信公众号 AppID
  WECHAT_APP_SECRET    微信公众号 AppSecret
  WECHAT_SYNC_ENABLED  是否启用同步（true/false）
`)
    process.exit(0)
  }

  // 处理 --status 命令
  if (args.includes('--status')) {
    const stats = await getSyncStats()
    console.log('\n=== 微信公众号同步状态 ===')
    console.log(`总同步文章数：${stats.totalSynced} 篇`)
    console.log(`最后同步时间：${new Date(stats.lastSyncTime).toLocaleString('zh-CN')}`)
    
    if (stats.records.length > 0) {
      console.log('\n最近同步的文章:')
      stats.records
        .sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime())
        .slice(0, 10)
        .forEach(record => {
          console.log(`  - ${record.title}`)
          console.log(`    同步时间：${new Date(record.syncedAt).toLocaleString('zh-CN')}`)
          console.log(`    publish_id: ${record.publish_id}`)
          console.log()
        })
    }
    process.exit(0)
  }

  if (!isWechatSyncEnabled()) {
    console.error('错误：微信公众号同步功能未启用')
    console.error('请设置以下环境变量：')
    console.error('  WECHAT_APP_ID=<你的 AppID>')
    console.error('  WECHAT_APP_SECRET=<你的 AppSecret>')
    console.error('  WECHAT_SYNC_ENABLED=true')
    console.error('\n或者在 .env 文件中配置这些变量')
    process.exit(1)
  }

  const options: any = {
    all: args.includes('--all'),
    recent: parseInt(args.find((_, i) => args[i - 1] === '--recent') || '7', 10),
    post: args.find((_, i) => args[i - 1] === '--post'),
    'dry-run': args.includes('--dry-run'),
    force: args.includes('--force'),
  }

  console.log('=== 微信公众号文章同步工具 ===\n')

  if (options['dry-run']) {
    console.log('【预演模式】不会实际执行同步操作\n')
  }

  try {
    if (options.post) {
      console.log(`同步单篇文章：${options.post}`)
      const result = await syncPostToWechat(options.post, {
        dryRun: options['dry-run'],
        force: options.force,
      })

      if (result.success) {
        console.log(`✓ 同步成功：${result.title}`)
        if (result.publish_id) {
          console.log(`  publish_id: ${result.publish_id}`)
        }
      }
      else {
        console.error(`✗ 同步失败：${result.error}`)
        process.exit(1)
      }
    }
    else {
      console.log(`同步文章（最近 ${options.recent} 天${options.all ? '（全部）' : ''}）`)
      const results = await syncPostsToWechat({
        syncAll: options.all,
        recentDays: options.recent,
        dryRun: options['dry-run'],
        force: options.force,
      })

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      console.log(`\n=== 同步结果 ===`)
      console.log(`成功：${successCount} 篇`)
      console.log(`失败：${failCount} 篇`)

      if (failCount > 0) {
        console.log('\n失败详情:')
        results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(`  - ${r.title || r.slug}: ${r.error}`)
          })
      }

      if (failCount > 0) {
        process.exit(1)
      }
    }

    console.log('\n同步完成!')
  }
  catch (error) {
    console.error('同步过程发生错误:', error)
    process.exit(1)
  }
}

main()
