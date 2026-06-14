# CGArtLab 网站开发指南

> **版本**: 1.0  
> **最后更新**: 2026-06-14  
> **适用对象**: 人类开发者 & AI 大模型  
> **项目地址**: https://github.com/cgartlab/cgartlab.github.io

---

## 目录

1. [项目概览](#1-项目概览)
2. [技术栈详解](#2-技术栈详解)
3. [目录结构](#3-目录结构)
4. [构建与开发流程](#4-构建与开发流程)
5. [布局系统与视觉架构](#5-布局系统与视觉架构)
6. [样式系统深度解析](#6-样式系统深度解析)
7. [颜色与主题系统](#7-颜色与主题系统)
8. [字体系统](#8-字体系统)
9. [响应式设计与断点](#9-响应式设计与断点)
10. [路由与国际化](#10-路由与国际化)
11. [内容管理系统](#11-内容管理系统)
12. [组件架构](#12-组件架构)
13. [Markdown 渲染管线](#13-markdown-渲染管线)
14. [动画与过渡系统](#14-动画与过渡系统)
15. [SEO 与性能优化](#15-seo-与性能优化)
16. [代码修改与视觉效果的映射关系](#16-代码修改与视觉效果的映射关系)
17. [常见开发场景指南](#17-常见开发场景指南)

---


## 1. 项目概览

### 1.1 网站定位

CG艺术实验室（cgartlab.com）是一个专注于数字艺术、动态视觉设计、技术分享和知识管理的工作室网站。网站采用静态生成（SSG）方式部署在 Cloudflare Pages 上。

### 1.2 核心特征

| 特征 | 实现方式 |
|------|----------|
| 静态站点生成 | Astro 6 SSG (`output: 'static'`) |
| 原子化 CSS | UnoCSS (presetWind3 + presetAttributify) |
| 国际化 | 三语支持 (zh / en / zh-tw) |
| 内容管理 | Astro Content Collections + Markdown/MDX |
| 主题切换 | 亮/暗双主题 (oklch 色彩空间) |
| 排版系统 | 赫蹏(heti)中文排版 + 自定义衬线字体 |
| 评论系统 | Giscus / Twikoo / Waline（可选） |
| SEO | JSON-LD 结构化数据 + Open Graph + Sitemap |
| 性能 | 预取策略 + 字体预加载 + 资源压缩 + LQIP |

### 1.3 关键设计理念

- **单栏布局（移动端）→ 固定侧边栏 + 内容区（桌面端）**
- **移动端优先**：所有样式默认为移动端，通过 `lg:` 前缀扩展桌面端
- **代码即配置**：通过 `src/config.ts` 集中管理所有站点配置
- **内容与表现分离**：Markdown 内容与 Astro 组件严格分离

---


## 2. 技术栈详解

### 2.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Astro | ^6.3.8 | 静态站点生成器，岛屿架构 |
| TypeScript | ~6.0.3 | 类型安全 |
| UnoCSS | 66.6.8 | 原子化 CSS 引擎 |
| MDX | ^5.0.3 | 增强型 Markdown（支持组件嵌入） |

### 2.2 UnoCSS 预设与插件

```
presetWind3()        → Tailwind CSS 兼容类名
presetAttributify()  → HTML 属性化写法 (如 p="x-4 y-2")
presetTheme()        → 暗黑主题变量自动切换
transformerDirectives() → 支持 --at-apply 指令
transformerVariantGroup() → 支持 hover:(c-primary font-bold) 分组写法
```

### 2.3 Markdown 处理管线

**Remark 插件（AST 阶段）**:
- `remark-directive` → 自定义指令语法
- `remark-math` → 数学公式解析
- `remark-container-directives` → 容器指令（Admonition）
- `remark-leaf-directives` → 叶子指令
- `remark-reading-time` → 阅读时间计算

**Rehype 插件（HTML 阶段）**:
- `rehype-katex` → 数学公式渲染
- `rehype-mermaid` → Mermaid 图表
- `rehype-slug` → 标题 ID 生成
- `rehype-heading-anchor` → 标题锚点链接
- `rehype-image-processor` → 图片优化处理
- `rehype-external-links` → 外部链接处理
- `rehype-code-copy-button` → 代码复制按钮

### 2.4 构建工具链

| 工具 | 用途 |
|------|------|
| pnpm 10.33+ | 包管理器 |
| Vite | 开发服务器 & 构建引擎 |
| ESLint (@antfu/eslint-config) | 代码规范 |
| simple-git-hooks | Git hooks |
| lint-staged | 提交前检查 |
| sharp | 图片处理 |
| astro-compress | 生产环境压缩 |

---


## 3. 目录结构

```
cgartlab.github.io/
├── astro.config.ts          # Astro 主配置
├── uno.config.ts            # UnoCSS 主配置（颜色、字体、快捷方式）
├── package.json             # 依赖与脚本
├── src/
│   ├── config.ts            # 🔑 站点核心配置（颜色、SEO、评论等）
│   ├── content.config.ts    # 内容集合 Schema 定义
│   ├── content/             # 📝 Markdown/MDX 内容源
│   │   ├── posts/           # 博客文章
│   │   ├── about/           # 关于页面
│   │   └── privacy/         # 隐私政策
│   ├── pages/               # 🌐 路由页面
│   │   ├── 404.astro
│   │   ├── [...lang]/       # 动态国际化路由
│   │   │   ├── index.astro      # 首页（文章列表）
│   │   │   ├── about.astro      # 关于
│   │   │   ├── works.astro      # 作品
│   │   │   ├── weekly.astro     # 周刊
│   │   │   ├── links.astro      # 资源
│   │   │   ├── contact.astro    # 联系
│   │   │   ├── privacy.astro    # 隐私政策
│   │   │   ├── terms.astro      # 服务条款
│   │   │   ├── posts/[slug].astro  # 文章详情页
│   │   │   ├── tags/            # 标签页
│   │   │   ├── rss.xml.ts       # RSS 订阅
│   │   │   └── atom.xml.ts      # Atom 订阅
│   │   ├── api/             # API 端点（搜索索引）
│   │   └── og/              # Open Graph 图片生成
│   ├── layouts/             # 🎨 布局模板
│   │   ├── Layout.astro     # 主布局（唯一）
│   │   └── Head.astro       # HTML Head 区域
│   ├── components/          # 🧩 可复用组件
│   │   ├── Header.astro     # 站点标题
│   │   ├── Navbar.astro     # 导航栏
│   │   ├── Footer.astro     # 页脚
│   │   ├── PostList.astro   # 文章列表
│   │   ├── Search.astro     # 搜索面板
│   │   ├── TagList.astro    # 标签列表
│   │   ├── Comment/         # 评论组件
│   │   └── Widgets/         # 功能部件
│   │       ├── TOC.astro        # 目录
│   │       ├── BackButton.astro # 返回按钮
│   │       ├── ImageZoom.astro  # 图片缩放
│   │       ├── CodeCopyButton.astro # 代码复制
│   │       ├── GithubCard.astro # GitHub卡片
│   │       ├── MediaEmbed.astro # 媒体嵌入
│   │       └── SoundEffect.astro # 音效
│   ├── styles/              # 💅 全局样式
│   │   ├── global.css       # 全局基础样式
│   │   ├── markdown.css     # Markdown 排版（heti）
│   │   ├── extension.css    # 扩展组件样式
│   │   ├── font.css         # 字体声明
│   │   ├── transition.css   # 页面过渡动画
│   │   ├── comment.css      # 评论系统样式
│   │   └── lqip.css         # 低质量图片占位
│   ├── i18n/                # 🌍 国际化
│   │   ├── config.ts        # 语言类型与映射
│   │   ├── ui.ts            # UI 文本翻译
│   │   ├── lang.ts          # 语言工具函数
│   │   └── path.ts          # 路径本地化函数
│   ├── utils/               # 🔧 工具函数
│   │   ├── content.ts       # 内容查询与处理
│   │   ├── page.ts          # 页面类型判断
│   │   ├── description.ts   # 描述生成
│   │   ├── search.ts        # 搜索索引
│   │   ├── feed.ts          # RSS/Atom 生成
│   │   ├── cache.ts         # 缓存工具
│   ├── plugins/             # 🔌 自定义 remark/rehype 插件
│   ├── types/               # 📐 TypeScript 类型定义
│   ├── data/                # 📊 静态数据
│   │   └── links.ts         # 友链数据
│   └── assets/              # 🖼 静态资源（SVG 图标等）
├── public/                  # 静态文件（直接复制到输出）
│   ├── fonts/               # Web 字体
│   ├── icons/               # 图标
│   └── images/              # 图片
└── scripts/                 # 构建脚本
    ├── new-post.ts          # 新建文章
    ├── apply-lqip.ts        # LQIP 处理
    ├── format-posts.ts      # 格式化文章
    └── generate-llms.ts     # LLM 索引生成
```

---


## 4. 构建与开发流程

### 4.1 命令参考

```bash
pnpm dev          # 启动开发服务器（含类型检查）
pnpm build        # 生产构建：类型检查 → Astro构建 → LLM索引 → LQIP
pnpm preview      # 预览构建结果
pnpm new-post     # 交互式创建新文章
pnpm lint         # ESLint 检查
pnpm lint:fix     # 自动修复
```

### 4.2 构建流程图

```
pnpm build
  ├─→ astro check          (TypeScript 类型检查)
  ├─→ astro build          (生成静态 HTML/CSS/JS)
  │     ├─→ 内容集合加载 & 验证
  │     ├─→ Remark/Rehype 插件处理 Markdown
  │     ├─→ UnoCSS 原子类生成
  │     ├─→ Astro 组件渲染
  │     └─→ 压缩输出 (astro-compress)
  ├─→ tsx scripts/generate-llms.ts  (生成 LLM 友好索引)
  └─→ pnpm apply-lqip      (生成低质量图片占位符)
```

### 4.3 开发模式特殊行为

- **草稿文章可见**：`import.meta.env.DEV` 为 true 时显示 `draft: true` 的文章
- **热重载**：修改 `.astro`、`.css`、`.ts` 文件自动刷新
- **内容热重载**：修改 `src/content/` 下的 Markdown 文件自动重新渲染

---


## 5. 布局系统与视觉架构

### 5.1 整体页面结构

网站采用**单布局模板** (`Layout.astro`)，通过条件判断实现不同页面的视觉差异。

#### 5.1.1 视觉布局示意图

**移动端 (< 1024px) —— 单栏垂直流**:
```
┌─────────────────────────────┐
│  [Header: 站名 + 副标题]     │  ← 顶部，占满宽度
├─────────────────────────────┤
│  [Navbar: 水平排列导航项]     │  ← 文章详情页隐藏
├─────────────────────────────┤
│  [Button: 语言切换/主题切换]  │
├─────────────────────────────┤
│                             │
│       [Main Content]        │  ← 主体内容区
│                             │
├─────────────────────────────┤
│  [Footer: 5行信息]           │
└─────────────────────────────┘
```

**桌面端 (≥ 1024px) —— 左内容 + 右侧栏固定**:
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   [Main Content Area]          │  [Fixed Right Sidebar]    │
│   ← 左侧，最大44rem宽         │  ← 固定定位，14rem宽      │
│                                │                           │
│   文章列表/文章内容/其他页面    │  Header (fixed top-20)    │
│                                │  Navbar (fixed bottom-X)  │
│                                │  Footer (fixed bottom-16) │
│                                │                           │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Layout.astro 核心容器的样式逻辑

```html
<div
  class="mx-auto max-w-205.848 min-h-vh w-full min-h-dvh"
  p="x-[min(7.25vw,3.731rem)] y-10"
  lg="mx-[max(5.75rem,calc(50vw-34.25rem))] my-20 max-w-[min(calc(75vw-16rem),44rem)] min-h-full p-0"
>
```

**⚠️ 重要：代码样式参数到视觉效果的精确映射**:

| 属性 | 移动端视觉效果 | 桌面端视觉效果 |
|------|---------------|---------------|
| `mx-auto` | 容器居中 | 被 `lg:mx-[...]` 覆盖 |
| `max-w-205.848` | 最大宽度约823px（极少触发） | 被 `lg:max-w-[...]` 覆盖 |
| `p="x-[min(7.25vw,3.731rem)]"` | 左右内边距：视口宽度的7.25%，最大约60px | 被 `lg:p-0` 覆盖（桌面无内边距） |
| `p="y-10"` | 上下内边距：2.5rem (40px) | 被 `lg:p-0` 覆盖 |
| `lg:mx-[max(5.75rem,calc(50vw-34.25rem))]` | — | 左外边距动态计算，保证内容不贴左边 |
| `lg:max-w-[min(calc(75vw-16rem),44rem)]` | — | 内容区最大宽度：44rem (704px) 或更窄 |
| `lg:my-20` | — | 上下外边距：5rem (80px) |

### 5.3 固定侧栏的实现机制

桌面端的 Header、Navbar、Footer 通过 UnoCSS 快捷方式 `uno-desktop-column` 实现固定定位：

```ts
// uno.config.ts
shortcuts: {
  'uno-desktop-column': 'absolute right-[max(5rem,calc(50vw-35rem))] w-14rem',
}
```

**⚠️ 视觉解读**：
- `absolute` → 脱离文档流（在桌面端父容器是相对定位的参照）
- `right-[max(5rem,calc(50vw-35rem))]` → 距右边的距离动态计算
- `w-14rem` → 侧栏宽度固定 14rem (224px)

**各组件在侧栏中的定位**:
- Header: `lg:(uno-desktop-column fixed top-20)` → 固定在顶部 5rem 处
- Navbar: `lg:(uno-desktop-column fixed bottom-[min(9.04rem+3.85vw,12.5rem)])` → 固定在底部动态位置
- Footer: `lg:(uno-desktop-column fixed bottom-16)` → 固定在底部 4rem 处

---


## 6. 样式系统深度解析

### 6.1 样式编写方式的三种模式

本项目使用 UnoCSS，但样式实际通过三种方式编写：

#### 模式 A：行内原子类（最常用）

```html
<div class="mb-8 text-4.5 font-bold c-primary">标题</div>
```

#### 模式 B：属性化写法（UnoCSS presetAttributify）

```html
<div
  class="mx-auto"
  p="x-4 y-2"
  lg="mx-0 max-w-44rem"
>
```

**⚠️ 关键理解**：`p="x-4 y-2"` 等价于 `class="px-4 py-2"`，但写在 HTML 属性上。

#### 模式 C：CSS 文件中的 `--at-apply` 指令

```css
.tag-item {
  --at-apply: 'border border-secondary/20 rounded-lg inline-flex items-center px-3 py-1.5 text-sm';
}
```

**⚠️ 关键理解**：`--at-apply` 是 UnoCSS 的 `transformerDirectives` 特性，等价于 Tailwind 的 `@apply`。它在构建时被展开为真正的 CSS 属性。

### 6.2 单位系统

| UnoCSS 单位 | 实际 CSS 值 | 像素值 (1rem=16px) |
|-------------|------------|-------------------|
| `1` | `0.25rem` | 4px |
| `2` | `0.5rem` | 8px |
| `4` | `1rem` | 16px |
| `8` | `2rem` | 32px |
| `10` | `2.5rem` | 40px |
| `3.5` | `0.875rem` | 14px |
| `4.5` | `1.125rem` | 18px |

**字体大小单位**：`text-3.5` = `font-size: 0.875rem` (14px)

### 6.3 颜色引用语法

```
c-primary         → color: var(--un-preset-theme-colors-primary)
c-secondary       → color: var(--un-preset-theme-colors-secondary)
c-secondary/60    → color: oklch(var(--un-preset-theme-colors-secondary) / 0.6)
bg-background     → background-color: var(--un-preset-theme-colors-background)
bg-highlight      → background-color: var(--un-preset-theme-colors-highlight)
bg-secondary/5    → background-color: oklch(var(--un-preset-theme-colors-secondary) / 0.05)
border-secondary/20 → border-color: oklch(var(--un-preset-theme-colors-secondary) / 0.2)
```

### 6.4 响应式前缀

```
(无前缀)  → 移动端样式（默认）
lg:       → ≥ 1024px（桌面端）
2xl:      → ≥ 1536px（大屏）
```

### 6.5 变体分组写法

```html
<!-- 等价于 hover:c-primary hover:font-bold -->
<a class="hover:(c-primary font-bold)">链接</a>

<!-- 等价于 lg:mb-1.8 lg:mt-0 lg:text-9 lg:c-primary -->
<h2 class="lg:(mb-1.8 mt-0 text-9 c-primary)">标题</h2>
```

### 6.6 自定义变体：CJK 语言

```ts
// uno.config.ts
variants: [
  (matcher) => {
    if (!matcher.startsWith('cjk:')) return matcher
    return {
      matcher: matcher.slice(4),
      selector: s => `${s}:is(:lang(zh), :lang(ja), :lang(ko))`,
    }
  },
]
```

**用法**：`cjk:tracking-wide` → 仅在中日韩语言环境下增加字间距

---


## 7. 颜色与主题系统

### 7.1 颜色定义（src/config.ts）

颜色使用 **oklch** 色彩空间，提供更均匀的感知亮度：

```ts
color: {
  light: {
    primary: 'oklch(25% 0.005 298)',      // 深灰近黑 → 标题、悬停态
    secondary: 'oklch(40% 0.005 298)',    // 中灰 → 正文
    background: 'oklch(98% 0.012 85)',    // 暖白 #FFFAF0 → 页面背景
    highlight: 'oklch(0.75 0.12 138 / 0.5)', // 半透明橄榄绿 → 选中态
  },
  dark: {
    primary: 'oklch(92% 0.005 298)',      // 亮灰 → 标题
    secondary: 'oklch(77% 0.005 298)',    // 浅灰 → 正文
    background: 'oklch(22% 0.005 298)',   // 深灰 → 背景
    highlight: 'oklch(0.75 0.12 138 / 0.25)', // 更低透明度橄榄绿
  },
}
```

### 7.2 主题切换机制

1. **UnoCSS presetTheme** 在 `html.dark` 类存在时自动切换 CSS 变量
2. **Head.astro 内联脚本**在页面加载前立即判断主题，避免闪烁（FOUC）
3. **优先级**：用户手动设置 > 配置默认值 > 系统偏好

```
localStorage 'theme-manual' = 'true'  → 读取 localStorage 'theme'
localStorage 'theme-manual' ≠ 'true'  → defaultMode !== 'auto' → 用配置值
                                       → defaultMode === 'auto' → 跟随系统
```

### 7.3 Admonition 颜色系统

```ts
// 亮色模式 (uno.config.ts theme.colors)
note: 'oklch(48.8% 0.243 264.376 / 0.8)'      // 蓝色
tip: 'oklch(50.8% 0.118 165.612 / 0.8)'       // 翡翠绿
important: 'oklch(49.6% 0.265 301.924 / 0.8)' // 紫色
warning: 'oklch(55.5% 0.163 48.998 / 0.8)'    // 琥珀色
caution: 'oklch(50.5% 0.213 27.518 / 0.8)'    // 红色
```

### 7.4 ⚠️ 修改颜色时的注意事项

**代码修改 ≠ 视觉效果 的典型陷阱**：

1. **oklch 的亮度不等于 RGB 亮度**：oklch(50% ...) 不是灰色的中间值，而是感知亮度的中间值
2. **透明度叠加效果**：`bg-secondary/5` 在浅色背景上几乎看不见，但在深色背景上会更明显
3. **highlight 颜色的半透明性**：修改 highlight 的不透明度会同时影响选中文本、导航高亮、代码标记等所有使用 `bg-highlight` 的元素
4. **暗色模式颜色不是简单反转**：每个颜色值都需要独立调整以确保在暗色背景上的可读性

---


## 8. 字体系统

### 8.1 字体栈定义（uno.config.ts）

| 用途 | 类名 | 字体栈 | 应用场景 |
|------|------|--------|----------|
| 站名标题 | `font-title` | Snell-Black → EarlySummer → serif | Header 站名 |
| 导航/页脚 | `font-navbar` | STIX-Italic → EarlySummer → serif | Navbar、Footer、副标题 |
| 日期时间 | `font-time` | Snell-Bold → serif | 文章日期 |
| 正文 | `font-serif` | STIX → EarlySummer → serif | 文章内容（默认） |
| 无衬线 | `font-sans` | 系统无衬线字体 | 可选正文样式 |

### 8.2 字体文件说明

| 字体 | 文件 | 特征 |
|------|------|------|
| Snell-Bold | Snell-Bold-SF.woff2 | 花体英文，用于日期 |
| Snell-Black | Snell-Black-SF.woff2 | 更粗花体，用于站名 |
| STIX | STIX-VF.woff2 | 可变字体(400-700)，西文衬线正文 |
| STIX-Italic | STIX-Italic-VF.woff2 | 可变字体斜体，导航栏 |
| EarlySummer | 多个分片 woff2 | 中日韩可变字体，CJK衬线正文 |
| EarlySummer-Subset | 子集 woff2 | CJK UI 字符子集（仅导航等高频字） |

### 8.3 字体加载策略

1. **预加载关键字体**（Head.astro）：EarlySummer-Subset、Snell-Black、Snell-Bold、STIX、STIX-Italic
2. **font-display: swap**：所有字体声明都使用 swap，确保文本先以系统字体显示
3. **unicode-range 分片**：EarlySummer 按 Unicode 范围分成多个文件，按需加载

### 8.4 ⚠️ 字体与视觉的关系

- **font-navbar 影响导航和页脚的视觉宽度**：STIX-Italic 是斜体，字符宽度与正体不同
- **CJK 字体回落**：如果 EarlySummer 未加载，会回落到系统 serif（如宋体），视觉差异巨大
- **`cjk:tracking-wide`**：仅在 CJK 语言下生效，增加字间距改善阅读体验
- **副标题的 `letter-spacing: 0.2em`**：这是硬编码值，不会响应字体变化

---


## 9. 响应式设计与断点

### 9.1 断点定义

| 断点 | 宽度 | 对应设备 | 布局变化 |
|------|------|---------|---------|
| 默认 | 0-1023px | 手机/平板 | 单栏垂直流 |
| `lg` | ≥ 1024px | 桌面 | 双栏：内容 + 固定侧栏 |
| `2xl` | ≥ 1536px | 大屏 | 显示桌面端 TOC |

### 9.2 各组件的响应式行为

| 组件 | 移动端 | 桌面端 (lg+) |
|------|--------|-------------|
| Header | 在内容流中，大字号 | 固定在右侧顶部 |
| Navbar | 水平 flex wrap 排列 | 固定在右侧底部，垂直排列 |
| Footer | 在内容流底部 | 固定在右侧最底部 |
| PostList 描述 | 始终显示(首页)/隐藏(其他) | 始终显示 |
| TOC | 手风琴折叠 | 2xl+ 在右侧固定展开 |
| BackButton | 隐藏 | 显示在文章标题左侧 |
| Navbar(文章页) | 完全隐藏 | 显示在侧栏 |

### 9.3 ⚠️ 响应式陷阱

**问题1：`hidden lg:block` 的实际含义**
```html
<nav class="hidden lg:block">
```
- 移动端：`display: none`（完全不可见，不占空间）
- 桌面端：`display: block`
- **视觉影响**：不仅是视觉隐藏，而是完全从布局中移除

**问题2：`op-0 lg:op-100` 的含义**
```html
<div class="op-0 lg:op-100">副标题</div>
```
- 移动端：透明不可见，**但仍占据空间**
- 桌面端：完全可见
- **视觉影响**：与 `hidden` 不同，元素仍然影响布局高度

**问题3：固定定位的 `fixed` vs `absolute`**
- `uno-desktop-column` 使用 `absolute`，但 Header/Navbar/Footer 额外添加了 `fixed`
- `fixed` 相对视口定位，`absolute` 相对最近定位祖先
- 这意味着侧栏元素在滚动时不会移动

---


## 10. 路由与国际化

### 10.1 路由结构

使用 Astro 的动态路由 `[...lang]` 实现多语言支持：

```
URL 路径                    → 对应文件                      → 语言
/                          → pages/[...lang]/index.astro  → zh (默认)
/en/                       → pages/[...lang]/index.astro  → en
/zh-tw/                    → pages/[...lang]/index.astro  → zh-tw
/posts/my-post/            → pages/[...lang]/posts/[slug] → zh
/en/posts/my-post/         → pages/[...lang]/posts/[slug] → en
/tags/                     → pages/[...lang]/tags/        → zh
/en/tags/                  → pages/[...lang]/tags/        → en
```

### 10.2 语言路由实现

```ts
// getStaticPaths() 为每种语言生成路由
export async function getStaticPaths() {
  return allLocales.map(lang => ({
    params: { lang: getLangRouteParam(lang) },
    // getLangRouteParam: 默认语言返回 undefined，其他返回语言代码
  }))
}
```

**关键规则**：
- 默认语言(zh)：URL 中无语言前缀（`/posts/...`）
- 其他语言：URL 中包含语言前缀（`/en/posts/...`）

### 10.3 语言配置

```ts
// src/i18n/config.ts
export type Language = 'en' | 'zh' | 'zh-tw'

export const langMap: Record<string, string[]> = {
  'en': ['en-US'],
  'zh': ['zh-CN'],
  'zh-tw': ['zh-TW'],
}
```

### 10.4 UI 翻译（src/i18n/ui.ts）

每种语言提供完整的 UI 文本翻译：

```ts
export const ui = {
  'zh': { posts: '文章', tags: '标签', about: '关于', ... },
  'en': { posts: 'Posts', tags: 'Tags', about: 'About', ... },
  'zh-tw': { posts: '文章', tags: '標籤', about: '關於', ... },
}
```

### 10.5 内容的语言匹配

文章 frontmatter 中的 `lang` 字段决定内容属于哪种语言：

```yaml
---
title: "My Post"
lang: zh        # 仅中文用户可见
lang: en        # 仅英文用户可见
lang: ""        # 通用内容，所有语言可见
---
```

### 10.6 路径工具函数

| 函数 | 用途 |
|------|------|
| `getLocalizedPath('/about/')` | 生成当前语言的本地化路径 |
| `getPostPath(slug, lang)` | 生成文章路径 |
| `getTagPath(tag, lang)` | 生成标签路径 |
| `getNextGlobalLangPath(path)` | 获取下一种语言的路径（循环切换） |

---


## 11. 内容管理系统

### 11.1 内容集合定义（src/content.config.ts）

三个内容集合：

| 集合 | 路径 | Schema |
|------|------|--------|
| `posts` | `src/content/posts/` | 完整文章 Schema |
| `about` | `src/content/about/` | 仅 lang 字段 |
| `privacy` | `src/content/privacy/` | 仅 lang 字段 |

### 11.2 文章 Schema 字段

```ts
schema: z.object({
  // 必需
  title: z.string(),           // 文章标题
  published: z.date(),         // 发布日期 (YYYY-MM-DD)

  // 可选
  description: z.string().default(''),     // SEO 描述
  updated: z.date().optional(),            // 更新日期
  tags: z.array(z.string()).default([]),    // 标签数组

  // 高级
  draft: z.boolean().default(false),       // 草稿状态
  pin: z.number().min(0).max(99).default(0), // 置顶优先级(0=不置顶)
  toc: z.boolean().default(true),          // 显示目录
  lang: z.enum(['', ...allLocales]).default(''), // 语言(空=通用)
  abbrlink: z.string().default(''),        // 自定义 URL slug
})
```

### 11.3 文章 Frontmatter 示例

```yaml
---
title: 使用 Astro 构建博客
published: 2025-01-15
updated: 2025-02-01
description: 详细介绍如何使用 Astro 框架搭建个人博客
tags:
  - 技术
  - Astro
  - 前端
pin: 1
toc: true
lang: zh
abbrlink: build-blog-with-astro
draft: false
---
```

### 11.4 内容查询流程（src/utils/content.ts）

```
getPosts(lang)
  └─→ getCollection('posts', filter)   # 按语言+草稿状态筛选
      └─→ addMetaToPost(post)          # 渲染并提取阅读时间
          └─→ sort by published desc    # 按日期降序排列

getPostsByYear(lang) → Map<year, Post[]>    # 按年份分组
getPinnedPosts(lang) → Post[]               # 置顶文章
getPostsGroupByTags(lang) → Map<tag, Post[]># 按标签分组
getAllTags(lang) → string[]                  # 所有标签（按热度）
getPostsByTag(tag, lang) → Post[]           # 指定标签的文章
getTotalWordCount(lang) → number            # 总字数统计
```

**性能优化**：所有查询函数通过 `memoize()` 缓存结果，避免重复计算。

### 11.5 新建文章

```bash
pnpm new-post
# 交互式创建：输入标题、选择语言、输入标签等
# 自动生成 frontmatter 和文件
```

---


## 12. 组件架构

### 12.1 组件层级关系

```
Layout.astro
├── Head.astro                 # <head> 区域（SEO、主题、分析）
├── Header.astro               # 站名 + 副标题
├── Navbar.astro               # 导航菜单
├── Button.astro               # 语言切换 + 主题切换按钮
├── <slot />                   # 页面内容插槽
│   ├── index.astro            # → PostList.astro
│   ├── posts/[slug].astro     # → 文章内容 + TOC + Comment
│   ├── about.astro            # → Markdown 内容
│   └── ...
├── Footer.astro               # 社交链接 + 版权
├── SoundEffect.astro          # 全局音效
├── CodeCopyButton.astro       # 代码复制（事件委托）
├── GithubCard.astro           # GitHub 仓库卡片
├── MediaEmbed.astro           # 媒体嵌入处理
├── ImageZoom.astro            # 图片缩放
└── Search.astro               # 搜索覆盖层
```

### 12.2 Header 组件逻辑

```astro
<!-- 动态标签：首页用 h1/h2，文章页用 h2/div -->
const TitleTag = isPost ? 'h2' : 'h1'
const SubtitleTag = isPost ? 'div' : 'h2'
```

**视觉行为**：
- 首页：大号标题 (text-8 = 2rem)，显示副标题
- 文章页移动端：缩小标题 (text-5.375)，**副标题透明** (op-0)
- 文章页桌面端：正常大小，副标题可见

### 12.3 Navbar 组件逻辑

导航项的高亮状态通过 CSS 类控制：

```ts
function getNavItemClass(isActive: boolean) {
  return isActive
    ? 'highlight-static c-primary font-bold after:bottom-0.7em'
    : 'highlight-hover transition-[colors,font-weight] after:bottom-0.7em hover:(c-primary font-bold)'
}
```

**视觉效果**：
- `highlight-static` → 永久显示底部高亮条（伪元素 `::after`）
- `highlight-hover` → 悬停时从右向左展开高亮条动画

### 12.4 PostList 组件

每篇文章展示：标题 → 日期+阅读时间 → 描述

```
┌─ <h3> 文章标题 [📌置顶图标] ─────────────────┐
│  <PostDate> 2025-01-15 · 5 min                │
│  <p> 文章描述/摘要文本...                       │
└───────────────────────────────────────────────┘
```

### 12.5 Search 组件

- **触发方式**：点击搜索按钮 / `Ctrl+K` / `Cmd+K`
- **实现方式**：客户端 JSON 索引 + 即时搜索（150ms 防抖）
- **视觉层**：全屏毛玻璃覆盖层 + 居中搜索框
- **搜索算法**：标题匹配(100分) > 标签匹配(80分) > 描述(30分) > 正文(10分)

### 12.6 TOC（目录）组件

- **移动端**：手风琴折叠，点击展开/收起
- **桌面端(2xl+)**：固定在右侧，自动高亮当前阅读位置（`a:target-current`）
- **CSS-only 切换**：通过隐藏的 checkbox + 兄弟选择器实现，无 JavaScript

---


## 13. Markdown 渲染管线

### 13.1 从 Markdown 到 HTML 的完整流程

```
Markdown 源文件
  │
  ├─ remark-directive        → 解析 :::note 等容器语法
  ├─ remark-math             → 解析 $...$ 和 $$...$$ 数学公式
  ├─ remark-container-directives → 转换容器为 blockquote.admonition-*
  ├─ remark-leaf-directives  → 处理 ::youtube[id] 等嵌入
  ├─ remark-reading-time     → 计算阅读时间，注入 frontmatter
  │
  ↓ (AST → HTML)
  │
  ├─ rehype-katex            → 渲染数学公式为 HTML
  ├─ rehype-mermaid          → 标记 Mermaid 代码块（pre-mermaid 策略）
  ├─ rehype-slug             → 为标题添加 id 属性
  ├─ rehype-heading-anchor   → 为标题添加锚点链接图标
  ├─ rehype-image-processor  → 图片优化（尺寸、LQIP）
  ├─ rehype-external-links   → 外部链接添加 target="_blank" rel="noopener"
  ├─ rehype-code-copy-button → 代码块添加复制按钮 HTML
  │
  ↓
  │
  最终 HTML（包裹在 .heti 容器中）
```

### 13.2 Markdown 排版样式（.heti 类）

`.heti` 是中文排版类，所有文章内容都包裹在此类中。关键样式映射：

| 元素 | 样式规则 | 视觉效果 |
|------|---------|---------|
| 基础文字 | `font-size: 1.0625rem; line-height: 1.75` | 17px 字号，1.75 行高 |
| h1 | `text-7 c-primary` → 1.75rem 主色 | 大标题，深色 |
| h2 | `text-5.5 c-primary` → 1.375rem 主色 | 二级标题 |
| h3 | `text-4.5` → 1.125rem | 三级标题，继承颜色 |
| 段落 p | `mb-4 text-pretty; line-height: 1.8` | 段后1rem间距 |
| 链接 a | `font-semibold underline decoration-secondary/80` | 粗体+下划线 |
| 图片 img | `mx-auto cursor-zoom-in rounded-2` | 居中+圆角+可缩放 |
| 代码块 pre | `overflow-auto uno-round-border px-4 py-3 bg-secondary/5!` | 浅灰背景+圆角边框 |
| 行内代码 code | `uno-round-border bg-secondary/5 px-0.4em py-0.15em` | 小灰背景 |
| 引用 blockquote | `border-l-4 border-secondary/25 px-4 c-secondary/80` | 左侧竖线 |
| 表格 | `table-fixed overflow-x-auto` | 固定列宽+横向滚动 |
| 列表 ul | `list-disc pl-2em` | 圆点+左缩进2em |
| 分隔线 hr | `*   *   *` 伪元素文本 | 三个星号而非横线 |

### 13.3 代码高亮

- **引擎**：Shiki
- **主题**：亮色 `github-light`，暗色 `github-dark`
- **暗色切换**：通过 `html.dark .heti pre span { text-[var(--shiki-dark)]! }` 实现
- **行号**：通过 CSS counter 实现（`counter-increment: line`）

### 13.4 Admonition 容器语法

```markdown
:::note[标题]
这是一个提示信息
:::

:::tip[建议]
这是一个建议
:::

:::warning[警告]
这是一个警告
:::
```

渲染为带颜色边框的引用块，左侧边框颜色对应类型。

---


## 14. 动画与过渡系统

### 14.1 页面切换（View Transition）

使用 Astro 内置的 `ClientRouter` 实现 SPA 式页面切换：

```astro
<ClientRouter fallback="none" />
```

- **主题切换动画**：通过 `clip-path` 实现从上到下或从下到上的揭示效果
- **命名过渡**：`transition:name={`post-${slug}`}` 让文章标题在列表页和详情页之间平滑过渡

### 14.2 内容渐入动画（transition.css）

文章内容使用逐项渐入效果：

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(3rem); }
  to { opacity: 1; transform: translateY(0); }
}

#post-content > *:nth-child(1) { animation-delay: 0.15s; }
#post-content > *:nth-child(2) { animation-delay: 0.2s; }
/* ... 每个元素延迟 0.05s */
#post-content > *:nth-child(n+16) { animation-delay: 0.9s; }
```

**⚠️ 视觉效果**：文章内容的每个块级元素（段落、图片、代码块等）按顺序从下方淡入，最多到第15个元素有独立延迟，之后统一为0.9s。

**移动端优化**：第8个元素之后不再有动画（节省性能）：
```css
@media (max-width: 767px) {
  #post-content > *:nth-child(n+8) {
    opacity: 1; transform: translateY(0); animation: none;
  }
}
```

### 14.3 高亮条动画

```css
.highlight-hover::after {
  --at-apply: 'origin-bottom-right scale-x-0 transition-transform ease-out lg:duration-300';
}
.highlight-hover:hover::after {
  --at-apply: 'origin-bottom-left scale-x-100';
}
```

**视觉效果**：悬停时，底部高亮条从左向右展开；移出时从右向左收缩。

### 14.4 减少动画模式

当以下任一条件满足时启用：
- 配置 `reduceMotion: true`
- 系统偏好 `prefers-reduced-motion: reduce`
- 浏览器不支持 View Transitions

启用后所有动画被禁用，元素直接显示最终状态。

### 14.5 副标题光标闪烁动画

```css
.subtitle-cursor-block {
  width: 1em; height: 1em;
  background-color: #b91c1c; /* 日本传统印章朱红色 */
  animation: cursor-blink 1s ease-in-out infinite;
}
@keyframes cursor-blink {
  0%, 40% { opacity: 1; }
  50% { opacity: 0.1; }
  60%, 100% { opacity: 1; }
}
```

**视觉效果**：副标题后有一个红色方块以1秒周期闪烁，模拟打字机光标。

---


## 15. SEO 与性能优化

### 15.1 SEO 实现

| 策略 | 实现位置 | 说明 |
|------|---------|------|
| Canonical URL | Head.astro | `<link rel="canonical">` |
| Open Graph | Head.astro | 完整 og:* meta 标签集 |
| JSON-LD | Head.astro | BlogPosting / WebSite schema |
| BreadcrumbList | Head.astro | 面包屑结构化数据 |
| Sitemap | astro-sitemap 集成 | 自动生成，排除标签页 |
| RSS/Atom | pages/[...lang]/ | 多语言订阅源 |
| Hreflang | Head.astro | 多语言页面关联 |
| Site verification | Head.astro | Google/Bing/Yandex/Baidu |
| Twitter Card | Head.astro | summary_large_image |

### 15.2 性能优化策略

| 优化项 | 技术 | 效果 |
|--------|------|------|
| 资源预取 | `prefetchAll: true, strategy: 'viewport'` | 链接进入视口即预取 |
| 字体预加载 | `<link rel="preload" as="font">` | 关键字体提前加载 |
| KaTeX CSS 延迟 | `media="print" onload` | 非关键CSS不阻塞渲染 |
| 图片 LQIP | CSS 渐变占位 | 图片加载前显示模糊预览 |
| HTML/CSS/JS 压缩 | astro-compress | 减小传输体积 |
| 代码分块 | `chunkSizeWarningLimit: 1000` | 控制包大小 |
| 第三方脚本隔离 | @astrojs/partytown | GA/Umami 在 Web Worker 执行 |
| 静态生成 | `output: 'static'` | CDN 友好，无服务器开销 |
| 尾部斜杠 | `trailingSlash: 'always'` | 避免301重定向 |

### 15.3 LQIP（低质量图片占位符）

通过纯 CSS 实现图片加载前的颜色预览：

```css
[style*="--lqip:"] {
  /* 从单个颜色值解码出3个渐变色 */
  /* 通过 radial-gradient 叠加模拟模糊效果 */
}
```

构建后由 `scripts/apply-lqip.ts` 自动为图片生成 `--lqip` CSS 变量。

---


## 16. 代码修改与视觉效果的映射关系

> ⚠️ **核心警告**：在本项目中，代码层面的样式修改与网站视觉层面的呈现**并非简单的一一对应关系**。以下详细说明常见的不一致情况。

### 16.1 UnoCSS 原子类 ≠ 直接的视觉属性

**情况1：`--at-apply` 中的类被构建时展开**

```css
/* 代码层面 */
.tag-item { --at-apply: 'border border-secondary/20 rounded-lg'; }

/* 实际生成的 CSS（构建后） */
.tag-item {
  border-width: 1px;
  border-style: solid;
  border-color: oklch(40% 0.005 298 / 0.2);  /* secondary 颜色 20% 不透明度 */
  border-radius: 0.5rem;
}
```

**情况2：属性化写法的解析**

```html
<!-- 代码层面 -->
<div p="x-[min(7.25vw,3.731rem)] y-10">

<!-- 实际等价于 -->
<div class="px-[min(7.25vw,3.731rem)] py-10">

<!-- 生成的 CSS -->
.px-\[min\(7\.25vw\,3\.731rem\)\] { padding-left: min(7.25vw, 3.731rem); padding-right: min(7.25vw, 3.731rem); }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
```

### 16.2 响应式前缀的覆盖规则

**代码中的前缀不是"仅在该断点生效"，而是"从该断点开始生效"**：

```html
<div class="text-4 lg:text-5">
```
- 0-1023px：`font-size: 1rem` (text-4)
- ≥ 1024px：`font-size: 1.25rem` (text-5)

**⚠️ 陷阱**：如果你只修改了 `lg:text-5` 为 `lg:text-6`，移动端仍然是 `text-4`。

### 16.3 颜色值的实际渲染

**oklch 颜色在不同浏览器和显示器上可能有差异**：

```
oklch(25% 0.005 298)   ← 代码中写的
  ↓ 浏览器转换
rgb(约 46, 46, 47)      ← 实际渲染的像素颜色
```

**透明度叠加的视觉影响**：
```
bg-secondary/5 在浅色背景上 → 几乎不可见的灰色遮罩
bg-secondary/5 在深色背景上 → 略微可见的亮色遮罩
```

### 16.4 `fixed` 定位的视觉陷阱

```html
<header class="lg:(uno-desktop-column fixed top-20)">
```

**⚠️ 关键理解**：
- `fixed` 使元素脱离文档流，不再占据原本位置的空间
- 这意味着主内容区不需要为侧栏预留空间
- 侧栏通过 `right-[max(5rem,calc(50vw-35rem))]` 定位在右侧
- 修改 `top-20` 会改变侧栏垂直位置，但**不会影响主内容区的布局**

### 16.5 间距系统的视觉连锁反应

修改一个组件的 margin 可能影响整体视觉节奏：

| 代码修改 | 直接影响 | 连锁影响 |
|---------|---------|---------|
| Header 的 `mb-10.5` | Header与Navbar间距 | 可能使页面整体感觉"松散" |
| PostList li 的 `mb-8` | 文章项之间的间距 | 列表页的信息密度变化 |
| `.heti p` 的 `mb-4` | 段落间距 | 整篇文章的阅读节奏 |
| `main.mt-5` | 导航与内容的间距 | 首屏可见内容量 |

### 16.6 字体 fallback 导致的布局偏移

```css
font-family: 'Snell-Black', 'EarlySummer-Subset', 'EarlySummer', 'ui-serif', ...
```

**⚠️ 视觉问题**：
- 如果 `Snell-Black` 字体加载失败，回落到 `EarlySummer` 或 `ui-serif`
- 不同字体的字符宽度（metrics）不同
- 可能导致标题换行位置变化、布局偏移（CLS）

### 16.7 暗色模式的颜色不对称性

```ts
// 亮色 primary: oklch(25% 0.005 298) → 几乎纯黑
// 暗色 primary: oklch(92% 0.005 298) → 几乎纯白
```

**⚠️ 修改注意**：
- 亮色模式的 primary 用于标题文字（深色文字在浅色背景上）
- 暗色模式的 primary 用于标题文字（浅色文字在深色背景上）
- 如果只修改一个模式的 primary，会导致对比度不一致
- **建议始终同时修改两个模式的对应颜色**

### 16.8 `class:list` 的条件样式

```astro
<TitleTag
  class:list={[
    'font-bold font-title',
    isPost
      ? `mb-2.8 mt-3 text-5.375 c-secondary lg:(mb-1.8 mt-0 text-9 c-primary)`
      : `mb-1.8 w-75% text-8 c-primary lg:(w-full text-9)`,
  ]}
>
```

**⚠️ 理解**：同一个元素在不同页面（首页 vs 文章页）有完全不同的样式。修改时需要明确当前修改影响的是哪个条件分支。

---


## 17. 常见开发场景指南

### 17.1 修改站点颜色

**文件**：`src/config.ts` → `themeConfig.color`

```ts
// 修改主色调为蓝色系
color: {
  light: {
    primary: 'oklch(35% 0.15 250)',    // 深蓝
    secondary: 'oklch(45% 0.05 250)',  // 灰蓝
    background: 'oklch(98% 0.005 250)',// 淡蓝白
    highlight: 'oklch(0.7 0.15 250 / 0.4)', // 半透明蓝
  },
  dark: {
    primary: 'oklch(88% 0.05 250)',    // 亮蓝灰
    secondary: 'oklch(72% 0.03 250)', // 中蓝灰
    background: 'oklch(20% 0.02 250)',// 深蓝灰
    highlight: 'oklch(0.6 0.12 250 / 0.3)',
  },
}
```

**影响范围**：全站所有使用 `c-primary`、`c-secondary`、`bg-background`、`bg-highlight` 的元素。

### 17.2 添加新页面

1. 创建页面文件 `src/pages/[...lang]/newpage.astro`
2. 添加 `getStaticPaths()` 导出
3. 在 `src/utils/page.ts` 添加 `isNewPage()` 函数
4. 在 `src/components/Navbar.astro` 添加导航项
5. 在 `src/i18n/ui.ts` 添加翻译

```astro
---
// src/pages/[...lang]/newpage.astro
import { allLocales } from '@/config'
import { getLangFromLocale, getLangRouteParam } from '@/i18n/lang'
import Layout from '@/layouts/Layout.astro'

export async function getStaticPaths() {
  return allLocales.map(lang => ({
    params: { lang: getLangRouteParam(lang) },
  }))
}
---

<Layout>
  <h1>新页面内容</h1>
</Layout>
```

### 17.3 修改导航栏项目

**文件**：`src/components/Navbar.astro`

```ts
const navItems = [
  { href: '/', label: currentUI.posts, className: getNavItemClass(isPostActive) },
  { href: '/new-page/', label: currentUI.newPage, className: getNavItemClass(isNewPageActive) },
  // ...
]
```

**注意**：需要同时在 `src/i18n/ui.ts` 中所有语言添加对应的翻译键。

### 17.4 修改文章列表样式

**文件**：`src/components/PostList.astro`

关键样式点：
- 文章间距：`<li class="mb-8">` → 修改 `mb-8` 改变间距
- 标题大小：`lg:text-4.5` → 仅影响桌面端首页的标题大小
- 日期字体：`font-time` → 使用 Snell-Bold 花体字
- 描述颜色：`c-secondary/60` → 60%不透明度的辅助色

### 17.5 自定义 Markdown 样式

**文件**：`src/styles/markdown.css`

所有规则都在 `.heti` 命名空间下。修改时注意：

```css
/* ✅ 正确：在 .heti 下修改 */
.heti :where(h2) {
  --at-apply: 'text-6 c-primary border-b border-secondary/10 pb-2';
}

/* ❌ 错误：全局修改（会影响非文章页） */
h2 {
  font-size: 1.5rem;
}
```

### 17.6 添加新的内容集合

1. 在 `src/content/` 创建目录
2. 在 `src/content.config.ts` 定义 Schema
3. 创建对应页面文件
4. 编写查询逻辑

```ts
// src/content.config.ts
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    published: z.date(),
    category: z.string(),
  }),
})

export const collections = { posts, about, privacy, projects }
```

### 17.7 修改评论系统

**文件**：`src/config.ts` → `themeConfig.comment`

支持三种评论系统，通过配置切换：
- **Giscus**（当前启用）：基于 GitHub Discussions
- **Twikoo**：自托管评论
- **Waline**：ServerLess 评论

样式调整在 `src/styles/comment.css`。

### 17.8 部署到自定义域名

1. 修改 `src/config.ts` → `themeConfig.site.url`
2. 在 `public/` 放置 `CNAME` 文件
3. GitHub Pages 设置中配置自定义域名

### 17.9 修改 SEO 信息

**文件**：`src/config.ts` → `themeConfig.seo`

```ts
seo: {
  twitterID: '@your_twitter',
  verification: {
    google: 'your-google-verification-code',
    bing: 'your-bing-verification-code',
  },
  googleAnalyticsID: 'G-XXXXXXXXXX',
  umamiAnalyticsID: 'your-umami-id',
}
```

### 17.10 处理图片

- **本地图片**：放在 `src/content/posts/` 对应文章目录下，Markdown 中相对引用
- **远程图片**：设置 `themeConfig.preload.imageHostURL` 配置允许的域名
- **优化**：构建时 `rehype-image-processor` 自动处理尺寸和格式
- **LQIP**：构建后 `pnpm apply-lqip` 自动生成低质量占位

---

## 附录 A：关键文件速查表

| 需要修改的内容 | 文件路径 |
|--------------|---------|
| 站点标题/描述/作者 | `src/config.ts` → site |
| 颜色主题 | `src/config.ts` → color |
| 字体 | `uno.config.ts` → theme.fontFamily + `src/styles/font.css` |
| 导航菜单 | `src/components/Navbar.astro` |
| 页脚链接 | `src/config.ts` → footer.links |
| UI 翻译 | `src/i18n/ui.ts` |
| 全局样式 | `src/styles/global.css` |
| 文章排版 | `src/styles/markdown.css` |
| 页面布局 | `src/layouts/Layout.astro` |
| 文章页模板 | `src/pages/[...lang]/posts/[slug].astro` |
| UnoCSS 配置 | `uno.config.ts` |
| 构建配置 | `astro.config.ts` |
| 友链数据 | `src/data/links.ts` |
| Markdown 插件 | `src/plugins/` |
| 类型定义 | `src/types/index.d.ts` |

---

## 附录 B：UnoCSS 快捷方式参考

```ts
// uno.config.ts
shortcuts: {
  'uno-desktop-column': 'absolute right-[max(5rem,calc(50vw-35rem))] w-14rem',
  'uno-decorative-line': 'mb-4.5 h-0.25 w-10 bg-secondary/25 lg:(mb-6 w-11)',
  'uno-round-border': 'border border-secondary/5 rounded border-solid',
}
```

| 快捷方式 | 用途 | 视觉效果 |
|---------|------|---------|
| `uno-desktop-column` | 桌面端侧栏容器 | 绝对定位在右侧，宽14rem |
| `uno-decorative-line` | 装饰性分隔线 | 细短横线，间距文章组 |
| `uno-round-border` | 通用圆角边框 | 1px 浅灰实线圆角 |

---

## 附录 C：代码语法高亮配置

```ts
// astro.config.ts
shikiConfig: {
  themes: {
    light: 'github-light',
    dark: 'github-dark',
  },
}
```

暗色模式切换通过 CSS：
```css
html.dark .heti pre span {
  --at-apply: 'text-[var(--shiki-dark)]!';
}
```

---

## 附录 D：内容写作规范

### Frontmatter 模板

```yaml
---
title: 文章标题
published: 2025-01-15
updated: 2025-01-20      # 可选
description: 文章简述     # 可选，用于 SEO
tags:
  - 标签1
  - 标签2
pin: 0                   # 0=不置顶，1-99=置顶优先级
toc: true                # 是否显示目录
lang: zh                 # zh | en | zh-tw | ''(通用)
abbrlink: custom-slug    # 自定义URL（可选）
draft: false             # 草稿状态
---
```

### 特殊语法

```markdown
<!-- Admonition 容器 -->
:::note[提示标题]
内容
:::

<!-- 嵌入 YouTube -->
::youtube[视频ID]

<!-- 嵌入 Bilibili -->
::bilibili[BV号]

<!-- GitHub 仓库卡片 -->
::github[owner/repo]

<!-- 图片画廊 -->
:::gallery
![图片1](url1)
![图片2](url2)
:::

<!-- 折叠内容 -->
:::fold[点击展开]
隐藏的内容
:::
```

---

*本文档由代码分析自动生成，基于项目源码的完整深度分析。*
