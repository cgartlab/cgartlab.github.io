---
title: "Why AI Doesn't Feel Faster: Steps Speed Up, Results Don't · No.21"
abbrlink: weekly-21
published: 2026-09-27
updated: 2026-09-27
description: "A few years into AI and no obvious speedup? Three reasons why: domain knowledge, patience, and task decomposition. Plus EDIC 2.8.0, eight new repositories, and three tools worth trying."
tags:
  - Weekly
  - AI
  - Productivity
  - AI Workflow
  - Task Decomposition
draft: false
pin: 0
toc: true
lang: en
---

![Bare trees and their reflections in the still water of Dianchi Lake](../_images/为什么没感觉到AI让你变快？-%20No.21-1790510081470.webp)

This issue's cover was shot at Dianchi Lake.

> **Black Light Column · No.21 · 2026-09-27**
> This is an electronic column focused on accelerating digital productivity, covering knowledge management, dynamic visual design, and frontend development. Published twice a month, each issue centers on one topic for deeper reflection.
> If you enjoy the column and want a more complete reading experience, we recommend visiting the official website ([https://cgartlab.com/en/](https://cgartlab.com/en/)) in your browser.

---

## What's been happening

### Eight new repositories in one month

There is too much self-buildable infrastructure to resist. I opened quite a few this month.

- C2B (camera to background), overlays your webcam feed onto your desktop wallpaper in real time. Very useful for recording tutorials. [cgartlab/c2b](https://github.com/cgartlab/c2b)
  ![C2B overlaying a webcam feed onto the desktop wallpaper|434](../_images/为什么没感觉到AI让你变快？-%20No.21-1790520852529.webp)
- Devices, records hardware device information, mainly to sharpen purchasing decisions. [cgartlab/cgartlab-devices](https://github.com/cgartlab/cgartlab-devices)
- Quill, a writing skill. [cgartlab/quill](https://github.com/cgartlab/quill)
- Check Update, a system update check skill. [cgartlab/check-update](https://github.com/cgartlab/check-update)
- Xiaohongshu Skill. [cgartlab/cgartlab-xsh](https://github.com/cgartlab/cgartlab-xsh)
- AI Memory, a knowledge base for AI itself. [cgartlab/cgartlab-ai-memory](https://github.com/cgartlab/cgartlab-ai-memory)
- AI API Usage, checks AI usage across multiple accounts. [cgartlab/ai-api-usage](https://github.com/cgartlab/ai-api-usage)
- Shop, my Xianyu and Xiaohongshu storefront. [cgartlab/cgartlab-shop](https://github.com/cgartlab/cgartlab-shop)

Most of these are not public yet. I will open-source them once the features and the output are stable. Digital infrastructure matters. Even when a workflow changes, tools like GitHub are hard to replace.

### EDIC reaches 2.8.0

🔗 https://edic.cgartlab.com

EDIC is a web design spec I built for myself. It decides what colors a page uses, how large the type is, and how wide the spacing gets. It is written for people and AI at the same time, so the pages an AI generates from it come out visually consistent.

Three things changed.

- Every color and type value was reorganized, 318 in total, each tagged with what it is for and what it becomes in dark mode. Previously only I could read them. Now AI can use them directly.
- Ready-made page parts went from 39 to 44, adding menus, dialogs, file uploads, and input fields.
- A new manual written for AI collects the values and parts it needs in one file, so it reads one thing instead of digging through code. Publishing now runs an automatic check, and it fails if the manual and the actual build disagree.

I also patched 22 security issues and gave the site a new look, with a dark palette and code highlighting.

Separately, every future release now publishes the AI skill package to the skill marketplace automatically.

### A dedicated VM for MCP

![Virtual machine list, with VM 102 running the MCP services](../_images/为什么没感觉到AI让你变快？-%20No.21-1790445775378.webp)

MCP is now the standard interface every AI needs in order to plug into a workflow. I run a lot of production hardware, and my development work is scattered across several machines. Having every device's agent call the same interface and read the same memory is clearly the more sensible setup.

And if I switch platforms or computers later, the interface carries over. No need to worry about an AI's progress or memory.

### Agents move into 3D workflows

I tried connecting an agent to C4D through a self-built MCP interface. Tool calls work fine. It can help tidy and group objects. Precise prompting and debugging still need work.

---

## Deep dive: why AI doesn't feel faster

![Timeline of global large model releases in 2026, arranged by lab, covering 46 core releases|549x648](../_images/为什么没感觉到AI让你变快？-%20No.21-1790445541121.webp)

The chart above was made with the new EDIC design system to track how often large models ship. The trend is hard to miss.

GPT is already at version 6. Why hasn't your work gotten easier with AI in the mix? Will version 16 help? This is a problem everyone doing digital production work runs into.

After a few years of using AI, my conclusion is this. **It really is fast. It is fast in the steps, not in the result.**

If that sounds abstract, here is the concrete version. AI compresses the part of a job where you produce options. It does not touch the part where you judge, verify, and finish. Those three sections below each give you a way to check it against your own work today.

### 1. Domain knowledge decides whether you can verify anything

You need to know at least a little about the field a task belongs to, or you cannot read the AI's feedback and reasoning.

Say you ask it to build a slide deck. How much do you need to know in advance to produce a deck that is actually presentable?

Basic computer use, basic slide software editing, outlining, typefaces, font sizes, layout, images, image cropping, image formats, video, animation. That is just what I can think of right now.

That still leaves out taste, composition, texture, color, templates, pacing, speaker notes, compression formats, transfer formats, and version control.

Only after all of that comes the actual subject you are supposed to know and present.

Lay the whole process out in order, and AI only does a handful of the steps by hand. It can plausibly type the words in and switch color schemes quickly, but it struggles to grasp your intent. What this page is trying to say can only be directed by a person.

Worse, if you do not know that a better result exists, you will happily accept whatever the AI produces. When the market or a client gives you real feedback, fixing it costs you even more time.

### 2. Patience: options got cheap, choosing did not

Do not expect AI to hand you a finished product, because the finished product you want is at best one in ten thousand.

Say you are unusually gifted and manage to rule out 9,000 of them for the AI. You are still looking at one in a thousand.

For the remaining 1,000, the AI is genuinely out of moves. To avoid missing the single best one, you have to sort through them yourself. Before AI existed, you might have come up with 10 options at most; past that, it never felt worth the effort.

So the extra time all goes into that fear of missing out. That is where your patience goes.

From my own use, only four things actually got faster: gathering information, supporting decisions, thinking broadly, and trial and error. None of it includes a person's decision process. If it did, the author would no longer be a person.

You can test this against your own day with two questions. If your work is producing a first draft from nothing, you will feel the speedup directly. If your work is picking one deliverable out of a pile of options, AI will likely make you slower.

### 3. Task decomposition cannot be outsourced

Even getting AI to help write an article that earns a freelance fee is still very hard.

The mindset for decomposition is first principles. Go back to the essence of the thing, peel it apart layer by layer, and find the smallest unit of action, making sure every step is solid.

Take the same request, "write me an article." You need to supply the background, the red lines, reference links, the narrative approach, and the argumentative angle. If you just throw over a Word document and say "finish it according to the outline," it will inevitably guess at an average answer.

Decomposition itself cannot be delegated to AI, because the input it needs is exactly the output of decomposition. If you let it decompose on its own, you still get an average result. It looks right, and it will not work on your actual problem.

### The method I actually use

When I wrote about dictation plus AI editing in the last issue, I described the workflow I run now: let go completely during dictation, merge strictly during cleanup without adding anything new, and let it cool for a few hours before a final read.

That is a relatively simple decomposition. Before dictating, the outline is always one I wrote myself, and at most I let AI check for anything I missed. Lock the acceptance criteria down, even if it burns more tokens.

The whole pattern comes down to two rules.

First, write your acceptance criteria before you start.

Second, find the repetitive steps that irritate you.

Finally, if GPT does reach version 16, I still do not think people will have it much easier. Phone storage starts at 256GB now, and it still trembles in front of WeChat.

---

## Recommended tools

### fugleramme, a picture frame that identifies birdsong

![A framed display by a window showing vintage bird illustrations|319](../_images/为什么没感觉到AI让你变快？-%20No.21-1790515412434.webp)

🔗 [https://github.com/arnegiacomo/fugleramme](https://github.com/arnegiacomo/fugleramme)

A frame that hangs by a window. When a bird calls outside, a locally run model identifies the species and displays an illustration of that bird. The illustrations are not AI-generated. They are hand-cut 19th-century bird plates, and the texture is completely different.

It runs on a Raspberry Pi with all inference local, and it never uploads audio. E-ink panels, TVs, and ordinary monitors all work. MIT licensed, over 3,300 stars, launched this July. Worth adding to your watch list.

I think it could use a statistics feature. Pull it up a year later and see how many species passed your window. That would be fun.

### Hanzi Writer

![Hanzi Writer stroke order animation demo, drawing the characters 你好](../_images/为什么没感觉到AI让你变快？-%20No.21-1790515427290.webp)

🔗 [https://hanziwriter.org/](https://hanziwriter.org/)

A web library for animating Chinese character stroke order and practicing writing. My guess is it was originally built for Chinese learners and young kids.

I tried it for animation and visual design, and it works surprisingly well. Each stroke's start and end can be called and controlled directly, which is far less work than drawing the paths yourself when you need motion in a layout.

### DeepSeek Harness

![DeepSeek Harness developer preview homepage](../_images/为什么没感觉到AI让你变快？-%20No.21-1790515456098.webp)

🔗 [https://www.deepseek.com/harness/](https://www.deepseek.com/harness/)

Another harness I have been trying. The plugin ecosystem is wide open. I use the @linxin666/dsh-web-all set, twenty-one plugins, and the feature coverage is generous. Only a few actually stuck: side cards, the plugin marketplace, usage stats, and phone pairing for remote control.

I turned off the skins, pets, and creative workshop entirely. Less visual noise, easier to focus.

The downside, stated plainly, is that it is still a developer preview. It updates very frequently, and plugins occasionally get changed out from under you.

---

## Videos to watch while eating

Design industry dispute: the Studio Naeo contract incident, and the hidden conflict one contract tore open

🔗 https://www.bilibili.com/video/BV1ZceB6REmM/

The heat has died down and I only just caught up with this. I went through the original post and [an interview](https://www.xiaohongshu.com/discovery/item/6a9d79240000000027017000), and it still hit hard. It is genuinely difficult for the two sides of a contract to land in a shared set of values.

They also shared their design contract template.

🔗 https://github.com/studionaeo/design-services-standard-agreement

---

## Next issue preview

Next up, the "infrastructure" anyone can get for free from the internet.

---

Related reading:

- [A Beginner-Friendly Guide to Using AI Gracefully (Part 1): Slow Down to Go Faster](https://cgartlab.com/en/posts/ai-guide-slow-is-fast/)
- [The Three Forms of Text Creation: Pen, Keyboard, and Voice · No.20](https://cgartlab.com/en/posts/weekly-20/)
- [The Odyssey, Custom Agents, and the Skills That Actually Solve Problems · No.19](https://cgartlab.com/en/posts/weekly-19/)
- [Fragmented Writing: Building a Specimen of Thought](https://cgartlab.com/en/posts/fragmented-writing/)

> First published on 🔗[cgartlab.com](https://cgartlab.com/en/) | 📮 Contact/Collaboration: hello@cgartlab.com
