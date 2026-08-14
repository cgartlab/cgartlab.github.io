# CG艺术实验室

[![CI](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/ci.yml)
[![Argus-Flash Review](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/pr-review.yml/badge.svg)](https://github.com/cgartlab/cgartlab.github.io/actions/workflows/pr-review.yml)

基于 Astro 6 + UnoCSS 66 构建的个人品牌网站，专注于数字艺术、动态视觉设计、技术分享与知识管理。部署于 Cloudflare Worker + Static Assets（非 Cloudflare Pages）。

## 技术栈

<!-- DOC-FACTS:START -->
> 自动生成数据（由 `pnpm sync-docs` 更新，勿手改）

> 技术栈：Astro 6.4.8 · TypeScript 6.0.3 · UnoCSS 66.6.8 · pnpm 11.10.0 · Node 24
> 内容：148 个文章文件（74 中文 + 74 英文），周刊 19 期
> Markdown 管线：6 remark + 8 rehype 插件
> 脚本：14 个（apply-lqip / astro / audit-glossary / build / dev / fix-internal-links / format-posts / lint / lint:fix / new-post / preview / sync-docs / sync-docs:check / verify-feed）
<!-- DOC-FACTS:END -->

## 项目结构

```text
src/
├── assets/              # LQIP 占位图（构建时自动生成，勿手动编辑）
├── components/          # Astro 组件
│   ├── Comment/        # Giscus（主用）+ Twikoo/Waline（需配置）
│   └── Widgets/        # TOC, ImageZoom, MediaEmbed, CodeCopyButton, GithubHeatmap 等
├── content/
│   ├── about/           # 关于页集合
│   ├── posts/           # 博客文章（含 works/, weekly/, _images/, _files/）
│   └── privacy/         # 隐私政策集合
├── data/                # 站点数据（友链 links.ts + 术语表 glossary.ts）
├── i18n/                # 国际化 (zh/en，zh-tw 仅在 langMap 中定义但未启用)
├── layouts/             # 页面布局
├── pages/               # 路由（多语言 [...lang] 前缀）
├── plugins/             # Markdown 插件 (remark/rehype)
├── styles/              # UnoCSS 全局样式
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数（内容、搜索、缓存、Feed 等）
└── lib/                 # 库函数（tg.mjs Telegram 推送、github-contributions.ts 热力图）
scripts/                 # 构建与内容工具脚本
public/
├── icons/               # 网站图标（含 SVG favicon）
├── fonts/               # 自定义字体（EarlySummer, STIX, Snell）+ NotoSansSC 简体
├── giscus/              # Giscus 评论主题
├── feeds/               # RSS/Atom Feed 样式表
├── sounds/              # 打字音效 WAV 文件
├── images/              # OG 默认图、微信分享图等静态图片
├── llms.txt             # llms.txt 自动生成
└── robots.txt
```

## 主要功能

- 明暗主题、响应式布局、多语言（zh/en，zh-tw 基础架构就绪但未启用）
- 玄光周刊画廊（WeeklyGallery）：响应式行列布局
- 评论系统：Giscus（主用）+ Twikoo/Waline（需额外配置后启用）
- 搜索：客户端搜索索引 (`api/search-index/[lang].json.ts`)，含 try-catch 错误处理
- OG 图片：`astro-og-canvas` + `canvaskit-wasm` 构建时自动生成（过滤草稿）
- SEO 优化、Google Analytics + Umami 双向统计
- 数学公式 (KaTeX)、Mermaid 图表
- LQIP 低质量图片占位符（构建时自动生成）
- llms.txt 自动生成
- 打字音效（可选）、图片点击缩放（iOS Safari 滚动锁定兼容）、代码复制按钮
- 联系表单 (Web3Forms)，View Transition 导航后表单功能正常
- TOC 目录：IntersectionObserver 高亮 + 桌面端可滚动
- 无障碍：Skip-to-content 链接、完整 `:focus-visible` 键盘焦点指示
- Telegram 自动推送：Worker Cron 每 15 分钟 + `/api/tg-notify` 手动触发，KV 去重
- GitHub 热力图：官方 GraphQL API + 文件缓存（2h TTL），构建时容错
- Cloudflare Worker：无尾斜杠 301 重定向、/feed 快捷重定向 + 错误兜底

## 常用命令

```bash
pnpm dev                  # astro check → astro dev
pnpm build                # astro check → build → generate-llms → apply-lqip（顺序敏感）
pnpm preview              # astro preview --host（局域网可访问）
pnpm lint / lint:fix      # eslint（antfu config，忽略 src/content/**）
pnpm new-post "标题"       # 创建 MD 文章（周刊自动放入 weekly/）
pnpm format-posts         # CJK 文本规范化 (autocorrect)
pnpm apply-lqip           # 生成 LQIP 占位图
pnpm fix-internal-links   # 修复内部链接
pnpm verify-feed          # 验证 RSS/Atom feed 输出
pnpm audit-glossary       # 审计术语表引用完整性
pnpm exec playwright test # Playwright 端到端测试
```

## 分支策略

| 分支 | 用途 |
|------|------|
| `dev-{kebab}` | 代码/功能/样式开发 |
| `write-{kebab}` | 文章/周刊创作 |
| `main` (受保护) | 必须通过 PR → squash merge |

## CI/CD

 - `main` push → **Cloudflare Worker + Static Assets** 自动部署
 - GitHub Actions（`ci.yml`）在每次 push `main`/`dev-*` 和 PR 时运行构建验证
 - 其他 workflow：PR 审查（`pr-review.yml`）、PR 分类（`pr-triage.yml`）、定时维护（`maintenance.yml`）
- 构建命令: `pnpm install --config.trustPolicy=off && pnpm build`
- 域名: [cgartlab.com](https://cgartlab.com)
- 部署配置: `wrangler.jsonc`

## 相关链接

- 网站：https://cgartlab.com
- GitHub：https://github.com/cgartlab/cgartlab.github.io
- 许可证：CC BY-NC-SA 4.0

---

*本项目由 CG艺术实验室维护*
