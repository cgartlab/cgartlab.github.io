// ... worker code ...
export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      pushNewPosts(env)
    )
  },
  async fetch(request, env, ctx) {
    // ... rest of worker code ...
  }
}
