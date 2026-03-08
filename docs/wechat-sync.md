# 微信公众号同步功能配置指南

## 功能说明

本功能可以将网站文章自动同步到微信公众号草稿箱并发布。支持：
- 单篇同步或批量同步
- 自动提取文章封面图片
- Markdown 转 HTML
- 草稿文章过滤
- 预演模式（不实际执行）

## 配置步骤

### 1. 获取微信公众号 API 凭证

1. 登录 [微信公众号平台](https://mp.weixin.qq.com/)
2. 进入「设置与开发」>「基本配置」
3. 启用"开发者密码"，获取 **AppID** 和 **AppSecret**
4. 配置 **IP 白名单**（添加你运行同步脚本的服务器 IP）

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的凭证：

```env
WECHAT_APP_ID=wx6bf7b8586719dbe7
WECHAT_APP_SECRET=你的 AppSecret
WECHAT_SYNC_ENABLED=true
```

**重要：** `.env` 文件已被加入 `.gitignore`，不会被提交到 Git 仓库

### 3. 使用同步脚本

#### 同步最近 7 天的文章（默认）
```bash
pnpm sync-to-wechat
```

#### 同步所有文章
```bash
pnpm sync-to-wechat --all
```

#### 同步最近 30 天的文章
```bash
pnpm sync-to-wechat --recent 30
```

#### 同步指定文章
```bash
pnpm sync-to-wechat --post weekly-01
```

#### 预演模式（不实际执行）
```bash
pnpm sync-to-wechat --dry-run
```

#### 查看帮助
```bash
pnpm sync-to-wechat --help
```

## 同步流程

1. 读取文章（Markdown 格式）
2. 转换为 HTML
3. 提取第一张图片作为封面
4. 上传封面到微信素材库
5. 创建草稿
6. 发布草稿
7. 检查发布状态

## 注意事项

1. **IP 白名单**：确保运行脚本的服务器 IP 已添加到公众号后台的 IP 白名单
2. **access_token 限制**：access_token 有调用次数限制，脚本会自动缓存（有效期 2 小时）
3. **封面图片**：建议使用高质量图片，微信会压缩处理
4. **内容审核**：发布后的文章需要经过微信内容审核
5. **推荐机制**：通过 API 发布的文章不会触发微信推荐算法，也不显示在公众号主页，适合通过菜单或链接分享

## API 文档参考

- [获取 access_token](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)
- [新增永久素材](https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Adding_Permanent_Assets.html)
- [新建草稿](https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Add_draft.html)
- [发布接口](https://developers.weixin.qq.com/doc/offiaccount/Publish/Publish.html)

## 故障排查

### 错误 40164: invalid ip
- 原因：服务器 IP 未添加到白名单
- 解决：在公众号后台添加当前服务器出口 IP

### 错误 40001: invalid credential
- 原因：AppSecret 错误或已重置
- 解决：检查 AppSecret 配置，必要时重新生成

### 错误 42001: access_token expired
- 原因：access_token 过期
- 解决：脚本会自动刷新，如持续报错请检查网络

### 封面图片上传失败
- 原因：图片格式不支持或太大
- 解决：使用 JPG/PNG 格式，大小不超过 5MB

## 自动化部署（可选）

### GitHub Actions 自动同步

创建 `.github/workflows/wechat-sync.yml`：

```yaml
name: Sync to Wechat

on:
  push:
    branches: [main]
    paths: ['src/content/posts/**']

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - name: Sync to Wechat
        env:
          WECHAT_APP_ID: ${{ secrets.WECHAT_APP_ID }}
          WECHAT_APP_SECRET: ${{ secrets.WECHAT_APP_SECRET }}
          WECHAT_SYNC_ENABLED: true
        run: pnpm sync-to-wechat --recent 7
```

在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加：
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`

## 技术实现

- **API 封装**: `src/utils/wechat/api.ts`
- **配置管理**: `src/utils/wechat/config.ts`
- **同步逻辑**: `src/utils/wechat/sync.ts`
- **CLI 脚本**: `scripts/sync-to-wechat.ts`

## 未来计划

- [ ] 支持定时自动同步
- [ ] 支持自定义封面图片
- [ ] 支持文章摘要自动提取
- [ ] 支持留言区管理
- [ ] 支持用户消息自动回复
- [ ] 支持素材库管理
