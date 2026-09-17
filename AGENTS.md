# AGENTS.md — cgartlab.github.io

个人主站 (cgartlab.com)。Astro 7 + UnoCSS 66 + TypeScript 6 + pnpm 11 + Node 24，Cloudflare Worker + Static Assets 部署。Codex 为主要开发工具，所有开发流程、验证和交付均通过 Codex Agent 执行。

## 目录结构

```
cgartlab.github.io/
├── astro.config.ts          # i18n、Markdown 管线（unified）、Vite、站点
├── uno.config.ts            # Wind3 + Attributify + theme preset，非 Tailwind
├── wrangler.jsonc           # Worker + Static Assets + Cron + KV 绑定
├── pnpm-workspace.yaml      # nodeLinker / overrides / trustPolicy
├── tsconfig.json · eslint.config.mjs
├── package.json             # 脚本入口，packageManager 锁 pnpm@11.10.0
├── AGENTS.md · README.md · CONTRIBUTING.md · CHANGELOG.md
├── .github/                 # CI、PR/Issue 模板、Dependabot、labeler、release-drafter
├── public/                  # 静态资源，直映射站点根，不经构建处理
│   ├── fonts/ giscus/ images/ feeds/ icons/ sounds/ posts/
│   ├── llms.txt · github-repos.json   # 构建生成
│   └── robots.txt · favicon.ico · _headers
├── scripts/                 # 构建与运维脚本（tsx 运行）
├── patches/                 # pnpm patch（partytown）
├── dist/                    # 构建产物（gitignore，Worker 静态资源目录）
└── src/                     # 全部源码；本机同时是 Obsidian vault 根
    ├── worker.mjs           # Worker 入口：重定向 / 缓存头 / 安全头 / TG 推送
    ├── config.ts            # 站点元数据、导航、颜色、评论、SEO 单一声明源
    ├── content.config.ts    # 内容集合定义（posts / about / privacy）
    ├── content/             # 内容唯一来源
    │   ├── posts/           # 文章（*.md）、周刊（weekly/）、作品（works/）
    │   ├── posts/_images/   # 文章配图（395 张）
    │   ├── posts/_files/    # 文章附件
    │   ├── posts/0-文章数据库.base   # Obsidian Bases：草稿/周刊/已发布 四视图
    │   └── about/ privacy/  # 独立集合
    ├── assets/              # icons/ templates/ lqip/ lqip-map.json
    ├── components/          # Astro 组件（含 Widgets/）
    ├── layouts/             # Layout.astro · Head.astro
    ├── pages/               # [...lang]/ 动态路由 · api/ · 404
    ├── plugins/             # remark / rehype 插件（Markdown 管线）
    ├── styles/              # 纯 CSS 层，不经 UnoCSS transform
    ├── lib/                 # tg.mjs（Telegram）· github-contributions.ts
    ├── utils/               # content / feed / glossary / page / description / cache
    ├── i18n/                # config · lang · path · ui
    ├── data/                # glossary.ts · links.ts · github-contributions.json
    ├── config/              # tag-meta.json（标签页 SEO 定制）
    ├── types/               # TS 类型声明
    └── .obsidian/           # Obsidian vault 配置（gitignore，设备本地）
```

### 顶层模块职责

| 目录 | 职责 | 改动影响 |
|------|------|---------|
| `src/content/` | 内容唯一来源（文章/周刊/作品/图） | 写作目标，构建时采集 |
| `src/plugins/` | Markdown 管线插件（注册 6 remark + 8 rehype） | **顺序敏感**，插入须确认依赖 |
| `src/styles/` | 纯 CSS 层，不经 UnoCSS transform | 必须用 CSS 变量引用颜色 |
| `src/lib/` + `src/worker.mjs` | 服务端逻辑（RSS→TG 推送、缓存头、安全头） | 改动需 `wrangler` 部署验证 |
| `public/` | 静态资源，直映射站点根 | 文件名 = 线上 URL |
| `scripts/` | 构建/运维脚本 | 见 COMMANDS |
| `.github/` | CI、模板、Dependabot | 私有仓无法开分支保护 |

## COMMANDS

```bash
pnpm dev                  # astro check → astro dev (HMR 热更新，快速迭代，但不代表最终产物样式)
pnpm build                # astro check → fetch-github-repos → build → generate-llms → apply-lqip (顺序重要)
pnpm preview              # astro preview --host (局域网可访问，使用 dist/ 生产构建产物，最接近线上效果)
pnpm lint / lint:fix      # eslint (antfu config, 忽略 src/content/**)
pnpm astro                # Astro CLI 透传
pnpm new-post "标题"       # 创建 MD 文章 (src/content/posts/)，周刊自动放入 weekly/
pnpm format-posts         # CJK 文本规范化 (autocorrect)
pnpm apply-lqip           # 生成 LQIP 占位图 (写入 src/assets/)
pnpm verify-feed          # 验证 RSS/Atom feed 输出 (CI 中使用)
pnpm audit-glossary       # 审计术语表引用完整性
pnpm sync-docs            # 同步核心文档自动生成数据块 (版本/统计/管线，勿手改)
pnpm sync-docs:check      # 校验数据块是否最新 (CI 中使用，stale 则退出码 1)
pnpm fetch-github-repos   # 拉取 GitHub 仓库列表 → public/github-repos.json (build 前置)
pnpm update-gh-contributions  # 更新贡献热力图数据 → src/data/github-contributions.json
```

> ✅ **`fix-internal-links` 已移除** — `scripts/fix-internal-links.ts` 在 commit `183c767` 删除后，`package.json` 的失效入口已在审计修复中一并清理。

> ℹ️ 本机 shell 的全局 Node 为 v26，`pnpm` 经 corepack 调用时报 `Cannot find module ...\corepack\dist\pnpm.js`。绕行方式：`./node_modules/.bin/tsx scripts/<name>.ts`。

## KEY QUIRKS

- **`trailingSlash: 'always'`** — 禁止修改，所有 URL 依赖该设置
 - **pnpm only** — `package.json` 中 `packageManager` 强制 `pnpm@11.10.0`
