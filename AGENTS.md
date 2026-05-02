# AGENTS.md

## 核心工作原则
- **遇到问题先查官方文档**：在实施任何配置/迁移/新功能前，优先查阅相关项目的官方文档（Cloudflare, Astro, GitHub Actions 等），基于文档而非猜测制定计划
- **一次只改一个东西**：每次修改后等待验证，确认通过后再进行下一步

## 构建与开发命令
- **开发**: `pnpm dev` (执行 `astro check && astro dev`)
- **构建**: `pnpm build` (完整流程: `astro check` → `astro build` → `tsx scripts/generate-llms.ts` → `pnpm apply-lqip`)
- **预览**: `pnpm preview`
- **检查**: `pnpm lint` (eslint .), `pnpm lint:fix` (自动修复)
- **内容脚本**:
  - `pnpm new-post "标题"`: 创建新文章（周刊文章自动放入 `weekly/` 子目录）
  - `pnpm format-posts`: CJK 文本格式化
  - `pnpm apply-lqip`: 生成图片 LQIP 占位符
  - `pnpm update-theme`: 更新主题
- **提交前检查**: `simple-git-hooks` 触发 `lint-staged`，自动修复 `.js/.ts/.astro` 文件

## 关键约束
- `astro.config.ts`: `trailingSlash: 'always'` **严禁修改**
- `src/assets/` 中的 LQIP 映射是自动生成的，**不要手动编辑**
- 包管理器: pnpm 10.33.0（由 `package.json` 的 `packageManager` 字段强制）
- `.env` (不提交): `GOOGLE_ADSENSE_PUBLISHER_ID` (AdSense 发布商 ID)
- ESLint 忽略 `src/content/**` 目录

## 内容管理
### 普通文章
- **位置**: `src/content/posts/`，图片放在文章同级的 `_images/` 文件夹
- **前置信息**:
  - 必需: `title`, `published` (日期)
  - 可选: `description`, `updated`, `tags`, `draft` (默认 false), `pin` (0-99), `toc`, `lang` (zh/en/zh-tw), `abbrlink`
- **双语文章**: 英文版使用 `-en` 后缀（如 `文章.md` + `文章-en.md`）

### 周刊文章规范
- **位置**: `src/content/posts/weekly/`，必须添加 `周刊` 标签（自动从普通文章列表排除）
- **命名**: `[主题] - No.XX 玄光周刊.md`，双语版加 `-en` 后缀
- **必需前置信息**:
  ```yaml
  title: [主题] - No.XX 玄光周刊
  published: YYYY-MM-DD
  tags: [周刊]
  lang: zh | en
  abbrlink: weekly-XX
  draft: false
  pin: 0
  toc: true
  ```
- **标准结构** (参考 No.16 期):
  1. 封面图 + 1 句封面拍摄说明
  2. 固定「关于玄光周刊」说明块
  3. 主题内容: `## 本期主题：[主题]` + 3-5 个小节
  4. `## 本期推荐`: 5-7 个工具/资源，含图片、链接、创作者视角分析
  5. 可选 `## 配饭视频`
  6. `## 尾巴和预告`: 作者笔记 + 下期预告
  7. 页脚: 周刊网站和主站链接
- **风格**: 对话式第一人称，单期≤2000 字，聚焦数字艺术/视觉设计/个人知识管理

## 国际化
- 支持语言: `zh` (默认), `en`, `zh-tw`
- URL 结构: `/` (中文), `/en/`, `/zh-tw/`
- 配置: `src/i18n/config.ts` (语言映射), `src/config.ts` (主题配置)

## CI/CD
- 触发: 推送到 `main` 分支
- Workers Builds（Cloudflare）：通过 Cloudflare 自动构建和部署，Node.js 24, pnpm 10.33.0
- 构建: `pnpm build`，部署到 Cloudflare Worker（静态资源托管）
- 自定义域名: cgartlab.com（通过 Cloudflare DNS）

## Obsidian CLI 集成

### 安装
从 https://obsidian.md/cli 下载或通过包管理器安装。

### 常用命令
```bash
# 帮助和 TUI
obsidian help
obsidian

# 周刊写作
# 周刊写作规范见上文「内容管理 > 周刊文章规范」
# 素材搜索
obsidian search query="周刊"
obsidian tags counts

# 文件操作
obsidian create name="笔记" content="# 内容"
obsidian read file="笔记"
obsidian append file="笔记" content="文本"
obsidian search query="关键词"

# 任务
obsidian tasks
obsidian tasks status=incomplete
obsidian task toggle file="笔记" line=3

# 标签和属性
obsidian tags counts
obsidian property:set file="笔记" property=status value=done

# 链接
obsidian backlinks file="笔记"
obsidian links file="笔记"
obsidian unresolved
obsidian orphans

# 历史
obsidian history file="笔记"
obsidian history:restore file="笔记" version=3

# 数据库
obsidian bases
obsidian base:query base="数据库" format=json

# 开发者
obsidian devtools
obsidian eval code="app.vault.getFiles().length"
obsidian plugin:reload id="插件"
obsidian dev:screenshot file=截图.png

# 指定保险库
obsidian vault="我的保险库" search query="关键词"
```

### 参数格式
- 使用 `key=value` 语法
- 含空格的值用引号: `content="hello world"`
- 标志: `silent`, `--copy`, `--total`
- 默认操作最近聚焦的保险库，使用 `vault=` 指定

### 文档
完整参考: https://help.obsidian.md/cli
