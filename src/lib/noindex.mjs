import { LANG_PREFIXES } from './lang-prefix.mjs'

/**
 * noindex 页面族（列表/工具页，避免与正文页抢权重；glossary 有意保留可索引）。
 *
 * 单一声明源：src/worker.mjs（X-Robots-Tag）与 astro.config.ts（sitemap serialize 排除）
 * 都必须从 NOINDEX_PATH_FAMILIES / isNoindexPath() 派生，禁止各自维护正则。
 *
 * `search` 已移除：/search 早被 Worker 301 回首页，不再产生页面。
 * `disclaimer` 已移除：2026-11-17 三份法律文档合并为 /agreement/，该页面不存在了。
 * 语言前缀来自 ./lang-prefix.mjs（默认语言 zh 无前缀）。
 */
export const NOINDEX_PATH_FAMILIES = ['column', 'tags']

/**
 * 判断 pathname（以 / 开头）是否属于 noindex 页面族。
 * 语义等价于 /^\/(?:en\/)?(?:column|tags)\//。
 */
export function isNoindexPath(pathname) {
  const prefix = LANG_PREFIXES.length > 0 ? `(?:${LANG_PREFIXES.join('|')}/)?` : ''
  const re = new RegExp(`^/${prefix}(?:${NOINDEX_PATH_FAMILIES.join('|')})/`)
  return re.test(pathname)
}