- **LQIP 自动生成** — `src/assets/` 下图片由 `apply-lqip.ts` 管理，禁止手动编辑
- **文章图片** — 必须放在文章同名 `_images/` 目录下
- **ESLint 跳过** — `src/content/**` 完全忽略
- **pre-commit hook** — `simple-git-hooks` + `lint-staged` 自动 eslint --fix `.js/.ts/.astro`
- **Type suppressions** — 仅 1 处 (`@ts-expect-error` in MediaEmbed.astro)
- **`--at-apply` 已废弃** — `injectReset: true` 移除后，纯 CSS 文件中的 `--at-apply` 不再被 UnoCSS 处理，需转为显式 CSS 变量
- **颜色 token** — 所有颜色必须用 `oklch(var(--un-preset-theme-colors-*))` token，禁止裸色值 `#xxx`/`rgb()`。唯一例外：毛玻璃/阴影中的物理透明度 `rgba(0,0,0,α)` 和固定功能语义色（如错误红）
- **View Transitions 监听器** — 全局 `addEventListener` 必须配套 `astro:page-load`/`astro:before-swap`，`matchMedia` 需提取为模块级常量引用
- **iOS 滚动锁定** — 使用 `.scroll-lock` class（`overflow:hidden + position:fixed + width:100%`），开启前保存 `scrollY`，关闭后恢复
 - **Shiki 双主题** — `shikiConfig.themes` 设 `light: 'github-light'` / `dark: 'github-dark'`，`.dark` 下代码高亮自动切换，无需额外 JS
 - **Mermaid 排除 Shiki** — `syntaxHighlight.excludeLangs: ['mermaid']` 确保 Mermaid 代码块不被 Shiki 处理，交由 `rehype-mermaid` 构建时渲染
 - **remark/rehype 顺序敏感** — Astro markdown 管线中 6 个 Remark 插件 + 8 个 Rehype 插件，后者依赖上游 ID 生成，插入新插件必须确认顺序
 - **`color-mix()` 色彩空间差异** — 项目混用 `color-mix(in srgb, ...)` 和 `color-mix(in oklch, ...)`，不同浏览器渲染有细微色差
- **Giscus 主题 CSS 加载链路** — 主题 CSS 托管在本地 `public/giscus/`，通过绝对路径 `https://cgartlab.com/giscus/theme-*.css` 加载。必须使用绝对路径，因为 Giscus iframe 的 origin 是 `giscus.app`，相对路径会解析为 `https://giscus.app/giscus/theme-*.css` → 404。修改 `public/giscus/theme-*.css` 后重新部署即可生效，无需修改上游仓库。
- **Bot 生成 issue 评估** — Daily Inspection Bot 会自动生成"最佳实践"类 issue（如"无测试覆盖"、"硬编码值"、"缺少冒烟测试"）。合并前必须评估实际风险：检查是否有真实 bug 历史、当前 CI 是否已覆盖关键路径、ROI 是否值得投入。不值得修的 issue 应关闭并说明理由，而非盲目创建 PR。

<!-- DOC-FACTS:START -->
> 自动生成数据（由 `pnpm sync-docs` 更新，勿手改）

> 技术栈：Astro 7.3.2 · TypeScript 6.0.3 · UnoCSS 66.10.2 · pnpm 11.10.0 · Node 24
> 内容：159 个文章文件（80 中文 + 79 英文），周刊 20 期
> Markdown 管线：6 remark + 8 rehype 插件
> 脚本：15 个（apply-lqip / astro / audit-glossary / build / dev / fetch-github-repos / format-posts / lint / lint:fix / new-post / preview / sync-docs / sync-docs:check / update-gh-contributions / verify-feed）
<!-- DOC-FACTS:END -->

## ARCHITECTURE

| Area | Path | Notes |
|------|------|-------|
| 内容集合 | `src/content.config.ts` | `posts`, `about`, `privacy` 三个集合 |
| i18n | `src/i18n/config.ts` | zh 默认, /en/ 路由前缀；zh-tw 基础设施（locale/UI/数据/文案）存在但**未启用**——`config.ts` 的 `moreLocales` 仅含 `en`，内容 schema 的 `lang` 字段不接受 `zh-tw` |
| 主题配置 | `src/config.ts` | 站点元数据、导航、颜色、评论、SEO |
| UnoCSS | `uno.config.ts` | Wind3 + Attributify + theme preset, 非 Tailwind |
| 路由 | `src/pages/[...lang]/` | 多语言前缀动态路由 |
| Telegram 推送 | `src/lib/tg.mjs` + Worker scheduled | RSS → 频道推送，KV 状态去重，Cron 每 15 分钟 + `/api/tg-notify` 手动触发 |
| 评论 | Giscus（主用）+ Twikoo/Waline（需额外配置后启用）。主题 CSS 本地托管于 `public/giscus/`，通过绝对路径加载 |
| 表单 | `src/components/InquiryForm.astro` | Web3Forms，submit 监听器在 `astro:page-load` 内绑定 |
| 搜索 | 客户端搜索索引 (`api/search-index/[lang].json.ts`) |
| OG 图片 | `astro-og-canvas` + `canvaskit-wasm` 构建时生成，过滤草稿 |
| Wrangler | `wrangler.jsonc` | Workers + Static Assets (dist 目录)，含无尾斜杠 301 重定向 |
| TOC 高亮 | `Widgets/TOC.astro` | IntersectionObserver 驱动 `.toc-active` class，按 DOM 顺序排序 |
| 滚动锁定 | `global.css .scroll-lock` | iOS Safari 兼容：`overflow:hidden + position:fixed + width:100%` |
| Mermaid 图表 | `Widgets/MermaidLazy.astro` | `rehype-mermaid` 构建时预渲染 + IntersectionObserver 延迟加载 |
| 隐私同意 | `ConsentBanner.astro` | 三级 Cookie 同意（拒绝/仅功能/全部接受），聚焦陷阱，滚动锁定联动 |
| reduceMotion | `themeConfig.global.reduceMotion` | 启用后在 `<html>` 添加 `.reduce-motion` 类，禁用入场动画，启用 0.3s 颜色/边框过渡 |
 | 主题上游 | `scripts/update-theme.ts` | 从 `radishzzz/astro-theme-retypeset` 合并主题更新 |
 | GitHub 热力图 | `Widgets/GithubHeatmap.astro` + `src/lib/github-contributions.ts` | GitHub GraphQL API + 文件缓存 (`.temp/gh-contributions.json`, 2h TTL, 10s 超时)，构建时容错，用于 `[...lang]/works.astro` |
 |  Markdown 管线 | `astro.config.ts` | Remark 6 插件 + Rehype 8 插件，顺序敏感，插件间有依赖关系 |
 | 样式分层 | `src/config.ts` + `uno.config.ts` + `src/styles/*.css` | 配置→UnoCSS 变量→纯 CSS，三层解耦，纯 CSS 不经过 UnoCSS transform |
 | 暗色模式 | `uno.config.ts` + `src/styles/*.css` | unocss-preset-theme 生成 `:root`/`.dark` 两套 CSS 变量覆盖 |
 | 字体系统 | `src/styles/font.css` + `uno.config.ts` fontFamily | 四组字体族（title/navbar/time/serif），Vite 插件在构建时重写 URL |

