# AGENTS.md - CGArtLab 仓库理解文档

## 一、项目概述

### 1.1 基本信息

- **项目名称**: CGArtLab (cgartlab.github.io)
- **项目类型**: Astro 静态站点 (SSG)
- **主题**: Retypeset 主题定制版，用于"CG艺术实验室"
- **目的**: 数字艺术、视觉设计、技术分享和知识管理的个人博客/作品集
- **作者**: ChenYang
- **URL**: https://cgartlab.com
- **GitHub**: https://github.com/cgartlab/cgartlab.github.io

### 1.2 技术栈

#### 核心框架
- **Astro** 6.1.8 - 静态站点生成器，带内容集合
- **TypeScript** 6.0.3
- **pnpm** 10.33.0 (包管理器，由 packageManager 字段强制)

#### 样式系统
- **UnoCSS** 66.6.8 - CSS 框架，包含:
  - `presetWind3` - 工具优先 CSS
  - `presetAttributify` - 属性简写
  - `presetTheme` - 主题自定义
- 自定义主题颜色定义在 `uno.config.ts` 和 `src/config.ts`

#### Markdown 与内容
- **@astrojs/mdx** - MDX 支持
- **remark 插件**:
  - `remark-directive` - 自定义指令
  - `remark-math` - 数学渲染
  - `remark-reading-time` - 阅读时间计算
  - 自定义容器/叶子指令
- **rehype 插件**:
  - `rehype-katex` - 数学渲染
  - `rehype-mermaid` - Mermaid 图表支持
  - `rehype-slug` - 标题 ID
  - 自定义插件: 代码复制、外部链接、图像处理

#### 集成
- **@astrojs/partytown** - 第三方脚本隔离 (Google Analytics)
- **@astrojs/sitemap** - 站点地图生成
- **astro-compress** - 构建压缩 (CSS, HTML, JS)
- **astro-og-canvas** - Open Graph 图片生成

#### 评论系统
- **giscus** - GitHub Discussions 评论 (当前启用)
- **twikoo** - 备选评论系统 (已配置但未启用)
- **@waline/client** - 备选评论系统 (已配置但未启用)

---

## 二、目录结构

```
├── .github/workflows/       # GitHub Actions CI/CD
│   └── astro.yml             # 构建和部署工作流
├── public/                   # 静态资源
│   ├── icons/                # 网站图标
│   └── fonts/                # 自定义字体
├── scripts/                  # 构建和工具脚本
│   ├── new-post.ts           # 创建新博客文章
│   ├── format-posts.ts       # CJK 文本格式化
│   ├── apply-lqip.ts         # LQIP (图像占位符)
│   ├── generate-llms.ts      # LLM 友好内容生成
│   ├── update-theme.ts       # 主题更新脚本
│   ├── fix-internal-links.ts # 内部链接修复
│   └── search-lang-check.ts  # 搜索语言检查
├── src/
│   ├── assets/               # 构建资源 (LQIP 映射)
│   ├── components/           # Astro 组件
│   ├── content/              # 内容集合
│   │   ├── posts/            # 博客文章 (MD/MDX)
│   │   │   ├── _images/      # 文章图片
│   │   │   ├── weekly/       # 周刊文章
│   │   │   └── works/        # 作品集文章
│   │   └── about/            # 关于页面
│   ├── data/                 # 静态数据 (links.ts)
│   ├── i18n/                 # 国际化
│   │   ├── config.ts         # 语言配置
│   │   ├── ui.ts             # UI 翻译
│   │   ├── path.ts           # 路径工具
│   │   └── lang.ts           # 语言工具
│   ├── layouts               # Astro 布局
│   │   ├── Layout.astro      # 主布局
│   │   └── Head.astro        # <head> 组件
│   ├── pages                 # Astro 页面
│   │   ├── [...lang]/        # 语言前缀页面
│   │   ├── api/              # API 端点
│   │   └── og/[...image].ts  # Open Graph 图片
│   ├── plugins               # 自定义 remark/rehype 插件
│   ├── styles                # CSS 文件
│   ├── types                 # TypeScript 类型
│   ├── utils                 # 工具函数
│   └── config.ts             # 主题配置
├── astro.config.ts           # Astro 配置
├── uno.config.ts             # UnoCSS 配置
├── tsconfig.json             # TypeScript 配置
├── eslint.config.mjs         # ESLint 配置
├── package.json              # 依赖和脚本
└── AGENTS.md                 # Agent 理解文档
```

---

## 三、构建系统

### 3.1 开发命令

```bash
# 开发服务器 (带类型检查)
pnpm dev

# 生产构建 (完整流程)
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 代码检查并修复
pnpm lint:fix
```

### 3.2 构建流程

