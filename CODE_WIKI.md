# CG艺术实验室 — Code Wiki

> 项目地址：https://github.com/cgartlab/cgartlab.github.io  
> 线上站点：https://cgartlab.com  
> 技术栈：Astro 6 + TypeScript + UnoCSS + MDX + KaTeX + Mermaid  
> 包管理器：pnpm 10.33.0

---

## 1. 项目整体架构

### 1.1 架构概览

本项目是一个基于 **Astro 6** 构建的静态博客/作品集网站，采用 ** Islands Architecture（岛屿架构）** 与 **SSG（静态站点生成）** 模式。核心特征包括：

- **多语言 i18n**：支持简体中文（zh）、英文（en）、繁体中文（zh-tw）
- **内容驱动**：使用 Astro Content Collections 管理 Markdown/MDX 内容
- **主题系统**：支持亮色/暗色/自动模式，基于 OKLCH 色彩空间
- **视图过渡**：基于 Astro ClientRouter 实现页面间平滑过渡
- **评论系统**：支持 Giscus（GitHub Discussions）、Twikoo、Waline 三种评论后端

### 1.2 目录结构

```text
cgartlab.github.io/
├── .github/                  # GitHub 配置（Issue 模板、Workflows）
├── .trae/rules/              # AI Agent 规则配置
├── patches/                  # pnpm 补丁（@qwik.dev/partytown）
├── public/                   # 静态资源（不经过构建处理）
│   ├── feeds/                # RSS/Atom XSLT 样式表
│   ├── fonts/                # 自托管字体（EarlySummer、STIX、Snell 等）
│   ├── giscus/               # Giscus 主题 CSS
│   ├── icons/                # 网站图标（favicon、OG 图片）
│   ├── images/               # 静态图片
│   └── sounds/               # UI 音效文件
├── scripts/                  # 构建与内容管理脚本
│   ├── apply-lqip.ts         # LQIP（低质量图片占位）生成
│   ├── format-posts.ts       # CJK 文本格式化
│   ├── generate-llms.ts      # 生成 llms.txt（LLM 站点索引）
│   ├── new-post.ts           # 创建新文章脚手架
│   └── search-lang-check.ts  # 搜索语言配置检查
├── src/
│   ├── assets/               # 构建时资源（图标、模板、LQIP 映射）
│   ├── components/           # Astro 组件
│   │   ├── Comment/          # 评论系统组件
│   │   ├── Widgets/          # 功能小部件
│   │   └── *.astro           # 页面级组件
│   ├── content/              # 内容集合（Markdown/MDX）
│   │   ├── about/            # 关于页面内容
│   │   └── posts/            # 博客文章
│   │       ├── _images/      # 文章图片
│   │       ├── weekly/       # 玄光周刊
│   │       └── works/        # 作品集
│   ├── data/                 # 数据文件
│   │   └── links.ts          # 友链/资源数据
│   ├── i18n/                 # 国际化配置
│   │   ├── config.ts         # 语言映射配置
│   │   ├── lang.ts           # 语言工具函数
│   │   ├── path.ts           # 路径本地化工具
│   │   └── ui.ts             # UI 文案翻译
│   ├── layouts/              # 布局组件
│   │   ├── Head.astro        # HTML <head> 模板
│   │   └── Layout.astro      # 主页面布局
│   ├── pages/                # 路由页面
│   │   ├── [...lang]/        # 多语言路由
│   │   │   ├── posts/[slug].astro   # 文章详情页
│   │   │   ├── tags/                # 标签页
│   │   │   ├── about.astro          # 关于页
│   │   │   ├── links.astro          # 资源页
│   │   │   ├── weekly.astro         # 周刊列表页
│   │   │   ├── works.astro          # 作品集页
│   │   │   ├── rss.xml.ts           # RSS 订阅源
│   │   │   └── atom.xml.ts          # Atom 订阅源
│   │   ├── api/search-index/        # 搜索索引 API
│   │   ├── og/[...image].ts         # Open Graph 图片生成
│   │   └── 404.astro                # 404 页面
│   ├── plugins/              # Markdown/Rehype/Remark 插件
│   ├── styles/               # 全局样式
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
│       ├── adsense.ts        # AdSense 工具
│       ├── cache.ts          # 记忆化缓存
│       ├── content.ts        # 内容查询与处理
│       ├── description.ts    # 文章摘要生成
│       ├── feed.ts           # RSS/Atom 订阅源生成
│       ├── page.ts           # 页面类型判断
│       └── search.ts         # 搜索语言规范化
├── astro.config.ts           # Astro 主配置
├── src/config.ts             # 主题配置
├── src/content.config.ts     # 内容集合配置
├── eslint.config.mjs         # ESLint 配置
├── package.json              # 项目依赖与脚本
└── pnpm-workspace.yaml       # pnpm 工作区配置
```