## BRANCH STRATEGY

- **dev-{kebab}** — 代码/功能/样式开发
- **write-{kebab}** — 文章/周刊创作
- main 受保护，必须通过 PR → squash merge 合并，合并后删除分支

## COMMIT MESSAGE

必须符合 Conventional Commits 格式（hook 校验）：
`<type>(<scope>): <描述>` — type 限 `feat|fix|docs|style|refactor|perf|test|chore|ci`

豁免前缀：`Merge ...`、`Revert ...` / `This reverts commit ...`、`vault backup: ...`

## CONTENT CONVENTIONS

| 字段 | 类型 | 必需 |
|------|------|------|
| `title` | string | 是 |
| `published` | date | 是 |
| `tags` | string[] | 否 (周刊必须含 `周刊` tag) |
| `draft` | boolean | 否 (默认 false) |
| `lang` | `''` / `'en'` | 否（zh-tw 未启用，schema 不接受） |
| `abbrlink` | string | 否 (小写字母+数字+连字符) |

- 英文版文件名加 `-en` 后缀，如 `文章.md` + `文章-en.md`
- 双语文章的 URL slug 共用中文文件名（去掉 `-en` 后缀）

## 写作环境（Obsidian）

本机用 Obsidian 写文章。**vault 根设在 `src/`，不是仓库根** —— 仓库根包含 `node_modules`（43k 文件），会把启动从 ~1.7s 拖到 ~9.4s。

### 关键配置

| 项 | 值 |
|---|---|
| vault 根 | `D:\2-Area\github-repos\cgartlab.github.io\src`（672 文件）|
| 配置目录 | `src/.obsidian/`（被 `.gitignore:63` 忽略 → **纯设备本地**）|
| 新建文章 / 附件 | `content/posts` / `content/posts/_images` |
| 链接格式 | `relative`（现有 802 个图片链接均为相对路径，**禁改 `absolute`**）|
| 模板 | `assets/templates` |
| 数据库 | `content/posts/0-文章数据库.base`（Obsidian Bases，4 视图：草稿/周刊/已发布文章/已发布周刊）|
| git 插件 | `basePath: ".."`（上溯到仓库根）|
| git 插件 | `refreshSourceControl: false`（关掉 7s 轮询 `git status`，ExFAT 上会卡死）|
| 渲染 | `translucency: false`（关毛玻璃，Windows 上收益最大）|
| 安全 | `file-recovery: true`（崩溃后可恢复未保存内容）|

### ⚠️ `userIgnoreFilters` 不隐藏文件浏览器

Obsidian 官方定义（从 `obsidian.asar` 提取原文）：

> Excluded files will be hidden in **Search, Graph View, and Unlinked Mentions**, less noticeable in **Quick Switcher and link suggestions**.

它**不影响 File Explorer**。隐藏侧栏目录必须用 **CSS 片段**：

- 文件：`src/.obsidian/snippets/hide-dev-folders.css`
- 启用：`appearance.json` → `enabledCssSnippets: ["hide-dev-folders"]`
- 选择器：`.nav-folder[data-path="X"]` + `.nav-folder:has(> .nav-folder-title[data-path="X"])`（`data-path` 可能落在外层或标题层，两个都写）
- 隐藏 `components/ pages/ layouts/ lib/ i18n/ styles/ plugins/ types/ utils/ data/ config/` + `_AGENTS_posts.md`，只留 `content/` + `assets/`

### 两个机制的职责划分

| 需求 | 用哪个 |
|---|---|
| 侧栏不显示开发目录 | **CSS 片段**（`data-path` 选择器）|
| 搜索/图谱不出现开发文件 | `userIgnoreFilters` |
| 加快启动 | vault 根不要包住 `node_modules` |

### `.base` 过滤器约定

`0-文章数据库.base` 是 **git 跟踪文件**（与配置目录不同），且被多设备共用，过滤器必须写成**两种 vault 根都命中**的形式：

- ✅ `file.folder.contains("posts")` — repo-root vault（`src/content/posts/...`）与 `src/` vault（`content/posts/...`）都匹配
- ✅ `file.folder.contains("weekly")` — 同上
- ❌ `file.inFolder("src/content/posts/weekly")` — vault 相对路径，换 vault 根即失效

### 插件约定

保留：`global-proxy` · `obsidian-git` · `image-converter` · `obsidian-linter`

- **linter** — `lintOnSave: true` + 18 条规则保留；`displayChanged: false` 减少保存时的弹窗开销；`foldersToIgnore` 必须是 **vault 相对路径**（`content/posts/_images`），裸名 `_images` 是失效项
- **image-converter** — `image-converter-image-alignments.json` 的 key 是 vault 相对路径，**换 vault 根后必须同步改写 key**
- **文件恢复** — `file-recovery` 必须在 `core-plugins.json` 中为 `true`

## 设备与文件系统约束

本机仓库位于 **ExFAT 卷（`D:`）**，这是为 macOS 读写刻意选择的格式。ExFAT 缺失的能力会直接影响工具链。

### ExFAT 的硬限制（均已实测）

| 能力 | 结果 |
|---|---|
| 目录 junction（`mklink /J`）| ✗ “需要 NTFS 驱动器” |
| 目录符号链接（`mklink /D`）| ✗ “设备不支持符号链接” |
| 硬链接（`mklink /H`）| ✗ “参数不正确” |
| 簇大小 128 KB | 小文件放大 5–10 倍 |

**因此「依赖放别处、仓库只引用」在本机不可实现** —— 三种链接机制全被文件系统拒绝，只能物理移入/移出。

### pnpm 配置的由来

`pnpm-workspace.yaml` 中的 `nodeLinker: hoisted` 不是优化，而是**兼容性必需**：

```yaml
nodeLinker: hoisted   # Windows exFAT 不支持 symlink
```

pnpm 默认 `isolated` linker 依赖符号链接，ExFAT 不可用，故退化为扁平复制 —— 代价就是 43k 文件 / 5.8 GB。**不要改回 `isolated`。**

