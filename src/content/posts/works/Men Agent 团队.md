---
title: Men（门）Agent 团队
published: 2026-08-27
description: 围绕一人内容创作与工程协作的 6+1 Agent 团队系统。OpenCode 首发，机械验证优先，假完成必识破。单字命名：门·思·记·持·艺·寻。
tags:
  - ai
  - 开源
  - agent-团队
  - 设计工具
draft: false
abbrlink: men
toc: true
lang: zh
---

![Men（门）Agent 团队站点封面](../_images/ScreenShot_2026-08-27_163611_874.png)

## 作品介绍

Men Agent 是我用 OpenCode 搭的一套 Agent 团队协作系统。解决的场景是，一个人又想写东西又想做项目，它给你配了五个各有专长的虚拟助手，再加一个负责统筹的「门」。你只管把想法丢给它，它自己会自动识别任务的性质、判断你的意图、把专业的任务交给专业的助手去做，最后收工汇报。

利用 AI 完成特定的内容创作，其实目标无非是 " 做完还做得对 "。所以 Men 最在意的是**机械验证优先，假完成必识破**：AI 说 " 我做完了 " 不算数——程序先扫一遍证据，再让一个新的子 Agent 复核一遍。只信产物，不信自述。

## 6+1 角色

其实是六个 Agent 加上用户，利用 Agent 创作非常容易忘记人类自身的关键作用：

- **门（men）· 编排与路由核心**：唯一接收用户指令的角色。意图分诊（IntentGate）、任务路由、多 Wave 调度、结果汇总去冲突、事件审计写入——所有指令从这扇门进，由它分给最合适的角色。它本身不写代码、不写作、不设计。
- **思（si）· 思考与知识管理**：深度思考产出多角度方案，交付的是 plan envelope——一张含依赖图、并行波次和验收标准的计划书；知识库沉淀；只规划不执行，方案需经持验证才放行。
- **记（ji）· 代码与工程**：按 plan 实现前端代码、操作 GitHub PR/Issue、写技术文档/周报、做目录结构审计；交付前先自己跑一层 L1 验证（typecheck/lint）过本地 gate 才提交。
- **持（chi）· 数据/投资评审 + 独立 Judge**：双重身份——一边做投资持仓分析算收益，一边当独立裁判；作为 Judge 复核时用全新上下文（fresh-context），不复用被验证者的话，只信产物。
- **艺（yi）· 文生图与审美**：文生图提示词专家，思考中生成多套提示词、经 SenseNova 出图；负责设计决策与 Token 定义、配色版式、审美分析和 Logo 概念。生图能力只挂载在它身上。
- **寻（xun）· 搜索与研究**：网页搜索（Exa）、RSS 聚合、知识库检索、多源交叉事实核查；只读约束不修改源数据，搜索结果必须附来源链接。
- **用户**，是「门神」，最终决策者，负责最后的生产出品质量。

## 核心机制

让这几个助手能够按规矩合作，我们设计了以下机制：

- **10 步编排协议**：一个任务依次走 CERTAINTY → TRIAGE → PLAN → DISPATCH → COLLECT → EVALUATE → VERIFY → REPORT → LOOP，每一步都有明确的输入输出，任务从一句话变成可交付产物。
- **意图门路由（IntentGate）**：先把任务分成四类意图——search（查信息）/ analyze（产出+评审）/ team（多角色协作）/ hyperplan（复杂项目规划）；低置信时先跟你确认，绝不猜。
- **Wave 并行调度**：无依赖的活同时开工（并行上限 ≤4），有依赖的等上一波产物再动；每个子任务的要求写得完整自洽，子 Agent 中途不用追问。
- **双层机械验证**：干完活先跑 `verify.mjs` 做五项机械检查（退出码、文件存在性、密钥泄露、TODO 残留、结构）；全 PASS 后，再由持以全新上下文独立 Judge 复核一遍。相当于 " 自己说做完 " 不算，" 机器和旁观者都点头 " 才算，假完成必识破。
- **事件审计（14 种 kind）**：`events.jsonl` 记录 session.created/ended、boundary、workflow.phase、gate.passed/failed、blocker.raised、decision.made/missing、verify、judge、error、dispatch、handoff 共 14 种事件，只追加不删改，事后能一条条回放。
- **自主学习回路（M7）**：`learn.mjs` 从事件流提炼经验写进 `knowledge/errors` 与 `knowledge/patterns`，下次不再犯同样的错；`eval-metrics.mjs` 给你算 8 项 KPI（通过率、回归率、平均耗时……），干得怎么样看数就知道。
- **安全门禁**：`gate.mjs` 把能碰的东西列成白名单防注入；同一个活连续失败 5 次就喊停，不让你电脑空转。
- **零依赖**：验证、门禁、审计这三件套全是纯 Node 写的，不装任何第三方库，环境要求极低，换台机器就能跑。

## 快速开始

装好后在任意目录运行 `opencode`，默认 Agent 就是门（men）。当前版本 v0.3.3，要求 Node ≥ 18。

最省事的办法——官方 npm 一行安装（自动完成脚手架、依赖、环境检查与验证）：

```bash
npx @cgartlab/men
```

想自己敲命令也可以用管道脚本：

```bash
# Linux / macOS
bash <(curl -fsSL https://raw.githubusercontent.com/cgartlab/men/main/install.sh)

# Windows（PowerShell 7+）
irm https://raw.githubusercontent.com/cgartlab/men/main/install.ps1 | iex
```

也可以把下面这句直接发给任意 AI 助手（OpenCode / Claude / Cursor 都行），它会自己帮你装好并启动：

> 帮我安装并启动 men：`npx @cgartlab/men && cd men && npx astro dev --config site/astro.config.mjs`

三个最常用的命令：

- `/ultrawork <任务>`：一句话交给它，10 步协议自动调度团队把活干完
- `/verify <角色>`：机械检查 + 独立复核，确认产物靠谱
- `/hyperplan <项目>`：大项目先想清楚再动手，拆成能执行的小步

## 相关链接

- GitHub：[github.com/cgartlab/men](https://github.com/cgartlab/men)
- 站点：[men.cgartlab.com](https://men.cgartlab.com)
- 许可证：MIT
