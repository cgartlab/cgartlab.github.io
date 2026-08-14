# Changelog

All notable project changes are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Unreleased

### Fixed — PR #199 全面 Bug 修复与加固 (2026-06-29)

**P0 构建 Bug**
- `rehype-image-processor`: 画廊 `splice` 后返回 `[SKIP, index + figures.length]` 修复遍历索引偏移；多图段落（非画廊）改用 `createFigure()` 保留 alt 文本和 `<figure>` 包裹；无 alt 的画廊图片现在也正确包裹 `gallery-item` class

**P1 功能 Bug**
- `WorksGallery`: `DOMContentLoaded` → `astro:page-load`；`event.target` → `event.currentTarget`，修复 View Transition 导航后筛选失效及子元素点击问题
- View Transition 事件监听器泄漏（6 组件）：`SoundEffect`、`Button`、`ImageZoom`、`CodeCopyButton`、`GithubHeatmap`、`Layout` 统一采用 `astro:page-load`/`astro:before-swap` 配对
- `Button`: `matchMedia` 提取为模块级常量，确保 `removeEventListener` 有效
- `InquiryForm`: submit 监听器移入 `astro:page-load`；验证错误边框改为红色
- `extension.css`: 移除非标准 `scroll-target-group: auto` 和 `a:target-current` 伪类
- `TOC`: 改用 IntersectionObserver 驱动 `.toc-active` class 高亮；`scrollIntoView` 在 `reduce-motion` 下降级为 `instant`；按 DOM 顺序而非字典序确定最靠前可见标题
- 6 个交互元素补充 `:focus-visible` + outline（`tag-item`、`code-copy-button`、`category-tag`、`search-close`、`search-result-item`、`form-submit`）
- Waline: 移除 `--waline-bg-color-hover` 同色覆盖
- `ConsentBanner`: 补充 `html.reduce-motion` 类选择器
- `ImageZoom`: iOS Safari 滚动锁定改用 `position:fixed+width:100%`；`cleanupZoom` 补充 `scroll-lock` 移除，防止导航后下一页 body 固定

**P2 功能与质量**
- `TOC`: 容器加 `bottom-0`；`extension.css` 桌面端 `grid-template-rows:1fr` 移入 `@media(min-width:1536px)` 修复移动端始终展开
- `content.ts`: `getPosts` 用默认参数值归一化 `undefined→defaultLocale`，消除双缓存键问题
- OG 生成过滤 `draft:true` 文章
- `search-index` API（`[lang]` 和全局版）均加 try-catch，返回 JSON 格式错误
- `worker.mjs`: 无尾斜杠 301 重定向 + 全局 try-catch + 404.html fallback 容错
- `rehype-glossary`: CJK 术语添加 Unicode 边界检查，防止复合词内子串误匹配
- `description.ts`: 所有场景截断 frontmatter description；`htmlEntityMap` 修正 `&amp;` 解码顺序；frontmatter description 先经 Markdown 渲染再截断
- `remark-container-directives`: 空 admonition 清理空 `<p>` 节点
- `rehype-external-links`: 用 `URL.hostname` 判断同源，跳过同源链接的外链标记
- `transition.css`: `reduce-motion` 块补充热图/链接卡片/画廊 hover 覆盖

**样式优化**
- 导航高亮：`::after` 改为 `height:2px` 下划线，移除 `z-index:-1`
- 资源页：移除 `.links-section` `border-radius`/`overflow:hidden` 及展开时标题分隔线

**颜色 Token 修复**（argus follow-up）
- `skip-to-content` 背景/outline `#007bff` → `primary` token
- `code-copy-button.copied` 成功绿 `#059669`/`#10b981` → `tip` token（合并为单条，暗色自动跟随）
- `subtitle-cursor-block` 红色 `#b91c1c` → `caution` token

### Added

- **docs/PLUGINS.md** — Complete reference for all 7 custom remark/rehype plugins (`remarkContainerDirectives`, `remarkLeafDirectives`, `remarkReadingTime`, `rehypeHeadingAnchor`, `rehypeImageProcessor`, `rehypeExternalLinks`, `rehypeCodeCopyButton`)
- **docs/COMMANDS.md** — Consolidated commands reference for all npm scripts and build tools
- **CONTRIBUTING.md** — PR workflow, commit conventions, branch strategy, and contribution guidelines
- **CHANGELOG.md** — This file

### Changed

- **docs/ARCHITECTURE.md** — Complete rewrite: removed outdated `blog/` content reference, updated project structure to reflect actual `posts/works/weekly/_images/` organization, added tech architecture sections (SSG, Markdown pipeline, theme system, i18n routing, LQIP pipeline), documented the 5 key architectural decisions (trailing slash, LQIP auto-management, language filtering, triple comments, Worker scope)

### Added — PR #268 全部文章英译、100% 双语覆盖 (2026-08-02)

- **feat(posts)**: translate all 29 remaining Chinese articles to English, achieving 100% bilingual coverage (里程碑)

### Added — PR #267 AI Graceful Dining Guide (2026-08-01)

- **feat(posts)**: add AI Graceful Dining Guide (Part 1: Slow Is Fast) — Chinese & English versions

### Added — PR #266 GitHub 热力图迁移至 GraphQL API (2026-07-30)

- **feat(heatmap)**: migrate to official GitHub GraphQL API with file-based caching and build-time error tolerance

### Added / Changed — PR #263 sharp 升级 + 友链 (2026-07-29)

