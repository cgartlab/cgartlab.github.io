# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Map

| File | Purpose |
|------|---------|
| **AGENTS.md** | Primary agent instructions (OpenCode, this workspace) |
| **CLAUDE.md** | Claude Code AI assistant guidance (this file) |
| **DEVELOPMENT_GUIDE.md** | Comprehensive 1422-line development manual |
| **docs/ARCHITECTURE.md** | System architecture overview, tech decisions |
| **docs/PLUGINS.md** | All 7 custom remark/rehype plugin reference |
| **docs/COMMANDS.md** | All npm scripts and build tool commands |
| **CONTRIBUTING.md** | PR workflow, commit conventions, contribution guide |
| **CHANGELOG.md** | Version history and changelog |

---

## 一、技术开发

### 开发命令

> **完整命令参考**: 见 `docs/COMMANDS.md`

```bash
pnpm dev                  # astro check + astro dev（类型检查 + 开发服务器）
pnpm build                # astro check → astro build → tsx generate-llms → pnpm apply-lqip（顺序敏感）
pnpm preview              # astro preview
pnpm lint                 # eslint（antfu config，忽略 src/content/**）
pnpm lint:fix             # eslint --fix
pnpm new-post "标题"       # 在 src/content/posts/ 下创建 MD 文件
pnpm apply-lqip           # 重新生成 LQIP 占位图（写入 dist/ 中 <img> 标签的 style）
pnpm format-posts         # CJK 文本规范化
pnpm fix-internal-links   # 修复内部链接
pnpm exec playwright test # Playwright E2E 测试
# tsx scripts/generate-llms.ts  # 生成 public/llms.txt（构建时自动调用）
```

### Astro Config (astro.config.ts)

- **Output**: `static` (SSG), 部署到 Cloudflare Pages (Workers + Static Assets)
- **Integrations** (按顺序): UnoCSS (injectReset: true) → MDX → Partytown (GA/Umami/AdSense offload) → Sitemap (排除 `/tags/*/`) → astro-compress (CSS/HTML/JS, 不包括图片和 SVG)
- **i18n**: locales `zh`(default), `en`(zh-TW), `zh-TW`(zh-TW) | `trailingSlash: 'always'` **禁止修改**
- **Prefetch**: `prefetchAll: true, defaultStrategy: 'viewport'`
- **Shiki**: `github-light` / `github-dark`, 排除 `mermaid`
- **Vite 插件**: `prefix-font-urls-with-base` — 自动给 font.css 中的 `/fonts/` URL 加 base path

**Markdown 插件管线（7 个自定义 remark/rehype 插件）:**

> **详细插件文档**: 见 `docs/PLUGINS.md` — 包含每个插件的完整行为说明、输出结构、属性表。

| 阶段 | 插件 | 作用 |
|------|------|------|
| remark | `remarkDirective` + `remarkMath` | 指令语法 + 数学公式 |
| remark | `remarkContainerDirectives` (自定义) | `:::note` / `:::tip` / `:::fold` / `:::gallery` |
| remark | `remarkLeafDirectives` (自定义) | `{youtube}` / `{bilibili}` / `{github}` 等 |
| remark | `remarkReadingTime` (自定义) | 阅读时间 → frontmatter.minutes |
| rehype | `rehypeKatex` + `rehypeMermaid` + `rehypeSlug` | KaTeX + Mermaid + 标题 ID |
| rehype | `rehypeHeadingAnchor` (自定义) | 标题锚点链接 |
| rehype | `rehypeImageProcessor` (自定义) | 图片 figure/figcaption 包裹 |
| rehype | `rehypeExternalLinks` (自定义) | 外链 + Umami 追踪 |
| rehype | `rehypeCodeCopyButton` (自定义) | 代码复制按钮 |

> **详细插件文档**: 见 `docs/PLUGINS.md` — 包含每个插件的完整行为说明、输出结构、属性表。

### UnoCSS 配置 (uno.config.ts)

**Presets**: `presetWind3()` + `presetAttributify()` + `presetTheme()` (暗色模式自动切换)

**字体栈 (4 套):**

