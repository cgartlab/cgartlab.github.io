# AGENTS.md — cgartlab.github.io

个人主站 (cgartlab.com)。Astro 6 + UnoCSS 66 + TypeScript 6 + pnpm 11 + Node 24，Cloudflare Worker + Static Assets 部署。Codex 为主要开发工具，所有开发流程、验证和交付均通过 Codex Agent 执行。

## COMMANDS

```bash
pnpm dev                  # astro check → astro dev (HMR 热更新，快速迭代，但不代表最终产物样式)
pnpm build                # astro check → build → generate-llms → apply-lqip (顺序重要：generate-llms 需要构建后的文章列表，apply-lqip 需要处理构建后的资源)
pnpm preview              # astro preview --host (局域网可访问，使用 dist/ 生产构建产物，最接近线上效果)
pnpm lint / lint:fix      # eslint (antfu config, 忽略 src/content/**)
pnpm astro                # Astro CLI 透传
pnpm new-post "标题"       # 创建 MD 文章 (src/content/posts/)，周刊自动放入 weekly/
pnpm format-posts         # CJK 文本规范化 (autocorrect)
pnpm apply-lqip           # 生成 LQIP 占位图 (写入 src/assets/)
pnpm fix-internal-links   # 批量修复双语文章内部链接 (中→/en/ 版本)
pnpm verify-feed           # 验证 RSS/Atom feed 输出 (CI 中使用)
pnpm audit-glossary        # 审计术语表引用完整性
pnpm sync-docs             # 同步核心文档自动生成数据块 (版本/统计/管线，勿手改)
pnpm sync-docs:check       # 校验数据块是否最新 (CI 中使用，stale 则退出码 1)
```

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

<!-- DOC-FACTS:START -->
> 自动生成数据（由 `pnpm sync-docs` 更新，勿手改）

> 技术栈：Astro 7.1.4 · TypeScript 6.0.3 · UnoCSS 66.6.8 · pnpm 11.10.0 · Node 24
> 内容：148 个文章文件（74 中文 + 74 英文），周刊 19 期
> Markdown 管线：6 remark + 8 rehype 插件
> 脚本：14 个（apply-lqip / astro / audit-glossary / build / dev / fix-internal-links / format-posts / lint / lint:fix / new-post / preview / sync-docs / sync-docs:check / verify-feed）
<!-- DOC-FACTS:END -->

## ARCHITECTURE

| Area | Path | Notes |
|------|------|-------|
| 内容集合 | `src/content.config.ts` | `posts`, `about`, `privacy` 三个集合 |
| i18n | `src/i18n/config.ts` | zh 默认, /en/ 路由前缀（zh-tw 基础设施就绪但未启用） |
| 主题配置 | `src/config.ts` | 站点元数据、导航、颜色、评论、SEO |
| UnoCSS | `uno.config.ts` | Wind3 + Attributify + theme preset, 非 Tailwind |
| 路由 | `src/pages/[...lang]/` | 多语言前缀动态路由 |
| Telegram 推送 | `src/lib/tg.mjs` + Worker scheduled | RSS → 频道推送，KV 状态去重，Cron 每 15 分钟 + `/api/tg-notify` 手动触发 |
| 评论 | Giscus（主用）+ Twikoo/Waline（需额外配置后启用） |
| 表单 | `src/components/InquiryForm.astro` | Web3Forms，submit 监听器在 `astro:page-load` 内绑定 |
| 搜索 | 客户端搜索索引 (`api/search-index/[lang].json.ts` + `api/search-index.json.ts`) |
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
| `lang` | `''` / `'en'` / `'zh-tw'` | 否 |
| `abbrlink` | string | 否 (小写字母+数字+连字符) |

- 英文版文件名加 `-en` 后缀，如 `文章.md` + `文章-en.md`
- 双语文章的 URL slug 共用中文文件名（去掉 `-en` 后缀）

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

 路由文件位于 `src/pages/[...lang]/` 动态目录下。`zh` 为默认语言无 URL 前缀，`/en/` 和 `/zh-tw/` 带语言前缀。通过 `Astro.currentLocale` 获取当前页语言。

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

- 设备级配置 `.obsidian/` 通过 Syncthing 同步，不纳入 git 追踪
- 如遇 Syncthing 冲突文件，运行 `scripts/syncthing-cleanup.ps1` (Windows) 或 `scripts/syncthing-cleanup.sh` (macOS/Linux)

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

- **任务边界** — 只做用户明确要求的修改。发现优化点或缺陷先报告，未经确认不得擅自执行。
- **最小改动** — 优先局部修复、增量修改。禁止不必要的重构或依赖引入。
- **先读再改** — 修改前必读相关文件、AGENTS.md、现有约定和配置。
- **证据优先** — 不确定处明确标注，不猜测不存在的上下文。
- **验证先行** — 每次变更后先跑最小相关检查（lint → typecheck → build），再扩大到完整验证。

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
- 不得删除或修改 `.obsidian/` 设备级配置

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

- **katex 锁定 `^0.16.47`** — rehype-katex@7.0.1 依赖 `katex: ^0.16.0`，升 0.17+/0.18 会产生双 katex 实例，且 0.18 起 CSS 类名加 `katex-` 前缀（`.base`→`.katex-base`），渲染 HTML 与加载 CSS 类名不匹配导致公式破版。待 rehype-katex 发布兼容版本后再升
- **astro-og-canvas 升级要求 ≥ 0.13.0（当前仍为 `^0.11.1`）** — `param` 选项已移除（改由 endpoint 文件名自动推导）；`OGImageRoute()` 为异步必须 `await`。0.13.0 的 peer 范围才含 astro 7
- **astro 7 升级（PR #264/#265 挂起）** — astro-og-canvas@0.11.1 peer 范围不含 astro 7，合并 astro 7 必须同步 og-canvas@0.13+；Astro 7 默认 Markdown 处理器切换为 Sätteri，`markdown.remarkPlugins`/`rehypePlugins` 顶层配置已弃用（建议迁移 `markdown.processor: unified({...})`），合并前必须验证 6 remark + 8 rehype 管线行为一致

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

※ Cron 与 KV 定义于 `wrangler.jsonc`，随 `feat/telegram-channel-sync` 分支部署后生效；上线前需创建 KV namespace 并替换占位符 id（当前为 `<KV_ID_FROM_wrangler-kv-namespace-create>`）且配置 Secret（见下方 Telegram 推送）。

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
