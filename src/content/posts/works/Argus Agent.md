---
title: Argus 前端设计代码审查 Agent
published: 2026-06-13
description: 专注前端设计质量的 AI 代码审查 Agent。作为 GitHub App 运行，自动审查 PR 中的硬编码值、设计令牌违规、无障碍问题、暗色模式覆盖等设计相关问题。
tags:
  - AI
  - 代码审查
  - GitHub App
draft: false
abbrlink: argus
toc: true
lang: zh
---

![](../_images/Argus设计审查Agent-1787318582945.webp)

## 作品介绍

Argus 是一个专注前端设计质量的 AI 代码审查 Agent。作为 GitHub App 运行，安装到任意仓库后自动进行 PR 审查——专门捕捉人类和普通 lint 工具容易忽略的设计问题。也可以脱离 GitHub App，在 Claude Code、Cursor、Kiro 等任何 Agent 框架中独立运行。

## 创作动机

做 EDIC 设计系统时，**维护设计一致性**比写组件难得多。

你可能也有过这样的经历：PR 里写了一行 `background: #f5f5f0`，或者间距随手填了个 `27px`。看起来微不足道，但在一个有 200+ 设计令牌的系统里，每一处裸色值、每一个 magic number，都是后面埋的雷。ESLint 查不出来，人工 review 又容易漏——尤其是深夜赶稿的时候。

既然是设计规则，为什么不让 AI 来审？写了个 Argus，一个专门盯着设计质量的审查员。

## 为什么做成开源

设计系统的维护是每个团队都头疼的问题。Argus 的审查规则是可配置的，开源出来后其他团队可以直接接入，也可以根据自己的设计系统定制审查维度。

## 审查维度

Argus 看的东西，大部分 lint 工具看不了：

- **设计令牌审计**：检测 `:root` 之外的裸 oklch / hex / rgb 色值
- **硬编码值检测**：间距、圆角、字号中的 magic number
- **无障碍审查**：aria-label、alt 文本、焦点指示器、WCAG AA 对比度
- **暗色模式覆盖**：验证亮色/暗色双模式样式完整性
- **CSS 一致性**：重复规则、BEM 命名错误、空 catch 块
- **HTML 结构验证**：语义化元素、链接 vs 按钮使用正确性
- **框架 API 验证**：React / Vue / Angular / Svelte / Astro 等框架 API 使用规范

## 还有一些你可能不知道的能力

- **消费者配置**：在仓库根目录放一个 `.argus.yml`，就能自定义审查维度、模型、输出格式，不需要改代码
- **Fixture 回归测试**：内置 4 大测试套件（design-tokens / accessibility / hardcoded-values / css-quality），87+ 测试用例，防止规则更新后引入回归
- **备用模型队列**：主模型不可用时自动回退，`free-models.yml` 每 12 小时自动刷新可用模型列表
- **当前版本**：v0.3.3
- **许可证**：BSL 1.1（Business Source License）

## 工作方式

```shell
GitHub PR → argus-flash App → 审查流程 → PR 评论反馈
                         ↑
            AGENTS.md（硬性规则）
            SKILL.md（审查维度）
```

- **AGENTS.md**：硬性规则，注入到提示词中
- **SKILL.md**：审查维度定义，动态加载
- **运行时注入**：规则更新后所有接入仓库自动生效

## 三步安装

**第一步：安装「保安」**

去 [GitHub App 页面](https://github.com/apps/argus-flash) 点 Install，把 argus-flash 装到你的 GitHub 账户下。这就好比你给仓库雇了一个自动审查员，它会盯着每个 PR。

**第二步：配一把「钥匙」和「规则」**

在 GitHub 仓库的设置里找到 **Secrets and variables** → **Actions**，新建两个 Secret：
- `ARGUS_FLASH_APP_ID`：你的 argus-flash App ID（在 GitHub App 设置页能找到）
- `ARGUS_FLASH_PRIVATE_KEY`：App 的私钥文件内容（创建 App 时生成的 PEM 文件，整段粘进去）

可选：在仓库根目录放一个 `.argus.yml`，自定义审查维度、模型和输出格式。没有也行，Argus 会用内置默认规则。

这一步是告诉 Argus 谁有权限操作你的仓库、按什么规则审——就像给保安配门卡和检查清单。

**第三步：加一行「任务清单」**

在仓库里创建一个 GitHub Actions workflow 文件（比如 `.github/workflows/review.yml`），里面加上一行：

```yaml
- uses: cgartlab/argus/.github/actions/argus-review@main
```

这行代码的意思是：每次有人提 PR 的时候，告诉 Argus 来检查一下。不需要写其他逻辑，Argus 自己会读规则、做审查、写评论。

---

装完以后，每个 PR 打开时 Argus 会自动跑一遍，发现问题就在 PR 里留评论。你修改代码后它会重新审一遍，确认没问题才放行。

## 相关链接

- GitHub：[github.com/cgartlab/argus](https://github.com/cgartlab/argus)
- GitHub App：[argus-flash](https://github.com/apps/argus-flash)