---

## 2. 主要模块职责

### 2.1 配置层（Config Layer）

#### `src/config.ts` — 主题配置中心

项目的核心配置文件，导出 `themeConfig` 对象，涵盖：

| 配置区块 | 说明 |
|---------|------|
| `site` | 站点标题、副标题、描述、作者、URL、基础路径、图标 |
| `color` | 主题模式（light/dark/auto）及 OKLCH 色彩定义 |
| `global` | 默认语言、字体样式、日期格式、TOC、KaTeX、减少动画 |
| `comment` | 评论系统开关及 Giscus/Twikoo/Waline 参数 |
| `seo` | 搜索引擎验证、分析 ID、AdSense、Folo 订阅 |
| `footer` | 社交链接、起始年份、字数统计开关 |
| `preload` | 图片托管 URL、自定义分析 JS |

同时导出派生常量：`base`、`defaultLocale`、`moreLocales`、`allLocales`。

#### `src/content.config.ts` — 内容集合模式定义

使用 Astro 的 `defineCollection` 和 Zod 定义内容模式：

- **`posts`** 集合：文章必需字段 `title`、`published`；可选字段 `description`、`updated`、`tags`、`draft`、`pin`、`toc`、`lang`、`abbrlink`
- **`about`** 集合：关于页面，仅 `lang` 字段
- **`privacy`** 集合：隐私政策页面，仅 `lang` 字段

#### `astro.config.ts` — Astro 框架配置

| 配置项 | 值/说明 |
|-------|--------|
| `site` | 从 `themeConfig.site.url` 读取 |
| `trailingSlash` | `'always'`（**严禁修改**） |
| `prefetch` | `prefetchAll: true`，`defaultStrategy: 'viewport'` |
| `i18n` | 基于 `langMap` 的多语言路由配置 |
| `integrations` | UnoCSS、MDX、Partytown、Sitemap、Compress |
| `markdown.remarkPlugins` | directive、math、container directives、leaf directives、reading time |
| `markdown.rehypePlugins` | KaTeX、Mermaid、slug、heading anchor、image processor、external links、code copy button |
| `markdown.syntaxHighlight` | Shiki，主题 `github-light` / `github-dark` |

### 2.2 国际化层（i18n Layer）

位于 `src/i18n/`，实现完整的多语言支持：

| 文件 | 职责 |
|-----|------|
| `config.ts` | 定义 `Language` 类型、`langMap`（语言代码映射）、各评论系统的语言映射 |
| `ui.ts` | 各语言的 UI 文案（标题、导航、搜索、TOC 等） |
| `lang.ts` | 语言工具函数：`getLangRouteParam`、`getLangFromLocale`、`getLangFromPath`、`getNextGlobalLang` |
| `path.ts` | 路径本地化工具：`getTagPath`、`getPostPath`、`getLocalizedPath`、`getNextLangPath` |

**URL 路由规则**：
- 默认语言（zh）：`/`、`/posts/`、`/tags/`
- 其他语言：`/en/`、`/en/posts/`、`/zh-tw/`、`/zh-tw/posts/`

### 2.3 布局层（Layout Layer）

#### `src/layouts/Layout.astro` — 主布局

所有页面的根布局组件，职责：
- 引入全局样式（`global.css`、`markdown.css`、`font.css`、`transition.css`、`comment.css`、`extension.css`、`lqip.css`）
- 渲染 `<html>`、`<body>` 及页面骨架（Header、Navbar、main、Footer）
- 注入全局交互组件（Button、SoundEffect、CodeCopyButton、GithubCard、MediaEmbed、ImageZoom、Search）
- 接收 `postTitle`、`postDescription`、`postSlug`、`supportedLangs` props

#### `src/layouts/Head.astro` — HTML Head 模板

职责：
- 主题初始化脚本（防止 FOUC 闪烁）
- Meta 标签（charset、viewport、description、author、theme-color）
- Favicon 与字体预加载
- Open Graph / Twitter Card 元数据
- 搜索引擎验证标签
- JSON-LD 结构化数据（Article / WebSite）
- Google Analytics、Umami Analytics、Google AdSense 脚本（通过 Partytown 异步加载）
- Astro ClientRouter（视图过渡）

