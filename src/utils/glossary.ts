/**
 * 术语表工具函数
 * 提供维基百科 URL 生成、术语解析、匹配候选词生成等纯函数
 */

import type { Language } from '@/i18n/config'
import type { TermEntry, TermLangOverride } from '@/data/glossary'

/**
 * 维基百科语言子域映射
 * - zh-tw 没有独立子域，统一走 zh 子域（维基百科无独立繁体子域，繁体字 zh 版可用）
 * - en 走 en 子域
 */
export const WIKI_LANG_HOST: Record<Language, string> = {
  zh: 'zh.wikipedia.org',
  'zh-tw': 'zh.wikipedia.org',
  en: 'en.wikipedia.org',
}

/**
 * 解析当前文章语言下术语的有效 wikiPath
 */
export function resolveWikiPath(entry: TermEntry, lang: Language): string | undefined {
  const override = entry.langs?.[lang]
  return override?.wikiPath ?? entry.wikiPath
}

/**
 * 解析当前文章语言下术语的自定义 URL（如有）
 */
function resolveUrl(entry: TermEntry, lang: Language): string | undefined {
  const override = entry.langs?.[lang]
  return override?.url ?? entry.url
}

/**
 * 生成链接 URL
 * 优先级：自定义 url > 维基百科 URL
 */
export function resolveLinkUrl(entry: TermEntry, lang: Language): string {
  const custom = resolveUrl(entry, lang)
  if (custom) return custom
  const path = resolveWikiPath(entry, lang)
  if (!path) return ''
  return `https://${WIKI_LANG_HOST[lang]}/wiki/${encodeURIComponent(path)}`
}

/**
 * 解析当前文章语言下术语的有效 aliases
 * 返回空数组表示无额外匹配形式
 */
export function resolveAliases(entry: TermEntry, lang: Language): string[] {
  const override: TermLangOverride | undefined = entry.langs?.[lang]
  return override?.aliases ?? []
}

/**
 * 生成维基百科完整 URL
 * @example buildWikiUrl({ term: 'RSS', wikiPath: 'RSS', ... }, 'zh')
 *   → 'https://zh.wikipedia.org/wiki/RSS'
 */
export function buildWikiUrl(entry: TermEntry, lang: Language): string {
  const path = resolveWikiPath(entry, lang)
  if (!path) return ''
  return `https://${WIKI_LANG_HOST[lang]}/wiki/${encodeURIComponent(path)}`
}

/**
 * 为术语生成所有匹配候选（term 主形式 + 当前语言 aliases + 全局 aliases）
 * 按长度降序返回（最长优先匹配）
 */
export function getMatchCandidates(entry: TermEntry, lang: Language): string[] {
  const candidates: string[] = [entry.term]
  if (entry.aliases) candidates.push(...entry.aliases)
  const langAliases = resolveAliases(entry, lang)
  if (langAliases.length > 0) candidates.push(...langAliases)
  // 去重
  const seen = new Set<string>()
  const unique: string[] = []
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c)
      unique.push(c)
    }
  }
  // 按长度降序（长的优先匹配，避免"Script"覆盖"AppleScript"）
  return unique.sort((a, b) => b.length - a.length)
}