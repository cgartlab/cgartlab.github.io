---
title: Windows 11 如何使用 winget 包管理器
published: 2024-03-01
description: Windows 11 winget包管理器完整使用指南，包含安装、搜索、更新、卸载软件等核心功能，以及自动化脚本配置
updated: 2024-03-09
tags:
  - Windows
  - winget
  - 包管理器
  - 系统管理
  - 自动化脚本
draft: false
pin: 0
toc: true
lang: zh
---

![封面](./_images/Windows%2011%20如何使用%20winget%20包管理器-1754567460839.webp)

## 什么是 Winget

winget 是微软推出运行在 Windows 终端中的一个软件管理工具，仅在 Windows 10 1709 及更高版本中支持，核心命令是 `winget`。

在终端输入 `winget` 你会看到：

```shell
PS C:\Users\cgart> winget
Windows 程序包管理器 v1.7.10582
版权所有 (C) Microsoft Corporation。保留所有权利。

WinGet 命令行实用工具可从命令行安装应用程序和其他程序包。

使用情况：winget  [<命令>] [<选项>]

下列命令有效:
  install    安装给定的程序包
  show       显示包的相关信息
  source     管理程序包的来源
  search     查找并显示程序包的基本信息
  list       显示已安装的程序包
  upgrade    显示并执行可用升级
  uninstall  卸载给定的程序包
  hash       哈希安装程序的帮助程序
  validate   验证清单文件
  settings   打开设置或设置管理员设置
  features   显示实验性功能的状态
  export     导出已安装程序包的列表
  import     安装文件中的所有程序包
  pin        管理包钉
  configure  将系统配置为所需状态
  download   从给定的程序包下载安装程序
  repair     修复所选包

如需特定命令的更多详细信息，请向其传递帮助参数。 [-?]

下列选项可用：
  -v,--version              显示工具的版本
  --info                    显示工具的常规信息
  -?,--help                 显示选定命令的帮助信息
  --wait                    提示用户在退出前按任意键
  --logs,--open-logs        打开默认日志位置
  --verbose,--verbose-logs  启用 WinGet 的详细日志记录
  --disable-interactivity   禁用交互式提示

可在此找到更多帮助："https://aka.ms/winget-command-help"
```

## 为什么推荐使用 Winget

## Winget 的优势

- **免费**：Windows 自带的。
- **功能简洁全面**：winget 具备搜索、下载、安装、升级、卸载以及配置软件包的功能，对于一个软件管理工具，这就是全部的核心功能，够用了。
- **操作便捷**：不需要去各大网站挨个下载安装包，只需在命令行中输入相应的命令，即可方便地进行软件包的各项操作，不用下载一堆安装包点来点去，有时还要看着进度条跑。
- **安全可靠**：通过 winget 安装的软件包均来自微软官方或可信的源，避免了从非官方渠道下载软件可能带来的安全风险，如流氓捆绑软件、病毒等。
- **易于学习**：winget 的命令相对简单，用户只需稍加学习即可快速掌握，无需具备复杂的编程或技术背景。
- **集成度高**：winget 可以与 Windows Terminal、PowerShell 或 CMD 等集成，用户可以在这些环境中直接使用 winget 命令。
- **支持多种格式**：新版本的 winget 支持采用.zip 格式的软件包，这意味着它可以从.zip 文件中提取并运行安装程序，或者从文件中安装一个或多个可移植软件包，进一步扩大了其适用范围。

## Winget 的缺点

- **软件源限制**：winget 的软件源可能有限，有时候想要安装的软件包并未被收录。这限制了用户的选择范围，尤其是对于那些寻找特定或小众软件的用户。
- **命令行操作门槛**：winget 是基于命令行的工具，这对于不熟悉命令行的人来说可能存在一定的学习门槛。虽然 winget 的命令相对简单，但对于部分人来说，使用命令行进行操作可能仍然会感到不便。
- **更新速度**：winget 的更新速度可能不如一些第三方软件包管理工具快。这意味着一些新发布的软件包可能无法在第一时间通过 winget 进行安装或更新。不过对于软件版本来说，我反而不建议非要安装最新版，这点见仁见智吧。
- **社区支持**：与一些流行的第三方软件包管理工具相比，winget 的社区支持可能相对较弱。这可能导致人们在遇到问题时难以找到解决方案或获得帮助。

# 如何使用 Winget

我们使用 winget 最常见的使用场景就是搜索，安装，卸载常用的软件。

常用的 winget 命令有以下几个：

`winget search <keywords>` 搜索安装包

`winget install <appname/id>` 安装软件

`winget uninstall <appname/id>` 卸载软件

`winget update` 检查所有软件更新

`winget upgrade --all` 更新所有软件

例如安装微信，可以使用搜索命令 `winget search 微信`，得到如上结果。

```shell
PowerShell 7.4.1
PS C:\Users\cgart> winget search 微信
名称                  ID                     版本         匹配      源
---------------------------------------------------------------------------
微信输入法            XPFFFP686NDRDZ         Unknown                msstore
金舟多聊 - 微信多开分身 XPFCVS08QJF2ZH         Unknown                msstore
万兴数据管家          Wondershare.WXRecovery 3.5.20.4     Tag: 微信 winget
微信开发者工具        Tencent.WeixinDevTools 1.06.2402021 Tag: 微信 winget
企业微信              Tencent.WeCom          4.1.20.6024  Tag: 微信 winget
WeChat                Tencent.WeChat         3.9.9.43     Tag: 微信 winget
微信输入法            Tencent.WeType         1.0.4.289              winget
PS C:\Users\cgart>
```

因为带有“微信”关键词的安装包有很多，因此安装特定安装包的时候应输入安装包的 ID，这里微信的 ID 是 `Tencent.WeChat`，因此我们输入命令 `winget install Tencent.WeChat` 即可。微信会自动安装，整个过程方便，安全，安静。

举一反三，你可以尝试使用其他命令，对软件进行搜索，安装，更新，卸载。

# 自动化安装脚本

虽然我们只需要敲几个字母，不再需要到浏览器里搜索下载常用的安装包了，但是每次重装系统的时候还要一行一行的敲命令，也是挺麻烦的，所以我自己写了一个自动运行命令的安装脚本，放在 GitHub 上，可以免费下载使用。[传送门在此](https://github.com/cgartlab/Software_Install_Script)

整个脚本结构其实非常简单：

```shell
@echo off

REM 检查是否存在软件列表文件
if not exist "software_list.txt" (
    echo Software list file does not exist! Please create the software list file and run the script again.
    exit /b
)

REM 逐行读取软件列表文件并安装软件
for /f "tokens=*" %%a in (software_list.txt) do (
    echo Installing software: %%a
    winget install %%a 
)

echo All software is already installed!
pause
```

这样每次面对一台刚刚重装系统或者刚买的电脑，只需要运行这个脚本，就可以把常用的软件一次性安装好了。

所有的列表保存在这个 [txt 文档]([Software_Install_Script/Windows/software_list.txt at main · cgartlab/Software_Install_Script (github.com)](https://github.com/cgartlab/Software_Install_Script/blob/main/Windows/software_list.txt)) 里，每一行是一个软件 ID。脚本运行的时候会逐一读取每一行的 ID，执行安装命令。注意，如果已经安装的软件则会检查更新并升级到最新版本。默认情况下，列表里的软件是我自己常用的，你可以根据需要自己增减定制。

哦对了，mac 的我也做了一个 :) 。
