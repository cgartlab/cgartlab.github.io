export interface LinkItem {
  title: string
  description?: string
  url: string
  icon?: string
  category?: string
}

export const linksData: Record<string, Record<string, LinkItem[]>> = {
  'zh': {
    资源工具: [
      {
        title: 'Unsplash',
        description: '高质量免费图片库',
        url: 'https://unsplash.com',
        icon: 'https://unsplash.com/favicon.ico',
      },
      {
        title: 'Figma',
        description: '专业设计协作工具',
        url: 'https://figma.com',
        icon: 'https://figma.com/favicon.ico',
      },
      {
        title: 'ColorHunt',
        description: '配色方案灵感库',
        url: 'https://colorhunt.co',
        icon: 'https://colorhunt.co/favicon.ico',
      },
    ],
    内容创作: [
      {
        title: '少数派',
        description: '数字生活方式社区',
        url: 'https://sspai.com',
        icon: 'https://sspai.com/favicon.ico',
      },
      {
        title: 'Medium',
        description: '高质量内容发布平台',
        url: 'https://medium.com',
        icon: 'https://medium.com/favicon.ico',
      },
      {
        title: 'Dev.to',
        description: '开发者社区',
        url: 'https://dev.to',
        icon: 'https://dev.to/favicon.ico',
      },
    ],
    学习资源: [
      {
        title: '阮一峰博客',
        description: '前端和计算机科普',
        url: 'https://www.ruanyifeng.com',
        icon: 'https://www.ruanyifeng.com/favicon.ico',
      },
      {
        title: 'MDN Web Docs',
        description: '网络技术参考',
        url: 'https://developer.mozilla.org',
        icon: 'https://developer.mozilla.org/favicon.ico',
      },
      {
        title: 'Freecodecamp',
        description: '免费编程教程',
        url: 'https://freecodecamp.org',
        icon: 'https://freecodecamp.org/favicon.ico',
      },
    ],
  },
  'en': {
    'Resources & Tools': [
      {
        title: 'Unsplash',
        description: 'High-quality free images',
        url: 'https://unsplash.com',
        icon: 'https://unsplash.com/favicon.ico',
      },
      {
        title: 'Figma',
        description: 'Professional design collaboration',
        url: 'https://figma.com',
        icon: 'https://figma.com/favicon.ico',
      },
      {
        title: 'ColorHunt',
        description: 'Color palette inspiration',
        url: 'https://colorhunt.co',
        icon: 'https://colorhunt.co/favicon.ico',
      },
    ],
    'Content Creation': [
      {
        title: 'Medium',
        description: 'Publishing platform',
        url: 'https://medium.com',
        icon: 'https://medium.com/favicon.ico',
      },
      {
        title: 'Dev.to',
        description: 'Developer community',
        url: 'https://dev.to',
        icon: 'https://dev.to/favicon.ico',
      },
      {
        title: 'Hashnode',
        description: 'Blogging for developers',
        url: 'https://hashnode.com',
        icon: 'https://hashnode.com/favicon.ico',
      },
    ],
    'Learning': [
      {
        title: 'MDN Web Docs',
        description: 'Web technology reference',
        url: 'https://developer.mozilla.org',
        icon: 'https://developer.mozilla.org/favicon.ico',
      },
      {
        title: 'Freecodecamp',
        description: 'Free coding tutorials',
        url: 'https://freecodecamp.org',
        icon: 'https://freecodecamp.org/favicon.ico',
      },
      {
        title: 'Web.dev',
        description: 'Web platform guidance',
        url: 'https://web.dev',
        icon: 'https://web.dev/favicon.ico',
      },
    ],
  },
  'zh-tw': {
    資源工具: [
      {
        title: 'Unsplash',
        description: '高品質免費圖片庫',
        url: 'https://unsplash.com',
        icon: 'https://unsplash.com/favicon.ico',
      },
      {
        title: 'Figma',
        description: '專業設計協作工具',
        url: 'https://figma.com',
        icon: 'https://figma.com/favicon.ico',
      },
      {
        title: 'ColorHunt',
        description: '配色方案靈感庫',
        url: 'https://colorhunt.co',
        icon: 'https://colorhunt.co/favicon.ico',
      },
    ],
    內容創作: [
      {
        title: 'Medium',
        description: '高品質發布平臺',
        url: 'https://medium.com',
        icon: 'https://medium.com/favicon.ico',
      },
      {
        title: 'Dev.to',
        description: '開發者社群',
        url: 'https://dev.to',
        icon: 'https://dev.to/favicon.ico',
      },
      {
        title: 'Hashnode',
        description: '開發者部落格',
        url: 'https://hashnode.com',
        icon: 'https://hashnode.com/favicon.ico',
      },
    ],
    學習資源: [
      {
        title: 'MDN Web Docs',
        description: '網路技術參考',
        url: 'https://developer.mozilla.org',
        icon: 'https://developer.mozilla.org/favicon.ico',
      },
      {
        title: 'Freecodecamp',
        description: '免費程式設計教程',
        url: 'https://freecodecamp.org',
        icon: 'https://freecodecamp.org/favicon.ico',
      },
      {
        title: 'Web.dev',
        description: '網路平臺指南',
        url: 'https://web.dev',
        icon: 'https://web.dev/favicon.ico',
      },
    ],
  },
}