### 启动性能对照（实测）

| vault 根 | 文件数 | 启动总时长 | Vault 段 |
|---|---|---|---|
| 仓库根 | 45,404 | 9,384 ms | 7,827 ms |
| `src/` | 672 | ~1,700 ms | ~200 ms |

瓶颈恒在 `Loading file metadata`。

### Git 维护记录

`.git` 曾被 macOS AppleDouble 与历史大文件撑大：

- `.git/` 内囤积 **1004 个 `._*` AppleDouble 文件**（Syncthing/SMB 传输产生），每个占 128 KB 簇 ≈ **128 MB 纯垃圾**。清理：`find .git -name "*._*" -delete`
- 历史中含有 `.copilot-index/copilot-index-*.json` 的 **4 个版本共 ~178 MB**（工作区已移除但历史未清），是剩余 139 MB pack 的主体 → 彻底清除需 `git filter-repo`（改写历史，需 force push）
- 已启用：`core.untrackedCache=true`、`feature.manyFiles=true`
- `git gc --prune=now` 后：`.git` 307 MB → **159 MB**，3 pack → 1 pack，`git status` 0.103s → 0.061s

### 已弃用

- **Syncthing** 已完全停用，`.stignore` / `.stignore-common` 仅作历史残留，新增文件不需考虑其规则

## CI/CD

- push main → Cloudflare Worker + Static Assets 自动部署（Cloudflare Git 集成，非 GitHub Actions 部署）
- 构建命令: `pnpm install --config.trustPolicy=off && pnpm build && pnpm verify-feed`
- 域名: cgartlab.com (Cloudflare Worker + Static Assets 自定义域名)

## DEBUGGING

### 暗色模式失效排查清单

当暗色模式出现异常（切换后背景/文字颜色不变化）时，按顺序执行：

1. **查 git 历史** — `git log --oneline -20`
   - 找最近合并的 PR，尤其是涉及 CSS/UnoCSS 的变更
   - 破坏点通常是最近一次"以为无害"的重构
2. **枚举所有 CSS 文件** — `git ls-files 'src/**/*.css'`
   - 确认每个文件都使用了 CSS 变量，没有残留 `--at-apply`
   - `--at-apply` 在移除 `injectReset: true` 后不再被 UnoCSS 处理，会变成死代码
3. **验证 UnoCSS 构建产物** — 搜索 `.astro/`
   ```bash
   Select-String -Path '.astro' -Pattern "\.dark.*--un-preset-theme-colors-background"
   ```
   - 确认存在 `.dark { --un-preset-theme-colors-background: ... }` 变量覆盖
4. **浏览器 DevTools** — 在暗色模式下检查
   ```js
   getComputedStyle(document.documentElement)
     .getPropertyValue('--un-preset-theme-colors-background')
   ```
   - 亮色应返回含 `98%`，暗色应返回含 `22%`
5. **硬刷新排除缓存** — 暗色模式下 `Ctrl+Shift+R` 硬刷新

### 关键规则

- **修改配置层（UnoCSS/Vite）后必须验证构建产物** — 配置对不等于 CSS 对
- **用户提到"之前是好的"立即查 git 历史** — 不要在当前代码里反复重建
- **PR 改了部分文件时立即审计同类文件** — 很可能遗漏了同类文件
 - **CSS 变量同时查 `:root` 和 `.dark` 两个选择器** — 单边有值不等于两边都生效
