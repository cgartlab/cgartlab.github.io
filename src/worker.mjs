export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // 1. Force www → non-www canonical redirect (301 permanent)
    //    Ensures Google AdSense crawler and all other bots always see a
    //    single canonical domain (cgartlab.com), preventing duplicate-domain
    //    issues that can block AdSense site verification.
    if (url.hostname === 'www.cgartlab.com') {
      url.hostname = 'cgartlab.com'
      return Response.redirect(url.toString(), 301)
    }

    // 2. Normalize path: if requesting a directory, append index.html
    let assetPath = url.pathname
    if (assetPath.endsWith('/')) {
      assetPath += 'index.html'
    }

    // 3. Try serving the asset from the assets namespace
    const asset = await env.ASSETS.fetch(
      new Request(new URL(assetPath, request.url), request)
    )

    // 4. If asset not found, serve 404.html
    if (asset.status === 404) {
      const notFound = await env.ASSETS.fetch(
        new Request(new URL('/404.html', request.url), request)
      )
      return new Response(notFound.body, {
        status: 404,
        headers: notFound.headers,
      })
    }

    // 5. Ensure ads.txt is served with the correct Content-Type.
    //    Some CDN/proxy layers may omit or misset this header, causing
    //    Google's ads.txt crawler to reject the file.
    if (assetPath === '/ads.txt') {
      const headers = new Headers(asset.headers)
      headers.set('Content-Type', 'text/plain; charset=utf-8')
      headers.set('Cache-Control', 'public, max-age=3600')
      return new Response(asset.body, { status: asset.status, headers })
    }

    return asset
  },
}
