---
title: How to Use Mac More Elegantly in 2024
published: 2024-12-11
description: A comprehensive guide to optimizing Mac usage in 2024, from system configuration to software selection, with practical tips to enhance Mac experience and work efficiency
updated: 2024-12-11
tags:
- Technology Sharing
draft: false
pin: 0
toc: true
lang: en
abbrlink: 2024-elegant-use-mac
---

![Cover: 2024 Mac Usage Optimization Guide](./_images/2024年，如何更优雅地使用%20Mac-1754591124732.webp)

## Introduction

To my surprise, last month's article ["2024 Guide: How to Use Windows PC Elegantly"](https://cgartlab.com/posts/2024-elegant-use-windows/) was featured on the homepage of SSPAI. Thank you all for your encouragement and support. Today, I'd like to share some insights about using Mac.

My career started as a 3D designer, and my main machines were always Windows PCs. I haven't been using Mac for that many years - my interest was purely driven by my appreciation for Apple's design philosophy and their high-quality displays. My first Mac was a 15-inch MacBook Pro from 2014, sponsored by my parents after I graduated and started working. It had a 4th generation i7 processor with 16GB RAM and 512GB storage. Unfortunately, it was stolen within six months, before I could really experience OS X Mavericks. Back then, there was no Touch ID unlock, and Apple's lost and found services in China weren't well developed, so I never got it back. My first impression of Mac? Expensive and easily stolen.

![MacBook Pro 2014: My first Mac, stolen with regret](./_images/2024年，如何更优雅地使用%20Mac-1754591139622.webp)

