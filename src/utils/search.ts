import { defaultLocale } from '@/config'

export interface SearchPostData {
  lang?: string
  draft?: boolean
}

const SUPPORTED_SEARCH_LANGS = new Set(['zh', 'en', 'zh-tw'])

export function normalizeSearchLang(lang: string | null | undefined): string {
  if (!lang)
    return defaultLocale

  const normalized = lang.trim().toLowerCase()

  if (normalized.startsWith('zh-tw') || normalized.startsWith('zh-hk') || normalized.startsWith('zh-mo'))
    return 'zh-tw'

  if (normalized.startsWith('zh'))
    return 'zh'

  if (normalized.startsWith('en'))
    return 'en'

  return SUPPORTED_SEARCH_LANGS.has(normalized) ? normalized : defaultLocale
}

export function normalizePostLang(lang: string | null | undefined): string {
  const normalized = normalizeSearchLang(lang)
  return lang ? normalized : defaultLocale
}

export function shouldIncludePostByLang(postLang: string | null | undefined, targetLang: string): boolean {
  const normalizedTargetLang = normalizeSearchLang(targetLang)
  const normalizedPostLang = normalizePostLang(postLang)
  return normalizedPostLang === normalizedTargetLang
}

export function shouldIncludePostForSearch(data: SearchPostData, targetLang: string, includeDraft: boolean): boolean {
  if (!includeDraft && data.draft)
    return false

  return shouldIncludePostByLang(data.lang, targetLang)
}