### 2.4 组件层（Component Layer）

#### 页面结构组件

| 组件 | 职责 |
|-----|------|
| `Header.astro` | 站点标题与副标题，支持 i18n，文章页使用 `<h2>` |
| `Navbar.astro` | 导航栏（文章、作品、周刊、资源、标签、关于），支持高亮当前页 |
| `Footer.astro` | 社交链接、版权信息、字数统计、隐私政策链接 |
| `Button.astro` | 浮动按钮组（主题切换、语言切换、回到顶部） |

#### 内容组件

| 组件 | 职责 |
|-----|------|
| `PostList.astro` | 文章列表渲染，支持置顶标识、阅读时间、摘要 |
| `PostDate.astro` | 文章日期与阅读时间展示 |
| `TagList.astro` | 标签列表渲染 |
| `Search.astro` | 全站搜索 UI（客户端实现，支持防抖、高亮、评分排序） |
| `AIDisclaimer.astro` | AI 生成内容声明 |

#### 评论组件（`src/components/Comment/`）

| 组件 | 职责 |
|-----|------|
| `Index.astro` | 评论系统入口，根据配置加载 Giscus/Twikoo/Waline |
| `Giscus.astro` | GitHub Discussions 评论嵌入 |
| `Twikoo.astro` | Twikoo 评论系统嵌入 |
| `Waline.astro` | Waline 评论系统嵌入 |

#### 功能组件（`src/components/Widgets/`）

| 组件 | 职责 |
|-----|------|
| `TOC.astro` | 文章目录（Table of Contents） |
| `BackButton.astro` | 返回按钮 |
| `CodeCopyButton.astro` | 代码块复制按钮 |
| `GithubCard.astro` | GitHub 仓库卡片嵌入 |
| `ImageZoom.astro` | 图片点击放大 |
| `MediaEmbed.astro` | 媒体嵌入（YouTube 等） |
| `SoundEffect.astro` | UI 交互音效 |
| `AdSense.astro` | Google AdSense 广告位 |

### 2.5 内容层（Content Layer）

#### `src/content/posts/` — 博客文章

- 文章使用 Markdown/MDX 格式
- 前置元数据遵循 `src/content.config.ts` 中定义的 Zod Schema
- 图片存放于 `_images/` 子目录，通过 `rehype-image-processor.mjs` 处理
- 周刊文章需包含 `周刊` 或 `Weekly` 标签，存放于 `weekly/` 子目录
- 双语文章通过后缀区分：`文章.md` + `文章-en.md`

#### `src/content/about/` — 关于页面

- 多语言关于页面内容
- 支持 `about-zh.md`、`about-en.md`

### 2.6 工具层（Utils Layer）

| 文件 | 职责 |
|-----|------|
| `content.ts` | 文章查询、过滤、排序、分组（按年、按标签）、字数统计 |
| `description.ts` | 基于 Markdown 内容生成多场景摘要（列表、Meta、OG、Feed） |
| `feed.ts` | 生成 RSS 2.0 和 Atom 1.0 订阅源 |
| `page.ts` | 页面类型判断（首页、文章页、标签页、关于页等） |
| `search.ts` | 搜索语言规范化与文章语言匹配 |
| `adsense.ts` | AdSense Publisher ID 格式化 |
| `cache.ts` | 异步函数记忆化（memoize） |

### 2.7 插件层（Plugin Layer）

位于 `src/plugins/`，自定义 Markdown/Rehype/Remark 插件：

| 文件 | 类型 | 职责 |
|-----|------|------|
| `remark-reading-time.mjs` | Remark | 计算文章阅读时间，注入 `minutes` 到 frontmatter |
| `remark-container-directives.mjs` | Remark | 支持 `:::type` 容器指令（警告块、可折叠区域、画廊） |
| `remark-leaf-directives.mjs` | Remark | 支持叶子指令 |
| `rehype-image-processor.mjs` | Rehype | 图片转 `<figure>` 元素，支持画廊布局 |
| `rehype-heading-anchor.mjs` | Rehype | 为标题添加锚点链接 |
| `rehype-external-links.mjs` | Rehype | 外部链接处理 |
| `rehype-code-copy-button.mjs` | Rehype | 代码块添加复制按钮 |

---

## 3. 关键类与函数说明

### 3.1 类型定义

#### `src/types/index.d.ts`

