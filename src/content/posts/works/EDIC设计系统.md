---
title: EDIC设计系统
published: 2026-05-14
description: 同时面向人类与 Agent 的编辑主义设计系统。基于 OKLch 色彩与设计令牌构建，框架无关、暗色就绪、中英文混排优化。
tags:
    - 设计系统
    - AI
    - 开源
    - 设计工具
draft: false
abbrlink: edic-design-system
toc: true
lang: zh
---

![EDIC设计系统封面](../_images/EDIC设计系统-1754664829706.webp)

## 作品介绍

EDIC（Editorial Design Interface for Content）是我为自己打造的设计工具，一个同时面向人类与 Agent 的编辑主义设计系统。

## 创作动机

最初，我只是希望利用 Agent 的能力，批量输出稳定可控的设计素材——图标、组件、色彩搭配。每次手动调整样式实在繁琐，我希望把设计决策提前固化，让 Agent 能够直接产出符合规范的结果。

这个想法本身不新，但真正动手做下来才发现，想让 AI 产出「对的设计」，前提是你自己得有一整套明确的设计规则。EDIC 就是在做这件事——先有需求，再长出一个系统。

在实际使用中验证了这套方式的可行性，整理成了开源版本发布。

## 为什么做成开源

自己用着不错的东西，整理成文档后发现也能帮到其他人。设计系统本身是纯静态的 CSS，没有框架依赖，接入成本很低。把规则写清楚，人和 AI 都能读。

## 系统特点