`pnpm build` 不是单纯的 `astro build`，完整流程:

1. **astro check** - TypeScript 验证
2. **astro build** - 静态站点生成
3. **tsx scripts/generate-llms.ts** - 生成 LLM 友好内容
4. **pnpm apply-lqip** - 为图像生成和应用 LQIP

### 3.3 内容脚本

```bash
# 创建新文章
pnpm new-post "文章标题"

# CJK 文本格式化
pnpm format-posts

# 应用 LQIP 到图片
pnpm apply-lqip

# 主题更新
pnpm update-theme
```

---

## 四、内容管理

### 4.1 内容集合

#### 文章 (`src/content/posts/`)

- **格式**: MD 或 MDX 文件
- **前置 matter 结构**:
  ```yaml
  title: string (必需)
  published: date (必需)
  description: string (可选)
  updated: date (可选)
  tags: string[] (可选)
  draft: boolean (可选, 默认: false)
  pin: number (可选, 0-99)
  toc: boolean (可选, 默认: 主题配置)
  lang: 'zh' | 'en' | 'zh-tw' | '' (可选)
  abbrlink: string (可选, URL 别名)
  ```

- **特殊子目录**:
  - `works/` - 作品集
  - `weekly/` - 周刊通讯

- **双语文章**: 使用 `-en` 后缀表示英文版本 (如 `文章.md`, `文章-en.md`)

#### 关于页面 (`src/content/about/`)

- **格式**: MD 或 MDX 文件
- **前置 matter**: 仅 `lang` 字段

### 4.2 文章组织

- **文章排序**: 按发布时间降序
- **置顶文章**: 通过 `pin` 字段控制，数值越高越靠前
- **周刊排除**: 带有"周刊"或"Weekly"标签的文章不显示在普通列表中
- **语言筛选**: 支持按语言筛选，空字符串表示通用语言

---

## 五、配置详解

### 5.1 主题配置 (`src/config.ts`)

关键配置项:

- **site** - 站点元数据 (标题、URL、作者、favicon 等)
- **color** - 浅色/深色主题颜色 (OKLCH 格式)
- **global** - 语言、字体风格、日期格式、目录、数学渲染
- **comment** - 评论系统配置 (giscus/twikoo/waline)
- **seo** - 分析、搜索控制台、广告
- **footer** - 社交链接、起始年份、字数统计
- **preload** - 自定义 CDN/分析脚本

### 5.2 UnoCSS 配置 (`uno.config.ts`)

- 自定义主题颜色来自 `themeConfig.color`
- 自定义字体 (Snell, STIX, EarlySummer)
- CJK 特定变体 (`cjk:` 前缀)
- 常用模式快捷方式

### 5.3 i18n 配置 (`src/i18n/config.ts`)

支持的语言:
- `zh` - 简体中文
- `en` - English
- `zh-tw` - 繁体中文

---

## 六、页面路由

### 6.1 URL 结构

- `/` - 首页 (语言前缀: `/en/`, `/zh-tw/`)
- `/about` - 关于页面
- `/posts/[slug]` - 博客文章详情
- `/tags` - 标签列表
- `/tags/[tag]` - 按标签筛选文章
- `/works` - 作品集
- `/weekly` - 周刊存档
- `/links` - 资源链接

### 6.2 API 端点

- `/api/search-index.json` - 完整搜索索引
- `/api/search-index/[lang].json` - 语言特定搜索索引

### 6.3 订阅源

- `/rss.xml` - RSS 2.0 订阅源
- `/atom.xml` - Atom 订阅源

---

## 七、自定义插件

### 7.1 Remark 插件

- `remark-reading-time` - 计算阅读时间
- `remark-container-directives` - 自定义容器 (note, tip, warning 等)
- `remark-leaf-directives` - 自定义叶子指令 (div, span 等)

### 7.2 Rehype 插件

- `rehype-image-processor` - 图像优化和 LQIP 注入
- `rehype-heading-anchor` - 为标题添加锚点链接
- `rehype-external-links` - 为外部链接添加 `target="_blank"`
- `rehype-code-copy-button` - 为代码块添加复制按钮

---

## 八、样式系统

### 8.1 CSS 文件 (`src/styles/`)

- `global.css` - 基础样式
- `markdown.css` - Markdown 内容样式
- `font.css` - 自定义字体加载
- `transition.css` - 页面过渡动画
- `lqip.css` - LQIP 占位符样式
- `comment.css` - 评论区域样式
- `extension.css` - 扩展样式

### 8.2 CJK 支持

- `autocorrect-node` 格式化 CJK 文本间距
- UnoCSS `cjk:` 变体用于 CJK 特定样式

---

## 九、环境与 CI/CD

### 9.1 环境变量

