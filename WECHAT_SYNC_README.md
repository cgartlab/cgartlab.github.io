# 微信公众号同步功能使用指南

## 功能概述

本功能可将博客文章自动转换为适合微信阅读的格式，并同步到微信公众号后台生成草稿。

## 核心特性

### 1. Markdown 转微信 HTML
- ✅ 微信绿色主题 (#07c160)
- ✅ 适合手机阅读的字体大小 (16px)
- ✅ 舒适的行距 (1.75)
- ✅ 完整的样式系统（标题、列表、代码块、表格、引用等）
- ✅ 响应式图片适配
- ✅ 代码语法高亮支持

### 2. 自动化同步流程
1. 解析 Markdown 文章的 frontmatter
2. 转换 Markdown 为微信风格 HTML
3. 提取文章第一张图作为封面（或生成默认封面）
4. 上传封面图片到微信素材库
5. 创建草稿到微信公众号后台
6. 发布草稿（可选）
7. 检查发布状态
8. 保存同步记录

### 3. 灵活的同步策略
- 单篇文章同步
- 批量同步（最近 N 天/全部）
- 预演模式（不实际执行）
- 强制重新同步
- 多语言文章处理（优先中文）
- 避免重复同步

## 配置步骤

### 1. 获取微信公众号凭证

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入 **开发** -> **基本配置**
3. 获取以下信息：
   - `AppID(应用 ID)`
   - `AppSecret(应用密钥)`

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 微信公众号配置
WECHAT_APP_ID=wx1234567890abcdef    # 替换为你的 AppID
WECHAT_APP_SECRET=your_secret_here   # 替换为你的 AppSecret
WECHAT_SYNC_ENABLED=true             # 启用同步功能
```

### 3. 安装依赖

```bash
npm install
# 或
pnpm install
```

## 使用方法

### 基础命令

```bash
# 查看帮助
pnpm sync-to-wechat --help

# 同步最近 7 天的文章（默认）
pnpm sync-to-wechat

# 同步所有文章
pnpm sync-to-wechat --all

# 同步最近 30 天的文章
pnpm sync-to-wechat --recent 30

# 同步指定文章
pnpm sync-to-wechat --post 2024-elegant-use-windows

# 查看同步状态
pnpm sync-to-wechat --status

# 预演模式（不实际执行同步）
pnpm sync-to-wechat --dry-run

# 强制重新同步已同步过的文章
pnpm sync-to-wechat --force
```

### 命令选项说明

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--all` | 同步所有文章 | false |
| `--recent <n>` | 同步最近 n 天的文章 | 7 |
| `--post <slug>` | 同步指定文章（slug 为文章路径，不含.md） | - |
| `--force` | 强制重新同步已同步过的文章 | false |
| `--status` | 查看同步状态统计 | - |
| `--dry-run` | 预演模式，不实际执行同步 | false |
| `--help` | 显示帮助信息 | - |

### 使用示例

#### 示例 1：同步最新文章
```bash
# 同步最近一周内发布的文章
pnpm sync-to-wechat
```

输出示例：
```
=== 微信公众号文章同步工具 ===

同步文章（最近 7 天）
找到 3 篇需要同步的文章
准备同步文章：2024 年，如何优雅使用 WindowsPC
封面图片上传成功，media_id: xxxxxx
草稿创建成功，media_id: yyyyyy
文章发布成功，publish_id: zzzzzz
✓ 同步成功：2024 年，如何优雅使用 WindowsPC

同步完成：3 成功，0 失败
```

#### 示例 2：同步指定文章
```bash
pnpm sync-to-wechat --post 2024-elegant-use-windows
```

#### 示例 3：查看同步历史
```bash
pnpm sync-to-wechat --status
```

输出示例：
```
=== 微信公众号同步状态 ===
总同步文章数：15 篇
最后同步时间：2025-01-15 10:30:00

最近同步的文章:
  - 2024 年，如何优雅使用 WindowsPC
    同步时间：2025-01-15 10:30:00
    publish_id: 1234567890
```

#### 示例 4：预演模式
```bash
# 先预演看看会同步哪些文章
pnpm sync-to-wechat --all --dry-run
```

## 技术实现

### 模块结构

```
src/utils/wechat/
├── api.ts              # 微信 API 封装
├── config.ts           # 配置管理
├── markdown-to-wechat.ts # Markdown 转换器
├── state.ts            # 同步状态管理
└── sync.ts             # 同步逻辑

scripts/
└── sync-to-wechat.ts   # CLI 入口
```

### 微信 API 调用流程

```
1. getAccessToken()
   └─> 缓存机制，避免频繁请求
   
2. uploadCoverImage()
   └─> 上传封面到素材库，返回 media_id
   
3. createDraft()
   └─> 创建草稿，返回 media_id
   
4. publishDraft()
   └─> 发布草稿，返回 publish_id
   
5. checkPublishStatus()
   └─> 检查发布状态
```

### 样式定制

可以在 `markdown-to-wechat.ts` 中自定义样式：

```typescript
const defaultOptions: Required<WechatStyleOptions> = {
  primaryColor: '#07c160',  // 主题色
  fontSize: '16px',         // 字体大小
  lineHeight: '1.75',       // 行高
  codeTheme: 'light',       // 代码主题 (light/dark)
}
```

## 注意事项

### 1. 微信公众号权限
- 需要已认证的公众号（服务号或订阅号）
- 部分高级接口可能需要额外权限

### 2. 图片要求
- 封面图建议尺寸：900x500 像素
- 支持格式：JPG, PNG, GIF, SVG
- 文件大小：不超过 5MB

### 3. 内容限制
- 标题长度：不超过 64 字节
- 摘要长度：不超过 120 字节
- 正文支持完整 HTML

### 4. API 调用频率
- access_token 有效期：2 小时（已实现缓存）
- 建议批量同步时添加延迟（已实现 1 秒间隔）

### 5. 错误处理
常见错误码：
- `40001`: AppSecret 错误
- `40014`: access_token 无效
- `40007`: 素材 ID 不存在
- `45009`: API 调用频率超限

## 故障排查

### 问题 1：提示"微信公众号同步功能未启用"
**解决**：检查 `.env` 文件中 `WECHAT_SYNC_ENABLED=true`

### 问题 2：提示"缺少 AppID 或 AppSecret"
**解决**：确保 `.env` 文件中正确配置了 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`

### 问题 3：同步失败，错误码 40001
**解决**：检查 AppSecret 是否正确，可在微信公众平台重新生成

### 问题 4：图片上传失败
**解决**：
- 检查图片路径是否正确
- 确保图片文件大小不超过 5MB
- 检查网络连接

### 问题 5：文章找不到
**解决**：
- 确认 slug 是否正确（不含 .md 扩展名）
- 检查文章是否在 `src/content/posts/` 目录下
- 确认文章不是草稿状态（draft: true）

## 最佳实践

### 1. 定期同步
建议在新文章发布后立即同步：
```bash
# 添加到 CI/CD 流程
pnpm build && pnpm sync-to-wechat --recent 1
```

### 2. 使用预演模式
在正式同步前先用 `--dry-run` 确认：
```bash
pnpm sync-to-wechat --all --dry-run
```

### 3. 备份同步记录
同步状态保存在 `.wechat-sync-state.json`，建议定期备份。

### 4. 处理多语言文章
系统会自动检测并优先同步中文版本，如需同步特定语言版本，使用 `--post` 指定具体 slug。

## 进阶用法

### 程序化调用

在代码中直接调用同步函数：

```typescript
import { syncPostToWechat } from './scripts/sync-to-wechat.js'

// 同步单篇文章
const result = await syncPostToWechat('2024-elegant-use-windows', {
  dryRun: false,
  force: false,
})

console.log(result)
// {
//   slug: '2024-elegant-use-windows',
//   title: '2024 年，如何优雅使用 WindowsPC',
//   success: true,
//   publish_id: 'xxxxx',
//   media_id: 'yyyyy'
// }
```

### 自定义样式

```typescript
import { convertMarkdownToWechatHtml } from './src/utils/wechat/markdown-to-wechat.js'

const html = convertMarkdownToWechatHtml(markdown, {
  primaryColor: '#ff6b6b',  // 自定义主题色
  fontSize: '15px',
  lineHeight: '1.8',
  codeTheme: 'dark',
})
```

## 技术支持

如有问题，请检查：
1. 日志输出中的错误信息
2. 微信公众平台的接口调用日志
3. `.wechat-sync-state.json` 中的同步记录

---

**最后更新**: 2025-01-15
**版本**: 1.0.0