After quitting my job to study in Thailand, I bought my second Mac - a MacBook Air 2017 (the last Mac designed with Steve Jobs' involvement) using money I earned from freelance work. I mainly used it for writing papers and organizing photos. During my three years of graduate studies, I truly experienced Mac's rock-solid stability, which convinced me to try another Pro model for my workflow.

During this period, because Intel Macs were overpriced with underpowered specs, I even built a [Hackintosh solution](https://github.com/cgartlab/Hackintosh---MSI-B360m-Mortar) to test if my workflow could run smoothly. By the time I finished, I felt like I'd become half a programmer.

I waited until 2021 when the M1 series MacBook Pro was released, and immediately bought one. It remains one of my main machines to this day. This article is based on my experience with this device running macOS Ventura.

Mac seems to have "elegance" engraved in its DNA, thanks to the perfect integration of hardware and software - even more so since the transition to Apple Silicon. However, even the most elegant tool depends on how people use it. Using a scalpel to open packages isn't exactly appropriate. This reminds me of my confusion when I saw sophisticated white-collar workers in Starbucks opening their glowing Apple logos, only to reveal Windows 7 on the screen.

A tool designed to be user-friendly is natural. To achieve "elegance," I still follow the same principles:

> **Simple and Intuitive:** Chosen tools should be easy to use with clean, clear interfaces that are easy to master.
> **Adaptable and Flexible:** Tools should be adjustable and customizable according to different needs.
> **Integration and Compatibility:** Tools should seamlessly integrate with other platforms and tools.
> **Cross-Platform Synchronization:** Tools should sync across multiple devices and platforms.

During my usage, I discovered that even Macs with "impeccable taste" (as Steve Jobs would say) can struggle with relatively heavy workflows like 3D, video, graphic design, animation, gaming, and CG art. Most issues arise from plugins not being developed for macOS, or occasional adaptations that aren't native applications. The most serious limitation is that M-series chip machines cannot connect external GPUs - if you need CUDA 3D graphics acceleration, you'll have to stick with Windows.

Therefore, I use Mac more for light to medium projects, and during this time, I've summarized some approaches, practical tips, and tools to share with you.

## Initial Setup and Optimization

Similar to Windows PC, when you get a new Mac or reinstall the system, don't rush to install software. I won't elaborate on Apple ID - buying a Mac without registering and logging in would be wasteful. Here are my basic setup habits.

## Basic Settings

Unlike with PCs, I rarely delete Apple's built-in applications. Even if I don't use some of them, I keep them as reference cases for UI design projects - they're ready-made examples of visual detail handling.

When not using an external display, I prefer to hide the Dock to maximize screen space utilization.

Regarding system settings, I won't list the common ones, but here are some less common but useful features:

1. In System Settings ➡️ Select connected Wi-Fi ➡️ Click Details, you can turn off "Limit IP Address Tracking." The benefit is that images in emails will load automatically without manual loading each time.

![Wi-Fi Settings Interface: Disable IP Address Tracking](./_images/2024年，如何更优雅地使用%20Mac-1754591186836.webp)

2. In System Settings ➡️ Accessibility ➡️ Pointer Control, click Trackpad Options to enable "Three-finger drag." This allows you to drag windows or files without clicking. Personally, I find this very convenient when not using a mouse.

![Trackpad Settings: Enable Three-Finger Drag](./_images/2024年，如何更优雅地使用%20Mac-1754591199470.webp)

3. If you're using or reinstalling the system for the first time via backup recovery, I recommend temporarily disabling Spotlight and excluding external disks you don't want indexed in "Spotlight Privacy." Otherwise, indexing hundreds of gigabytes of files will heavily consume CPU resources. You can enable it during idle time as needed.

![Spotlight Settings: Disable System Indexing](./_images/2024年，如何更优雅地使用%20Mac-1754591221084.webp)

![Spotlight Privacy Settings: Exclude External Disk Indexing](./_images/2024年，如何更优雅地使用%20Mac-1754591228224.webp)

4. If you've connected a Mi Home printer, in Printers & Scanners ➡️ Select connected printer ➡️ Options & Supplies ➡️ Show Printer Web Page, you can directly view various service statuses in the browser. Other brands might have similar features - worth trying.

![Printer Settings Interface: Select Connected Printer](./_images/2024年，如何更优雅地使用%20Mac-1754591279388.webp)

![Printer Options: Display Printer Web Interface](./_images/2024年，如何更优雅地使用%20Mac-1754591286702.webp)

5. Hot Corners: Designers usually keep their hands on the mouse and rarely use the trackpad. This is a practical feature comparable to shortcuts and trackpad gestures. In System Settings ➡️ Desktop & Dock ➡️ Hot Corners (at the bottom), you can set different functions when the mouse moves to the four corners. My settings are shown below.

![Hot Corners Settings: Customize Functions for Four Corners](./_images/2024年，如何更优雅地使用%20Mac-1754591307788.webp)

6. Content Caching: In System Settings ➡️ General ➡️ Sharing, you can enable "Content Caching," choosing to cache iCloud files locally and share them with other Apple devices on the LAN. This saves local space while eliminating significant file download times. Click "Options" next to it to set cache location and space allocation. I don't recommend selecting "Cache all files" as that would include system update packages from other devices - iOS updates are best downloaded on the respective devices themselves.

![Content Caching Settings: Enable iCloud File Local Caching](./_images/2024年，如何更优雅地使用%20Mac-1754591342309.webp)

## Performance Optimization and Power Management

For ARM-based Macs, the only performance aspect worth attention in my view is whether the software itself is a native application. You can click the Apple logo in the top-left corner ➡️ Hold Option key ➡️ System Information ➡️ Applications, then click the "Kind" column in the top-right to sort. Generally, there are four types: Apple Silicon, Universal, iOS, and Intel, with performance decreasing in that order (though Intel versions aren't weak).

![System Information: Check Application Architecture Type](./_images/2024年，如何更优雅地使用%20Mac-1754591350326.webp)

For lightweight applications, performance impact from traditional Intel-type apps is negligible. However, for professional applications involving intensive computing, the performance impact is more noticeable. It's best to check if an ARM version exists before installation.

On the other hand, macOS's own power management is already top-tier. There's no need to sacrifice experience for minimal battery life and endurance. I don't have special setup techniques, only one philosophy - **continuously optimize workflows to complete work faster**. The logic is simple: when using MacBook on battery power, in over 90% of usage scenarios, the biggest power consumer isn't the CPU but the screen. Finish your work and you can turn off the screen. Sounds like "correct but useless advice," right? But using this philosophy, my results are 82 battery cycles with 98% maximum capacity remaining. Just charge when needed without overcharging or deep discharging - no need to worry too much.

![Battery Health Status: 82 Cycles, 98% Capacity](./_images/2024年，如何更优雅地使用%20Mac-1754591357778.webp)

## Startup Items

macOS startup items are similar to PC's, divided into software-specific settings and global settings. I recommend modifying global settings first. The location is System Settings ➡️ General ➡️ Login Items.

![Login Items Settings: Manage Startup Programs](./_images/2024年，如何更优雅地使用%20Mac-1754591364475.webp)

## Memory and Junk File Cleaning

Laptops generally don't have as much RAM as desktop PCs, so I pay more attention to memory usage when working on macOS. I don't understand system architecture, so I'll only share real experiences.

Since modern Macs use unified memory architecture (where memory also serves as VRAM), macOS is less aggressive in memory management compared to Windows. Especially with browsers, occasionally when I'm using professional software and browsers simultaneously, memory pressure shows as too high. Simply clearing Safari's cache manually can release significant memory. First, enable Safari's developer features, then a "Develop" menu will appear in the menu bar. Select "Empty Caches" - generally, this can instantly free up 2-3GB.

![Safari Developer Menu: Enable Developer Features](./_images/2024年，如何更优雅地使用%20Mac-1754591372136.webp)

![Safari Clear Cache: Release Memory Usage](./_images/2024年，如何更优雅地使用%20Mac-1754591381045.webp)

To free up more space, you can use Privacy ➡️ Manage Website Data ➡️ Remove All. However, this cleaning will cause Safari to "forget" your settings and login status for these websites.

When using Windows, I rarely cleaned so-called "junk files," and it's even more so with macOS. After using Tencent Lemon Cleaner for a while, I found that large files were only WeChat caches, trash, and browser caches. So I've hardly used such software since. The only time I might need them is when using relatively obscure professional software that leaves cache files - these are troublesome to clean manually as you can't modify paths, they're deeply hidden, and require high permissions.

Mainstream design software actually allows setting corresponding cache paths. For example, Adobe's Photoshop, Illustrator, AE, and PR can find relevant settings in Preferences. 3D software like C4D, ZBrush, Rhino, Unity have more detailed settings. When doing design work, I usually connect an external SSD and set all cache paths to a folder named "Cache" in the root directory. After completing work, I simply empty this folder.

## Shortcuts

Overall, Shortcuts don't suit my main work scenarios. The only one I've kept is ["Battery Life"](https://www.icloud.com/shortcuts/c52b26a276c04059b68fc31b5bb5929e), which I synced from iOS. Its principle is very simple - you need to enable "Logging & Analytics" in settings so the system records usage logs (for about one to two weeks), including battery cycle count and peak capacity. This shortcut extracts this data and saves it as a separate file.

Actually, I only use it to observe if battery degradation is normal after buying new devices or updating systems. If there are no major issues, I stop using it.

![Shortcuts Battery Life: Monitor Battery Health Status](./_images/2024年，如何更优雅地使用%20Mac-1754591396304.webp)

Shortcuts actually have many potential uses. The only drawback is cross-platform compatibility - without your own server, it's difficult to sync with Windows and Android devices, but achieving this would defeat the purpose of being "quick." Therefore, for beginners, I strongly recommend third-party IFTTT (If This Then That) - very powerful and stable. I'm still exploring it and will share results when I have some. If you have better solutions, welcome to share in the comments.

## Directory Structure and File Management

As mentioned in my previous article ["Flowing Programs, Iron Data"](https://cgartlab.com/posts/flow-program-iron-data/), I established core principles for directory structure and file management:

> **Don't add classifications unless necessary:** The premise is that the classification can be exhaustive. For example, common file types are documents, images, videos, compressed files, installation packages, but formats are countless.
> **Complete archiving within 1 minute:** I've seen many people know archiving is important, but few persist for a year. Often, after finishing work, people are already frustrated and tired - who has the energy? Actually, with proper classification, 1-minute archiving becomes natural.
> **Use English/Pinyin + date numbers for naming:** This is a professional habit, as many professional applications only recognize English paths, and some fonts don't support Chinese, displaying garbled text.
> **Back up important files weekly with both cold and hot backups (repeat three times for emphasis).**
> You can skip organizing, but please back up - for world peace.

These principles remain rock-solid. For more specific operations, you can read the original article. Of course, rules may evolve with workflows. If there are major changes in the future that prove stable and useful, I'll write another introduction.

macOS and Windows have some differences in system-level file management, stemming from different design philosophies, but this doesn't affect how we manage directories and files ourselves. For example, file display and viewing methods seem more reasonable in macOS than Windows in my opinion. Column, tree hierarchy, and gallery views make file organization and classification more efficient, while Windows requires third-party software like Q-Dir to achieve similar functionality.

Also worth noting: in macOS, almost any window will automatically adjust size when double-clicking the top based on window content, rather than maximizing. Moving the mouse cursor to window edges and double-clicking will expand to the corresponding screen edge. Additionally, in Finder (I still prefer calling it that), you can use `Command + J` to open View Options, adjusting file name font size, calculating all sizes, etc. - very practical.

![Finder View Options: Customize File Display Methods](./_images/2024年，如何更优雅地使用%20Mac-1754591405789.webp)

However, the ultimate goal of file management is to make it easy for your future self to find things. Therefore, regardless of platform, standardized naming is more important - for both folders and files. I believe there are three relatively scientific naming approaches:

1. **P.A.R.A. Theory** proposed by productivity expert [Tiago Forte](https://fortelabs.com/about-forte-labs/), with many online introductions available.
2. Files on devices fall into only two categories: **those I created/participated in making, and those made by others with value.**
3. **Combine and uniformly execute** the above two points.

How to implement this depends on your work style. I believe and have tested that spending some initial time on this will definitely save more time later.

## Efficient Workflows and Common Software

Regardless of device, everything revolves around completing tasks through corresponding workflows, then choosing which tools to use at each stage. Continuously iterating and improving workflows through these tools and experiences has always been my philosophy.

## Multitasking and Virtual Desktops

Ventura added Stage Manager for multitasking. Analyzing the design concept, this function is similar to Windows' window grouping. But it's not as intuitive as Windows - perhaps because I'm not used to it, I never understood its usage scenarios.

Writing this, I specifically opened it to try again. Well, I'd rather choose connecting an external monitor, virtual desktops, or iPad Sidecar. Fortunately, macOS Sequoia finally added this feature, making Stage Manager even more awkward.

![Stage Manager Function Demo: Multitasking Interface](./_images/2024年，如何更优雅地使用%20Mac-1754591513469.gif)

Some common shortcuts:

`Command + Space`: Activate global search

`Alt + Tab`: Quickly switch between foreground applications

`Ctrl + ⬆️`: Open Mission Control, click plus sign in top-right to create new virtual desktop

`Ctrl + ⬅️/➡️`: Switch between virtual desktops

## Cross-Platform Collaboration

Using both Mac and Windows PC simultaneously inevitably involves cross-platform data synchronization and operations. As known, macOS can only read NTFS format disks but not write. Windows requires third-party software to read/write Mac disks. The only format both can read/write is exFAT, but this format is old and not particularly stable. Frequent plugging/unplugging hard drives isn't elegant either.

For beginners with light usage, I recommend choosing official cloud synchronization services like iCloud or OneDrive - worry-free. The downside is being locked into ecosystems - the more data stored, the more investment required. For slightly larger files, you can use SMB for LAN file sharing and transfer.

For heavy users like me, with numerous and large design materials and project files (a single project starts at 50GB), I've developed a solution: a DIY NAS running PVE system. I use Syncthing for LAN file synchronization, NextCloud for private cloud storage, Calibre service for managing e-books and documents, ShellCrash for magic, and even installed WordPress to learn website building (tiny-rss still under research).

The machine configuration is shown below - actually, the i3 CPU is already overkill. Excluding storage drives, the cost was under 800 RMB. It's been running for over a year with no failures except power outages. Easy to expand and maintain - replace whatever becomes insufficient in the future.

![DIY NAS Configuration: i3 Processor, Cost Under 800 RMB](./_images/2024年，如何更优雅地使用%20Mac-1754591523386.webp)

This gives me my own data center, ignoring any system limitations. With 2500 Mbps LAN speed, Mac can even directly call high-definition video materials from this NAS, allowing me to edit videos while lying on the sofa.

Of course, there are many ready-made NAS options on the market, just with relatively lower freedom and cost-effectiveness. The advantage is out-of-the-box usability without hassle. Some even support Mac's native "Time Machine" backups.

## Recommended Common Apps

With Apple's software ecosystem, built-in applications can handle over 80% of my light tasks. Here are some third-party apps I use. Due to space limitations, I won't详细介绍具体使用方法.

**[Hidden Bar](https://apps.apple.com/cn/app/hidden-bar/id1452453066?mt=12)**: Selectively hide top menu bar icons, open source and free.

**[Stats](https://github.com/exelban/stats)**: System status monitoring, open source and free.

**[uTools](https://u.tools/?c=gtibmqs3my)**: Previously introduced. Quick launch bar, small size, rich plugins and functions, free features sufficient. [Get 30-day member trial](https://u.tools/?c=gtibmqs3my).

**[AppCleaner](https://freemacsoft.net/appcleaner/)**: Uninstall tool, extremely lightweight, free.

**[LocalSend](https://localsend.org/zh-CN)**: Peer-to-peer cross-platform file transfer in offline environments, open source and free.

**[IINA](https://iina.io/)**: Possibly the best video player on Mac, open source and free.

**[NeoServer](https://apps.apple.com/cn/app/neoserver-docker-ssh-sftp/id6448362669)**: Possibly the best server monitoring application on Mac, free, universal across Apple platforms.

**[Reeder](https://reederapp.com/ "Reeder")**: RSS reading tool, available on all Apple platforms, requires US Apple ID for purchase.

**[HomeBrew](https://brew.sh/zh-cn/)**: Software package manager running in terminal, can be understood as a third-party App Store. For convenient self-installation, [I made a small script](https://github.com/cgartlab/Software_Install_Script) for one-click installation, open source and free.

## Summary

Thanks to Mac's excellent hardware-software integration design and complete ecosystem, these software mostly serve as enhancements. Combined with beautiful UI and strict quality review, third-party applications on Mac often have higher quality than Windows platform counterparts.