```typescript
// 增强的文章类型（包含阅读时间）
export type Post = CollectionEntry<'posts'> & {
  remarkPluginFrontmatter: { minutes: number }
}

// 主题配置完整接口
export interface ThemeConfig {
  site: { title, subtitle, description, i18nTitle, author, url, base, favicon }
  color: { mode, light: { primary, secondary, background, highlight }, dark: {...} }
  global: { locale, moreLocales, fontStyle, dateFormat, toc, katex, reduceMotion }
  comment: { enabled, giscus?, twikoo?, waline? }
  seo?: { twitterID, verification, googleAnalyticsID, umamiAnalyticsID, folo, apiflashKey, googleAdSense }
  footer: { links, startYear, showWordCount }
  preload?: { imageHostURL, customGoogleAnalyticsJS, customUmamiAnalyticsJS }
}
```

#### `src/types/global.d.ts`

- 扩展 `astroHTML.JSX.HTMLAttributes` 支持 UnoCSS Attributify
- 扩展 `Window` 和 `Document` 接口支持 `webkitAudioContext` 和 `startViewTransition`

### 3.2 内容工具函数（`src/utils/content.ts`）

| 函数 | 签名 | 说明 |
|-----|------|------|
| `getPosts` | `(lang?) => Promise<Post[]>` | 获取所有文章（按日期降序，开发模式包含草稿） |
| `getRegularPosts` | `(lang?) => Promise<Post[]>` | 获取非置顶、非周刊文章 |
| `getPinnedPosts` | `(lang?) => Promise<Post[]>` | 获取置顶文章（按 pin 值降序） |
| `getPostsByYear` | `(lang?) => Promise<Map<number, Post[]>>` | 按年份分组文章 |
| `getPostsGroupByTags` | `(lang?) => Promise<Map<string, Post[]>>` | 按标签分组文章 |
| `getAllTags` | `(lang?) => Promise<string[]>` | 获取所有标签（按文章数排序） |
| `getPostsByTag` | `(tag, lang?) => Promise<Post[]>` | 获取指定标签的文章 |
| `getPostsByTags` | `(tags[], lang?) => Promise<Post[]>` | 获取包含任一标签的文章（去重） |
| `getTagSupportedLangs` | `(tag) => Promise<Language[]>` | 检查标签支持的语言 |
| `getTotalWordCount` | `(lang?) => Promise<number>` | 计算总字数（中文字符 + 英文单词） |
| `checkPostSlugDuplication` | `(posts) => Promise<string[]>` | 检查文章别名重复 |

**记忆化**：所有查询函数通过 `memoize` 包装，避免重复计算。

### 3.3 摘要生成（`src/utils/description.ts`）

| 函数 | 说明 |
|-----|------|
| `getPostDescription(post, scene)` | 根据场景生成摘要：`list`（列表）、`meta`（Meta 标签）、`og`（Open Graph）、`feed`（RSS） |

摘要逻辑：
1. 优先使用 frontmatter 中的 `description`
2. 否则从 Markdown 正文提取（移除代码块、标题、注释、指令）
3. 使用 MarkdownIt 渲染后提取纯文本
4. 根据语言截取不同长度（CJK 120 字符，其他 240 字符）

### 3.4 页面信息（`src/utils/page.ts`）

| 函数 | 说明 |
|-----|------|
| `isHomePage(path)` | 是否为首页 |
| `isPostPage(path)` | 是否为文章页 |
| `isTagPage(path)` | 是否为标签页 |
| `isAboutPage(path)` | 是否为关于页 |
| `isWorksPage(path)` | 是否为作品页 |
| `isWeeklyPage(path)` | 是否为周刊页 |
| `isLinksPage(path)` | 是否为资源页 |
| `getPageInfo(path)` | 返回页面完整上下文（语言、类型判断、本地化路径助手） |

### 3.5 订阅源生成（`src/utils/feed.ts`）

| 函数 | 说明 |
|-----|------|
| `generateFeed({ lang })` | 生成 Feed 实例，包含最近 25 篇文章 |
| `generateRSS(context)` | 生成 RSS 2.0 XML 响应（带 XSLT 样式） |
| `generateAtom(context)` | 生成 Atom 1.0 XML 响应（带 XSLT 样式） |

### 3.6 搜索索引 API（`src/pages/api/search-index/[lang].json.ts`）

- 静态生成各语言的搜索索引 JSON
- 包含字段：`title`、`description`、`tags`、`content`（截断 5000 字符）、`slug`、`lang`、`published`
- 响应头：`Cache-Control: public, max-age=3600`

