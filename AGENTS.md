# AGENTS.md

## 命令
- **开发**: `pnpm dev` (`astro check && astro dev`)
- **构建**: `pnpm build` (`astro check` → build → `generate-llms.ts` → LQIP)
- **检查**: `pnpm lint`, `pnpm lint:fix`
- **内容**: `pnpm new-post "标题"`, `pnpm apply-lqip`, `pnpm format-posts`

## 约束
- **包管理器**: pnpm 10.33.0（由 `package.json` `packageManager` 强制）
- **`trailingSlash: 'always'`** (`astro.config.ts:31`) — 严禁修改
- **LQIP 映射** (`src/assets/`) 自动生成 — 勿手动编辑
- **ESLint** 忽略 `src/content/**` (`eslint.config.mjs:7`)
- **提交前**: `lint-staged` 自动修复 `.js/.ts/.astro` 文件
- **`.env`**: `GOOGLE_ADSENSE_PUBLISHER_ID`（不提交）

## 内容
- **文章**: `src/content/posts/`，图片同级 `_images/` 文件夹
- **周刊**: `src/content/posts/weekly/`，需 `周刊` 标签，命名 `[主题] - No.XX 玄光周刊.md`
- **双语**: 英文版加 `-en` 后缀（如 `文章.md` + `文章-en.md`）
- **前置信息**: `title`, `published` (必需); `tags`, `draft`, `pin`, `lang` (zh/en/zh-tw), `abbrlink` (可选)

## 架构
- **i18n**: `src/i18n/config.ts` — zh (默认), en, zh-tw；URL: `/`, `/en/`, `/zh-tw/`
- **主题配置**: `src/config.ts`；Markdown 插件: `src/plugins/`
- **构建**: UnoCSS + Astro Compress + Shiki 语法高亮（light/dark 主题）

## CI/CD
- **触发**: 推送 `main` → Cloudflare Workers Git 集成自动部署
- **构建**: `pnpm install --config.trustPolicy=off && pnpm build`
- **域名**: cgartlab.com；环境变量在 Cloudflare Dashboard 配置
