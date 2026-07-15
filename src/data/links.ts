export interface LinkItem {
  title: string
  description?: string
  url: string
  icon?: string
  category?: string
}

export const linksData: Record<string, Record<string, LinkItem[]>> = {
  'zh': {
    我常用的工具: [
      {
        title: 'Figma',
        description: '专业设计协作工具',
        url: 'https://figma.com',
        icon: 'https://static.figma.com/app/icon/1/favicon.png',
      },
      {
        title: 'ColorHunt',
        description: '配色方案灵感库',
        url: 'https://colorhunt.co',
        icon: 'https://colorhunt.co/img/colorhunt-favicon.svg?2',
      },
      {
        title: 'OpenCode',
        description: '开源 AI 编程 Agent，支持终端、桌面和 IDE',
        url: 'https://opencode.ai',
        icon: 'https://opencode.ai/favicon.ico',
      },
      {
        title: 'OpenClaw',
        description: '开源个人 AI Agent 助手',
        url: 'https://openclaw.ai',
        icon: '/icons/openclaw.svg',
      },
      {
        title: 'VSCode',
        description: '代码编辑器',
        url: 'https://code.visualstudio.com',
        icon: 'https://code.visualstudio.com/favicon.ico',
      },
      {
        title: 'Obsidian',
        description: '知识管理工具',
        url: 'https://obsidian.md',
        icon: 'https://obsidian.md/favicon.ico',
      },
      {
        title: 'Affine',
        description: '开源协作知识库',
        url: 'https://affine.pro',
        icon: 'https://affine.pro/favicon.ico',
      },
      {
        title: 'Blinko',
        description: '轻量级笔记工具',
        url: 'https://blinko.dev',
        icon: '/icons/blinko.png',
      },
      {
        title: 'Docker',
        description: '容器化平台',
        url: 'https://www.docker.com',
        icon: '/icons/docker.svg',
      },
      {
        title: 'PVE',
        description: 'Proxmox 虚拟化环境',
        url: 'https://www.proxmox.com',
        icon: 'https://www.proxmox.com/favicon.ico',
      },
      {
        title: 'FnOS',
        description: '飞牛科技推出的 NAS 操作系统',
        url: 'https://www.fnnas.com',
        icon: 'https://www.fnnas.com/favicon.ico',
      },
      {
        title: 'Cinema 4D',
        description: '3D 建模与动画',
        url: 'https://www.maxon.net/cinema-4d',
        icon: '/icons/cinema-4d.svg',
      },
      {
        title: 'After Effects',
        description: '动态视觉特效与合成',
        url: 'https://www.adobe.com/products/aftereffects.html',
        icon: '/icons/adobe-after-effects.svg',
      },
      {
        title: 'Photoshop',
        description: '图像处理软件',
        url: 'https://www.adobe.com/products/photoshop.html',
        icon: '/icons/adobe-photoshop.svg',
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
    我喜欢的创作者: [
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
    ],
  },
  'en': {
    'My Common Tools': [
      {
        title: 'Figma',
        description: 'Professional design collaboration',
        url: 'https://figma.com',
        icon: 'https://static.figma.com/app/icon/1/favicon.png',
      },
      {
        title: 'ColorHunt',
        description: 'Color palette inspiration',
        url: 'https://colorhunt.co',
        icon: 'https://colorhunt.co/img/colorhunt-favicon.svg?2',
      },
      {
        title: 'OpenCode',
        description: 'Open-source AI coding agent for terminal, desktop and IDE',
        url: 'https://opencode.ai',
        icon: 'https://opencode.ai/favicon.ico',
      },
      {
        title: 'OpenClaw',
        description: 'Open-source personal AI Agent assistant',
        url: 'https://openclaw.ai',
        icon: '/icons/openclaw.svg',
      },
      {
        title: 'VSCode',
        description: 'Code editor',
        url: 'https://code.visualstudio.com',
        icon: 'https://code.visualstudio.com/favicon.ico',
      },
      {
        title: 'Obsidian',
        description: 'Knowledge management tool',
        url: 'https://obsidian.md',
        icon: 'https://obsidian.md/favicon.ico',
      },
      {
        title: 'Affine',
        description: 'Open source collaborative knowledge base',
        url: 'https://affine.pro',
        icon: 'https://affine.pro/favicon.ico',
      },
      {
        title: 'Blinko',
        description: 'Lightweight note-taking tool',
        url: 'https://blinko.dev',
        icon: '/icons/blinko.png',
      },
      {
        title: 'Docker',
        description: 'Containerization platform',
        url: 'https://www.docker.com',
        icon: '/icons/docker.svg',
      },
      {
        title: 'PVE',
        description: 'Proxmox virtualization environment',
        url: 'https://www.proxmox.com',
        icon: 'https://www.proxmox.com/favicon.ico',
      },
      {
        title: 'FnOS',
        description: 'NAS OS developed by Feiniao Technology',
        url: 'https://www.fnnas.com',
        icon: 'https://www.fnnas.com/favicon.ico',
      },
      {
        title: 'Cinema 4D',
        description: '3D modeling and animation',
        url: 'https://www.maxon.net/cinema-4d',
        icon: '/icons/cinema-4d.svg',
      },
      {
        title: 'After Effects',
        description: 'Motion graphics and visual effects',
        url: 'https://www.adobe.com/products/aftereffects.html',
        icon: '/icons/adobe-after-effects.svg',
      },
      {
        title: 'Photoshop',
        description: 'Image processing software',
        url: 'https://www.adobe.com/products/photoshop.html',
        icon: '/icons/adobe-photoshop.svg',
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
    'Creators I Like': [
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
  },
  'zh-tw': {
    設計創作: [
      {
        title: 'Figma',
        description: '專業設計協作工具',
        url: 'https://figma.com',
        icon: 'https://static.figma.com/app/icon/1/favicon.png',
      },
      {
        title: 'ColorHunt',
        description: '配色方案靈感庫',
        url: 'https://colorhunt.co',
        icon: 'https://colorhunt.co/img/colorhunt-favicon.svg?2',
      },
      {
        title: 'OpenCode',
        description: '開源 AI 程式碼 Agent，支援終端、桌面和 IDE',
        url: 'https://opencode.ai',
        icon: 'https://opencode.ai/favicon.ico',
      },
      {
        title: 'OpenClaw',
        description: '開源個人 AI Agent 助手',
        url: 'https://openclaw.ai',
        icon: '/icons/openclaw.svg',
      },
      {
        title: 'VSCode',
        description: '程式碼編輯器',
        url: 'https://code.visualstudio.com',
        icon: 'https://code.visualstudio.com/favicon.ico',
      },
      {
        title: 'Obsidian',
        description: '知識管理工具',
        url: 'https://obsidian.md',
        icon: 'https://obsidian.md/favicon.ico',
      },
      {
        title: 'Affine',
        description: '開源協作知識庫',
        url: 'https://affine.pro',
        icon: 'https://affine.pro/favicon.ico',
      },
      {
        title: 'Blinko',
        description: '輕量化筆記工具',
        url: 'https://blinko.dev',
        icon: '/icons/blinko.png',
      },
      {
        title: 'Docker',
        description: '容器化平台',
        url: 'https://www.docker.com',
        icon: '/icons/docker.svg',
      },
      {
        title: 'PVE',
        description: 'Proxmox 虛擬化環境',
        url: 'https://www.proxmox.com',
        icon: 'https://www.proxmox.com/favicon.ico',
      },
      {
        title: 'FnOS',
        description: '飛牛科技推出的 NAS 作業系統',
        url: 'https://www.fnnas.com',
        icon: 'https://www.fnnas.com/favicon.ico',
      },
      {
        title: 'Cinema 4D',
        description: '3D 建模與動畫',
        url: 'https://www.maxon.net/cinema-4d',
        icon: '/icons/cinema-4d.svg',
      },
      {
        title: 'After Effects',
        description: '動態視覺特效與合成',
        url: 'https://www.adobe.com/products/aftereffects.html',
        icon: '/icons/adobe-after-effects.svg',
      },
      {
        title: 'Photoshop',
        description: '影像處理軟體',
        url: 'https://www.adobe.com/products/photoshop.html',
        icon: '/icons/adobe-photoshop.svg',
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
  },
}
