# CG艺术实验室项目上下文

## 项目概述

CG艺术实验室（cgartlab.github.io）是一个基于 Astro 构建的静态博客网站，专注于计算机图形艺术和生产力工具等技术分享。该项目使用 Astro v5.16.15、TypeScript、UnoCSS 等现代技术栈构建，具有现代化设计、响应式布局、多语言支持等特性。

## 技术栈

- **Astro** ^5.16.15 - 静态站点生成器
- **TypeScript** ~5.9.3 - 类型安全
- **UnoCSS** ^0.62.4 - 原子化 CSS
- **MDX** ^4.3.13 - Markdown + JSX
- **KaTeX** ^0.16.27 - 数学公式渲染
- **ESLint** - 代码质量检查
- **pnpm** - 包管理器

## 项目结构

```
cgartlab.github.io/
├── .astro/                    # Astro 缓存和配置
├── .github/                   # GitHub 配置和工作流
├── dist/                     # 构建输出目录
├── public/                   # 静态资源
├── src/
│   ├── components/          # 可复用的 Astro 组件
│   ├── content/             # 内容集合
│   │   ├── about/           # 关于页面
│   │   ├── posts/           # 博客文章
│   │   ├── weekly/          # 玄光周刊
│   │   └── works/           # 作品展示
│   ├── i18n/                # 国际化配置
│   ├── layouts/             # 页面布局
│   ├── pages/               # 路由页面
│   ├── plugins/             # Markdown 插件
│   ├── styles/              # 全局样式
│   ├── utils/               # 工具函数
│   ├── types/               # TypeScript 类型定义
│   ├── config.ts            # 主题配置文件
│   ├── content.config.ts    # 内容集合配置
│   └── env.d.ts             # 环境类型声明
├── scripts/                 # 脚本工具
├── astro.config.ts          # Astro 配置文件
├── package.json             # 项目依赖配置
├── tsconfig.json            # TypeScript 配置
├── uno.config.ts            # UnoCSS 配置
├── eslint.config.mjs        # ESLint 配置
└── IMPLEMENTATION_SUMMARY.md # 项目实现总结
```

## 主要配置文件

### astro.config.ts
- 集成了 UnoCSS、MDX、Partytown、Sitemap、Compress 等插件
- 配置了 Markdown 处理（包括数学公式、Mermaid 图表、代码复制按钮等）
- 设置了国际化支持

### src/config.ts
- 包含站点信息（标题、描述、URL等）
- 颜色主题配置（浅色/深色模式）
- 全局设置（语言、字体样式、日期格式等）
- 评论系统配置（Giscus、Twikoo、Waline）
- SEO 设置（Google Analytics、验证代码等）
- 页脚设置（社交链接、起始年份等）

### src/content.config.ts
- 定义了内容集合（posts、about、weekly）
- 使用 Zod 进行内容验证
- 配置了内容加载器

### uno.config.ts
- UnoCSS 配置文件
- 定义了颜色主题、字体族、快捷方式等

## 内容管理系统

### 内容类型

| 类型         | 目录                     | 用途                   |
| ------------ | ------------------------ | ---------------------- |
| **博客文章** | `src/content/posts/`     | 技术文章、教程分享     |
| **玄光周刊** | `src/content/weekly/`    | 每周技术动态、资源推荐 |
| **作品展示** | `src/content/works/`     | 个人作品、项目展示     |
| **使用指南** | `src/content/guides/`    | 软件使用、工作流程     |
| **关于页面** | `src/content/about/`     | 个人介绍、联系方式     |

### 内容格式规范

每篇内容使用 Markdown 或 MDX 格式，并包含 YAML frontmatter：

```yaml
---
title: "文章标题"
published: "2025-01-01"     # 发布日期 (必填)
updated: "2025-01-15"       # 最后更新日期 (可选)
description: "文章描述"     # 自动摘要或手动指定 (可选)
tags: ["标签1", "标签2"]     # 标签列表 (可选)
draft: false                # 是否为草稿 (默认: false)
pin: 0                      # 置顶权重 (0-99，默认: 0)
toc: true                   # 是否显示目录 (默认: true)
lang: zh                    # 语言代码 (可选)
abbrlink: custom-link       # 自定义永久链接 (可选)
---
```

## 多语言支持

- 支持简体中文（zh）、繁体中文（zh-tw）、英文（en）等多种语言
- 语言配置位于 `src/i18n/ui.ts` 文件中
- 通过 Astro 的 i18n 功能实现路由和内容的多语言支持

## 构建和开发命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm check

# 清理构建缓存
pnpm clean

# 创建新文章
pnpm new-post 文章名称
```

## 特殊功能

### 友链页面
- 位于 `src/pages/[...lang]/links.astro`
- 使用 `src/data/links.ts` 中的数据
- 包含 `LinkCard.astro` 和 `LinksList.astro` 组件
- 支持多语言和分类展示

### 扩展功能
- 数学公式渲染（KaTeX）
- Mermaid 图表支持
- 代码块复制按钮
- 图片懒加载和 LQIP
- 容器指令（note、tip、warning、danger）
- 视频嵌入（YouTube、Bilibili）
- X 推文嵌入
- 语义化 HTML 和无障碍访问

## 部署

- 使用 GitHub Actions 自动部署到 GitHub Pages
- 构建结果输出到 `dist` 目录
- 支持自定义域名配置

## 许可证

- 内容采用 CC BY-NC-SA 4.0 许可证
- 代码采用 MIT 许可证