- **feat(links)**: add Bo.Ke friend link
- **fix(deps)**: upgrade sharp 0.34.5 → 0.35.3 to fix libvips CVE
- **fix**: Head.astro lint cleanup

### Fixed — PR #260 跨平台 pnpm 兼容性 (2026-07-27)

- **fix**: cross-platform `pnpm install` compatibility (Windows/macOS/Linux) and dead code cleanup

### Chore — PR #255 dependabot actions/labeler 升级 (2026-07-27)

- **chore(deps)**: bump actions/labeler from 6 to 7

### Fixed — PR #258 /feed 快捷重定向 (2026-07-22)

- **fix(worker)**: add `/feed` shortcut redirect to RSS feed

### Fixed — PR #257 英文版翻译质量全面审查 (2026-07-22)

- **fix(posts)**: 全面修正英文版翻译质量、图片链接与 SEO 优化

### Added — PR #254 英文版「我的上帝模式」 (2026-07-21)

- **feat(posts)**: 发布英文版「我的上帝模式，一名设计师创作环境的演变」

### CI — PR #253 PR triage action 修复 (2026-07-21)

- **ci**: 升级 `actions/add-to-project` 到 v2.0.0

### Chore — PR #252 模板与周刊描述更新 (2026-07-21)

- **chore**: 更新模板默认元数据与修订周刊描述

### Added — PR #251 「我的上帝模式」中文版 (2026-07-21)

- **feat(posts)**: 发布「我的上帝模式，一名设计师创作环境的演变」

### CI — PR #248 自动分配 assignee + Project (2026-07-17)

- **chore(ci)**: auto-assign author and add PRs to Project 3 on open

### Added — PR #247 SEO 标题优化 (2026-07-17)

- **feat(seo)**: optimize page titles with `seoTitle` frontmatter field, fix footer EN i18n

### Docs — PR #246 About 页面法律文档更新 (2026-07-16)

- **docs/about**: legal update

### Added — PR #245 glossary 移动端导航自动隐藏 (2026-07-15)

- **feat(glossary)**: mobile nav auto-hide, reveal on scroll, hide after 3s idle

### Fixed — PR #244 glossary 移动端侧边导航 + scroll-spy 偏移 (2026-07-15)

- **fix(glossary)**: vertical nav on mobile, fix scroll-spy offset for click navigation

### Fixed — PR #243 glossary scroll-spy + 分隔符渲染 (2026-07-15)

- **fix(glossary)**: scroll-spy and divider rendering

### Style — PR #242 Cookie 弹窗样式优化 (2026-07-15)

- **style**: 优化 cookie 弹窗样式

### Added — PR #241 视频文章居中样式 + autoplay (2026-07-15)

- **feat(article)**: optimize video display with centered styling and reliable autoplay

### Added — PR #240 glossary 完整 i18n 支持 (2026-07-15)

- **feat**: optimize glossary with full i18n support

### Fixed — PR #236 TOC 手风琴折叠 + 侧边栏加宽 (2026-07-14)

- **fix(toc)**: add accordion collapse/expand with animation, widen sidebar to fit longest title

### Fixed — PR #235 Mermaid 暗色模式 + 构建时渲染恢复 (2026-07-13)

- **fix(mermaid)**: restore build-time rendering and prepare dark mode support

### Chore — PR #238 dependabot 补丁更新（批量） (2026-07-17)

- **chore(deps)**: bump the patch-updates group with 2 updates

### Chore — PR #237 dependabot setup-node 升级 (2026-07-17)

- **chore(deps)**: bump actions/setup-node from 6 to 7

---

## 1.0.0 — 2026-06-14

### Added

- Trilingual support (zh/en/zh-tw) with dynamic `[...lang]` routing
- 玄光周刊 (Weekly Newsletter) system with 19 issues and gallery component
- Works portfolio section
- Three comment systems: Giscus, Twikoo, Waline (all bundled, configurable)
- Dual theme system (light/dark) with OKLCH color space
- LQIP (Low Quality Image Placeholder) system — sharp 3×3px → CSS radial gradient
- 7 custom remark/rehype plugins for enhanced Markdown
- UnoCSS with presetWind3 + presetAttributify + presetTheme
- KaTeX math rendering
- Mermaid diagram support
- View Transitions for theme switching and page navigation
- OG image generation via `astro-og-canvas` + `canvaskit-wasm`
- Partytown integration for offloading analytics to Web Workers

- Client-side search with language-specific JSON indexes
- RSS + Atom feed generation with XSLT styling
- llms.txt auto-generation for LLM consumption
- Web3Forms contact inquiry form
- Typing sound effects (Web Audio API, 5 variants)
- Image zoom on click (fullscreen lightbox)
- Table of Contents with active heading tracking
- Code block copy button

### Security

- www → non-www redirect (301) via Cloudflare Worker (SEO canonical unity)
- robots.txt blocks AI training crawlers (CC0 waiver)
- Umami Analytics external link tracking
- CSP-ready header structure

### Performance

- Static site generation (SSG) — all pages pre-rendered at build time
- Cloudflare Pages deployment (global CDN)
- Font subsetting and unicode-range splitting for EarlySummer
- astro-compress for HTML/CSS/JS (excludes images/SVG)
- Prefetch on viewport enter (`prefetchAll: true, strategy: 'viewport'`)

---

## 0.1.0 — 2021

Initial release. Single-language (zh) Astro site with basic blog functionality.