- **线上显示异常时先查部署版本** — `curl -s https://cgartlab.com/ | grep "关键标识"` 对比本地代码，确认线上运行的是哪个版本。Cloudflare 有缓存（`CF-Cache-Status: HIT`），push main 后可能需要等待缓存过期（HTML 10min / 边缘 30min）
- **跨域 iframe CSS 必须用绝对路径** — Giscus 评论区运行在 `giscus.app` 的 iframe 中，相对路径会解析为 `giscus.app/giscus/theme-*.css` → 404。必须使用绝对路径 `https://cgartlab.com/giscus/theme-*.css`。修改 `public/giscus/theme-*.css` 后重新部署即可生效。

 ## 样式架构详解

 ### 三层样式分层

 | 层 | 位置 | 处理方 | 职责 |
 |----|------|--------|------|
 | 配置层 | `src/config.ts` | 项目代码 | 定义颜色、字体、布局 tokens 的单一声明源 |
 | 桥梁层 | `uno.config.ts` | unocss-preset-theme | 将配置转化为 CSS 变量 `--un-preset-theme-colors-*`，生成亮色/暗色两套值 |
 | 落地层 | `src/styles/*.css` + `.astro <style>` | 浏览器 / UnoCSS transform | 通过 CSS 变量引用颜色，不直接使用裸色值 |

 ### 颜色系统完整链条

 ```
 src/config.ts → themeConfig.color (light/dark oklch 值)
        ↓
 uno.config.ts → theme.colors (展开 light 语义色 + note/tip/important/warning/caution)
        ↓
 unocss-preset-theme → 为每个出现在源码中的 utility class 生成 CSS 变量
        ↓
           ┌─ safelist → 强制生成仅在纯 CSS 文件中引用的变量
           │              (如 bg-background, text-highlight 等)
           ↓
 src/styles/*.css → 使用 oklch(var(--un-preset-theme-colors-*))
 ```

 **关键约束**：
 - 所有颜色必须用 `oklch(var(--un-preset-theme-colors-*))` 格式，避免 `#xxx` / `rgb()`
 - 物理透明度（毛玻璃/阴影/按钮悬停等）允许 `rgba(0,0,0,α)` 或 `color-mix(in srgb, oklch(...), transparent)`
 - 新增语义色时必须同步更新：`uno.config.ts` 中的 `theme.colors` → `presetTheme` 的 dark → `safelist`

 ### safelist 机制细节

 `unocss-preset-theme` 只对**源码中实际出现的 utility class** 生成 CSS 变量。`src/styles/*.css` 中的 `oklch(var(--un-preset-theme-colors-background))` 是纯 CSS 变量引用，不是 UnoCSS utility，不会触发变量生成。

 ```ts
 safelist: [
   'bg-background',
   'bg-highlight',
   'bg-note',
   'bg-tip',
   'bg-important',
   'bg-warning',
   'bg-caution',
   'text-background',
   'text-highlight',
   'text-note',
   'text-tip',
   'text-important',
   'text-warning',
   'text-caution',
 ]
 ```

 safelist 通过列出不存在的 utility（如 `bg-background` 从未在任何 .astro 中出现）迫使 `unocss-preset-theme` 为它生成变量。如果新增了一个只在纯 CSS 中引用的颜色，必须同步添加 safelist 条目，否则暗色模式无覆盖值。

 ## ASTRO 开发注意事项

 ### 内容集合（Content Collections）

 定义于 `src/content.config.ts`，三个集合：
 - `posts` — 文章/周刊 MDX/MD 内容
 - `about` — 关于页面
 - `privacy` — 隐私政策

 Frontmatter 类型安全由 Astro 自动推断。集合加载：

 ```astro
 ---
 import { getCollection } from 'astro:content'

 const posts = await getCollection('posts')
 ---
 ```

 ### i18n 路由结构

 ```ts
 // astro.config.ts
 i18n: {
   locales: [
     { path: 'en', codes: ['en-US'] },
     { path: 'zh', codes: ['zh-CN'] },
     { path: 'zh-tw', codes: ['zh-TW'] },
   ],
   defaultLocale: 'zh',
 }
 ```

 路由文件位于 `src/pages/[...lang]/` 动态目录下。`zh` 为默认语言无 URL 前缀，`/en/` 带语言前缀。zh-tw 的 locale/UI/数据/文案基础设施存在但**未启用**：`src/config.ts` 的 `moreLocales` 仅含 `en`（`allLocales = ['zh','en']`），内容 schema 的 `lang` 字段不接受 `zh-tw`，因此**不要**给文章写 `lang: 'zh-tw'`（会 Zod 校验失败导致构建中断）。若日后启用：改 `config.ts` 的 `moreLocales`，并同步 `src/lib/noindex.mjs` 的 `LANG_PREFIXES`（noindex 正则依赖它）。通过 `Astro.currentLocale` 获取当前页语言。

 ### dev 与 build 的关键差异

 | 方面 | `pnpm dev` (HMR) | `pnpm build && pnpm preview` (生产构建) |
 |------|-------------------|------------------------------------------|
 | View Transitions 动画 | **不触发** | 正常触发 |
 | UnoCSS 变量生成 | 动态注入，可能覆盖缺失 | 仅 safelist + 源码扫描 |
 | CSS 压缩 | 无 | astro-compress 压缩 |

 **务必记住**：View Transitions 动画（`transition.css` 中的主题切换 clip-path 动画、文章内容渐入等）只在 `build + preview` 模式下运行。HMR 不会触发 `::view-transition-*` 伪元素。

 ### Markdown 插件管线

 Remark 和 Rehype 插件的**顺序敏感**，当前管线：

 **Remark（顺序关键）：**
 1. `remarkDirective` — 解析 `::directive` 语法（基础，必须在容器/叶指令之前）
 2. `remarkMath` — 识别 `$...$` / `$$...$$` LaTeX
 3. `remarkContainerDirectives` — 自定义容器（警告框等）
 4. `remarkLeafDirectives` — 叶节点指令
 5. `remarkReadingTime` — 阅读时间
 6. `remarkGlossary` — 术语表标记

 **Rehype（顺序关键）：**
 1. `rehypeKatex` — LaTeX 渲染
 2. `rehypeMermaid` — Mermaid 构建时渲染（`strategy: 'pre-mermaid'`）
 3. `rehypeSlug` — 标题 ID 生成（必须在 heading-anchor 之前）
 4. `rehypeHeadingAnchor` — 锚链图标（依赖 rehypeSlug 的 ID）
 5. `rehypeImageProcessor` — 图片路径处理
 6. `rehypeGlossary` — 术语表超链接
 7. `rehypeExternalLinks` — 外链安全属性
 8. `rehypeCodeCopyButton` — 代码块复制按钮

 **注意事项**：
 - 添加新插件时注意插入顺序，尤其是依赖上游 ID 或 AST 结构的插件
 - `excludeLangs: ['mermaid']` 防止 Shiki 和 rehypeMermaid 冲突
 - rehype 阶段不再有 remark 的 directive 上下文

 ## UNOCSS 开发注意事项

 ### Preset 组成与职责

 ```ts
 presets: [
   presetWind3(),        // Tailwind Wind3 原子类
   presetAttributify(),  // 属性化 class 写法
   presetTheme(...),     // 暗色模式 CSS 变量生成
 ]
 ```

 - **presetWind3**：提供 `text-*`、`bg-*`、`flex`、`grid`、`p-*` 等全套原子类。不是 Tailwind 3 的 1:1 复制，部分类名和断点有细微差异。
 - **presetAttributify**：`<div p="x-4 y-2" text="center">` 等价于 `class="px-4 py-2 text-center"`。在 Layout.astro 中广泛用于响应式布局。
 - **presetTheme**：唯一负责暗色模式 CSS 变量生成的 preset。将 `theme.colors` 映射为 `--un-preset-theme-colors-*`，在 `.dark` 选择器下输出覆盖值。

 ### Shortcuts 与语义别名

 ```ts
 'c-primary': 'text-primary',
 'c-secondary': 'text-secondary',
 'c-note': 'text-note',
 'text-footer': 'text-xs leading-normal',
 ```

 语义别名使用 `shortcuts` 机制，比维护额外 CSS class 更轻量。opacity modifier 正常工作：`c-secondary/60` 等价于 `text-secondary/60`。

 ### Custom Variant: `cjk:`

 ```ts
 (matcher) => {
   if (!matcher.startsWith('cjk:'))
     return matcher
   return {
     matcher: matcher.slice(4),
     selector: s => `${s}:is(:lang(zh), :lang(ja), :lang(ko))`,
   }
 }
 ```

 生成 `.tracking-wide:is(:lang(zh), :lang(ja), :lang(ko))` 形式的选择器。在 `markdown.css` 中用于 CJK 文本间距和断词优化。

 ### 纯 CSS 文件与 UnoCSS 的耦合关系

 `src/styles/*.css` 通过 Vite 的 CSS pipeline 直接加载，**不经过 UnoCSS transform**。这意味着：
 - 这些文件中的 `@apply` / `--at-apply` 不会被处理（`--at-apply` 已废弃）
 - 这些文件中的颜色通过 `oklch(var(--un-preset-theme-colors-*))` 引用 UnoCSS 生成的变量
 - 这些文件中的字体通过 `var(--un-preset-theme-font-family-*)` 引用

 ### transformer 注意事项

 两个 transformer 作用于 UnoCSS 处理的文件范围（.astro/.vue/.jsx 等）：

 - **`transformerDirectives()`** — 允许 `@apply text-primary bg-highlight` 语法。仅在 UnoCSS transform 范围内生效，纯 CSS 文件中不可用。
 - **`transformerVariantGroup()`** — 允许 `hover:(text-primary bg-highlight)` 简写。同样仅限 UnoCSS transform 范围内。

 ### 常见陷阱

 1. **新增颜色忘记同步 safelist** → 暗色模式无覆盖值，表现为切换后颜色不变化
 2. **在纯 CSS 文件中使用 `--at-apply`** → 静默失效，死代码残留
 3. **`color-mix(in srgb, ...)` 与 `(in oklch, ...)` 混用** → 不同浏览器渲染有差异
 4. **Attributify 与 Astro `class:list` 的边界** — 两者不冲突，但要避免在一个元素上混用两种写法的同类属性

