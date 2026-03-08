---
draft: false
title: NAS Beyond Photos - How to Build Your First Private Cloud for Creators - Part 2
abbrlink: nas-beyond-photos-your-first-private-cloud-2
published: 2026-01-27
tags:
  - Knowledge Management
  - Tech Sharing
description: NAS is more than just a networked hard drive box—it's your personal data center. This series skips complex code and commands to show you how to establish the most basic creative storage logic.
updated: 2026-01-24
pin: 0
toc: true
lang: en
---

![My current data center, all drive bays are now filled](_images/11月的拔草记录和选荐-1754916668923%201.webp)

## Before We Begin

In [Part 1](https://cgartlab.com/posts/nas-beyond-photos-your-first-private-cloud-1/), we discussed the essence of NAS and how to define your needs, much like figuring out how many bedrooms you need before buying a house. In this part, let's talk about how to choose and "decorate" this "villa" to make it truly your creative base.

If you're new to NAS and this is your first time exploring it, I recommend reading Part 1 first for a better experience. After all, before studying house decoration, you need to confirm if this house is really what you need.

## Building Your Four-Layer Creative Storage Logic

### Layer 1: Storage Foundation - Hard Drives and Arrays

Whether you plan to buy a branded NAS (like Synology, QNAP, etc.) or assemble one yourself like I did, the first step isn't directly researching hardware performance and brand characteristics. The priority should be doing some calculations:

1. **Estimate your data volume and assess your tolerance for data loss.**

For example, among your data, which files absolutely cannot disappear, which are nice-to-have, and which aren't very useful to you but meaningful to others? Based on this priority, roughly calculate the size of each category. Since people who generally decide to use NAS typically have considerable existing data and future data needs (I'd say 4TB+).

2. **Learn about hard drive arrays, also known as RAID.** Typically, for data security, NAS storage uses RAID configurations.

You might say, why not just estimate file sizes, double that capacity, and arrange hard drive space accordingly?

This is exactly why I suggest you estimate data volume by priority first—because different RAID schemes consume hard drive space differently and offer varying transmission speeds. (For specific details, you can consult AI; here I'll give a simple example to keep you reading smoothly.)

**Simple Analogy**: Hard drive arrays (RAID) are like stage performance **lighting**.

- **RAID 0**: Like connecting two light bulbs in series—if one fails, the whole stage goes dark (fast but risky).
- **RAID 1**: Like having an identical backup light next to the main light—if the main fails, the backup immediately takes over (the safest double insurance), and you might not even notice the performance interruption.
- **RAID 5**: Like a sophisticated lighting array—if one or two lights fail, the rest can still maintain full illumination through algorithms, and the performance continues.

I also struggled with RAID levels initially, but later realized it's like buying insurance—based on data value. I use RAID 1 (dual backup) for original materials, while finished files use regular storage. I keep one copy in cloud storage and one locally.

**The key isn't how amazing the technology is, but whether you'd regret losing the data.**

3. **Choose a pre-built NAS or DIY assembly?**

For beginners, I always recommend starting with pre-built options, even just to experience it.

The benefits are:

- **Good-looking**: Excellent brands invest in design, and aesthetics are indeed part of productivity.
- **Stable system, user-friendly**: Even complex operations come with step-by-step guidance.
- **Return policy available**: If unsatisfied or unaccustomed, you can return it.
- **Better after-sales service**: At least 2 years of warranty.

My first purchase was also a branded machine (I won't mention the brand...cough...this isn't an ad spot). The initial experience matched the points above. But as I used it more, the first issue that emerged was what I mentioned earlier—not estimating my data volume properly, leading to insufficient drive bays. Later, as my learning expanded, I discovered that NAS can also be assembled like desktop computers.

This brings us to the advantages of DIY NAS:

- **Every penny spent where it matters most**
- **Flexible configurations**: It can be a single circuit board (Raspberry Pi), a server cluster, or even an old laptop gathering dust in a cabinet
- **System freedom**: Design solutions based on your needs, whether "all in one" or "multiple instances"
- **Power consumption control**: Choose more energy-efficient components, or even set high-power components (like GPUs) to activate only when needed

Here's my hardware assembly plan as an example (reference the approach, as there are likely better value components now):

| **Component Name**                    | **Purchase Price** |
| --------------------------------- | -------------- |
| **CPU:** Intel i3-8100T           | **¥158.00**    |
| **Motherboard:** Yunxing CS2 B250 NAS Board | **¥469.00**    |
| **RAM:** Kingston DDR4 32GB (2x16GB) | **¥145.00**    |
| **Case:** Sagittarius 8-Bay (with SATA cables) | **¥359.00**    |
| **Power Supply:** Great Wall HOPE-6000DS 500W | **¥279.00**    |
| **Cooler:** Intel Original Thermal Cooler | **¥9.30**      |
| **System Drive:** Ruidun M.2 NVMe 256GB SSD | **¥99.90**     |
| **Total (excluding hard drives)**      | **¥1,520.20**  |

When assembled, it looks like the cover image. My main requirements were:

- **Enough drive bays**: This motherboard can also accommodate expansion cards for more SSD bays, with dual network ports.
- **Balance performance and power consumption**: The i3-8100T was the optimal choice, idling at under 5 watts, with built-in graphics capable of 4K hardware decoding for smooth streaming to my other devices.
- **Space isolation**: More drive bays mean heat management is crucial. Hard drives dislike high temperatures, so separating them from the motherboard is more scientific—hence this case choice.

Looking at the final total price, it's almost impossible to find a branded machine with the same performance, configuration, and expandability at the same price point. The money saved can buy an extra hard drive.

**Hardware chosen, what system to install?**

I'll only mention systems I've used: PVE and Feiniu OS.

I use PVE as the base layer, allocating half the computing resources to Feiniu OS. For everything else without special requirements, I use PVE's LXC containers (this technology is similar to Docker, but I haven't explored the deeper differences) to run different services.

