---
title: "My OpenClaw Workflow Skills - No.18 Black Light Weekly"
published: 2026-05-24
updated: 2026-05-24
description: "After three months with OpenClaw AI agent, explore practical workflow Skills for news filtering, system monitoring, API management, and research reports."
tags:
    - Weekly
    - AI Workflow
    - OpenClaw
draft: false
pin: 0
toc: true
lang: en
abbrlink: weekly-18
---

![Cover photo of railway tracks running beneath a bridge at Kunming University of Science and Technology captured during golden hour](../_images/主题%20-%20No.18%20玄光周刊-1779030168319.webp)

This issue's cover was photographed at Kunming University of Science and Technology. During the pandemic, every time I picked up a package, I would pass by a bridge on campus. Below the bridge is this railway running through the city. At different times of the day, the color tones here are all beautifully different.

---

> [!note] About Black Light Weekly
> This is an electronic weekly focusing on knowledge management, covering digital art, visual design, and frontend development. Currently published once a week, each issue selects a specific topic for in-depth reflection.
>
> If you find the content here worthwhile and want a better reading experience, we recommend using a browser to visit the official website.
>
> You're also welcome to use **RSS** (https://weekly.cgartlab.com/feed/atom) or **Email Subscription** ([https://weekly.cgartlab.com](https://weekly.cgartlab.com)) to subscribe.

---

## My OpenClaw Workflow Skills

After using OpenClaw for more than three months, my biggest feeling is that I have no idea what the upper limit of this tool is. Almost every day I learn new concepts, and every week I discover shortcomings in existing workflows. Among them, the concept of Skill is indispensable — it's too important.

From my understanding, the essence of Skill is to let the large model fix a set of complex actions for completing a task, forming a routine or automated pipeline. Just like when playing a game, the protagonist you control learns new skills, and each new skill is essentially a fixed combo of basic actions combined together.

That's what Skill is. What's interesting is that the combos AI uses can be created by yourself, or you can let it create them itself.

After using it myself, I eventually kept the following Skills that I consider relatively practical for your reference. There are many in total, and I've divided them into three categories by purpose, in no particular order.

- First category: Skills for information collection and integration, positioned as infrastructure.
- Second category: Dedicated Skills combined with self-deployed services, custom-designed, positioned to optimize and accelerate productivity.
- Third category: Third-party Skills with satisfactory usage effects.

This issue will first introduce the first category.

**sys_status**: Check current system status. If you, like me, have OpenClaw installed in a virtual machine, this Skill is also essential. Usually, it is also used in conjunction with other Skills.

**api-usage**: Query Token usage and balance information from various providers. For a Token-consuming tool like OpenClaw, the importance of being able to query balance and usage information in a timely manner goes without saying. In addition to manual queries being more convenient, it can also be combined with automated scheduled tasks to report overall consumption twice a day.

![Screenshot showing three AI API providers used for OpenClaw including MiniMax, DeepSeek V4, and SiliconFlow pricing and balance dashboards](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779519862582.webp)

I currently use the three providers shown above for OpenClaw. Among them, MiniMax offers large volume at affordable prices, billed by call count, suitable for dirty work. DeepSeek V4 is used for planning and designing execution schemes. If even it can't handle it, I manually switch to SiliconFlow for Kimi 2.6 or GLM 5.1. They [have been giving out benefits](https://cloud.siliconflow.cn/i/09r0o1Ax) — register and get 16 yuan in credits, 500 yuan for enterprise verification, with sufficiently rich and stable models.

It should be added here that in my experience, OpenClaw is not suitable for writing code directly. For projects that require coding, I directly use OpenCode and GPT — leave professional matters to professional Agents. In my opinion, non-professional programmers don't need Claude.

**check-update**: Check for version updates. OpenClaw updates need to be handled with extreme caution. In the early days, I experienced two instances of blindly chasing updates, both of which resulted in the system going silent halfway through the upgrade.

OpenClaw's iteration speed is very fast, but it also has many small issues. Hence the need for this skill. In addition to checking the latest version, its more important function is to automatically search and summarize what new features have been added and what problems have been fixed between the current version and the latest version before upgrading, and whether it provides substantial help to my workflow. This is something you must pay attention to when upgrading OpenClaw, otherwise you'll find that most of your time is spent tinkering with the tool itself.

**news-report**: Classic Agent news summary. I've made some customizations based on my deployed services. Information sources are more focused on RSS subscriptions on my miniflux server, several Telegram news channels, and Chinese groups. Even with these information sources that I've curated over many years in my areas of interest, there are still thousands of noise items every day.

The ultimate goal of this skill is to filter out this noise in the way I like. Technically, it's also very straightforward and crude: the first batch uses keyword occurrence probability within the first third of the main text for programmatic screening, eliminating high-timeliness but unnecessary items. The second batch has Agent avatars read the full text one by one for sufficient semantic understanding to find information that I am more likely to be interested in and worth reading.

**cgart-analysis**: In-depth analysis, outputting analysis reports. As the name suggests, this Skill is used to help me quickly understand an unfamiliar field, product, brand, enterprise, person, or any object I'm interested in. Currently, the output effect is relatively mature and stable overall, but the design layout still needs polishing.

