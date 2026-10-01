---
title: "Internet Infrastructure for Everyone · No.22"
abbrlink: weekly-22
published: 2026-10-03
updated: 2026-10-03
description: "From consuming to creating: ordinary people can now assemble a website of their own from free services. Why the timing has never been better."
tags:
  - Weekly
  - Internet
  - Infrastructure
  - Productivity
  - Creator
draft: false
pin: 0
toc: true
lang: en
---

![A beige Cherry G80-3000 mechanical keyboard|693x452](../_images/人人可用的互联网基础设施%20-%20No.22-1790950156068.webp)

The cover has nothing to do with the content — I picked it at random. It's my first mechanical keyboard, a Cherry G80-3000. I gritted my teeth and paid over 700 yuan for it back in 2015. Cherry isn't what it used to be, but the old thing still holds up.

If I had to draw a connection, maybe it's that "Enter" key.

> **Xuanguang Column · No.22**
> A digital column focused on accelerating productivity, covering knowledge management, motion visual design, and front-end development. Published at least twice a month, each issue explores a single theme.
> If you enjoy this column and want a fuller reading experience, I recommend reading it in your browser at the official site ([https://cgartlab.com](https://cgartlab.com/weekly)).

---

## What's been happening

### Feeling an earthquake for the first time

![Received earthquake alert|360](../_images/人人可用的互联网基础设施%20-%20No.22-1790952040232.webp)

At 6:30 pm on the last day of September, I felt an earthquake for the first time in my life.

My phone suddenly lit up with an alert. Since Sichuan had been having quakes all last month, I picked it up without even checking the location — and then I was watching the countdown, and it had already started shaking.

The shaking lasted 3–5 seconds, coming from downstairs. No unusual sound. The cat was woken up beside me, then went back to sleep.

One thing is certain: if a big one came, there'd be no escaping it. At most I'd grab whatever was within reach to shield my head.

What I took from it is this: even if you don't believe in gods, please still hold nature in awe — a few seconds really can wipe you out. And if a big one did come, ending instantly while doing the thing you love most in your final moment would still be rather beautiful.

### Building the "Attention" Skill

![The Attention Skill's repository page](../_images/人人可用的互联网基础设施%20-%20No.22-1790955372702.webp)

This is a skill for **semi-automated** Git project management. If you're new to Git, you can roughly think of it as a spring-cleaning function. Its development codename is "Attention" — the word American soldiers shout in the movies.

Broadly, it checks the state of a project automatically: whether you stopped halfway or finished, it finds the unfinished tasks. Then it tidies the whole project up, syncs the latest changes into the project's core documentation, and gets everything ready for whatever comes next.

I've grown fond of the name. If code were alive, you can picture it performing exactly that motion. I expect to open-source it within the next week.

### Redesigning the Miniflux reader interface

![The redesigned Miniflux embedded in Obsidian, with the feed category navigation on the left|542](../_images/人人可用的互联网基础设施%20-%20No.22-1790964217832.webp)

This is the design I'm happiest with lately — reshaping a tool I use every day, entirely to my own preferences and habits.

> Further reading: [My 2025 Productivity Stack: The Tools That Survived](https://cgartlab.com/posts/good-tools-for-production-in-my-2025/)

I once registered a US Apple account and loaded 10 dollars just to buy Reeder (also a very handsome reader), yet on Android and Windows I never found anything that could compete.

When I learned you could self-host this kind of service, I was thrilled. I tried them one by one and ended up with Miniflux — lightweight and stable enough.

Because the reader actually runs in the browser, it slots smoothly into any tool with a web view component — Obsidian above, for instance. That makes cross-referencing while searching for material very convenient.

![The Miniflux reading interface, with article layout and the feed list|548](../_images/人人可用的互联网基础设施%20-%20No.22-1790964254788.webp)

On mobile I added swipe-to-mark, auto-scroll marking, and a cover card view. There's the occasional dropped frame and a few small rough edges, but it's more than good enough for my own use, and I have no plans to open-source it.

It's so simple and so easy to replicate that I'm confident you could hand these screenshots to GPT 6 and it would write a better one from scratch.

---

## Deep dive: internet infrastructure for everyone

### 01

In the past, we used the internet mostly to get information, communicate, and be entertained on other people's platforms.

I'm not someone working in the internet industry, but ever since interest drove me to build a website of my own from zero, I've gradually realized this: now anyone who wants to can, at very low cost, combine a domain, a website, code hosting, automated cloud services, even their own server.

Five years ago I would have been certain I could never pull this off. Now, with AI in the picture, our relationship with the internet looks set to change again.

### 02

Back in the 90s, when PCs were just emerging, simply owning a computer was a high bar. I was in third grade, and my school ran a dedicated "computer class"; weekend enrichment classes had us memorizing Wubi radical tables.

Then the internet arrived, and things began to change.

Many products we now take completely for granted were, before mobile apps became the main entry point, all delivered as websites. Google, Amazon, Facebook — and domestically Taobao, JD, Zhihu, Bilibili — all went through that phase.

At the time, building even the most ordinary website required knowing a great deal: servers, the bash command line, domains, DNS, CDN, databases, version control, code hosting, and so on — plus an endless stream of technical problems on top. For an interested ordinary person with no experience, it was clearly no small undertaking.

Today, that entire stack has been packaged into a set of services you can buy off the shelf. And if you dig a little deeper, you'll find that behind every one of those steps there are completely free products. **If all you want is "to get a website of your own up and running," it doesn't have to cost a single cent.**

So if you want to build one, what you're really doing is assembling these free pieces of infrastructure.

### 03

That's why I think now is a particularly good time for ordinary people to start building their own personal website.

If it's just a personal site, you don't even need to buy a server.

A domain plus GitHub is enough to get a static site running — that's how my blog has been built all along. I wrote about the journey from Hackintosh tinkering to an independent blog in [From Hackintosh to an Independent Blog: My Open-Source Journey · No.17](https://cgartlab.com/posts/weekly-17/).

It originally ran on my home computer, and I tried to tackle it from first principles: **if a website is just one computer letting another read files it shares publicly, then in theory, as long as I get a website running, anywhere on the open internet can see it.**

Following that question, I encountered domains, DNS, WordPress, Nginx, Apache… the whole pile of basic concepts mentioned above — tracing the vine back to each one, exploring and learning.

The key point is that I'm not a programmer at all. These things that once seemed as remote as climbing to heaven, I actually worked out step by step — and I can keep refining and improving them indefinitely.

Now, with AI, the process accelerates exponentially, to the point where I no longer need to understand the technical details behind it. Of course, if you want to do something to perfection, details matter a great deal — but to get started you don't need to understand them at all. Just write down what you have in mind.

**You no longer need to be a professional to have the right to start building.**

### 04

Another easily overlooked shift: most people unconsciously stay in the position of consuming content.

> What did I read? What did I bookmark? Who did I follow? Who did I block?

These events happen too much and too fast, and it's easy for them to keep getting faster. Getting information has never been quicker or easier.

Once you start producing content, the situation changes immediately. I explored this turn in [Build a Second Brain](https://cgartlab.com/posts/build-the-second-brain/) and [Anatomy of a Designer's Second Brain: From Concept to Practice](https://cgartlab.com/posts/second-brain-for-designer/).

Write an article, and you leave behind a pile of text you can reread.

Polish a piece of work, and you leave behind a file you can keep editing and using.

Write some code, and you leave behind a tool you can run countless times, modify, and extend.

The internet a creator faces is no longer instant feedback — it's delayed gratification. **From "what did I see" to "what did I make."**

### 05

Why do I care more and more about the identity of creator? It traces back to a passage I once read in *Conversations with God*, roughly:

> The purpose of life is to remember who you really are.

I'll leave that thought aside for now — but it pulled on another thread. I've written about [RSS and Modern Reading Habits (Part 2): Taking Back Control of Your Information](https://cgartlab.com/posts/rss-2/), on reclaiming the initiative over information; I've written about [Software Flows, Data Endures](https://cgartlab.com/posts/flow-program-iron-data/), on keeping your data in your own hands; and later I wrote about [Your NAS Is Not Just for Photos: A Creator's First "Private Cloud" — Part 1](https://cgartlab.com/posts/nas-beyond-photos-your-first-private-cloud-1/) and [Part 2](https://cgartlab.com/posts/nas-beyond-photos-your-first-private-cloud-2/), on storing more and more of your data in an environment you control.

On the surface these have nothing to do with each other, but they're all wrestling with one problem: **how do the things I create in the digital world persist over the long term and keep releasing value.**

What I care about more and more is that accumulation. The website is only the means.

### 06

If you've decided right now that you'd like to try, one approach I rather agree with is to let your infrastructure grow alongside real needs.

The very very first requirement is actually paper and a pen. Otherwise, once the stage is set, what performance is it for? You need content first.

Then you can find out what Markdown syntax is and how to carry content with it. If you'd rather start from the reading side, you could also look at [RSS and Modern Reading Habits (Part 1): Rebuilding Deep Reading in a Fragmented Age](https://cgartlab.com/posts/rss-1/).

When you have enough content, a website isn't strictly necessary — a WeChat official account, Xiaohongshu, even Moments will do.

When the content grows hard to manage, or you have longer-term plans, that's when you need to consider building a website.

At each step, for every facility you need, I prefer to think this way:

- What does it solve? What does it *really* solve?
- What does it leave behind? Will I still be using it years from now?

As long as a facility can't answer these questions, or the answers disappoint, just cut it.

This has a huge benefit: you won't add a pile of things requiring heavy maintenance just because "everyone else is tinkering" or "X is the hot thing right now." Every piece of infrastructure you add should make your repeated actions fewer.

Once you switch to the creator's identity, you're bound to run into these questions:

- Where does what I create come from? Where does it go?
- Who keeps it?
- Who decides how it's used?
- Who confirms whether it can be taken with me?

Go meet the right question; the answer is there too.

### 07

By this point, sharp as you are, you'll have noticed that the website itself doesn't matter at all.

What matters is that you've become able to solve for yourself problems you used to depend on others for. Don't know how? You can learn. Doesn't exist? Go create it.

Throughout the process these abilities keep integrating and linking up, and in the end they'll thoroughly change the way you see the world.

The internet's own development went through something similar: in the early days (web 1.0) people could only consume content — portals served whatever was on them; then blogs and social platforms lowered the bar for publishing; today, with AI driving it, the bar for building an independent website keeps dropping too.

It's hard to say whether most people will eventually become "builders of infrastructure." Who knows.

If you've actually made it this far, why not go give it a try.

---

## Recommended tools

### Li Dan's Stand-Up Comedy Workbook

🔗 https://book.douban.com/subject/35552655/

![Li Dan's Stand-Up Comedy Workbook](../_images/人人可用的互联网基础设施%20-%20No.22-1790954504648.webp)

I recently read *Li Dan's Stand-Up Comedy Workbook*. What stuck with me was the line on the poster — "BE FUCKING PROFESSIONAL" — and the whole little book circles around that goal. A few lines I copied out:

- When dealing with your company costs you more effort than dealing with the market directly, you can leave that company and live a better life.
- Creation is a job that mobilizes your entire life. A job that, even having mobilized everything, often still produces nothing.
- Creation doesn't come from a lightning strike; you have to keep striking yourself.
- When the show goes well, everyone's grievances and arguments mean something. When it goes badly, we just die in perfect harmony.

If you work in something creative too, it's worth a look.

### Noto Emoji

🔗 https://googlefonts.github.io/noto-emoji-files/

![The Noto Emoji site, showing downloadable emoji and animated assets](../_images/人人可用的互联网基础设施%20-%20No.22-1790960887134.webp)

Noto Emoji is the "emoji pack" we use most often, but you may not know it's actually part of the Noto typeface family built by the Google Fonts team.

Google has turned 3,988 emoji (as of writing) into an open-source, commercially usable, programmable design asset library — you only need to keep the attribution. Some of them have already been animated, and they're beautifully done. Use the code shown next to each one and you can call it up anytime.

---

## Videos to watch while eating

👇 This series is quite fun — I've subscribed to the collection.

【Why do so many spicy strip and seasoning bottle packages print a portrait on them?】

🔗 https://www.bilibili.com/video/BV15r4y1f7cn

【Why is chewing gum packaging designed with foil and serrated edges?】

🔗 https://www.bilibili.com/video/BV1LK4y1L7eL

---

## Next issue preview

Finally — at long last — I get to my old trade: the universal vocabulary of design.

---

> This column first appeared at 🔗[cgartlab.com](https://cgartlab.com) | 📮 Letters/collaboration: hello@cgartlab.com