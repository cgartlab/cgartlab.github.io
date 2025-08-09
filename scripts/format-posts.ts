/**
 * 格式化Markdown文件，修复CJK字符间的空格和标点符号
 * 项目：https://github.com/huacnlee/autocorrect
 * 使用：pnpm format-posts
 */

import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { format } from 'autocorrect-node'
import fg from 'fast-glob'

// 配置常量
const CONFIG = {
  IMAGE_PATTERNS: [
    /!\[.*?\]\(.*?\)/g,  // Markdown图片格式 ![alt](src)
    /<img[^>]*>/g          // HTML图片格式 <img ...>
  ],
  PLACEHOLDER_PREFIX: '__IMAGE_PLACEHOLDER_',
  MARKDOWN_EXTENSIONS: ['**/*.md', '**/*.mdx'],
  EXCLUDE_PATTERNS: ['!node_modules/**', '!.git/**', '!.astro/**'],
  MAX_UNCHANGED_DISPLAY: 5
} as const

// 类型定义
interface MarkdownContent {
  frontmatter: string
  body: string
  hasFrontmatter: boolean
}

interface FormatResult {
  filePath: string
  changed: boolean
  originalContent: string
  formattedContent: string
}

/**
 * 将Markdown内容分割为前置事项和正文
 * @param content - Markdown文件完整内容
 * @returns 分割后的前置事项和正文信息
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
 * 获取所有需要处理的Markdown文件（仅限content目录）
 * @returns Markdown文件路径数组
 */
async function getMarkdownFiles(): Promise<string[]> {
  console.log('🔍 正在查找content目录下的Markdown文件...')
  const patterns = [
    'src/content/**/*.{md,mdx}',
    '!src/content/**/node_modules/**',
    '!src/content/**/.git/**'
  ]
  const files = await fg(patterns, { cwd: process.cwd() })
  console.log(`📦 找到 ${files.length} 个content目录下的Markdown文件`)
  return files
}

/**
 * 保护内容中的图片链接，使用占位符替换
 * @param content - 原始内容
 * @returns 保护后的内容和占位符映射
 */
function protectImageLinks(content: string): {
  protectedContent: string
  placeholders: string[]
} {
  const placeholders: string[] = []
  let protectedContent = content

  for (const pattern of CONFIG.IMAGE_PATTERNS) {
    protectedContent = protectedContent.replace(pattern, (match) => {
      placeholders.push(match)
      return `${CONFIG.PLACEHOLDER_PREFIX}${placeholders.length - 1}__`
    })
  }

  return { protectedContent, placeholders }
}

/**
 * 恢复被保护的图片链接
 * @param content - 包含占位符的内容
 * @param placeholders - 原始图片链接数组
 * @returns 恢复后的内容
 */
function restoreImageLinks(content: string, placeholders: string[]): string {
  let restoredContent = content
  placeholders.forEach((image, index) => {
    restoredContent = restoredContent.replace(
      `${CONFIG.PLACEHOLDER_PREFIX}${index}__`,
      image
    )
  })
  return restoredContent
}

/**
 * 格式化单个Markdown文件
 * @param filePath - 文件路径
 * @returns 格式化结果
 */
async function formatSingleFile(filePath: string): Promise<FormatResult> {
  const originalContent = await readFile(filePath, 'utf8')
  const { frontmatter, body, hasFrontmatter } = splitContent(originalContent)

  // 跳过空文件
  if (!body.trim()) {
    return {
      filePath,
      changed: false,
      originalContent,
      formattedContent: originalContent
    }
  }

  // 保护图片链接
  const { protectedContent, placeholders } = protectImageLinks(body)

  // 格式化正文内容
  const formattedBody = format(protectedContent)

  // 恢复图片链接
  const finalBody = restoreImageLinks(formattedBody, placeholders)

  // 组合最终内容
  const formattedContent = hasFrontmatter
    ? `---\n${frontmatter}\n---\n${finalBody}`
    : finalBody

  return {
    filePath,
    changed: originalContent !== formattedContent,
    originalContent,
    formattedContent
  }
}

/**
 * 生成格式化结果报告
 * @param results - 格式化结果数组
 */
function reportResults(results: FormatResult[]): void {
  const changedFiles = results.filter(r => r.changed)
  const unchangedFiles = results.filter(r => !r.changed)

  console.log(`\n📊 格式化报告:`)
  console.log(`总共处理: ${results.length} 个文件`)
  console.log(`已修改: ${changedFiles.length} 个文件`)
  console.log(`未修改: ${unchangedFiles.length} 个文件`)

  if (changedFiles.length > 0) {
    console.log('\n🔧 已修改的文件:')
    changedFiles.forEach(file => {
      console.log(`  - ${file.filePath}`)
    })
  }

  if (unchangedFiles.length > 0) {
    console.log('\n✅ 未修改的文件:')
    unchangedFiles
      .slice(0, CONFIG.MAX_UNCHANGED_DISPLAY)
      .forEach(file => {
        console.log(`  - ${file.filePath}`)
      })

    if (unchangedFiles.length > CONFIG.MAX_UNCHANGED_DISPLAY) {
      console.log(`  ... 还有 ${unchangedFiles.length - CONFIG.MAX_UNCHANGED_DISPLAY} 个文件`)
    }
  }
}

/**
 * 格式化所有Markdown文件的主函数
 */
async function formatAllMarkdownFiles(): Promise<void> {
  const files = await getMarkdownFiles()
  const results: FormatResult[] = []

  for (const filePath of files) {
    try {
      const result = await formatSingleFile(filePath)
      results.push(result)

      if (result.changed) {
        await writeFile(filePath, result.formattedContent, 'utf8')
        console.log(`✅ 已格式化: ${filePath}`)
      }
    } catch (error) {
      console.error(`❌ 处理文件失败: ${filePath}`, error)
      results.push({
        filePath,
        changed: false,
        originalContent: '',
        formattedContent: ''
      })
    }
  }

  reportResults(results)
}

// 执行格式化
formatAllMarkdownFiles().catch((error) => {
  console.error('❌ 执行失败:', error)
  process.exit(1)
})