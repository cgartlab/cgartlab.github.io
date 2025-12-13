export type Language = 'en' | 'zh' | 'zh-tw'

// Global Language Map
export const langMap: Record<string, string[]> = {
  'en': ['en-US'],
  'zh': ['zh-CN'],
  'zh-tw': ['zh-TW'],
}

// Giscus Language Map
// https://giscus.app/
export const giscusLocaleMap: Record<string, string> = {
  'en': 'en',
  'zh': 'zh-CN',
  'zh-tw': 'zh-TW',
}

// Twikoo Language Map
// https://github.com/twikoojs/twikoo/blob/main/src/client/utils/i18n/index.js
export const twikooLocaleMap: Record<string, string> = {
  'en': 'en',
  'zh': 'zh-cn',
  'zh-tw': 'zh-tw',
}

// Waline Language Map
// https://waline.js.org/en/guide/features/i18n.html
export const walineLocaleMap: Record<string, string> = {
  'en': 'en-US',
  'zh': 'zh-CN',
  'zh-tw': 'zh-TW',
}

// Supported Languages
export const supportedLangs = Object.keys(langMap).flat()