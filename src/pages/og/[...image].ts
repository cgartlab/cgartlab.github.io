import type { APIRoute, GetStaticPaths } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { OGImageRoute } from 'astro-og-canvas'
import { getCollection } from 'astro:content'
import { getPostDescription } from '@/utils/description'

type OGRouteResult = Awaited<ReturnType<typeof OGImageRoute>>

let ogRouteResult: OGRouteResult | null = null

async function initOGRouter() {
  if (ogRouteResult)
    return ogRouteResult

  const posts = await getCollection('posts')

  const pages = Object.fromEntries(
    posts.map((post: CollectionEntry<'posts'>) => [
      post.id,
      {
        title: post.data.title,
        description: getPostDescription(post, 'og'),
      },
    ]),
  )

  ogRouteResult = await OGImageRoute({
    param: 'image',
    pages,
    getImageOptions: (_path, page: { title: string, description: string }) => ({
      title: page.title,
      description: page.description,
      logo: {
        path: './public/icons/og-logo.png',
        size: [250],
      },
      border: {
        color: [242, 241, 245],
        width: 20,
      },
      font: {
        title: {
          families: ['Noto Sans SC'],
          weight: 'Bold',
          color: [34, 33, 36],
          lineHeight: 1.5,
        },
        description: {
          families: ['Noto Sans SC'],
          color: [72, 71, 74],
          lineHeight: 1.5,
        },
      },
      fonts: [
        './public/fonts/NotoSansSC-Bold.otf',
        './public/fonts/NotoSansSC-Regular.otf',
      ],
      bgGradient: [[242, 241, 245]],
    }),
  })

  return ogRouteResult
}

export const getStaticPaths: GetStaticPaths = async (context) => {
  const result = await initOGRouter()
  return result.getStaticPaths(context)
}

export const GET: APIRoute = async (context) => {
  const result = await initOGRouter()
  return result.GET(context)
}
