import { getCollection, type CollectionEntry } from 'astro:content'
import { createWechatAPI, WechatAPIError } from './api'
import { isWechatSyncEnabled } from './config'
import MarkdownIt from 'markdown-it'
import { parse as parseHTML } from 'node-html-parser'

interface SyncResult {
  slug: string
  title: string
  success: boolean
  error?: string
  publish_id?: string
  media_id?: string
}

export interface SyncOptions {
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
      const fs = await import('fs/promises')
      const path = await import('path')
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

export async function syncPostToWechat(
  slug: string,
  options: { dryRun?: boolean } = {},
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
    const posts = await getCollection('posts', ({ id }) => {
      const postSlug = id.replace(/\.mdx?$/, '')
      return postSlug === slug || postSlug === `weekly/${slug}`
    })

    if (posts.length === 0) {
      return {
        slug,
        title: slug,
        success: false,
        error: `未找到文章：${slug}`,
      }
    }

    const post = posts[0] as CollectionEntry<'posts'>
    const { data, body } = post

    if (data.draft) {
      return {
        slug,
        title: data.title,
        success: false,
        error: '草稿文章不同步',
      }
    }

    console.log(`准备同步文章：${data.title}`)

    if (options.dryRun) {
      console.log(`[预演] 将同步文章：${data.title}`)
      return {
        slug,
        title: data.title,
        success: true,
      }
    }

    const html = convertMarkdownToHtml(body)
    const coverImage = await extractCoverImage(html, slug)

    const { imageBuffer, filename } = coverImage || getDefaultCoverImage()
    const contentHtml = coverImage ? coverImage.htmlWithoutCover : html

    const wechatApi = createWechatAPI()

    const result = await wechatApi.syncArticle(
      data.title,
      contentHtml,
      imageBuffer,
      filename,
      '尘光造梦',
      data.description,
    )

    return {
      slug,
      title: data.title,
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
    let posts = await getCollection('posts')

    posts = posts.filter(post => !post.data.draft)

    if (slugs && slugs.length > 0) {
      posts = posts.filter(post => {
        const postSlug = post.id.replace(/\.mdx?$/, '')
        return slugs.some(slug => postSlug === slug || postSlug.startsWith(`${slug}/`))
      })
    }
    else if (!syncAll) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - recentDays)

      posts = posts.filter(post => post.data.published >= cutoffDate)
    }

    console.log(`找到 ${posts.length} 篇需要同步的文章`)

    const results: SyncResult[] = []

    for (const post of posts) {
      const slug = post.id.replace(/\.mdx?$/, '')
      const result = await syncPostToWechat(slug, { dryRun })
      results.push(result)

      if (result.success) {
        console.log(`✓ 同步成功：${post.data.title}`)
      }
      else {
        console.error(`✗ 同步失败：${post.data.title} - ${result.error}`)
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
