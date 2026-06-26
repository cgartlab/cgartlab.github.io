---
title: 2026年，如何优雅地使用 Windows 11
published: 2026-04-30
description: "升级你的技能，以符合你的装备。距离上一篇已经两年，工具栈几乎换了一茬，但有些东西依然好用。"
updated: 2026-06-27
tags:
  - 技术分享
  - 生产力工具
draft: true
pin: 0
toc: true
lang: zh
abbrlink: elegant-use-windows11-in-2026
---

## 写在前面

- 开篇明义：2024 那篇是"换了一茬"的起点，2026 这篇是迭代后的汇报
- 两篇文章的定位差异：前篇是"重写工具栈"，这篇是"精炼与沉淀"
- 写作时间跨度：两年间 AI 从"聊天"变成了"干活"，我的工作流也随之重构
- 这不是一篇"最佳工具推荐"，是一份"我的 2024→2026 演进复盘"
- 前置参考：强烈建议先读《[[2024 年，如何优雅使用WindowsPC]]》

## 硬件与系统：两年间的变化

### 设备配置的升级逻辑

- CPU：从追求单核性能到接受"够用就好"，功耗比成为关键指标
- 内存：16GB 到 32GB 的跃迁，以及为什么不再盲目追内存容量
- 存储：PCIe 4.0 SSD 普及后，开机速度不再是话题
- 显示器：4K + 高刷 + 色准，普通用户也能买到专业级屏幕

### Windows 11 的"舒适区"

- 系统本身的变化：小组件被边缘化、Copilot 从宠儿到弃子、Recall 引发的隐私争议
- 我为什么坚持用 Windows 11 而非退回 10：开始菜单的"推荐"逻辑依然好用
- 系统级的进步：蓝牙 Aurcast、Link to Windows、Android 子系统的轻量化

### 开箱即用的基础设置（2026 更新版）

- 微软账号依然是首选，但需要额外配置本地账户防止云端锁定
- Edge 的角色重新定位：它现在是"可靠的备选"而非"唯一的浏览器"
- 任务栏不再折腾：隐藏不需要的图标，保持最小化存在
- Windows 11 2024H2 更新后任务栏终于可以拖拽排序了

## 包管理：winget + scoop 双轨并行

### winget 的现状与局限

- 2024 年的 winget 还像个半成品，现在终于可以"日常使用"了
- 速度依然是痛点：批量安装 20+ 软件时，PowerShell 脚本+国内镜像源是更务实的选择
- 我的 winget 使用场景：系统级工具、运行时环境、命令行工具
- 参考：《[[在 Windows 11 上使用 winget]]》（如果有）

### scoop 的持续价值

- scoop 依然是小众但精准的选择，尤其适合开发者和追求版本控制的人
- bucket 机制让我可以安装预编译的便携版软件，而无需处理 MSI/EXE 安装包
- aria2 多线程下载让 scoop 的安装速度不再成为瓶颈
- 我的核心 bucket：main、extras、versions、nerd-fonts

### 我目前的双轨分工策略

- winget 处理"系统级"：VS Code、Git、Node.js、Docker Desktop
- scoop 处理"工具级"：JetBrains 全家桶、字体管理器、终端增强工具
- 维护一份统一的安装脚本仓库 [[cgartlab/Software_Install_Script]]，重装 30 分钟全搞定

## 笔记系统：Notion → Affine → memos → blinko 的完整迁移故事

### 为什么离开 Notion

- 2024 年 Notion 还是绝对主力，2026 年我几乎不再打开它
- 核心问题：本地化能力不足、网络依赖、离线体验糟糕
- 次要问题：越来越贵的定价、与国产工具链的割裂感
- 但 Notion 依然是最好的"多人协作文档工具"——这个判断没变，只是我的场景变了

### Affine：为什么它是 Notion 的最佳替代

- 模块化设计 + 本地优先：两者兼得
- 双向链接、数据库、页面嵌套——Notion 有的它都有
- 自部署支持：数据完全握在自己手里
- 缺点：移动端体验还差一口气，但桌面端已经足够好用
- 进阶玩法：用 affine-cli 将 Affine 变成命令行的延伸（参考《[[那些真正扛起工作的 Skill]]》）

### memos：碎片化记录的回归

- flomo 的问题：越来越 AI，越来越云，越来越贵
- memos 的优势：GitHub 15k star、轻量级、Docker 一键部署
- 我的使用场景：浏览器侧边栏随手记、"稍后阅读"的中转站
- 与 Affine 的分工：memos 负责"入口"，Affine 负责"归档"

