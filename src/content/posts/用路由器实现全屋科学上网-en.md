---
title: Achieving Whole-House Scientific Internet Access with Router Configuration
published: 2023-03-12
description: This article explains how to achieve whole-house scientific internet access using a router, including steps like unlocking SSH, calculating router root password, using Termius to enable SSH, and installing/configuring ShellClash. Using Redmi AX6S router as an example, but theoretically this process applies to various routers, provided you can find unlockable firmware and root password calculation methods for the specific model.
updated: 2023-03-14
tags:
  - Tech Sharing
draft: false
pin: 0
toc: true
lang: en
abbrlink: how-to-setup-full-home-science-internet
---

![Cover](./_images/用路由器实现全屋科学上网-1754477267589.webp)

## Introduction

Last year I purchased a NAS, but was still using a single gigabit port router, and my home network needed a full gigabit router for data exchange. So during a promotion, I bought a Redmi AX6S router. Before purchasing, I didn't research much and certainly didn't expect that a 200+ RMB router would hide such a killer feature. Here I'll document the specific operation process. This process is theoretically applicable to various routers, provided you can find **unlockable firmware and root password calculation methods for the specific model online**. By 2023, these shouldn't be difficult problems. I'll use Redmi AX6S as an example.

## Preparation

Hardware: Router, one network cable, a PC/Mac with normal internet access

