/**
 * 术语表工具函数
 * 提供维基百科 URL 生成、术语解析、匹配候选词生成等纯函数
 */

import type { TermEntry, TermLangOverride } from '@/data/glossary'
import type { Language } from '@/i18n/config'

/**
 * 维基百科语言子域映射
 * - zh-tw 没有独立子域，统一走 zh 子域（维基百科无独立繁体子域，繁体字 zh 版可用）
 * - en 走 en 子域
 */
export const WIKI_LANG_HOST: Record<Language, string> = {
  'zh': 'zh.wikipedia.org',
  'zh-tw': 'zh.wikipedia.org',
  'en': 'en.wikipedia.org',
}

/**
 * 解析当前文章语言下术语的有效 wikiPath
 */
export function resolveWikiPath(entry: TermEntry, lang: Language): string | undefined {
  const override = entry.langs?.[lang]
  return override?.wikiPath ?? entry.wikiPath
}

/**
 * 解析当前文章语言下术语的自定义 URL（如有）
 */
function resolveUrl(entry: TermEntry, lang: Language): string | undefined {
  const override = entry.langs?.[lang]
  return override?.url ?? entry.url
}

/**
 * 生成链接 URL
 * 优先级：自定义 url > 维基百科 URL
 */
export function resolveLinkUrl(entry: TermEntry, lang: Language): string {
  const custom = resolveUrl(entry, lang)
  if (custom)
    return custom
  const path = resolveWikiPath(entry, lang)
  if (!path)
    return ''
  return `https://${WIKI_LANG_HOST[lang]}/wiki/${encodeURIComponent(path)}`
}

/**
 * 解析当前文章语言下术语的有效 aliases
 * 返回空数组表示无额外匹配形式
 */
export function resolveAliases(entry: TermEntry, lang: Language): string[] {
  const override: TermLangOverride | undefined = entry.langs?.[lang]
  return override?.aliases ?? []
}

/**
 * 英文术语描述回退表（用于 langs.en.description 不存在时的兜底）
 */
const EN_DESCRIPTIONS: Record<string, string> = {
  'rss': 'An XML-based content syndication protocol',
  'xml': 'Extensible Markup Language',
  'git': 'Distributed version control system',
  'docker': 'Containerization platform for application deployment',
  'winget': 'Windows package manager',
  'api': 'Application programming interface',
  'proxy': 'Network proxy server',
  'private-cloud': 'Enterprise on-premises cloud infrastructure',
  'terminal': 'Computer terminal emulator',
  'raid': 'Redundant array of independent disks',
  'macos': 'Apple desktop operating system',
  'windows': 'Microsoft desktop/server operating system',
  'linux': 'Open-source Unix-like operating system kernel',
  'github': 'Git-based code hosting and collaboration platform',
  'markdown': 'Lightweight markup language',
  'nas': 'Network-attached storage device',
  'dns': 'Domain Name System, resolves domain names to IP addresses',
  'ssh': 'Secure Shell protocol for encrypted remote login',
  'http': 'Hypertext Transfer Protocol',
  'ipv6': 'Internet Protocol version 6',
  'nat-traversal': 'Technology for accessing internal network hosts through NAT',
  'powershell': 'Cross-platform task automation and configuration management command-line shell',
  'wsl': 'Windows Subsystem for Linux',
  'ai': 'Artificial intelligence technology',
  'gemini': 'Google multimodal large language model',
  'chatgpt': 'Conversational large language model by OpenAI',
  'claude': 'Large language model by Anthropic',
  'ollama': 'Tool for running large language models locally',
  'cursor': 'AI-first code editor',
  'kimi': 'AI assistant by Moonshot AI',
  'minimax': 'Multimodal large language model and AI products by MiniMax',
  'openclaw': 'Open-source AI Agent platform',
  'opencode': 'AI-driven terminal coding assistant',
  'wordpress': 'Open-source content management system',
  'telegram': 'Cross-platform instant messaging application',
  'photoshop': 'Adobe image editing software',
  'after-effects': 'Adobe motion graphics and visual effects software',
  'procreate': 'iPad digital painting application',
  'onedrive': 'Microsoft cloud storage service',
  'cloudflare': 'Content delivery network and web security services provider',
  'rime': 'Open-source cross-platform input method engine',
  'calibre': 'E-book management and conversion tool',
  'homebrew': 'macOS/Linux package manager',
  'n8n': 'Open-source workflow automation tool',
  'memos': 'Open-source lightweight note-taking service',
  'miniflux': 'Minimalist self-hosted RSS reader',
  'reeder': 'RSS reading client for Apple platforms',
  'folo': 'Information aggregation and subscription tool',
  'rsshub': 'Open-source RSS generator that creates feeds for various websites',
  'affine': 'Collaboration tool integrating documents, whiteboards, and databases',
  'flomo': 'Note-taking app for frictionless input',
  'syncthing': 'Open-source decentralized file synchronization tool',
  'unity': 'Cross-platform game engine and real-time 3D development platform',
  'proxmox': 'Open-source virtualization environment supporting containers and VM management',
  'pve': 'Proxmox Virtual Environment, open-source virtualization platform',
  'hackintosh': 'Running macOS on non-Apple hardware',
  'notion': 'All-in-one workspace application',
  'obsidian': 'Local-first Markdown knowledge base',
  'yinxiang': 'Cross-platform note-taking application',
  'applescript': 'macOS system-level scripting language',
  'impressionism': '19th-century painting movement originating in France',
  'c4d': 'Maxon 3D modeling, animation and rendering software',
  'smtp': 'Simple Mail Transfer Protocol',
  'wps': 'Kingsoft office software suite',
  'vscode': 'Microsoft cross-platform code editor',
  'github-desktop': 'GitHub official GUI client',
  'github-pages': 'GitHub static site hosting service',
  'webdav': 'HTTP-based distributed file collaboration protocol',
  'ddns': 'Dynamic DNS, maps dynamic IP addresses to fixed domain names',
  'safari': 'Apple web browser',
  'chrome': 'Google web browser',
  'astro': 'Frontend framework for content-driven websites',
  'service-worker': 'Browser background script for offline caching and network interception',
}