### blinko：2026 年的新发现

- 轻量级双链笔记、支持本地部署、社区活跃
- 为什么从 memos 迁移到 blinko：blinko 的图谱视图让我眼前一亮
- 实际体验：blinko 的移动端体验明显优于 Affine，和 memos 持平
- 当前我的笔记生态：blinks（入口）→ Affine（结构化）→ Obsidian（长期存档）

### 这套系统的核心设计原则

- 数据就近原则：碎片想法进 memos/blinko，结构化文档进 Affine，长期归档进 Obsidian
- 同步策略：Syncthing 负责局域网实时同步，Git 负责版本回滚
- 不再追求"一个工具解决所有问题"——专注做好分工和流转

## 终端：OpenCode 替代 QwenCode

### 为什么放弃 QwenCode

- QwenCode 的问题：维护停滞、插件生态萎缩、与新版模型的兼容性下降
- 2025 年下半年开始，每次打开它都像在用"遗留软件"
- 断舍离的契机：与其修补旧船，不如换一艘能跑的

### OpenCode 的核心优势

- 开源、多模型聚合、活跃的 Discord 社区
- tmux 分屏 + 多 Agent 协作：真正让 AI 参与"干活"而不是只"聊天"
- Side-by-side 可视化：操作文件、执行命令、查看结果同屏完成
- 跨平台：Windows、macOS、Linux 一套配置走天下
- 参考《[[我常用的 OpenClaw 工作流 Skill]]》里对 OpenCode 的详细描述

### 我的 Windows 终端栈（2026 版）

- OpenCode：主力 AI 编程工具，替代 QwenCode 和部分 GPT-4o 的工作
- Windows Terminal：系统自带，足够好用，PowerShell 7 + zsh 配置
- Tabby：备选终端，SSH 管理、多会话管理做得不错
- WSL2：偶尔需要 Linux 环境时的"Plan B"，但使用频率比 2024 年低很多

### 命令行习惯的进化

- 从"记不住命令就查"到"肌肉记忆 + alias 加速"
- 我的常用 alias：ll、gs、gp、c（clear）、ip（IP 配置）
- dotfiles 仓库 [[cgartlab/dotfiles]]：跨设备的命令行配置同步方案

## AI 工作流：OpenClaw 加入生产

### OpenClaw 是什么，为什么是它

- OpenClaw（又称"龙虾"）：开源个人 AI 助手，支持本地部署和 Skill 扩展
- 对比 Claude Cowork、Cursor：OpenClaw 的优势在于不绑定模型、多 Agent 协作
- 2026 年上半年真正"爆发"的原因：DeepSeek 降价、Token 成本大幅下降
- 更多背景参考《[[世界尽管让它去转，不用担心你学的东西会过时]]》

### 我的 OpenClaw 使用场景

- 场景一：信息聚合——每天早上让 Agent 总结 RSS 订阅、邮件、消息
- 场景二：写作辅助——文章润色、结构建议、标题生成
- 场景三：代码审查——配合 OpenCode，让 AI 做 Code Review 而非纯生成
- 场景四：Skill 定制——自己开发的 affine-cli、sys_status 等 Skill

### Skill 是真正的壁垒

- Skill 的本质：把个人经验转化为可复用的"自动化工作流"
- 我目前的 Skill 分类：第一类是信息收集（眼睛和耳朵），第二类是执行任务（手和脚）
- ClawHub 官方技能市场：3000+ 插件，但真正好用的还是自己写的
- 推荐阅读《[[那些真正扛起工作的 Skill]]》和《[[我常用的 OpenClaw 工作流 Skill]]》

### 与 OpenCode 的协作模式

- OpenClaw 负责"规划"，OpenCode 负责"执行"
- 典型流程：OpenClaw 分析需求 → 生成执行计划 → 调用 OpenCode 的 Agent 逐项完成
- 实际效率提升：复杂项目的初期搭建时间从 2 天缩短到 4 小时

## 写在最后

- 两年前的工具栈和今天的对比：最大的变化是"AI 深度介入工作流"
- 有些东西没变：Obsidian 依然是长期知识库、uTools 依然是启动器、Traffic Monitor 依然在任务栏
- 工具选型的底层逻辑：数据主权 > 功能完整 > 生态绑定
- 未来观察：Agent 时代，工具链的选择标准可能需要重新定义
- 相关阅读：《[[2024 年，如何优雅使用WindowsPC]]》、《[[2025 年，我的生产力设备里留下了这些优秀工具]]》
