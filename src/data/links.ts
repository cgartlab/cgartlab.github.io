export interface LinkItem {
  title: string
  description?: string
  url: string
  icon?: string
  category?: string
}

export const linksData: Record<string, Record<string, LinkItem[]>> = {
  'zh': {
    优质博主: [
      {
        title: '阮一峰博客',
        description: '前端和计算机科普',
        url: 'https://www.ruanyifeng.com',
        icon: 'https://www.ruanyifeng.com/favicon.ico',
      },
      {
        title: '卢昌海',
        description: '科普作家，物理学家',
        url: 'https://www.changhai.org/',
        icon: 'https://www.changhai.org/favicon.ico',
      },
      {
        title: '李笑来',
        description: '著名作者，投资人',
        url: 'https://lixiaolai.com/#/',
        icon: 'https://lixiaolai.com/favicon.ico',
      },
      {
        title: 'Tw93',
        description: '新一代工程师的破局与发展',
        url: 'https://tw93.fun/',
        icon: 'https://gw.alicdn.com/imgextra/i4/O1CN01XYYPwL1uheeXASHIQ_!!6000000006069-2-tps-420-420.png',
      },
      {
        title: 'Richard Chan',
        description: '产品设计师',
        url: 'https://richardchan.cc/',
        icon: 'https://richardchan.cc/static/upload/image/20250404/1743752960262266.png',
      },
      {
        title: 'Yihui Xie',
        description: 'R语言专家，统计学家',
        url: 'https://yihui.org/',
        icon: 'https://yihui.org/favicon.ico',
      },
      {
        title: 'Takuya Matsuyama',
        description: '独立开发者，Inkdrop创始人',
        url: 'https://www.craftz.dog/',
        icon: 'https://www.craftz.dog/favicon.ico',
      },
      {
        title: 'ColorHunt',
        description: '配色方案灵感库',
        url: 'https://colorhunt.co',
        icon: 'https://colorhunt.co/img/colorhunt-favicon.svg?2',
      },
    ],
    设计创作: [
      {
        title: 'Figma',
        description: '专业设计协作工具',
        url: 'https://figma.com',
        icon: 'https://static.figma.com/app/icon/1/favicon.png',
      },
    ],
    学习资源: [
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
        icon: 'https://www.freecodecamp.org/favicon-32x32.png',
      },
    ],
  },
  'en': {
    'Blogs & Personal Sites': [
      {
        title: 'Ruanyf Blog',
        description: 'Frontend and computer science',
        url: 'https://www.ruanyifeng.com',
        icon: 'https://www.ruanyifeng.com/favicon.ico',
      },
      {
        title: 'Changhai Lu',
        description: 'Science writer, physicist',
        url: 'https://www.changhai.org/',
        icon: 'https://www.changhai.org/favicon.ico',
      },
      {
        title: 'Xiaolai Li',
        description: 'Author, investor',
        url: 'https://lixiaolai.com/#/',
        icon: 'https://lixiaolai.com/favicon.ico',
      },
      {
        title: 'Tw93',
        description: 'New generation engineer development',
        url: 'https://tw93.fun/',
        icon: 'https://gw.alicdn.com/imgextra/i4/O1CN01XYYPwL1uheeXASHIQ_!!6000000006069-2-tps-420-420.png',
      },
      {
        title: 'Richard Chan',
        description: 'Product designer',
        url: 'https://richardchan.cc/',
        icon: 'https://richardchan.cc/static/upload/image/20250404/1743752960262266.png',
      },
      {
        title: 'Yihui Xie',
        description: 'R language expert, statistician',
        url: 'https://yihui.org/',
        icon: 'https://yihui.org/favicon.ico',
      },
      {
        title: 'Takuya Matsuyama',
        description: 'Independent developer, Inkdrop founder',
        url: 'https://www.craftz.dog/',
        icon: 'https://www.craftz.dog/favicon.ico',
      },
    ],
    'Design & Creation': [
      {
        title: 'Figma',
        description: 'Professional design collaboration',
        url: 'https://figma.com',
        icon: 'https://static.figma.com/app/icon/1/favicon.png',
      },
    ],
    'Learning Resources': [
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
        icon: 'https://www.freecodecamp.org/favicon-32x32.png',
      },
    ],
  },
  'zh-tw': {
    優質部落客: [
      {
        title: '阮一峰博客',
        description: '前端和計算機科普',
        url: 'https://www.ruanyifeng.com',
        icon: 'https://www.ruanyifeng.com/favicon.ico',
      },
      {
        title: '盧昌海個人主頁',
        description: '科普作家，物理學家',
        url: 'https://www.changhai.org/',
        icon: 'https://www.changhai.org/favicon.ico',
      },
      {
        title: '李笑來作品集',
        description: '著名作者，投資人',
        url: 'https://lixiaolai.com/#/',
        icon: 'https://lixiaolai.com/favicon.ico',
      },
      {
        title: 'Tw93',
        description: '新一代工程師的破局與發展',
        url: 'https://tw93.fun/',
        icon: 'https://gw.alicdn.com/imgextra/i4/O1CN01XYYPwL1uheeXASHIQ_!!6000000006069-2-tps-420-420.png',
      },
      {
        title: 'Richard Chan',
        description: '產品設計師',
        url: 'https://richardchan.cc/',
        icon: 'https://richardchan.cc/static/upload/image/20250404/1743752960262266.png',
      },
      {
        title: 'Yihui Xie',
        description: 'R語言專家，統計學家',
        url: 'https://yihui.org/',
        icon: 'https://yihui.org/favicon.ico',
      },
      {
        title: 'Takuya Matsuyama',
        description: '獨立開發者，Inkdrop創始人',
        url: 'https://www.craftz.dog/',
        icon: 'https://www.craftz.dog/favicon.ico',
      },
    ],
    設計創作: [
      {
        title: 'Figma',
        description: '專業設計協作工具',
        url: 'https://figma.com',
        icon: 'https://static.figma.com/app/icon/1/favicon.png',
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
        icon: 'https://www.freecodecamp.org/favicon-32x32.png',
      },
    ],
  },
}
