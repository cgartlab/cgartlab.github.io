# CG艺术实验室

> 基于 Astro 构建的静态博客网站，专注于计算机图形艺术和生产力工具等技术分享

## ✨ 项目特色

- 🎨 现代化设计，支持明暗主题
- 📱 响应式布局，适配多设备
- 🌐 中英文双语支持
- ⚡ 极速性能，SEO 优化
- 📖 支持博客、作品、周刊等内容
- 💬 集成 Giscus 评论系统

## 🛠️ 技术栈

- **Astro** ^5.16.15 - 静态站点生成器
- **TypeScript** ~5.9.3 - 类型安全
- **UnoCSS** ^0.62.4 - 原子化 CSS
- **MDX** ^4.3.13 - Markdown + JSX
- **KaTeX** ^0.16.27 - 数学公式渲染

## 📁 项目结构

``` shell
cgartlab.github.io/
├── .astro/                    # Astro 缓存和配置
├── .github/                   # GitHub 配置和工作流
│   ├── workflows/            # CI/CD 工作流
│   ├── ISSUE_TEMPLATE/       # Issue 模板
│   └── FUNDING.yml           # 赞助配置
├── dist/                     # 构建输出目录
├── public/                   # 静态资源
│   ├── feeds/               # RSS/Atom 样式表
│   ├── fonts/               # 字体文件
│   ├── giscus/              # Giscus 评论系统样式
│   ├── icons/               # 网站图标
│   ├── images/              # 图片资源
│   ├── og/                  # Open Graph 图片
│   ├── sounds/              # 音频资源
│   ├── favicon.ico          # 网站图标
│   └── robots.txt           # 搜索引擎爬虫配置
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
├── .gitignore               # Git 忽略文件配置
├── astro.config.ts          # Astro 配置文件
├── package.json             # 项目依赖配置
├── pnpm-lock.yaml           # pnpm 锁文件
├── tsconfig.json            # TypeScript 配置
├── uno.config.ts            # UnoCSS 配置
├── eslint.config.mjs        # ESLint 配置
└── IMPLEMENTATION_SUMMARY.md # 项目实现总结
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
   ```

3. **启动开发服务器**

   ```bash
   pnpm dev
   ```

   访问 <http://localhost:4321> 查看网站

4. **构建生产版本**

   ```bash
   pnpm build
   ```

5. **预览构建结果**

   ```bash
   pnpm preview
   ```

### 开发脚本

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

