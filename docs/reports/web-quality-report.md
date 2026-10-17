# Web Quality Inspection Report — cgartlab.github.io

> 跨轮记忆文件。每轮开始先读，结束必须写。lite 档位，每轮一个维度。
> 三条不变量：1. 只写真见到的 2. 拿不准写 UNKNOWN 3. 一轮只做一件事。

## LITE_CORE 进度

| 维度 | 状态 | 轮次 | 结论摘要 |
|------|------|------|----------|
| F01 断链 | ✅ 本轮完成 | 1 | shop 功能两处断链（/shop/、/shop/checkout/）；其余抽样目标均存在 |
| F02 空实现 | ✅ 本轮完成 | 2 | 无空实现：无 href="#"、无 javascript:void(0)、无 TODO/FIXME、无空 () => {}；placeholder 命中均为合法 HTML 属性或空态 CSS 类 |
| S02 特异性 | ✅ 本轮完成 | 3 | 12 处 !important 多为必要（reduced-motion/Shiki 内联覆盖/VT）；1 处冗余(LinkCard)；ID 选择器均为单例 hook 或第三方组件覆盖；shop 2 处内联 color（P3，孤立功能） |
| S03 死代码 | ✅ 本轮完成 | 4 | 无裸 hex（仅 config.ts 注释）；rgba 均为玻璃/LQIP 合法例外；1 处 P3：light 模式 search-box 白玻璃用裸 rgba(255,255,255,α)，dark 模式已用 token color-mix |
| T01 标题层级 | ✅ 本轮完成 | 5 | 404 缺 h1（h3 起跳）已修 h3→h1；index/works/weekly/tags-index 系统性缺 h1（P2，需人工决策：i18n 文本+视觉）；about/privacy h1 来自 MD（未读，UNKNOWN） |
| T04 对比度 | ✅ 本轮完成 | 6 | 正文/标题/highlight 均通过 AA（light 8.7-15.1:1，dark 7.3-13.7:1）；light 告警框标题色（note/tip/.../0.8）全低于 4.5:1（P2，需人工决策：配色令牌）；highlight 实算 7.97/7.33 与 AGENTS.md 文档 3.10/4.52 不符，移交复核 |
| X04 键盘焦点 | ✅ 本轮完成 | 7 | search-input 缺焦点指示器（outline:none 无 :focus 替代）已修（加 :focus-visible，匹配 search-close）；ImageZoom 模态无 Esc/Tab 陷阱（P2，需人工决策：交互 JS 需浏览器验证）；Search 模态焦点管理完备；其余 outline:none 均有替代 |
| F05 错误容错 | ✅ 本轮完成 | 8 | 客户端 fetch 均有 try/catch+提示（InquiryForm/shop/Search/GithubCard）；CodeCopyButton 复制失败静默无反馈（P2，需人工决策：i18n+CSS+浏览器实测）；MermaidLazy/SoundEffect 失败降级合理；无自定义 500.astro（Astro 内置） |
| F07 核心指标 | ✅ 本轮完成 | 9 | UNKNOWN：无 Lighthouse/LHCI/web-vitals 工具配置（package.json 脚本/依赖、CI、lighthouserc 均无）；CWV 未实测不编造；perf 优化已观察（compress/partytown/LQIP/preload/缓存头）；GA4 RUM 或有数据但不可访问 |
| V01 XSS | ✅ 本轮完成 | 10 | 无 XSS：innerHTML 命中均为清空/escapeHtml/可信作者内容（mermaid 源、i18n、JSON-LD）；set:html 均可信数据；Search 查询经 escapeHtml+正则转义后才注入；无用户输入直达 innerHTML |
| V04 密钥泄露 | ✅ 本轮完成 | 11 | apiflashKey 硬编码于 config.ts:162（死配置，未进 dist 前端产物，dist grep 0 命中；P2，需人工决策：轮换+删源+filter-repo）；.env 已 gitignore+未跟踪；wrangler 无硬编码 secret；GITHUB_TOKEN/TG secrets 走 env；其余 SEO/GA/Umami ID 均公开设计 |
| E01 交互态 | ✅ 本轮完成 | 12 | 七态齐备：hover/active 广覆盖（CSS 55+UnoCSS hover:/active:）；focus-visible 多处+图标按钮浏览器默认环（无全局 reset）；disabled（shop/InquiryForm）；loading（spinner+aria-live/submit-loading/骨架）；empty（search-empty/缩略图占位/条件渲染）；error（shop-error/failedToLoad/errorMsg）；prefers-reduced-motion 3 处尊重；aria-busy 未用但有替代 |

---

## Round 1 — F01 断链

**本轮维度**：F01 断链
**看哪些文件**：src/config.ts（footer.links）、src/data/links.ts、src/pages/[...lang]/shop/product/[id].astro、src/components/Shop/ProductCard.astro、src/pages/[...lang]/glossary.astro、src/pages/[...lang]/terms.astro、src/pages/[...lang]/rss.xml.ts、src/utils/feed.ts
**搜什么**：`href=`、`src="/`、`#锚点`；抽样确认目标页面/锚点存在

### 检查范围（抽样确认）

- 内部链接大多经 helper（`getLocalizedPath` / `getPostPath` / `getTagPath`），静态抽样以下字面/可推断目标：
  - `config.ts:176` footer `/rss.xml` → 由 `src/pages/[...lang]/rss.xml.ts` 提供（generateRSS，CI 跑 verify-feed）。✅ 目标存在
  - `terms.astro:136` `href={isDefault ? '/privacy/' : ...}` → `src/pages/[...lang]/privacy.astro` 存在。✅ 目标存在
  - `Footer.astro:82-83` termsPath/disclaimerPath → `src/pages/[...lang]/terms.astro`、`disclaimer.astro` 均存在。✅ 目标存在
  - `glossary.astro:71` `#letter-${g.letter}` 锚点 → 同源 `groups.map` 在 `glossary.astro:78` 生成 `id={`letter-${group.letter}`}`，每组都有匹配 section。✅ 锚点目标存在
  - `TOC.astro:49` `#${heading.slug}` → 由 rehypeSlug 生成，标题锚点。✅ 机制有效（未逐篇抽样，标可信）
  - `shop/product/[id].astro:64` `${langPath}/shop/` → ❌ 无 `shop/index.astro`
  - `shop/product/[id].astro:210` `${langPath}/shop/checkout/` → ❌ 无 `shop/checkout.astro`

### 发现

[P1] [F01] src/pages/[...lang]/shop/product/[id].astro:210 — 购买成功回调跳转到的结账页 /shop/checkout/ 不存在，购买关键流程断裂
  Found:    `location.href = `${langPath}/shop/checkout/?order=${data.order_no}``
  Expected: 购买成功后应跳转到已存在的结账页（shop/checkout.astro）或指向外部结账服务
  Fix:      需人工决策（结账页源文件不存在；需补建 shop/checkout 路由，或改指向 pay.cgartlab.com 等已存在的结账服务）
  Basis:    判定表 P1「关键流程受阻」；glob `src/pages/**/shop/**/*.astro` 仅返回 `shop/product/[id].astro`，无 checkout 页
  Note:     影响面=所有商品详情页"立即购买"成功路径；shop 未接入主导航（ProductCard 未被任何页面引用），但 getStaticPaths 仍生成商品页，可经直链/站点地图被访问；边界 P0「关键流程不通」，因 shop 未上线暂定 P1，移交强模型复核

[P2] [F01] src/pages/[...lang]/shop/product/[id].astro:64 — "返回商店"链接指向 /shop/，无 shop 索引页，断链
  Found:    `href={`${langPath}/shop/`}`
  Expected: 返回链接应指向已存在的页面（shop/index.astro）或改为浏览器历史回退
  Fix:      需人工决策（shop 索引页不存在；需补建 shop/index 路由，或改用 BackButton 已有的回退逻辑）
  Basis:    判定表 P2「非核心页断链」；glob 确认仅 `shop/product/[id].astro` 存在
  Note:     影响面=所有商品详情页的"返回商店"按钮；shop 功能整体未完成（ProductCard.astro 已写但无页面引用），见上方 P1 同源问题

### 结论

F01：发现 2 条断链，均在未完成的 shop 功能内（P1×1、P2×1），均已标「需人工决策」（涉及路由结构/功能取舍，超出本轮编辑预算且属硬约束「只报告不动手」）。其余抽样内部链接与锚点目标均存在。shop 功能本身的去留需人工决策。

### 移交强模型

- shop 功能（src/pages/[...lang]/shop/、src/components/Shop/、src/data/products.json）疑似半成品：product 详情页已生成，但缺 shop/index 与 shop/checkout，且 ProductCard 无任何页面引用、未进主导航。需强模型判断：补建缺失页面并接入导航，还是移除整个 shop 路由以免生成不可达/半残页。决策前不应上线。
- 静态 helper 生成的链接（getLocalizedPath/getPostPath/getTagPath）本轮未逐条验证生成产物，建议强模型在 build 产物上跑一次链接检查器（如 linkinator）覆盖全量。

