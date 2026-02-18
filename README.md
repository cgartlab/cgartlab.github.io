# CG艺术实验室

> 基于 Astro 构建的静态网站，专注于数字艺术、动态视觉设计、技术分享和知识管理

## ✨ 项目特色

- 🎨 现代化设计，支持明暗主题
- 📱 响应式布局，适配多设备
- 🌐 中英文双语支持
- ⚡ 极速性能，SEO 优化
- 📖 支持博客、作品、周刊等内容
- 💬 集成 Giscus 评论系统

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Astro | ^5.16.15 | 静态站点生成器 |
| TypeScript | ~5.9.3 | 类型安全 |
| UnoCSS | ^0.62.4 | 原子化 CSS |
| MDX | ^4.3.13 | Markdown 增强 |
| KaTeX | ^0.16.27 | 数学公式渲染 |

## 📁 项目结构

```text
cgartlab.github.io/
├── public/                   # 静态资源
├── src/
│   ├── components/          # 可复用组件
│   ├── content/             # 内容集合
│   │   ├── posts/           # 博客文章
│   │   ├── weekly/          # 玄光周刊
│   │   └── works/           # 作品展示
│   ├── i18n/                # 国际化配置
│   ├── layouts/             # 页面布局
│   ├── pages/               # 路由页面
│   └── config.ts            # 主题配置
├── astro.config.ts          # Astro 配置
└── package.json             # 依赖配置
```

## � 快速开始

### 环境要求

- Node.js 18.0.0+
- pnpm (推荐)

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

访问 <http://localhost:4321> 查看网站

## ✍️ 内容创作

### 内容类型

| 类型 | 目录 | 说明 |
|------|------|------|
| 博客文章 | `src/content/posts/` | 技术文章、教程分享 |
| 玄光周刊 | `src/content/weekly/` | 每周技术动态 |
| 作品展示 | `src/content/works/` | 个人作品、项目展示 |

### 文章元数据

```yaml
---
title: "文章标题"
published: "2025-01-01"
description: "文章描述"
tags: ["标签1", "标签2"]
draft: false
---
```

### 创建新文章

```bash
pnpm new-post 文章名称
```

## 🌐 多语言支持

支持简体中文、繁体中文、英文、日文、俄文、西班牙文。语言配置位于 `src/i18n/ui.ts`。

## 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages。推送代码到 `main` 分支即可触发自动部署。

## 📄 许可证

- **内容**：[CC BY-NC-SA 4.0](LICENSE) - 署名-非商业性使用-相同方式共享
- **代码**：[MIT License](LICENSE)

## 📞 联系方式

- **网站**：[cgartlab.com](https://cgartlab.com)
- **GitHub**：[github.com/cgartlab](https://github.com/cgartlab)
- **邮箱**：<cgartlab@outlook.com>
- **问题反馈**：[GitHub Issues](https://github.com/cgartlab/cgartlab.github.io/issues)

## 致谢

- [Astro](https://astro.build) - 静态站点生成器
- [UnoCSS](https://unocss.dev) - 原子化 CSS 引擎
- [Retypeset Theme](https://github.com/radishzzz/astro-theme-retypeset) - 博客主题

---

*本项目由 [CG艺术实验室](https://cgartlab.com) 团队维护*