/**
 * 解析当前语言下术语的描述文本
 * 优先级：各语言 description > 顶层 description > term 名称
 */
export function resolveDescription(entry: TermEntry, lang: Language): string {
  const override = entry.langs?.[lang]
  if (override?.description)
    return override.description
  if (lang === 'zh' || lang === 'zh-tw') {
    return entry.description ?? entry.term
  }
  // 非默认语言：使用英文术语描述表
  const enDesc = EN_DESCRIPTIONS[entry.id]
  if (enDesc)
    return enDesc
  // 纯 ASCII 术语名（如 “Git”、“Linux”）显示术语本身
  if (/^[\x20-\x7E]+$/.test(entry.term))
    return entry.term
  // 中文术语名（如 “代理”）留空
  return ''
}

/**
 * 英文术语名称回退表（用于中文术语名的英文显示）
 */
const EN_TERMS: Record<string, string> = {
  'proxy': 'Proxy',
  'private-cloud': 'Private Cloud',
  'terminal': 'Terminal',
  'nat-traversal': 'NAT Traversal',
  'yinxiang': 'Evernote',
  'impressionism': 'Impressionism',
}

/**
 * 解析当前语言下术语的显示名称
 * 优先级：各语言 term > 英文术语名称表 > 顶层 term
 */
export function resolveTerm(entry: TermEntry, lang: Language): string {
  const override = entry.langs?.[lang]
  if (override?.term)
    return override.term
  if (lang === 'en') {
    const enTerm = EN_TERMS[entry.id]
    if (enTerm)
      return enTerm
  }
  return entry.term
}

/**
 * 生成维基百科完整 URL
 * @example buildWikiUrl({ term: 'RSS', wikiPath: 'RSS', ... }, 'zh')
 *   → 'https://zh.wikipedia.org/wiki/RSS'
 */
export function buildWikiUrl(entry: TermEntry, lang: Language): string {
  const path = resolveWikiPath(entry, lang)
  if (!path)
    return ''
  return `https://${WIKI_LANG_HOST[lang]}/wiki/${encodeURIComponent(path)}`
}

/**
 * 为术语生成所有匹配候选（term 主形式 + 当前语言 aliases + 全局 aliases）
 * 按长度降序返回（最长优先匹配）
 */
export function getMatchCandidates(entry: TermEntry, lang: Language): string[] {
  const candidates: string[] = [entry.term]
  if (entry.aliases)
    candidates.push(...entry.aliases)
  const langAliases = resolveAliases(entry, lang)
  if (langAliases.length > 0)
    candidates.push(...langAliases)
  // 去重
  const seen = new Set<string>()
  const unique: string[] = []
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c)
      unique.push(c)
    }
  }
  // 按长度降序（长的优先匹配，避免"Script"覆盖"AppleScript"）
  return unique.sort((a, b) => b.length - a.length)
}
