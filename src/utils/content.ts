import type { CollectionEntry } from 'astro:content'
import type { Language } from '@/i18n/config'
import type { Post } from '@/types'
import { getCollection, render } from 'astro:content'
import { defaultLocale } from '@/config'
import { memoize } from '@/utils/cache'

const metaCache = new Map<string, { minutes: number }>()

/**
 * 为文章添加元数据，包括阅读时间
 *
 * @param post 需要增强元数据的文章
 * @returns 带有阅读时间信息的增强文章
 */
async function addMetaToPost(post: CollectionEntry<'posts'>): Promise<Post> {
  const cacheKey = `${post.id}-${post.data.lang || 'universal'}`
  const cachedMeta = metaCache.get(cacheKey)
  if (cachedMeta) {
    return {
      ...post,
      remarkPluginFrontmatter: cachedMeta,
    }
  }

  const { remarkPluginFrontmatter } = await render(post)
  const meta = remarkPluginFrontmatter as { minutes: number }
  metaCache.set(cacheKey, meta)

  return {
    ...post,
    remarkPluginFrontmatter: meta,
  }
}

/**
 * 查找同一语言内的重复文章别名
 *
 * @param posts 需要检查的文章数组
 * @returns 关于重复别名的描述性错误消息数组
 */
export async function checkPostSlugDuplication(posts: CollectionEntry<'posts'>[]): Promise<string[]> {
  const slugMap = new Map<string, Set<string>>()
  const duplicates: string[] = []

  posts.forEach((post) => {
    const lang = post.data.lang
    const slug = post.data.abbrlink || post.id

    let slugSet = slugMap.get(lang)
    if (!slugSet) {
      slugSet = new Set()
      slugMap.set(lang, slugSet)
    }

    if (!slugSet.has(slug)) {
      slugSet.add(slug)
      return
    }

    if (!lang) {
      duplicates.push(`在通用文章中发现重复的别名"${slug}"（适用于所有语言）`)
    }
    else {
      duplicates.push(`在"${lang}"语言文章中发现重复的别名"${slug}"`)
    }
  })

  return duplicates
}

/**
 * 获取所有文章（包括置顶文章，生产环境中排除草稿）
 *
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 按语言筛选、增强元数据并按日期排序的文章
 */
async function _getPosts(lang?: Language) {
  const currentLang = lang || defaultLocale

  const filteredPosts = await getCollection(
    'posts',
    ({ data }: CollectionEntry<'posts'>) => {
      // 仅在开发模式下显示草稿
      const shouldInclude = import.meta.env.DEV || !data.draft
      return shouldInclude && (data.lang === currentLang || data.lang === '')
    },
  )

  const enhancedPosts = await Promise.all(filteredPosts.map(addMetaToPost))

  return enhancedPosts.sort((a, b) =>
    b.data.published.valueOf() - a.data.published.valueOf(),
  )
}

export const getPosts = memoize(_getPosts)

/**
 * 获取所有非置顶文章
 *
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 非置顶文章，按语言筛选
 */
async function _getRegularPosts(lang?: Language) {
  const posts = await getPosts(lang)
  return posts.filter(post => !post.data.pin && !post.data.tags?.includes('周刊'))
}

export const getRegularPosts = memoize(_getRegularPosts)

/**
 * 获取置顶文章并按置顶优先级排序
 *
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 按置顶值降序排列的置顶文章
 */
async function _getPinnedPosts(lang?: Language) {
  const posts = await getPosts(lang)
  return posts
    .filter(post => post.data.pin && post.data.pin > 0 && !post.data.tags?.includes('weekly'))
    .sort((a, b) => (b.data.pin ?? 0) - (a.data.pin ?? 0))
}

export const getPinnedPosts = memoize(_getPinnedPosts)

/**
 * 按年份分组文章并在每一年内排序
 *
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 按年份分组的文章映射（年份降序），每一年内的文章按日期排序
 */
