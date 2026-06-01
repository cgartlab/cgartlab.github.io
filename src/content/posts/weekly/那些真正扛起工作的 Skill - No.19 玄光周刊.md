---
title: 那些真正扛起工作的 Skill - No.19 玄光周刊
published: 2026-06-02
updated: 2026-06-02
description: 承接上期内容，本期继续介绍 OpenClaw 第二类 Skill——那些真正扛起工作的专用 Skill。它们与自部署服务深度集成，是日常生产力的核心支柱。
tags:
  - 周刊
draft: true
pin: 0
toc: true
lang: zh
abbrlink: weekly-19
---

![](../_images/主题%20-%20No.18%20玄光周刊-1779030168319.webp)

本期封面拍摄自昆明街头的一面旧墙，斑驳的涂料层层叠叠，每一道裂痕都像是时间的年轮。在这个 AI 工具爆炸式迭代的年代，有些东西依然需要经年累月的积累才能真正扛住压力。

---

> [!note] 关于周刊
> 这是一份专注知识管理，涵盖数字艺术、视觉设计、前端开发领域的电子周刊，发布频率目前为每周 1 期，每期精选一个细分话题展开思考。
>
> 如果你觉得这里的内容还不错，想获得更完善的阅读体验，更推荐使用浏览器来到官网阅读。
>
> 也欢迎使用 **RSS** (https://weekly.cgartlab.com/feed/atom) 或**邮件订阅**（[https://weekly.cgartlab.com](https://weekly.cgartlab.com)）进行订阅。

---

## 那些真正扛起工作的 Skill

上期我们介绍了第一类 Skill——用于信息收集整合的基础设施型 Skill。但那些更多是「眼睛」和「耳朵」，真正让 OpenClaw 成为生产力中枢的，是接下来要介绍的**第二类 Skill**——与自部署服务深度集成的专用 Skill。

如果说第一类 Skill 解决了「看到什么」的问题，那么第二类 Skill 要解决的是「做成什么」。这类 Skill 的共同特点是：需要结合 self-hosted 服务、涉及真实的自动化执行、承担关键工作流的核心环节。

> ℹ️ **关于 cgart-analysis / news-report**：上期已经详细介绍了这两个 Skill 的工作流程，本期不再重复展开。如有需要请回看 [No.18 玄光周刊](https://cgartlab.com/zh/weekly/weekly-18)。

**affine-cli** ：Affine 命令行工具。这是我管理 Affine 文档的核心工具，支持云端和自部署两种模式。它让我通过命令行完成文档、标签、文件夹、集合、数据库、评论、日记和工作区的所有操作。

常用的场景是：管理每日日记（affine-cli journal create / append）、搜索文档（affine-cli doc search）、操作数据库（affine-cli database query / insert / update）、管理标签和文件夹。对于需要批量操作 Affine 内容的人来说，这个 Skill 把手动操作变成了可编程的自动化流程。

**affine_todo** ：基于 Affine 数据库的任务管理。这是我的任务单一数据源，所有任务都存储在 Affine「任务跟踪」文档的「任务清单」数据库中，通过 affine-cli 读写。

任务分为三个级别（L1 基本维持、L2 系统优化、L3 转型与革命），基于马斯克待办理念设计。当用户问「有什么待办」「下一个做什么」时，我直接调用 what_next.py 脚本，按级别排序推荐下一步。这个 Skill 让我所有的任务都集中在一处，不会分散在各个工具中。

**invest-advisor** ：会投资的假维斯 — 操作规范。这是专为 wealth-tracker 容器设计的操作规范，核心目标是绝对避免破坏性操作，确保数据零丢失。它解决了一个致命问题：assets 表有 ON DELETE CASCADE 外键约束，执行删除会同时删掉 assets 和 records 两张表的所有数据，不可逆。

四条铁律：永远不用 DELETE 去重，改用 sqlite3 直接操作；数据去重用 Upsert（INSERT OR REPLACE）；更新 assets 用 PUT 逐条更新；破坏性操作前必须备份。这个 Skill 让我在 NAS 上操作数据库时没有任何心理负担，因为任何操作都可以回滚。

**daily-report** ：每日汇报。这是每天早晚 7:30 自动运行的汇报系统，依次运行 sys_status、api-usage、check-update、news-report 四个技能的采集脚本，然后整合成一份统一的 Markdown 简报。

流程是：run_all.sh 顺序执行四个技能的采集脚本，输出到临时目录；integrate.py 读取采集结果并整合生成统一格式的简报；最后通过 cron agentTurn 发送到 Telegram。这让我每天早晚只需要花 3 分钟就能掌握系统状态、消耗报表和新闻动态，而不是需要在各个工具间切换。

**penpot-design** ：Penpot 设计工作台。这是一套通过 MCP 协议读写 Penpot 文件的 AI 辅助设计工作台，让设计师能够在 AI 的帮助下完成从读取设计信息到创建编辑设计元素的完整流程。它的核心原则是「先读后设计」——进入任何 Penpot 文件，第一步永远是全面读取，不清不楚不动手。

读取阶段通过 9 个步骤全面获取文件信息：读取所有页面、页面结构、颜色库、字体系统、组件库、Token、所有文本内容、画板尺寸 + 约束 + 布局详情。所有数据立即缓存避免重复查询。执行阶段严格遵守四条铁律：尺寸约束是排版的生命线、先看再画、层次优先、间距纪律。对于需要将设计流程自动化的设计师来说，这个 Skill 把设计从「手工业」变成「可编程的流程」。

---

## 本期推荐

### n8n — 开源的工作流自动化平台

![图片取自原文页面](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036210576.webp)

🔗 https://n8n.io

n8n 是一个开源的工作流自动化平台，类似于 Zapier 但完全自托管。它最大的特点是**高度可定制**——你可以自己部署完整的工作流引擎，数据不离开你的服务器。

支持超过 400 个集成节点，从 HTTP 请求到 AI 模型，从代码执行到数据转换，几乎涵盖了所有常见的自动化场景。相比商业平台，n8n 的优势在于你可以完全掌控自己的数据和自动化逻辑。对于需要将 OpenClaw 与其他服务深度集成的用户来说，n8n 是一个理想的中间层。

### Trae — 国产 AI IDE，重新定义编程体验

![图片取自原文页面](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036148975.webp)

🔗 https://trae.ai

Trae 是最近备受关注的国产 AI 编程工具。与 Cursor、Windsurf 等国外产品不同，Trae 更注重中文开发者的使用习惯，并且内置了多个国产大模型的深度集成。

它的最大亮点是**中文界面和国产模型优先**，对于不习惯英文 IDE 或者需要频繁使用国产模型的用户来说，是一个值得尝试的选择。目前免费使用，性价比很高。

### Notion API — 结构化知识的无限可能

🔗 https://developers.notion.com

Notion API 本身不算新，但最近几个基于它的自动化工作流让我印象深刻。通过 API，你可以将 Notion 变成一个**结构化的知识中枢**，配合自动化工具实现笔记、任务、数据库的联动。

推荐关注 n8n 的 Notion 节点和 Make 的 Notion 集成，它们可以将你在 Notion 中的知识管理提升到一个新的层次。

### Windsurf — Codeium 推出的 AI 编程工具

![图片取自原文页面](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036946164.webp)

🔗 https://codeium.com/windsurf

Windsurf 是 Codeium 推出的 AI IDE，它的**SUPERCOMPLETION** 特性让我眼前一亮。与传统代码补全不同，SUPERCOMPLETION 可以理解完整的项目上下文，生成跨多个文件的代码片段。

对于大型项目的重构和功能开发，这个功能可以大幅减少人工编码量。不过目前还处于早期阶段，实际效果因项目而异。

---

## 配饭视频

[AI 编程工具大乱斗：Cursor vs Windsurf vs Trae](https://www.bilibili.com/video/BV1Ph4y1K7Uv/)

最近这几款 AI IDE 都很有热度，这个视频做了一个横向对比，可以帮助你选择适合自己的工具 👆。

---

## 尾巴和预告

OpenClaw 的 Skill 体系远不止这些。我目前用下来的 Skill 可以分为三类：第一类是信息收集整合的基础设施，第二类是今天介绍的这些真正扛起工作的专用 Skill，第三类是那些效果让我满意的**第三方 Skill**。

下期，我们来聊聊那些「捡到宝」的第三方 Skill。它们不是我自己设计的，但确实在某些场景下表现出色。

---

周刊首发在 [CG 艺术实验室](https://cgartlab.com/weekly)