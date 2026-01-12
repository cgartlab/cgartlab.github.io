---
title: 2025 Productivity Tools That Stayed in My Workflow
published: 2026-01-13
description: After years as a designer, I've never systematically shared the software tools I use. This year, inspired by the idea of designing my own product, I started evaluating software with a product design mindset - even researching developer interviews to understand their thinking process.
updated: 2026-01-13
tags:
  - knowledge-management
  - tech-sharing
draft: false
pin: 0
toc: true
lang: en
abbrlink: good-tools-for-production-in-my-2025
---

## Introduction

![my productivity devices](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768218148512.webp)

After years as a designer, I've never systematically shared the "hammers and wrenches" in my digital toolbox. In today's information explosion era with tool overload, simply listing a "best apps ranking" feels meaningless. Only tools that survive countless real-world challenges can truly be considered problem-solvers.

I've gradually started evaluating software with a product design mindset, even researching developer interviews to understand their design thinking. As a designer myself, I often think "if it were me, I'd choose xxx." Questions constantly pop up:

- What specifically attracts me to this product?
- What does it feel like to use vs. what it actually is?
- What problem are they trying to solve for users?
- What methods do they use to solve it?
- What's the product's development roadmap?
- Is the current hype overrated?
- What's the business model behind the product?
- How would I approach it differently?
- And more...

This article primarily helps me organize thoughts about excellent products, while sharing them with you. I'll focus on each tool's core appeal and how it solves my specific problems. These are subjective judgments, but I believe others face similar challenges, making sharing valuable.

These aren't all the tools I use. Selection criteria (in no particular order):

- Works out-of-the-box: Basic functionality available after installation
- Good-looking interface: ~~Legend says~~ aesthetics are primary productivity
- Preferably open-source: More peace of mind
- Cross-platform: At least Mac/Windows data sync capability
- Free features sufficient for light usage: Money doesn't grow on trees
- Excludes heavy professional project tools: Stick with what works best
- Excludes platform/brand-exclusive software
- Excludes ubiquitous apps like WeChat/Alipay: Just necessities

I'll organize tools from "general to specific, core to auxiliary" for smoother reading.

## 1. Core Productivity Tools

My biggest 2025 shift was "from cloud to local." Inspired by DIY enthusiasm, I built my own server, learned Linux basics, PVE virtualization, Baota panel, Docker, and frontend programming. Gradually migrating cloud services and data to this local server has been surprisingly pleasant with AI assistance - like building a cyber fortress with a reliable partner.

### Notion: Large-Scale Business Project Collaboration Hub

![Ongoing business projects](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768054924704.webp)

Notion's recent developments - Chinese version, forms, Layouts, better automation, powerful AI, web sharing - keep it as my absolute main tool for remote collaboration.

I use Notion primarily for business project tracking and data analysis. What truly impacts me are database visualization charts and intuitive, detailed multi-user collaboration features. Advanced features like automation and AI haven't significantly boosted efficiency for my design-focused work. Real efficiency gains come from reliable collaborators.

Years ago, I worried about cloud data security until experiencing a colleague accidentally deleting important documents in 2021. Customer support resolved it within 3 hours via email. Since then, security concerns diminished, though regular personal data backups remain safest.

For privacy-conscious users of closed-source online tools: give projects internal codenames - sounds cool, right?

### Obsidian: Highly Flexible Personal Knowledge Base

A frequently discussed tool, sharing main status with Notion. Why use both?

My approach: Notion handles collaborative business projects (large-scale, medium-term like CG animation, advertising, film UI, packaging); Obsidian manages personal creation/maintenance (notes repository, blog articles, development docs). Obsidian handles long-term accumulation data requiring high flexibility and absolute local control.

Multi-device sync is simple: Syncthing (mentioned later) syncs via NAS as central hub to all devices (works over internet too). Avoid distributed structures to prevent file conflicts. Before Syncthing, I rarely used Obsidian mobile due to git/cloud sync complications. Now, seeing "up to date" status means safe writing.

Desktop periodically pushes to GitHub repository via Git for version control. For recording, searching, organizing - no better experience than Obsidian yet. Likely sticking with it.

![Embedding RSS and Memos pages simultaneously](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768054847394.webp)

Early 2025, Obsidian added a heavyweight web view component. It's essentially embedding a browser, but for self-hosted service enthusiasts, this means any web-based app can run within Obsidian. As shown above, reading, recording, outputting flow seamlessly.

Late 2025 brought Base database functionality. While not as powerful as Notion's databases, it shows potential for project management - possibly syncing project repositories with git plugin for multi-user collaboration (slightly higher barrier for non-programmers).

