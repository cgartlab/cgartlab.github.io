---
title: "From Hackintosh to Indie Blog: My Open Source Journey - No.17 Black Light Weekly"
published: 2026-05-02
updated: 2026-05-02
description: "During the early pandemic, I first encountered open source through tinkering with Hackintosh. Starting with using files shared by others, it wasn't until I read driver source code and saw hundreds of people debugging hardware IDs that I realized this system was built brick by brick by volunteers in their spare time."
tags:
  - Weekly
  - Open Source
  - Hackintosh
draft: false
pin: 0
toc: true
lang: en
abbrlink: weekly-17
---

![cover](../_images/从黑苹果到独立博客，这是我的开源旅程%20-%20No.17玄光周刊-1777653407966.webp)

This issue's cover comes from a Hackintosh mini PC I configured the year before last. This cover was [used once before](https://cgartlab.com/posts/build-a-macmini/), and it's placed here because my open source journey is connected to it.

---

## About Black Light Weekly

> This is an electronic weekly focusing on knowledge management, covering digital art, visual design, and frontend development. Currently published once a week, each issue selects a specific topic for in-depth reflection. If you find the content here worthwhile and want a better reading experience, we recommend using a browser to visit the official website. You're also welcome to use **RSS** (https://weekly.cgartlab.com/feed/atom) or **Email Subscription** ([https://weekly.cgartlab.com](https://weekly.cgartlab.com)) to subscribe.

---

## My Open Source Journey

