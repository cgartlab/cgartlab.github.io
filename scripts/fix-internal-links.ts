/**
 * 修复文章内存在的站内文章链接
 * 使用方式: pnpm fix-internal-links
 * 
 * 该脚本会扫描src/content/posts/目录下的所有Markdown文件，
 * 查找并修复指向站内文章的链接，使用正确的abbrlink格式
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'

// 配置
const CONFIG = {
  POSTS_DIR: 'src/content/posts',
  MARKDOWN_EXTENSIONS: ['src/content/posts/**/*.md'],
  EXCLUDE_PATTERNS: ['!**/node_modules/**', '!**/.git/**', '!**/.astro/**'],
  MAX_DISPLAY_CHANGES: 10
} as const

interface PostInfo {
  filePath: string
  slug: string
  abbrlink?: string
  title: string
  lang?: string
}

interface LinkFixResult {
  filePath: string
  changed: boolean
  originalContent: string
  fixedContent: string
  changes: Array<{
    original: string
    fixed: string
    line: number
  }>
}

interface MarkdownContent {
  frontmatter: string
  body: string
  hasFrontmatter: boolean
}

/**
 * 将Markdown内容分割为前置事项和正文
 */
function splitContent(content: string): MarkdownContent {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/m)
  if (!match) {
    return {
      frontmatter: '',
      body: content,
      hasFrontmatter: false,
    }
  }

  return {
    frontmatter: match[1],
    body: match[2],
    hasFrontmatter: true,
  }
}

/**
 * 解析前置事项
 */
function parseFrontmatter(frontmatter: string): Record<string, any> {
  const data: Record<string, any> = {}
  const lines = frontmatter.split('\n')
  
  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      data[key] = value
    }
  }
  
  return data
}

/**
 * 获取所有文章的信息
 */
async function getAllPosts(): Promise<PostInfo[]> {
  const postFiles = await fg(CONFIG.MARKDOWN_EXTENSIONS, {
    cwd: process.cwd(),
    absolute: true,
    ignore: CONFIG.EXCLUDE_PATTERNS
  })

  const posts: PostInfo[] = []

  for (const filePath of postFiles) {
    try {
      const content = await readFile(filePath, 'utf8')
      const { frontmatter } = splitContent(content)
      const data = parseFrontmatter(frontmatter)
      
      const relativePath = path.relative(CONFIG.POSTS_DIR, filePath)
      const slug = path.parse(relativePath).name.toLowerCase()
      
      posts.push({
        filePath,
        slug,
        abbrlink: data.abbrlink,
        title: data.title || slug,
        lang: data.lang
      })
    } catch (error) {
      console.warn(`⚠️ 无法读取文件 ${filePath}:`, error)
    }
  }

  return posts
}

/**
 * 根据文章标题查找对应的文章
 */
function findPostByTitle(posts: PostInfo[], title: string): PostInfo | undefined {
  const normalizedTitle = title.trim().toLowerCase()
  
  // 先尝试精确匹配标题
  let post = posts.find(p => p.title.toLowerCase() === normalizedTitle)
  if (post) return post

  // 尝试模糊匹配
  post = posts.find(p => 
    p.title.toLowerCase().includes(normalizedTitle) || 
    normalizedTitle.includes(p.title.toLowerCase())
  )
  
  return post
}

/**
 * 查找并修复文章内的内部链接
 */
function fixInternalLinks(content: string, posts: PostInfo[], filePath: string): {
  fixedContent: string
  changes: Array<{ original: string; fixed: string; line: number }>
} {
  const lines = content.split('\n')
  const changes: Array<{ original: string; fixed: string; line: number }> = []
  
  // 匹配Markdown链接的正则表达式
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  // 匹配HTML链接的正则表达式
  const htmlLinkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi
  
  const fixedLines = lines.map((line, lineIndex) => {
    let fixedLine = line
    
    // 修复Markdown链接
    fixedLine = fixedLine.replace(linkRegex, (match, linkText, linkUrl) => {
      // 检查是否是内部文章链接
      if (isInternalPostLink(linkUrl)) {
        let postTitle = linkText
        
        // 如果链接包含cgartlab.com，尝试从URL中提取文章标题
        if (linkUrl.includes('cgartlab.com')) {
          // 提取URL中的文章部分
          const urlParts = linkUrl.split('/')
          const lastPart = urlParts[urlParts.length - 1]
          if (lastPart && lastPart !== '') {
            postTitle = decodeURIComponent(lastPart.replace(/\.md$/, ''))
          }
        }
        
        const post = findPostByTitle(posts, postTitle)
        if (post) {
          const correctUrl = generateCorrectUrl(post)
          if (correctUrl !== linkUrl) {
            changes.push({
              original: match,
              fixed: `[${linkText}](${correctUrl})`,
              line: lineIndex + 1
            })
            return `[${linkText}](${correctUrl})`
          }
        }
      }
      return match
    })
    
    // 修复HTML链接
    fixedLine = fixedLine.replace(htmlLinkRegex, (match, linkUrl, linkText) => {
      if (isInternalPostLink(linkUrl)) {
        let postTitle = linkText
        
        // 如果链接包含cgartlab.com，尝试从URL中提取文章标题
        if (linkUrl.includes('cgartlab.com')) {
          // 提取URL中的文章部分
          const urlParts = linkUrl.split('/')
          const lastPart = urlParts[urlParts.length - 1]
          if (lastPart && lastPart !== '') {
            postTitle = decodeURIComponent(lastPart.replace(/\.md$/, ''))
          }
        }
        
        const post = findPostByTitle(posts, postTitle)
        if (post) {
          const correctUrl = generateCorrectUrl(post)
          if (correctUrl !== linkUrl) {
            changes.push({
              original: match,
              fixed: `<a href="${correctUrl}">${linkText}</a>`,
              line: lineIndex + 1
            })
            return `<a href="${correctUrl}">${linkText}</a>`
          }
        }
      }
      return match
    })
    
    return fixedLine
  })
  
  return {
    fixedContent: fixedLines.join('\n'),
    changes
  }
}