### Memos: Pure, Focused Fragmented Note-Taking

![My demo note](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768054260816.webp)

Popular GitHub fragmented memo tool, similar to flomo. Main barrier: Docker deployment on server (higher beginner requirement). I keep it in browser sidebar for quick captures - paste interesting content, write thoughts immediately.

Flomo's recent development focuses on AI features I don't need, so I've migrated fragmented notes to Memos. Deployed Memos container on home server, works seamlessly with Moememos App. Stable basic functionality suffices.

As Flomo's open-source alternative, Memos focuses solely on "quick recording." Without complex tagging systems or AI features, it emphasizes idea capture itself. Fragmented thoughts eventually enter Obsidian repository. Self-hosting benefits include absolute low-latency sync at home, enabling frictionless recording.

### Syncthing: Decentralized File Synchronization

![NAS-centric file sync](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768054689002.webp)

Open-source free file sync tool where devices act as mutual "cloud." For external access, NAS with intranet penetration serves as temporary "sync center."

I sync these folder types:

1. Current year business project directories (desktop only)
2. Note repositories (desktop + mobile, mainly search/read on mobile)
3. Blog articles (desktop + mobile, write anytime)
4. Temporary "Inbox" folder (convenient small file transfers)

### Miniflux: Lightweight RSS Information Aggregation

![Miniflux category page](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768055141048.webp)

Self-hosted RSS subscription platform, recently replaced FreshRSS. Found FreshRSS relatively clunky with slow web loading. Miniflux focuses on one thing: aggregating relevant information and timely delivery. Customizable styles make web interface sufficient unless offline reading needed.

Miniflux handles RSSHub-converted content better than FreshRSS regarding reading success rate and formatting support - major reason for switching.

These core tools cover "reading → recording → integrating → outputting" knowledge management workflow, applicable to any digital-era work/life.

## 2. Foundation & General Tools

### Rime: Highly Customizable Input Engine

Excellent open-source input engine by Chinese developer佛振, my main input method on PC, Mac, and two Android devices. Different platform names: Weasel (Windows), Squirrel (macOS). Installation isn't complex, but initial configuration has learning curve. Once customized with personal phrase library, it becomes increasingly smooth.

Android configuration complexity/stability varies by phone brand, so not recommended for beginners. iOS/iPadOS built-in input method works well.

![Called Weasel on Windows](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768055738564.webp)

### Winget/HomeBrew Package Managers: Minimalist App Stores

![Winget command](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768206224777.webp)

