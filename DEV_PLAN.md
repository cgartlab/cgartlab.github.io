# CG艺术实验室 — 开发进度梳理 & 开发计划

> 生成时间：2026-09-18 · 基于 main 分支 + dev-pay 未提交工作

---

## 一、当前项目状态总览

### 1.1 Git 状态

| 项目 | 状态 |
|------|------|
| 当前分支 | `dev-pay`（基于 main） |
| 已提交 | 1 commit（`a4e480ee` feat(shop): add storefront and checkout flow） |
| 未提交修改 | 7 个文件（+541 / -154 行） |
| 未跟踪文件 | 13 个（Shop 组件、样式、脚本、图片等） |
| 远程分支 | `main`、`pr-264`、`pr-265` |
| Open PR | [#414](https://github.com/cgartlab/cgartlab.github.io/pull/414) — 30 项审计修复（待合并） |
| Open Issue | [#415](https://github.com/cgartlab/cgartlab.github.io/issues/415) — LQIP 构建链优化 |

### 1.2 核心里程碑

| 里程碑 | 状态 | 备注 |
|--------|------|------|
| 博客基础功能（文章/标签/搜索/评论） | ✅ 完成 | 159 篇文章，Giscus 评论 |
| 暗色模式 + View Transitions | ✅ 完成 | 含 reduceMotion 降级 |
| Cloudflare Worker + Static Assets | ✅ 完成 | 安全头、缓存头、TG 推送 |
| 可访问性修复（PR #408） | ✅ 已合并 | 触控目标、aria、焦点管理 |
| 术语表 + 搜索索引 | ✅ 完成 | 客户端搜索 + Glossary |
| 第 20 期专栏 | ✅ 已合并 | `write-weekly-no20` |
| **30 项审计修复（PR #414）** | 🔧 待合并 | 5 高危 / 15 中危 / 10 低危 |
| **数字商店（dev-pay）** | 🔧 开发中 | 前端已完成，待后端联调 |
| LQIP 构建链优化（#415） | 📋 待处理 | 构建质量优化 |

---

## 二、dev-pay 分支详细分析

### 2.1 已完成的功能

数字商店（`/shop/`）完整前端实现，包含：

```
/shop/          → 商品列表页（卡片网格 + 分类筛选）
/shop/product/:id/  → 商品详情页（Schema.org Product JSON-LD + 购买表单）
/shop/checkout/  → 收银台（订单状态轮询 + 支付宝/微信 QR 码 + 倒计时）
/shop/download/  → 下载页（token 校验 + 限时下载链接）
```

**已创建文件（未跟踪）：**
- `src/components/Shop/ProductCard.astro` — 商品卡片组件
- `src/pages/[...lang]/shop/product/[id].astro` — 商品详情页
- `src/styles/shop.css` — 商店专属样式（303 行，全 CSS 变量）
- `src/data/products.json` — 构建时 API 拉取的商品数据缓存
- `src/types/shop.ts` — Product / Order / CreateOrderBody 类型定义
- `scripts/fetch-products.ts` — 构建时拉取 `pay.cgartlab.com/api/products`
- `scripts/tmp-checkout-visual.mjs` — Playwright 视觉验证脚本（临时）
- `public/images/Alipay-QR code.jpg` / `WeChat-Pay-QR code.jpg` — 支付码截图
- `checkout-visual.png` — 视觉验证截图

**已修改文件：**
- `package.json` — 新增 `fetch-products` 脚本，build 链加入 `pnpm fetch-products`
- `src/i18n/ui.ts` — 新增 48 条商店 i18n 字符串（en/zh/zh-tw 三语言）
- `src/layouts/Layout.astro` — 引入 `shop.css`
- `src/worker.mjs` — CSP `connect-src` 加入 `https://pay.cgartlab.com`

### 2.2 待完善项

| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 1 | **后端 API 未就绪** | 🔴 阻塞 | `pay.cgartlab.com` 需提供 `/api/products`、`/api/orders`、`/api/orders/:no`、`/api/downloads/:token` |
| 2 | **临时脚本清理** | 🟡 中 | `scripts/tmp-checkout-visual.mjs` 为临时验证脚本，应移除 |
| 3 | **checkout-visual.png 清理** | 🟡 中 | 根目录截图不应进入版本控制 |
| 4 | **QR 码 CDN 依赖** | 🟡 中 | `qrcode@1.5.3` 通过 jsdelivr CDN 加载，无 fallback |
| 5 | **package.json 尾部空行** | 🟢 低 | 文件末尾有 2 个空行 |
| 6 | **ui.ts 尾部空行** | 🟢 低 | 文件末尾有 3 个空行 |
| 7 | **产品数据仅 1 条测试数据** | 🟢 低 | `products.json` 仅含 1 个测试商品（id=1, name="Updated Template"） |
| 8 | **支付流程为手动输金额** | 📋 设计 | 当前方案：扫码 + 手动输入金额，非标准支付接口 |
| 9 | **CSP 尚未包含 jsdelivr** | 🔴 高危 | `pay.cgartlab.com` 加入 `connect-src`，但 `script-src` 已包含 `https://cdn.jsdelivr.net`（QR 码 CDN）✅ 已覆盖 |
| 10 | **未添加 noindex 保护** | 🟡 中 | `/shop/`、`/shop/checkout/`、`/shop/download/` 不应被搜索引擎索引 |

---

## 三、PR #414 — 30 项审计修复（待合并）

来源：4 路并发 Agent 静态审计 + dist/ 构建产物穷举比对

### 🔴 高危（5 项）— 已修复，待验证

1. **View Transition 后交互失效** — `WorksGallery` / `GithubCard` 在 `astro:before-swap` 中错误移除 `astro:page-load` 监听器
2. **BackButton 监听器累积** — `is:inline` 脚本每次导航重复注册，点击返回多步回退
3. **`.admonition-caution` 用错颜色** — 误用 `highlight`（橄榄绿）而非 `caution`（红）
4. **CI 不覆盖 main push** — 构建失败无人报警
5. **fetch-github-repos 无认证** — GitHub API 60 req/h 限流静默降级

### 🟡 中危（15 项）

- hreflang x-default 指向 404（82 个 en-only 标签页）
- noindex 声明源不唯一 → 收敛为 `src/lib/noindex.mjs`
- slug 跨语言碰撞漏检
- 搜索 is:inline 监听器累积
- `transition.finished` 无 catch
- InquiryForm/搜索索引 fetch 无超时
- MediaEmbed/MermaidLazy 双重渲染
- ai-disclaimer `@supports` 百分比不一致
- heading line-height 被全局规则覆盖
- 硬编码 font-family 漂移
- maintenance.yml 未固定版本
- pr-review 引用 @main
- pr-review/pr-triage 无 timeout
- sync-docs:check 未入 CI

### 🟢 低危（10 项）

- 删 `fix-internal-links` 失效入口
- 删死路由 `api/search-index.json.ts`
- 删 `og/home.png` 死代码
- 301/404/JSON 响应统一安全头 + 404 noindex
- 磁盘缓存结构校验
- robots.txt 无效规则
- .env.example 补 TG Secret 说明
- AGENTS.md KV 说明过时
- README/CONTRIBUTING 过时引用

---

## 四、Issue #415 — LQIP 构建链优化（待处理）

**问题**：`apply-lqip.ts` 在构建链最后一步用 `node-html-parser` 对 dist 下所有含图 HTML 做 AST 往返，导致：

1. `compressHTML` 对含图页面形同虚设
2. AST 往返不保证无损（可能改动 partytown / GA 标记）
3. 每次构建对 300 个 HTML 做 AST 往返

**建议**：二选一
- ① 改纯字符串正则替换（在 `<img>` 标签内插入 `style="--lqip:#xxx"`）
- ② 把 LQIP 注入前移为 rehype 插件（`rehypeImageProcessor` 已在管线中）

---

## 五、已知待办 / 技术债务

| # | 事项 | 来源 | 优先级 |
|---|------|------|--------|
| 1 | `fix-internal-links` 入口失效 | package.json 仍保留但脚本已删 | 🟢 低（PR #414 已修复） |
| 2 | katex 锁定 `^0.16.47` | rehype-katex@7 硬钉 `^0.16.0`，0.17+ 会双实例 | 🔴 阻塞（待上游兼容） |
| 3 | `color-mix()` 色彩空间差异 | `in srgb` 与 `in oklch` 混用，浏览器渲染微差 | 🟡 中（观察中） |
| 4 | CSP report-only 转强制 | 当前 CSP 为 report-only，需迁移至 nonce-based | 🟡 中 |
| 5 | Giscus 主题 CSS 部署后验证 | 修改 `public/giscus/theme-*.css` 后需重新部署 | 🟢 低 |
| 6 | Telegram KV namespace 占位符 | `wrangler.jsonc` 中 `<KV_ID_FROM_...>` 需替换为真实值 | 🔴 阻塞（部署前） |
| 7 | 设备本地 `.obsidian/` 配置 | 不纳入 git，各设备独立维护 | 📋 已知 |
| 8 | ExFAT 限制 | 无 symlink/junction/hardlink，`nodeLinker: hoisted` | 📋 已知 |
| 9 | `pnpm` 经 corepack 调用失败 | 需改用 `./node_modules/.bin/tsx` | 🟡 中 |
| 10 | 依赖升级积压 | wrangler 4.129→4.131 已合并，其余待检查 | 🟢 低 |

---

## 六、开发计划（建议排序）

### 阶段一：紧急交付（本周）

| 序号 | 任务 | 工时 | 说明 |
|------|------|------|------|
| 1.1 | **合并 PR #414** | 0.5h | 30 项审计修复，CI 验证通过后 squash merge |
| 1.2 | **清理 dev-pay 临时文件** | 0.5h | 删除 `scripts/tmp-checkout-visual.mjs`、`checkout-visual.png` |
| 1.3 | **修复 package.json / ui.ts 尾部空行** | 0.5h | 格式化清理 |
| 1.4 | **为 shop 页面添加 noindex** | 1h | 在 `src/lib/noindex.mjs` 或 worker 中为 `/shop/` 添加 `X-Robots-Tag` |
| 1.5 | **CSP 验证** | 0.5h | 确认 `https://cdn.jsdelivr.net` 在 CSP `script-src` 中已覆盖 |
| 1.6 | **dev-pay 提交 + PR** | 1h | 整理工作区，提交 dev-pay 分支，发起 PR |

### 阶段二：功能完善（1-2 周）

| 序号 | 任务 | 工时 | 说明 |
|------|------|------|------|
| 2.1 | **数字商店后端联调** | 3-5h | 等待 `pay.cgartlab.com` API 就绪，端到端测试 |
| 2.2 | **商品数据扩充** | 2h | 从测试数据迁移到真实商品 |
| 2.3 | **支付流程优化** | 2h | QR 码加载 fallback、订单过期提醒、支付成功验证 |
| 2.4 | **商店 i18n 审核** | 1h | 三语言 UI 字符串翻译一致性检查 |
| 2.5 | **商店 SEO 策略** | 1h | 确定是否索引商店页面（Product 结构化数据 vs noindex） |
| 2.6 | **商店 UI 完善** | 2h | 移动端适配、空状态、加载态、错误态完善 |

### 阶段三：构建质量优化（2-3 周）

| 序号 | 任务 | 工时 | 说明 |
|------|------|------|------|
| 3.1 | **Issue #415 — LQIP 构建链优化** | 2h | 方案 ②：将 LQIP 注入前移为 rehype 插件 |
| 3.2 | **CSP 强制化迁移** | 3h | 从 report-only 迁移至 nonce-based CSP |
| 3.3 | **color-mix() 色彩空间统一** | 1h | 评估 `in srgb` vs `in oklch` 影响，决定统一方向 |
| 3.4 | **Giscus 主题 CSS 部署验证** | 0.5h | `curl -sI` 确认线上正确返回 |
| 3.5 | **Telegram KV namespace 配置** | 1h | 替换占位符，配置 Secret，部署验证 |

### 阶段四：依赖维护 & 技术债务（持续）

| 序号 | 任务 | 工时 | 说明 |
|------|------|------|------|
| 4.1 | **Dependabot PR 定期审查** | 每周 0.5h | patch 自动合并，minor 批量审查 |
| 4.2 | **katex 上游跟踪** | 按需 | 等待 rehype-katex 兼容 katex 0.17+ 后升级 |
| 4.3 | **pnpm corepack 问题修复** | 0.5h | 检查 corepack 版本，修复 `pnpm` 调用 |
| 4.4 | **文档同步更新** | 1h | `pnpm sync-docs` 运行，确认 AGENTS.md 数据块最新 |

---

## 七、风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 数字商店后端 API 延期 | 中 | 高 | 前端可独立合并，后端上线后再联调 |
| PR #414 合并后线上异常 | 低 | 高 | CI 门禁 + 部署后 curl 验证关键路径 |
| CSP 强制化导致脚本加载失败 | 中 | 高 | report-only 观察期已确认白名单完整 |
| 依赖升级引入 breaking change | 低 | 中 | 分级升级策略，major 单独处理 |
| LQIP 重构引入样式回归 | 低 | 中 | 方案 ② 可灰度：先 rehype 注入，保留 apply-lqip 作为 fallback |

---

## 八、统计快照

| 维度 | 数值 |
|------|------|
| 文章总数 | 159（中文 80 + 英文 79） |
| 专栏 | 20 期 |
| 图片资产 | 395 张 |
| 脚本数量 | 17 个（含新增 fetch-products） |
| 依赖数量 | 27 个直接依赖 + 20 个开发依赖 |
| 贡献热力图 | 已启用（GitHub GraphQL） |
| 评论系统 | Giscus（主用） |
| 部署平台 | Cloudflare Worker + Static Assets |
| CI/CD | GitHub Actions + Cloudflare Git 集成 |
