# AGENTS.md — cgartlab.github.io

**分层**: 个人品牌 (Personal Brand) — 品牌旗舰

个人主站 (cgartlab.com)。Astro 6 + UnoCSS + Node 24 + pnpm 10.33.0，Cloudflare Pages 部署。

## STRUCTURE

```
src/
├── assets/         # LQIP 图片（自动生成，勿手动编辑）
├── components/     # Astro 组件（含 InquiryForm.astro Web3Forms 表单）
├── content/posts/  # 博客文章（含 weekly/ 周刊, works/, _images/ 图片）
├── data/           # 站点数据
├── i18n/           # 国际化 (zh/en/zh-tw)
├── layouts/        # 页面布局
├── pages/          # 路由 ([...lang] 前缀)
├── plugins/        # Markdown 插件 (rehype/remark)
├── styles/         # UnoCSS 样式
├── types/          # TypeScript 类型
└── utils/          # 工具函数
scripts/            # 构建/内容脚本 (generate-llms.ts, apply-lqip.ts, new-post.ts, format-posts.ts, fix-internal-links.ts)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 博客文章 | `src/content/posts/` | MDX, 图片放 `_images/` |
| 产品介绍（LayerRenamer 等） | `src/content/posts/` | 个人产品的发布/介绍文章 |
| 周刊 | `src/content/posts/weekly/` | 命名: `[主题] - No.XX 玄光周刊.md` |
| 作品集 | `src/content/posts/works/` | 动态视觉设计作品 |
| 联系表单 | `src/components/InquiryForm.astro` | Web3Forms 表单组件 |
| i18n 配置 | `src/i18n/config.ts` | zh 默认, /en/, /zh-tw/ |
| 站点配置 | `src/config.ts` | 全局主题配置 |
| Astro 配置 | `astro.config.ts` | trailingSlash, UnoCSS, 集成 |
| 构建脚本 | `scripts/` | generate-llms.ts, apply-lqip.ts, new-post.ts, fix-internal-links.ts |
| ESLint | `eslint.config.mjs` | antfu config, 忽略 src/content/ |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `astro.config.ts` | Config | `/` | 主配置: trailingSlash, i18n, 集成 |
| `src/config.ts` | Config | `src/` | 站点元数据、导航、社交链接 |
| `src/i18n/config.ts` | Config | `src/i18n/` | 多语言路由和翻译 |
| `src/content/config.ts` | Schema | `src/content/` | 内容集合 Zod schema |

## CONVENTIONS

- **`trailingSlash: 'always'`** — 所有 URL 以 `/` 结尾。**严禁修改**。
- **pnpm 10.33.0** — `package.json` `packageManager` 强制，CI 需 `--config.trustPolicy=off`。
- **LQIP 自动生成** — `src/assets/` 下图片由 `apply-lqip.ts` 自动处理，**不要手动编辑**。
- **ESLint** — antfu config, `src/content/**` 被忽略。
- **pre-commit** — `simple-git-hooks` + `lint-staged` 自动修复 `.js/.ts/.astro`。
- **周刊标签** — 必须包含 `周刊` tag。
- **双语文章** — 英文版文件名加 `-en` 后缀 (如 `文章.md` + `文章-en.md`)。
- **Frontmatter**: `title`, `published` (必需); `tags`, `draft`, `pin`, `lang`, `abbrlink` (可选)。

## BRANCH STRATEGY

### 分支命名规范
```
dev-{description}     # 网站功能开发
write-{description}   # 文章/周刊写作
```

### 分支流程
```
main (受保护)
├── dev-{description}  → 功能开发完成 → PR → main → 部署
└── write-{description} → 文章写作完成 → PR → main → 部署
```

### 规则
- **main 受保护** — 必须通过 PR 合并，禁止直接推送
- **dev-*** — 网站代码、功能、样式、组件开发
- **write-*** — 博客文章、周刊、内容创作
- **合并后删除分支** — 已合并的功能分支应及时清理
- **描述使用 kebab-case** — 如 `dev-header-fix`, `write-weekly-19`

### 工作流程
1. 从 main 创建 `dev-*` 或 `write-*` 分支
2. 在分支上完成工作
3. 提交 PR → Squash merge → 合并到 main
4. 合并后删除分支，拉取最新 main

## COMMIT MESSAGE

所有提交遵循 Conventional Commits 格式，由 `commit-msg` hook 自动校验。

### 标准格式
```
<type>(<可选 scope>): <描述>
```

### 允许类型
`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore` | `ci`

### 规则
- **scope**：可选，支持 Unicode 字母（大写、中文）、数字、`_`、`.`、`-`
- **scope 示例**：`feat(Auth)`、`docs(认证)`、`chore`

### 豁免（跳过校验）
| 前缀 | 用途 |
|------|------|
| `Merge ...` | Git 合入 |
| `Revert ...` / `This reverts commit ...` | 回退提交 |
| `vault backup: ...` | Obsidian 自动备份（仅 cgartlab-obsidian） |

## ANTI-PATTERNS

- **不要修改 `trailingSlash: 'always'`** — 所有现有 URL 依赖此设置。
- **不要编辑 `src/assets/` 中的 LQIP 文件** — 由 `apply-lqip` 自动管理。
- **不要用 npm/yarn** — pnpm only。
- **不要在 `_images/` 外放文章图片** — 文章图片必须放在同名 `_images/` 目录。
- **不要直接推送 main** — 必须通过 PR 合并（`dev-*` 或 `write-*` 分支 → PR → squash merge → main）。
- **不要提交 .obsidian/** — 设备级配置，通过 Syncthing 同步。

## COMMANDS

```bash
pnpm dev                  # astro check && astro dev
pnpm build                # astro check → build → generate-llms → apply-lqip
pnpm preview              # astro preview
pnpm lint                 # eslint
pnpm lint:fix             # eslint --fix
pnpm new-post "标题"       # 创建文章（周刊自动放入 weekly/）
pnpm format-posts         # CJK 文本格式化 (autocorrect)
pnpm apply-lqip           # 生成 LQIP 图片
pnpm fix-internal-links    # 修复内部链接
```

## CI/CD

- **触发**: push `main` → Cloudflare Pages 直接部署（无需 GitHub Actions）
- **构建命令**: `pnpm install --config.trustPolicy=off && pnpm build`
- **域名**: cgartlab.com (Cloudflare Pages 自定义域名)
- **Wrangler**: `wrangler.jsonc`（Workers + Static Assets 配置）

## NOTES

- **UnoCSS** 而非 Tailwind — `unocss` 66.x, preset-attributify
- **Markdown 插件**: rehype-katex (数学), rehype-mermaid (图表), remark-directive, remark-math
- **评论系统**: Waline + Twikoo 双系统
- **联系表单**: Web3Forms（InquiryForm.astro）
- **OG 图片**: `astro-og-canvas` + `canvaskit-wasm` 自动生成
- **搜索**: 客户端搜索索引 (`api/search-index/[lang].json.ts`)
- **测试**: playwright 1.58.2 已安装（`pnpm exec playwright test`）
- **Type suppressions**: 仅 2 处 (`@ts-expect-error` in MediaEmbed.astro, `eslint-disable` in Head.astro)
- **.obsidian/**: 设备级配置，通过 Syncthing 同步，不纳入 git 追踪
