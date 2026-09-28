# CG艺术实验室

[![CI](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/ci.yml)
[![Argus-Flash Review](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/pr-review.yml/badge.svg)](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/pr-review.yml)

基于 Astro 7 + UnoCSS 66 构建的个人品牌网站，内容覆盖数字艺术、动态视觉设计与知识管理。
部署在 **Cloudflare Worker + Static Assets**，不是 Cloudflare Pages。

## 技术栈

<!-- DOC-FACTS:START -->
> 自动生成数据（由 `pnpm sync-docs` 更新，勿手改）

> 技术栈：Astro 7.3.3 · TypeScript 6.0.3 · UnoCSS 66.10.5 · pnpm 11.10.0 · Node 24
> 内容：162 个文章文件（81 中文 + 81 英文），周刊 21 期
> Markdown 管线：6 remark + 8 rehype 插件
> 脚本：15 个（apply-lqip / astro / audit-glossary / build / dev / fetch-github-repos / format-posts / lint / lint:fix / new-post / preview / sync-docs / sync-docs:check / update-gh-contributions / verify-feed）
<!-- DOC-FACTS:END -->

## 项目结构

```text
src/
├── assets/          # LQIP 占位图、图标、文章模板（LQIP 构建期生成，勿手改）
├── components/      # Astro 组件
│   ├── Comment/     # Giscus（主用）+ Twikoo / Waline（需额外配置后启用）
│   └── Widgets/     # TOC、ImageZoom、MediaEmbed、CodeCopyButton、GithubHeatmap 等
├── config/          # tag-meta.json（标签页 SEO 定制）
├── content/         # 内容唯一来源
│   ├── posts/       # 文章，含 works/、weekly/、_images/、_files/
│   ├── about/       # 关于页集合
│   └── privacy/     # 隐私政策集合
├── data/            # 站点数据：links.ts 友链、glossary.ts 术语表、github-contributions.json
├── i18n/            # 国际化（zh / en；zh-tw 基础设施就绪但未启用）
├── layouts/         # Layout.astro、Head.astro
├── lib/             # tg.mjs（Telegram 推送）、github-contributions.ts、noindex.mjs
├── pages/           # [...lang]/ 动态路由、api/、404
├── plugins/         # Markdown 管线插件（remark / rehype）
├── styles/          # 纯 CSS 层，不经过 UnoCSS transform
├── types/           # TypeScript 类型声明
└── utils/           # content / feed / glossary / search / description / page / cache
scripts/             # 构建与内容工具脚本（tsx 运行）
public/              # 静态资源，直接映射站点根
├── fonts/ giscus/ feeds/ icons/ images/ sounds/ posts/
├── llms.txt           # 构建期生成
├── github-repos.json  # 构建期生成（fetch-github-repos）
└── robots.txt · favicon.ico · 站点验证 txt
```

## 主要功能

- 明暗主题、响应式布局、多语言（zh / en，zh-tw 架构就绪未启用）
- 玄光周刊与专栏：画廊式总览（WeeklyGallery），中英双语
- 评论系统：Giscus（主用）+ Twikoo / Waline（需额外配置）
- 搜索：客户端搜索索引（`api/search-index/[lang].json.ts`）
- 自动术语内链：`remark-glossary` + `rehype-glossary` + 110 条术语表
- OG 图片：`astro-og-canvas` + `canvaskit-wasm` 构建期生成，过滤草稿
- SEO：per-page 标题与描述、`tag-meta.json` 标签页定制、hreflang 双语互指
- `llms.txt`：面向 LLM 的站点索引，构建期生成
- 数学公式（KaTeX）、Mermaid 图表（构建期预渲染 + 延迟加载）
- LQIP 低质量图片占位符（构建期生成）
- 打字音效（可选）、图片点击缩放（iOS Safari 滚动锁定兼容）、代码块复制按钮
- TOC 目录：IntersectionObserver 高亮 + 桌面端可滚动
- 联系表单（Web3Forms），View Transition 导航后仍可用
- 无障碍：Skip-to-content 链接、完整 `:focus-visible` 键盘焦点指示
- Telegram 自动推送：Worker Cron 每 15 分钟 + `/api/tg-notify` 手动触发，KV 去重
- RSS / Atom：`content:encoded` 图片转绝对 URL（第三方阅读器不再裂图），中英各一份
- GitHub 热力图：官方 GraphQL API + 文件缓存（2h TTL），构建期容错
- Cloudflare Worker：无尾斜杠 301、`/feed` 快捷重定向、缓存头、安全头、404 兜底

## 常用命令

```bash
pnpm dev                      # astro check → astro dev（HMR，快速迭代）
pnpm build                    # astro check → fetch-github-repos → build → generate-llms → apply-lqip
pnpm preview                  # astro preview --host（使用 dist/ 生产产物，最接近线上）
pnpm lint / lint:fix          # eslint（antfu config，忽略 src/content/**）
pnpm new-post "标题"           # 新建文章；周刊自动放进 weekly/
pnpm format-posts             # CJK 文本规范化（autocorrect）
pnpm apply-lqip               # 生成 LQIP 占位图
pnpm verify-feed              # 验证 RSS / Atom 输出
pnpm audit-glossary           # 审计术语表引用完整性
pnpm sync-docs                # 同步 README / AGENTS 的自动生成数据块
pnpm sync-docs:check          # 校验数据块是否最新（CI 使用，stale 则退出码 1）
pnpm fetch-github-repos       # 拉取仓库列表 → public/github-repos.json（build 前置）
pnpm update-gh-contributions  # 更新贡献热力图数据
pnpm astro                    # Astro CLI 透传
```

> `pnpm build` 的步骤顺序敏感：`fetch-github-repos` 必须在 build 之前，`apply-lqip` 必须在之后。

> ⚠️ `pnpm lint` 目前不是绿的（prettier 格式基线 vs antfu eslint 风格冲突，全仓约 1 万个
> formatting 类 error），CI 也不跑它。细节与处理策略见 AGENTS.md 的 KEY QUIRKS。

## 分支策略

| 分支 | 用途 |
|------|------|
| `dev-{kebab}` | 代码、功能、样式开发 |
| `write-{kebab}` | 文章与周刊创作 |
| `main` | 生产分支；必须经 PR 合并，合并后删除分支。⚠️ 服务端 ruleset 实际未对 `main` 生效，合并前须自行确认 CI 全绿 |

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)：`<type>(<scope>): <描述>`。

## CI / CD

- 推送到 `main` → **Cloudflare Worker + Static Assets** 自动部署（Cloudflare Git 集成，非 GitHub Actions 部署）
- `ci.yml` 在 `dev-*` / `main` 推送和 PR 时运行，依次执行：
  `pnpm install --config.trustPolicy=off` → `pnpm audit --prod` → `pnpm build` → `pnpm verify-feed` → `pnpm sync-docs:check`
  （`pnpm lint` **不在 CI 内**，见下）
- 其他 workflow：PR 审查（`pr-review.yml`）、PR 分类（`pr-triage.yml`）、定时维护（`maintenance.yml`）、贡献数据更新（`update-contributions.yml`）
- 部署配置：`wrangler.jsonc`
- 域名：[cgartlab.com](https://cgartlab.com)

## 相关链接

- 网站：https://cgartlab.com
- GitHub：https://github.com/cgartlab/cgartlab.github.io
- 许可证：CC BY-NC-SA 4.0

---

*本项目由 CG艺术实验室维护*