### 3.7 缓存工具（`src/utils/cache.ts`）

```typescript
export function memoize<Args extends any[], T>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T>
```

基于 `Map` 的异步函数记忆化，失败时自动清除缓存允许重试。

---

## 4. 依赖关系

### 4.1 生产依赖（dependencies）

| 包名 | 版本 | 用途 |
|-----|------|------|
| `astro` | ^6.1.8 | 核心框架 |
| `@astrojs/mdx` | ^5.0.3 | MDX 支持 |
| `@astrojs/partytown` | ^2.1.7 | 第三方脚本 Web Worker 化 |
| `@astrojs/sitemap` | ^3.7.2 | 站点地图生成 |
| `unocss` | 66.6.8 | 原子 CSS 引擎 |
| `@unocss/astro` | 66.6.8 | UnoCSS Astro 集成 |
| `@unocss/preset-attributify` | 66.6.8 | Attributify 预设 |
| `astro-compress` | ^2.4.0 | 资源压缩 |
| `astro-og-canvas` | ^0.11.1 | OG 图片生成 |
| `feed` | ^5.2.1 | RSS/Atom 生成 |
| `katex` | ^0.16.44 | 数学公式渲染 |
| `rehype-katex` | ^7.0.1 | KaTeX Rehype 插件 |
| `remark-math` | ^6.0.0 | 数学 Remark 插件 |
| `mermaid` | ^11.13.0 | 图表渲染 |
| `rehype-mermaid` | ^2.1.0 | Mermaid Rehype 插件 |
| `markdown-it` | ^14.1.1 | Markdown 解析 |
| `reading-time` | ^1.5.0 | 阅读时间计算 |
| `sanitize-html` | ^2.17.3 | HTML 净化 |
| `sharp` | ^0.34.5 | 图片处理 |
| `twikoo` | ^1.7.4 | Twikoo 评论 |
| `@waline/client` | ^3.13.0 | Waline 评论 |
| `node-html-parser` | ^7.1.0 | HTML 解析 |
| `mdast-util-to-string` | ^4.0.0 | MDAST 转字符串 |
| `unist-util-visit` | ^5.1.0 | Unist 树遍历 |
| `remark-directive` | ^4.0.0 | 指令语法支持 |
| `rehype-slug` | ^6.0.0 | 标题 slug 生成 |
| `canvaskit-wasm` | ^0.41.0 | CanvasKit WASM |
| `lite-youtube-embed` | ^0.3.4 | YouTube 轻量嵌入 |

### 4.2 开发依赖（devDependencies）

| 包名 | 版本 | 用途 |
|-----|------|------|
| `typescript` | ~6.0.3 | 类型系统 |
| `@astrojs/check` | ^0.9.8 | Astro 类型检查 |
| `eslint` | ^10.2.1 | 代码检查 |
| `@antfu/eslint-config` | ^7.7.3 | ESLint 配置 |
| `eslint-plugin-astro` | ^1.6.0 | Astro ESLint 插件 |
| `astro-eslint-parser` | ^1.4.0 | Astro ESLint 解析器 |
| `@unocss/eslint-plugin` | 66.6.8 | UnoCSS ESLint 插件 |
| `tsx` | ^4.21.0 | TypeScript 执行 |
| `lint-staged` | ^16.4.0 | 暂存区代码检查 |
| `simple-git-hooks` | ^2.13.1 | Git 钩子 |
| `fast-glob` | ^3.3.3 | 文件匹配 |
| `playwright` | ^1.58.2 | 浏览器自动化 |
| `autocorrect-node` | ^2.14.0 | CJK 文本自动校正 |
| `wrangler` | ^4.87.0 | Cloudflare Workers CLI |

### 4.3 模块依赖图

```
config.ts
  ├── i18n/config.ts (langMap)
  └── types/index.d.ts (ThemeConfig)

layouts/Layout.astro
  ├── layouts/Head.astro
  ├── components/Header.astro
  ├── components/Navbar.astro
  ├── components/Footer.astro
  ├── components/Button.astro
  ├── components/Widgets/*
  ├── components/Search.astro
  └── styles/*.css

pages/[...lang]/index.astro
  ├── layouts/Layout.astro
  ├── components/PostList.astro
  ├── utils/content.ts (getPinnedPosts, getPostsByYear)
  └── i18n/lang.ts

pages/[...lang]/posts/[slug].astro
  ├── layouts/Layout.astro
  ├── components/Comment/Index.astro
  ├── components/Widgets/TOC.astro
  ├── components/PostDate.astro
  ├── components/TagList.astro
  ├── utils/content.ts
  └── utils/description.ts

utils/content.ts
  ├── astro:content (getCollection, render)
  ├── utils/cache.ts (memoize)
  └── config.ts (defaultLocale, allLocales)

utils/feed.ts
  ├── astro:content (getCollection)
  ├── feed (Feed)
  ├── markdown-it (MarkdownIt)
  ├── node-html-parser (parse)
  ├── sanitize-html
  ├── utils/cache.ts
  └── utils/description.ts
```