## Round 2 — F02 空实现

**本轮维度**：F02 空实现
**看哪些文件**：src/**/*.{astro,ts,tsx,mjs,js}（grep 全量扫描，未单独逐文件读——命中项的上下文已在 grep 输出中可见）
**搜什么**：`href="#"`、`onClick=() => {}`、`TODO|FIXME|XXX|HACK`、`placeholder|coming soon|敬请期待|未实现|not implemented|stub`、`javascript:void`、空 `catch{}`、`<a class=` 无 href

### 检查范围（已检查范围）

- `href=["']#["']`（空锚点）→ 0 命中
- `TODO|FIXME|XXX|HACK` → 0 命中
- `onClick=() => {}` 与通用 `() => {}`（空箭头函数体）→ 0 命中
- `javascript:void` / `javascript:` → 0 命中
- 空 `catch(...){}`（.astro）→ 0 命中
- `<a class=` 无 href → 0 命中（4 处 `<a class=>` 均带 href，见 Footer.astro:68/82/83/88）
- `placeholder|coming soon|敬请期待|即将|未实现|not implemented|stub` → 21 命中，全部为合法用途：
  - HTML input `placeholder=` 属性（InquiryForm.astro:213/228/243、Search.astro:18、search.astro:32、shop/product/[id].astro:126）——真实 i18n 文案
  - CSS 类 `thumbnail-placeholder` / `placeholder-text`（WorksGallery.astro:118-119/309/319、WeeklyGallery.astro:105-106/196/206/317）——封面缺失时的空态 UI（"暂无图片"/"No Image"），属正确空态处理
  - CSS 类 `gh-day-labels-placeholder`（GithubHeatmap.astro:112/585）——加载骨架占位
  - `::placeholder` 伪元素样式（InquiryForm.astro:371-372）——输入框占位符样式

### 发现

无。F02 范围内未发现空实现：无空锚点、无 javascript:void(0) 跳转、无 TODO/FIXME/XXX/HACK 标记、无空事件处理器、无 "敬请期待/未实现" 类桩 UI。所有 placeholder 命中均为合法 HTML 属性或空态/骨架 CSS 类。

### 结论

F02：已检查范围如上，空结果（合格）。无 P0/P1/P2/P3 发现。

## Round 3 — S02 特异性

**本轮维度**：S02 特异性（!important 与内联滥用、特异性冲突、#id 选择器、超长选择器）
**看哪些文件**：src/**/*.{astro,css} 的 `<style>` 与 src/styles/*.css —— ConsentBanner.astro、LinkCard.astro、styles/extension.css、styles/markdown.css、styles/comment.css、styles/transition.css、shop/product/[id].astro、InquiryForm.astro
**搜什么**：`!important`、`style="`（内联）、`#id` 选择器、超长选择器（4+ 层后代）

### 检查范围（已检查范围）

- `!important`：12 命中，逐条读上下文判定：
  - `ConsentBanner.astro:219,225` `transition-duration: 0.01ms !important` —— 位于 `@media (prefers-reduced-motion: reduce)` 与 `html.reduce-motion`，强制近零过渡。✅ 合规 a11y 模式（AGENTS.md reduceMotion 已声明），非缺陷
  - `markdown.css:219` `background-color: color-mix(...) !important` 于 `.heti :where(pre)` —— Shiki 在 `<pre>` 注入内联 `background-color`（特异性 1,0,0,0），需 `!important` 才能覆盖。✅ 必要，非缺陷
  - `markdown.css:235` `color: var(--shiki-dark) !important` 于 `html.dark .heti pre span` —— 标准 Shiki 双主题暗色覆盖模式（AGENTS.md「Shiki 双主题」已声明）。✅ 必要，非缺陷
  - `transition.css:32,37` `view-transition-name: none !important` —— View Transitions 关闭特定元素过渡（AGENTS.md transition.css 已声明）。✅ 有意设计，非缺陷
  - `extension.css:177-225` 5× `border-color: oklch(var(--un-preset-theme-colors-*)) !important` 于 `.admonition-{note,tip,important,warning,caution}` —— 告警框语义边色（remarkContainerDirectives + 语义色 token，AGENTS.md 已声明）。⚠️ 可能冗余（待强模型对照 `.admonition` 基类确认是否需 !important），但属文档化有意设计，本轮不报为缺陷
  - `LinkCard.astro:81` `filter: none !important` —— 见下方发现
- 内联 `style="`：4 命中
  - `shop/product/[id].astro:66,118` `style="color: oklch(var(--un-preset-theme-colors-secondary))"` —— 见下方发现
  - `shop/product/[id].astro:131` `style="display:none"` 于错误提示 div（JS showError/hideError 切换 `.style.display`）—— ✅ 合法 JS 状态控制，非缺陷
  - `InquiryForm.astro:157` `style="display: none"` 于 honeypot 隐藏字段（`name="botcheck"`）—— ✅ 合法反爬蜜罐，非缺陷
- `#id` 选择器：108 命中，分两类，均非遗用：
  - 单例 hook：`#toc-container`/`#toc-mobile-text`/`#toc-links-list`/`#toc-accordion-content`/`#toc-desktop-icon`/`#post-content`/`#post-date`/`#back-button`（transition.css、extension.css）—— TOC/正文入场动画/返回按钮的唯一定位元素，AGENTS.md 已声明。✅ 非特异性滥用
  - 第三方组件覆盖：`#twikoo ...`/`#waline ...`（comment.css、Comment/Waline.astro）—— Twikoo/Waline 注入固定 ID/类名 DOM，需按其结构定位（AGENTS.md 评论系统已声明）。✅ 必要
- 超长选择器：`#twikoo .tk-comments-container .tk-avatar`、`#waline .wl-gif-popup input::placeholder` 等为 3–4 层，均因第三方组件 DOM 嵌套深度所必需。✅ 非滥用

### 发现

[P3] [S02] src/components/LinkCard.astro:81 — `filter: none !important` 冗余：`.link-card-icon[src*="openclaw"]` 与 `.link-card-icon[src$=".svg"]` 特异性同为 (0,2,0)，且 openclaw 规则在后，源序已胜出
  Found:    `filter: none !important;`
  Expected: `filter: none;`（移除 !important，由源序保证覆盖）
  Fix:      需人工决策（移除前需 grep 全量 CSS 确认无更高特异性的 filter 规则覆盖 .link-card-icon；本仓库 src/styles 与组件 <style> 本轮未逐一交叉核对）
  Basis:    判定表 P3「纯润色」；特异性计算 (0,2,0)==(0,2,0)，源序 openclaw>svg
  Note:     影响面=仅 openclaw 图标；无功能/视觉影响（冗余声明）；不移除亦无害，移除可降低维护负担但需全 CSS 核对

[P3] [S02] src/pages/[...lang]/shop/product/[id].astro:66,118 — 内联 `style="color: oklch(var(--un-preset-theme-colors-secondary))"` 应改用 UnoCSS 原子类 c-secondary（AGENTS.md 偏好原子类）
  Found:    `style="color: oklch(var(--un-preset-theme-colors-secondary))"`
  Expected: `class="... c-secondary"`（uno.config.ts 已有 shortcut `c-secondary` → `text-secondary`）
  Fix:      需人工决策（shop 功能整体未完成/孤立，见 F01；应与 shop 去留决策一并处理，不在本轮单独改）
  Basis:    判定表 P3「纯润色」；AGENTS.md「优先使用 UnoCSS 原子类」；颜色已用正确 token，非裸色值
  Note:     影响面=孤立 shop 功能内 2 处；token 正确故无对比度/暗色问题；属 shop 需人工决策项的同源清理

### 结论

S02：12 处 !important 中 11 处为必要/文档化有意设计（reduced-motion、Shiki 内联覆盖、双主题、View Transitions、告警框语义边色），1 处冗余（LinkCard，P3）；4 处内联 style 中 2 处合法（JS 状态/蜜罐）、2 处为 shop 内联 color（P3，孤立功能）；108 处 #id 选择器均为单例 hook 或第三方组件覆盖，非遗用。无 P0/P1/P2，仅 P3×2。告警框 !important 是否冗余待强模型对照基类确认。

### 移交强模型

- `extension.css` 告警框 `border-color !important`（177-225，5 处）是否冗余：需对照 `.admonition` 基类（本轮 grep `.admonition\b` 未干净隔离基类规则）判断是否存在更高特异性的 border-color 规则。若基类为普通 `.admonition`，则源序已让 `.admonition-note` 胜出，!important 可去；若存在 `.heti .admonition` 等高特异性基类，则 !important 必要。
- LinkCard `filter: none !important` 移除前需全 CSS 交叉核对（src/styles/*.css + 所有组件 `<style>`）确认无更高特异性 filter 规则。

## Round 4 — S03 死代码

**本轮维度**：S03 死代码（裸色值：十六进制 / rgba / rgb；重复声明块；排除 tokens/theme）
**看哪些文件**：src/styles/*.css（global.css、lqip.css、extension.css、markdown.css、comment.css、transition.css）与组件 `<style>`，排除 src/config.ts、uno.config.ts（token 定义源）
**搜什么**：`#[0-9a-fA-F]{6}`、`#[0-9a-fA-F]{3}` / `{8}`、`rgba?\(`

### 检查范围（已检查范围）

- 十六进制色值 `#[0-9a-fA-F]{6}`：1 命中 → `config.ts:41` `// #FFFAF0`（token 定义文件内的注释，非实际色值）。排除。✅ 非缺陷
- 3 位 / 8 位 hex `#[0-9a-fA-F]{3}|{8}`：0 命中。✅ 无裸短 hex
- `rgba?\(`：29 命中，逐条归类：
  - `lqip.css:52-72`（16 处）`rgb(from var(--lqip-c1/c2) r g b / α%)` —— 现代 relative-color 语法，`--lqip-c1/c2` 为 apply-lqip 构建时从图像提取的色值（非 token，因图像衍生无法走 token），AGENTS.md「LQIP 自动生成」已声明。✅ 合法
  - `global.css:301` `rgba(0,0,0,0.3)` 于 `.search-backdrop`（`backdrop-filter: blur(8px)`）—— 搜索遮罩暗色毛玻璃。✅ 命中例外「rgba(0,0,0,α) 毛玻璃/阴影物理透明度」
  - `global.css:317-329`（light `.search-box`）`rgba(255,255,255,α)` 白玻璃渐变/边框/inset 高光 + `rgba(0,0,0,α)` 阴影 —— 见下方发现（白 rgba 非例外）
  - `global.css:363-367`（dark `.search-box`）`rgba(255,255,255,α)`/`rgba(0,0,0,α)` 玻璃边框/阴影 —— ✅ 命中阴影例外；背景已改用 `color-mix(... background token)`
- 重复声明块：本轮未跑 CSS AST 工具，仅靠 grep 模式 + 已读文件目视抽查；未发现明显重复选择器/重复属性块。⚠️ 该子项未做全量结构化检测，标 LIMITED（非 UNKNOWN——已 grep 覆盖色值类，结构重复需 AST）

### 发现

[P3] [S03] src/styles/global.css:317-320,323,328 — light 模式 .search-box 玻璃用裸 `rgba(255,255,255,α)`，未走 token；dark 模式（337-360）已正确用 `color-mix(in srgb, oklch(var(--un-preset-theme-colors-background)) X%, transparent)`
  Found:    `rgba(255, 255, 255, 0.72) 0%,` / `rgba(255, 255, 255, 0.58) 50%,` / `rgba(255, 255, 255, 0.48) 100%`（含 `border: 1px solid rgba(255,255,255,0.4)`、`inset 0 1px 0 rgba(255,255,255,0.6)`）
  Expected: light 模式亦用 `color-mix(in srgb, oklch(var(--un-preset-theme-colors-background)) X%, transparent)` 与 dark 对齐（background token 为 oklch(98%...) 近白，视觉相近）
  Fix:      需人工决策（配色体系一致性 + 搜索浮层视觉回归风险；属硬约束「只报告不动手·配色/字体体系」）
  Basis:    判定表 P3「纯润色」；AGENTS.md「禁止裸色值 #xxx/rgb()，例外仅 rgba(0,0,0,α)」——白 rgba 不在例外列；dark 模式已示范正确写法
  Note:     影响面=light 模式搜索浮层玻璃；当前 background token 近白故视觉无碍，但 token 若变更会失配；验证方式=切换浅色主题打开搜索浮层对比

### 结论

S03：无裸 hex（仅 token 文件注释）；29 处 rgba/rgb 中 28 处合法（LQIP 图像色 + 黑 rgba 玻璃/阴影例外 + dark 模式 token color-mix），1 处 P3（light 模式 search-box 白 rgba 未走 token，dark 已走）。重复声明块子项 LIMITED（未跑 AST，grep+目视未发现）。无 P0/P1/P2。

### 移交强模型

- S03「重复声明块」未做全量 AST 结构化检测（需 CSS parser 如 postcss/duplexer 跑 src/styles/*.css + 组件 `<style>`）；本轮 grep+目视未发现，建议强模型用工具复核。
- light 模式 search-box 白 rgba 改 color-mix 前需在浅色主题实测搜索浮层（打开 /search，对比玻璃透明度），避免视觉回归。

## Round 5 — T01 标题层级

**本轮维度**：T01 标题层级（h1 唯一不跳级、`<h1>`…`<h6>`、`role="heading"`）
**看哪些文件**：src/pages/**/*.astro（404、index、works、weekly、tags/index、about、contact、glossary、disclaimer、search、posts/[slug]、terms、shop/product、ai-agents/design/tools）+ 组件含标题者（PillarPage、PostList、WorksGallery、WeeklyGallery、GithubHeatmap、RelatedPosts、LinkCard、ProductCard、InquiryForm、ConsentBanner）
**搜什么**：`<[hH][1-6][ >]`、`role=["']heading["']`