# 构建并生成站点地图
pnpm build:sitemap
```

### 开发工具配置

推荐使用以下开发工具：

- **编辑器**: VS Code
- **插件**: Astro、TypeScript、Tailwind CSS IntelliSense
- **浏览器**: Chrome DevTools 用于调试

## ✍️ 内容创作

### 内容类型

| 类型         | 目录                     | 用途                   | 示例                       |
| ------------ | ------------------------ | ---------------------- | -------------------------- |
| **博客文章** | `src/content/posts/`     | 技术文章、教程分享     | 3D建模技巧、渲染优化       |
| **玄光周刊** | `src/content/weekly/`    | 每周技术动态、资源推荐 | CG行业新闻、工具更新       |
| **作品展示** | `src/content/works/`     | 个人作品、项目展示     | 3D模型、渲染作品           |
| **使用指南** | `src/content/guides/`    | 软件使用、工作流程     | Blender教程、Substance指南 |
| **关于页面** | `src/content/about/`     | 个人介绍、联系方式     | 实验室介绍、团队成员       |
| **内容模板** | `src/content/templates/` | 内容创建模板           | 各类内容的标准模板         |

### 创建新内容

1. **使用脚本创建**

   ```bash
   # 使用脚本创建新文章
   pnpm new-post 文章名称
   
   # 创建指定路径的文章
   pnpm new-post 2025/03/文章名称
   ```

2. **编辑元数据**

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

3. **编写内容** - 使用 Markdown 语法和扩展功能

### 内容格式规范

#### 基本 Markdown 语法

- **标题**: `# H1`、`## H2`、`### H3`
- **强调**: `**粗体**`、`*斜体*`、`~~删除线~~`
- **列表**: `- 项目`、`1. 编号`
- **代码**: \`行内代码\`、\`\`\`语言\n代码\n\`\`\`
- **链接**: `[文本](链接)`、`![图片](图片链接)`

#### 扩展功能

- **容器指令**: `:::note`、`:::tip`、`:::warning`、`:::danger`
- **折叠内容**: `:::details[标题]`
- **GitHub仓库卡片**: `::github{repo="owner/repo"}`
- **视频嵌入**: `::youtube{id="视频ID"}` 和 `::bilibili{id="BV号"}`
- **X推文**: `::tweet{url="推文链接"}`
- **数学公式**: `$行内公式$` 和 `$$块级公式$$`
- **图表**: 使用 Mermaid 语法 ````mermaid\n图表代码\n````

#### 图片和资源

- 图片放在 `public/images/` 目录
- 使用相对路径引用：`/images/图片名称.jpg`
- 支持 LQIP (低质量图片占位符) 技术优化加载体验

## 🌐 多语言支持

### 支持的语言

| 语言     | 代码    | 默认 | 说明         |
| -------- | ------- | ---- | ------------ |
| 简体中文 | `zh`    | ✅    | 主要语言     |
| 繁体中文 | `zh-tw` | ❌    | 繁体中文版本 |
| 英文     | `en`    | ❌    | 国际版本     |
| 日文     | `ja`    | ❌    | 日文版本     |
| 俄文     | `ru`    | ❌    | 俄文版本     |
| 西班牙文 | `es`    | ❌    | 西班牙文版本 |

### 语言配置

语言配置位于 `src/i18n/ui.ts` 文件中，可以根据需要添加更多语言支持。

### 多语言内容创建

创建多语言内容时，可以在 Frontmatter 中指定语言：

```yaml
---
title: "文章标题"
published: "2025-01-01"
lang: en  # 指定语言代码
---
```

或者使用文件名后缀方式：

- `文章名称.zh.md` - 简体中文版本
- `article-name.en.md` - 英文版本

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

| 类型           | 地址                           | 说明               |
| -------------- | ------------------------------ | ------------------ |
| **RSS 2.0**    | `/rss.xml`                     | 标准 RSS 订阅源    |
| **Atom 1.0**   | `/atom.xml`                    | Atom 格式订阅源    |
| **多语言 RSS** | `/[lang]/rss.xml`              | 按语言分类的订阅源 |
| **分类订阅**   | `/category/[category]/rss.xml` | 按分类订阅         |

### 订阅配置

订阅源包含以下信息：

- 最新文章标题和描述
- 发布日期和更新时间
- 作者信息
- 文章分类和标签

## 📱 部署指南

### GitHub Pages 部署

本项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. **配置仓库设置**
   - 进入仓库 Settings → Pages
   - 选择 "GitHub Actions" 作为部署源
   - 选择 "Astro" 工作流进行部署

2. **自动部署流程**
   - 推送代码到 `main` 分支时自动触发构建
   - 构建结果部署到 GitHub Pages
   - 支持自定义域名配置

### 手动部署

如需手动部署到其他平台：

1. **构建项目**

   ```bash
   pnpm build
   ```

2. **部署构建结果**
   - 将 `dist` 目录内容上传到静态网站托管服务
   - 配置正确的 base URL 和路由规则

### 环境变量配置

如需配置环境变量，创建 `.env` 文件：

```bash
# 评论系统配置
PUBLIC_GISCUS_REPO=
PUBLIC_GISCUS_REPO_ID=
PUBLIC_GISCUS_CATEGORY_ID=
PUBLIC_GISCUS_CATEGORY=

# 分析工具配置
PUBLIC_GOOGLE_ANALYTICS_ID=

# 社交媒体配置
PUBLIC_TWITTER_USERNAME=
PUBLIC_GITHUB_USERNAME=