| Token | 字体族 |
|-------|--------|
| `font-title` | Snell-Black → EarlySummer-Subset → EarlySummer → ui-serif |
| `font-navbar` | STIX-Italic → EarlySummer-Subset → EarlySummer → ui-serif |
| `font-time` | Snell-Bold → ui-serif |
| `font-serif` | STIX → EarlySummer → ui-serif |

**主题色 (OKLCH):**

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `c-primary` | `oklch(25% 0.005 298)` | `oklch(92% 0.005 298)` | 标题、链接 |
| `c-secondary` | `oklch(40% 0.005 298)` | `oklch(77% 0.005 298)` | 正文 |
| `c-background` | `oklch(98% 0.012 85)` | `oklch(22% 0.005 298)` | 页背景 |
| `c-highlight` | `oklch(0.75 0.12 138 / 0.5)` | `oklch(0.75 0.12 138 / 0.25)` | 导航高亮 |
| `c-note` | blue-700 | blue-400 | 提示框 |
| `c-tip` | emerald-700 | emerald-400 | 提示框 |
| `c-important` | purple-700 | purple-400 | 提示框 |
| `c-warning` | amber-700 | amber-400 | 提示框 |
| `c-caution` | red-700 | red-400 | 提示框 |

**自定义 Shortcuts:**

| Name | CSS | 用途 |
|------|-----|------|
| `scrollbar-hidden` | `{ scrollbar-width: none }` | 隐藏滚动条 |
| `uno-desktop-column` | `absolute left-[min(calc(100vw-19rem),calc(50vw+21rem))] w-14rem` | 桌面端左侧栏 |
| `uno-decorative-line` | `mb-4.5 h-0.25 w-10 bg-secondary/25` | 装饰分隔线 |
| `uno-round-border` | `border border-secondary/5 rounded border-solid` | 圆角边框 |

**自定义 Variant**: `cjk:*` → `:lang(zh),:lang(ja),:lang(ko)` 选择器

**Transformers**: `transformerDirectives()` + `transformerVariantGroup()`

### 目录结构

```
src/
├── content.config.ts      # 内容集合定义 (posts/about/privacy)
├── config.ts              # 站点全局配置
├── assets/
│   ├── lqip-map.json      # LQIP 映射（构建时生成，勿手动编辑）
│   ├── icons/             # 9 个 SVG 图标
│   └── templates/         # 文章模板
├── content/posts/
│   ├── weekly/            # 玄光周刊（38 个文件，19 期 × 双语言）
│   ├── works/             # 作品集
│   ├── _images/           # 文章图片（按文章命名组织）
│   └── _files/            # 附件
├── components/
│   ├── Comment/           # Giscus + Twikoo + Waline 三套评论
│   └── Widgets/           # TOC, ImageZoom, CodeCopyButton, MediaEmbed, SoundEffect, AdSense
├── layouts/
│   ├── Head.astro         # <head> SEO + OG + 字体 + 分析脚本
│   └── Layout.astro       # 主布局包裹器
├── pages/
│   └── [...lang]/         # 动态多语言路由
│       ├── posts/[...slug].astro  # 文章详情页
│       └── weekly.astro           # 周刊汇总
├── plugins/               # 7 个自定义 remark/rehype 插件
├── styles/                # global.css, markdown.css(heti), font.css, transition.css, extension.css, lqip.css, comment.css
├── i18n/                  # config.ts, ui.ts, lang.ts, path.ts
├── types/                 # TypeScript 类型定义
├── utils/                 # content.ts, cache.ts(memoize), feed.ts, search.ts, description.ts, page.ts, adsense.ts
└── worker.mjs             # Cloudflare Worker 入口
```

### 部署 (wrangler.jsonc)

- Cloudflare Pages: `src/worker.mjs`, assets from `./dist`
- Domains: `cgartlab.com`, `www.cgartlab.com`
- Build: `pnpm install --config.trustPolicy=off && pnpm build`
- Git push `main` → 自动部署

### ESLint Config

