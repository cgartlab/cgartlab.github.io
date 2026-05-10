# 资源页面添加常用工具 Spec

## Why
当前网站的资源页面（/links）的"我常用的工具"分类下仅有 Figma 和 ColorHunt 两个工具。作为 CG 艺术实验室，需要展示更多实际使用的专业工具，以便访客了解我们的技术栈和推荐工具。

## What Changes
- 在 `src/data/links.ts` 的 "我常用的工具" / "Design & Creation" / "設計創作" 分类下新增 11 个常用工具条目
- 新增工具包括：OpenCode, OpenClaw, VSCode, Obsidian, Affine, Blinko, Docker, PVE, FnOS, Cinema 4D, After Effect, Photoshop
- 为每个工具提供标题、描述、URL 和图标（favicon）

## Impact
- 受影响文件：`src/data/links.ts`
- 受影响页面：`/links`（多语言：zh, en, zh-tw）
- 无破坏性变更

## ADDED Requirements
### Requirement: 常用工具条目
The system SHALL 在资源页面的工具分类下展示以下工具卡片：

#### Scenario: 中文页面
- **WHEN** 用户访问 `/links/`
- **THEN** 在"我常用的工具"分类下看到以下工具：
  - OpenCode — AI 驱动的代码编辑器
  - OpenClaw — 开源设计资源管理
  - VSCode — 代码编辑器
  - Obsidian — 知识管理工具
  - Affine — 开源协作知识库
  - Blinko — 轻量级笔记工具
  - Docker — 容器化平台
  - PVE — Proxmox 虚拟化环境
  - FnOS — 国产 NAS 系统
  - Cinema 4D — 3D 建模与动画
  - After Effect — 动态视觉特效
  - Photoshop — 图像处理软件

#### Scenario: 英文页面
- **WHEN** 用户访问 `/en/links/`
- **THEN** 在 "Design & Creation" 分类下看到对应英文描述的工具卡片

#### Scenario: 繁体中文页面
- **WHEN** 用户访问 `/zh-tw/links/`
- **THEN** 在 "設計創作" 分类下看到对应繁体中文描述的工具卡片
