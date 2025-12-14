import type { APIContext, ImageMetadata } from 'astro'
import type { CollectionEntry } from 'astro:content'
import type { Language } from '@/i18n/config'
import { getImage } from 'astro:assets'
import { getCollection } from 'astro:content'
import { Feed } from 'feed'
import MarkdownIt from 'markdown-it'
import { parse } from 'node-html-parser'
import sanitizeHtml from 'sanitize-html'
import { base, defaultLocale, themeConfig } from '@/config'
import { ui } from '@/i18n/ui'
import { memoize } from '@/utils/cache'
import { getPostDescription } from '@/utils/description'

const markdownParser = new MarkdownIt()
const { title, description, i18nTitle, url, author } = themeConfig.site
const { follow } = themeConfig.seo ?? {}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 动态导入 /src/content/posts/_images 下的所有图像
const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/posts/_images/**/*.{jpeg,jpg,png,gif,webp}',
)

/**
 * 将相对图像路径转换为绝对URL
 *
 * @param srcPath - 来自markdown内容的相对图像路径
 * @param baseUrl - 站点基础URL
 * @returns 优化后的图像URL，如果处理失败则返回null
 */
async function _getAbsoluteImageUrl(srcPath: string, baseUrl: string) {
  // 从图像源路径中移除相对路径前缀 (../ 和 ./)
  const prefixRemoved = srcPath.replace(/^(?:\.\.\/)+|^\.\//, '')
  const absolutePath = `/src/content/posts/${prefixRemoved}`
  const imageImporter = imagesGlob[absolutePath]

  if (!imageImporter) {
    return null
  }

  // 导入图像模块并提取其元数据
  const imageMetadata = await imageImporter()
    .then(importedModule => importedModule.default)
    .catch((error) => {
      console.warn(`导入图像失败: ${absolutePath}`, error)
      return null
    })

  if (!imageMetadata) {
    return null
  }

  // 从元数据创建优化图像
  const optimizedImage = await getImage({ src: imageMetadata })
  return new URL(optimizedImage.src, baseUrl).toString()
}

// 导出记忆化版本
const getAbsoluteImageUrl = memoize(_getAbsoluteImageUrl)

/**
 * 修复HTML内容中的相对图像路径
 *
 * @param htmlContent HTML内容字符串
 * @param baseUrl 站点的基础URL
 * @returns 处理后的HTML字符串，其中所有图像路径都已转换为绝对URL
 */
async function fixRelativeImagePaths(htmlContent: string, baseUrl: string): Promise<string> {
  const htmlDoc = parse(htmlContent)
  const images = htmlDoc.getElementsByTagName('img')
  const imagePromises = []

  for (const img of images) {
    const src = img.getAttribute('src')
    if (!src) {
      continue
    }

    imagePromises.push((async () => {
      try {
        // 如果不是指向src/content/posts/_images目录的相对路径则跳过
        if (!src.startsWith('./') && !src.startsWith('../') && !src.startsWith('_images/')) {
          return
        }

        // 处理来自src/content/posts/_images目录的图像
        const absoluteImageUrl = await getAbsoluteImageUrl(src, baseUrl)
        if (absoluteImageUrl) {
          img.setAttribute('src', absoluteImageUrl)
        }
      }
      catch (error) {
        console.warn(`无法将相对图像路径转换为绝对URL: ${src}`, error)
      }
    })())
  }

  await Promise.all(imagePromises)

  return htmlDoc.toString()
}

/**
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * 生成支持RSS和Atom格式的订阅源对象
 *
 * @param options 订阅源生成选项
 * @param options.lang 可选的语言代码
 * @returns 已准备好用于RSS或Atom输出的Feed实例
 */
export async function generateFeed({ lang }: { lang?: Language } = {}) {
  const currentUI = ui[lang as keyof typeof ui] ?? ui[defaultLocale as keyof typeof ui] ?? {}
  const siteURL = lang ? `${url}${base}/${lang}/` : `${url}${base}/`

  // 创建Feed实例
  const feed = new Feed({
    title: i18nTitle ? currentUI.title : title,
    description: i18nTitle ? currentUI.description : description,
    id: siteURL,
    link: siteURL,
    language: lang ?? themeConfig.global.locale,
    copyright: `版权所有 © ${new Date().getFullYear()} ${author}`,
    updated: new Date(),
    generator: 'Astro-Theme-Retypeset with Feed for Node.js',

    feedLinks: {
      rss: new URL(lang ? `${base}/${lang}/rss.xml` : `${base}/rss.xml`, url).toString(),
      atom: new URL(lang ? `${base}/${lang}/atom.xml` : `${base}/atom.xml`, url).toString(),
    },

    author: {
      name: author,
      link: `${url}${base}/`,
    },
  })

  // 按语言筛选文章并排除草稿
  const posts = await getCollection(
    'posts',
    ({ data }: { data: CollectionEntry<'posts'>['data'] }) => {
      const isNotDraft = !data.draft
      const isCorrectLang = data.lang === lang
        || data.lang === ''
        || (lang === undefined && data.lang === defaultLocale)

      return isNotDraft && isCorrectLang
    },
  )

  // 按发布日期降序排列文章并限制为最新的25篇
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.data.published).getTime() - new Date(a.data.published).getTime())
    .slice(0, 25)

  // 将文章添加到订阅源
  for (const post of recentPosts) {
    const slug = post.data.abbrlink || post.id
    const link = new URL(`posts/${slug}/`, siteURL).toString()

    // 优化内容处理
    const postContent = post.body
      ? sanitizeHtml(
          await fixRelativeImagePaths(
            // 渲染markdown之前移除HTML注释
            markdownParser.render(post.body.replace(/<!--[\s\S]*?-->/g, '')),
            `${url}${base}/`,
          ),
          {
            // 在订阅源内容中允许<img>标签
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          },
        )
      : ''

    // publishDate -> Atom:<published>, RSS:<pubDate>
    const publishDate = new Date(post.data.published)
    // updateDate -> Atom:<updated>, RSS没有更新标签
    const updateDate = post.data.updated ? new Date(post.data.updated) : publishDate

    feed.addItem({
      title: post.data.title,
      id: link,
      link,
      description: getPostDescription(post, 'feed'),
      content: postContent,
      author: [{
        name: author,
        link: `${url}${base}/`,
      }],
      published: publishDate,
      date: updateDate,
    })
  }

  // 如果可用，添加关注验证
  if (follow?.feedID && follow?.userID) {
    feed.addExtension({
      name: 'follow_challenge',
      objects: {
        feedId: follow.feedID,
        userId: follow.userID,
      },
    })
  }

  return feed
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 生成RSS 2.0格式的订阅源
export async function generateRSS(context: APIContext) {
  const feed = await generateFeed({
    lang: context.params?.lang as Language | undefined,
  })

  // 为RSS订阅源添加XSLT样式表
  let rssXml = feed.rss2()
  rssXml = rssXml.replace(
    '<?xml version="1.0" encoding="utf-8"?>',
    `<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet href="${base}/feeds/rss-style.xsl" type="text/xsl"?>`,
  )

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}

// 生成Atom 1.0格式的订阅源
export async function generateAtom(context: APIContext) {
  const feed = await generateFeed({
    lang: context.params?.lang as Language | undefined,
  })

  // 为Atom订阅源添加XSLT样式表
  let atomXml = feed.atom1()
  atomXml = atomXml.replace(
    '<?xml version="1.0" encoding="utf-8"?>',
    `<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet href="${base}/feeds/atom-style.xsl" type="text/xsl"?>`,
  )

  return new Response(atomXml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  })
}