- `@antfu/eslint-config` with TypeScript + Astro + UnoCSS
- Ignores `src/content/**`
- Pre-commit: `simple-git-hooks` → `lint-staged` → `eslint --fix` on `*.{js,ts,astro}`
- 项目中仅 2 处豁免: `@ts-expect-error` in MediaEmbed.astro, `eslint-disable` in Head.astro

### Typescript (tsconfig.json)

- Strict mode, extends `astro/tsconfigs/strict`
- Path alias: `@/*` → `src/*`
- `allowJs: true`, `skipLibCheck: true`

### 工具函数注意点

- **`src/utils/cache.ts`**: `memoize(fn)` — 所有内容查询函数 (`getPosts`, `getPostsByYear`, `getAllTags`) 都使用了 memoize，避免重复 AST 处理
- **`src/utils/content.ts`**: 提供 `getPosts()`, `getPostsByYear()`, `getAllTags()`, 均返回按 `published` desc 排序的 posts，过滤掉 draft
- **LQIP 流水线**: build 完成后 `apply-lqip.ts` 用 `sharp` 将每张图片缩放到 3×3 pixel → 提取 3 个角 RGB → 编码为 32bit hex → 注入到 dist/ HTML 的 `--lqip` CSS 变量中

---

## 二、文章写作规范

> **贡献指南**: 见 `CONTRIBUTING.md` — PR 工作流、提交格式、分支策略
> **更新日志**: 见 `CHANGELOG.md` — 版本历史和变更记录

### 内容集合 (content.config.ts)

**`posts` 集合 (src/content/posts/**/*.{md,mdx}):**

| 字段 | 类型 | 必需 | 默认 | 说明 |
|------|------|------|------|------|
| `title` | string | **是** | — | |
| `published` | date | **是** | — | 实际发布日期 |
| `description` | string | 否 | `''` | 摘要，用于卡片和 SEO |
| `updated` | date | 否 | — | 空字符串视为无值 |
| `tags` | string[] | 否 | `[]` | 周刊必须含 `周刊` tag |
| `draft` | boolean | 否 | `false` | 草稿不发布 |
| `pin` | number | 否 | `0` | 置顶优先级 0-99 |
| `toc` | boolean | 否 | 跟随配置 | 是否生成目录 |
| `lang` | `''/en/zh-tw` | 否 | `''` | 语言标记 |
| `abbrlink` | string | 否 | `''` | 仅小写字母+数字+连字符 |

### Markdown 指令语法参考

**容器指令 (Callout / Admonition):**

```
:::note[标题]
内容
:::

:::tip
:::

:::important
:::

:::warning
:::

:::caution
:::

:::fold[点击展开]
隐藏内容
:::

:::gallery
![图片1](path)
![图片2](path)
:::
```

也支持 GitHub 风格: `> [!note] 标题`

**叶指令 (嵌入内容):**

```
{youtube id=VIDEO_ID}
{bilibili id=BVID}
{tweet url=https://twitter.com/.../status/...}
{codepen url=https://codepen.io/...}
{spotify url=https://open.spotify.com/...}
{github repo=owner/repo}
```

**Mermaid 图表**: 标准 ```` ```mermaid ```` 代码块，自动适配暗色/亮色主题。

**数学公式**: `$inline$` 和 `$$block$$` 语法，KaTeX 渲染。

### 文章格式规范

**通用结构:**
1. 封面图: `![描述](../_images/文件名.webp)` — rehypeImageProcessor 自动包裹 `<figure><figcaption>`
2. 正文: `##` 二级标题分段
3. 参考链接（可选）: 带编号的链接列表
4. 来源声明: `本文首发在 [CGArtLab](https://cgartlab.com)`

**周刊特有结构:**
1. 封面图 + 封面说明
2. `---` 分隔线
3. 关于周刊的 `> [!note]` callout
4. `## 正文标题`
5. 内容分节
6. `## 本期推荐` — 工具/资源推荐（图标 + 链接 + 简介）
7. `## 配饭视频` — B站/YouTube 嵌入
8. `## 尾巴和预告` — 下期预告
9. `---` + `周刊首发在 CG 艺术实验室`