Previously wrote [an article](https://cgartlab.com/posts/use-winget-on-win11/) about winget. While not productivity tool itself, it significantly reduces steps/time when batch installing/updating software after system reinstallation.

Last year, I optimized this by writing [a script](https://github.com/cgartlab/Software_Install_Script) listing all installable/updatable software. After reinstalling, double-click runs automatic sequential download/installation while I perform other setup tasks simultaneously.

### Calibre: Digital Library Management

![Web-based NAS library management](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768055976527.webp)

Powerful library management system for unified management, conversion, organization of ebooks, literature, movie/game artbooks (mainly EPUB/PDF formats). Adds accurate metadata (cover, author, description, sometimes ratings). Currently deployed as Docker container on NAS.

Library criteria: fully read + well-written.

Used iReader, Duokan, WeChat Reading over years. While total completed books isn't high, realizing need for personal knowledge system led to unified e-book management platform. After decade-plus, only self-controlled data feels truly free. Reading platforms can't contain all book copyrights, requiring manual searches for niche/specific editions.

![Calibre 网页端阅读效果](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768144670820.webp)

Calibre's reading experience? Not exceptional. Strength lies in format conversion for device compatibility. Weakness: multi-device sync for reading progress/highlights. Current method: iPad Safari accessing web interface. Initially uncomfortable, sought replacement apps. Gradually realized it's sufficient - important thing is finishing books and recording noteworthy content.

Books per year, reading days, weekly hours - like screen time stats - don't motivate action (positive or negative).

## 3. Content Creation & Media Management

### Eagle: Design Asset Management

![Eagle](./_images/2025年，我的生产力设备里留下了这些优秀工具-1767097551459.webp)

Desktop design asset management tool, no comprehensive alternatives found. Bought licensed version (two-device authorization sufficient). Single asset library on NAS, desktop/laptop access via WebDAV protocol for external reading. Maximizes storage efficiency, secure image storage.

Simple usage: habitually search asset library first during project reference phase. If unavailable (usually initial reaction - familiar if present), search elsewhere. Consistent practice makes library grow around personal characteristics, improving usability.

Minor dislike: Eagle's proprietary file directory structure requires software access (possibly performance consideration). Export preserves custom file classification structure.

### Sunflower & RustDesk: Remote Desktop

![RustDesk](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768056082307.webp)

Initially used ToDesk and Sunflower. As screen resolutions increased, free Sunflower version couldn't meet remote assistance quality demands. Discovered RustDesk open-source remote desktop software.

![Note FPS and latency](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768057200058.webp)

Supports peer-to-peer direct connection. Latency/quality depend on broadband quality/speed. Supports h.265, h.264, AV1, vp8 hardware decoding. GPU rendering animations don't affect transmission quality. Tested home (mobile network) to school workstation (telecom network): 4K 60Hz with 60-80ms latency - impressive performance.

Sunflower retained for incredible screen recording compression algorithm: 10-minute 1080p remote recording only 30MB, identical quality/framerate to local operation.

### OBS Studio: Screen Recording & Live Streaming

![OBS Studio](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768206838777.webp)

Familiar to live streamers, I use it mainly for recording advanced project techniques - tutorials for future self. Over time, nobody remembers messy project files. Speed-watching recordings provides clarity.

Occasionally records project specifications, creates template instructions for team members.

### Traffic Monitor: Real-time Hardware Monitoring

![Traffic Monitor taskbar interface](./_images/2025年，我的生产力设备里留下了这些优秀工具-1766977269037.webp)

Basic hardware monitoring: CPU, GPU, memory, disk usage/temperature. Plugin support for extended functionality like power consumption/weather monitoring.

### Stats: Real-time Hardware Monitoring

Similar to Windows Traffic Monitor, open-source free hardware monitoring tool. Small/beautiful, steady monthly updates. Menu bar modules: CPU, RAM, SSD, network monitoring.

Recent addition: manual fan speed control for dust cleaning. Known challenge: making M-chip Mac fans reach full speed under normal usage.

![Stats menu bar](./_images/2025年，我的生产力设备里留下了这些优秀工具-1754923771375.webp)

### Handbrake: Video Format Conversion

![Handbrake interface](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768207001831.webp)

As animation designer, video transcoding tools essential. Previously used Adobe Encoder, replaced due to bulkiness. Handbrake's UI logic requires adaptation but avoids ffmpeg complexity and Adobe Encoder bloat. Encoding speed satisfactory.

## 4. System Enhancement & Efficiency

### PowerToys: System Enhancement Toolbox

![PowerToys main interface](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768130507243.webp)

After PowerToys resumed development in 2019 (yes, it's ancient), used briefly but unstable with crashes/freezes. Switched to uTools for 4 years. Now PowerToys stable/complete, especially convenient for developers/designers. Free and functional enough to completely replace uTools in 2025 workflow.

After two years, uTools' essential features were quick launch/search, color picker, batch rename. Business strategy changes limited plugin installation. PowerToys' accumulated features offer tighter system integration:

- Awake: switches system power modes to control sleep times (essential for long high-load animation rendering)
- Peek: replaced Quicklook for quick file previews
- FancyZones: enhances Windows window organization with fewer steps, more customization (beneficial for multi-monitor professional creators)

These utilities run silently at startup, saving invisible time.

### Twinkle Tray: External Monitor Brightness Control

![Use and forget](./_images/2025年，我的生产力设备里留下了这些优秀工具-1766977339137.webp)

Open-source tool adjusting brightness via monitor DDC/CI protocol. Controls multiple monitors simultaneously with linkage, timing, on/off functions. Like volume icon, mouse hover + scroll wheel enables precise brightness control.

Shortcuts: `alt + [ / ]` for ±10% brightness, `alt + \` for display off (not sleep).

### Potplayer & IINA: Video Players

Honestly, since NAS usage, PotPlayer mainly serves business project review purposes, rarely for movie watching. Still best Windows video player. AMD graphics cards can achieve excellent frame interpolation magic. A-card interpolation feels better than TV AI interpolation (unclear why).

IINA: macOS open-source universal video player, same purpose as PotPlayer (client reviews). Supports wider formats, better performance than spacebar preview for larger videos.

### Hidden Bar: Menu Bar Icon Management

Regardless of MacBook Pro notch, I use Hidden Bar to organize background tool icons. Reasons: cleaner interface during tutorials/screen sharing; many tools need running but not constant status monitoring (VPN, OneDrive, Stats below).

### AppCleaner

macOS GUI uninstall tool, intuitive simple design without extra features.

### Mole

Lightweight deep cleaning/system optimization tool for macOS by tw93. Core appeal: simplified command-line interaction (or minimal interface) for system junk cleaning, cache refreshing, large file scanning.

Terminal command (ensure trust before execution):

```shell
curl -fsSL https://raw.githubusercontent.com/tw93/mole/main/install.sh | bash
```

Command-line tool but no complex commands needed. Each operation has guidance. Like a mole, excels at deep junk file detection. Wish Windows had similar tool - recommendations welcome.

### Reeder

![Image from Reeder official website](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768213942326.webp)

RSS reader used since initial RSS exposure, maintained at last classic version.

UI: beautiful.

Created US Apple ID specifically for $5 purchase. Perfect support for mainstream/niche RSS platforms. Unmatched RSS reading experience across any platform.

### Capy Reader

![Capy Reader](./_images/2025年，我的生产力设备里留下了这些优秀工具-1767161542202.webp)

Mobile RSS reader focusing on Miniflux service integration. Basic functionality sufficient, stability good. Timed/manual sync, upward scroll auto-mark read, customizable gestures included.

## AI

AI discussed last as it permeated various workflows throughout 2025. Constantly provides solutions, creative inspiration, effect testing, material production using mainstream products.

Detailed discussion requires separate article. Brief experience sharing:

1. Prefer platforms allowing user data export
2. Remind yourself to use it
3. Ask precise questions
4. Encourage challenging your viewpoints

## Conclusion

Reviewing 2025, my productivity tools underwent fundamental shift from "cloud dependency" to "local control." Self-built servers and open-source ecosystem adoption restored data autonomy, building highly personalized system around "reading → recording → integrating → outputting" knowledge workflow. From Notion/Obsidian dual-core drive to Memos/Syncthing/Miniflux self-hosted service integration, tools transformed from isolated applications to synergistic, flexible components.

Tool selection criteria evolved from pure functionality to comprehensive consideration of product design philosophy, data sovereignty, long-term usability. Whether PowerToys' toolbox integration on Windows or macOS's small/beautiful system enhancements, they silently save precious mental energy and time.

Ultimately, excellent tools aren't about rankings or technical prowess, but genuine integration into work habits, quietly solving real problems while preserving focus and passion for creative process. Hope this preference-filled list provides inspiration for building your digital fortress.

First published on [CGArtLab](https://cgartlab.com).

---

## Reference Links

Main tools mentioned with official/related resources:

### Core Productivity Tools

- **Notion**: <https://www.notion.so>
- **Obsidian**: <https://obsidian.md>
- **Memos**: <https://github.com/usememos/memos>
- **Syncthing**: <https://syncthing.net>
- **Miniflux**: <https://miniflux.app>

### Desktop Platform General

- **Rime Input Method**:
  - Project homepage: <https://rime.im>
  - Configuration guide: <https://github.com/rime/home/wiki>
- **Calibre**: <https://calibre-ebook.com>
- **Eagle**: <https://cn.eagle.cool>
- **RustDesk**: <https://rustdesk.com>
- **Sunflower Remote Control**: <https://sunlogin.oray.com>
- **OBS Studio**: <https://obsproject.com>

### Windows Exclusive

- **Winget**: <https://learn.microsoft.com/en-us/windows/package-manager/>
- **PowerToys**: <https://github.com/microsoft/PowerToys>
- **Traffic Monitor**: <https://github.com/zhongyang219/TrafficMonitor>
- **HandBrake**: <https://handbrake.fr>
- **Twinkle Tray**: <https://github.com/xanderfrangos/twinkle-tray>
- **PotPlayer**: <https://potplayer.daum.net>

### macOS Exclusive

- **Hidden Bar**: <https://github.com/dwarvesf/hidden>
- **Stats**: <https://github.com/exelban/stats>
- **AppCleaner**: <https://freemacsoft.net/appcleaner/>
- **Mole**: <https://github.com/tw93/mole>
- **IINA**: <https://iina.io>
- **Homebrew**: <https://brew.sh>

### Mobile

- **Reeder 5 (iOS)**: <https://reederapp.com>
- **Capy Reader (Android)**: <https://play.google.com/store/apps/details?id=com.capyreader>

### Other Mentioned Services/Concepts

- **RSSHub**: <https://github.com/DIYgod/RSSHub>
- **Flomo**: <https://flomoapp.com>
- **Moememos App** (Memos client): <https://github.com/moememos/moememos-official-mobile-app>
- **Git**: <https://git-scm.com>
- **Docker**: <https://www.docker.com>
- **PVE (Proxmox VE)**: <https://www.proxmox.com>
- **Baota Panel**: <https://www.bt.cn>

---

**Note**: Some tools (uTools, FreshRSS, ToDesk, etc.) mentioned for comparison/replacement not included in main list. Verify link availability/compliance when accessing. GitHub repositories usually best sources for latest information/code for open-source projects.