---

## 5. 项目运行方式

### 5.1 环境要求

- **Node.js**：≥ 22.12.0（由 `package.json` `engines` 强制）
- **pnpm**：10.33.0（由 `package.json` `packageManager` 强制）

### 5.2 常用命令

| 命令 | 说明 |
|-----|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动开发服务器（`astro check && astro dev`） |
| `pnpm build` | 生产构建（`astro check && astro build && tsx scripts/generate-llms.ts && pnpm apply-lqip`） |
| `pnpm preview` | 预览生产构建 |
| `pnpm lint` | 运行 ESLint 检查 |
| `pnpm lint:fix` | 自动修复 ESLint 问题 |
| `pnpm new-post "标题"` | 创建新文章 |
| `pnpm apply-lqip` | 生成 LQIP 图片映射 |
| `pnpm format-posts` | 格式化 CJK 文本 |

### 5.3 开发流程

1. **安装依赖**：`pnpm install`
2. **启动开发**：`pnpm dev`，访问 `http://localhost:4321`
3. **创建文章**：`pnpm new-post "文章标题"`
4. **编写内容**：在 `src/content/posts/` 下编辑 Markdown/MDX
5. **构建检查**：`pnpm build`
6. **代码检查**：`pnpm lint`

### 5.4 部署

- **CI/CD**：GitHub Actions → Cloudflare Workers
- **触发条件**：推送到 `main` 分支
- **构建命令**：`pnpm install --config.trustPolicy=off && pnpm build`
- **域名**：cgartlab.com
- **环境变量**：在 Cloudflare Dashboard 配置（如 `GOOGLE_ADSENSE_PUBLISHER_ID`）

---

## 6. 关键约定与约束

### 6.1 代码规范

- **包管理器**：强制使用 pnpm 10.33.0
- **尾部斜杠**：`trailingSlash: 'always'`（严禁修改）
- **ESLint**：忽略 `src/content/**`
- **Git 钩子**：`pre-commit` 自动运行 `lint-staged`，修复 `.js/.ts/.astro` 文件

### 6.2 内容规范

- **文章目录**：`src/content/posts/`，图片同级 `_images/` 文件夹
- **周刊目录**：`src/content/posts/weekly/`，需 `周刊` 标签，命名格式 `[主题] - No.XX 玄光周刊.md`
- **双语文章**：英文版加 `-en` 后缀
- **前置信息**：`title`、`published` 为必需字段
- **LQIP 映射**：`src/assets/lqip-map.json` 自动生成，勿手动编辑

### 6.3 安全约束

- `.env` 文件中的 `GOOGLE_ADSENSE_PUBLISHER_ID` 不提交到仓库
- 评论系统配置中的敏感 ID 通过环境变量或配置文件管理

---

## 7. 扩展与自定义

### 7.1 添加新语言

1. 在 `src/i18n/config.ts` 的 `langMap` 中添加语言映射
2. 在 `src/i18n/ui.ts` 中添加 UI 文案
3. 在 `src/config.ts` 的 `moreLocales` 中添加语言代码
4. 更新评论系统的语言映射（`giscusLocaleMap`、`twikooLocaleMap`、`walineLocaleMap`）

### 7.2 添加新页面

1. 在 `src/pages/[...lang]/` 下创建 `.astro` 文件
2. 在 `src/utils/page.ts` 中添加页面类型判断函数
3. 在 `src/components/Navbar.astro` 中添加导航项

### 7.3 自定义 Markdown 插件

1. 在 `src/plugins/` 下创建新插件文件
2. 在 `astro.config.ts` 的 `markdown.remarkPlugins` 或 `markdown.rehypePlugins` 中注册

---

## 8. 相关资源

- **Astro 文档**：https://docs.astro.build
- **UnoCSS 文档**：https://unocss.dev
- **主题基于**：https://github.com/radishzzz/astro-theme-retypeset
- **许可证**：CC BY-NC-SA 4.0