**`.editorconfig`**: Tab 缩进(4), LF 换行, `.md` 文件保留尾部空白

### 双语言流程

- 中文版: `文章名.md` (`lang: ''`)
- 英文版: `文章名-en.md` (`lang: 'en'`)
- URL slug 共享：取中文文件名（去掉 `-en` 后缀）
- 英文版 `published` 日期通常与中文版一致

### 图片管理

- 所有文章图片统一放在 `src/content/posts/_images/`
- 命名规则: `<文章slug>-<时间戳>.webp`
- 封面图和正文图片全部用 `![alt](相对路径)` 内联嵌入
- `rehypeImageProcessor` 自动处理: 有 `alt` 文本 → 包裹 `<figure>` + `<figcaption>`; alt 以 `_` 开头 → 仅 `<figure>` 无标题
- 画廊模式: `:::gallery` 容器 → 水平可滚动 flex 布局，每张图片带 `gallery-item` class

### 创建新文章

```bash
pnpm new-post "标题"
# 自动生成 frontmatter，周刊文件需手动移入 weekly/ 目录
# 或手动创建: src/content/posts/weekly/标题 - No.NN 玄光周刊.md
```

---

## 三、网页交互设计

### View Transitions

| Transition Name | 触发元素 | 动画效果 |
|----------------|----------|----------|
| `theme-toggle-transition` | 主题切换按钮 | `clip-path: inset()` 圆形展开(0.7s) |
| `post-{slug}` | 文章标题链接 | 渐入上移 |
| `time-{slug}` | 文章日期 | 渐入上移 |
| `site-title-{lang}` | 站点标题 | 过渡动画 |
| `toc-links-list > *` | TOC 目录项(桌面端 2xl) | 交错渐入(0.175s–0.625s) |
| `post-content > *` | 文章正文子元素 | 交错渐入(0.15s–0.9s)，移动端仅前 8 个 |

动画在 `reduce-motion` class 下全部禁用。移动端(≤767px) 仅前 8 个 `post-content` 子元素有动画。

### 主题切换 (暗色/亮色)

1. **检测优先级**: localStorage `theme` → config `defaultMode` → 系统 `prefers-color-scheme`
2. **防 FOUC**: `<head>` 内联脚本在 DOM 渲染前执行
3. **切换**: `startViewTransition` API，transition name `theme-toggle-transition`
4. **方向**: `html.dark` 从底部裁剪(clip from bottom)，亮色从顶部裁剪
5. **豁免**: `[data-disable-theme-toggle-transition]` 元素跳过过渡动画
6. **持久化**: 存储 `theme` + `theme-manual` 到 localStorage

### 评论系统 (Comment/Index.astro)

三套评论系统并行，通过 `src/config.ts` 中的配置项启用/切换:

| 系统 | 配置 | 说明 |
|------|------|------|
| Giscus | `repo/repoId/category/categoryId` | GitHub Discussions 驱动 |
| Twikoo | `envId` | 自部署，Tencent CloudBase |
| Waline | `serverURL` | 自部署，LeanCloud |

### 搜索系统

- **构建时索引**: `/api/search-index/[lang].json` 每个语言独立
- **客户端加载**: `Search.astro` 按需加载，`Map` 缓存
- **评分算法**: 标题匹配 +100, 标题开头 +50, 标签匹配 +80, 描述 +30, 内容 +10
- **返回**: Top 20, 匹配文本 `<mark>` 高亮
- **快捷键**: `Cmd/Ctrl+K` 打开, `Escape` 关闭
- **索引内容**: title, description, tags, content(截断 5000 字符), slug, lang, published

### 响应式断点

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| Mobile | < 640px | 搜索 overlay padding 缩小, 单列 |
| Small | < 480px | 缩略图高度减小, 字体缩小 |
| Tablet | ≥ 768px | 画廊 2 列网格 |
| Desktop | ≥ 1024px | 导航栏固定左侧(`uno-desktop-column`), TOC 桌面图标可见 |
| 2XL | ≥ 1536px | TOC 固定左侧边栏 (`left-0 top-44.5`), 当前标题高亮 |

