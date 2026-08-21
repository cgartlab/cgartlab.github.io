---
title: "The Left Foot Stepping on Right Foot Creative Method - No.12 Weekly | Knowledge Management"
published: 2026-02-03
description: "Discover the 'left foot on right foot' creative method linking knowledge management to writing. Build self-propelling systems through interconnected notes."
updated: 2026-02-03
tags:
    - Weekly
    - Knowledge Management
    - Creativity
draft: false
pin: 0
toc: true
lang: en
abbrlink: weekly-12
---

![Supervisor cat watching creative work demonstrating the patience and curiosity essential for knowledge workers](../_images/12%20玄光周刊-「左脚踩右脚」的创作方法-1769845597946.webp)

This week's cover comes from my supervisor—it doesn't love work but enjoys watching me work. Staring at the mouse cursor moving back and forth, it can persist here for 3 hours. It doesn't like hard wooden desktops, so I sacrificed my laptop sleeve. If replaced with a softer mat, it would probably persist even longer.

## The "Left Foot Stepping on Right Foot" Creative Method

"Left foot stepping on right foot" originally came from a TV drama commentary I watched—the director filmed a kind of light kung fu technique where one foot steps on the other, which left a deep impression on me. Today I thought of it again, because of creation.

Have you ever had this experience: organizing notes to write an article, but during the note organization process, new article ideas emerge? Like "left foot stepping on right foot" in martial arts novels—seemingly impossible but able to gain leverage in mid-air, achieving new ascension. Recently, while improving my knowledge base and writing, I frequently experienced this "self-propelling" cycle.

This might sound mystical, but the core lies in deeply coupling the two processes of **creative output** and **knowledge management**. It's not creating from nothing but actively applying and feeding back into your existing system—like the "thought specimen" library I mentioned in [Fragment Writing - Building a Thought Specimen](https://cgartlab.com/posts/fragmented-writing/), and the "style landscapes (Stylescapes)" discussed in [07 Xuan Guang Weekly - Double Diamond Design Model: Golden Framework Analysis from User Needs to Product Implementation](https://cgartlab.com/posts/weekly-07/).

Specifically, this cycle contains two interlocking "feet":

1. **Right Foot (Knowledge Management as Creation)**: Stop viewing note-taking as mere collection. Whenever reading, observing, or thinking, force yourself to record with "writing intention." Not copying but annotating, connecting, raising questions, rephrasing in your own words—slowly these notes will form individual "seeds" with independent viewpoints.

2. **Left Foot (Creation as Knowledge Management)**: When needing formal writing (like this weekly), directly return to your note library from the past couple of days—sometimes the things that left a deep impression don't even need re-reading. The writing process becomes a thematic "compilation," deep stitching, and logical sublimation of your fragmented notes. The completed article's core viewpoints and framework are then decomposed into new notes, re-sedimented into the knowledge base, waiting for next invocation and evolution.

This method breaks the linear "input - organize - output" process, making both parallel, mutually nourishing spirals. Its greatest benefit is **curing "blank page fear"**—you never start from zero; each creation iterates and realizes existing thinking. Of course, it requires your knowledge base itself to be "alive," filled with your own links and thinking, not an information graveyard. This also makes me reflect that perhaps the best creative tool is a system allowing convenient "left foot stepping on right foot."

Have you had similar "self-propelling" experiences? What are your "left foot" and "right foot" respectively? Welcome to share in comments below or via letter.

## Discovered Good Stuff

### Tencent Hunyuan Motion

![Tencent Hunyuan Motion GitHub repository page introducing the open-source 3D motion generation model for character animation](../_images/12%20玄光周刊-「左脚踩右脚」的创作方法-1769840627504.webp)

An open-source 3D motion generation large model launched by Tencent Hunyuan at year-end, currently mainly used for text-to-3D-character-motion direction. Most surprising is it's open-source—meaning animators or small game development teams can use it to quickly build storyboards, prototypes, theoretically saving significant production costs.

![Hardware requirements section for Tencent Hunyuan Motion model deployment specifying GPU specifications and VRAM needs](../_images/12%20玄光周刊-「左脚踩右脚」的创作方法-1769841119800.webp)

Of course, such models require higher hardware foundation compared to relatively simple Chat models. Motion effects demonstrated on the website introduction are quite good—should integrate well into existing workflows. Will try deploying one to test.

Link: <https://hunyuan.tencent.com/motion>

### Submitted a Bug to Centileo Renderer

Using version 0.717 with C4D 2025, graphics card 5070ti.

![Centileo Renderer bug report showing uneven denoising blocks in Cinema 4D 2025 when noise reduction is enabled](../_images/12%20玄光周刊-「左脚踩右脚」的创作方法-1769846783177.webp)

