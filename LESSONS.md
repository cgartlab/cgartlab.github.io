# LESSONS — cgartlab.github.io

> 个人主站 (Astro 7 + UnoCSS 66 + TS 6 + pnpm 11 + Node 24 + Cloudflare Worker + Static Assets)。
> 本仓库从真实失误沉淀的「教训→规则」清单。**会话开始先全文阅读并遵循其中所有规则**；出现新失误按 §维护 追加。
> 权威依据：Anthropic Claude Code memory/best practices（<200 行、具体可验证、第二次犯同样错即写入）；社区 lessons.md 惯例（Boris Cherny，Anthropic）。
> 来源：本仓库 AGENTS.md 的 KEY QUIRKS / ANTI-PATTERNS / 设备约束 + 已验证 fix 提交；预填为种子，后续由 Agent 在真实工作中增长。

## 维护
- **触发**：用户纠正 / Agent 自查到的失误 / 非显而易见的 gotcha。
- **格式**：`### <主题>` 下，每条 = 失误（具体场景）→ 规则（最小可执行指令），一行可验证。
- **只记项目特有、不可从代码推断的**；通用最佳实践不写；含糊措辞（"小心""注意"）删掉。
- **重复出现** → 升级进 `AGENTS.md` 硬规则；**月度审阅**裁剪过期项；目标 < 200 行。

## 构建与部署

### Worker 安全头
- 失误：`applySecurityHeaders()` 就地 `resp.headers.set()` 改 `Response.redirect()` 产出的 immutable headers → 抛 `TypeError: immutable`，被最外层 catch 吞成 404，全站无尾斜杠 URL 全部 404 → 规则：安全头必须重建 Response，不能就地 set（见 AGENTS.md「Worker 行为」）（commit a9af840e）

### 404 页面死循环
- 失误：404 页面直接取 `/404.html`，资源层 `auto-trailing-slash` 把它 307→`/404`（空 body），尾斜杠规则又改 `/404/`，资源层再改回 `/404`，三规则叠加成重定向死循环 → 规则：进资源层前拦截 `/404`、`/404/`、`/404.html` 三个别名，跟随规范化重定向取正文（见 AGENTS.md「Worker 行为」）（commit 6bad40d8）

### 发文章导致 CI 失败
- 失误：发文章后文章数/专栏数变了，DOC-FACTS 数据块过时，CI 的 `sync-docs:check` 报 `[stale]` 退出码 1 → 规则：发布内容后在同一个 PR 里跑 `pnpm sync-docs` 并提交（见 AGENTS.md「CI/CD」）

### `pnpm lint` 不是绿的且 CI 不跑
- 失误：在 bugfix PR 里跑 `eslint --fix`，把文件整体重排淹没 diff → 规则：bugfix PR 只跑 `pnpm build` + 相关脚本，统一格式化另开独立 PR；最小 diff 修复可用 `--no-verify` 跳过 pre-commit eslint，但必须在 PR 描述说明理由（见 AGENTS.md「KEY QUIRKS」）

## 样式与设计令牌

### trailingSlash
- 失误：修改 `trailingSlash: 'always'` 导致所有 URL 依赖断裂 → 规则：禁止修改此配置（见 AGENTS.md「KEY QUIRKS」）

### 颜色 token
- 失误：用裸色值 `#xxx`/`rgb()`，暗色模式不生效 → 规则：所有颜色用 `oklch(var(--un-preset-theme-colors-*))`，唯一例外是毛玻璃/阴影的 `rgba(0,0,0,α)`（见 AGENTS.md「KEY QUIRKS」）

### safelist 遗漏
- 失误：新增颜色只在纯 CSS 文件中使用，未加 safelist，`unocss-preset-theme` 不生成变量，暗色模式切换后颜色不变 → 规则：新颜色只在 raw CSS 中用 → 加 `bg-{name}`/`text-{name}` 到 `safelist`（见 AGENTS.md「safelist 机制」）

### 字体变量 preflight
- 失误：删掉 `uno.config.ts` 的 `preflights` 下发的 `--un-preset-theme-font-family-*`，文章标题全部退回 `font-sans`（OPPOSans） → 规则：`unocss-preset-theme` 不处理 `fontFamily`，preflight 不可删（见 AGENTS.md「KEY QUIRKS」）

### `--at-apply` 已废弃
- 失误：在纯 CSS 文件中用 `--at-apply`，移除 `injectReset: true` 后变成死代码，静默失效 → 规则：纯 CSS 文件中转为显式 CSS 变量引用（见 AGENTS.md「KEY QUIRKS」）

### 正文 14px 标题等比
- 失误：改正文字号时未同步缩放标题，比例失调 → 规则：正文 `0.875rem`(14px)，标题按 14/17≈0.824 等比缩小，改字号必须同步标题（见 AGENTS.md「KEY QUIRKS」）

## 依赖与锁文件

