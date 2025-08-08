# CG艺术实验室

> 探索数字艺术的边界

这是一个基于 [Astro](https://astro.build) 构建的静态网站，专注于数字艺术、视觉设计、技术分享和知识管理。

## 🌟 项目特色

- **多语言支持** - 支持简体中文、繁体中文和英文
- **内容集合管理** - 使用 Astro 的内容集合功能管理文章、周刊、作品等
- **现代技术栈** - Astro + TypeScript + TailwindCSS
- **SEO优化** - 内置完善的 SEO 和元数据管理
- **RSS订阅** - 支持 RSS/Atom 订阅源
- **响应式设计** - 完美适配桌面和移动设备

## 🚀 技术栈

- **框架**: [Astro](https://astro.build) - 静态站点生成器
- **样式**: [TailwindCSS](https://tailwindcss.com) - 实用优先的 CSS 框架
- **图标**: [lucide-react](https://lucide.dev) - 美观的图标库
- **代码高亮**: [Prism](https://prismjs.com) - 代码语法高亮
- **构建工具**: [Vite](https://vitejs.dev) - 快速构建工具

## 📁 项目结构

```
src/
├── components/          # 可复用的 Astro 组件
├── content/            # 内容集合
│   ├── posts/          # 博客文章
│   ├── weekly/         # 玄光周刊
│   ├── works/          # 作品展示
│   ├── guides/         # 使用指南
│   ├── about/          # 关于页面
│   └── templates/      # 内容模板
├── layouts/            # 页面布局
├── pages/              # 路由页面
├── styles/             # 全局样式
├── utils/              # 工具函数
└── types/              # TypeScript 类型定义
```

## 🛠️ 开发指南

### 环境要求

- Node.js 18+ 
- pnpm (推荐)

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

访问 http://localhost:4321 查看网站

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## ✍️ 内容创作

### 创建新文章

使用提供的模板快速创建新内容：

```bash
# 复制模板并修改
src/content/templates/博客文章模板.md
```

### 支持的内容类型

- **博客文章** (`src/content/posts/`)
- **玄光周刊** (`src/content/weekly/`)
- **作品展示** (`src/content/works/`)
- **使用指南** (`src/content/guides/`)

### 内容格式

所有内容使用 Markdown 格式，支持以下扩展功能：

- **提示块**: `> [!NOTE]` 或 `:::note`
- **折叠内容**: `:::fold[标题]`
- **GitHub仓库卡片**: `::github{repo="owner/repo"}`
- **视频嵌入**: `::youtube{id="视频ID"}` 和 `::bilibili{id="BV号"}`
- **X推文**: `::tweet{url="推文链接"}`

## 🌐 多语言支持

项目支持三种语言：
- 简体中文 (`zh`)
- 繁体中文 (`zh-tw`) 
- 英文 (`en`)

语言配置位于 `src/i18n/ui.ts` 文件中。

## 📊 内容管理

### 内容集合

使用 Astro 的内容集合功能管理不同类型的内容：

- `posts` - 博客文章
- `weekly` - 周刊内容
- `works` - 作品展示
- `guides` - 使用指南
- `about` - 关于页面

### 内容元数据

每篇内容支持以下元数据：

```yaml
---
title: "文章标题"
description: "文章描述"
published: "2024-01-01"  # 发布日期
tags: ["标签1", "标签2"]  # 标签列表
draft: false              # 是否为草稿
pin: 0                    # 置顶权重
toc: true                 # 是否显示目录
lang: zh                  # 语言代码
---
```

## 🔄 RSS订阅

网站提供以下订阅源：

- RSS: `/rss.xml`
- Atom: `/atom.xml`
- 多语言RSS: `/[lang]/rss.xml`

## 📱 部署

### 静态托管

支持部署到任何静态托管平台：

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

### 自动部署

使用 GitHub Actions 实现自动部署：

1. 推送代码到 GitHub
2. 自动触发构建和部署
3. 网站自动更新

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 网站: [cgartlab.com](https://cgartlab.com)
- 邮箱: info@cgartlab.com

---

*本项目由 [CG艺术实验室](https://cgartlab.com) 维护*