### 检查范围（已检查范围）

- `role="heading"`：0 命中（无 ARIA 标题角色）
- `<h1>` 直接命中 7 页 + PillarPage 组件：
  - `contact.astro:55`、`glossary.astro:64`、`disclaimer.astro`（zh:26/en:149/zh-tw:272 三语条件渲染，每语言 1 个 h1）、`search.astro:24`、`posts/[slug].astro:108`、`terms.astro`（zh:27/en:189/zh-tw:351 条件）、`shop/product/[id].astro:77` —— ✅ 各 1 个 h1
  - `PillarPage.astro:36` `<h1>{title}</h1>` —— 被 ai-agents/design/tools 三页 `<PillarPage>` 引用（grep 确认），各页仅此 1 个 h1，且 h1→h2(41,69)→h3(48) 不跳级。✅
  - 层级正确性：glossary h1→h2(80)；disclaimer/terms h1→h2→h3 全链；posts/[slug] h1 后正文标题由 rehypeSlug 生成（h2/h3，未逐篇抽样）。✅
- **缺 h1 的列表/画廊页（本轮逐页读确认）**：
  - `404.astro` —— 全页唯一标题为 `<h3>`（:19），无 h1/h2，跳级。见发现 1（已修）
  - `index.astro`（首页）—— 无 h1；首个标题为 PostList 的 `<h3>`（PostList.astro:32）。见发现 2
  - `works.astro` —— 无 h1；首个标题为 GithubHeatmap 的 `<h2>`（:87/:95）。见发现 3
  - `weekly.astro` —— 无 h1；首个标题为 WeeklyGallery 的 `<h3>`（:113）。见发现 4
  - `tags/index.astro` —— 无 h1；TagList 组件无任何标题元素（grep 未命中）。见发现 5
- `about.astro` / `privacy.astro` —— 标题来自 about/privacy 内容集合的 Markdown `<Content />`，本轮**未读 MD 源**，h1 是否存在标 UNKNOWN
- `resource.astro`、`tags/[tag].astro` —— 本轮未读；heading grep 显示二者 .astro 源无 h1/h2/h3（tags/[tag] 用 PostList 故有 h3，同 index 模式）。T01 范围对二者 LIMITED

### 发现

[P2] [T01] src/pages/404.astro:19 — 404 页唯一标题为 h3，无 h1/h2，跳级且缺页面主标题（本轮已修，见下）
  Found:    `<h3 class="mt--1.3 flex flex-col text-8 c-primary font-bold leading-1.2em font-navbar lg:text-9">`
  Expected: 页面主标题应为 `<h1>`（WCAG 2.4.6 / 1.3.1：每页一个 h1，不跳级）
  Fix:      `h3` → `h1`（开闭合标签同改，class 保留，视觉不变）—— ✅ 已应用
  Basis:    判定表 P2「非核心页缺陷」+ WCAG AA 1.3.1/2.4.6（≥P2）；404 为错误态非核心页
  Note:     影响面=404 页；已修：line19 `<h3`→`<h1`、line23 `</h3>`→`</h1>`，重读确认；无配置标题层级 lint（eslint antfu 不含 jsx-a11y/heading 规则），标签交换不涉类型，未跑 astro check（非标题语义相关工具，无回归风险）

