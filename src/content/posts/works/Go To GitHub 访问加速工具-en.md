---
title: Go To GitHub Access Accelerator
published: 2026-06-02
description: "GitHub access accelerator. Fetches community-maintained GitHub host mappings and writes to local hosts file. No local scanning. Cross-platform: macOS / Linux / Windows."
tags:
  - Network Tool
  - Dev Tool
  - System Utility
  - Design Tool
draft: false
abbrlink: goto-github
toc: true
lang: en
---

![](../_images/GoToGitHub访问加速工具-1787317123841.webp)

## Overview

GoToGitHub is a GitHub access accelerator that fetches community-maintained GitHub host mappings in real time and writes them to your local `hosts` file, bypassing DNS resolution to speed up GitHub access. No local scanning required, one-command install.

## Motivation

Writing code from certain regions means dealing with one constant: GitHub is slow.

Cloning a 500MB repo takes minutes, raw assets fail to load, sometimes the GitHub homepage itself just spins. I tried plenty of solutions — paid proxies are one thing, but free ones are either complicated to set up or stop working after a few days.

So I wrote something simple: pull the latest mappings from a community-maintained hosts source, write them to local hosts, auto-refresh DNS cache. One command, no DNS knowledge needed, no installs, no setup.

## Why Open Source

It's a small tool everyone needs. The principle is simple, but it's wasteful for everyone to write their own version. Open sourcing it means anyone can use it, and platform differences get filled in collectively.

## How to Use

### Install (pick your platform)

**macOS / Linux / Git Bash**:

Open your terminal and paste this single line:

```bash
curl -sfL https://raw.githubusercontent.com/cgartlab/goto-github/main/install.sh | bash
```

This downloads and runs an installer that updates your computer's "address book" for GitHub (the `hosts` file) to the fastest servers.

If GitHub raw is slow from your location, try:

```bash
curl -sfL https://cdn.jsdelivr.net/gh/cgartlab/goto-github@main/install.sh | bash
```

**Windows**:

Open PowerShell (right-click Start → Windows PowerShell), then paste:

```powershell
irm https://raw.githubusercontent.com/cgartlab/goto-github/main/bootstrap.ps1 | iex
```

Same idea — tells your system the fastest route to GitHub.

### Day-to-Day

After installation, open your terminal and use these three operations:

**① Refresh GitHub's address**

```bash
# macOS / Linux / Git Bash
sudo ./fetch.sh

# Windows PowerShell
.\goto-github.ps1
```

Pulls the latest GitHub server addresses and writes them to your hosts file. Like refreshing routes in a map app.

**② Check status**

```bash
./fetch.sh --status
# or
.\goto-github.ps1 --pwsh status
```

Shows which IP you're using and whether the connection is working. Like checking your cell signal bars.

**③ Remove (uninstall)**

```bash
sudo ./fetch.sh --restore
# or
.\goto-github.ps1 --pwsh restore
```

Restores your hosts file to its original state — like uninstalling an app.

## One-Click Install

- **macOS / Linux**: `curl` one-liner install script
- **Windows**: PowerShell `irm` one-liner install
- **Multi-mirror Fallback**: primary source fails → backup → tertiary, all automatic

## Core Functionality

- **Real-time Fetch**: pulls GitHub domain mappings from community-maintained sources
- **Content Validation**: checks IP entry count (≥10) and github.com domain presence
- **Marked Block Isolation**: doesn't affect other hosts entries
- **DNS Cache Refresh**: supports macOS / Linux / Windows

## Data Sources

| Source | Description |
|--------|-------------|
| jsDelivr CDN | primary source, recommended for CN users |
| hellogithub.com | backup source, auto-fallback |
| GitHub520 raw | tertiary fallback |

Three sources tried in priority order — no manual intervention needed.

## Cross-Platform Support

| Platform | Shell |
|----------|-------|
| macOS | Bash 3.2+ |
| Linux | Bash 3.2+ |
| Windows | PowerShell 5.1+ / pwsh |
| Git Bash | Bash 3.2+ |

## Links

- GitHub: [github.com/cgartlab/goto-github](https://github.com/cgartlab/goto-github)
