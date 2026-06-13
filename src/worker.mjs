export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // 1. Force www → non-www canonical redirect (301 permanent)
    //    Ensures SEO canonical unity: all bots always see a single canonical
    //    domain (cgartlab.com), preventing duplicate-domain issues.
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
      new Request(new URL(assetPath, request.url), request),
    )

    // 4. If asset not found, serve 404.html
    if (asset.status === 404) {
      const notFound = await env.ASSETS.fetch(
        new Request(new URL('/404.html', request.url), request),
      )
      return new Response(notFound.body, {
        status: 404,
        headers: notFound.headers,
      })
    }

    return asset
  },
}