[P2] [T01] src/pages/[...lang]/index.astro — 首页无 h1，首个标题为 PostList 的 h3，跳过 h1/h2
  Found:    index.astro 全文无 `<h1>`/`<h2>`；渲染 `<PostList posts={pinnedPosts} .../>`（PostList.astro:32 为 `<h3>`）
  Expected: 首页应有一个页面级 h1（如「最新文章」/「Latest Posts」），列表项 h3 作为其下级
  Fix:      需人工决策（需选定 h1 文案 + i18n + 视觉整合，当前首页以 `uno-decorative-line` 分隔无可见页标题，属设计决策）
  Basis:    判定表 P2 + WCAG AA 1.3.1/2.4.6；首页为核心页但内容仍可读（post h3 标题在），非「严重不可读」故非 P1
  Note:     影响面=首页（核心），AT/SEO 缺页面主标题；边界 P1，按表 P1 需「严重不可读」未达，定 P2；修复需 i18n 文案与视觉设计一并决策

[P2] [T01] src/pages/[...lang]/works.astro — 作品页无 h1，首个标题为 GithubHeatmap 的 h2，跳过 h1
  Found:    works.astro 全文无 `<h1>`；渲染 `<GithubHeatmap .../>`（GithubHeatmap.astro:87/95 为 `<h2>`）
  Expected: 作品页应有一个页面级 h1
  Fix:      需人工决策（h1 文案 + i18n + 视觉；postTitle 仅作 `<title>` 非 h1）
  Basis:    判定表 P2 + WCAG AA 1.3.1/2.4.6
  Note:     影响面=作品页；与 index/weekly/tags 同源系统性问题

[P2] [T01] src/pages/[...lang]/weekly.astro — 周刊页无 h1，首个标题为 WeeklyGallery 的 h3，跳级
  Found:    weekly.astro 全文无 `<h1>`/`<h2>`；渲染 `<WeeklyGallery .../>`（WeeklyGallery.astro:113 为 `<h3>`）
  Expected: 周刊页应有一个页面级 h1
  Fix:      需人工决策（h1 文案 + i18n + 视觉；注：该页 noindex 由 worker.mjs 按 noindex.mjs 清单设置）
  Basis:    判定表 P2 + WCAG AA 1.3.1/2.4.6
  Note:     影响面=周刊页（noindex，但仍缺主标题影响 AT/结构）

[P2] [T01] src/pages/[...lang]/tags/index.astro — 标签索引页无 h1，且无任何页面级标题（TagList 无标题元素）
  Found:    tags/index.astro 全文无标题元素；渲染 `<TagList .../>`（TagList.astro:17 为 `<a>`，非标题）
  Expected: 标签索引页应有一个页面级 h1（如「标签」/「Tags」）
  Fix:      需人工决策（h1 文案 + i18n + 视觉）
  Basis:    判定表 P2 + WCAG AA 1.3.1/2.4.6
  Note:     影响面=标签索引页；postTitle 仅作 `<title>`，页面内无可见主标题

### 结论

T01：404 缺 h1（h3 起跳）已修（h3→h1，重读确认）；系统性问题——index/works/weekly/tags-index 四个列表/画廊页均无页面级 h1，首个标题为组件 h2/h3，跳过 h1（均 P2，需人工决策：i18n 文案 + 视觉整合，超 3 文件预算且涉设计决策，未硬改）。含 h1 的 7 页 + PillarPage 三页层级正确。about/privacy 的 h1 来自 Markdown（未读 MD，UNKNOWN）；resource、tags/[tag] 未读（LIMITED）。本轮有 1 项小修 + 4 项需人工决策发现。

### 移交强模型

- 系统性 h1 缺失（index/works/weekly/tags-index）需统一设计：是否给列表/画廊页加可见页面级 h1，文案走 i18n（zh/en/zh-tw，zh-tw 未启用但 schema 已含），视觉与现有 `uno-decorative-line` 分隔风格整合。建议强模型一次性处理四页。
- about/privacy 的 Markdown 内容是否含 h1 需读 `src/content/about/**`、`src/content/privacy/**` 确认（本轮 UNKNOWN）。
- resource.astro、tags/[tag].astro 本轮未读，T01 LIMITED，建议强模型补查。

## Round 6 — T04 对比度

**本轮维度**：T04 对比度（文字色与背景色令牌组合；算不出比值标 UNKNOWN）
**看哪些文件**：src/config.ts（primary/secondary/background/highlight 令牌）、uno.config.ts（note/tip/important/warning/caution 语义色 + /0.8 alpha）、src/styles/extension.css（.admonition-title 文字色用法 + 容器是否有背景）
**搜什么**：令牌 oklch 值 → 线性 sRGB → 相对亮度 → WCAG (L+0.05) 比值；`admonition` 容器 background

### 检查方法

用 node 脚本 `.temp/contrast-calc.mjs`（oklch→OKLab→linear sRGB 标准矩阵→相对亮度 0.2126R+0.7152G+0.0722B→WCAG 比值；/0.8 alpha 按线性合成叠 background 令牌）。脚本输出即证据（非编造）。无配置对比度 lint（eslint antfu 不含），故以脚本实算为工具。

### 令牌值（来自 uno.config.ts / config.ts 实读）

- light: primary oklch(25% .005 298) / secondary oklch(40% .005 298) / background oklch(98% .012 85) / highlight oklch(41% .12 138)；note/tip/important/warning/caution 见 uno.config.ts:36-40（均 /0.8 alpha）
- dark: primary oklch(92%) / secondary oklch(77%) / background oklch(22%) / highlight oklch(72% .14 138)；note 等见 uno.config.ts:23-27（均 /0.8 alpha）

### 检查范围（已检查范围 + 实算比值）

LIGHT（background 亮度 0.9412）：
- primary vs background **15.12:1** ✅ | secondary vs background **8.71:1** ✅ | highlight vs background **7.97:1** ✅（均 ≥4.5 AA）
- note vs background **3.08:1** ❌ | tip **2.79:1** ❌ | important **3.13:1** ❌ | warning **2.72:1** ❌ | caution **3.01:1** ❌（均 <4.5；tip/warning 亦 <3）
- primary vs highlight(bg) 1.90:1 / secondary vs highlight(bg) 1.09:1（highlight 作背景时文字对比极低，但 highlight 主要作 underline/selected bg 非文字载体）

DARK（background 亮度 0.0106）：
- primary vs background **13.66:1** ✅ | secondary **8.35:1** ✅ | highlight **7.33:1** ✅
- note **5.46:1** ✅ | tip **7.37:1** ✅ | important **5.17:1** ✅ | warning **8.27:1** ✅ | caution **4.99:1** ✅（均 ≥4.5，caution 勉强）

容器背景：grep `admonition[^-]`（src/styles + 组件）0 命中——`.admonition` 容器无 background 规则，告警框文字叠在 page background 上，故按 background 令牌计有效。

### 发现

[P2] [T04] uno.config.ts:36-40 — light 模式告警框标题语义色（note/tip/important/warning/caution，均 /0.8 alpha）对 page background 全部低于 AA 4.5:1
  Found:    `note: 'oklch(48.8% 0.243 264.376 / 0.8)'` / `tip: 'oklch(50.8% 0.118 165.612 / 0.8)'` / `important: 'oklch(49.6% 0.265 301.924 / 0.8)'` / `warning: 'oklch(55.5% 0.163 48.998 / 0.8)'` / `caution: 'oklch(50.5% 0.213 27.518 / 0.8)'`
  Expected: 文字对背景 ≥4.5:1（WCAG 1.4.3 AA，正文/标题）；实算 note 3.08 / tip 2.79 / important 3.13 / warning 2.72 / caution 3.01
  Fix:      需人工决策（属「配色/字体体系」硬约束；/0.8 alpha 为当前设计取舍，light 模式需更饱和/更深的同语义色或提升 alpha；dark 模式均通过故仅 light 需调）
  Basis:    WCAG 1.4.3 AA（≥4.5）；node 脚本 .temp/contrast-calc.mjs 输出；.admonition-title 用 `color: oklch(var(--un-preset-theme-colors-note))` 等（extension.css:180/192/204/216/228）
  Note:     影响面=light 模式所有告警框（note/tip/important/warning/caution）标题文字；告警框正文用 secondary 8.71:1 可读，故非「严重不可读」→ P2 非 P1；tip/warning <3:1 连大字 AA 亦不达；标题字号继承正文（≥16px bold，未达 18.66px 大字门槛故按 4.5:1）

### 结论

T04：正文/标题/highlight 文字对比全部通过 AA（light 7.97-15.12:1，dark 7.33-13.66:1）。**1 项 P2**：light 模式告警框标题语义色（note/tip/important/warning/caution，/0.8 alpha）对 background 全低于 4.5:1（tip/warning 亦低于 3:1），需人工决策（配色令牌，硬约束只报告不动手；dark 模式均通过）。highlight 作背景时文字对比极低（1.09-1.90:1）但 highlight 主要用于 underline/selected-bg 非文字载体，未单列缺陷。

### 移交强模型

