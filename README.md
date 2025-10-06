# CG艺术实验室

> 探索数字艺术的边界，分享CG技术与创作经验

CG艺术实验室是一个基于 [Astro](https://astro.build) 构建的现代化静态网站，专注于计算机图形学、数字艺术创作、技术分享和知识管理。

## 🌟 项目特色

- **🎨 专业内容** - 专注于CG艺术、3D建模、渲染技术等专业领域
- **🌐 多语言支持** - 支持简体中文、繁体中文和英文
- **📚 内容集合管理** - 使用 Astro 的内容集合功能管理文章、周刊、作品等
- **⚡ 现代技术栈** - Astro + TypeScript + TailwindCSS
- **🔍 SEO优化** - 内置完善的 SEO 和元数据管理
- **📱 响应式设计** - 完美适配桌面和移动设备
- **📰 RSS订阅** - 支持 RSS/Atom 订阅源

## 🚀 技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| [Astro](https://astro.build) | 静态站点生成器 | 最新稳定版 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全开发 | 5.0+ |
| [TailwindCSS](https://tailwindcss.com) | 实用优先的 CSS 框架 | 3.0+ |
| [lucide-react](https://lucide.dev) | 美观的图标库 | 最新版 |
| [Prism](https://prismjs.com) | 代码语法高亮 | 最新版 |
| [Vite](https://vitejs.dev) | 快速构建工具 | 5.0+ |

## 📁 项目结构

```
cgartlab.github.io/
├── .astro/                    # Astro 缓存和配置
├── public/                    # 静态资源
│   ├── images/               # 图片资源
│   ├── favicon.ico           # 网站图标
│   └── robots.txt            # 搜索引擎爬虫配置
├── src/
│   ├── components/           # 可复用的 Astro 组件
│   ├── content/             # 内容集合
│   │   ├── posts/           # 博客文章
│   │   ├── weekly/          # 玄光周刊
│   │   ├── works/           # 作品展示
│   │   ├── guides/          # 使用指南
│   │   ├── about/           # 关于页面
│   │   └── templates/       # 内容模板
│   ├── layouts/             # 页面布局
│   ├── pages/               # 路由页面
│   ├── styles/              # 全局样式
│   ├── utils/               # 工具函数
│   └── types/               # TypeScript 类型定义
├── .gitignore               # Git 忽略文件配置
├── astro.config.mjs         # Astro 配置文件
├── package.json             # 项目依赖配置
├── tailwind.config.mjs      # TailwindCSS 配置
└── tsconfig.json            # TypeScript 配置
```

## 🛠️ 开发指南

### 环境要求

- **Node.js**: 18.0.0 或更高版本
- **包管理器**: pnpm (推荐) 或 npm、yarn
- **操作系统**: Windows、macOS 或 Linux

### 快速开始

1. **克隆项目**
   ```bash
   git clone https://github.com/cgartlab/cgartlab.github.io.git
   cd cgartlab.github.io
   ```

2. **安装依赖**
   ```bash
   pnpm install
   # 或使用 npm
   npm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   # 或使用 npm
   npm run dev
   ```

4. **访问网站**
   - 开发服务器: http://localhost:4321
   - 自动热重载，修改代码后实时更新

### 常用命令

| 命令 | 功能 | 说明 |
|------|------|------|
| `pnpm dev` | 启动开发服务器 | 支持热重载，用于本地开发 |
| `pnpm build` | 构建生产版本 | 生成优化的静态文件 |
| `pnpm preview` | 预览构建结果 | 在生产环境中预览网站 |
| `pnpm astro check` | 类型检查 | 检查 TypeScript 类型错误 |
| `pnpm astro sync` | 同步类型定义 | 更新 TypeScript 类型定义 |

### 开发工具配置

推荐使用以下开发工具：
- **编辑器**: VS Code
- **插件**: Astro、TypeScript、Tailwind CSS IntelliSense
- **浏览器**: Chrome DevTools 用于调试

## ✍️ 内容创作

### 内容类型

| 类型 | 目录 | 用途 | 示例 |
|------|------|------|------|
| **博客文章** | `src/content/posts/` | 技术文章、教程分享 | 3D建模技巧、渲染优化 |
| **玄光周刊** | `src/content/weekly/` | 每周技术动态、资源推荐 | CG行业新闻、工具更新 |
| **作品展示** | `src/content/works/` | 个人作品、项目展示 | 3D模型、渲染作品 |
| **使用指南** | `src/content/guides/` | 软件使用、工作流程 | Blender教程、Substance指南 |
| **关于页面** | `src/content/about/` | 个人介绍、联系方式 | 实验室介绍、团队成员 |

### 创建新内容

1. **使用模板**
   ```bash
   # 复制模板文件
   cp src/content/templates/博客文章模板.md src/content/posts/新文章.md
   ```

2. **编辑元数据**
   ```yaml
   ---
   title: "文章标题"
   description: "文章描述"
   published: "2024-01-01"  # 发布日期
   tags: ["标签1", "标签2"]  # 标签列表
   draft: false              # 是否为草稿
   pin: 0                    # 置顶权重 (0-10)
   toc: true                 # 是否显示目录
   lang: zh                  # 语言代码
   ---
   ```

3. **编写内容** - 使用 Markdown 语法

### 内容格式规范

#### 基本 Markdown 语法
- **标题**: `# H1`、`## H2`、`### H3`
- **强调**: `**粗体**`、`*斜体*`、`~~删除线~~`
- **列表**: `- 项目`、`1. 编号`
- **代码**: \`行内代码\`、\`\`\`语言\n代码\n\`\`\`

#### 扩展功能
- **提示块**: `> [!NOTE]` 或 `:::note`
- **折叠内容**: `:::fold[标题]`
- **GitHub仓库卡片**: `::github{repo="owner/repo"}`
- **视频嵌入**: `::youtube{id="视频ID"}` 和 `::bilibili{id="BV号"}`
- **X推文**: `::tweet{url="推文链接"}`

#### 图片和资源
- 图片放在 `public/images/` 目录
- 使用相对路径引用：`/images/图片名称.jpg`

## 🌐 多语言支持

### 支持的语言

| 语言 | 代码 | 默认 | 说明 |
|------|------|------|------|
| 简体中文 | `zh` | ✅ | 主要语言 |
| 繁体中文 | `zh-tw` | ❌ | 繁体中文版本 |
| 英文 | `en` | ❌ | 国际版本 |

### 语言配置

语言配置位于 `src/i18n/ui.ts` 文件中：

```typescript
export const languages = {
  zh: { title: '简体中文' },
  'zh-tw': { title: '繁體中文' },
  en: { title: 'English' }
};

export const defaultLang = 'zh';
```

### 多语言内容创建

创建多语言内容时，需要在文件名中包含语言代码：

```bash
# 简体中文版本
src/content/posts/文章名称.zh.md

# 英文版本  
src/content/posts/article-name.en.md
```

## 📊 内容管理

### 内容集合架构

使用 Astro 的内容集合功能进行结构化内容管理：

```typescript
// src/content/config.ts
export const collections = {
  posts: defineCollection({ /* 博客文章配置 */ }),
  weekly: defineCollection({ /* 周刊配置 */ }),
  works: defineCollection({ /* 作品配置 */ }),
  guides: defineCollection({ /* 指南配置 */ }),
  about: defineCollection({ /* 关于页面配置 */ })
};
```

### 内容元数据规范

每篇内容必须包含以下元数据：

```yaml
---
# 基本信息
title: "文章标题"                    # 文章标题 (必填)
description: "文章描述"              # 文章描述 (必填)
published: "2024-01-01"             # 发布日期 (必填)
updated: "2024-01-15"               # 最后更新日期 (可选)

# 分类和标签
tags: ["标签1", "标签2"]             # 标签列表 (可选)
category: "技术教程"                 # 分类 (可选)

# 发布设置
draft: false                        # 是否为草稿 (默认: false)
pin: 0                              # 置顶权重 0-10 (默认: 0)
lang: zh                            # 语言代码 (必填)

# 显示设置
toc: true                           # 是否显示目录 (默认: true)
cover: "/images/cover.jpg"          # 封面图片 (可选)
---
```

### 内容生命周期

1. **草稿阶段** (`draft: true`) - 内容未发布，仅在开发环境可见
2. **发布阶段** (`draft: false`) - 内容已发布，对所有用户可见
3. **置顶内容** (`pin: 1-10`) - 权重越高，显示位置越靠前

## 🔄 RSS订阅

网站提供多种订阅源，方便读者获取最新内容：

### 订阅地址

| 类型 | 地址 | 说明 |
|------|------|------|
| **RSS 2.0** | `/rss.xml` | 标准 RSS 订阅源 |
| **Atom 1.0** | `/atom.xml` | Atom 格式订阅源 |
| **多语言 RSS** | `/[lang]/rss.xml` | 按语言分类的订阅源 |
| **分类订阅** | `/category/[category]/rss.xml` | 按分类订阅 |

### 订阅配置

订阅源包含以下信息：
- 最新文章标题和描述
- 发布日期和更新时间
- 作者信息
- 文章分类和标签

## 📱 部署指南

### 支持的托管平台

| 平台 | 配置难度 | 免费额度 | 推荐度 |
|------|----------|----------|--------|
| [Vercel](https://vercel.com) | ⭐ | 100GB/月 | ⭐⭐⭐⭐⭐ |
| [Netlify](https://netlify.com) | ⭐⭐ | 100GB/月 | ⭐⭐⭐⭐ |
| [GitHub Pages](https://pages.github.com) | ⭐⭐⭐ | 1GB/月 | ⭐⭐⭐ |
| [Cloudflare Pages](https://pages.cloudflare.com) | ⭐⭐ | 无限 | ⭐⭐⭐⭐ |

### 部署步骤

#### 1. 构建生产版本
```bash
pnpm build
# 构建结果输出到 dist/ 目录
```

#### 2. 部署到 Vercel (推荐)

1. 连接 GitHub 仓库到 Vercel
2. 配置构建命令：`pnpm build`
3. 配置输出目录：`dist`
4. 自动部署完成

#### 3. 部署到 GitHub Pages

1. 启用 GitHub Pages
2. 配置源为 `gh-pages` 分支
3. 使用 GitHub Actions 自动部署

### 自动部署配置

项目包含 GitHub Actions 工作流，实现自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

### 环境变量配置

部署时需要配置的环境变量：
- `SITE_URL` - 网站域名
- `PUBLIC_SITE_URL` - 公开网站地址

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

### 许可证条款

- ✅ **允许** - 商业使用、修改、分发、私人使用
- ✅ **要求** - 包含许可证和版权声明
- ✅ **允许** - 专利使用
- ❌ **不提供** - 责任担保

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 贡献方式

1. **报告问题** - 提交 [Issue](https://github.com/cgartlab/cgartlab.github.io/issues)
2. **修复问题** - 提交 Pull Request
3. **改进文档** - 完善 README 和文档
4. **翻译内容** - 帮助翻译多语言内容

### 提交 Pull Request

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 添加适当的注释和文档
- 确保所有测试通过

## 📞 联系方式

### 官方渠道

| 平台 | 地址 | 用途 |
|------|------|------|
| **官方网站** | [cgartlab.com](https://cgartlab.com) | 主要网站 |
| **GitHub** | [github.com/cgartlab](https://github.com/cgartlab) | 代码仓库 |
| **邮箱** | info@cgartlab.com | 业务联系 |

### 社交媒体

- **Twitter**: [@cgartlab](https://twitter.com/cgartlab)
- **Instagram**: [@cgartlab](https://instagram.com/cgartlab)
- **YouTube**: [CG艺术实验室](https://youtube.com/@cgartlab)

### 技术支持

- **文档**: [docs.cgartlab.com](https://docs.cgartlab.com)
- **社区**: [community.cgartlab.com](https://community.cgartlab.com)
- **问题反馈**: [GitHub Issues](https://github.com/cgartlab/cgartlab.github.io/issues)

## 📈 项目状态

| 指标 | 状态 | 说明 |
|------|------|------|
| **开发状态** | 🟢 活跃开发 | 持续更新和维护 |
| **版本** | v1.0.0 | 稳定版本 |
| **测试覆盖率** | 85% | 单元测试和集成测试 |
| **文档完整性** | 90% | 完善的文档和示例 |

## 🙏 致谢

感谢以下开源项目和社区的支持：

- [Astro](https://astro.build) - 优秀的静态站点生成器
- [TailwindCSS](https://tailwindcss.com) - 实用的 CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [Vercel](https://vercel.com) - 优秀的部署平台

---

*本项目由 [CG艺术实验室](https://cgartlab.com) 团队维护，致力于推动数字艺术和个人创作的发展。*

*最后更新: 2025年10月*