async function _getPostsByYear(lang?: Language): Promise<Map<number, Post[]>> {
  const posts = await getRegularPosts(lang)
  const yearMap = new Map<number, Post[]>()

  posts.forEach((post: Post) => {
    const year = post.data.published.getFullYear()
    let yearPosts = yearMap.get(year)
    if (!yearPosts) {
      yearPosts = []
      yearMap.set(year, yearPosts)
    }
    yearPosts.push(post)
  })

  // 在每一年内按日期排序文章
  yearMap.forEach((yearPosts) => {
    yearPosts.sort((a, b) => {
      const aDate = a.data.published
      const bDate = b.data.published
      return bDate.getMonth() - aDate.getMonth() || bDate.getDate() - aDate.getDate()
    })
  })

  return new Map([...yearMap.entries()].sort((a, b) => b[0] - a[0]))
}

export const getPostsByYear = memoize(_getPostsByYear)

/**
 * 按标签分组文章
 *
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 键为标签名称、值为具有该标签的文章数组的映射
 */
async function _getPostsGroupByTags(lang?: Language) {
  const posts = await getPosts(lang)
  const tagMap = new Map<string, Post[]>()

  posts.forEach((post: Post) => {
    post.data.tags?.forEach((tag: string) => {
      let tagPosts = tagMap.get(tag)
      if (!tagPosts) {
        tagPosts = []
        tagMap.set(tag, tagPosts)
      }
      tagPosts.push(post)
    })
  })

  return tagMap
}

export const getPostsGroupByTags = memoize(_getPostsGroupByTags)

/**
 * 获取所有标签并按文章数量排序
 *
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 按受欢迎程度排序的标签数组（文章最多优先）
 */
async function _getAllTags(lang?: Language) {
  const tagMap = await getPostsGroupByTags(lang)
  const tagsWithCount = Array.from(tagMap.entries())

  tagsWithCount.sort((a, b) => b[1].length - a[1].length)
  return tagsWithCount.map(([tag]) => tag)
}

export const getAllTags = memoize(_getAllTags)

/**
 * 获取包含特定标签的所有文章
 *
 * @param tag 需要筛选文章的标签名称
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 包含指定标签的文章数组
 */
async function _getPostsByTag(tag: string, lang?: Language) {
  const tagMap = await getPostsGroupByTags(lang)
  return tagMap.get(tag) ?? []
}

export const getPostsByTag = memoize(_getPostsByTag)

/**
 * 检查哪些语言支持特定标签
 *
 * @param tag 需要检查语言支持的标签名称
 * @returns 支持指定标签的语言代码数组
 */
async function _getTagSupportedLangs(tag: string): Promise<Language[]> {
  const posts = await getCollection(
    'posts',
    ({ data }) => !data.draft,
  )
  const { allLocales } = await import('@/config')

  return allLocales.filter(locale =>
    posts.some(post =>
      post.data.tags?.includes(tag)
      && (post.data.lang === locale || post.data.lang === ''),
    ),
  )
}

export const getTagSupportedLangs = memoize(_getTagSupportedLangs)

/**
 * 获取所有文章的总字数
 * 中文字符、标点符号和英文单词每个计为一个字符
 *
 * @param lang 需要筛选的语言代码，默认为站点默认语言
 * @returns 总字数
 */
async function _getTotalWordCount(lang?: Language): Promise<number> {
  const posts = await getPosts(lang)
  let totalWords = 0

  for (const post of posts) {
    // 获取文章正文内容
    const textContent = post.body || ''

    // 计算中文字符（包括中文字符和标点符号）
    const chineseChars = textContent.match(/[\u4E00-\u9FA5\u3000-\u303F\uFF00-\uFFEF]/g) || []

    // 计算英文单词
    const englishWords = textContent.match(/[a-z]+/gi) || []

    totalWords += chineseChars.length + englishWords.length
  }

  return totalWords
}

export const getTotalWordCount = memoize(_getTotalWordCount)