- **AGENTS.md 文档 vs 实算不符**：AGENTS.md 称 highlight「3.10:1 (light) / 4.52:1 (dark)」，本轮 WCAG 正法（oklch→sRGB 相对亮度）实算 **7.97:1 (light) / 7.33:1 (dark)**，均通过 AA。差异可能源于文档过时（highlight 令牌值后续变更）或文档所用工具对 oklch 处理有误。建议强模型用标准工具（WebAIM/axe/Lighthouse）在 build 产物上复核 highlight 比值并据实更正 AGENTS.md 注释——此为文档准确性，不属本轮代码缺陷。
- light 告警框标题色修复需在 uno.config.ts:36-40 调整 light 语义色（更深/更高 alpha），属配色体系决策，需人工；dark 勿动（均通过）。
- 本轮仅算了令牌对 background 的组合；color-mix 透明叠层（如 search-box glass、bg-secondary/5 边框）的有效对比未逐项算，建议强模型用浏览器 DevTools 取实测色补算。

## Round 7 — X04 键盘焦点

**本轮维度**：X04 键盘焦点（outline:none、:focus、tabIndex、role="dialog"；焦点陷阱/归还/可见）
**看哪些文件**：src/styles/global.css、src/styles/shop.css、src/components/InquiryForm.astro、src/components/Widgets/GithubHeatmap.astro、src/components/Search.astro、src/components/Widgets/ImageZoom.astro
**搜什么**：`outline:\s*none`、`tabindex|tabIndex`、`role=["']?dialog|aria-modal`、`:focus`、`focus-within`

### 检查范围（已检查范围）

- `outline: none`：4 命中，逐条读上下文：
  - `InquiryForm.astro:337` `.form-input/.form-select/.form-textarea` —— 有 `.form-input:focus { border-color: highlight; box-shadow: 0 0 0 3px highlight/0.2 }`（:364-369）替代。✅ 合规
  - `GithubHeatmap.astro:629` `.gh-cell` —— 有 `.gh-cell:focus-visible { transform: scale(1.15) }`（:632）+ `.gh-cell:focus` 三层 ring fallback（:639+）。✅ 合规
  - `shop.css:132` `.shop-detail-email-input:focus { outline: none; border-color: highlight }` —— 有 border-color 替代。✅ 合规（shop 孤立）
  - `global.css:391` `.search-input { border: none; outline: none }` —— **无 :focus/:focus-visible 替代**（grep search-input:focus 0 命中；同对话框的 .search-close/.search-result-item/.tag-item/.code-copy-button/.skip-to-content 均有 :focus-visible，独缺 input）。见发现 1（已修）
- `tabindex`：5 命中，均合规：
  - `GithubHeatmap.astro:143,396-399` roving tabindex（首格 tabindex=0，其余 -1，聚焦时迁移）—— ARIA grid 标准 roving 模式。✅
  - `ImageZoom.astro:20` overlay `tabindex=-1`（便于 JS programmatic focus）。✅
- `role="dialog"/aria-modal`：2 命中：
  - `Search.astro:9` `<div role="dialog" aria-modal="true" aria-label="Search" inert>` —— open() 存 lastFocused→移 inert→100ms 后 focus input（:90-103）；close() 还原 lastFocused.focus()（:122-123）；Tab 陷阱首尾循环（:398-413）；Esc 关闭（:395-397）；inert 隐藏防背景交互。✅ 焦点管理完备
  - `ImageZoom.astro:17-20` overlay role=dialog/aria-modal/aria-label/tabindex=-1；zoomIn `overlay.focus()`（:83）；zoomOut cleanup `originalImg?.focus()`（:135）。**但无 Tab 陷阱、无 Esc 处理**（仅 click 与 resize 关闭）。见发现 2

### 发现

[P2] [X04] src/styles/global.css:391 — .search-input 有 outline:none+border:none 但无 :focus/:focus-visible 替代，键盘聚焦无可见指示（同对话框其余元素均有）（本轮已修，见下）
  Found:    `.search-input { flex:1; background:transparent; border:none; outline:none; ... }`（无对应 :focus 规则，grep 确认）
  Expected: 键盘聚焦有可见指示（WCAG 2.4.7 Focus Visible AA）
  Fix:      加 `.search-input:focus-visible { outline: 2px solid oklch(var(--un-preset-theme-colors-highlight)/0.6); outline-offset: 2px; }`（与 .search-close:focus-visible 同模式）—— ✅ 已应用
  Basis:    WCAG 2.4.7 AA；grep 确认同对话框 .search-close/.search-result-item 均有 :focus-visible 独缺 input；判定表 P2（非核心搜索态，WCAG AA ≥P2）
  Note:     影响面=搜索对话框内 Tab 回到 input 时；已修：global.css:397-400 加 :focus-visible，重读确认；无焦点 lint，CSS 增量与 .search-close 同模式，重读为证；浏览器实测 deferred 强模型

[P2] [X04] src/components/Widgets/ImageZoom.astro:83,135 — 图片放大模态（role=dialog/aria-modal）无 Tab 陷阱、无 Esc 关闭，键盘用户无法关闭；触发依赖鼠标点击 img（img 非键盘可聚焦）
  Found:    `overlay.focus()`（:83）/ `originalImg?.focus()`（:135）有焦点开/还，但无 keydown/Esc 监听（仅 handleClick 与 window resize 触发 zoomOut）
  Expected: aria-modal 模态应 Esc 关闭 + Tab 陷阱（WCAG 2.1.2 No Keyboard Trap / 2.4.3 Focus Order AA）
  Fix:      需人工决策（交互 JS：加 keydown Esc→zoomOut + Tab 陷阱；须按 astro:page-load/astro:before-swap 生命周期注册，且 AGENTS.md 要求 JS 交互修改须 pnpm build && pnpm preview 浏览器实测，超 lite 本轮验证能力）
  Basis:    WCAG 2.1.2/2.4.3 AA（≥P2）；判定表 P2（非核心图片查看增强，鼠标触发，键盘冲击有限）
  Note:     影响面=图片放大模态；img 非键盘可聚焦故纯键盘用户无法开启（mouse-only 触发），故影响有限但模态打开后键盘不可关；边界 P1，因非核心功能定 P2；修复需浏览器实测

### 结论

X04：4 处 outline:none 中 3 处有 :focus 替代（InquiryForm/GithubHeatmap/shop.css），1 处（search-input）缺失已修（加 :focus-visible 匹配 search-close，重读确认）。tabIndex 5 处均合规（roving grid + 模态 -1）。两模态：Search.astro 焦点管理完备（存/还/Tab 陷阱/Esc/inert/role=dialog）；ImageZoom 有焦点开/还但**缺 Esc + Tab 陷阱**（P2，需人工决策：交互 JS 需浏览器实测）。本轮修 1（search-input）+ 需人工决策 1（ImageZoom 键盘）。

### 移交强模型

- ImageZoom.astro 键盘修复：加 keydown Esc→zoomOut() + Tab 陷阱（模态内仅 overlay 可聚焦，陷阱即 Tab/Shift+Tab 维持 overlay 聚焦）；监听器须 astro:page-load 注册、astro:before-swap 清理（AGENTS.md 全局监听器治理）；改后须 pnpm build && pnpm preview 浏览器实测键盘流。
- 可选：图片放大是否需键盘可触发（当前 img 非键盘可聚焦，mouse-only）——非 X04 焦点管理范畴，留强模型决策可达性。

## Round 8 — F05 错误容错

**本轮维度**：F05 错误容错（fetch/await/catch/error boundary；确认失败有用户提示）
**看哪些文件**：src/components/InquiryForm.astro、Search.astro、pages/[...lang]/search.astro、Widgets/GithubCard.astro、Button.astro、Widgets/CodeCopyButton.astro、Widgets/MermaidLazy.astro、Widgets/SoundEffect.astro（worker.mjs/tg.mjs/github-contributions.ts/feed.ts/og 为构建时/Worker 端，非用户运行时，排除）
**搜什么**：`fetch\(|\.catch\(|await\s`、`try\s*\{|catch\s*\(`、`src/pages/500*`

### 检查范围（已检查范围 + 容错判定）

