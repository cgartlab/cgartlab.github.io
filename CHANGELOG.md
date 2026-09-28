# Changelog

本项目所有值得记录的变更。格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

站点从 `main` 持续交付（Cloudflare Worker + Static Assets），1.0.0 之后不再单独切版本号，
因此下面的条目按合并日期归档，每条附对应的 PR 号。

---

## Unreleased

### 2026-09-28 — 清理 Syncthing / GitHub Pages 时代残留

**Removed**

- Syncthing 已于早前停用，本次删除其全部残留：`.stignore`、`.stignore-common`、
  `scripts/syncthing-cleanup.{sh,ps1}`、`scripts/SYNCTHING-SETUP.md`、`scripts/clean-sync-conflicts.sh`
- `.nojekyll`（0 字节）—— GitHub Pages 时代残留；站点现由 Cloudflare Worker + Static Assets 托管，该文件无作用
- `scripts/search-lang-check.ts` —— 未挂 `package.json`、无任何引用的历史脚本
- `.gitignore` 移除已失效的 Syncthing 规则（`.stignore-common`、`.stfolder*`、`.stversions/`、`.syncthing-*`）；
  实测仓库内已不存在这些文件/目录（`Test-Path .stfolder` / `.stversions` 均为 False）

**Changed**

- `AGENTS.md` / `CONTRIBUTING.md` 同步更新「已弃用」与 Syncthing 段落，改为记录清理结果与时间；
  `scripts/` 下唯一未挂 `package.json` 的脚本现为仍在使用的 `update-theme.ts`

### 2026-09-28 — RSS 图片绝对化 (#425)

**Fixed**

- `src/utils/feed.ts`：`getAbsoluteImageUrl` 查表前先 `decodeURIComponent` 再剥 `../` / `./` 前缀，
  修复 markdown-it 经 `mdurl.encode` 归一化后的链接目标（`%E4%B8%BA` / `%20`）与
  `import.meta.glob` 磁盘原始键对不上、查表恒 miss 的问题。此前 `dist/rss.xml` 149 张图中
  **148 张停留在 `../_images/...` 相对路径**，第三方阅读器正文全部裂图（纯 ASCII 文件名的那 1 张
  侥幸命中，问题因此长期静默）
- 修复后 zh/en 的 RSS + Atom **四个 feed 全部 149/149 图片为绝对 URL**；146 个去重 URL 在本地
  `dist/` 中逐个可解析（`pnpm build` 308 页通过，`pnpm verify-feed` 双 feed 全绿）
- 顺带记录（未处理）：glob 扩展名列表不含 `avif` / `svg`，当前 `_images/` 下无这两类文件

### 2026-09-27 — Telegram 推送修复与文档重写 (#423 #424)

**Fixed**

