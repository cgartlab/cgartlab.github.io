---
title: Design Concepts That Transfer Across Disciplines · No.23
published: 2026-10-07
description: "Some design concepts work across every discipline. Photoshop's Add mode is just RGB values added up — grasp the mechanism once, and the rest fall into place."
updated: 2026-10-07
tags:
    - 周刊
    - 项目/玄光专栏
    - 领域/内容创作
draft: false
pin: 0
toc: true
lang: en
abbrlink: weekly-23
---

![Golden light scattered across a balcony at sunset](../_images/设计中的通杀概念%20-%20No.23-1791299762286.webp)

The cover was shot during a golden rainstorm at sunset. The window was open, the golden light shattered against the glass and spilled across the whole balcony. Ten minutes later it was gone.

> **Xuanguang Column · No.23**
>
> A digital column focused on accelerating productivity, covering knowledge management, motion visual design, and front-end development. Published at least twice a month, each issue explores a single theme.
>
> Every link I share is embedded as a hyperlink on a keyword. **WeChat official-account articles in 2026 don't support this**, though other platforms have no such problem.
>
> WeChat scans article bodies for third-party links and flags them as promotional violations. So if you're reading this inside WeChat and want one-tap jumps, tap **Read original** at the bottom.

---

## What's been happening

### Writing has moved into my Obsidian vault

![Obsidian vault with the article project open](../_images/设计中的通杀概念%20-%20No.23-1791124313553.webp)

Five years in, writing inside Obsidian is simply more comfortable, so I finally tightened the workflow down to a single repository.

Before, drafts lived in the blog repo while material and references were scattered across the knowledge base. Halfway through an edit I'd be hunting in two places at once.

Now all long-form writing lives in the knowledge base — input and output in one place. Yesterday I idly asked Hermes whether it could publish automatically once I finished; she said it could, with a GitHub Action watching for pushes and syncing straight to the site.

You're reading the result.

### [Quill](https://github.com/cgartlab/quill) reaches 0.7.0

Quill is a writing skill I built for myself. It turns a long article from a vague idea into something with a thesis, evidence, an audience, and a voice.

**It only writes its own drafts — never mine.**

The biggest change this time: **read the author before writing.**

It now reads my last 10 articles first and distills my values, habits, taste, and preferences into a profile. Every step afterwards uses that profile as its basis, instead of applying a generic AI voice.

The other change is routing. Previously the same workflow ran whether or not you had a draft. Now it splits three ways:

- No draft — talk the theme out first;
- Partial draft — straighten out the argument, then thicken it;
- Complete draft — fill the gaps and reinforce, without rewriting what you already got right.

There's also one hard rule now: when my intent is unclear, it has to ask, not guess.

If you're curious, you can install it and give it a try.

### A week with DeepSeek Harness

![DeepSeek Harness desktop client](../_images/设计中的通杀概念%20-%20No.23-1791297123639.webp)

The desktop version got an update. It feels much lighter than Codex, and after three days of heavy use, execution speed and stability were decent.