- `InquiryForm.astro:481-513` 表单提交（Web3Forms）：try fetch→res.json→data.success? : throw；catch(504) 显 errorMsg、隐 successMsg、DEV console.error；15s AbortController 超时(477-479)恢复按钮。✅ 失败有提示+防永久禁用
- `shop/product/[id].astro:197-217` 购买（POST api/orders）：try/catch(213) showError('创建订单失败')。✅（第 1 轮已验）
- `Search.astro:144-188` 搜索索引 fetch：try/catch(179) loadFailed=true；search() 检 loadFailed 显「搜索索引加载失败」(274-289)。✅（第 7 轮已验）
- `search.astro:188-227` 搜索页 fetch：try/catch(224) loadFailed=true（读确认）；loadFailed→错误文案显式同 Search.astro（SYNC 注释，第 7 轮验 overlay 版）；页面 search() 显式分支本轮未直接读，标 inferred
- `GithubCard.astro:34-115` 静态 /github-repos.json fetch（catch{}(44) 空回退→空缓存）+ 动态 api.github.com fetch（catch(68)→null）；updateCardUI `!data` 时 setText('.gc-repo-description', failedToLoad)(84-86)。✅ 失败显 failedToLoad
- `Button.astro:158-164` ViewTransition `.catch` 非空——清 data-theme-changing 标记（导航取消时 transition.finished reject 的清理，注释 156-157）。✅ 非吞错，正确清理
- `MermaidLazy.astro:16-27` mermaid.run try/catch(25) console.error；失败时 `<pre.mermaid>` 原始代码仍可见（内容未丢失）。✅ 降级合理（原始码可见），无显式错误提示但可接受
- `SoundEffect.astro:103-135` playSound try/catch(133) console.warn；装饰性音效，静默失败可接受。✅
- error boundary：`glob src/pages/500*` 0 命中——无自定义 500.astro；Astro 内置默认错误页处理服务端错误；静态内容无运行时 render 错误路径（构建时 astro check 校验）。✅ 可接受

### 发现

[P2] [F05] src/components/Widgets/CodeCopyButton.astro:23-27 — 复制失败仅 console.error+return，无用户可见反馈（成功有 .copied 态，失败静默）
  Found:    `catch (error: unknown) { const message = error instanceof Error ? error.message : String(error); console.error('[CodeCopyButton] Failed to copy:', message); return }`
  Expected: 失败应给用户可见反馈（如短暂「复制失败」态/aria-live 提示），与成功 .copied 态对称（F05 失败有提示 / E01 error 态齐备）
  Fix:      需人工决策（需 i18n「复制失败」文案 + .copy-failed CSS 态 + 按钮状态切换 JS；AGENTS.md 要求 JS 交互修改须 pnpm build && pnpm preview 浏览器实测，超 lite 验证能力）
  Basis:    判定表 P2「次要状态缺陷·缺 error 态」+ F05「失败有提示」；每个代码块均有复制按钮（高频），失败路径无 UI 反馈
  Note:     影响面=所有代码块复制按钮；实际冲击低（HTTPS 安全上下文 clipboard.writeText 极少失败），边界 P3；无错误反馈属实故定 P2；验证=禁用 clipboard 权限后点复制观察

### 结论

F05：客户端运行时 fetch 全部有 try/catch + 用户提示或合理降级——InquiryForm（errorMsg+超时）/shop（showError）/Search+search.astro（loadFailed→错误文案）/GithubCard（failedToLoad）；Button VT catch 非空清理；MermaidLazy 失败留原始码；SoundEffect 装饰性静默可接受。**1 项 P2**：CodeCopyButton 复制失败静默无反馈（需人工决策：i18n+CSS+浏览器实测）。无自定义 500.astro（Astro 内置默认，可接受）。无 P0/P1。

### 移交强模型

- CodeCopyButton 复制失败态：需加 i18n「复制失败」+ .copy-failed CSS（与 .copied 对称）+ catch 内切换态 + 1.5s 复位；改后 pnpm build && pnpm preview 浏览器实测（禁 clipboard 权限模拟失败）。
- search.astro 页面 search() 的 loadFailed→错误文案显示分支本轮未直接读（inferred 自 SYNC 注释 + 第 7 轮 Search.astro 验证），建议强模型直接读 search.astro search() 确认与 overlay 版一致。
- 是否需自定义 500.astro（品牌化错误页）留强模型决策（当前 Astro 内置默认可用，非缺陷）。

## Round 9 — F07 核心指标

