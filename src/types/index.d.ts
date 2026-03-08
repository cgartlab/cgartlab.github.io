import type { CollectionEntry } from 'astro:content'
import type { Language } from '@/i18n/config'

export type Post = CollectionEntry<'posts'> & {
  remarkPluginFrontmatter: {
    minutes: number
  }
}

export interface ThemeConfig {
  site: {
    // 站点标题
    title: string
    // 站点副标题
    subtitle: string
    // 站点描述
    description: string
    // 使用 src/i18n/ui.ts 中的国际化标题/副标题/描述而不是上面的静态内容
    i18nTitle: boolean
    // 作者姓名
    author: string
    // 站点网址
    url: string
    // 基础路径
    base: string
    // 网站图标网址
    favicon: string
  }
  color: {
    // 默认主题模式
    mode: 'light' | 'dark' | 'auto'
    light: {
      // 主色调
      primary: string
      // 辅助色
      secondary: string
      // 背景色
      background: string
      // 高亮色
      highlight: string
    }
    dark: {
      // 主色调
      primary: string
      // 辅助色
      secondary: string
      // 背景色
      background: string
      // 高亮色
      highlight: string
    }
  }
  global: {
    // 默认语言
    locale: Language
    // 更多语言
    moreLocales: Language[]
    // 文章文本的字体样式
    fontStyle: 'sans' | 'serif'
    // 文章的日期格式
    dateFormat: 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY' | 'MMM D YYYY' | 'D MMM YYYY'
    // 文章的目录
    toc: boolean
    // KaTeX 数学渲染
    katex: boolean
    // 减少动画效果
    reduceMotion: boolean
  }
  comment: {
    // 启用评论系统
    enabled: boolean
    giscus?: {
      repo?: string
      repoId?: string
      category?: string
      categoryId?: string
      mapping?: 'pathname' | 'url' | 'title' | 'og:title'
      strict?: '0' | '1'
      reactionsEnabled?: '0' | '1'
      emitMetadata?: '0' | '1'
      inputPosition?: 'top' | 'bottom'
    }
    twikoo?: {
      envId?: string
    }
    waline?: {
      // 服务器网址
      serverURL?: string
      // 表情网址
      emoji?: string[]
      // GIF搜索
      search?: boolean
      // 图片上传器
      imageUploader?: boolean
    }
  }
  seo?: {
    // Twitter ID
    twitterID?: string
    verification?: {
      // Google搜索控制台
      google?: string
      // Bing网站管理员工具
      bing?: string
      // Yandex网站管理员
      yandex?: string
      // 百度搜索
      baidu?: string
    }
    // Google Analytics分析ID
    googleAnalyticsID?: string
    // Umami Analytics分析ID
    umamiAnalyticsID?: string
    follow?: {
      // Feed ID
      feedID?: string
      // User ID
      userID?: string
    }
    // ApiFlash访问密钥
    apiflashKey?: string
  }
  footer: {
    // 社交链接
    links: {
      name: string
      url: string
    }[]
    // 网站开始年份
    startYear: number
    // 显示字数统计
    showWordCount: boolean
  }
  preload?: {
    // 图片托管网址
    imageHostURL?: string
    // 自定义Google Analytics JS
    customGoogleAnalyticsJS?: string
    // 自定义Umami Analytics JS
    customUmamiAnalyticsJS?: string
  }
}