OpenCode is still my daily driver, paired with a [Men](https://men.cgartlab.com) plugin I built myself. The latest V2 release is a big step up — the web client is already very capable on phone and tablet. Men is being adapted to it now.

### Continuing the *AI Graceful Dining Guide* series

The second installment is on "safety first and data sovereignty." I didn't expect it to be hard to write. But once I started, data security turned out to be a pit — the ground it covers is far wider than I imagined.

The next one should be out soon.

---

## Deep dive: design concepts that transfer across disciplines

Every industry has its own jargon, and design is no exception.

Jargon is not the same thing as a transferable concept.

A transferable concept is something I've accumulated over years of practice — a set of **foundational concepts that cut across disciplines**. Graphic design, 3D, motion, editing: all of them use these.

### Take blend modes

The simplest one I can think of is Photoshop's layer blend modes: Linear Dodge (Add).

Below, two identical reds stacked with Linear Dodge. Where they overlap, the color looks brighter.

![Two identical reds blended with Linear Dodge, the overlap brightening](../_images/设计中的通杀词汇%20-%20No.23-1791039835957.webp)

That brighter patch is, at bottom, the result of adding the two reds together.

> Photoshop calls this "Linear Dodge (Add)." Dodge is a darkroom term — it just means lightening a print. So the name tells you what it looks like, not what it does.
>
> I asked [DeepSeek](https://chat.deepseek.com/share/bm9xfub6fefrnxgto6) and got a story: Adobe coined "Linear Dodge" to work around a patent, and that invented word is what got carried into translations from there. I couldn't verify it against an independent source — but Adobe skipping the obvious "Add" to invent something new says enough on its own.

Set the name aside. What matters is what the mode actually does.

Add means exactly what it says: the two layers' colors are added together, and that's it.

How can colors be added? In a computer, they genuinely can — in fact, that's the only way it works.

A display mixes every color it shows from three lights: red, green, and blue. Each color's "number" is just the values of those three channels. Add the two sets of values and you get the linear-dodge result.

Unless your first design teacher happened to mention it, you could think about this for the rest of your life and still never work out what "Linear Dodge," "Multiply," or "Exclusion" actually do.

Screen, multiply, divide — they're all operations on color. It's just that we didn't study computer science, so it doesn't immediately occur to us that color can be calculated.

You see it — understand one and you immediately understand a row of them. That's already the feeling of a transferable concept.

### The infrastructure of design

These terms are like the "internet infrastructure" I wrote about last issue: they are **the infrastructure of design**.

Whatever kind of design you do, these are the definitions you have to align on with partners, colleagues, and clients.

A few at random:

- Project files, project folders, documentation
- Asset libraries, moodboards, style boards
- Image and video codecs, formats, safe frames
- Base units: color space, bits, pixels, resolution, frames, frame rate, sample rate, bit depth, bitrate
- 3D: models, UVs, rigging, animation, texturing, VFX, lighting, cameras, rendering
- noise, turbulence, random, perlin, fractal, blur, glow…

Almost every design discipline runs into these concepts.

They aren't as tangible as internet infrastructure — you can't install them and start using them. Understanding them won't land you a client or spark an idea.

But they're like word roots in English: learn one and it pulls a whole family along. The real payoff of transferable concepts is that they let you work across disciplines.

### The compounding effect of transferable concepts

Whether or not you work in design, if you've ever learned your way across sub-fields in any industry, you probably know what I'm getting at.

Transferable concepts compound.

They're infrastructure too — they sit in the layer that barely changes. Tools get overhauled every few years, but Linear Dodge is still Linear Dodge. A pixel is still a pixel.

They work like a universal API: called over and over. What you learn about color space doing graphic design this year, you won't have to learn again for VFX next year. People who only chase tools have to start over in every new field.

So the fastest way into an unfamiliar discipline is to find its transferable concepts first.

> By the way — English, or any second language, is as far as I'm concerned the highest-compounding tool there is. No contest.

---

## Recommended tools

### [Read Something Wonderful](https://readsomethingwonderful.com/)

![Read Something Wonderful homepage](../_images/设计中的通杀概念%20-%20No.23-1791300013572.webp)

The site that once inspired *Product Thinking*. I call it "something good to eat."

It's a collection of high-quality long reads, the kind that reward patience. I hope you get to enjoy the quiet pleasure of immersive reading too, noisy world or not.

### [Sam Altman: Productivity](https://blog.samaltman.com/productivity)

An essay Sam Altman wrote eight years ago about how he works productively.

Two things in it worked for me: coffee and lists. I've gone from drinking only hot americanos to making my own latte with freeze-dried coffee — less coffee, better results, at the cost of a lot of milk.

And lists: there's no problem a list can't solve.

### [Makoto Shinkai Works](https://cn.shinkaiworks.com/)

![Weathering with You artwork](../_images/设计中的通杀概念%20-%20No.23-1791299973804.webp)

I didn't know Makoto Shinkai had a portfolio site of his own.

It's strikingly plain: films, commercials, shorts, exhibitions, and novels sorted into categories, with no fancy interactions.

So what does that tell you? That work with enough weight behind it matters more.

I think this deserves an article of its own sometime — about the relationship between work and experience. We all know creation comes out of experience and settles into work, and the work itself becomes part of the experience.

Maybe that's what will be valued more going forward: AI can mass-produce commercial content, but experience is personal and one of a kind.

---

## Videos to watch while eating

### [Chen Danqing: The Look of Chinese People](https://www.bilibili.com/video/BV1Qhv5erEte/)

![Still from Chen Danqing: The Look of Chinese People](../_images/设计中的通杀概念%20-%20No.23-1791300997817.webp)

- I was born and raised in Shanxi, and I studied art too.
- I strongly agree that "the look of Chinese people has been lost."
- The raw information those sculptures carry — even *Black Myth: Wukong* can only copy a digital fraction of it, and that's the best anyone has managed so far.

---

## Next issue preview

Reading, thinking, writing — which matters most?

---

This column first appeared at: [CG Art Lab](https://cgartlab.com)

📮 Letters/collaboration: hello@cgartlab.com