- `.env` 文件 (不提交):
  - `GOOGLE_ADSENSE_PUBLISHER_ID` - AdSense 发布商 ID

### 9.2 GitHub Actions

- **触发**: 推送到 `main` 分支
- **Node.js**: 版本 24
- **构建**: `pnpm build`
- **输出**: GitHub Pages

### 9.3 架构注意事项

- `astro.config.ts`: `trailingSlash: 'always'` - 不要更改
- ESLint 忽略 `src/content/**`
- LQIP 映射是自动生成的，不要手动编辑

---

## 十、工具函数

### 10.1 核心工具 (`src/utils/`)

- `content.ts` - 文章获取、排序、分组、字数统计
- `search.ts` - 搜索功能
- `feed.ts` - RSS/Atom 订阅生成
- `description.ts` - 描述生成
- `page.ts` - 分页处理
- `cache.ts` - 记忆化缓存
- `adsense.ts` - 广告集成

### 10.2 类型定义 (`src/types/`)

- `index.d.ts` - Post、ThemeConfig 等核心类型
- `global.d.ts` - 全局类型声明

---

## 十一、Obsidian CLI 集成

### 11.1 安装

从 https://obsidian.md/cli 下载或通过包管理器安装。

### 11.2 常用命令

```bash
# 帮助和 TUI
obsidian help
obsidian

# 每日笔记
obsidian daily
obsidian daily:read
obsidian daily:append content="- [ ] 任务"
obsidian daily:prepend content="## 早晨"

# 文件操作
obsidian create name="笔记" content="# 内容"
obsidian read file="笔记"
obsidian append file="笔记" content="文本"
obsidian search query="关键词"

# 任务
obsidian tasks
obsidian tasks status=incomplete
obsidian task toggle file="笔记" line=3

# 标签和属性
obsidian tags counts
obsidian property:set file="笔记" property=status value=done

# 链接
obsidian backlinks file="笔记"
obsidian links file="笔记"
obsidian unresolved
obsidian orphans

# 历史
obsidian history file="笔记"
obsidian history:restore file="笔记" version=3

# 数据库
obsidian bases
obsidian base:query base="数据库" format=json

# 开发者
obsidian devtools
obsidian eval code="app.vault.getFiles().length"
obsidian plugin:reload id="插件"
obsidian dev:screenshot file=截图.png

# 指定保险库
obsidian vault="我的保险库" search query="关键词"
```

### 11.3 参数格式

- 使用 `key=value` 语法
- 含空格的值用引号: `content="hello world"`
- 标志: `silent`, `--copy`, `--total`
- 默认操作最近聚焦的保险库，使用 `vault=` 指定

### 11.4 文档

完整参考: https://help.obsidian.md/cli

---

## 十二、常见开发任务

### 12.1 添加新文章

1. 运行 `pnpm new-post "标题"` 或手动创建 MD 文件
2. 添加必需的前置 matter 字段
3. 将图片添加到 `_images/` 子文件夹
4. 如需要，使用 `pnpm format-posts` 格式化

### 12.2 更新主题

```bash
pnpm update-theme
```

### 12.3 搜索索引

构建时从文章内容自动生成。

### 12.4 Open Graph 图片

使用 `astro-og-canvas` 自动生成 - 见 `src/pages/og/[...image].ts`

---

## 十三、依赖概览

### 13.1 主要生产依赖

- `astro` - 核心框架
- `@astrojs/mdx` - MDX 支持
- `katex`, `rehype-katex`, `remark-math` - 数学渲染
- `mermaid`, `rehype-mermaid` - 图表
- `markdown-it` - Markdown 解析
- `sharp` - 图像处理
- `@waline/client`, `twikoo` - 评论 (已配置)
- `feed` - RSS/Atom 生成

### 13.2 主要开发依赖

- `@antfu/eslint-config` - 代码检查
- `autocorrect-node` - CJK 格式化
- `tsx` - TypeScript 运行器
- `unocss` - CSS 框架

---

## 十四、架构要点

1. **静态站点生成** - 所有页面在构建时预渲染
2. **内容集合** - 使用 Zod schema 的类型安全内容
3. **基于文件的路由** - 页面从文件结构创建
4. **混合样式** - UnoCSS 工具类 + 自定义 CSS
5. **图像优化** - Sharp 处理 + LQIP 用户体验
6. **i18n** - 带 URL 前缀的多语言支持
7. **SEO** - 站点地图、元标签、Open Graph
8. **性能** - 预加载、压缩、最小化 JS

---

## 十五、版本信息

- **最后更新**: 2026-04-29
- **Astro 版本**: 6.1.8
- **UnoCSS 版本**: 66.6.8
- **Node.js**: 18+ (构建使用 24)
- **pnpm**: 10.33.0