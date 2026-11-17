# LESSONS — cgartlab.github.io

> CGArtLab 个人主站（Astro 7 + UnoCSS，pnpm only，Cloudflare Workers，端口 4400，`trailingSlash:'always'` 不可改）。
> 本仓库从真实失误沉淀的「教训→规则」清单。**会话开始先全文阅读并遵循其中所有规则**；出现新失误按 §维护 追加。
> 权威依据：Anthropic Claude Code memory/best practices（<200 行、具体可验证、第二次犯同样错即写入）；社区 lessons.md 惯例（Boris Cherny，Anthropic）。
> 来源：本仓库 AGENTS.md + 真实会话纠错记录（862 条 user 消息中的 18 条）+ 已验证 fix 提交。

## 维护
- **触发**：用户纠正 / Agent 自查到的失误 / 非显而易见的 gotcha。
- **格式**：`### <主题>` 下，每条 = 失误（具体场景）→ 规则（最小可执行指令），一行可验证。
- **只记项目特有、不可从代码推断的**；通用最佳实践不写；含糊措辞（"小心""注意"）删掉。
- **重复出现** → 升级进 `AGENTS.md` 硬规则；**月度审阅**裁剪过期项；目标 < 200 行。

## 内容与写作（Obsidian → Astro）

### 文章源在 Obsidian，别改错版本
- 失误：找到的是旧草稿版本，用户要求的封面/推荐内容已被改过 → 规则：改文章前先确认**最新版本**（用户常用 Obsidian 编辑），改动前复述将要改的段落与来源路径（用户 2026-10 会话：「这一篇的草稿是昨天，完全不是这个版本」）

### 中文与英文版必须成对修改
- 失误：只改中文版，`-en.md` 漏改导致双语不一致 → 规则：`src/content/posts/*.md` 与同名 `*-en.md` 一律成对修改

### 外链必须验证真实可访问
- 失误：文章里的官网链接过期（PotPlayer `daum.net`、DDNS-GO 旧域名）→ 规则：新写/修改的外链先实际访问确认，失效即换官方地址（commit 系见 2026-10 链接修复任务）

### 少数派投稿规范
- 失误：文章不符合少数派排版规范（术语大小写/空格/标点）→ 规则：投稿类文章按少数派规范校对，专用提交 `docs(posts): 修复 XXX 规范合规`（commit 763ba1a4、adecb901、7311d875）

### 图片尺寸语法会被剥离
- 失误：Markdown 图注里的 alt 尺寸段渲染异常 → 规则：图注与 alt 中的尺寸语法会被 `remark` 剥离，写图注时不依赖尺寸标记（commit df0c1a3e、d4723842）

## 排版与字体（高频返工区）

### 字体变量必须下发到正文
- 失误：标题衬线字体失效，因 font-family 变量未下发 → 规则：字体一律通过 CSS 变量下发，改字体先验证变量在目标元素上生效（commit a379be53）

### 中英文字体分工不可混
- 失误：把文章标题也换成花体英文；用户要求「标题与列表标题用统一衬线，其他保持花体」→ 规则：中文标题走衬线，英文装饰体只用于非标题位；改动前列出受影响的全部选择器（用户 2026-10 会话）

### 行距调整按用户给的量
- 失误：自行估算行距 → 规则：用户说「增加 1/3」就按当前值的 1/3 增量计算并说明基准值（用户 2026-10 会话）

## 组件与响应式（热力图教训）

### 组件问题先查组件本身
- 失误：反复改调用侧样式，热力图右侧空白始终存在 → 规则：同一视觉缺陷修 2 次不消失，立即怀疑**组件本身**（尺寸/容器/overflow），从根因改（用户：「你应该从更高的角度来审查这个问题，我觉得组件本身的样式可能搞错了」）

### 移动端与平板分别对待
- 失误：把移动端断点改动连带影响平板 → 规则：手机/平板断点分开定义，改移动端后必须同时验证 768 与 375 两个宽度

### 禁止不必要的纵向滚动
- 失误：热力图出现纵向滚动条 → 规则：内容高度充裕时不得出现纵向滚动；用 `overflow` 与容器高度双重确认

### 改动必须在最新 main 上验证
- 失误：陈旧分支上预览，看到的样式不是最新 → 规则：视觉确认前先 `git rebase` 到最新 `main`，并明确预览端口（4400）

## 构建与部署

### CI 连红先看失败的是哪一步，audit 失败不等于构建坏了

