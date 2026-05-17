# CG艺术实验室

基于 Astro 构建的静态网站，专注于数字艺术、动态视觉设计、技术分享和知识管理。

## 技术栈

Astro 6 + TypeScript + UnoCSS + MDX + KaTeX + Mermaid

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

- 明暗主题、响应式布局、中英文双语
- llms.txt 自动生成（符合 LLM 站点索引规范）
- Giscus 评论、SEO 优化
- 数学公式 (KaTeX)、Mermaid 图表
- 内容集合、标签分类

## 内容分类

- **创作笔记**：数字艺术创作、设计思考
- **技术实践**：工具技巧、工作流优化
- **读书笔记**：阅读心得、艺术评论
- **玄光周刊**：每周Newsletter
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
- 合并后删除分支，拉取最新 main

## 开发流程

### 1. 网站功能开发

```bash
# 1. 从 main 创建开发分支
git checkout main
git pull origin main
git checkout -b dev-your-feature

# 2. 开发完成后提交
git add .
git commit -m "feat: add new feature"
git push -u origin dev-your-feature

# 3. GitHub 创建 PR → 审查 → 合并
# 4. 合并后删除本地分支
git checkout main
git pull origin main
git branch -d dev-your-feature
```

### 2. 文章/周刊写作

```bash
# 1. 从 main 创建写作分支
git checkout main
git pull origin main
git checkout -b write-weekly-19

# 2. 在 src/content/posts/weekly/ 创建文章
# 命名格式: [主题] - No.XX 玄光周刊.md

# 3. 提交文章
git add .
git commit -m "docs: add weekly #19"
git push -u origin write-weekly-19

# 4. GitHub 创建 PR → 审查 → 合并
# 5. 合并后删除本地分支
git checkout main
git pull origin main
git branch -d write-weekly-19
```

### 3. Obsidian 写作工作流

Obsidian 用户可通过 obsidian-git 插件同步：

```bash
# 在终端先创建并推送分支
git checkout -b write-your-topic
git push -u origin write-your-topic

# Obsidian 中刷新仓库即可看到新分支
# 命令面板: Obsidian Git: Pull (拉取最新)
# 命令面板: Obsidian Git: Commit (提交更改)
# 命令面板: Obsidian Git: Push (推送)
```

**Obsidian 常用命令** (Ctrl/Cmd+P):
- `Obsidian Git: Pull` — 拉取远程更改
- `Obsidian Git: Commit` — 提交当前更改
- `Obsidian Git: Push` — 推送到远程
- `Obsidian Git: Checkout to` — 切换分支

### 4. CI/CD 部署

- push 到 `main` → Cloudflare Workers 自动部署
- 构建命令: `pnpm install --config.trustPolicy=off && pnpm build`
- 域名: https://cgartlab.com

## 常用命令

```bash
pnpm dev                  # 启动开发服务器
pnpm build                # 构建生产版本
pnpm lint                 # ESLint 检查
pnpm lint:fix             # ESLint 自动修复
pnpm new-post "标题"       # 创建新文章
pnpm format-posts         # 格式化 CJK 文本
pnpm apply-lqip           # 生成 LQIP 图片
```

## 相关链接

- 网站：https://cgartlab.com
- GitHub：https://github.com/cgartlab
- 基于 [Retypeset](https://github.com/radishzzz/astro-theme-retypeset) 主题构建，保留 CC BY-NC-SA 4.0 许可证

---

*本项目由 CG艺术实验室团队维护*