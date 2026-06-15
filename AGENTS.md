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

## ARCHITECTURE

| Area | Path | Notes |
|------|------|-------|
| 内容集合 | `src/content.config.ts` | `posts`, `about`, `privacy` 三个集合 |
| i18n | `src/i18n/config.ts` | zh 默认, /en/, /zh-tw/ 路由前缀 |
| 主题配置 | `src/config.ts` | 站点元数据、导航、颜色、评论、SEO |
| UnoCSS | `uno.config.ts` | Wind3 + Attributify + theme preset, 非 Tailwind |
| 路由 | `src/pages/[...lang]/` | 多语言前缀动态路由 |
| 评论 | Giscus + Twikoo + Waline 三套并行 |
| 表单 | `src/components/InquiryForm.astro` | Web3Forms |
| 搜索 | 客户端搜索索引 (`api/search-index/[lang].json.ts`) |
| OG 图片 | `astro-og-canvas` + `canvaskit-wasm` 构建时生成 |
| Wrangler | `wrangler.jsonc` | Workers + Static Assets (dist 目录) |

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

## NOTE

- 设备级配置 `.obsidian/` 通过 Syncthing 同步，不纳入 git 追踪
- 如遇 Syncthing 冲突文件，运行 `scripts/syncthing-cleanup.ps1` (Windows) 或 `scripts/syncthing-cleanup.sh` (macOS/Linux)