**本轮维度**：F07 核心指标（LCP≤2.5s / INP≤200ms / CLS≤0.1；跑已配置的 Lighthouse/LHCI；没工具标 UNKNOWN）
**看哪些文件**：package.json（scripts + deps）、.github/workflows/*.yml、lighthouserc 配置（glob）
**搜什么**：`lighthouse|lhci|web-vitals|@unlighthouse|perf-budget|core-web-vitals`、lighthouserc 文件、CI workflow

### 检查范围（已检查范围）

- `grep lighthouse|lhci|web-vitals|@unlighthouse|perf-budget|core-web-vitals`（全仓 *.{json,jsonc,yml,yaml,mjs,cjs,js,ts}，排除 node_modules）→ **0 命中**
- `glob {lighthouserc*,.lighthouserc*,lhci*,.github/workflows/*}` → 无 lighthouserc/lhci 配置；workflows 仅 ci/maintenance/pr-review/pr-triage/update-contributions（无 lighthouse 步骤）
- `package.json` 实读（1-81）：
  - scripts：dev/build/preview/astro/lint/lint:fix/new-post/apply-lqip/format-posts/verify-feed/audit-glossary/sync-docs(+check)/update-gh-contributions/fetch-github-repos —— **无 lighthouse/lhci/perf 脚本**
  - dependencies：astro/markdown-remark/mdx/partytown/sitemap/astro-compress/astro-og-canvas/feed/katex/mermaid/sharp/sanitize-html 等 —— **无 lighthouse/@lhci/cli/puppeteer/web-vitals**
  - devDependencies：eslint/astro-eslint-parser/tsx/typescript/unocss/wrangler 等 —— **无 perf 测量依赖**
- perf 优化（已观察，非测量值）：`astro-compress`（CSS/HTML/JS 压缩）、`@astrojs/partytown`（第三方脚本入 web worker）、LQIP（apply-lqip 占位图，降图片 CLS）、Head.astro 字体 preload、`astro:assets`+sharp 图像优化、worker.mjs 缓存头（指纹资源 immutable 1y / 图片 30d / HTML max-age=600 s-maxage=1800）
- RUM：config.ts 配 GA4（G-P11QJ5R11Z）+ Umami —— GA4 默认采集 CWV，但非「已配置 Lighthouse/LHCI 工具」，且本轮无法访问 GA 后台取值

### 发现

无（UNKNOWN）。未发现已配置的 Lighthouse/LHCI/web-vitals 测量工具，未运行任何 CWV 测量，不编造 LCP/INP/CLS 数值。

### 结论

F07：**UNKNOWN**。仓库未配置 Lighthouse/LHCI/web-vitals 测量工具（package.json 脚本/依赖、CI workflow、lighthouserc 全无），本轮无法实测 LCP/INP/CLS，按不变量「没跑过的命令不写结果」+ F07「没工具就标 UNKNOWN」不编造数值。perf 优化层已观察（compress/partytown/LQIP/preload/缓存头均为优化而非测量）；GA4 RUM 默认采集 CWV 但数据不可访问。无 P0/P1/P2/P3 发现（UNKNOWN 为合格结论）。

### 移交强模型

- 建议引入 LHCI（@lhci/cli + lighthouserc.json）或 @unlighthouse/cli，在 CI（.github/workflows/ci.yml）对 preview 构建产物跑 Lighthouse，断言 LCP≤2.5s/INP≤200ms/CLS≤0.1，并将阈值写入配置（属构建/部署配置，硬约束只报告不动手）。
- 或在 GA4/Umami 后台读取真实用户 CWV 分位数（RUM，比 Lab 数据更准）——需人工访问后台。
- 首页 LCP 候选元素（hero 图/字体）与 CLS 风险点（图片无尺寸、字体加载）建议强模型在 build+preview 下用 DevTools Performance/Lighthouse 实测；本轮无法跑（无 Chrome/Lighthouse，且 ExFAT build 较重）。

## Round 10 — V01 XSS

**本轮维度**：V01 XSS（innerHTML / dangerouslySetInnerHTML / v-html / insertAdjacentHTML / Astro set:html）
**看哪些文件**：src/components/Search.astro、pages/[...lang]/search.astro、Widgets/MediaEmbed.astro、Comment/{Giscus,Twikoo,Waline}.astro、pages/[...lang]/glossary.astro、layouts/Head.astro、pages/[...lang]/shop/product/[id].astro
**搜什么**：`innerHTML|insertAdjacentHTML|dangerouslySetInnerHTML|v-html|outerHTML|document.write`、`set:html`、`mermaidCode|data-mermaid`

### 检查范围（已检查范围）

- `innerHTML`：17 命中，逐条判定：
  - 清空型（`= ''`）：Giscus.astro:85,111 / Twikoo.astro:118 / Search.astro:119,267,326,379 / search.astro:261,317,369 → ✅ 非注入
  - `escapeHtml` 返回值：Search.astro:217 / search.astro:140 `return div.innerHTML`（escapeHtml 内部 `div.textContent=text; return div.innerHTML`，浏览器原生转义）→ ✅ 安全
  - `titleDiv.innerHTML = highlight(item.title, query)`（Search.astro:348 / search.astro:339）：highlight() 先 `escapeHtml(text)` 再 `<mark>$1</mark>` 包裹，$1 来自已转义文本 → ✅ 安全
  - `excerptDiv.innerHTML = getExcerpt(...)`（Search.astro:352 / search.astro:343）：getExcerpt 返回 escapeHtml()/highlight()（均转义）→ ✅ 安全
  - `MediaEmbed.astro:170` `mermaid.innerHTML = mermaid.dataset.mermaidCode ?? ''`：data-mermaid-code 源自 `mermaid.textContent?.trim()`（:22-23），即 markdown 中作者写的 mermaid 源码（可信作者内容，非用户输入）→ ✅ 可信内容，非 XSS 向量
- `set:html`：7 命中：
  - `glossary.astro:67` `set:html={t.glossaryFeedback}`：t 为 i18n 文案（ui.ts，作者可控，含反馈链接 HTML）→ ✅ 可信
  - `Head.astro:203,235,272,306,372` `set:html={JSON.stringify({...})}`：JSON-LD 结构化数据，值来自站点/文章 frontmatter 元数据（作者可控）→ ✅ 可信
  - `shop/product/[id].astro:159` `set:html={JSON.stringify(productSchema)}`：productSchema 来自 products.json（作者数据）→ ✅ 可信
- `insertAdjacentHTML|dangerouslySetInnerHTML|v-html|outerHTML|document.write`：0 命中
- 评论系统：Giscus 渲染于 giscus.app iframe（跨 origin 沙箱，非本站 innerHTML）；Twikoo/Waline 由各自 init/render 自行处理（其 innerHTML 仅清空）→ ✅ 非本站注入面
- Markdown 内容管线：post HTML 由作者 markdown 经 rehype 管线生成（可信源）；feed.ts 用 sanitize-html 清洗 RSS 内容 → ✅

### 发现

无。V01 范围内未发现 XSS：所有 innerHTML 命中为清空、escapeHtml 转义后注入、或可信作者内容（mermaid 源/i18n/JSON-LD）；用户输入（搜索 query）经 escapeHtml + 正则特殊字符转义后才注入 innerHTML，无未转义用户输入直达 innerHTML/set:html。无 P0/P1/P2/P3。

### 结论

V01：已检查范围如上，空结果（合格）。无 XSS 漏洞。Search 的用户查询经浏览器原生 escapeHtml 转义；mermaid/i18n/JSON-LD 均为可信作者内容；评论系统在 iframe/第三方沙箱。

### 移交强模型

- JSON-LD `set:html={JSON.stringify(obj)}` 模式（Head.astro×5、shop/product×1）：JSON.stringify 不转义 `</`，若某字符串值含 `</script>` 会提前闭合 script 标签。当前值均为可信作者内容（无 `</script>`），故非漏洞，但建议强模型在 JSON.stringify 后 `.replace(/</g, '\\u003c')` 加固（防御性，P3）。
- 评论系统（Twikoo/Waline）的 XSS 面在其第三方库，非本仓代码，建议强模型追踪其版本与已知 CVE（与 V04/依赖 CVE 维度交叉）。

## Round 11 — V04 密钥泄露

**本轮维度**：V04 密钥泄露（api_key/secret/token/bearer；查 dist 产物与 .env 跟踪状态）
**看哪些文件**：src/config.ts、src/types/index.d.ts、src/worker.mjs、src/lib/{tg.mjs,github-contributions.ts}、src/types/shop.ts、.env、.env.example、wrangler.jsonc、dist/**（构建产物）
**搜什么**：`api_key|apiKey|secret|token|bearer|apiflash`、`apiflash` 全仓、dist grep 密钥串、`.env` git 跟踪状态

### 检查范围（已检查范围）

- `api_key|apiKey|secret|token|bearer|apiflash`（src *.{ts,tsx,astro,mjs,js,json,jsonc}）24 命中，逐条判定：
  - `config.ts:162` `apiflashKey: "88d1af52b0eb40d08f7279b43add327d"` —— 真实 apiflash 截图 API 访问密钥，硬编码于提交源文件。见发现 1
  - `worker.mjs:81` `request.headers.get("x-tg-secret")` —— 服务端读鉴权头（TG_NOTIFY_SECRET 为 Worker secret），非硬编码。✅
  - `github-contributions.ts:146` `` `Authorization': `Bearer ${token}` `` —— token 源自 `import.meta.env.GITHUB_TOKEN`（:238），构建时脚本用，非前端。✅
  - `tg.mjs` —— TG_BOT_TOKEN/TG_CHANNEL_ID 取自 `env`（Worker secret），lock token 为 `crypto.randomUUID()`（非密钥）；:161-166 配置守卫「TG secrets missing」。✅ 服务端
  - `shop.ts:29` `download_token?: string` —— 类型字段，非硬编码密钥。✅
  - `index.d.ts:126` `apiflashKey?: string` —— 类型定义。✅
- `apiflash` 全仓 grep（含 scripts/、根）→ 仅 config.ts:159-162（定义+注释）+ index.d.ts:126（类型），**无任何引用** → apiflashKey 为死配置
- dist 产物检查（dist 存在，410 文件，历史 build）：`Select-String -Pattern 'apiflash','88d1af52b0eb40d08f7279b43add327d' -SimpleMatch` 于 dist/**/*.js,*.html,*.mjs → **0 命中** → 密钥未进入前端产物
- `.env` 跟踪状态：`git check-ignore -v .env` → `.gitignore:14:.env`（已忽略）；`git ls-files .env*` → 空（未跟踪）。✅ 本地密钥未提交
- `.env.example`（实读）：空值模板——`PUBLIC_WEB3FORMS_KEY=`、`GITHUB_TOKEN=`，并注明 TG secrets 须 `wrangler secret put`（不走 .env）。✅ 模板无真实密钥
- `wrangler.jsonc`（实读 1-26）：无硬编码 secret（TG_BOT_TOKEN/TG_CHANNEL_ID/TG_NOTIFY_SECRET 不在文件）；KV namespace id（5826fda6...）为 Cloudflare 资源 ID（AGENTS.md 已声明，非密钥）。✅
- config.ts SEO 其他值：google/bing/baidu 站点验证 token、googleAnalyticsID(G-P11QJ5R11Z)、umamiAnalyticsID、folo feedID/userID、giscus repoId/categoryId —— 均为**公开设计**（验证 token 入 meta/DNS，分析 ID 入公开脚本）。✅ 非密钥
- `PUBLIC_WEB3FORMS_KEY`（.env，PUBLIC_ 前缀）—— Web3Forms 提交端点 key，公开设计（表单提交用，非机密）。✅

### 发现

[P2] [V04] src/config.ts:162 — apiflash 截图 API 访问密钥硬编码于已提交源文件，且为死配置（全仓无引用），违反「密钥不入源码」卫生
  Found:    `apiflashKey: "88d1af52b0eb40d08f7279b43add327d",`
  Expected: 密钥走环境变量（.env.example 的 GITHUB_TOKEN/PUBLIC_WEB3FORMS_KEY 已示范），或删除死配置
  Fix:      需人工决策（密钥已在 git 历史：①先在 apiflash.com 吊销/轮换；②删 config.ts:159-162 + index.d.ts:126 类型；③历史清除须 git filter-repo（破坏性，须备份+回滚命令，硬约束））
  Basis:    判定表 P2「死代码+次要安全卫生」；**非 P0**——dist grep 410 文件 0 命中，密钥未进入前端产物（硬约束「密钥不入前端产物」未触发）
  Note:     影响面=仓库访问者可见（非站点访客——dist 无密钥）；低敏凭据（免费截图 API）；死配置无功能影响；验证=grep dist 0 命中+全仓 grep 无引用

### 结论

V04：**密钥未进入前端产物**（dist 410 文件 grep apiflash/密钥串 0 命中）。1 项 P2：apiflashKey 硬编码于 config.ts:162（死配置，全仓无引用），仓库访问者可见但未进部署产物；须轮换+删源+历史清除（需人工决策）。`.env` 已 gitignore+未跟踪；wrangler.jsonc 无硬编码 secret；GITHUB_TOKEN/TG secrets 走 env；config.ts 其余 SEO/分析值均公开设计。无 P0/P1。

### 移交强模型

- apiflashKey 轮换：在 apiflash.com 吊销旧 key（88d1af52...），从 config.ts:159-162 与 index.d.ts:126 删除；若该功能确已弃用（astro-og-canvas 接管 OG），直接删；历史 exposure 需 `git filter-repo --path src/config.ts` 或接受 key 作废（破坏性，须 `.temp/` 备份 + 给回滚命令）。
- 仓库可见性未知（AGENTS.md 提「私有仓无法开分支保护」暗示可能私有）——若公开仓，apiflashKey 经 config.ts 已对公网暴露，建议强模型确认 `git remote`/GitHub 可见性后定级（公开则升 P1）。
- 评论系统（Twikoo/Waline）版本与已知 CVE 与本维度交叉，建议追踪（V01 移交已提及）。