- 失误：main 自 2026-11-14 起连续 7 次 CI 失败，全都是 `pnpm audit --prod` 因新披露的 astro 漏洞
  （GHSA-r3h5-4585-7x3w，受影响 <=7.4.6，修补 7.4.7）把后面的 `pnpm build` / `check-columns` /
  `verify-feed` / `sync-docs:check` 全部跳过，看上去像构建坏了 → 规则：先读失败步骤名，
  `Audit dependencies` 红就是依赖钉版问题（改 `package.json` 或 `overrides` + lockfile）；
  并且**被跳过的步骤等于没验过**，修完 audit 必须自己把 build、verify-feed、sync-docs:check 跑一遍
  （这次正是靠补跑才发现 DOC-FACTS 已经过时，合了 audit 还会再红一次）

### 安全修补自己精确钉版，别让 dependabot 重算 lockfile

- 失误：dependabot 的 astro 7.4.5→7.4.7 PR 自己 CI 也红：它重算的 lockfile 带进
  `postcss@8.5.33`、`mdast-util-to-hast@13.2.2`，发布不足 24 小时，被 pnpm 的
  `minimumReleaseAge`（默认 1440 分钟）判为 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`；
  而 `^7.4.7` 又会解析到 7.4.12（换掉编译器与 Vite 插件绑定，lockfile +700 行）
  → 规则：安全修补写**精确版本**（`"astro": "7.4.7"`）并本机 `pnpm install`——本机同样受
  24 小时策略约束，生成的 lockfile 天然合规；一次 PR 只做一件事，工具链换代另开 PR 验证

### `trailingSlash: 'always'` 不可改
- 失误：改动 trailingSlash 导致路由 404/重定向混乱 → 规则：`astro.config.ts` 的 `trailingSlash: 'always'` 属硬约束（见 AGENTS.md）

### Worker 响应头抛错会全站 404
- 失误：immutable headers 处理抛异常，导致 www 与全部重定向返回 404 → 规则：改 Worker 头部逻辑后必须验证根路径、www、重定向三类响应均 200（commit a9af840e）

### 404 页与别名要防死循环
- 失误：`/404` 别名与 404 页面互相重定向成死循环 → 规则：404 路由与别名改动后手工访问 `/404`、`/nonexistent` 双向验证（commit 6bad40d8）

### 依赖审计门禁不可绕过
- 失误：`pnpm audit` 门禁因新通告变红 → 规则：新增依赖先跑 `pnpm audit`；临时豁免须写理由并在通告修复后立刻移除（commit 34e5f84b、dc5c9bfa）

## 法律页与合规

### 三份法律文档合并成一份，旧路径必须 301

- 失误：2026-11-17 把《服务条款》《隐私政策》《免责声明》合并为《用户协议》，旧 URL 散落在文章、关于页、页脚与搜索结果里 → 规则：合并法律页要一次改完「页脚入口 + 内容内链 + Worker 301」三处，并用 `wrangler dev --local` 实测 `/terms`、`/privacy`、`/disclaimer` 及 `/en/` 变体返回 301 而非 404（`src/worker.mjs` 的 `LEGAL_ALIASES`）

### Cookie 横幅必须真的门控分析脚本

- 失误：`ConsentBanner.astro` 只把选择写进 `consent-preference`，却没有任何代码读它，GA / Umami 照样无条件加载，点「拒绝」形同虚设 → 规则：动同意相关 UI 必须验证「拒绝」后 DevTools 网络面板里没有 `googletagmanager` 与 `umami` 请求；GA 走 Consent Mode（`default: denied`），Umami 直接不注入脚本

## 构建产物与性能

### 移除 PWA 要清干净
- 失误：移除 `vite-plugin-pwa` 后残留注册代码 → 规则：移除 PWA 需同时删 import、配置块、`registerSW` 调用与 manifest 引用；`partytown` 与 PWA 无关不要误删（用户 2026-10 明确要求）

### `prefetchAll` 默认关闭
- 失误：`prefetchAll: true` 造成不必要的资源预取 → 规则：保持 `prefetchAll: false`，除非有量化收益证据

### 无障碍属性不能省
- 失误：画廊组件缺 `role="img"` / `aria-label` 与焦点样式 → 规则：可交互/图像类组件必须补 ARIA 与 `focus-visible`（commit 42f9540f）

## 客户端脚本

### `astro:page-load` 可能在脚本执行前就已触发
- 失误：首页 stage 的客户端脚本只注册 `astro:page-load`，但该事件在模块脚本执行前就派发完了 → 首屏动画/交互全部不启动，且没有任何报错（SSR 出来的静态文字看起来"正常"，掩盖了问题）
- 规则：任何依赖 `astro:page-load` 的脚本，必须在注册监听之外**再直接调用一次 boot**；用 `element.dataset.xxxReady` 做幂等守卫，`boot()` 里先查该标记再 `unmount()+mount()`，否则第二次 boot 会把刚挂载的实例拆掉
