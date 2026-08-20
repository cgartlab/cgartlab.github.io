/**
 * 术语表：构建时由 rehype-glossary 插件扫描正文，
 * 首次出现时自动包裹为维基百科链接（或自定义 url）。
 *
 * 维护规则：
 * 1. 只收录单义词或领域专属术语；多义词不收
 * 2. term 是正文里的字面匹配字符串（区分大小写）
 * 3. langs 下的 aliases 提供额外匹配形式（如英文别名）
 * 4. 修改 wikiPath 等价于修改所有引用文章里的链接目标
 * 5. url 字段用于无维基百科页面或指向官网更合适的产品
 *    优先级：langs[lang].url > url > wikiPath
 */

import type { Language } from '@/i18n/config'

export interface TermLangOverride {
  /** 该语言下额外的匹配形式（不影响 term 主形式） */
  aliases?: string[]
  /** 该语言下的显示名称 */
  term?: string
  /** 该语言下的翻译描述 */
  description?: string
  /** 该语言下指向的 wikiPath；不填则回退到顶层 wikiPath */
  wikiPath?: string
  /** 自定义链接（优先级高于 wikiPath） */
  url?: string
}

export interface TermEntry {
  /** 唯一 ID，全局稳定（删除后不要复用） */
  id: string
  /** 主形式，正文里出现这个字符串就会被匹配 */
  term: string
  /** 跨语言别名（任一语言下命中即匹配） */
  aliases?: string[]
  /** 顶层 wikiPath（默认指向中文维基；纯 url 术语可不填） */
  wikiPath?: string
  /** 自定义链接（优先级高于 wikiPath，如产品文档或官网） */
  url?: string
  /** 各语言覆盖 */
  langs?: Partial<Record<Language, TermLangOverride>>
  /** 简短描述（用于审计报告，可选） */
  description?: string
}

