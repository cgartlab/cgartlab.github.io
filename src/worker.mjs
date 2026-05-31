export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Normalize path: if requesting a directory, append index.html
    let assetPath = url.pathname
    if (assetPath.endsWith('/')) {
      assetPath += 'index.html'
    }

    // Try serving the asset from the assets namespace
    const asset = await env.ASSETS.fetch(
      new Request(new URL(assetPath, request.url), request),
    )

    // If asset not found, serve 404.html
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
