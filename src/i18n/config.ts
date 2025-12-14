export type Language = 'en' | 'zh' | 'zh-tw'

// 全局语言映射
export const langMap: Record<string, string[]> = {
  'en': ['en-US'],
  'zh': ['zh-CN'],
  'zh-tw': ['zh-TW'],
}

// Giscus 语言映射
// https://giscus.app/
export const giscusLocaleMap: Record<string, string> = {
  'en': 'en',
  'zh': 'zh-CN',
  'zh-tw': 'zh-TW',
}

// Twikoo 语言映射
// https://github.com/twikoojs/twikoo/blob/main/src/client/utils/i18n/index.js
export const twikooLocaleMap: Record<string, string> = {
  'en': 'en',
  'zh': 'zh-cn',
  'zh-tw': 'zh-tw',
}

// Waline 语言映射
// https://waline.js.org/en/guide/features/i18n.html
export const walineLocaleMap: Record<string, string> = {
  'en': 'en-US',
  'zh': 'zh-CN',
  'zh-tw': 'zh-TW',
}

// 支持的语言
export const supportedLangs = Object.keys(langMap).flat()
