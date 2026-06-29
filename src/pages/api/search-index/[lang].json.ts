import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { allLocales } from '@/config'
import {
  normalizePostLang,
  normalizeSearchLang,
  shouldIncludePostForSearch,
} from '@/utils/search'

interface SearchIndex {
  title: string
  description: string
  tags: string[]
  content: string
  slug: string
  lang: string
  published: string
}

export async function getStaticPaths() {
  return allLocales.map(lang => ({ params: { lang } }))
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const lang = normalizeSearchLang(params.lang)

    const posts = await getCollection('posts', ({ data }) => {
      return shouldIncludePostForSearch(data, lang, import.meta.env.DEV)
    })

    const searchIndex: SearchIndex[] = posts.map((post) => {
      const slug = post.data.abbrlink || post.id.replace(/\.mdx?$/, '').replace(/\/index$/, '')

      // 安全截断：避免在多字节字符（CJK、emoji）边界处截断
      const body = post.body || ''
      let content: string
      if (body.length <= 5000) {
        content = body
      }
      else if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        // 优先用 Intl.Segmenter 按字素簇边界截断（最精确）
        const segmenter = new Intl.Segmenter()
        let idx = 0
        for (const { segment } of segmenter.segment(body)) {
          if (idx + segment.length > 5000) break
          idx += segment.length
        }
        content = body.slice(0, idx)
      }
      else {
        // 降级：Array.from 按 Unicode 码点边界截断（安全处理代理对）
        content = Array.from(body).slice(0, 5000).join('')
      }

      return {
        title: post.data.title,
        description: post.data.description || '',
        tags: post.data.tags || [],
        content,
        slug,
        lang: normalizePostLang(post.data.lang),
        published: post.data.published.toISOString(),
      }
    })

    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: 'Failed to build search index', details: message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