# 站点配置
PUBLIC_SITE_URL=
```

## 📄 许可证

本项目采用双重许可证策略：

### 内容许可

**文章内容、设计作品、图片等创意内容**采用 [知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议](LICENSE) (CC BY-NC-SA 4.0)

**许可条款 (CC BY-NC-SA 4.0):**

- ✅ **署名 (BY)** - 必须注明原作者和来源
- ✅ **非商业性 (NC)** - 禁止商业用途
- ✅ **相同方式共享 (SA)** - 衍生作品必须采用相同许可
- ✅ **允许** - 分享、修改、重新分发（需遵守上述条件）
- ❌ **禁止** - 未经许可的商业使用

### 代码许可

**主题代码、脚本、配置等软件部分**采用 [MIT License](LICENSE)

**许可条款 (MIT):**

- ✅ **允许** - 商业使用、修改、分发、私人使用
- ✅ **要求** - 包含许可证和版权声明
- ✅ **允许** - 专利使用
- ❌ **不提供** - 责任担保

### 使用说明

- **引用内容时**：请注明来源 "CG艺术实验室" 并链接到原文章
- **修改或衍生作品**：必须采用相同的 CC BY-NC-SA 4.0 许可
- **商业用途**：请联系作者获取商业授权

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 贡献方式

1. **报告问题** - 提交 [Issue](https://github.com/cgartlab/cgartlab.github.io/issues)
2. **修复问题** - 提交 Pull Request
3. **改进文档** - 完善 README 和文档
4. **翻译内容** - 帮助翻译多语言内容
5. **创作内容** - 提交原创技术文章

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

| 平台         | 地址                                               | 用途     |
| ------------ | -------------------------------------------------- | -------- |
| **官方网站** | [cgartlab.com](https://cgartlab.com)               | 主要网站 |
| **GitHub**   | [github.com/cgartlab](https://github.com/cgartlab) | 代码仓库 |
| **邮箱**     | <info@cgartlab.com>                                | 业务联系 |

### 社交媒体

- **Twitter**: [@cgartlab](https://twitter.com/cgartlab)
- **Instagram**: [@cgartlab](https://instagram.com/cgartlab)
- **YouTube**: [CG艺术实验室](https://youtube.com/@cgartlab)

### 技术支持

- **文档**: [docs.cgartlab.com](https://docs.cgartlab.com)
- **社区**: [community.cgartlab.com](https://community.cgartlab.com)
- **问题反馈**: [GitHub Issues](https://github.com/cgartlab/cgartlab.github.io/issues)

## 📈 项目状态

| 指标           | 状态       | 说明                      |
| -------------- | ---------- | ------------------------- |
| **开发状态**   | 🟢 活跃开发 | 持续更新和维护            |
| **版本**       | v1.0.0     | 稳定版本                  |
| **主题**       | Retypeset  | 基于 Astro 的静态博客主题 |
| **文档完整性** | 95%        | 完善的文档和示例          |

### 链接管理

链接数据存储在 `src/data/links.ts` 文件中，使用 TypeScript 接口定义：

```typescript
export interface LinkItem {
  title: string
  description?: string
  url: string
  icon?: string
  category?: string
}
```

### 添加新链接

如需添加新的链接，可在对应语言和分类中添加新条目：

```typescript
{
  title: '链接标题',
  description: '链接描述',
  url: 'https://example.com',
  icon: 'https://example.com/favicon.ico',
}
```

## 🙏 致谢

感谢以下开源项目和社区的支持：

- [Astro](https://astro.build) - 优秀的静态站点生成器
- [UnoCSS](https://unocss.dev) - 高性能原子化 CSS 引擎
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [Vercel](https://vercel.com) - 优秀的部署平台
- [Retypeset Theme](https://github.com/radishzzz/astro-theme-retypeset) - 优秀的 Astro 博客主题

---

*本项目由 [CG艺术实验室](https://cgartlab.com) 团队维护，致力于推动数字艺术和个人创作的发展。*

最后更新: 2026年1月
