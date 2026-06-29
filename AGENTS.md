# AGENTS.md — cgartlab.github.io

个人主站 (cgartlab.com)。Astro 6 + UnoCSS 66 + TypeScript 6 + pnpm 10 + Node 24，Cloudflare Pages 部署。

## COMMANDS

```bash
pnpm dev                  # astro check → astro dev
pnpm build                # astro check → build → generate-llms → apply-lqip (顺序重要)
pnpm preview              # astro preview --host (局域网可访问)
pnpm lint / lint:fix      # eslint (antfu config, 忽略 src/content/**)
pnpm new-post "标题"       # 创建 MD 文章 (src/content/posts/)，周刊自动放入 weekly/
pnpm format-posts         # CJK 文本规范化 (autocorrect)
pnpm apply-lqip           # 生成 LQIP 占位图 (写入 src/assets/)
pnpm fix-internal-links   # 修复内部链接
pnpm exec playwright test # 端到端测试 (Playwright)
```

## KEY QUIRKS

- **`trailingSlash: 'always'`** — 禁止修改，所有 URL 依赖该设置
- **pnpm only** — `package.json` 中 `packageManager` 强制 `pnpm@10.33.0`
- **LQIP 自动生成** — `src/assets/` 下图片由 `apply-lqip.ts` 管理，禁止手动编辑
- **文章图片** — 必须放在文章同名 `_images/` 目录下
- **ESLint 跳过** — `src/content/**` 完全忽略
- **pre-commit hook** — `simple-git-hooks` + `lint-staged` 自动 eslint --fix `.js/.ts/.astro`
- **Type suppressions** — 仅 2 处 (`@ts-expect-error` in MediaEmbed.astro, `eslint-disable` in Head.astro)
- **`--at-apply` 已废弃** — `injectReset: true` 移除后，纯 CSS 文件中的 `--at-apply` 不再被 UnoCSS 处理，需转为显式 CSS 变量
- **颜色 token** — 所有颜色必须用 `oklch(var(--un-preset-theme-colors-*))` token，禁止裸色值 `#xxx`/`rgb()`。唯一例外：毛玻璃/阴影中的物理透明度 `rgba(0,0,0,α)` 和固定功能语义色（如错误红）
- **View Transitions 监听器** — 全局 `addEventListener` 必须配套 `astro:page-load`/`astro:before-swap`，`matchMedia` 需提取为模块级常量引用
- **iOS 滚动锁定** — 使用 `.scroll-lock` class（`overflow:hidden + position:fixed + width:100%`），开启前保存 `scrollY`，关闭后恢复

## ARCHITECTURE

| Area | Path | Notes |
|------|------|-------|
| 内容集合 | `src/content.config.ts` | `posts`, `about`, `privacy` 三个集合 |
| i18n | `src/i18n/config.ts` | zh 默认, /en/, /zh-tw/ 路由前缀 |
| 主题配置 | `src/config.ts` | 站点元数据、导航、颜色、评论、SEO |
| UnoCSS | `uno.config.ts` | Wind3 + Attributify + theme preset, 非 Tailwind |
| 路由 | `src/pages/[...lang]/` | 多语言前缀动态路由 |
| 评论 | Giscus + Twikoo + Waline 三套并行 |
| 表单 | `src/components/InquiryForm.astro` | Web3Forms，submit 监听器在 `astro:page-load` 内绑定 |
| 搜索 | 客户端搜索索引 (`api/search-index/[lang].json.ts` + `api/search-index.json.ts`) |
| OG 图片 | `astro-og-canvas` + `canvaskit-wasm` 构建时生成，过滤草稿 |
| Wrangler | `wrangler.jsonc` | Workers + Static Assets (dist 目录)，含无尾斜杠 301 重定向 |
| TOC 高亮 | `Widgets/TOC.astro` | IntersectionObserver 驱动 `.toc-active` class，按 DOM 顺序排序 |
| 滚动锁定 | `global.css .scroll-lock` | iOS Safari 兼容：`overflow:hidden + position:fixed + width:100%` |

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

- push main → Cloudflare Pages 自动部署
- 构建命令: `pnpm install --config.trustPolicy=off && pnpm build`
- 域名: cgartlab.com (Cloudflare Pages 自定义域名)

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
5. **PWA 缓存** — 暗色模式下硬刷新 `Ctrl+Shift+R`，排除 Service Worker 缓存

### 关键规则

- **修改配置层（UnoCSS/Vite）后必须验证构建产物** — 配置对不等于 CSS 对
- **用户提到"之前是好的"立即查 git 历史** — 不要在当前代码里反复重建
- **PR 改了部分文件时立即审计同类文件** — 很可能遗漏了同类文件
- **CSS 变量同时查 `:root` 和 `.dark` 两个选择器** — 单边有值不等于两边都生效

## NOTE

- 设备级配置 `.obsidian/` 通过 Syncthing 同步，不纳入 git 追踪
- 如遇 Syncthing 冲突文件，运行 `scripts/syncthing-cleanup.ps1` (Windows) 或 `scripts/syncthing-cleanup.sh` (macOS/Linux)