### ExFAT + pnpm
- 失误：把 `nodeLinker` 改回 `isolated`，ExFAT 不支持 symlink，`pnpm install` 失败 → 规则：`nodeLinker: hoisted` 是兼容性必需，不可改回（见 AGENTS.md「设备与文件系统约束」）

### pnpm store 位置
- 失误：只改 `.npmrc` 的 storeDir 不生效，pnpm 仍在 ExFAT 建符号链接失败 → 规则：改 `%LOCALAPPDATA%\pnpm\config\config.yaml` 的 `storeDir` 指向 NTFS（见 AGENTS.md「设备与文件系统约束」）

### overrides 漏洞处理
- 失误：直接升级直接依赖修传递依赖漏洞，拖入不相关大版本 → 规则：`pnpm audit --prod` 报错 → 在 `pnpm-workspace.yaml` 的 `overrides` 钉同 minor 补丁，每条带注释写明引入方/修复版本/是否同 minor，只动 lockfile + workspace 文件（见 AGENTS.md「overrides」）

### allowBuilds 不可删
- 失误：顺手删掉 `allowBuilds` 中禁用 esbuild/sharp/simple-git-hooks/workerd 构建脚本的条目 → 规则：删掉等于恢复构建脚本执行，不要删（见 AGENTS.md「pnpm-workspace.yaml」）

## RSS 与 Feed

### 图片绝对化顺序
- 失误：RSS/Atom 图片查表前先剥 `../` 前缀再 `decodeURIComponent`，顺序反了，markdown-it 编码的中文路径查不到，`<img>` 停留在相对路径，第三方阅读器裂图 → 规则：查表前必须先 `decodeURIComponent` 再剥 `../`/`./` 前缀，顺序不能反（见 AGENTS.md「KEY QUIRKS」）（commit a772aeb7）

### TG 推送 CDATA
- 失误：RSS 解析漏剥 CDATA 包装，把标记当正文带进频道文案，摘要被剥 HTML 正则整段吃掉 → 规则：解析必须先剥 CDATA 首尾标记再反转义，不用整段正则（见 AGENTS.md「Telegram 推送」）

## Giscus 与跨域

### Giscus 主题 CSS 绝对路径
- 失误：Giscus 主题 CSS 用相对路径，iframe origin 是 `giscus.app`，相对路径解析为 `giscus.app/giscus/theme-*.css` → 404 → 规则：必须用绝对路径 `https://cgartlab.com/giscus/theme-*.css`（见 AGENTS.md「KEY QUIRKS」）

## Git 与环境

### untrackedCache 漏报
- 失误：`core.untrackedCache=true` 让 `git status` 漏报未跟踪文件，误判「没有新文件」 → 规则：核对新增文件用 `git status --untracked-files=all` 或指定路径（见 AGENTS.md「Git 维护记录」）

### `git reset --hard` 静默丢弃未提交 WIP
- 失误：工作区长期存在未提交的用户/其他会话改动（`AGENTS.md` 会话约定、shop 功能 untracked、`LESSONS.md`），`git reset --hard origin/main` 把已跟踪文件的未暂存改动**静默丢掉**（实测丢过 `AGENTS.md` 那行会话约定，靠 `git diff` 里的 blob hash 逐字节还原） → 规则：同步 main 一律 `git pull --ff-only`；**禁止** `git reset --hard` / `git checkout -- .` / `git clean -fd`，确需重置先 `git stash push -u` 或 `cp` 到 `.temp/` 备份

### `public/_headers` 已删除
- 失误：在 `public/` 下重建 `_headers` → 规则：缓存头/安全头全部由 `src/worker.mjs` 负责，不要重建（commit 25bb537）

### Obsidian vault 根
- 失误：把 vault 根改回仓库根，包含 `node_modules`(43k 文件)，Obsidian 启动从 ~1.7s 涨到 ~9.4s → 规则：vault 根设在 `src/`，不可改回仓库根（见 AGENTS.md「写作环境」）

### `newLinkFormat` 不可改 absolute
- 失误：改成 `absolute` 生成 `/content/posts/_images/x.png` 断链 → 规则：保持 `relative`，禁改 `absolute`（见 AGENTS.md「禁止事项」）

### 全局杀 node
- 失误：`taskkill /F /IM node.exe` 全局杀 node，pi-web 自身就是 node 进程，自杀 → 规则：只按 PID 精确杀：`netstat -ano | grep ":PORT.*LISTEN"` → `taskkill /F /PID <PID>`（见 AGENTS.md「环境红线」）

## 构建 ≠ 功能

### preview 验证
- 失误：`astro check && astro build` 通过就认为功能正确，实际暗色/双语/公式/OG/Mermaid 有问题 → 规则：JS 交互类修改必须 `pnpm build && pnpm preview` 在浏览器中实际操作验证（见 AGENTS.md「交付前自验清单」）
