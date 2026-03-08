# 微信公众号同步功能

## 快速开始

### 1. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的微信公众号凭证：

```env
WECHAT_APP_ID=wx6bf7b8586719dbe7
WECHAT_APP_SECRET=你的 AppSecret
WECHAT_SYNC_ENABLED=true
```

### 2. 配置微信公众号后台

1. 登录 [微信公众号平台](https://mp.weixin.qq.com/)
2. 进入「设置与开发」>「基本配置」
3. 启用"开发者密码"，获取 AppID 和 AppSecret
4. 配置 **IP 白名单**（添加你的服务器 IP 或本地 IP）

### 使用方式

```bash
# 同步最近 7 天的文章
pnpm sync-to-wechat

# 同步所有文章
pnpm sync-to-wechat --all

# 同步最近 30 天
pnpm sync-to-wechat --recent 30

# 同步指定文章
pnpm sync-to-wechat --post weekly-01

# 查看同步状态
pnpm sync-to-wechat --status

# 强制重新同步（即使已同步过）
pnpm sync-to-wechat --force

# 预演模式（不实际执行）
pnpm sync-to-wechat --dry-run

# 查看帮助
pnpm sync-to-wechat --help
```

## 功能特性

- ✅ 自动将 Markdown 文章转换为 HTML
- ✅ 自动提取文章第一张图片作为封面
- ✅ 支持单篇同步和批量同步
- ✅ 草稿文章自动过滤
- ✅ 预演模式，安全测试
- ✅ 详细的日志输出
- ✅ **智能去重**：自动检测中英文版本，优先同步中文
- ✅ **状态追踪**：记录已同步文章，避免重复发布
- ✅ **强制同步**：支持 --force 重新同步已发布文章

## 注意事项

1. **IP 白名单**：必须将运行脚本的 IP 添加到公众号后台
2. **access_token 限制**：自动缓存，有效期 2 小时
3. **内容审核**：发布后的文章需要微信审核
4. **推荐机制**：API 发布的文章不触发微信推荐，适合菜单/链接分享

## 详细文档

查看 [docs/wechat-sync.md](docs/wechat-sync.md) 获取完整配置指南和故障排查。
