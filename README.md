# CG艺术实验室

基于 Astro 6 + UnoCSS 66 构建的个人品牌网站，专注于数字艺术、动态视觉设计、技术分享与知识管理。部署于 Cloudflare Pages (Workers + Static Assets)。

## 技术栈

Astro 6 · TypeScript 6 · pnpm 10 · Node 24 · UnoCSS 66 (Wind3 + Attributify) · MDX · KaTeX · Mermaid · Playwright · Wrangler

## 项目结构

```text
src/
├── assets/              # LQIP 占位图（构建时自动生成，勿手动编辑）
├── components/          # Astro 组件
│   ├── Comment/        # Giscus + Twikoo + Waline 三套评论
│   └── Widgets/        # TOC, ImageZoom, MediaEmbed, CodeCopyButton 等
├── content/
│   ├── about/           # 关于页集合
│   ├── posts/           # 博客文章（含 works/, weekly/, _images/）
│   └── privacy/         # 隐私政策集合
├── data/                # 站点数据（链接等）
├── i18n/                # 国际化 (zh/en/zh-tw)
├── layouts/             # 页面布局
├── pages/               # 路由（多语言 [...lang] 前缀）
├── plugins/             # Markdown 插件 (remark/rehype)
├── styles/              # UnoCSS 全局样式
├── types/               # TypeScript 类型定义
└── utils/               # 工具函数（内容、搜索、缓存、Feed 等）
scripts/                 # 构建与内容工具脚本
public/
├── icons/               # 网站图标
├── fonts/               # 自定义字体（EarlySummer, STIX, Snell）
├── giscus/              # Giscus 评论主题
└── feeds/               # RSS/Atom Feed 样式表
```

## 主要功能

- 明暗主题、响应式布局、多语言（zh/en/zh-tw）
- 玄光周刊画廊（WeeklyGallery）：响应式行列布局
- 评论系统：Giscus + Twikoo + Waline **三套并行**
- 搜索：客户端搜索索引 (`api/search-index/[lang].json.ts`)
- OG 图片：`astro-og-canvas` + `canvaskit-wasm` 构建时自动生成
- SEO 优化、Google Analytics + Umami 双向统计、Google AdSense
- 数学公式 (KaTeX)、Mermaid 图表
- LQIP 低质量图片占位符（构建时自动生成）
- llms.txt 自动生成
- 打字音效（可选）、图片点击缩放、代码复制按钮
- 联系表单 (Web3Forms)

## 常用命令

```bash
pnpm dev                  # astro check → astro dev
pnpm build                # astro check → build → generate-llms → apply-lqip（顺序敏感）
pnpm preview              # astro preview
pnpm lint / lint:fix      # eslint（antfu config，忽略 src/content/**）
pnpm new-post "标题"       # 创建 MD 文章（周刊自动放入 weekly/）
pnpm format-posts         # CJK 文本规范化 (autocorrect)
pnpm apply-lqip           # 生成 LQIP 占位图
pnpm fix-internal-links   # 修复内部链接
pnpm exec playwright test # Playwright 端到端测试
```

## 分支策略

| 分支 | 用途 |
|------|------|
| `dev-{kebab}` | 代码/功能/样式开发 |
| `write-{kebab}` | 文章/周刊创作 |
| `main` (受保护) | 必须通过 PR → squash merge |

## CI/CD

- push `main` → **Cloudflare Pages** 自动部署（无 GitHub Actions）
- 构建命令: `pnpm install --config.trustPolicy=off && pnpm build`
- 域名: [cgartlab.com](https://cgartlab.com)
- 部署配置: `wrangler.jsonc`

## 相关链接

- 网站：https://cgartlab.com
- GitHub：https://github.com/cgartlab/cgartlab.github.io
- 许可证：CC BY-NC-SA 4.0

---

*本项目由 CG艺术实验室维护*