/**
 * 判断是否是内部文章链接
 * 现在包括包含cgartlab.com的链接
 */
function isInternalPostLink(url: string): boolean {
  // 检测是否包含cgartlab.com域名
  if (url.includes('cgartlab.com')) return true
  
  // 排除外部链接（除了cgartlab.com）
  if (url.startsWith('http') && !url.includes('cgartlab.com')) return false
  if (url.startsWith('//') && !url.includes('cgartlab.com')) return false
  
  // 排除锚点和相对路径
  if (url.startsWith('#') || url.startsWith('./') || url.startsWith('../')) return false
  
  // 排除图片和文件
  if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip)$/i.test(url)) return false
  
  // 简单的文章链接判断
  return true
}

/**
 * 生成正确的文章URL
 * 规则：去掉中文标点，将大写字母改为小写，去掉空格
 */
function generateCorrectUrl(post: PostInfo): string {
  let slug = post.abbrlink || post.slug
  
  // 去掉中文标点符号
  slug = slug.replace(/[，。！？；：、""''（）【】《》〈〉]/g, '')
  
  // 将大写字母改为小写
  slug = slug.toLowerCase()
  
  // 去掉空格
  slug = slug.replace(/\s+/g, '')
  
  // 根据语言生成URL
  if (post.lang && post.lang !== 'zh') {
    return `/${post.lang}/posts/${slug}/`
  }
  
  return `/posts/${slug}/`
}

/**
 * 修复单个文件的内部链接
 */
async function fixSingleFile(filePath: string, posts: PostInfo[]): Promise<LinkFixResult> {
  const originalContent = await readFile(filePath, 'utf8')
  const { frontmatter, body } = splitContent(originalContent)
  
  const { fixedContent: fixedBody, changes } = fixInternalLinks(body, posts, filePath)
  
  // 重新组合文件内容
  let fixedContent: string
  if (frontmatter) {
    fixedContent = `---\n${frontmatter}\n---\n${fixedBody}`
  } else {
    fixedContent = fixedBody
  }
  
  return {
    filePath,
    changed: changes.length > 0,
    originalContent,
    fixedContent,
    changes
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始扫描文章内部链接...')
  
  const posts = await getAllPosts()
  console.log(`📦 找到 ${posts.length} 篇文章`)
  
  if (posts.length === 0) {
    console.log('❌ 未找到任何文章')
    return
  }
  
  const postFiles = await fg(CONFIG.MARKDOWN_EXTENSIONS, {
    cwd: process.cwd(),
    absolute: true,
    ignore: CONFIG.EXCLUDE_PATTERNS
  })
  
  console.log(`📄 扫描 ${postFiles.length} 个文件中的内部链接...`)
  
  let totalChanges = 0
  const results: LinkFixResult[] = []
  
  for (const filePath of postFiles) {
    try {
      const result = await fixSingleFile(filePath, posts)
      results.push(result)
      
      if (result.changed) {
        totalChanges += result.changes.length
        await writeFile(filePath, result.fixedContent)
        
        if (result.changes.length <= CONFIG.MAX_DISPLAY_CHANGES) {
          console.log(`✅ 已修复 ${filePath} 中的 ${result.changes.length} 个链接:`)
          result.changes.forEach(change => {
            console.log(`  第 ${change.line} 行: ${change.original} -> ${change.fixed}`)
          })
        } else {
          console.log(`✅ 已修复 ${filePath} 中的 ${result.changes.length} 个链接`)
        }
      }
    } catch (error) {
      console.warn(`⚠️ 处理文件 ${filePath} 时出错:`, error)
    }
  }
  
  const changedFiles = results.filter(r => r.changed).length
  
  console.log('\n📊 修复完成:')
  console.log(`📄 扫描了 ${postFiles.length} 个文件`)
  console.log(`✅ 修复了 ${changedFiles} 个文件中的 ${totalChanges} 个链接`)
  
  if (totalChanges === 0) {
    console.log('🎉 所有链接都已正确，无需修复')
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
})

// 运行主函数
main().catch(console.error)