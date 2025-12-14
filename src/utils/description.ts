import type { CollectionEntry } from 'astro:content'
import type { Language } from '@/i18n/config'
import MarkdownIt from 'markdown-it'
import { defaultLocale } from '@/config'

type ExcerptScene = 'list' | 'meta' | 'og' | 'feed'

const markdownParser = new MarkdownIt()
const excerptLengths: Record<ExcerptScene, { cjk: number, other: number }> = {
  list: {
    cjk: 120,
    other: 240,
  },
  meta: {
    cjk: 120,
    other: 240,
  },
  og: {
    cjk: 70,
    other: 140,
  },
  feed: {
    cjk: 70,
    other: 140,
  },
}

const htmlEntityMap: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': '\'',
  '&nbsp;': ' ',
}

// 根据语言和场景创建指定长度的纯净文本摘要
function getExcerpt(text: string, lang: Language, scene: ExcerptScene): string {
  const isCJK = (lang: Language) => ['zh', 'zh-tw', 'ja', 'ko'].includes(lang)
  const length = isCJK(lang)
    ? excerptLengths[scene].cjk
    : excerptLengths[scene].other

  // 移除HTML标签
  let cleanText = text.replace(/<[^>]*>/g, '')

  // 解码HTML实体
  Object.entries(htmlEntityMap).forEach(([entity, char]) => {
    cleanText = cleanText.replace(new RegExp(entity, 'g'), char)
  })

  // 规范化空白字符
  cleanText = cleanText.replace(/\s+/g, ' ')

  // 规范化CJK标点符号间距
  cleanText = cleanText.replace(/([。？！："」』])\s+/g, '$1')

  const excerpt = cleanText.slice(0, length).trim()

  // 移除尾部标点符号并添加省略号
  if (cleanText.length > length) {
    return `${excerpt.replace(/\p{P}+$/u, '')}...`
  }

  return excerpt
}

// 从现有描述或内容生成文章描述
export function getPostDescription(
  post: CollectionEntry<'posts'>,
  scene: ExcerptScene,
): string {
  const lang = (post.data.lang || defaultLocale) as Language

  if (post.data.description) {
    // 仅为og场景截断，其他场景返回完整描述
    return scene === 'og'
      ? getExcerpt(post.data.description, lang, scene)
      : post.data.description
  }

  const rawContent = post.body || ''
  const cleanContent = rawContent
    .replace(/<!--[\s\S]*?-->/g, '') // 移除HTML注释
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/^\s*#{1,6}\s+\S.*$/gm, '') // 移除Markdown标题
    .replace(/^\s*::.*$/gm, '') // 移除指令容器
    .replace(/^\s*>\s*\[!.*\]$/gm, '') // 移除GitHub警告标记
    .replace(/\n{2,}/g, '\n\n') // 规范化换行符

  const renderedContent = markdownParser.render(cleanContent)
  return getExcerpt(renderedContent, lang, scene)
}