> My GitHub homepage: [https://github.com/cgartlab](https://github.com/cgartlab)

I first encountered the concept of open source at the beginning of the pandemic. Being stuck at home with nothing to do, I started tinkering with Hackintosh. So-called Hackintosh means installing macOS on a Windows PC. At that time, Apple hadn't released the M-series chips yet, and genuine machines generally had the problem of high prices with low specs. So in order to use both Windows and Mac simultaneously, I started my tinkering journey.

At that time, there were very few domestic forums discussing Hackintosh, just a handful of websites. The tinkering process itself is not worth mentioning, but what does this have to do with open source? In fact, the essence of running macOS on a PC is making the Apple system treat a Windows PC as normal Apple hardware. This requires certain parameter adjustments to the bootloader files, including but not limited to various drivers, hardware IDs, model spoofing, and various code additions and deletions.

At that time, I was just a "taker" — finding EFI folders shared by others on forums and GitHub, downloading them, applying them, and considering it a victory if I could successfully boot up. I rarely thought about who wrote these files and why they were shared for free.

Until one time, I encountered a black screen problem with no clue, and had to bite the bullet and read through the source code comments of those drivers and patches. In those messy English documents and code commit records, I saw dozens or even hundreds of people repeatedly debugging and discussing a hardware ID. **At that moment, I suddenly realized: a group of strangers from all over the world, merely for a common interest goal, could cooperate non-profitably like this.** It reminded me of the golden age of the PC internet when eDonkey was still alive — very pure and nostalgic.

That feeling is completely different from simply downloading cracked software. Although I only modified some parameters, I could already feel myself standing in a huge cooperative network. It turns out that so many people have encountered the same problems as me, which also made me start thinking: can I transform from "taking" to "participating"?

After solving more than a dozen problems of various sizes, the system gradually began to stabilize. I even started using it as my main machine for completing commercial projects. After using it stably for a period of time, I also tried [uploading my own bootloader files to GitHub](https://github.com/cgartlab/Hackintosh---MSI-B360m-Mortar). Open source is not that lofty — it's just a group of ordinary people willing to share what they've tinkered with, and then more and more people willing to tinker together, enjoying the process.

---

## This Issue's Recommendations

### Math Curve Animation Collection

![](../_images/从黑苹果到独立博客，这是我的开源旅程%20-%20No.17玄光周刊-1777530794891.webp)

🔗 https://paidax01.github.io/math-curve-loaders/

This is an open source project focused on creating exquisite loading animations using mathematical curves. It showcases various dynamic visual effects implemented using mathematical functions and geometric principles. AI summarized the main four categories for me:

- **Bezier Curve Animations**: Smooth curve paths generated through control points
- **Trigonometric Function Animations**: Using sine, cosine, and other functions to create periodic flowing effects
- **Parametric Equation Animations**: Special curves such as rose curves and cardioids depicted through parametric equations
- **Polar Coordinate Animations**: Spirals, petals, and other patterns generated based on the polar coordinate system

Each animation comes with source code, making it convenient for developers to learn and directly apply to projects. Theoretically, they can also be ported as AE expressions. Friends doing MG animation can play with them — after all, such elegant animations with high precision are difficult to replicate with keyframing.

### Krita — A Very Low-Key Open Source Digital Painting Tool

![SCP_03](../_images/从黑苹果到独立博客，这是我的开源旅程%20-%20No.17玄光周刊-1777530092204.webp)

🔗 https://krita.org

Krita is an open source painting tool that I've been paying attention to. Unlike Photoshop, which is a hodgepodge, Krita has a very clear positioning: a painting application specifically serving digital artists. Vector layers, animation timelines, and rich brush engines — these features cost a lot of money in commercial tools. Krita's development is completely community-driven, and with every major version update, you can see user feedback being taken seriously. Although the pace of new feature releases is relatively slow, it wins in being very stable.

I once painted the third piece of my SCP series using Krita. It was very lightweight, and a canvas with the long side close to 8k pixels ran very smoothly on a PC with 16GB of memory.

### If AI Replaces Most People, How Will Class Struggle Develop?

🔗 https://www.zhihu.com/question/268078103/answer/2026420567713039329

Yesterday, I saw a very interesting Zhihu answer. The author jumped out of the technical and business levels, and starting from the objective laws of theories such as physics, cybernetics, and evolutionary game theory, analyzed the relationship between large model platforms and ordinary people.

From the perspective of physical thermodynamics, AI platforms are first and foremost a "dissipative structure." Human bodies, enterprises, countries, and so on are all such structures. Their nature and evolution laws cannot escape the fundamental attributes brought by this basic system structure. Then from the perspective of cybernetics, our coping strategy should be to increase our own diversity, that is, so-called "cross-disciplinary" approaches. Then from the perspective of evolutionary game theory — the hawk-dove game — our core strategy is not to confront AI head-on. If the replacement of AI in your field is leapfrog (the kind that can be replaced in one update), the only rational choice is to switch to a new field as soon as possible.

Finally, returning to the thermodynamics perspective, because overall resources are limited, what we can do is to observe whether the overall trend of those fields affected by AI is growing or shrinking. One key criterion is whether AI's input of high-quality data nutrients to the field is greater than its output, and whether it will eventually likely lead to input exceeding output. If so, you can judge that this field is shrinking. The article says self-media writing is...

## Video Recommendation

![](../_images/从黑苹果到独立博客，这是我的开源旅程%20-%20No.17玄光周刊-1777652961215.webp)

[S01E01 Christoph Niemann: Illustration _ Bilibili](https://www.bilibili.com/video/BV1AE411t7Jo?spm_id_from=333.788.videopod.episodes&vd_source=55f768ce35e0b7a5a1934a62fcb29bd4&p=2)

A documentary that never gets old, just like Friends — I almost always find an excuse to rewatch it every year. Every time, I gain new insights.

---

## Closing and Preview

### Preview

This issue's recommended content is relatively sparse because I've been intensively developing various Skills for my own use lately. And after DeepSeek's price drop, it's so great — Chairman Liang's kindness is endless. Next issue, I'll talk about Skills. After using OpenClaw for more than three months, I've built many practical Skills. For example, investment data recording and analysis, research and analysis reports for new fields, Docker container-combined TODO task management, and business project management combined with Affine, etc. Not all of them are worth mentioning, so I'll pick two.

### Closing

[Quail](https://quaily.com/) is a weekly newsletter push platform that I've been using in the past, but after all, it's a third party, and copying and pasting every time is time-consuming and laborious. So since the number of email subscribers is currently not large, I thought I might as well have Lobster write a push program integrated into the website, so that it can also push along with the website in the first place.

Happy holidays everyone~

---

Weekly first published on [CGArtLab](https://cgartlab.com/weekly)