export const glossary: TermEntry[] = [
  // ────────── 技术基础 ──────────
  {
    id: 'rss',
    term: 'RSS',
    wikiPath: 'RSS',
    description: '一种基于 XML 的内容订阅协议',
    langs: {
      'en': { aliases: ['Really Simple Syndication', 'Rich Site Summary'] },
      'zh-tw': { wikiPath: 'RSS' },
    },
  },
  {
    id: 'xml',
    term: 'XML',
    wikiPath: 'XML',
    description: '可扩展标记语言',
    langs: {
      en: { aliases: ['Extensible Markup Language'] },
    },
  },
  {
    id: 'git',
    term: 'Git',
    wikiPath: 'Git',
    description: '分布式版本控制系统',
  },
  {
    id: 'docker',
    term: 'Docker',
    wikiPath: 'Docker_(软件)',
    description: '容器化应用部署平台',
    langs: {
      en: { wikiPath: 'Docker_(software)' },
    },
  },
  {
    id: 'winget',
    term: 'winget',
    wikiPath: 'Windows_Package_Manager',
    description: 'Windows 包管理器',
    langs: {
      en: { aliases: ['Windows Package Manager'], wikiPath: 'Windows_Package_Manager' },
    },
  },
  {
    id: 'api',
    term: 'API',
    wikiPath: 'API',
    description: '应用程序编程接口',
    langs: {
      en: { aliases: ['Application Programming Interface', 'application programming interface'] },
    },
  },
  {
    id: 'proxy',
    term: '代理服务器',
    aliases: ['代理'],
    wikiPath: '代理服务器',
    description: '网络代理服务器',
    langs: {
      en: { aliases: ['Proxy server', 'proxy server'], wikiPath: 'Proxy_server' },
    },
  },
  {
    id: 'private-cloud',
    term: '私有云',
    wikiPath: '私有云',
    description: '企业自建云基础设施',
    langs: {
      en: { aliases: ['Private cloud'], wikiPath: 'Private_cloud' },
    },
  },
  {
    id: 'terminal',
    term: '终端模拟器',
    wikiPath: '终端模拟器',
    description: '用于访问 Shell 环境的命令行界面程序',
    langs: {
      en: { aliases: ['Terminal emulator', 'terminal'], wikiPath: 'Terminal_emulator' },
    },
  },
  {
    id: 'raid',
    term: 'RAID',
    wikiPath: 'RAID',
    description: '独立磁盘冗余阵列',
  },
  {
    id: 'macos',
    term: 'macOS',
    wikiPath: 'macOS',
    description: 'Apple 桌面操作系统',
    langs: { en: { wikiPath: 'macOS' } },
  },
  {
    id: 'windows',
    term: 'Windows',
    wikiPath: 'Microsoft_Windows',
    description: 'Microsoft 桌面/服务器操作系统',
    langs: { en: { wikiPath: 'Microsoft_Windows' } },
  },
  {
    id: 'linux',
    term: 'Linux',
    wikiPath: 'Linux',
    description: '开源类 Unix 操作系统内核',
  },
  {
    id: 'github',
    term: 'GitHub',
    wikiPath: 'GitHub',
    description: '基于 Git 的代码托管与协作平台',
  },
  {
    id: 'markdown',
    term: 'Markdown',
    wikiPath: 'Markdown',
    description: '轻量级标记语言',
  },
  {
    id: 'nas',
    term: 'NAS',
    aliases: ['网络附加存储'],
    wikiPath: '网络附加存储',
    description: '网络附加存储设备',
    langs: {
      en: { aliases: ['Network-attached storage', 'network-attached storage'], wikiPath: 'Network-attached_storage' },
    },
  },
  {
    id: 'dns',
    term: 'DNS',
    wikiPath: '域名系统',
    description: '域名系统，将域名解析为 IP 地址',
    langs: { en: { wikiPath: 'Domain_Name_System' } },
  },
  {
    id: 'ssh',
    term: 'SSH',
    wikiPath: 'Secure_Shell',
    description: '安全外壳协议，加密远程登录',
    langs: { en: { wikiPath: 'Secure_Shell' } },
  },
  {
    id: 'http',
    term: 'HTTP',
    wikiPath: 'HTTP',
    description: '超文本传输协议',
    langs: { en: { wikiPath: 'HTTP' } },
  },
  {
    id: 'ipv6',
    term: 'IPv6',
    wikiPath: 'IPv6',
    description: '互联网协议第 6 版',
    langs: { en: { wikiPath: 'IPv6' } },
  },
  {
    id: 'nat-traversal',
    term: '内网穿透',
    aliases: ['NAT穿透', 'NAT穿透', 'NAT穿越'],
    wikiPath: 'NAT穿透',
    description: '在 NAT 网络环境下访问内网主机的技术',
    langs: {
      en: { aliases: ['NAT traversal', 'NAT Traversal'], wikiPath: 'NAT_traversal' },
    },
  },
  {
    id: 'powershell',
    term: 'PowerShell',
    aliases: ['pwsh'],
    wikiPath: 'PowerShell',
    description: '跨平台任务自动化与配置管理命令行 shell',
    langs: { en: { wikiPath: 'PowerShell' } },
  },
  {
    id: 'wsl',
    term: 'WSL',
    aliases: ['WSL2', 'Windows Subsystem for Linux'],
    wikiPath: '适用于Linux的Windows子系统',
    description: 'Windows 上的 Linux 子系统',
    langs: {
      en: { wikiPath: 'Windows_Subsystem_for_Linux' },
    },
  },

  // ────────── AI / 大模型 ──────────
  {
    id: 'ai',
    term: 'AI',
    aliases: ['人工智能'],
    wikiPath: '人工智能',
    description: '人工智能技术',
    langs: {
      'en': { aliases: ['Artificial intelligence', 'artificial intelligence'], wikiPath: 'Artificial_intelligence' },
      'zh-tw': { aliases: ['人工智慧'], wikiPath: '人工智慧' },
    },
  },
  {
    id: 'gemini',
    term: 'Gemini',
    aliases: ['Google Gemini'],
    wikiPath: 'Gemini_(语言模型)',
    description: 'Google 开发的多模态大语言模型',
    langs: {
      en: { aliases: ['Google Gemini'], wikiPath: 'Gemini_(language_model)' },
    },
  },
  {
    id: 'chatgpt',
    term: 'ChatGPT',
    wikiPath: 'ChatGPT',
    description: 'OpenAI 发布的对话式大语言模型',
    langs: { en: { wikiPath: 'ChatGPT' } },
  },
  {
    id: 'claude',
    term: 'Claude',
    url: 'https://www.anthropic.com/claude',
    description: 'Anthropic 发布的大语言模型',
  },
  {
    id: 'ollama',
    term: 'Ollama',
    url: 'https://ollama.com',
    description: '本地运行大语言模型的工具',
  },
  {
    id: 'cursor',
    term: 'Cursor',
    url: 'https://cursor.com',
    description: 'AI 优先的代码编辑器',
  },
  {
    id: 'kimi',
    term: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    description: '月之暗面发布的 AI 助手',
  },
  {
    id: 'minimax',
    term: 'MiniMax',
    url: 'https://www.minimaxi.com',
    description: 'MiniMax 发布的多模态大模型与 AI 产品',
  },
  {
    id: 'openclaw',
    term: 'OpenClaw',
    aliases: ['龙虾'],
    url: 'https://openclaw.ai',
    description: '开源个人 AI Agent 助手，可运行本地并执行自动化任务',
    langs: {
      en: { description: 'Personal AI assistant that runs on your machine' },
    },
  },
  {
    id: 'opencode',
    term: 'OpenCode',
    url: 'https://opencode.ai',
    description: '开源 AI 编程 Agent，支持终端、桌面和 IDE',
    langs: {
      en: { description: 'Open-source AI coding agent for terminal, desktop and IDE' },
    },
  },

  // ────────── 自托管 / 效率工具 ──────────
  {
    id: 'wordpress',
    term: 'WordPress',
    wikiPath: 'WordPress',
    description: '开源内容管理系统',
  },
  {
    id: 'telegram',
    term: 'Telegram',
    wikiPath: 'Telegram',
    description: '跨平台即时通讯软件',
  },
  {
    id: 'photoshop',
    term: 'Photoshop',
    wikiPath: 'Adobe_Photoshop',
    description: 'Adobe 图像编辑软件',
    langs: { en: { wikiPath: 'Adobe_Photoshop' } },
  },
  {
    id: 'after-effects',
    term: 'After Effects',
    aliases: ['AE'],
    wikiPath: 'Adobe_After_Effects',
    description: 'Adobe 动态图形与视觉效果软件',
    langs: { en: { aliases: ['AE'], wikiPath: 'Adobe_After_Effects' } },
  },
  {
    id: 'procreate',
    term: 'Procreate',
    wikiPath: 'Procreate_(软件)',
    description: 'iPad 数字绘画应用',
    langs: {
      en: { wikiPath: 'Procreate_(software)' },
    },
  },
  {
    id: 'onedrive',
    term: 'OneDrive',
    wikiPath: 'OneDrive',
    description: 'Microsoft 提供的云存储服务',
    langs: { en: { wikiPath: 'OneDrive' } },
  },
  {
    id: 'cloudflare',
    term: 'Cloudflare',
    wikiPath: 'Cloudflare',
    description: '内容分发网络与网络安全服务商',
  },
  {
    id: 'rime',
    term: 'RIME',
    aliases: ['中州韵', '小狼毫', '鼠须管'],
    wikiPath: '中州韵输入法引擎',
    description: '开源跨平台输入法框架',
    langs: {
      en: { aliases: ['RIME', 'Rime'], wikiPath: 'RIME_(input_method_engine)' },
    },
  },
  {
    id: 'calibre',
    term: 'Calibre',
    wikiPath: 'Calibre',
    description: '电子书管理与转换工具',
    langs: { en: { wikiPath: 'Calibre_(software)' } },
  },
  {
    id: 'homebrew',
    term: 'Homebrew',
    wikiPath: 'Homebrew',
    description: 'macOS / Linux 软件包管理器',
    langs: { en: { wikiPath: 'Homebrew_(package_manager)' } },
  },
  {
    id: 'n8n',
    term: 'n8n',
    url: 'https://n8n.io',
    description: '开源工作流自动化工具',
  },
  {
    id: 'memos',
    term: 'Memos',
    url: 'https://usememos.com',
    description: '开源轻量级笔记服务',
  },
  {
    id: 'miniflux',
    term: 'Miniflux',
    url: 'https://miniflux.app',
    description: '极简自托管 RSS 阅读器',
  },
  {
    id: 'reeder',
    term: 'Reeder',
    url: 'https://reederapp.com',
    description: 'Apple 平台 RSS 阅读客户端',
  },
  {
    id: 'folo',
    term: 'Folo',
    aliases: ['Follow'],
    url: 'https://folo.is',
    description: '信息聚合与订阅工具',
  },
  {
    id: 'rsshub',
    term: 'RSSHub',
    url: 'https://rsshub.app',
    description: '开源 RSS 生成器，为各种网站生成订阅源',
  },
  {
    id: 'affine',
    term: 'Affine',
    url: 'https://affine.pro',
    description: '集文档、白板、数据库于一体的协作工具',
  },
  {
    id: 'flomo',
    term: 'Flomo',
    url: 'https://flomoapp.com',
    description: '碎片化输入的笔记应用',
  },
  {
    id: 'syncthing',
    term: 'Syncthing',
    url: 'https://syncthing.net',
    description: '开源去中心化文件同步工具',
  },
  {
    id: 'unity',
    term: 'Unity',
    wikiPath: 'Unity_(游戏引擎)',
    description: '跨平台游戏引擎与实时 3D 开发平台',
    langs: {
      en: { wikiPath: 'Unity_(game_engine)' },
    },
  },
  {
    id: 'proxmox',
    term: 'Proxmox',
    url: 'https://www.proxmox.com',
    description: '提供服务器虚拟化与开源基础设施解决方案的项目',
  },
  {
    id: 'pve',
    term: 'PVE',
    aliases: ['Proxmox VE'],
    url: 'https://www.proxmox.com/en/proxmox-ve',
    description: 'Proxmox Virtual Environment，基于 KVM 和 LXC 的服务器虚拟化平台',
  },
  {
    id: 'hackintosh',
    term: 'Hackintosh',
    aliases: ['黑苹果'],
    wikiPath: 'Hackintosh',
    description: '在非 Apple 硬件上运行 macOS',
    langs: { en: { aliases: ['Hackintosh'], wikiPath: 'Hackintosh' } },
  },

  // ────────── 知识管理 ──────────
  {
    id: 'notion',
    term: 'Notion',
    wikiPath: 'Notion',
    description: '一体化工作空间应用',
  },
  {
    id: 'obsidian',
    term: 'Obsidian',
    wikiPath: 'Obsidian_(软件)',
    description: '本地优先的 Markdown 知识库',
    langs: {
      en: { wikiPath: 'Obsidian_(software)' },
    },
  },
  {
    id: 'yinxiang',
    term: '印象笔记',
    wikiPath: '印象笔记',
    description: '跨平台笔记应用',
    langs: {
      en: { aliases: ['Evernote'], wikiPath: 'Evernote' },
    },
  },
  {
    id: 'applescript',
    term: 'AppleScript',
    wikiPath: 'AppleScript',
    description: 'macOS 系统级脚本语言',
  },

  // ────────── 艺术 / 文化 ──────────
  {
    id: 'impressionism',
    term: '印象派',
    wikiPath: '印象派',
    description: '19 世纪起源于法国的绘画流派',
    langs: {
      en: { aliases: ['Impressionism'], wikiPath: 'Impressionism' },
    },
  },
  {
    id: 'c4d',
    term: 'C4D',
    aliases: ['Cinema 4D'],
    wikiPath: 'CINEMA_4D',
    description: 'Maxon 出品的 3D 建模、动画与渲染软件',
    langs: {
      en: { aliases: ['Cinema 4D'], wikiPath: 'CINEMA_4D' },
    },
  },

  // ────────── 开发 / 协作工具 ──────────
  {
    id: 'smtp',
    term: 'SMTP',
    wikiPath: 'SMTP',
    description: '简单邮件传输协议',
    langs: {
      en: { aliases: ['Simple Mail Transfer Protocol'], wikiPath: 'Simple_Mail_Transfer_Protocol' },
    },
  },
  {
    id: 'wps',
    term: 'WPS',
    wikiPath: 'WPS_Office',
    description: '金山办公旗下办公软件套件',
    langs: { en: { wikiPath: 'WPS_Office' } },
  },
  {
    id: 'vscode',
    term: 'VSCode',
    aliases: ['Visual Studio Code'],
    wikiPath: 'Visual_Studio_Code',
    description: 'Microsoft 推出的跨平台代码编辑器',
    langs: {
      en: { aliases: ['Visual Studio Code'], wikiPath: 'Visual_Studio_Code' },
    },
  },
  {
    id: 'github-desktop',
    term: 'GitHub Desktop',
    url: 'https://desktop.github.com/',
    description: 'GitHub 官方 GUI 客户端',
  },
  {
    id: 'github-pages',
    term: 'GitHub Pages',
    url: 'https://pages.github.com/',
    description: 'GitHub 提供的静态站点托管服务',
  },
  {
    id: 'webdav',
    term: 'WebDAV',
    wikiPath: 'WebDAV',
    description: '基于 HTTP 的分布式文件协作协议',
    langs: {
      en: { aliases: ['Web Distributed Authoring and Versioning'], wikiPath: 'WebDAV' },
    },
  },
  {
    id: 'ddns',
    term: 'DDNS',
    aliases: ['动态域名系统', '动态DNS'],
    wikiPath: '动态域名系统',
    description: '动态 DNS，将动态 IP 映射到固定域名的服务',
    langs: {
      en: { aliases: ['Dynamic DNS', 'dynamic DNS'], wikiPath: 'Dynamic_DNS' },
    },
  },
  {
    id: 'safari',
    term: 'Safari',
    wikiPath: 'Safari',
    description: 'Apple 推出的网页浏览器',
    langs: { en: { wikiPath: 'Safari_(web_browser)' } },
  },
  {
    id: 'chrome',
    term: 'Chrome',
    wikiPath: 'Google_Chrome',
    description: 'Google 推出的网页浏览器',
    langs: { en: { wikiPath: 'Google_Chrome' } },
  },
  {
    id: 'astro',
    term: 'Astro',
    wikiPath: 'Astro_(software)',
    description: '面向内容驱动型网站的前端框架',
    langs: {
      en: { wikiPath: 'Astro_(software)' },
    },
  },
  {
    id: 'service-worker',
    term: 'Service Worker',
    aliases: ['ServiceWorker'],
    wikiPath: '服务工作线程',
    description: '浏览器后台脚本，可拦截网络请求实现离线缓存等能力',
    langs: {
      en: { aliases: ['ServiceWorker'], wikiPath: 'Service_worker' },
    },
  },
  {
    id: 'dall-e',
    term: 'DALL-E',
    aliases: ['DALL·E', 'DALLE'],
    url: 'https://openai.com/dall-e-3',
    description: 'OpenAI 发布的文本生成图像模型',
    langs: {
      en: { description: 'OpenAI text-to-image generation model' },
    },
  },
  {
    id: 'tailwind-css',
    term: 'Tailwind CSS',
    url: 'https://tailwindcss.com/',
    description: 'Utility-first CSS 框架',
    langs: {
      en: { description: 'Utility-first CSS framework' },
    },
  },
  {
    id: 'llm',
    term: 'LLM',
    aliases: ['大语言模型', 'Large Language Model'],
    wikiPath: '大语言模型',
    description: '大语言模型，Large Language Model',
    langs: {
      en: { aliases: ['Large Language Model', 'large language model'], wikiPath: 'Large_language_model' },
    },
  },
  {
    id: 'prompt',
    term: 'Prompt',
    aliases: ['提示词'],
    wikiPath: '提示工程',
    description: '向 AI 模型输入的指令文本，引导模型生成期望的输出',
    langs: {
      en: { aliases: ['prompt engineering'], wikiPath: 'Prompt_engineering' },
    },
  },
  {
    id: 'html',
    term: 'HTML',
    aliases: ['HyperText Markup Language'],
    wikiPath: 'HTML',
    description: '超文本标记语言',
    langs: {
      en: { wikiPath: 'HTML' },
    },
  },
  {
    id: 'css',
    term: 'CSS',
    aliases: ['Cascading Style Sheets'],
    wikiPath: 'CSS',
    description: '层叠样式表',
    langs: {
      en: { wikiPath: 'CSS' },
    },
  },
  {
    id: 'javascript',
    term: 'JavaScript',
    wikiPath: 'JavaScript',
    description: '网页脚本编程语言',
    langs: {
      en: { wikiPath: 'JavaScript' },
    },
  },
  {
    id: 'dom',
    term: 'DOM',
    aliases: ['文档对象模型', 'Document Object Model'],
    wikiPath: '文档对象模型',
    description: '文档对象模型，网页的编程接口',
    langs: {
      en: { wikiPath: 'Document_Object_Model' },
    },
  },
  {
    id: 'json',
    term: 'JSON',
    aliases: ['JavaScript Object Notation'],
    wikiPath: 'JSON',
    description: '轻量级数据交换格式',
    langs: {
      en: { wikiPath: 'JSON' },
    },
  },
  {
    id: 'svg',
    term: 'SVG',
    aliases: ['Scalable Vector Graphics'],
    wikiPath: 'SVG',
    description: '可缩放矢量图形格式',
    langs: {
      en: { aliases: ['Scalable Vector Graphics'], wikiPath: 'SVG' },
    },
  },
  {
    id: 'react',
    term: 'React',
    wikiPath: 'React',
    description: 'Meta 开发的声明式 UI 组件库',
    langs: {
      en: { wikiPath: 'React_(JavaScript_library)' },
    },
  },
  {
    id: 'vite',
    term: 'Vite',
    url: 'https://vite.dev',
    description: '新一代前端构建与开发工具',
  },
  {
    id: 'threejs',
    term: 'Three.js',
    wikiPath: 'Three.js',
    description: 'Web 3D 图形 JavaScript 库',
    langs: {
      en: { wikiPath: 'Three.js' },
    },
  },
  {
    id: 'vpn',
    term: 'VPN',
    aliases: ['虚拟专用网络', 'Virtual Private Network', '虚拟私人网络'],
    wikiPath: '虚拟私人网络',
    description: '虚拟专用网络，通过加密通道安全访问远程网络',
    langs: {
      en: { aliases: ['Virtual Private Network', 'virtual private network'], wikiPath: 'Virtual_private_network' },
    },
  },
  {
    id: 'vps',
    term: 'VPS',
    aliases: ['虚拟专用服务器', 'Virtual Private Server'],
    wikiPath: '虚拟专用服务器',
    description: '虚拟专用服务器',
    langs: {
      en: { aliases: ['Virtual private server', 'virtual private server'], wikiPath: 'Virtual_private_server' },
    },
  },
  {
    id: 'cdn',
    term: 'CDN',
    aliases: ['内容分发网络', 'Content Delivery Network'],
    wikiPath: '内容分发网络',
    description: '内容分发网络，通过分布式节点加速内容传输',
    langs: {
      en: { aliases: ['Content delivery network', 'content delivery network'], wikiPath: 'Content_delivery_network' },
    },
  },
  {
    id: 'wireguard',
    term: 'WireGuard',
    wikiPath: 'WireGuard',
    description: '现代 VPN 协议，以高性能和简洁代码著称',
    langs: {
      en: { wikiPath: 'WireGuard' },
    },
  },
  {
    id: 'tailscale',
    term: 'Tailscale',
    url: 'https://tailscale.com',
    description: '基于 WireGuard 的零配置 VPN 组网服务',
  },
  {
    id: 'frp',
    term: 'frp',
    url: 'https://github.com/fatedier/frp',
    description: '开源内网穿透反向代理工具',
  },
  {
    id: 'plex',
    term: 'Plex',
    wikiPath: 'Plex',
    description: '多媒体服务器与流媒体管理软件',
    langs: {
      en: { wikiPath: 'Plex_(company)' },
    },
  },
  {
    id: 'synology',
    term: '群晖',
    aliases: ['Synology'],
    wikiPath: 'Synology',
    description: 'Synology 群晖科技推出的网络附加存储设备品牌',
    langs: {
      en: { aliases: ['Synology'], wikiPath: 'Synology' },
    },
  },
  {
    id: 'alist',
    term: 'Alist',
    url: 'https://alist.nn.ci',
    description: '开源文件列表程序，支持多种存储后端挂载',
  },
  {
    id: 'adguard-home',
    term: 'AdGuard Home',
    url: 'https://adguard.com/adguard-home.html',
    description: '网络级广告拦截与 DNS 过滤服务',
  },
  {
    id: 'self-hosted',
    term: '自托管',
    aliases: ['Self-hosted', '自部署'],
    url: 'https://zh.wikipedia.org/wiki/自托管',
    description: '自行部署运维应用而非使用云服务的模式',
    langs: {
      en: { aliases: ['Self-hosting', 'self-hosted'], wikiPath: 'Self-hosting_(web_services)' },
    },
  },
  {
    id: 'side-router',
    term: '旁路由',
    aliases: ['旁路网关', '旁路路由'],
    description: '以旁路模式接入网络的路由器或网关设备',
    wikiPath: '网关',
    langs: {
      en: { aliases: ['secondary router', 'bypass gateway'], wikiPath: 'Gateway_(telecommunications)' },
    },
  },
  {
    id: 'obs',
    term: 'OBS',
    aliases: ['Open Broadcaster Software', 'OBS Studio'],
    wikiPath: 'Open_Broadcaster_Software',
    description: '开源直播推流与屏幕录制软件',
    langs: {
      en: { aliases: ['Open Broadcaster Software', 'OBS Studio'], wikiPath: 'Open_Broadcaster_Software' },
    },
  },
  {
    id: 'blender',
    term: 'Blender',
    wikiPath: 'Blender',
    description: '开源 3D 建模、动画与渲染软件',
    langs: {
      en: { wikiPath: 'Blender_(software)' },
    },
  },
  {
    id: 'figma',
    term: 'Figma',
    wikiPath: 'Figma',
    url: 'https://www.figma.com',
    description: '协作式界面设计工具',
    langs: {
      en: { wikiPath: 'Figma' },
    },
  },
  {
    id: 'eagle',
    term: 'Eagle',
    url: 'https://eagle.cool',
    description: '设计师素材管理与收集工具',
  },
  {
    id: 'anki',
    term: 'Anki',
    wikiPath: 'Anki_(软件)',
    description: '基于间隔重复的记忆学习软件',
    langs: {
      en: { wikiPath: 'Anki_(software)' },
    },
  },
  {
    id: 'tmux',
    term: 'tmux',
    wikiPath: 'Tmux',
    description: '终端复用器，支持多窗口与会话管理',
    langs: {
      en: { wikiPath: 'Tmux' },
    },
  },
  {
    id: 'second-brain',
    term: '第二大脑',
    aliases: ['Second Brain'],
    wikiPath: '第二大脑',
    description: '基于笔记和知识管理的个人知识体系方法论',
    langs: {
      en: { aliases: ['Second Brain', 'second brain'], wikiPath: 'Second_brain_(productivity)' },
    },
  },
  {
    id: 'bidirectional-link',
    term: '双向链接',
    description: '知识管理系统中文档之间相互关联的链接结构',
    wikiPath: 'Help:链接',
    langs: {
      en: { aliases: ['bidirectional linking', 'bidirectional link', 'Wikilink'], wikiPath: 'Help:Link' },
    },
  },
  {
    id: 'seo-backlink',
    term: '反向链接',
    aliases: ['Backlink'],
    description: '其他网站指向目标网站的外部链接',
    langs: {
      en: { aliases: ['Backlink'], wikiPath: 'Backlink' },
    },
  },
  {
    id: 'scp',
    term: 'SCP',
    aliases: ['SCP基金会', 'SCP Foundation', 'SCP財團'],
    wikiPath: 'SCP基金会',
    description: 'SCP 基金会，围绕超自然收容的共创写作宇宙',
    langs: {
      en: { aliases: ['SCP Foundation'], wikiPath: 'SCP_Foundation' },
    },
  },
  {
    id: 'seo',
    term: 'SEO',
    aliases: ['搜索引擎优化', 'Search Engine Optimization'],
    wikiPath: '搜索引擎优化',
    description: '通过优化网站结构、内容和技术因素，提高搜索引擎自然排名',
    langs: {
      en: { aliases: ['Search engine optimization', 'search engine optimization'], wikiPath: 'Search_engine_optimization' },
    },
  },
]
