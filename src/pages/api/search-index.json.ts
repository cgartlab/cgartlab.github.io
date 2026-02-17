import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { defaultLocale } from '@/config'

interface SearchIndex {
  title: string
  description: string
  tags: string[]
  content: string
  slug: string
  lang: string
  published: string
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const lang = url.searchParams.get('lang') || defaultLocale

  const posts = await getCollection(
    'posts',
    ({ data }) => {
      const shouldInclude = import.meta.env.DEV || !data.draft
      return shouldInclude && (data.lang === lang || data.lang === '')
    },
  )

  const searchIndex: SearchIndex[] = posts.map((post) => {
    const slug = post.data.abbrlink || post.id.replace(/\.mdx?$/, '').replace(/\/index$/, '')
    const content = post.body || ''

    return {
      title: post.data.title,
      description: post.data.description || '',
      tags: post.data.tags || [],
      content: content.slice(0, 5000),
      slug,
      lang: post.data.lang || lang,
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