### 字体系统 (font.css)

| 字体 | CSS Font Family | 格式 |
|------|----------------|------|
| **Snell-Bold** | `Snell-Bold` | woff2 子集化 |
| **Snell-Black** | `Snell-Black` | woff2 子集化 |
| **STIX** (STIXTwoText) | `STIX` | woff2-variations (400-700) |
| **STIX-Italic** | `STIX-Italic` | woff2-variations (400-700) |
| **EarlySummer-Subset** | `EarlySummer-Subset` | woff2-variations (UI 字符子集) |
| **EarlySummer** | `EarlySummer` | woff2-variations (23 个 chunk, Unicode 范围分片) |

全部 `font-display: swap`，在 `Head.astro` 中 preload。

### 交互组件

| 组件 | 路径 | 行为 |
|------|------|------|
| **ImageZoom** | `Widgets/ImageZoom.astro` | 点击图片全屏查看，计算缩放比例(桌面 0.8, 移动 1.0)，点击外部/缩放关闭 |
| **CodeCopyButton** | `Widgets/CodeCopyButton.astro` | 代码块右上角复制按钮 |
| **TOC** | `Widgets/TOC.astro` | 目录，桌面端 2xl 固定侧栏，当前标题 `:target-current` 高亮 |
| **MediaEmbed** | `Widgets/MediaEmbed.astro` | 视频/B站嵌入，响应式容器 |
| **SoundEffect** | `Widgets/SoundEffect.astro` | Web Audio API 打字音效，桌面端(>1023px)生效，5 种变体 |
| **BackButton** | `Widgets/BackButton.astro` | 桌面端(≥1024px)可见 |
| **AdSense** | `Widgets/AdSense.astro` | Google AdSense 广告位 |

### SEO 结构化数据

- JSON-LD: `BlogPosting` (文章页) + `WebSite` + `BreadcrumbList`
- OG: Twitter Card, Open Graph (title/description/image)
- Sitemap: 排除 `/tags/*/` 低质量页面，含 `lastmod`
- RSS/Atom: `public/feeds/` XSLT 样式，通过 `/rss.xml` 和 `/atom.xml` 提供

### 分析统计

- Google Analytics (通过 Partytown 卸载到 Web Worker)
- Umami 自部署统计
- 均通过 `data-*` 属性追踪事件

### 文章图片管线 (LQIP)

1. Build 完成后 `apply-lqip.ts` 扫描 `dist/_astro/*.webp`
2. `sharp` 缩放到 3×3 px
3. 提取 3 个位置(top-left, center, bottom-right) 的 RGB
4. 编码为 32bit hex (`--lqip:#xxxxxx`)
5. 注入到 dist/ HTML 中对应 `<img>` 的 style 属性
6. `lqip.css` 用 3 色径向渐变渲染占位，图片加载后渐变过渡隐藏

### 分支策略

| 分支 | 用途 | 合并方式 |
|------|------|----------|
| `dev-{kebab}` | 代码/功能/样式开发 | PR → squash merge |
| `write-{kebab}` | 文章/周刊创作 | PR → squash merge |
| `main` | 受保护 | — |

### i18n 路由 (src/i18n/)

- `config.ts`: 语言映射 (`zh`→zh-CN, `en`→en-US, `zh-tw`→zh-TW), Giscus/Twikoo/Waline 语言映射
- `ui.ts`: UI 文字翻译 (标题、导航、搜索占位等)
- `path.ts`: `getPostPath()`, `getTagPath()`, `getNextLangPath()` 路由辅助函数
- `lang.ts`: `getLangRouteParam()`, `getNextGlobalLang()`

### 关键约束总结

- `trailingSlash: 'always'` **禁止修改**
- `pnpm` only (packageManager 强制 `pnpm@10.33.0`)
- `src/assets/` LQIP 自动管理，勿手动编辑
- 文章图片必须放 `src/content/posts/_images/`
- ESLint 跳过 `src/content/**`
- 文中 2 处特例豁免不可新增
- pre-commit hook 自动 eslint --fix `.js/.ts/.astro`