**Currently includes:**

AdGuard Home (whole-house ad blocking)
Soft router (for "magic" networking)
Docker (yes, specifically for running Docker), which runs:

- miniflux RSS auto-subscription
- Fresh RSS (discontinued)
- memos fragment notes
- RSShub subscribe to everything
- ddns-go internal network penetration

![Docker services in LXC containers](./_images/NAS%20买回来只会存照片？创作者的第一台“私有云”该怎么玩%20-%20下篇-1769522207006.webp)

Two instances for my retired parents to play with blogging
And one final instance for various experimental tests.

It typically runs like this, with very low resource consumption while simultaneously handling various tedious tasks automatically.

![Memory usage not even half, potential is significant](./_images/NAS%20买回来只会存照片？创作者的第一台“私有云”该怎么玩%20-%20下篇-1769522609092.webp)

As for Feiniu OS, my overall impression is that there's a group of idealistic, tasteful people behind it.

### Layer 2: Service Framework (Core Application Scenarios)

After solidifying the storage foundation (hard drives and arrays), NAS begins to demonstrate its true value as a "data center"—it's no longer a passive warehouse but an intelligent hub that actively provides services, allowing data to flow securely and efficiently between all your devices. This layer focuses on the most core application scenarios that can immediately enhance creative efficiency.

#### Sync Drive: Say Goodbye to "File Transfer Assistant," Achieve Seamless Project Flow

Have you ever repeatedly opened that "file transfer assistant," or some cloud drive, or even a data cable, just to send yourself an ID photo, PDF, PPT, or compressed file? Project files get copied and pasted everywhere, and a week later you have to scroll through endless chat history to locate them.

Simply use NAS's built-in WebDAV or SMB file sharing features to create a "real-time sync folder" on your NAS. Or install tools like Syncthing to automatically sync different folders in the background to various devices that can install it.

From then on, inspiration photos from your phone automatically appear in your computer's material folder; design drafts modified on your tablet can be continued on your computer the next second. NAS becomes the **data convergence center** for all devices, achieving true "seamless project connectivity," especially suitable for creators working across devices like photography and design. This perfectly realizes the "inspiration library, ready to access anytime" concept mentioned in the previous article.

#### Backup Center: Automatic Insurance for Digital Assets

This is the most fundamental core function. I typically use Syncthing for real-time backup (synchronization) of three file directories:

- Current year's project files
- Note repository
- Blog article repository

As shown in the diagram below

![NAS-centric file synchronization scheme](./_images/2025年，我的生产力设备里留下了这些优秀工具-1768054689002.webp)

You'll notice I didn't set up the "real-time sync folder" mentioned in the previous section. This benefits from my own file management and naming conventions—the end result is that I only need to back up these three folders. I won't expand on this method here; if interested, feel free to comment below and I'll arrange to share it in the future.

#### Media Library: Unified Management and Playback

![Feiniu OS movie poster wall](./_images/NAS%20买回来只会存照片？创作者的第一台“私有云”该怎么玩%20-%20下篇-1769517885017.webp)

Actually, using NAS for music and movies is a well-known function. Compared to entertainment, since I've collected a vast amount of design materials, I care more about building a useful private library.

