---
title: "The Odyssey, Custom Agents, and the Skills That Actually Solve Problems · No.19"
published: 2026-08-31
updated: 2026-08-31
description: "This issue marks the upgrade from a weekly to a column: five hardened custom agent Skills — from calendar management to investment analysis; a four-step methodology for amplifying efficiency with AI; plus Tolaria, Rime, and other tools worth your attention."
tags:
  - Weekly
  - Agent
  - Skill
draft: false
pin: 0
toc: true
lang: en
abbrlink: weekly-19
---

![Cover photo taken on Koh Sichang, Chonburi, Thailand, where summer never seems to end.](../_images/《奥德赛》，客制化%20Agent，以及那些真正解决麻烦的%20Skill%20·%20No.19-1788084531668.webp)

> **Black Light Column · No.19 · 2026-08-30**
> This is an electronic column focused on accelerating digital productivity, covering knowledge management, dynamic visual design, and frontend development. Published twice a month, each issue centers on one topic for deeper reflection.
> If you enjoy the column and want a more complete reading experience, we recommend visiting the official website ([https://cgartlab.com](https://cgartlab.com/)) in your browser.

---

## What's been happening

**From weekly to column**

Three months have passed since the last issue, and quite a few things happened in between:

- Starting in July, I began collecting my monthly [fragmentary notes](/en/posts/fragmented-writing/) into a single high-density document each month — though only I could understand it.
- My knowledge base and content output started to form increasingly dense link relationships.
- Around the same time, the WeChat official account platform issued a "recommendation algorithm" warning, nudging content to be more creative.
- I decided to upgrade the weekly into a column — almost a public version of my personal notes.
- The monthly high-density document is now split into two column pieces.
- Structurally, the change is also to fit the recommendation algorithm.
- The publishing rhythm slows to 2–3 times per month (on a flexible schedule), while each piece carries more information density.

**Saw Nolan's *The Odyssey* last week**

![](../_images/《奥德赛》，客制化%20Agent，以及那些真正解决麻烦的%20Skill%20·%20No.19-1788179691931.webp)

On the IMAX production level, Nolan still delivers — ticket money well spent. Directors and crews who take filmmaking this seriously are a shrinking breed; every one of their films is one fewer we'll get to see.

Plot-wise, I only vaguely remembered the "Trojan Horse" as a child. I'd never connected it to Homer's epic, let alone to Norse mythology.

Honestly, until I actively looked into Western history to prepare for *The Odyssey*, my understanding of "Norse mythology" still came from *Saint Seiya*.

An unexpected discovery: *The Odyssey* turns out to be one of the [earliest examples of nonlinear narrative](https://chatgpt.com/share/6a94102d-a320-83ea-93d0-6f56ad5590f6).

This is something I've been fascinated by for years. Many highly-rated shows I've watched — *Hannibal*, *Sherlock*, *Westworld*, *Breaking Bad*, *Silo*, *Shrinking* — all use the technique to varying degrees, let alone films.

**Blog layout and typography refresh**

Thank you to Anqi for the feedback — she offered many reading-experience suggestions on paragraph spacing and fonts.

Including but not limited to:

- Auto-embedding [term links](/en/posts/auto-glossary-term-linking/) in article body
- Building a glossary
- Redesigning the in-article table of contents
- Switching the body font to OPPO Sans (a sans-serif)
- Further improving overall access and search performance

If you find anything less smooth in the reading experience, comments and letters are welcome.

**Released a few small things from Vibe Coding practice**

![Men Agent](../_images/《奥德赛》，客制化%20Agent，以及那些真正解决麻烦的%20Skill%20·%20No.19-1788180756727.webp)

EDIC design system: [project page](/en/posts/edic-design-system/).

Argus, a frontend design code review agent: [project page](/en/posts/argus/).

Inkard, a batch text card generator: [project page](/en/posts/inkard/).

Go To Github: [project page](/en/posts/goto-github/), a cross-platform script to accelerate GitHub access.

And the newest one below.

**Men Agent**

Tentatively called [Men](https://men.cgartlab.com), with more details on its [project page](/en/posts/men/).

It started as a custom agent team for my own use. This isn't the place to expand on it — I'll write a dedicated article later.

In short, this is a milestone for me after years of working with AI — "sharpening the axe doesn't delay the cutting of wood."

**Received the sspai essay prize — Audioengine Cyber 5**

![Audioengine Cyber 5](../_images/《奥德赛》，客制化%20Agent，以及那些真正解决麻烦的%20Skill%20·%20No.19-1788180893773.webp)

It's heavy — even bigger than the subwoofer of my Edifier 201. A great positive feedback loop for writing. Happy.

---

## Deep dive: the Skills that solve problems

Picking up from the [previous issue](/en/posts/weekly-18/), I'm still using OpenClaw, even though its buzz has cooled and it's honestly not easy to use. But six months of intensive use left behind a lot of valuable data for me — such as these Skills.

If you don't know what a Skill is, no worries — there's plenty of explainer content online. It's quite simple.

**calendar-manager**: schedule management using Python that directly connects to the iCloud calendar service to edit and manage schedules. For example, this year for the World Cup, I can simply ask it to pull match schedules from FIFA's official website and write them into my calendar.

**news-report**: information collection and reporting. I mentioned it last issue; it's been fully upgraded. The need was simple: even after avoiding recommendation algorithms and fragmented information, the filtered information volume is still overwhelming. But letting AI filter directly also runs into the model's own limitations. So I started with the data sources. It now integrates several categories:

- My self-hosted [RSS service](/en/posts/rss-1/), subscribed to around 50 authoritative Chinese and English media outlets and independent blogs.
- Telegram channels and groups — thousands of messages daily, precisely filtered for useful experience, tool sharing, and opinions.
- Zhihu CLI — yes, Zhihu also has an official skill now; it mainly assists another agent in analyzing investment signals.
- Email — hundreds of spam messages weekly, with the occasional client inquiry; it can also quickly filter out scammers.

The interesting part is that the processing is fully integrated: it has its own internal scoring mechanism that classifies every piece of information — news, group chat opinions, or email — into tiers: milestone, urgent, attention, routine. AI treats them all equally regardless of source. Finally, for market-relevant information, it gives a "trend assessment". See below:

![](../_images/《奥德赛》，客制化%20Agent，以及那些真正解决麻烦的%20Skill%20·%20No.19-1788113124668.webp)

The skill also has another trigger: if I send a command like "interpret, https://example.com/xxx", it automatically compares it with today's report.

**affine-cli**: a skill that helps edit documents in Affine. Affine is a Notion-like competitor whose advantage is Docker self-hosting (on self-hosting infrastructure, see my [NAS series](/en/posts/nas-beyond-photos-your-first-private-cloud-1/)). My workflow has now fully replaced Notion with it. Notion does have more powerful database AI features, but payment and access are less friendly domestically, and a lot of confidential project information simply can't be stored there — so I dropped it.

Affine's benefit is that all data stays fully local. On the intranet it's absolutely fast; on the public internet, the first access downloads and caches data on demand (a bit slow), but once cached, only modified parts are transferred — speed and stability improve.

**cgart-writer**: as the name suggests, it assists me in writing text content. The goal isn't to have AI fully replace my writing — mainly for discussing topics and reviewing where the narrative can improve.

Articles fully generated by AI always read a bit off to the author himself. But with a skill that fully understands my way of thinking, speaking habits, and even reader feedback, the responses are far more reliable than an AI knowing nothing at all. You can think of it as suppressing the model's hallucination.

**investment**: for investing. I'm a complete beginner in this field with a very clumsy approach. I send it screenshots of my holdings, it extracts the data into a database, calculates historical volatility for each position, then combines with the `news-report` skill to analyze market signals, finally giving action suggestions with reasoning.

That said, I rarely follow its advice — neither it nor I are mature in this domain. I use it as an experiment and to learn investment concepts. As for making money, not losing is already a win.

These are all the Skills that solve problems for me. Someday, when they mature further, they'll be open-sourced one by one.

Reading this far, you can see that the whole process of accumulating Skills is essentially recording the repetitive steps of my workflow and solidifying them into sets of "natural language code". It's like an old hand in the office passing down rules and experience to the newcomers.

Ultimately, in my view, using AI to amplify strengths and efficiency can be summarized in a few steps:

1. **Discover what AI can do in ways humans absolutely cannot.** For example, instant multitasking — searching dozens of files and web pages simultaneously, quickly turning messy text/recordings into readable content, editing different parts of a document at once...
2. **Integrate these capabilities into your workflow, and keep debugging until the output is stable and reliable.** It's all text, images, and video — and text is the foundation of everything.
3. **Use internet infrastructure as tools to solidify carriers of new data and information.** On why these particular infrastructures, I wrote a fuller discussion in [《Programs Come and Go, But Data Stays Forever》](/en/posts/flow-program-iron-data/). Infrastructure rarely changes: email, Git, IP addresses, blockchains, websites, markdown syntax.
4. **Create in unprecedented ways.** New tools, stories, experiences — anything of value to others.

---

## Recommendations

### Tolaria

![](../_images/《奥德赛》，客制化%20Agent，以及那些真正解决麻烦的%20Skill%20·%20No.19-1788110130829.webp)

🔗 https://tolaria.md/ · GitHub: [refactoringhq/tolaria](https://github.com/refactoringhq/tolaria)

An open-source, free note-taking tool optimized for Git and AI. The installer is a stunning 15 MB — extremely compact. The official positioning is "A second brain for the AI era", and its three core designs match my taste:

- **Local-first**: every note is a plain Markdown + YAML frontmatter file. No database, no proprietary format. Openable in any editor, grep-able from the terminal — your data is always in your own hands;
- **Git-first**: a fully integrated Git client inside the app — commit, push, and browse history, plus per-note version timelines. Cross-device sync uses the same tool you already trust for code;
- **AI-native**: you can plug in CLI coding agents like Claude Code, Codex, and Pi for tool-backed editing, or connect directly to local/API models for chat over note context without granting vault-write access. That fits exactly the "AI reads, I decide what to write" workflow I've been using.

The editor is a Notion-style block editor, but everything on disk is ordinary, portable files. Built by Luca, founder of the Refactoring newsletter. On GitHub it's approaching 10,000 stars (9,946), AGPL-3.0 licensed, no account required. A young project, but one worth watching.

### Making animations with Coding instead of design software

🔗 https://sspai.com/post/107437

A worthwhile read — few designers share how to build UI animations with Vibe Coding. If you have ideas for your own products or tools, there's plenty of useful material here. The part that inspired me most was "getting AI to describe animations for me". The author's experience:

> Don't tell AI "make a techy animation" directly. Instead, describe the **use scenario**, the **emotional state** to express, or even show reference effects to AI. Let AI draft a Prompt first, and you refine it. That's far more efficient than describing from scratch.

Beyond that, two equally practical techniques:

- **Quick parameter tuning**: when it feels "too heavy" or "missing some breathing room", instead of letting AI keep guessing your vague intent, ask it to expose the animation parameters directly — petal count, radius, speed, trail length, opacity... then have AI write a set of tuning sliders for what-you-see-is-what-you-get adjustment. That instant feedback is something Figma can't give you;
- **Multi-option comparison + reverse learning**: AI lets you see multiple directions side by side within minutes, turning a vague visual judgment into an iterative converging process. Once an effect works, ask AI to summarize its visual and motion characteristics from code, screenshots, or screen recordings — turning subjective feelings into reusable descriptions and parameter ranges, so the next similar generation is far more accurate.

The author also shared **model selection experience** — "aesthetics: Gemini > Kimi > GPT": he uses Gemini 3.1 Pro most for animations, Claude for fixing complex Shader bugs, Kimi for quick validation. He also tested Lottiefiles' official Motion Skill and concluded it's of limited help for now — don't expect calling a Skill to produce high-quality animations in one shot. Worth bookmarking for designers interested in AI + Coding motion design.

### Rime — Zhongzhou input engine

![](../_images/《奥德赛》，客制化%20Agent，以及那些真正解决麻烦的%20Skill%20·%20No.19-1788108972116.webp)

🔗 https://rime.im/

Rime actually goes by different names on each platform: it calls itself the "Zhongzhou input method engine", "Xiaolanghao" on Windows, and "Shusiguan" on macOS. Honestly, it's the best input method I've used since I started taking writing seriously. No contest.

You might think voice input is already nearly 99% accurate — why recommend an input method that needs old-school manual typing? The answer: privacy and freedom. Because I run my own servers at home, many highly-privileged account passwords simply can't be spoken aloud, and on desktop there really isn't an offline closed-source input method.

As for freedom: for the many personal terms I type constantly — mixed Chinese and English terms like "CGArtLab", "GitHub", "OpenAI ChatGPT" — these can be fully customized into your own dictionary file, and supplemented by downloading third-party open-source dictionaries. All of it stays local. And if you write scripts with dozens of fictional character or place names, AI can help you configure them in too.

With AI these days, you don't actually need to learn how to use it specifically — just a little bit of thought is enough. For instance, I briefly introduced it in [《2025 Productivity Tools That Stayed in My Workflow》](https://cgartlab.com/en/posts/good-tools-for-production-in-my-2025/), but I'm bringing it up again because AI can unlock nearly all of its usage methods and configuration tricks.

---

## Video to go with dinner

【*Attack on Titan*'s terrifying narrative power — textbook-level storytelling】 https://www.bilibili.com/video/BV1jh6HYYEBG/?share_source=copy_web&vd_source=700cd77b5ffc2570c23ad5d112c9a3d8

I re-watched "The Retreat from the Titans" from the start, this time switching to the creator's perspective per the video's interpretation.

An interesting realization: I'd never considered "efficiency of information delivery" before. **Dense information presentation does not equal efficient information transfer.**

---

## Next issue preview

The theme will be "thoughts and attempts on the forms of text creation" — writing from pen and paper, to keyboard, to voice. What should each of these three forms be used to record, output, and in which scenarios?

---

> This column is first published on [cgartlab.com](https://cgartlab.com) | 📮 Letters/partnerships: hello@cgartlab.com