Software: Browser, download and install [Termius](http://www.termius.com/), unlock firmware file

Knowledge: Experience with independent scientific internet access, understanding basic airport and VPS server usage methods.

## Unlocking SSH

💡

SSH is a network standard encrypted communication protocol between two computers. Since routers are actually small computers (with CPU, memory, storage chips), commercially sold routers generally hide SSH functionality, so we need to unlock it first.

Steps:

1. **Flash Development Version Firmware**

Download the installation firmware in advance. For my Redmi AX6S, the corresponding filename is **miwifi_rb03_firmware_stable_1.2.7**

Enter the router backend in browser window. Xiaomi router address defaults to: 192.168.31.1, enter backend administrator account password (may vary by brand).

![Router Backend Login](./_images/用路由器实现全屋科学上网-1754477288953.webp)

Click username in top right corner, select "System Upgrade"

![System Upgrade Interface](./_images/用路由器实现全屋科学上网-1754477301211.webp)

In the upgrade detection section, select manual upgrade, choose the firmware file downloaded on your computer, click start upgrade. Don't worry about bricking it.

![Upgrade Firmware](./_images/用路由器实现全屋科学上网-1754477318190.webp)

Wait for upgrade completion and restart, then reconnect to WiFi.

1. **Calculate Router Root Password**

Now the router's system actually has SSH functionality. We need to calculate the login password based on each router's unique SN number to obtain system highest-level permissions.

Password calculation methods can use online websites or local html files. Common router models have methods shared by experts on Github or related forums. I'm using the local html method here. Can be used directly:

[Xiaomi SN](./_files/小米 SN.zip)

Open html file, enter SN to calculate password

![Calculate Root Password](./_images/用路由器实现全屋科学上网-1754477350716.webp)

1. **Enable SSH Using Termius**

Termius is a famous cross-platform SSH client, user-friendly for beginners, and the features we need are completely free. Experts can directly use computer terminal for this step.

Installation not detailed here, this is the official website.

Open Termius, skip beginner steps, select Hosts in left column, click NEW HOST

Other parameters as shown below, Label can be written arbitrarily, Address fill in router's IP address, note connection method select **Telnet**, then click blank space on left to save.

![Termius Configuration](./_images/用路由器实现全屋科学上网-1754478711021.webp)

Then double-click the saved Host for Telnet connection. ([Telnet is also a network communication protocol](https://baike.baidu.com/item/TELNET/810597))

- login: root
- password: Paste the calculated root password here (won't display, just press enter)

![SSH Connection Successful](./_images/用路由器实现全屋科学上网-1754478737284.webp)

Copy the following code to enable SSH function module.

```bash
nvram set ssh_en=1 & nvram set uart_en=1 & nvram set boot_wait=on & nvram set bootdelay=3 & nvram set flag_try_sys1_failed=0 & nvram set flag_try_sys2_failed=1
nvram set flag_boot_rootfs=0 & nvram set "boot_fw1=run boot_rd_img;bootm"
nvram set flag_boot_success=1 & nvram commit & /etc/init.d/dropbear enable & /etc/init.d/dropbear start
```

![Enable SSH Command](./_images/用路由器实现全屋科学上网-1754478854626.webp)

1. **Login to SSH**

Create another new Host

- Address fill in: 192.168.31.1
- Check SSH, close Telnet
- SSH username fill in: root
- Password paste previously calculated root password

Click arrow in top right corner, then the newly created Host, select connect using SSH method.

If you see this interface, you're mostly successful!

![SSH Login Interface](./_images/用路由器实现全屋科学上网-1754478906706.webp)

## Install and Configure ShellClash

>[!note] Friends who don't know what Clash is can search Baidu to understand.

ShellClash is a variant version of Clash that supports running on various router systems and Linux environments. Specific introduction here:

### Installation

In the SSH Host, directly paste the following command to install ShellClash.

```bash
export url='https://raw.fastgit.org/juewuy/ShellClash/master' && sh -c "$(curl -kfsSl $url/install.sh)" && source /etc/profile &> /dev/null
```

- Select "2" stable version
- Then enter "1" confirm installation (I won't reinstall here)

![ShellClash Installation](./_images/用路由器实现全屋科学上网-1754478987763.webp)

### Configure Clash

After installation, continue entering Clash, press enter.

- Select 1 Host or bypass router
- Select 1 Do not proxy UDP

![Clash Configuration Interface](./_images/用路由器实现全屋科学上网-1754479004205.webp)

To avoid needing to open Termius every time setting Clash, we need to install a software interface, i.e., local Dashboard panel.

- Select 1 Install Dashboard panel
- Select YACD panel (sequence numbers here may vary)
- Select 1 /data/clash/ui directory installation

![Dashboard Panel](./_images/用路由器实现全屋科学上网-1754479017651.webp)

After installation, select 1 Enable public network access service

- Select 1 Start import
- Select 1 Online generate configuration file
- Paste your subscription link (provided by your airport or VPS service provider)

![Subscription Link Configuration](./_images/用路由器实现全屋科学上网-1754479036417.webp)

If you've made it this far, I believe you understand airports and VPS servers.

- Select 1 Start generating configuration file
- Select 1 Immediately start Clash service
- Select 0 Exit script

If all goes well, your ShellClash should now work normally.

Open `http://192.168.31.1:9999/ui` router IP address in browser to access your router Clash backend.

If no other requirements, suggest turning off router firmware updates.

![Clash Backend Interface](./_images/用路由器实现全屋科学上网-1754479052164.webp)

## Conclusion

At this point, any device in your house accessing internet through this router will be "scientific". You can switch different nodes anytime through phone or tablet browser. This is currently the most scientific internet access method I've used.

Good luck!

## Weekly Highlight

This week started trying TimeBlock time management method. Previously saw various time management introductions online, always had the impression:

"Wow... no need to go this far?"

"Feels like living like a robot"

Until my own business projects, various life chores kept increasing, causing frequent anxiety, then I decided to try it. Feels really good. Specific approach I referenced this article:

I created a version using iCloud calendar according to my situation, then synced this calendar to all my devices.

Of course you can create your own version according to your habits. What tool used isn't important, initially just using phone's built-in calendar is enough.

![TimeBlock Calendar](./_images/用路由器实现全屋科学上网-1754479225896.webp)

Forgot where I saw this sentence:

> If you don't try to control your time, you will be controlled by time.

See you next week?
