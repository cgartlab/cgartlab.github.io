---
title: How to Use Winget Package Manager in Windows 11
description: Complete guide to using Windows 11 winget package manager, including installation, search, update, uninstall software and automated script configuration
published: 2024-03-01
updated: 2024-03-09
tags:
  - Technical Sharing
draft: false
pin: 0
toc: true
lang: en
abbrlink: use-winget-on-win11
---

![Cover](./_images/Windows%2011%20如何使用%20winget%20包管理器-1754567460839.webp)

## What is Winget

Winget is a software management tool developed by Microsoft that runs in Windows Terminal, supported only in Windows 10 version 1709 and later. The core command is `winget`.

When you type `winget` in the terminal, you'll see:

```shell
PS C:\Users\cgart> winget
Windows Package Manager v1.7.10582
Copyright (C) Microsoft Corporation. All rights reserved.

WinGet command-line utility can install applications and other packages from the command line.

Usage: winget [<command>] [<options>]

The following commands are available:
  install    Install the given package
  show       Display package information
  source     Manage package sources
  search     Find and display basic package information
  list       Display installed packages
  upgrade    Show and perform available upgrades
  uninstall  Uninstall the given package
  hash       Helper for hash installer
  validate   Validate manifest files
  settings   Open settings or set administrator settings
  features   Show status of experimental features
  export     Export list of installed packages
  import     Install all packages in file
  pin        Manage package pins
  configure  Configure system to desired state
  download   Download installer from given package
  repair     Repair selected package

For more details on a specific command, pass it the help argument. [-?]

The following options are available:
  -v,--version              Display tool version
  --info                    Display general tool information
  -?,--help                 Display help for selected command
  --wait                    Prompt user to press any key before exiting
  --logs,--open-logs        Open default log location
  --verbose,--verbose-logs  Enable verbose logging for WinGet
  --disable-interactivity   Disable interactive prompts

More help can be found at: "https://aka.ms/winget-command-help"
```

## Why Recommend Using Winget

### Advantages of Winget

- **Free**: Built-in with Windows.
- **Simple yet comprehensive functionality**: Winget provides search, download, installation, upgrade, uninstallation, and package configuration features - all the core functions needed for a software management tool.
- **Convenient operation**: No need to visit various websites to download installation packages one by one. Simply enter the corresponding commands in the command line to easily perform various package operations, avoiding the hassle of downloading multiple installation packages and clicking through installation wizards.
- **Safe and reliable**: Packages installed through winget come from Microsoft official sources or trusted repositories, avoiding security risks associated with downloading software from unofficial channels, such as bundled malware or viruses.
- **Easy to learn**: Winget commands are relatively simple, allowing users to quickly master them with minimal learning, without requiring complex programming or technical background.
- **High integration**: Winget can integrate with Windows Terminal, PowerShell, or CMD, allowing users to directly use winget commands in these environments.
- **Supports multiple formats**: Newer versions of winget support software packages in .zip format, meaning it can extract and run installers from .zip files or install one or more portable software packages from files, further expanding its applicability.

### Disadvantages of Winget

- **Limited software sources**: Winget's software repository may be limited, and sometimes the desired software package may not be included. This restricts user choices, especially for those looking for specific or niche software.
- **Command-line operation threshold**: Winget is a command-line-based tool, which may present a learning curve for those unfamiliar with command-line interfaces. Although winget commands are relatively simple, some users may still find command-line operations inconvenient.
- **Update speed**: Winget's update speed may not be as fast as some third-party package management tools. This means newly released software packages may not be immediately available for installation or update through winget. However, for software versions, I personally don't recommend always installing the latest version - this is a matter of personal preference.
- **Community support**: Compared to some popular third-party package management tools, winget's community support may be relatively weaker. This could make it difficult to find solutions or get help when encountering problems.

## How to Use Winget

The most common usage scenarios for winget are searching, installing, and uninstalling commonly used software.

The most commonly used winget commands include:

`winget search <keywords>` - Search for packages

`winget install <appname/id>` - Install software

`winget uninstall <appname/id>` - Uninstall software

`winget update` - Check for all software updates

`winget upgrade --all` - Update all software

For example, to install WeChat, you can use the search command `winget search 微信`, which will yield results like this:

```shell
PowerShell 7.4.1
PS C:\Users\cgart> winget search 微信
Name                  ID                      Version       Match      Source
---------------------------------------------------------------------------
WeChat Input Method   XPFFFP686NDRDZ         Unknown                msstore
Jinzhou MultiChat     XPFCVS08QJF2ZH         Unknown                msstore
Wondershare Recovery  Wondershare.WXRecovery 3.5.20.4     Tag: WeChat winget
WeChat Dev Tools      Tencent.WeixinDevTools 1.06.2402021 Tag: WeChat winget
Enterprise WeChat     Tencent.WeCom          4.1.20.6024  Tag: WeChat winget
WeChat                Tencent.WeChat         3.9.9.43     Tag: WeChat winget
WeChat Input Method   Tencent.WeType         1.0.4.289              winget
PS C:\Users\cgart>
```

Since there are many packages containing the "WeChat" keyword, when installing a specific package, you should enter the package ID. Here, WeChat's ID is `Tencent.WeChat`, so we enter the command `winget install Tencent.WeChat`. WeChat will install automatically - the entire process is convenient, safe, and quiet.

By analogy, you can try using other commands to search, install, update, and uninstall software.

## Automated Installation Script

Although we only need to type a few letters and no longer need to search and download common installation packages from browsers, it's still quite troublesome to type commands line by line every time we reinstall the system. Therefore, I created an automated command execution installation script and placed it on GitHub for free download and use. [Link here](https://github.com/cgartlab/Software_Install_Script)

The script structure is actually very simple:

```shell
@echo off

REM Check if software list file exists
if not exist "software_list.txt" (
    echo Software list file does not exist! Please create the software list file and run the script again.
    exit /b
)

REM Read software list file line by line and install software
for /f "tokens=*" %%a in (software_list.txt) do (
    echo Installing software: %%a
    winget install %%a
)

echo All software is already installed!
pause
```

This way, every time you face a newly reinstalled system or a newly purchased computer, you just need to run this script to install all commonly used software at once.

All the lists are saved in this [txt document](https://github.com/cgartlab/Software_Install_Script/blob/main/Windows/software_list.txt), with each line containing a software ID. When the script runs, it will read each line's ID one by one and execute the installation command. Note that if software is already installed, it will check for updates and upgrade to the latest version. By default, the software in the list is what I commonly use - you can customize it according to your needs.

Oh, by the way, I also made one for macOS :).