- **200+ 设计令牌** — 色彩、字体、间距、圆角、阴影、动效，覆盖完整
- **20 核心 + 5 附加组件** — 附带完整状态与暗色模式支持
- **100 枚 SVG 图标** — Lucide 风格线性，1.5px 描边
- **SVG 图表引擎** — 支持 10 种图表类型（柱状图、折线图、饼图等）
- **框架无关** — 一套 CSS 可用于 HTML、React、Vue、Svelte 或邮件
- **AI 协作工具** — 提示词 + Skill + references 目录，Agent 读取后可直接产出合规设计（[ClawHub](https://clawhub.ai/cgartlab/skills/edic-design-system) / [SkillHub](https://skillhub.cn/skills/user_3697cc42/edic-design-system)）
- **10 项 CI 验证器** — 包含 4 项跨文件验证（cssref / darkmode / verext / hardcode），确保设计一致性
- **备用模型回退** — `free-models.yml` 每 12 小时自动刷新可用免费模型列表，主模型不可用时自动切换
- **消费者配置** — 仓库级 `.argus.yml` 自定义审查维度
- **工程化治理** — release-please 自动化发布、版本戳工具、pre-commit hooks
- **许可证** — CC BY 4.0

## 版本更新记录

### v1.10.2（2026-08-14）

审计修复。修复 3 项审计发现的问题，完善发布流程。

### v1.10.1（2026-08-14）

发布流程修正。切换为 release-please 官方自动 tag 模型，响应评审修复 5 条 P1/P2/P3 问题。

### v1.10.0（2026-08-14）

SVG 图表引擎、Skill R2 可靠性升级、README 重写。

- **SVG 图表引擎**：统一图表组件，支持柱状图、折线图、饼图、散点图等 10 种类型
- **Skill R2**：新增 PATTERNS / RECIPES 模板库 + 自检机制，可靠性显著提升
- **Skill references/**：新增按需组件示例目录
- **Tooltip ARIA 增强**：添加 JS 交互、`role=tooltip`、ARIA 支持
- **README 双语重写**：精简专业的双栏布局 + badges

### v1.9.1（2026-06-25）

版本校准。同步 manifest / VERSION 至 1.9.1。

### v1.9.0（2026-06-24）

手工 tag 触发发布策略 + 自动 changelog 页生成。改进 release 流程，changelog 页面改为从 `CHANGELOG.md` 单一数据源自动生成。

### v1.8.1（2026-06-24）

CI/发布修复。修复版本校验从 manifest 读取、发布前 VERSION 同步、Skill ZIP 文件名规范化。

### v1.8.0（2026-06-23）

发布流程自动化。新增版本戳占位符批量更新 + changelog 页面生成系统。

### v1.7.0（2026-06-23）

Layer 2 跨文件验证器 + release-please 自动化发布管线。新增 cssref / darkmode / verext / hardcode 四项跨文件验证器，确保跨资源设计一致性。

### v1.6.2（2026-06-22）

首页设计系统规范合规性修复。修复 ds-stat-num 双重 CSS 定义、ds-eyebrow letter-spacing 冲突、Hero 区域语义标签、Footer inline style 清理等 P0/P1/P2 问题。

### v1.6.1（2026-06-22）

Pages 部署迁移修复。迁移至 workflow-based Pages 部署，恢复 v1.6.0 版本戳。

### v1.6.0（2026-06-22）

品牌更名、首页改版、毛玻璃导航栏、暗色模式增强。

- **品牌更名**：CGArtLab Design System → EDIC Design System
- **首页 Hero 重设计**：滑动词组循环、无限滚动轮播、统一 CTA 层级
- **毛玻璃导航栏**：`backdrop-filter` 亚克力质感 + 暗色模式感知
- **全屏覆盖移动端菜单**：从零重写，聚焦陷阱 + 滚动锁定 + ARIA
- **暗色模式 Gravitas & Glow**：暖橄榄绿暗色底层，营造厚重与光感
- **Prism.js 代码高亮**：橄榄绿编辑风格主题，16 种 token 类型
- **`.ds-pagenav` 统一目录**：桌面浮动卡片 + 移动端折叠，替换三套旧实现
- **100 枚 SVG 图标 sprite**：`generate_icons.py` 自动生成
- **版本戳统一**：`stamp_version.py` 跨所有 HTML/MD/CSS/JS 文件自动同步 `?v=`
- **CC BY 4.0 使用条款全面修订**

### v1.5.x（2026-06-05 ~ 06-19）

组件完善 + AI Skill 可靠性。

- **v1.5.0**：统一页面目录组件 `.ds-pagenav`、Prism 代码主题适配、反模式清理（hex/rgba → OKLch）
- **v1.5.1**：修复 TOC scroll-spy 在移动端反复拽回页面顶部的问题
- **v1.5.2**：5 项 UI/无障碍 Bug 修复 + 87 条单元测试（Vitest + jsdom），覆盖主题切换、导航、Tabs、Accordion、Copy 等
- **v1.5.3**：全站数据描述统一（"23 核心组件" → "20 核心 + 5 附加"），版本号漂移修正
- **v1.5.4**：移动端滚动锁定释放修复、页脚死链、`.ds-progress` 新增 success/error 变体
- **v1.5.5**：Skill 发布补丁 — 失效链接清理、版本源统一、ClawHub/SkillHub 元数据（对应 CHANGELOG 中 06-19 的同名条目，06-05 条目含 ds-pagenav / Prism / Layer 2 验证器等特性，归入 v1.5.x 综合更新）

### v1.4.x（2026-06-04 ~ 06-05）

品牌更名。

- **v1.4.0**：从 CGArtLab Design System 更名为 EDIC（Editorial Design Interface for Content），重新定位为「同时面向人类与 Agent 的编辑主义设计系统」
- **v1.4.3**：修复 12 处跨文档矛盾（品牌名、版本号、组件数量不一致等）

### v1.1.0（2026-05-31）

多页展示网站、品牌 Logo、动效系统、AI 协作工具。

- **6 页展示网站**：首页 / 视觉手册 / 使用文档 / 提示词 / 下载 / 使用条款
- **品牌 Logo**（v1.3 重绘 — 45° 钢笔头 monogram）
- **动效系统**：`ds-fade-up/in/down` / `ds-zoom-in` / `ds-float` / `ds-draw` 等，全面支持 `prefers-reduced-motion`
- **AI 协作交付物**：系统提示词、精简提示词、Agent Skill 技能包
- **暗色模式完善**：暖灰基底 + 橄榄绿暗底亮化 + 0.4s 平滑过渡

### v1.0.0（2026-05-14）

首个正式发布。

- **200+ 设计令牌**：OKLch 色彩体系（中性色 10 级 + 橄榄绿 10 级 + 4 语义色）、字体族 4 组、字号 11 级、间距 4px 基准、圆角 7 级、阴影 6 级、动画时长/缓动/断点/z-index/模糊
- **23 核心组件**：Button / Card / Input / Select / Checkbox / Radio / Toggle / Badge / Chip / Alert / Modal / Tooltip / Accordion / Tabs / Progress / Avatar / Breadcrumb / Pagination / Table / Navigation / Slider / Date Picker / Article TOC
- **100 SVG 图标**（Lucide 风格线性，1.5px 描边）
- **暗色模式**（`[data-theme="dark"]`）
- **GitHub Pages 部署**（edic.cgartlab.com）

## 怎么用

### 一分钟上手

在 HTML 页面里引用两个文件就能开始用：

```html
<link rel="stylesheet" href="https://edic.cgartlab.com/styles.css">
<script src="https://edic.cgartlab.com/scripts.js"></script>
```

然后直接用 class 名写组件，不需要学框架，不需要装任何东西：

```html
<button class="ds-btn ds-btn--primary">点击我</button>
<div class="ds-card">这是一张卡片</div>
<input class="ds-input" type="text" placeholder="输入内容">
```

每个组件都带暗色模式支持，改 `<html data-theme="dark">` 就自动切深色。

### 想要更多

- **25 个组件**：按钮、卡片、输入框、选择器、弹窗、标签页、表格……都在 [docs 页面](https://edic.cgartlab.com/docs.html) 列好，复制粘贴即用
- **100 个图标**：SVG 图标库，用 `<svg>` 标签内嵌或直接引用，不用额外加载
- **10 种图表**：柱状图、折线图、饼图、散点图……都是纯 SVG，可以直接嵌入页面
- **暗色模式**：所有组件自动适配，不用额外写 CSS
- **AI 协作**：把 EDIC Skill 装到 Claude / Cursor / Kiro 里，AI 就能直接帮你生成符合设计系统规范的代码

### 下载

直接下载 [官网的压缩包](https://edic.cgartlab.com/downloads.html)，解压后把 `styles.css` 和 `scripts.js` 放到项目里就能用。

## 相关链接

- 官网：[edic.cgartlab.com](https://edic.cgartlab.com)
- GitHub：[github.com/cgartlab/edic-design-system](https://github.com/cgartlab/edic-design-system)
- ClawHub：[clawhub.ai/cgartlab/skills/edic-design-system](https://clawhub.ai/cgartlab/skills/edic-design-system)
- SkillHub：[skillhub.cn/skills/user_3697cc42/edic-design-system](https://skillhub.cn/skills/user_3697cc42/edic-design-system)