First recommendation is Calibre-web. For specific setup methods, see this previous [article](https://cgartlab.com/posts/how-to-build-library/). Additionally, since I've collected many large art books and setting collections for various games and films (over 100GB), and these files are PDFs, Calibre isn't very convenient for viewing them. So I found [Komga](https://komga.org/), which currently supports PDF and comic .cbz formats quite well.

![Marvel setting collection](./_images/NAS%20买回来只会存照片？创作者的第一台“私有云”该怎么玩%20-%20下篇-1769527882995.webp)

#### Download Station: Liberate Your Main Computer

In design work, especially in film and animation industries, you often need to download massive video and image materials. These files are typically huge. Using your main computer for downloads might interfere with other work like online meetings. This type of task is perfect for handing over to NAS.

You can even schedule download tasks from your phone and check progress anytime. This way, your main computer can focus entirely on high-load work like editing, encoding/decoding, and rendering output. Even better, downloaded files can be saved directly to your material library, so once downloads complete, you can open and use them immediately on your main computer.

For example, I directly place my Eagle material library on the NAS, and when downloading materials, I simply select the Eagle library path. Just think—without NAS, how much time would be wasted copying and pasting files that are often tens of gigabytes?

### Layer 3: Advanced Workflow Automation

When these basic services run smoothly, you might wonder:

Can NAS do more customized things for me? Of course, this leads to the third layer—further workflow automation through containerization technology.

The core technology used here is Docker containers. If you're not familiar with it, you can first get a general understanding. Here's another analogy: think of Docker containers as LEGO bricks.

Each container is a module with fixed functionality, such as a book management platform, an image/video compression/conversion application, a blog website, etc. Your NAS provides the base and instructions for running these "LEGO bricks."

Through my practice, I've found three major benefits to this container design philosophy:

- **Plug and play**: Like WeChat mini-programs—any device with WeChat installed can run all mini-programs. Any device with Docker installed can run any Docker application. Mini-programs still require scanning codes and agreeing to privacy terms, while Docker only needs one command.
- **Isolation and security**: Each Docker application runs in an independent sandbox. If one application has issues, it won't affect the NAS system itself or other applications.
- **Resource efficiency**: Multiple "LEGO bricks" can share the same "land area"—the system's storage and computing resources—saving significant time compared to installing virtual machines for each application separately.

For example, the "machine" responsible for Docker in my NAS looks like this:

![Extremely low resource consumption](./_images/NAS%20买回来只会存照片？创作者的第一台“私有云”该怎么玩%20-%20下篇-1769523704356.webp)

At this point, the content shared in this third layer isn't about showing off technology, but rather telling you:

- **Automated workflows are feasible—I've implemented some that are being used in real commercial projects**
- **These automated tasks only need to be deployed once and will run silently—the best technology is what you don't notice exists**
- **The ultimate goal is to minimize interruptions to your "flow state"**

If you have better solutions, feel free to share them in the comments.

### Layer 4: Access and Security (Connecting to the World)

When your NAS is finally running at home, becoming your data center, the next natural need is: How to access it securely from anywhere in the world? This layer concerns connectivity and permissions, allowing your "private villa" to open its doors to you from any corner of the world while ensuring only authorized people can enter.

#### Internal Network Penetration: Getting a Global Address

Your NAS is typically behind your home router, with an "internal IP" (like 192.168.1.100). This is like a villa on a private path deep in the mountains—outsiders can't find it directly. Internal network penetration technology applies for a **globally unique address** for this villa and establishes a secure channel.

For beginners, many NAS systems (like QNAP, Synology) or third-party tools (like DDNS-GO, FRP) offer near one-click configuration. More advanced users can use modern VPNs like `Tailscale` based on WireGuard—it's simple to configure, enabling direct, encrypted connections between devices without needing public IPs or complex port forwarding.

From then on, you can directly read design materials from your NAS using a laptop in a café thousands of kilometers away, sync your project files, and more securely and elegantly showcase cases to your clients.

#### Permission Management: Setting Room Keys for Different Members

The villa has an address, but not everyone should be able to enter. Permission management involves distributing "keys" to different rooms for family, friends, and work partners.

In NAS systems, you can create different users, groups, and file access permissions. For example, if Old Zhang and Little Wang are both clients, their accounts can be set to only access delivery folders under specified projects.

Permission management scenarios vary for everyone, but you can follow the "principle of least privilege." This means granting only the minimum permissions necessary to complete tasks. For example, for clients mentioned above, only grant "read" file permissions, and only open "write" permissions when necessary.

## Philosophy Over Technique: Sustainable Storage Philosophy

There's no unchanging, rock-solid system architecture. Even in natural sciences, entropy increase and impermanence are eternal laws. Building this automation system is definitely a lengthy process that consumes significant time and energy, dealing with various minor issues and imperfections.

There's no absolute good or bad, only relative suitability. The method that feels most suitable to you right now is the best—don't doubt it.

- **If not necessary, don't add entities**—this is also my workflow value.
- **Accept imperfection**: The system might be crude initially, but "looking at the whole, perfection is in the evolutionary process."
- **It should be a silent foundation**: The best technology is what you don't notice exists, allowing you to focus more on creation itself.

At this point, a complete, three-dimensional creator NAS system is built: from the storage foundation (Layer 1), to core services (Layer 2), to workflow automation (Layer 3), and finally connected to you 24/7 through secure channels (Layer 4).

Have you thought about what you'll create with it?

---

### Reference Links

- [Feiniu OS Official Website](https://www.fireneve.com/)
- [Syncthing Official Website](https://syncthing.net/)
- [Tailscale Official Website](https://tailscale.com/)
- [DDNS-GO Official Website](https://ddns-go.com/)
- [Calibre-web Official Website](https://calibre-web.readthedocs.io/en/latest/)

---
