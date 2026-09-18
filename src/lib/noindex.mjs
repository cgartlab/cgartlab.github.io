/**
 * noindex 页面族（列表/工具页，避免与正文页抢权重；glossary 有意保留可索引）。
 *
 * 单一声明源：src/worker.mjs（X-Robots-Tag）与 astro.config.ts（sitemap serialize 排除）
 * 必须从 NOINDEX_PATH_FAMILIES / isNoindexPath() 派生，禁止各自维护正则，防止漂移。
 *
 * 语言前缀：默认语言（zh）无 URL 前缀，en 带 /en/ 前缀；若未来启用更多带前缀的
 * 语言（如 zh-tw），需同步扩展 LANG_PREFIXES。
 */
export const NOINDEX_PATH_FAMILIES = ['weekly', 'tags', 'disclaimer', 'search']

// 带 URL 前缀的语言；defaultLocale（zh）无前缀，不在其中
const LANG_PREFIXES = ['en']

/**
 * 判断 pathname（以 / 开头）是否属于 noindex 页面族。
 * 语义等价于旧正则 /^\/(?:en\/)?(?:weekly|tags|disclaimer|search)\//。
 */
export function isNoindexPath(pathname) {
  const prefix = LANG_PREFIXES.length > 0 ? `(?:${LANG_PREFIXES.join('|')}/)?` : ''
  const re = new RegExp(`^/${prefix}(?:${NOINDEX_PATH_FAMILIES.join('|')})/`)
  return re.test(pathname)
}
