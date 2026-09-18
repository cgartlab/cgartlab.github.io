---
title: "The Three Forms of Text Creation: Pen, Keyboard, and Voice · No.20"
published: 2026-09-11
updated: 2026-09-12
description: "How to write better with AI: pen-and-paper for incubation, keyboard for polished output, and voice input for capturing ideas — plus a dictation + AI editing workflow that separates writing from editing."
tags:
  - Weekly
  - Writing
  - AI
  - Productivity
  - Voice Input
draft: false
pin: 0
toc: true
lang: en
abbrlink: weekly-20
---

![Cover image from the online portfolio cy92.org](../_images/文字内容创作的形式%20-%20No.20-1789179461692.webp)

> **Black Light Column · No.20 · 2026-09-12**
> This is an electronic column focused on accelerating digital productivity, covering knowledge management, dynamic visual design, and frontend development. Published twice a month, each issue centers on one topic for deeper reflection.
> If you enjoy the column and want a more complete reading experience, we recommend visiting the official website ([https://cgartlab.com](https://cgartlab.com/)) in your browser.

---

## What's been happening

### My web portfolio is live

![Screenshot of the updated web portfolio](../_images/文字内容创作的形式%20-%20No.20-1789179574238.webp)

I've always believed designers should have an online portfolio they design themselves. Every time I introduce myself or talk business, sending a link beats a dozens-page PDF — I can't think of a cooler way.

The site is [cy92.org](https://cy92.org), currently featuring earlier works, with more to come as things stabilize. It was built with my own [Men Agent](https://men.cgartlab.com) (an AI coding assistant team), which doubled as a real-world test of the tool. Feel free to explore — and collaborations are welcome.

### Argus 0.5.1 release

[Argus](https://github.com/cgartlab/argus) (my AI tool that checks web design quality) now has its own [public homepage](https://argus.cgartlab.com). It's fully open source and free, working 24/7 to nitpick websites on my behalf.

This release focuses on stability and usability:

- The free model list is now pulled directly from OpenCode Zen's public API, so no extra CLI tools are needed on your machine;
- It automatically picks the best main AI model per run: keep using the current one if it still works, or switch based on scoring otherwise — no more manual config edits;
- Authentication failures (like expired keys) now halt immediately instead of blindly trying every fallback model, and print actionable fix instructions.

### Men Agent 0.5.0 release

[Men Agent](https://github.com/cgartlab/men) now integrates Argus's design review directly into PRs: after you push code, it automatically checks the interface design and reports issues graded from P0 (most severe) to P3 — covering color, spacing, and accessibility. It's like having a design advisor reviewing every commit.

AI model configuration is also consolidated into a single global file (`men.jsonc`): switch presets or assign models per agent in one place. New users are guided through model setup step by step — no more digging through docs.

---

## Deep dive: the forms of text content creation

It all started when Doubao's input method finally shipped a desktop version.

I recommended it to my parents first — they almost never type by hand anymore, and the accuracy is astonishing.

For me, the most liberating use case is commanding AI: no matter how messy the expression, as long as I speak clearly, it understands my intent. I can just talk.

This made me realize that this shift toward AI speech-to-text might permanently change how I create text.

Looking back at years of writing, I've used exactly three forms: pen and paper, keyboard, and voice. They aren't generations replacing each other — each owns a phase. What they record, what they output, and which scenarios suit them differ a lot.

![A diagram comparing the three forms of text creation](../_images/文字内容创作的形式%20-%20No.20-1789195029246.webp)

### Picking up a pen clears your thinking

Writing with pen and paper engages the body most: the friction of nib on paper, the sound of strokes, wrist movement, and the very marks you leave. Text and body movement are bound together — this multi-sensory feedback is irreplaceable.

The cost is slowness, but slow isn't necessarily a loss — slowing down makes it easier to enter a focused state, and stray thoughts gradually drift away. New ideas also find it easier to arrive.

In my experience, when thoughts are tangled, pen and paper are the best "tangle comb": make a list, sketch a mind map, or if it's truly messy, just write whatever comes to mind. Within ten minutes you're in the zone.

There's a well-known Q&A about why pen-and-paper analysis beats pure mental reasoning: the brain runs too fast, and information scatters before it can be held. Writing moves the thinking from your head onto the page — wherever your eyes look, your attention goes ([Why is analyzing problems with pen and paper much more effective than pure mental analysis?](https://www.zhihu.com/question/1967714689371871171/answer/1974567212942639223)).

Pen and paper truly excel at incubating and organizing ideas, not producing finished output. Before an idea takes shape, let it grow slowly on the page — the blank sheet is a staging area. Dump anything onto it first, which is far more natural than forcing it into polished sentences through a keyboard.

### The keyboard is the main output channel for mature ideas

![Typing on a keyboard in a dimly lit workspace](../_images/文字内容创作的形式%20-%20No.20-1789195228448.webp)

Switching to a keyboard, the physical feedback diminishes: no pen-and-paper tactility, sound scatters into keystrokes, and motion narrows to your fingers.

What you gain is efficiency — typing is far faster than handwriting, and editing is a breeze: copy, paste, reorder anytime, all impossible with a pen.

Keyboard writing suits the stage where ideas are relatively mature. If writing with a pen is doing multiple-choice questions, keyboard writing is filling in the blanks.

Typing demands you think before you act. When thoughts are vague, staring at a blank screen produces nothing; conversely, once you enter a creative flow, the keyboard is the most natural output tool.

### Voice input is the ceiling for capturing ideas

Voice input has the least physical feedback of the three — you can't even see what you "wrote." But its output speed is unmatched.

Handwriting and typing both require thinking before output; a gate sits between thought and writing. Speech tears that gate down — you say what comes to mind, and part of the thinking process moves directly into the output.

The upside is speed; the downside is also speed: without "thinking it through before putting it down," less settles into memory, and retrieving it later is harder. Why does dictated text differ from keyboard-written text? Because during dictation, thinking and language stay in near-perfect sync, yet spoken language carries low information density — you feel perfectly logical while speaking, but reading it hours later, you can't follow your own words. Reviewing dictation is like aligning ciphers with your past self.

So my usage is clear: voice is only for two things — pure quick capture (grocery lists, fleeting inspiration — who types those?), and dictating full drafts. The latter is the method I most want you to try.

### Dictation + AI editing turns speech into prose

Using AI to turn dictation into polished prose sounds lovely but can easily backfire.

This workflow has long existed in web fiction circles — one author shared their process: draft a ~200-word outline to set the chapter's direction, then dictate the whole chapter "like telling a story." Thirty minutes of dictation, once edited, becomes roughly 6,000–8,000 characters. The takeaway is that three phases each need one thing done right:

**Dictation phase: abandon self-censorship completely.**

Don't second-guess "should I say this" while talking. Deliberately add detail and feeling — even allow tangents. Think about it: when you chat, do you agonize over whether each sentence should be said? I don't. Speech-to-text already loses some information; if you say too little, nothing survives the loss. Say too much, and it holds up.

**Editing phase: merge strictly, don't create.**

Let AI merge similar content, but avoid large-scale rewriting — never fabricate "invented" content. Keep the first-person perspective and concrete details, converting spoken language into written form. If context permits, preserve the rhythm of speech. When citing third-party real cases, verify each one — AI-edited content's credibility is your responsibility.

**Finalization phase: reread after a cooldown.**

Do deep refinement and polishing, then leave a few hours of cooldown before publishing, and reread from a reader's perspective. Many places that felt "great while writing" become obvious flaws after cooling off. When I studied painting, my teacher said: when stuck or finished, put the painting farther away, or ignore it and wander off — revisit it later and you'll almost always spot something new. For writing, my rule is to keep editing until removing a single character would change the meaning — then publish.

After running this workflow for a while, my biggest takeaway: it completely separates "speaking" from "writing" — the classic "separate writing from editing" principle. Writing and editing were always separable tasks, a point Taiwanese developer xdite explains well in the open-source book [Memory Hack (打造超人大脑)](https://github.com/xdite/memory-hack). People who only write with keyboards often carry a bit of writing anxiety — staring at a blank document. Dictation pours the content out first, and AI helps you organize it. At the very least, you no longer face a blank page.

Ultimately, pen, keyboard, and voice — none is superior. Ideas unformed: write with a pen. Ideas mature: type. Not yet clear: speak first. What matters is recording and expressing your thoughts, feelings, and perspectives — a treasure well worth accumulating.

---

## Recommended tools

![Pi Coding Agent interface preview](../_images/文字内容创作的形式%20-%20No.20-1789104604010.webp)

### Pi Coding Agent

🔗 https://pi.dev/

An open-source Harness development base similar to OpenCode — extremely simple and efficient (fast, and token-efficient). It suits those who want a fixed workflow without complicating their toolchain. It doesn't aim to include everything out of the box; think of it as a bare shell you can decorate however you like.

Worth noting: @agegr/pi-web and @rainmanhhh/pi-web, third-party web clients for Pi, feel better than OpenCode web in my experience. The most comfortable part is that they consolidate hidden menu modules into a single page, where you can:

- Batch-configure model parameters, thinking levels, plugins, and skills
- Handle project switching, session management, file browsing, and editing on one page
- Save custom preset prompts without re-pasting them for every new session

### MOSH

![MOSH dynamic effect examples](../_images/文字内容创作的形式%20-%20No.20-1789202355436.webp)

🔗 https://moshpro.app/

A website that overlays dozens of dynamic effects onto images and videos, with output support for both video and GIF. Perfect for creating animated avatars and motion graphics assets.

---

## Videos to watch while eating

[How to Write in the AI Era — Harvard Professor Steven Pinker on the Art of Writing](https://www.bilibili.com/video/BV1hWrjBKEdH/)

This master's take on writing starts from what material to collect, how to organize content, and how to make yourself understood. It echoes this issue's "dictation + AI editing": pour the words out first, organize them into prose, then decide which sentences must stay.

[How Tim Writes Scripts — Building Rhythmic Structure in Video](https://www.bilibili.com/video/BV1uE411F7Ck)

Tim explains how video creators write scripts and keep content moving section by section. The same lesson applies to articles: readers rarely need to know the author's thinking process — they just follow the flow of text — while creators very much need to think in reverse.

---

## Next issue preview

Next time: the factors that keep AI from obviously improving productivity — have you run into them? GPT is already at version 6, so why hasn't life gotten easier? Will version 16 help?

---

Related reading:

- [Fragmented Writing — Building a Specimen of Thought](https://cgartlab.com/en/posts/fragmented-writing/)
- [Decoding the Designer's Second Brain: From Concept to Practice](https://cgartlab.com/en/posts/second-brain-for-designer/)
- [RSS and Modern Reading Habits (Part 1): Rediscovering Deep Reading in a Fragmented Era](https://cgartlab.com/en/posts/rss-1/)
- [A Beginner-Friendly Guide to Using AI Gracefully (Part 1): Slow Down to Go Faster](https://cgartlab.com/en/posts/ai-guide-slow-is-fast/)
- [Great Tools That Stayed in My 2025 Productivity Setup](https://cgartlab.com/en/posts/good-tools-for-production-in-my-2025/)

> First published on 🔗[cgartlab.com](https://cgartlab.com) | 📮 Contact/Collaboration: hello@cgartlab.com