## Round 12/13 — E01 交互态

**本轮维度**：E01 交互态（:hover / :focus-visible / :disabled / aria-busy / loading/empty；七态齐备）
**看哪些文件**：src/**/*.{astro,css} grep 扫描；InquiryForm.astro（提交 loading）、Button.astro（图标按钮态）、Search.astro（aria-live）、WorksGallery/WeeklyGallery（空态占位）、GithubHeatmap（骨架）
**搜什么**：`:hover|:active\b`、`aria-busy|aria-disabled|:disabled|\.disabled|prefers-reduced-motion`、`empty|length\s*[<>=!]+\s*0`（空态）

### 检查范围（已检查范围 + 七态判定）

- **hover/active**：55 处 CSS `:hover/:active`（WorksGallery/AuthorBox/shop.css/global.css/markdown.css/ConsentBanner/LinkCard/InquiryForm/WeeklyGallery/contact/glossary 等）+ UnoCSS `hover:c-primary`/`active:scale-90`（Button.astro:37,50 搜索/语言按钮、PostList.astro:32 等）。✅ 广覆盖
- **focus-visible**：多处自定义（search-close/search-result-item/tag-item/code-copy-button/gh-cell/skip-to-content/search-input[本轮修]）；图标按钮（theme-toggle/search/language）无 outline:none 且无全局 reset → 保留浏览器默认 focus ring（WCAG 2.4.7 合规）。✅
- **disabled**：`.shop-detail-buy-btn:hover:not(:disabled)` + `:disabled`（shop.css:145,148）；`.form-submit:disabled`（InquiryForm:416）+ `submitBtn.disabled=true/false`（:468,517）；`buyBtn.disabled`（shop/product:194,206,215）。✅
- **loading**：Search 索引加载 `.search-loading` spinner + results `aria-live="polite"`（Search.astro:28）；InquiryForm `.submit-loading` 显示 + `.submit-text` 隐藏（:469-474）+ 15s 超时恢复；shop buy「创建订单中...」+ disabled；GithubHeatmap `.gh-day-labels-placeholder` 骨架。✅
- **empty**：search-empty（topResults.length===0 / searchIndex.length===0 显示）；WorksGallery/WeeklyGallery `thumbnail-placeholder`「暂无图片/No Image」；条件渲染守卫（PillarPage featured/tagLinks、RelatedPosts hasTags&&related.length、TOC filteredHeadings、GithubCard cards.length、MediaEmbed 各 length）。✅
- **error**：shop-error（显示/隐藏）；GithubCard failedToLoad 文案；InquiryForm errorMsg/successMsg；Search loadFailed→错误文案（F05 已验）。✅
- **prefers-reduced-motion**：ConsentBanner:216 `@media (prefers-reduced-motion: reduce)`（transition-duration 0.01ms）；TOC.astro:90 + Head.astro:435 matchMedia；AGENTS.md reduceMotion 全局配置。✅ 尊重
- **aria-busy**：0 命中。loading 态经 aria-live（search）+ disabled+spinner（表单/购买）传达，属有效替代（非缺陷）；按钮 async 的 AT 播报细节属 X01（扩展维度）范畴

### 发现

无。E01 范围内七态（hover/focus/active/disabled/loading/empty/error）齐备，prefers-reduced-motion 被尊重。aria-busy 未用但有有效替代（aria-live/disabled+spinner）。无 P0/P1/P2/P3。

### 结论

E01：已检查范围如上，空结果（合格）。交互态覆盖完整；aria-busy 与按钮 async AT 播报细节移交 X01（扩展维度）。

### 移交强模型

- X01（状态反馈，扩展维度）应补查：InquiryForm/shop buy 的 async loading 是否需 aria-busy 或 aria-live 向 AT 播报（当前 disabled+spinner 为视觉反馈，禁用按钮文字变更不会被 AT 播报）；search 已用 aria-live 无此问题。
- E02（焦点可见，扩展维度）：图标按钮（theme-toggle/search/language）依赖浏览器默认 focus ring，如需与自定义 ring（search-close 等 outline 2px highlight）一致可补 `:focus-visible`（P3 级一致性问题）。

## 状态判定（最终）

十二项 LITE_CORE 全部完成（12/12）：F01/F02/S02/S03/T01/T04/X04/F05/F07/V01/V04/E01 均有结论。P0：0 处。P1：F01×1（shop 结账断链 /shop/checkout/）——需人工决策，已说明（半成品功能 + 路由结构决策，硬约束「只报告不动手」）。P2/P3 未修项：T01×4、T04×1、X04×1、F05×1、V04×1、S02×2、S03×1，均需人工决策，已说明并写入各轮「移交强模型」。F07 UNKNOWN（无测量工具，不编造）。已修：T01 404 h3→h1、X04 search-input :focus-visible。**满足 complete 条件**（十二项都有结论且 P0/P1 已修或已说明）。

---

## 执行批次（用户授权：全部可代码修复项 + 补 i18n 解阻）

用户选择执行范围：全部可代码修复项（6 项）+ 后续补 i18n 键解构构建。已完成：

1. **T01 列表页 h1 ×4**（P2）— `index.astro`（最新文章/Latest Posts）、`works.astro`（作品展示/Portfolio）、`weekly.astro`（周刊/Weekly）、`tags/index.astro`（标签/Tags）各加 `class="sr-only"` 的 h1（视觉隐藏，不改现有设计；UnoCSS presetWind3 按需生成 sr-only）
2. **X04 ImageZoom 键盘**（P2）— `ImageZoom.astro` 加 `handleKeydown`：Esc→zoomOut()、Tab/Shift+Tab 焦点陷阱（preventDefault+overlay.focus()）；按 astro:page-load 注册 / astro:before-swap 清理（AGENTS.md 监听器治理）
3. **F05 CodeCopyButton 失败态**（P2）— catch 分支加 `.copy-failed` 类（1.5s 复位，与 .copied 对称）；global.css 加 `.code-copy-button.copy-failed`（caution 红底，复制图标保持可见）——图标按钮无文字位，i18n 文案不适用
4. **S02 LinkCard 冗余 !important**（P3）— `LinkCard.astro:81` `filter: none !important` → `filter: none`（已 grep 确认全仓仅两条同特异性 (0,2,0) filter 规则，openclaw 在后源序胜出）
5. **S03 search-box 白玻璃 token 化**（P3）— `global.css` light `.search-box` 的 `rgba(255,255,255,α)` 渐变/边框/inset 高光 → `color-mix(in srgb, oklch(var(--un-preset-theme-colors-background)) X%, transparent)`（对齐 dark 模式；黑 rgba 阴影保留为例外）
6. **T04 light 告警框标题色加深**（P2）— `uno.config.ts:36-40` 去掉 5 个语义色的 `/ 0.8` alpha（脚本实测 alpha=1.0 后全部过 AA：note 6.44/tip 5.07/important 6.68/warning 4.77/caution 6.06 ≥4.5:1）；dark 模式未动（已通过）
7. **构建解阻（P0 新发现）** — 运行验证时发现 shop WIP（未提交，untracked）缺 12 个 `shop*` i18n 键导致 `astro check` 失败（12 errors，`pnpm dev/build` 均以 check 开头 → 构建/部署被阻断）。经用户确认，在 `ui.ts` en/zh/zh-tw 三对象补 12 键（shopBackToStore/shopFiledSize/shopVersion/shopUpdated/shopEmail/shopEmailHint/shopEmailPlaceholder/shopBuyNow/shopSecurePayment/shopSecurePaymentDesc/shopInstantDownload/shopInstantDownloadDesc）

### 验证

- `astro check`：修复前 12 errors（全在 shop/product/[id].astro，未涉及本次改动文件）→ 补 i18n 键后 **exit=0，0 errors，0 warnings**（1 hint：shop 未用 Props 接口，不阻断）
- `astro build`：后台执行中（.temp/astro-build-out.txt，待确认 exit code）
- 说明：CSS/JS 交互（ImageZoom Esc/Tab、CodeCopyButton 失败态、告警框新色值）按 AGENTS.md 需 `pnpm build && pnpm preview` 浏览器实测，本会话无法交互验证，留待浏览器确认

### 遗留（本次未执行，仍需人工决策）

- shop 功能去留（F01 P1/P2）——补键仅解构，功能仍半成品（结账 404、无导航入口）
- apiflashKey 轮换+删源+历史清除（V04 P2）
- F07 LHCI 引入 / GA4 RUM 读取
- 列表页 h1 文案与视觉最终确认（当前 sr-only 方案不改变视觉）
