# CG艺术实验室

基于 Astro 构建的品牌网站，专注于数字艺术、动态视觉设计、技术分享和知识管理。运行于 Cloudflare Workers + Static Assets。

## 技术栈

Astro 6 + TypeScript + Node 24 + pnpm 10.33.0 + UnoCSS + MDX + KaTeX + Mermaid

## 项目结构

```text
├── public/icons/          # 网站图标
├── public/llms.txt        # LLM 站点索引
├── scripts/               # 构建脚本
├── src/components/        # 组件
├── src/content/posts/     # 博客文章
│   ├── works/            # 作品集
│   └── weekly/           # 玄光周刊
├── src/i18n/              # 国际化 (zh/en/zh-tw)
├── src/layouts/           # 布局
└── src/pages/             # 页面
```

## 主要功能

- 明暗主题、响应式布局、中英文双语（zh/en/zh-tw）
- 玄光周刊画廊（WeeklyGallery）：响应式行列布局（移动端1列、平板2列、桌面4列）
- 打字机光标动画、搜索关键词高亮
- llms.txt 自动生成（符合 LLM 站点索引规范）
- 评论系统（Waline + Twikoo 双系统）
- SEO 优化、OG 图片自动生成
- 数学公式 (KaTeX)、Mermaid 图表
- 内容集合、标签分类
- 打字音效（可选开启）、图片点击缩放

## 内容分类

- **创作笔记**：数字艺术创作、设计思考
- **技术实践**：工具技巧、工作流优化
- **读书笔记**：阅读心得、艺术评论
- **玄光周刊**：每周 Newsletter
- **作品集**：动态视觉设计作品

## 分支策略

本项目使用 `dev-*` 和 `write-*` 两种分支命名规范：

| 分支类型 | 用途 | 示例 |
|---------|------|------|
| `dev-*` | 网站功能开发 | `dev-header-fix`, `dev-search-optimization` |
| `write-*` | 文章/周刊写作 | `write-weekly-19`, `write-art-review` |

### 工作流程

```
main (受保护)
├── dev-{xxx}  → 功能开发 → PR → main → 部署
└── write-{xxx} → 文章写作 → PR → main → 部署
```

**规则**：
- `main` 受保护，必须通过 PR 合并
- `dev-*` 用于代码、功能、样式开发
- `write-*` 用于文章、周刊、内容创作
- 合并后删除分支

## 开发流程

### 1. 网站功能开发

```bash
git checkout main && git pull origin main
git checkout -b dev-your-feature
# 开发完成后
git add . && git commit -m "feat: add new feature"
git push -u origin dev-your-feature
# GitHub 创建 PR → 审查 → Squash merge
git checkout main && git pull origin main && git branch -d dev-your-feature
```

### 2. 文章/周刊写作

```bash
git checkout main && git pull origin main
git checkout -b write-weekly-19
# 在 src/content/posts/weekly/ 创建文章
git add . && git commit -m "docs: add weekly #19"
git push -u origin write-weekly-19
# GitHub 创建 PR → 审查 → Squash merge
git checkout main && git pull origin main && git branch -d write-weekly-19
```

### 3. Obsidian 写作工作流

通过 Obsidian 编辑时，可借助 obsidian-git 插件同步：

```bash
git checkout -b write-your-topic && git push -u origin write-your-topic
```

然后在 Obsidian 中刷新仓库即可看到新分支。常用命令（Ctrl/Cmd+P）：

- `Obsidian Git: Pull` — 拉取远程更改
- `Obsidian Git: Commit` — 提交当前更改
- `Obsidian Git: Push` — 推送到远程
- `Obsidian Git: Checkout to` — 切换分支

### 4. CI/CD 部署

- push 到 `main` → GitHub Actions → Cloudflare Workers 自动部署
- 构建命令: `pnpm install --config.trustPolicy=off && pnpm build`
- 域名: https://cgartlab.com、www.cgartlab.com（自定义域名）
- 部署配置: `wrangler.jsonc`（Workers + Static Assets）

## 常用命令

```bash
pnpm dev                  # astro check && astro dev
pnpm build                # 构建生产版本（含 LLM 索引生成 + LQIP）
pnpm preview              # 本地预览生产构建
pnpm lint                 # ESLint 检查
pnpm lint:fix             # ESLint 自动修复
pnpm new-post "标题"       # 创建新文章
pnpm format-posts         # 格式化 CJK 文本
pnpm apply-lqip           # 生成 LQIP 图片
```

## 相关链接

- 网站：https://cgartlab.com
- GitHub：https://github.com/cgartlab/cgartlab.github.io
- 构建在 Cloudflare Workers 上，保留 CC BY-NC-SA 4.0 许可证

---

*本项目由 CG艺术实验室维护*
