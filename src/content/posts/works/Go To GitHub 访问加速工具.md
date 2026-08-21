---
title: Go To GitHub 访问加速工具
published: 2026-06-02
description: GitHub 访问加速工具。实时从社区维护的 hosts 源获取 GitHub 域名映射，写入本地 hosts 文件，无需本地扫描。支持 macOS / Linux / Windows 全平台。
tags:
  - 网络工具
  - 开发工具
  - 系统工具
  - 设计工具
draft: false
abbrlink: goto-github
toc: true
lang: zh
---

![GoToGitHub 访问加速工具封面](../_images/GoToGitHub访问加速工具-1787317123841.webp)

## 作品介绍

Go To GitHub 是一个 GitHub 访问加速工具，通过实时获取社区维护的 GitHub hosts 映射，写入本地 `hosts` 文件，绕过 DNS 解析，加速 GitHub 访问。无需本地扫描，一键安装。

## 创作动机

在国内写代码，绕不过去的就是 GitHub 访问慢这件事。

clone 一个 500MB 的仓库要等好几分钟，raw 资源时不时加载失败，甚至有时候打开 GitHub 首页都转圈。网上各种方案看了不少——付费的梯子不说，免费的要么配置复杂，要么隔几天就失效。

写了个简单直接的方案：从社区维护的高质量 hosts 源拉取最新映射，写入本地 hosts，自动刷新 DNS 缓存。一行命令搞定，不用懂 DNS，不用懂 hosts，不用装任何东西。

## 为什么做成开源

这是个大家都需要的小工具，原理简单，但每个人自己写一遍太浪费。开源出来，谁都能用，多平台的差异大家一起补全。

## 怎么用

### 安装（选一个平台）

**macOS / Linux / Git Bash**：

打开终端，复制粘贴这一行，回车就行：

```bash
curl -sfL https://raw.githubusercontent.com/cgartlab/goto-github/main/install.sh | bash
```

这条命令会下载一个安装脚本并自动运行。它会把你电脑上访问 GitHub 用到的「域名地址表」（hosts 文件）更新成最快的版本。

如果 GitHub raw 访问慢，试试这个备选地址：

```bash
curl -sfL https://cdn.jsdelivr.net/gh/cgartlab/goto-github@main/install.sh | bash
```

**Windows**：

打开 PowerShell（右键开始菜单 → Windows PowerShell），粘贴这一行：

```powershell
irm https://raw.githubusercontent.com/cgartlab/goto-github/main/bootstrap.ps1 | iex
```

和上面一样——让系统知道 GitHub 最快的服务器地址在哪。

### 日常使用

安装完成后，打开终端就能用。三个最常用操作：

**① 更新 GitHub 地址**

```bash
# macOS / Linux / Git Bash
sudo ./fetch.sh

# Windows PowerShell
.\goto-github.ps1
```

自动拉取最新的 GitHub 服务器地址，写入 hosts 文件。就像给地图应用刷新一次路线。

**② 查看当前状态**

```bash
./fetch.sh --status
# 或
.\goto-github.ps1 --pwsh status
```

会告诉你现在用的是哪个 IP 地址，连接是否通畅。相当于看一眼手机信号是满格还是两格。

**③ 恢复原样（不想用了）**

```bash
sudo ./fetch.sh --restore
# 或
.\goto-github.ps1 --pwsh restore
```

把 hosts 文件恢复到装之前的状态，就像卸载一个软件。

## 一键安装

- **macOS / Linux**：`curl` 一键脚本安装
- **Windows**：PowerShell `irm` 一键安装
- **多镜像源自动回退**：主源失败自动切换备用源，再失败切三级回退

## 核心功能

- **实时拉取**：从社区维护源获取 GitHub 域名映射
- **内容验证**：检查 IP 条目数量（≥10）和 github.com 域名存在性
- **标记区块隔离写入**：不影响其他 hosts 条目
- **DNS 缓存刷新**：支持 macOS / Linux / Windows

## 数据源

| 源 | 说明 |
|----|------|
| jsDelivr CDN 加速 | 主源，国内推荐 |
| hellogithub.com | 备用源，自动回退 |
| GitHub520 原始源 | 三级回退 |

三个源按优先级依次尝试，前一个不可用自动切下一个，全程无需手动干预。

## 跨平台支持

| 平台 | Shell |
|------|-------|
| macOS | Bash 3.2+ |
| Linux | Bash 3.2+ |
| Windows | PowerShell 5.1+ / pwsh |
| Git Bash | Bash 3.2+ |

## 相关链接

- GitHub：[github.com/cgartlab/goto-github](https://github.com/cgartlab/goto-github)