![Generated research report excerpt](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779603205424.webp)

The above Skills I usually package directly into a scheduled task, running twice a day, morning and evening, to report.

---

## This Issue's Recommendations

### Oh My OpenAgent — Redefining the Open Source Toolbox for AI Agents

![Oh My OpenAgent open-source AI Agent toolchain website homepage featuring multi-model orchestration with Claude, GPT, Gemini, and Kimi](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036148975.webp)

🔗 https://ohmyopenagent.com

Oh My OpenAgent (omo) is an open source AI Agent toolchain, formerly known as oh-my-opencode. It transforms a single AI Agent into a coordinated development team, supporting multi-model parallel orchestration including Claude, GPT, Gemini, Kimi, GLM, and MiniMax.

Its core philosophy is "not binding to any single model provider," completing tasks through multi-Agent collaboration, real-time coordination, and Side-by-side tmux visualization. The maintainer completely publicly builds the process on Discord, and claims that Anthropic once blocked OpenCode because of this project.

Community feedback is quite enthusiastic, with some saying "it made me cancel my Cursor subscription." For those interested in learning more, you can check its AGENTS.md file to understand the 11 Agent role definitions and lifecycle hook systems.

### GEO — Generative Engine Optimization, the Next Battlefield of SEO

![Generative Engine Optimization GEO article header explaining SEO strategies for AI-powered search engines and citation visibility](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036210576.webp)

🔗 https://www.digital4design.com/blog/what-is-geo-in-2026

GEO (Generative Engine Optimization) is a concept that has rapidly risen in 2026. Unlike traditional SEO that relies on external links and keyword density, it shifts toward optimization for AI systems — making models able to accurately understand and cite your content.

Core strategies include: technical preparation, prompt research, answer-first design, citation-ready content, mention-based authority, intelligent internal linking, snippet optimization, and continuous feedback. Structured data (Schema Markup) is mandatory in GEO, not a bonus item.

For content creators, this means traffic is no longer the only metric; citation rates and verifiability of content in AI-generated answers become more important.

### AI Era Survival Strategy — On Diversity, Cross-Disciplinary, and Domain Judgment

🔗 https://www.zhihu.com/question/268078103/answer/2026420567713039329

This article analyzes the relationship between large model platforms and ordinary people from the perspectives of physics thermodynamics, cybernetics, and evolutionary game theory. Its core viewpoint is: AI platforms are dissipative structures, and human bodies, enterprises, and countries follow the same system logic.

In terms of coping strategies, the article suggests increasing one's own diversity (cross-disciplinary ability) and avoiding head-on confrontation with AI. For fields where AI replacement is leapfrog, the only rational choice is to switch tracks as soon as possible. At the same time, from a thermodynamics perspective, the criterion for judging whether a field is shrinking is whether AI's input of high-quality data nutrients to the field is greater than its output.

### 2026 Design Trends — From Minimalism to Boldness, Visual Design Direction is Changing

![Behance 2026 design trends report cover featuring minimalism with bold typography and contrasting color palettes for visual impact](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036673128.webp)

🔗 https://www.behance.net/gallery/239027109/Design-Trends-2026

In Behance's 2026 design trends report, a notable change is that minimalism is beginning to coexist with bold typography — clean layouts paired with bold fonts and strong contrasting colors. This means "minimal" no longer equals "boring," but rather seeks breakthroughs in visual impact through restraint.

The report also mentions that 2026 design focuses more on personal expression and emotional resonance. In the context of rapid AI tool democratization, handmade textures, texture details, and conscious design decisions instead become differentiated competitive advantages.

### Buzz — Offline Audio Transcription and Translation Tool

![Buzz interface](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036946164.webp)

🔗 https://github.com/chidiwilliams/buzz

Buzz is a completely offline audio transcription and translation tool powered by OpenAI's Whisper. It supports processing audio files locally on your computer without uploading to the cloud, protecting privacy while being suitable for network-restricted environments.

Compared to many online transcription services, Buzz's advantages lie in local operation, customizable model selection, and multi-language translation support. For podcast enthusiasts, meeting recorders, or users who need to process sensitive audio content, it is a noteworthy open source option. My own usage is to download many podcasts of interviews that I don't have time to listen to but am interested in, throw them in locally. Usually, a super long podcast of about three hours can be processed into text in 5 minutes using 5070Ti acceleration, and then directly let an Agent extract interesting viewpoints and cases and other valuable information — quite good.

---

## Video Recommendation

[Why are movies becoming more and more "fake" and less enjoyable?](https://www.bilibili.com/video/BV17XyGBrEvq/)

A very thought-provoking and interesting question 👆.

---

## Closing and Preview

There is so much to write about AI Agents this year. After thinking for a long time, I believe I need to find a suitable entry point, otherwise the topic is too big to start with.

Starting from this issue, I'll first try to approach from the Skills I use most frequently every day and are relatively practical, slowly extract the AI-accelerated productivity path that creators can most easily get started with. But unfortunately, this is not a so-called "shortcut," just sharing the joy of my own creations.

Next issue: introducing the second category, those Skills that truly carry the workload.

---

Weekly first published on [CG Art Lab](https://cgartlab.com/weekly)
