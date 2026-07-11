export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url)

      // 1. Force www → non-www canonical redirect (301 permanent)
      if (url.hostname === 'www.cgartlab.com') {
        url.hostname = 'cgartlab.com'
        return Response.redirect(url.toString(), 301)
      }

      // 2. Trailing slash enforcement: redirect paths without trailing slash (301)
      //    Skip file-like paths (containing a dot in the last segment)
      const pathname = url.pathname
      if (!pathname.endsWith('/') && !pathname.split('/').pop()?.includes('.')) {
        url.pathname = pathname + '/'
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
          return new Response(notFound.body, {
            status: 404,
            headers: notFound.headers,
          })
        }
        catch {
          return new Response('Not Found', { status: 404 })
        }
      }

      // 5.5. Set caching headers: CSS and JS should not be cached for long
      // (Cloudflare CDN defaults to 30 days, which causes stale style issues)
      const newHeaders = new Headers(asset.headers)
      if (assetPath.endsWith('.css') || assetPath.endsWith('.js')) {
        newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate')
      }
      return new Response(asset.body, {
        status: asset.status,
        statusText: asset.statusText,
        headers: newHeaders,
      })
    }
    catch (err) {
      console.error('[Worker] Unhandled error:', err)
      return new Response('Not Found', { status: 404 })
    }
  },
}
