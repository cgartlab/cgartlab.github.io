import { pushNewPosts } from './lib/tg.mjs'

/** 恒时字符串比较：长度不匹配直接返回，等长时逐字符 XOR，避免 timing side-channel */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length)
    return false
  let diff = 0
  for (let i = 0; i < a.length; i++)
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      pushNewPosts(env)
        .then(({ pushed, skippedPermanent, baseline, skipped }) => {
          if (baseline)
            console.warn('[TG] baseline set (no push)')
          else if (skipped)
            console.warn(`[TG] skipped (${skipped})`)
          else if (skippedPermanent)
            console.warn(`[TG] pushed ${pushed}, skipped-permanent ${skippedPermanent}`)
          else
            console.warn(`[TG] pushed ${pushed} post(s)`)
        })
        .catch((err) => {
          console.error('[TG] push failed:', err)
        }),
    )
  },

  async fetch(request, env) {
    try {
      const url = new URL(request.url)
      const pathname = url.pathname

      // 0. Manual trigger: POST /api/tg-notify with x-tg-secret header
      if (pathname === '/api/tg-notify' && request.method === 'POST') {
        if (!env.TG_NOTIFY_SECRET || !timingSafeEqual(request.headers.get('x-tg-secret') || '', env.TG_NOTIFY_SECRET)) {
          return new Response('Unauthorized', { status: 401 })
        }
        try {
          const result = await pushNewPosts(env)
          return Response.json(result)
        }
        catch (err) {
          // 推送失败返回 500 而非被外层 catch 吞成 404，便于运维发现
          console.error('[TG] manual push failed:', err)
          return Response.json({ error: String(err.message || err) }, { status: 500 })
        }
      }

      // 1. Force www → non-www canonical redirect (301 permanent)
      if (url.hostname === 'www.cgartlab.com') {
        url.hostname = 'cgartlab.com'
        return Response.redirect(url.toString(), 301)
      }

      // 1b. Feed shortcut: /feed and /feed/ → RSS feed
      if (pathname === '/feed' || pathname === '/feed/') {
        return Response.redirect('https://cgartlab.com/rss.xml', 301)
      }

      // 2. Trailing slash enforcement: redirect paths without trailing slash (301)
      //    Skip file-like paths (containing a dot in the last segment)
      if (!pathname.endsWith('/') && !pathname.split('/').pop()?.includes('.')) {
        url.pathname = `${pathname}/`
        return Response.redirect(url.toString(), 301)
      }

      // 3. Normalize path: if requesting a directory, append index.html
      let assetPath = pathname
      if (assetPath.endsWith('/')) {
        assetPath += 'index.html'
      }

      // 4. Try serving the asset from the assets namespace
      const asset = await env.ASSETS.fetch(
        new Request(new URL(assetPath, request.url), request),
      )

      // 5. If asset not found, serve 404.html
      if (asset.status === 404) {
        try {
          const notFound = await env.ASSETS.fetch(
            new Request(new URL('/404.html', request.url), request),
          )
          const resp = new Response(notFound.body, { status: 404, headers: notFound.headers })
          resp.headers.set('Cache-Control', 'public, max-age=60')
          return resp
        }
        catch {
          return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } })
        }
      }

      // 6. Create new response so we can override cache headers
      const response = new Response(asset.body, asset)

      // 7. Set cache headers based on file type

      // 指纹资源（_astro/ 目录，所有文件均为 Astro 内容哈希命名）→ 1 年 immutable
      if (assetPath.startsWith('/_astro/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      }
      // 非指纹 CSS/JS（giscus、partytown 等第三方脚本）→ 1 小时，must-revalidate
      else if (/\.(?:css|js|mjs)$/.test(assetPath)) {
        response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate')
      }
      // 字体 → 1 年 immutable
      else if (/\.(?:woff2?|ttf|otf|eot)$/.test(assetPath)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      }
      // 图片 + 音效 → 30 天
      else if (/\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|wav)$/.test(assetPath)) {
        response.headers.set('Cache-Control', 'public, max-age=2592000')
      }
      // 搜索索引 JSON → 24 小时，1 小时 stale-while-revalidate（保证新文章尽快可搜索）
      else if (/^\/api\/search-index(?:\/[\w-]+)?\.json$/.test(assetPath)) {
        response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
      }
      // HTML → 浏览器 10 分钟 SWR，边缘 30 分钟
      else if (assetPath.endsWith('.html')) {
        response.headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=120')
        response.headers.set('Cloudflare-Cdn-Cache-Control', 'max-age=1800')
        // 列表页 noindex，避免与正文页抢权重
        if (/^\/(?:en\/)?(?:weekly|tags)\//.test(pathname))
          response.headers.set('X-Robots-Tag', 'noindex, follow')
      }

      return response
    }
    catch (err) {
      console.error('[Worker] Unhandled error:', err)
      return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } })
    }
  },
}