## NOTE

- 设备级配置现在是 **`src/.obsidian/`**（vault 根在 `src/`），由 `.gitignore:63` 忽略，**不纳入 git 追踪**，各设备独立维护
- **Syncthing 已弃用** — `.stignore` / `.stignore-common` 与 `scripts/syncthing-cleanup.*` 均为历史残留。若旧冲突文件（`*.sync-conflict-*`）重新出现，直接删除即可
- 本机 shell 环境两个坑：中文参数 / `grep` 模式容易被搅乱（改用 ASCII 通配或 `ls -b`，写文件后用 `cmp` 字节比对验证）；`pnpm` 经 corepack 调用失败（改用 `./node_modules/.bin/tsx`）

## UnoCSS Safelist Mechanism

项目中的部分主题颜色 token 无法通过 UnoCSS 的静态扫描自动发现，因为它们在 raw CSS 文件中以 CSS 变量的形式引用（`oklch(var(--un-preset-theme-colors-*))`），而非以 utility class 形式出现在组件模板中。这些变量的 CSS 声明必须通过 `uno.config.ts` 中的 `safelist` 显式触发。

当前 safelist 设计：

- `bg-{color}` / `text-{color}` 条目 → 强制 `unocss-preset-theme` 生成 `:root` 和 `.dark` 的 CSS 变量定义
- 仅需为**只在 raw CSS 中使用**的颜色添加 safelist 条目
- 如果颜色同时也作为 utility class 出现在组件模板中（如 `text-primary`），UnoCSS 会自动扫描发现，无需加入 safelist

修改 `src/config.ts` 中的主题颜色后，必须同步检查 `uno.config.ts` 的 `safelist`：

- 新颜色只在 raw CSS 中使用？→ 添加 `bg-{name}` / `text-{name}` 到 safelist
- 新颜色也作为 utility 在组件中使用？→ 无需 safelist 条目

否则暗色模式变量不会发出，`oklch(var(--un-preset-theme-colors-{name}))` 会解析为无效颜色。

## Development / Preview Difference

本项目存在三个环境，各有不同的行为特征：

| 环境 | 命令 | 特点 |
|------|------|------|
| Development | `pnpm dev` | Vite 开发服务器，HMR 热更新，无构建压缩 |
| Preview | `pnpm build && pnpm preview` | 基于 `dist/` 生产构建产物，包含 `astro-compress` 压缩结果 |
| Production | Cloudflare Worker + Static Assets 部署 | 最终生产环境，CDN 缓存，Worker 重写规则 |

### 常见陷阱

**astro-compress 压缩** — `astro-compress`（CSS: true, HTML: true, JavaScript: true）仅在 `astro build` 阶段运行。修改 `lqip.css`、`global.css` 等使用现代 CSS 语法的文件后，需通过 `pnpm build && pnpm preview` 验证构建产物。

**LQIP 占位图** — `apply-lqip.ts` 只在 `pnpm build` 阶段运行。Dev 模式下图片没有 `--lqip:` 渐变背景占位，直接显示原图。这是正常现象。

**View Transitions 动画** — View Transitions 动画（主题切换、页面入场动效）仅在 MPA 导航（`pnpm preview`、生产环境）下触发。`pnpm dev` 的 HMR 热更新不会触发 View Transitions。

### 调试流程

修改样式/资源后，按此顺序排查：

1. 确认修改在 `pnpm dev` 中正常工作
2. 运行 `pnpm build && pnpm preview` 验证生产构建产物
3. 如果 preview 与 dev 不一致，优先检查：
   - 浏览器/边缘缓存（`Ctrl + Shift + R` 硬刷新）
   - 构建产物 `dist/` 中的 CSS 是否包含修改
   - 浏览器 DevTools → Application → Cache Storage 清空缓存
4. 不要直接认为是 CSS 逻辑错误 — 多数 preview/dev 差异来自缓存或构建压缩

## CODEX DEVELOPMENT

Codex 为主力开发工具。以下规则定义 Agent 行为边界和开发到生产的一致性保障。

### Agent 行为规范

**基础五条**

- **任务边界** — 只做用户明确要求的修改。发现优化点或缺陷先报告，未经确认不得擅自执行。
- **最小改动** — 优先局部修复、增量修改。禁止不必要的重构或依赖引入。
- **先读再改** — 修改前必读相关文件、AGENTS.md、现有约定和配置。
- **证据优先** — 不确定处明确标注，不猜测不存在的上下文。
- **验证先行** — 每次变更后先跑最小相关检查（lint → typecheck → build），再扩大到完整验证。

**机制先验证（本仓库高频踩坑点）**

- **不要凭设置名或直觉推断行为。** 「Excluded files」听起来像「隐藏文件」，实际只管搜索/图谱；`nodeLinker: hoisted` 看起来像性能优化，实际是 ExFAT 兼容性必需。**先查实现或实测，再下手。**
- 查证手段优先级：① 直接读实现（`obsidian.asar`、`node_modules/<pkg>`、`wrangler` 产物）② 最小可证伪实验（如 `mklink` 实测）③ 联网查证
- 结论必须附**可复查的证据**（命令输出 / 文件行号 / 实测数字），不只给判断
- 凡涉及外部工具行为（Obsidian / Git / pnpm / Cloudflare），先确认版本与实现，再写规则

**可逆优先**