- `src/lib/tg.mjs`：解析 RSS 时先剥 `<![CDATA[…]]>` 包装再反转义，修复频道文案带上 CDATA 标记、
  且整段摘要被「剥 HTML 标签」正则吃掉的问题 (#424)
- 推送改用 `parse_mode="HTML"` 加粗标题，TG 返回 400 时自动降级为纯文本重发一次，
  避免一次转义疏漏就永久丢弃整篇文章 (#424)

**Changed**

- `CHANGELOG.md` / `README.md` / `AGENTS.md` 三份文档按「事实准确、信噪比优先」重写，
  消除重复段落并修正与现状不符的表述；删除 0 字节空壳文章 `src/posts/ai-guide-slow-is-fast.md` (#423)
- `pnpm lint` 的格式基线冲突（`54febc7` 的 prettier 结果 vs antfu eslint 风格，全仓约 1 万个
  formatting error）在 #425 的提交说明中披露；本次文档更新将其正式写入 AGENTS.md 的 KEY QUIRKS，
  统一格式化仍留待独立 PR

### 2026-09-27 — 专栏 No.21 中英双语 (#422)

**Added**

- 玄光专栏 No.21《为什么没感觉到 AI 让你变快？》中英双语，`abbrlink: weekly-21`，含 7 张配图
- 英文版按 Google SEO 与 GEO 优化：问题式标题与小节、可引用的事实与数字、内链话题簇、描述性 alt 文本
- `public/llms.txt` 收录本期中英条目

**Fixed**

- `public/llms.txt`：修正此前错误的 URL 形态（`/zh/weekly/weekly-20` → `/posts/weekly-20/`），与 `trailingSlash: 'always'` 一致
- 本机 pnpm 工具链：store 位于 ExFAT 卷，pnpm 无法创建项目注册符号链接，`pnpm install` 长期失败，`node_modules` 停留在旧版本（astro 7.3.1 / vite 8.2.2）。store 迁至 NTFS 后 `astro check` 与 `pnpm build` 恢复。属设备级配置，不入库

### 2026-09-21 — 缓存、导航与搜索修复 (#416 #417 #418)

- **perf(worker)**：HTML 边缘缓存延长到 1 小时，并补 SWR 窗口 (#418)
- **fix(toc)**：移除 `<base>` 标签，修复片段锚点导航跳回首页 (#417)
- **fix(search)**：修复搜索完全失效——`import.meta` 在 `is:inline` 脚本中抛 `SyntaxError` (#416)

### 2026-09-18 — 四路排查修复 30 项 (#414)

- **fix(audit)**：修复交互、样式、CI、SEO 四路排查发现的问题

### 2026-09-12 — 专栏 No.20 与文章模板精简 (#409 #410 #411)

- **feat(posts)**：发布专栏 No.20《文字内容创作的形式》中英双语 (#409)
- **docs(templates)**：精简 Obsidian 文章模板 (#410)
- **fix(posts)**：修正文章页面的中英文翻译问题 (#411)

### 2026-09-11 — 无障碍、搜索与依赖安全 (#402 #404 #405 #406 #407 #408)

- **fix(a11y)**：字母导航可达性与点按尺寸修复，含 CDP 实测证据 (#408)
- **fix(deps)**：修复阻断 CI 的 3 个传递依赖漏洞（sharp / svgo / js-yaml）(#406)
- **fix(deps)**：fast-uri 3.1.5 → 3.1.6，修补 4 项 SSRF / 主机混淆 CVE (#402)
- **fix(search)**：修复搜索空态 `ReferenceError`、监听器泄漏与 search 页 noindex 缺失 (#405)

### 2026-09-01 — Issue 清理与 Bug 修复 (#345–#352, #363–#367)

**Fixed**

- `apply-lqip.ts`：CJK 图片文件名的 `src` 匹配改为 URL 解码 (#304)
- `update-theme.ts`：7 处 `execSync` 补 30 秒超时 (#339)
- `description.ts`：`cleanText.slice()` 改为 `Array.from().slice().join()`，避免 CJK 与代理对截断破字 (#329)
- `github-contributions.ts` + `GithubHeatmap.astro`：移除 5 处 `console.log`，清理 lint 债 (#306)
- `ci.yml`：新增 `pnpm audit` 依赖审计门禁 (#308)
- `worker.mjs`：补安全响应头（HSTS / nosniff / X-Frame-Options / Referrer-Policy / Permissions-Policy）并启用 CSP (#333, #358)
- `update-contributions.yml`：cron 由每 6 小时降为每周日 (#357)
- `content.config.ts` + `Head.astro` + `Layout.astro`：新增文章级 `katex` frontmatter，按需加载公式样式 (#362)
- `fetch-github-repos.ts` + `GithubCard.astro`：GitHub 仓库数据改为构建期静态生成，运行时零 API 调用 (#353)

**Added**

- `.github/PULL_REQUEST_TEMPLATE.md` (#351)

**Chore**

- 清理 27 个过期、无效或 Bot 生成的 issue (#307, #309–#327, #328, #330–#332, #334–#338, #356, #359–#361)
- 逐条评估 Bot 生成 issue 的实际风险，不可执行的关闭并说明理由

### 2026-08-02 — 全部文章英译，双语覆盖 100% (#268)

- **feat(posts)**：翻译其余 29 篇中文文章，达成 100% 双语覆盖（里程碑）

### 2026-08-01 — AI 优雅食用指南（一）(#267)

- **feat(posts)**：新增《你不知道的 AI 优雅食用指南（一）：慢一点比较快》中英双语

### 2026-07-30 — 热力图迁移 GitHub GraphQL API (#266)

- **feat(heatmap)**：迁移到官方 GraphQL API，加入文件缓存与构建期容错

### 2026-07-29 — sharp 升级与友链 (#263)

- **feat(links)**：新增 Bo.Ke 友链
- **fix(deps)**：sharp 0.34.5 → 0.35.3，修复 libvips CVE
- **fix**：`Head.astro` lint 清理

### 2026-07-27 — 跨平台 pnpm 兼容与 CI 升级 (#255 #260)

- **fix**：跨平台 `pnpm install` 兼容（Windows / macOS / Linux）与死代码清理 (#260)
- **chore(deps)**：`actions/labeler` 6 → 7 (#255)

### 2026-07-22 — /feed 重定向与英文版审查 (#257 #258)

- **fix(worker)**：新增 `/feed` 快捷重定向到 RSS (#258)
- **fix(posts)**：全面修正英文版翻译质量、图片链接与 SEO (#257)

### 2026-07-21 — 「我的上帝模式」中英版与工作流自动化 (#251 #252 #253 #254)

- **feat(posts)**：发布《我的上帝模式，一名设计师创作环境的演变》中文版 (#251) 与英文版 (#254)
- **chore**：更新模板默认元数据，修订周刊描述 (#252)
- **ci**：`actions/add-to-project` 升级到 v2.0.0 (#253)

### 2026-07-17 — SEO 标题优化与 PR 自动化 (#237 #238 #247 #248)

- **feat(seo)**：新增 `seoTitle` frontmatter 优化页面标题，修正页脚英文 i18n (#247)
- **chore(ci)**：新 PR 自动指派作者并加入 Project 3 (#248)
- **chore(deps)**：补丁批量更新 (#238)，`actions/setup-node` 6 → 7 (#237)

### 2026-07-16 — About 页面法律文档更新 (#246)

- **docs(about)**：法务内容更新

### 2026-07-15 — glossary / Cookie / 视频文章系列 (#240–#245)

- **feat**：glossary 完整 i18n 支持 (#240)
- **feat(article)**：视频文章居中样式与可靠的自动播放 (#241)
- **style**：Cookie 弹窗样式优化 (#242)
- **fix(glossary)**：scroll-spy 与分隔符渲染 (#243)，移动端侧边导航与 scroll-spy 偏移 (#244)
- **feat(glossary)**：移动端导航自动隐藏，滚动显露，3 秒无操作后收起 (#245)

### 2026-07-13 — Mermaid 构建时渲染与暗色模式 (#235)

- **fix(mermaid)**：恢复构建时渲染，并准备暗色模式支持

### 2026-06-29 — 全面 Bug 修复与加固 (#199)

**P0 构建**

- `rehype-image-processor`：画廊 `splice` 后返回 `[SKIP, index + figures.length]`，修复遍历索引偏移；多图段落（非画廊）改用 `createFigure()` 保留 alt 与 `<figure>` 包裹；无 alt 的画廊图片也正确包裹 `gallery-item` class

**P1 功能**

- `WorksGallery`：`DOMContentLoaded` → `astro:page-load`，`event.target` → `event.currentTarget`，修复 View Transition 导航后筛选失效与子元素点击问题
- View Transition 监听器泄漏（6 个组件）：`SoundEffect`、`Button`、`ImageZoom`、`CodeCopyButton`、`GithubHeatmap`、`Layout` 统一改为 `astro:page-load` / `astro:before-swap` 配对
- `Button`：`matchMedia` 提取为模块级常量，`removeEventListener` 才真正生效
- `InquiryForm`：submit 监听器移入 `astro:page-load`，验证错误边框改为红色
- `extension.css`：移除非标准的 `scroll-target-group: auto` 与 `a:target-current` 伪类
- `TOC`：改用 IntersectionObserver 驱动 `.toc-active` 高亮，`scrollIntoView` 在 `reduce-motion` 下降级为 `instant`，按 DOM 顺序而非字典序确定最靠前的可见标题
- 6 个交互元素补 `:focus-visible` 与 outline（`tag-item`、`code-copy-button`、`category-tag`、`search-close`、`search-result-item`、`form-submit`）
- `Waline`：移除 `--waline-bg-color-hover` 同色覆盖
- `ConsentBanner`：补 `html.reduce-motion` 类选择器
- `ImageZoom`：iOS Safari 滚动锁定改用 `position:fixed + width:100%`，`cleanupZoom` 补 `scroll-lock` 移除，防止导航后下一页 body 被固定

**P2 功能与质量**

- `TOC`：容器加 `bottom-0`，`extension.css` 桌面端 `grid-template-rows:1fr` 移入 `@media(min-width:1536px)`，修复移动端始终展开
- `content.ts`：`getPosts` 用默认参数值归一化 `undefined → defaultLocale`，消除双缓存键
- OG 生成过滤 `draft:true` 文章
- `search-index` API（`[lang]` 版与全局版）均加 try-catch，返回 JSON 格式错误
- `worker.mjs`：无尾斜杠 301 重定向、全局 try-catch、404.html fallback
- `rehype-glossary`：CJK 术语补 Unicode 边界检查，防止复合词内子串误匹配
- `description.ts`：所有场景都截断 frontmatter description，修正 `htmlEntityMap` 的 `&amp;` 解码顺序，frontmatter description 先经 Markdown 渲染再截断
- `remark-container-directives`：清理空 admonition 产生的空 `<p>` 节点
- `rehype-external-links`：用 `URL.hostname` 判断同源，跳过同源链接的外链标记
- `transition.css`：`reduce-motion` 块补热图、链接卡片、画廊 hover 覆盖

**样式**

- 导航高亮：`::after` 改为 `height:2px` 下划线，移除 `z-index:-1`
- 资源页：移除 `.links-section` 的 `border-radius` / `overflow:hidden` 及展开时的标题分隔线

**颜色 Token**（Argus 评审跟进）

- `skip-to-content` 背景与 outline 的 `#007bff` → `primary` token
- `code-copy-button.copied` 成功绿 `#059669` / `#10b981` → `tip` token（合并为单条，暗色自动跟随）
- `subtitle-cursor-block` 红色 `#b91c1c` → `caution` token

### 2026-06 至 2026-07 — 文档与贡献基础设施

- **docs/PLUGINS.md** — 7 个自定义 remark / rehype 插件完整参考
- **docs/COMMANDS.md** — 所有 npm 脚本与构建工具汇总
- **CONTRIBUTING.md** — PR 流程、提交规范、分支策略
- **CHANGELOG.md** — 本文件
- **docs/ARCHITECTURE.md** — 全量重写：移除过时的 `blog/` 引用，结构对齐实际的 `posts/` `works/` `weekly/` `_images/`，补充 SSG、Markdown 管线、主题系统、i18n 路由、LQIP 管线，并记录 5 项关键架构决策

---

## 1.0.0 — 2026-06-14

### Added

- 三语言支持（zh / en / zh-tw）与 `[...lang]` 动态路由
- 玄光周刊系统与画廊组件
- 作品集（Works）板块
- 三套评论系统：Giscus / Twikoo / Waline（全部内置，可配置）
- 明暗双主题，基于 OKLCH 色彩空间
- LQIP 低质量占位图：sharp 3×3px → CSS 径向渐变
- 7 个自定义 remark / rehype 插件
- UnoCSS（presetWind3 + presetAttributify + presetTheme）
- KaTeX 数学公式
- Mermaid 图表
- View Transitions 主题切换与页面导航
- OG 图片生成（`astro-og-canvas` + `canvaskit-wasm`）
- Partytown 把分析脚本移入 Web Worker
- 客户端搜索，按语言分 JSON 索引
- RSS + Atom feed，含 XSLT 样式
- llms.txt 自动生成
- Web3Forms 联系表单
- 打字音效（Web Audio API，5 种）
- 图片点击缩放（全屏灯箱）
- 目录（TOC）与当前标题高亮
- 代码块复制按钮

### Security

- www → non-www 301 重定向，统一 canonical
- robots.txt 阻止 AI 训练爬虫
- Umami 外链跟踪
- CSP 就绪的响应头结构

### Performance

- 全站静态生成（SSG），所有页面构建期预渲染
- Cloudflare Worker + Static Assets 部署（全球 CDN）
- EarlySummer 字体子集化与 unicode-range 拆分
- astro-compress 压缩 HTML / CSS / JS（排除图片与 SVG）
- 视口进入时预取（`prefetchAll: true, strategy: 'viewport'`）

---

## 0.1.0 — 2021

首个版本。单语言（zh）Astro 站点，基础博客功能。
