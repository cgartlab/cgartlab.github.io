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
  const lang = normalizeSearchLang(params.lang)

  const posts = await getCollection('posts', ({ data }) => {
    return shouldIncludePostForSearch(data, lang, import.meta.env.DEV)
  })

  const searchIndex: SearchIndex[] = posts.map((post) => {
    const slug = post.data.abbrlink || post.id.replace(/\.mdx?$/, '').replace(/\/index$/, '')

    return {
      title: post.data.title,
      description: post.data.description || '',
      tags: post.data.tags || [],
      content: (post.body || '').slice(0, 5000),
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
