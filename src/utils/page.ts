import { base, moreLocales } from '@/config'
import { getLangFromPath } from '@/i18n/lang'
import { getLocalizedPath } from '@/i18n/path'

// 判断路径是否匹配特定页面类型
function matchPageType(path: string, prefix: string = '') {
  // 如果配置了基础路径则移除它
  const pathWithoutBase = base && path.startsWith(base)
    ? path.slice(base.length)
    : path

  // 移除路径开头和结尾的斜杠
  const normalizedPath = pathWithoutBase.replace(/^\/|\/$/g, '')

  // 首页检查：匹配根路径('')或语言代码('en', 'zh-tw')
  if (prefix === '') {
    return normalizedPath === '' || (moreLocales as readonly string[]).includes(normalizedPath)
  }

  // 确保严格的段边界匹配以防止部分匹配
  const startsWithSegment = (target: string, segment: string) =>
    target === segment || target.startsWith(`${segment}/`)

  // 匹配默认语言路径和本地化路径
  return startsWithSegment(normalizedPath, prefix)
    || moreLocales.some(lang => startsWithSegment(normalizedPath, `${lang}/${prefix}`))
}

export function isHomePage(path: string) {
  return matchPageType(path)
}

export function isPostPage(path: string) {
  return matchPageType(path, 'posts')
}

export function isTagPage(path: string) {
  return matchPageType(path, 'tags')
}

export function isAboutPage(path: string) {
  return matchPageType(path, 'about')
}

export function isWorksPage(path: string) {
  return matchPageType(path, 'works')
}

export function isWeeklyPage(path: string) {
  return matchPageType(path, 'weekly')
}

// 返回包含语言、页面类型和本地化助手的页面上下文
export function getPageInfo(path: string) {
  const currentLang = getLangFromPath(path)
  const isHome = isHomePage(path)
  const isPost = isPostPage(path)
  const isTag = isTagPage(path)
  const isAbout = isAboutPage(path)
  const isWorks = isWorksPage(path)
  const isWeekly = isWeeklyPage(path)

  return {
    currentLang,
    isHome,
    isPost,
    isTag,
    isAbout,
    isWorks,
    isWeekly,
    getLocalizedPath: (targetPath: string) =>
      getLocalizedPath(targetPath, currentLang),
  }
}