The phenomenon is shown above—enabling denoising creates uneven blocks, more pronounced with higher parameters. Already reported to the developer, and they've started investigating the cause. Temporarily reverted to an older version, and the bug disappeared.

![International 3D rendering community discussion thread about Centileo Renderer bug investigation and fix timeline](../_images/12%20玄光周刊-「左脚踩右脚」的创作方法-1769847291817.webp)

Still strongly recommend Max and C4D users try this renderer ASAP—it's incredibly fast compared to RS and OC, currently completely free. Previous introduction can be seen at 👉[04 Black Light Weekly - Refurbished Graphics Card and New Renderer | CGArtLab](https://cgartlab.com/posts/weekly-04/). I've been using it as my main renderer for over a year, definitely rendering thousands of hours. Of course, beta products inevitably have minor issues—looking forward to the official release.

### OpenClaw 🦞

![OpenClaw AI agent mascot, the famous little lobster logo symbolizing the open-source self-hosted assistant project](../_images/12%20玄光周刊-「左脚踩右脚」的创作方法-1770120784410.webp)

OpenClaw exploded in popularity this year—in my view, it has the potential to create truly meaningful AIPC.

Installed and heavily used for about a day—here are some impressions:

First, its freedom is somewhat frightening. Initially configured with Qwen-Max—a trick learned from other articles, supposedly less prone to crashing, and it really worked. But I wanted to switch to SiliconFlow's API because they have many invitation credits perfect for testing, so I sent the key saying "I heard you're amazing, configure yourself and notify me when done." Result: configured in about 2 minutes... WTF? And it chose the most cost-effective DeepSeek-V3.2!

**Definitely don't install on your main machine.**

Second, it really burns through tokens. To implant memory, I chatted with it for half an hour, had it crawl my articles, analyze my tools, writing style, etc... and burned over 3 million tokens. Luckily it was DeepSeek, costing about 10 RMB. If configured with GPT or Claude, definitely for the wealthy. After setting up long-term memory, I switched to Qwen3-8B small model for regular use, can switch back to large model with one command when needed.

Interestingly, I tried having DeepSeek lead Qwen's small model for division of labor—might save many tokens. Unexpectedly, it actually devised a judgment strategy, then automatically switched to Qwen! This is somewhat terrifying to think about...

![OpenClaw AI agent terminal interface demonstrating autonomous execution power for system configuration and API setup](../_images/12%20玄光周刊-「左脚踩右脚」的创作方法-1770122579659.webp)

Third, deployment and installation still have high barriers for newcomers. If you don't chase new tech, better wait and see—such hot things usually evolve quickly to out-of-the-box usability. Saw group messages saying people are already selling one-click installation Chinese versions on secondhand markets—haha, they deserve to make money!

Fourth, it's excellent for training other Agents. Links, text, various information thrown at it can form long-term memory, gradually understanding your style and habits better. Eventually these memories are stored in a text file, very compact. If this text is well-trained, throwing it to any conversational AI to remember could instantly create a personalized assistant. Still the "data portability" principle—switching platforms shouldn't be a problem.

Fifth, this thing is way more fun than chat assistants. Just the first day, my usage is still very basic—many skills not unlocked yet, like various skill functions, clawhub, scheduled tasks, etc... Enough for now.

Writing installation tutorials for such tools seems not very valuable—changes too fast, won't write one. Better share unique usage methods after more experience.

If anyone wants to try, can register on SiliconFlow for free play—covers most domestic models seen on the market. Using the link below, both you and I get extra 20 million tokens, enough for several days. Of course, you can use it for more cost-effective things—20 million tokens can actually last a long time, it's just this little lobster burns through them quickly.

Link: <https://cloud.siliconflow.cn/i/09r0o1Ax>

### Casual Talk

I'm considering whether to merge the "Good Stuff" series into the weekly. Digital world good stuff and physical good stuff aren't conflicting—both are things I discover and want to share. Publishing separately only superficially increases article count and update frequency; merging would substantially improve quality. Even if writing quality doesn't improve, at least might save others from opening another article and waiting another day. What do you think?

---

This article first published on [Black Light Weekly](https://weekly.cgartlab.com) simultaneously serialized on [CG Art Lab](https://cgartlab.com)

> About Black Light Weekly
>
> This is an electronic weekly focusing on knowledge management, covering digital art, visual design, and frontend development. Currently published weekly, each issue selects a specific topic for in-depth reflection. It shares my notes about entrepreneurship and products, including my thoughts, excerpts and annotations, reading notes, and quality content recommendations.
>
> If you find the content here worthwhile and want a better reading experience, more recommended to use browser to visit the official website. Also welcome to use **RSS** (<https://weekly.cgartlab.com/feed/atom>) or **Email Subscription** (<https://weekly.cgartlab.com>), we summarize these notes into an email sent to you weekly. Of course, your [letters](mailto:hello@cgartlab.com) are also welcome.
