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
      if (/\/assets\/[^/]+\.[a-f0-9]{8,}\./.test(assetPath)) {
        // Fingerprinted assets (Astro/Vite hash in filename) → 1 year, immutable
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      }
      else if (/\.(css|js|mjs)$/.test(assetPath)) {
        // CSS/JS → 1 year, immutable
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      }
      else if (/\.(woff2?|ttf|otf|eot)$/.test(assetPath)) {
        // Fonts → 1 year, immutable
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      }
      else if (/\.(png|jpg|jpeg|webp|avif|gif|svg|ico)$/.test(assetPath)) {
        // Images → 30 days
        response.headers.set('Cache-Control', 'public, max-age=2592000')
      }
      else if (assetPath.endsWith('.html') || assetPath.endsWith('/')) {
        // HTML → 30 min edge, 10 min browser
        response.headers.set('Cache-Control', 'public, max-age=600, s-maxage=1800')
      }

      return response
    }
    catch (err) {
      console.error('[Worker] Unhandled error:', err)
      return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } })
    }
  },
}