- 优先选择**瞬时且可回滚**的操作。例：同卷 `mv` 移动 `node_modules`（瞬间、可还原）优于重跑 `pnpm install`（数十分钟）
- 破坏性操作（`rm -rf`、`git filter-repo`、`force push`）前先备份到 `.temp/`，并**在交付时给出回滚命令**
- 改设备级配置前先 `cp <file> .temp/<name>.bak`

**环境红线（违反会直接中断会话）**

- **禁止** `taskkill /F /IM node.exe` / `killall node` / `Stop-Process -Name node -Force` —— pi-web 自身就是 node 进程，全局杀 = 自杀
- 只按 PID 精确杀：`netstat -ano | grep ":PORT.*LISTEN"` → `taskkill /F /PID <PID>`
- 长驻服务（dev server）启动前先确认端口占用；kill 后等 2 秒再启动

**Git 纪律**

- **不要 `git add -A`** —— 只 add 自己新建/修改的明确文件（本工作区其他仓库混有未提交工作）
- 破坏性远端操作（`push`、删分支、改 ruleset）先确认
- 注意 `.gitignore` 与实际跟踪状态的差异：**已跟踪文件即使命中 ignore 规则仍会被跟踪**（如 `patches/*.patch`、`0-文章数据库.base`）
- `git status` 干净 ≠ 无风险：`.obsidian/` 等设备本地文件根本不进版本控制，改动不会显现

**本目录最高频的三类错误**

1. **把设备本地配置当仓库内容改** — `src/.obsidian/` 各设备独立，改它不影响其他设备；但 `0-文章数据库.base` 是共用文件，改动必须向后兼容
2. **改了 `app.json` 就以为生效** — vault 配置改动需重启 Obsidian；且 **`userIgnoreFilters` 不隐藏侧栏**（用 CSS 片段）
3. **在仓库根跑 `pnpm`** — `node_modules` 在根，但写作时它会被移出 vault；开发前先移回

### 交付前自验清单

根据近期 PR 修复历史总结的关键行为边界，Agent 必须遵守：

**1. 边界情况全覆盖**
- 数值参数：禁止硬编码 magic number（如 `80`、`120px`）—— 优先从 DOM 获取（offsetTop、scrollHeight），或使用已有的 CSS token / 变量

**2. 模式一致性检查**
- 颜色必须用 `oklch(var(--un-preset-theme-colors-*))` + `color-mix(in srgb, ...)` 处理透明度，禁止裸 `opacity` / `#xxx` / `rgb()`
- 优先使用 UnoCSS 原子类（`text-*` / `p-*` / `c-*`），次选手写 CSS；选择器层级不超过 3 层
- 同类文件修改应一起审计（如改了 TOC.astro 则检查 extension.css 中 TOC 样式是否需同步）

**3. JS 监听器治理**
- 所有全局监听器必须在 `astro:page-load` 中注册、在 `astro:before-swap` 中清理
- 多监听器共存场景（如 scroll + click + hashchange）必须显式设计互斥逻辑和触发顺位

**4. 双语言 & 响应式验证**
- i18n 修改必须在所有启用语言版本中验证（zh + en），不能假设中文正常即所有语言正常
- 布局修改须验证至少三种视口：≥1536px (2xl)、≥1024px (lg)、<768px (mobile)

**5. 构建通过 ≠ 功能正确**
- `astro check && astro build` 通过不代表样式/交互正确
- JS 交互类修改必须通过 `pnpm build && pnpm preview` 在浏览器中实际操作验证

**6. 首次交付原则**
- 涉及多文件的修改，交付前通读所有相关文件的完整内容，确认无遗漏
- 不确定处优先询问用户，而非自己猜测一个值先交付再说


### 开发到生产一致性

目标是确保最终交付到生产环境的功能和外观与开发预期完全一致。

- **构建验证** — 任何代码修改后必须运行 `pnpm build`，确保构建通过。修改 UnoCSS/Vite/Astro 配置后必须检查构建产物。
- **双模式样式验证** — 任何样式/UI 改动必须依次通过两项验证：
  1. `pnpm dev`（HMR 热更新）— 确认无构建错误和运行时异常
  2. `pnpm build && pnpm preview`（生产构建产物预览）— 验证最终产物样式（CSS 变换、UnoCSS safelist 变量生成、Astro 编译优化等）与线上完全一致
- **暗色模式** — 涉及 CSS/主题时，按 DEBUGGING 章节清单验证亮色和暗色模式均正常。
- **View Transitions 验证** — View Transitions 动画（主题切换、页面进入动效等，定义于 `transition.css`）仅在 `pnpm build && pnpm preview` 产线模式下触发，`pnpm dev` 的 HMR 热更新不会触发。修改过渡动画后，必须通过生产构建产物预览验证效果。

### 双模式样式验证的具体操作

`pnpm dev` 和 `pnpm preview` 默认使用相同端口（4321），无法同时运行。正确的验证顺序：

1. 先运行 `pnpm dev` 在默认端口检查快速迭代效果
2. `Ctrl+C` 停止 dev 服务器
3. 运行 `pnpm build && pnpm preview` 验证生产构建产物

如需在两者之间反复对比，可用 `--port` 参数让 preview 使用不同端口：
`pnpm build && pnpm preview --port 4322`，此时 dev 和 preview 可在不同端口同时运行对比。

### 禁止事项（严格）

- 未经确认不得新增 npm/pnpm 依赖
- 不得修改 `trailingSlash: 'always'` 配置
- 不得手动编辑 `src/assets/` 下的 LQIP 图片或 `lqip-map.json`
- 不得对 `src/content/**` 运行 ESLint
- **不得把 vault 根改回仓库根**（包含 `node_modules`，启动会从 ~1.7s 涨到 ~9.4s）
- **不得把 `newLinkFormat` 改成 `absolute`**（会生成 `/content/posts/_images/x.png` 形式的断链，破坏 Astro 解析）
- 未经确认不得删除或改写 `src/.obsidian/` 设备级配置（改动前先备份到 `.temp/`）
- 不得把 `pnpm-workspace.yaml` 的 `nodeLinker` 改回 `isolated`（ExFAT 不支持 symlink）

## DEPENDENCY UPGRADE

依赖升级遵循「分级 → 侦查 → 最小验证 → 渐进放行」四步，禁止看到 Dependabot PR 直接合并。

### 风险分级

