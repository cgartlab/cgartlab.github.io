/**
 * 术语表：构建时由 rehype-glossary 插件扫描正文，
 * 首次出现时自动包裹为维基百科链接。
 *
 * 维护规则：
 * 1. 只收录单义词或领域专属术语；多义词不收
 * 2. term 是正文里的字面匹配字符串（区分大小写）
 * 3. langs 下的 aliases 提供额外匹配形式（如英文别名）
 * 4. 修改 wikiPath 等价于修改所有引用文章里的链接目标
 */

import type { Language } from '@/i18n/config'

export interface TermLangOverride {
  /** 该语言下额外的匹配形式（不影响 term 主形式） */
  aliases?: string[]
  /** 该语言下指向的 wikiPath；不填则回退到顶层 wikiPath */
  wikiPath?: string
}

export interface TermEntry {
  /** 唯一 ID，全局稳定（删除后不要复用） */
  id: string
  /** 主形式，正文里出现这个字符串就会被匹配 */
  term: string
  /** 跨语言别名（任一语言下命中即匹配） */
  aliases?: string[]
  /** 顶层 wikiPath（默认指向中文维基） */
  wikiPath: string
  /** 各语言覆盖 */
  langs?: Partial<Record<Language, TermLangOverride>>
  /** 简短描述（用于审计报告，可选） */
  description?: string
}

export const glossary: TermEntry[] = [
  // ────────── 技术类 ──────────
  {
    id: 'rss',
    term: 'RSS',
    wikiPath: 'RSS',
    description: '一种基于 XML 的内容订阅协议',
    langs: {
      en: { aliases: ['Really Simple Syndication', 'Rich Site Summary'] },
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
    term: '代理',
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
    term: '终端',
    wikiPath: '终端',
    description: '计算机终端模拟器',
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
    id: 'ai',
    term: 'AI',
    aliases: ['人工智能'],
    wikiPath: '人工智能',
    description: '人工智能技术',
    langs: {
      en: { aliases: ['Artificial intelligence', 'artificial intelligence'], wikiPath: 'Artificial_intelligence' },
      'zh-tw': { aliases: ['人工智慧'], wikiPath: '人工智慧' },
    },
  },
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
    id: 'cloudflare',
    term: 'Cloudflare',
    wikiPath: 'Cloudflare',
    description: '内容分发网络与网络安全服务商',
  },

  // ────────── 知识管理类 ──────────
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

  // ────────── 艺术/创作类 ──────────
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
    id: 'applescript',
    term: 'AppleScript',
    wikiPath: 'AppleScript',
    description: 'macOS 系统级脚本语言',
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
]