| 等级 | 类型 | 策略 |
|------|------|------|
| 🟢 Patch (x.x.y) | bug fix | CI 全绿即可自动合并 |
| 🟡 Minor (x.y.z) | 新特性 | 批量合并，走标准验证管道 |
| 🔴 Major (y.x.z) | 破坏性 | 单个处理，人工迁移 + 专项验证 |
| 🔴 安全漏洞 | CVE | 优先于一切，当天处理 |

**major 永远不与 minor 混批**。Dependabot 批量 PR 若混入跨大版本包，必须拆分后再合并。

### 升级前侦查清单

1. 读官方 changelog + migration guide，逐个映射破坏性变更到项目实际用法
2. 检查 peerDependencies 兼容矩阵（`pnpm why <pkg>` / lockfile）—— 相邻依赖不兼容是翻车主因
3. 核对 engines（Node/pnpm 版本要求）与本地环境
4. 查上游是否停更或锁死依赖版本（如 rehype-katex@7 硬钉 katex `^0.16.0`，是 katex 升不动的根因）
5. grep 项目实际用法：不是「装了啥」而是「用了哪个 API」—— 按调用点排查移除/变更的选项

### 验证管道

```
pnpm lint → pnpm build → pnpm build && pnpm preview（实测：暗色/双语/公式/OG/交互）
```

- 构建通过 ≠ 功能正确：公式渲染、OG 图片、View Transitions、Mermaid 等必须 preview 实测
- 升级构建链（UnoCSS/Vite/Astro）后必须检查构建产物，配置对 ≠ CSS 对
- 回滚保险：每个包的升级单独 commit + 独立分支，出问题 revert 单个 commit，lockfile 一起回滚

### 当前版本约束（决策记录）

- **katex 锁定 `^0.16.47`（仍生效）** — rehype-katex@7.0.1 依赖 `katex: ^0.16.0`，升 0.17+/0.18 会产生双 katex 实例；且 0.18 起 CSS 类名加 `katex-` 前缀（`.base`→`.katex-base`），渲染 HTML 与加载 CSS 类名不匹配会导致公式破版。待 rehype-katex 发布兼容版本后再升
- **Astro 7 + astro-og-canvas 0.13 升级已完成** — 当前 `astro@^7.3.1` + `astro-og-canvas@^0.13.1`。配套的三项改动均已落地：
  1. `astro-og-canvas` 的 `param` 选项已移除（改由 endpoint 文件名自动推导），`OGImageRoute()` 已改 `await`
  2. Astro 7 默认 Markdown 处理器切换，已迁移到 `markdown.processor: unified({...})`（commit `3d18638e`），`markdown.remarkPlugins` / `rehypePlugins` 顶层配置已弃用
  3. 已验证 6 remark + 8 rehype 管线行为一致
  - ⚠️ 后续再升 Astro 大版本时，**必须重新验证整套 Markdown 管线**（插件顺序敏感，详见 §ASTRO 开发注意事项）
- **待办：`fix-internal-links` 入口失效** — 已修复：`package.json` 失效入口在 `dev-fix-audit` 中删除，`scripts/fix-internal-links.ts` 维持删除状态（commit `183c767`）

### 禁止事项

- major 升级不得与 minor 混批合并
- 未经上述侦查与验证不得合并依赖 PR

## CLOUDFLARE CONFIGURATION

以下信息通过 Cloudflare API 获取，反映 cgartlab.com 的当前线上部署状态。

站点通过 **Worker + Static Assets** 方式托管（非 Cloudflare Pages）。

| 配置项 | 值 |
|--------|-----|
| Worker 名称 | `cgartlab` |
| 主入口 | `src/worker.mjs` |
| 静态资源目录 | `./dist` (Astro build) |
| 兼容日期 | `2026-05-02` | `nodejs_compat` |
| 可观测性 | 已启用 |
| 路由 | `cgartlab.com`, `www.cgartlab.com` (custom_domain) |
| Cron 触发 | `*/15 * * * *` (Telegram 推送) ※ |
| KV 绑定 | `TG_STATE` (Telegram 推送去重状态) ※ |
| 创建 | 2026-07-12 | 最后修改 2026-07-13 |

※ Cron 与 KV 定义于 `wrangler.jsonc`：KV namespace `TG_STATE` 已创建并填入真实 id（`5826fda6e7d94b64afd31d73cbff6c65`），随分支部署生效；Worker Secret（`TG_BOT_TOKEN` / `TG_CHANNEL_ID` / `TG_NOTIFY_SECRET`）需通过 `wrangler secret put` 配置（见下方 Telegram 推送）。

### Worker 行为

按顺序执行（`src/worker.mjs`）：

0. **`/api/tg-notify` POST 手动触发** — 校验 `x-tg-secret` 头后推送，401 未授权
1. www → non-www 301
2. `/feed` 与 `/feed/` → `https://cgartlab.com/rss.xml` 301 重定向
3. 尾斜杠强制 301（跳过含 . 文件路径）
4. 目录 → index.html
5. 404 → 404.html 兜底（`Cache-Control: public, max-age=60`）
6. 缓存头按文件类型：指纹资源 / CSS/JS / 字体 → 1 年 immutable；图片 → 30 天；HTML → `max-age=600, s-maxage=1800`（浏览器 10min / 边缘 30min）
7. 兜底 catch → 404 `max-age=60`

### Telegram 推送（`src/lib/tg.mjs`）

- 抓取 `https://cgartlab.com/rss.xml`（默认语言）→ 与 KV `TG_STATE` 中最后 GUID 对比 → 推送新文章到频道
- 纯正则解析 RSS（不引入 XML 依赖）；消息用纯文本 + 链接预览，不设 `parse_mode`（规避 Markdown 转义坑）
- **首次运行只建立 baseline**（记录最新 GUID），不推存量文章
- 所需 Secret/Env：`TG_BOT_TOKEN`、`TG_CHANNEL_ID`、`TG_NOTIFY_SECRET`；KV namespace 名为 `TG_STATE`
- 并发保护：KV `push_lock` 防止 Cron 与手动触发重叠

### DNS
- Apex `cgartlab.com` / `www` → AAAA `100::` (代理)
- MX: `route{1,2,3}.mx.cloudflare.net` (Cloudflare Email)
- SPF/DKIM/DMARC 已配置
- 子域名 via GitHub Pages (`designsystem`, `edic`), Tunnel (多个服务), 直连 (NAS)
- 验证: Google Search Console, OpenAI, GitHub Pages

Zone ID: `40bc1e6e6b5ce02d16192609294ed2a2` / NS: `gerald`, `maeve` / Free Plan
