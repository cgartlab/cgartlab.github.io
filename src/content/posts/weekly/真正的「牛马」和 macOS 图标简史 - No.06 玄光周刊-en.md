---
title: "The Real Workhorses and macOS Icon History - No.06 Black Light Weekly | Apple Design Evolution"
published: 2025-07-18
description: "30 years of macOS icon design, from skeuomorphism to liquid glass. Plus Cyber Wooden Fish, Centileo Renderer 0.70 updates, and Apple's AR design strategy."
updated: 2025-08-08
tags:
    - Weekly
    - UI Design
    - macOS
draft: false
pin: 0
toc: true
lang: en
abbrlink: weekly-06
---

> About Black Light Weekly
>
> This is an electronic weekly focusing on knowledge management, covering digital art, visual design, and frontend development. Currently published weekly, each issue selects a specific topic for in-depth reflection. It shares my notes about entrepreneurship and products, including my thoughts, excerpts and annotations, reading notes, and quality content recommendations.
>
> If you find the content here worthwhile, welcome to use [RSS](https://cgartlab.com/rss.xml) or [Email Subscription](https://cgartlab.com/weekly/) , we summarize these notes into an email sent to you weekly. Of course, your [letters](mailto:hello@cgartlab.com) are also welcome.

![Qingdao Oriental Movie Metropolis film studio complex viewed across the river](../_images/06-真正的「牛马」和%20macOS%20图标简史-1754596615417.webp)

This week's cover was shot at Qingdao Oriental Movie Metropolis on my way to work.

Across the river, vegetable fields stretch lush and green, with cicada songs wantonly permeating the air. A magpie perches on the highest branch, tilting its head to observe two "guards" on the ground. They seem to be discussing something, or perhaps thinking nothing at all, simply enjoying this rare moment of leisure.

Modern workers often self-deprecatingly call themselves "workhorses," while real workhorses never have such worries. They labor all day without contemplating why they live. When their owners are absent, they become temporary masters of this land.

Humans always think they're superior to animals, forgetting we're equally driven by survival pressures. But real workhorses don't care about these things—they live in the present, eating when hungry, sleeping when tired. Humans, however, are always busy thinking about meaning, planning the future, reminiscing about the past.

## Cyber Wooden Fish

![Cyber Wooden Fish web app interface for chatting with an LLM trained on Buddhist, Taoist, and Confucian classics](../_images/06-真正的「牛马」和%20macOS%20图标简史-1754596624610.webp)

An interesting "Cyber Wooden Fish" website. The author trained a large language model based on Buddhist, Taoist, and Confucian classics, allowing direct dialogue with these sages.

## macOS Icon History — Basic Apple Guy

![Compilation of iconic macOS app icons spanning 30 years of Apple UI design evolution](../_images/06-真正的「牛马」和%20macOS%20图标简史-1754596634172.webp)

> In macOS 26, Apple announced a completely new look for its user interface: liquid glass. Physical icon elements give way to softer, shinier, more transparent icons. Rounded rectangles become more rounded, and Apple removed the ability for icon elements to extend beyond the icon rectangle (as seen in current icons like GarageBand, Photo Booth, Dictionary, etc.). — Basic Apple Guy

At this year's WWDC, Apple released the new "liquid glass" visual design system. I've been wanting to share my thoughts about it. Looking at this design system alone, the immediate impression might indeed seem somewhat flashy, reminiscent of the Windows 7 & Vista era.

![Comparison of macOS app icons across different versions showing design style shifts](../_images/06-真正的「牛马」和%20macOS%20图标简史-1754596644987.webp)

Coincidentally, today I came across an author who compiled the most representative icons from Mac systems over the past 30 years on his blog. When placing icons of different styles together, you can clearly see the trade-offs designers made regarding what information they wanted to convey. Now, the once clear boundary between "skeuomorphism" and "flat design" is becoming increasingly blurred.

On the other hand, this massive design style change is global. Combining these two points, I strongly agree with [this article's](https://www.ruanyifeng.com/blog/2025/06/weekly-issue-353.html) proposal that "Apple is laying out AR," still betting that the next computing platform will be augmented reality.

Augmented reality won't be as "domineering" as virtual reality was—dragging people straight into a digital world. At the same time, it can free up part of the compute budget. In more whimsical terms: it makes the transition to "mechanical ascension" smoother.

## Centileo Renderer 0.70 for CinemaD Update

![Centileo Renderer 0.70 interface showing new material and lighting node features](../_images/06-真正的「牛马」和%20macOS%20图标简史-1754596654993.webp)

Centileo Renderer is an unbiased GPU renderer developed by a small Russian team, supporting C4D and Max. It's now my primary renderer, running on a 3070 that's been serving my workstation for three years—the preview quality and speed are terrifyingly impressive. Looking forward to seeing its performance on the RTX 50 series.

It targets RedShift and Octane. If you commonly use these two renderers, getting started will be a breeze. The next version will launch a paid edition—if the pricing is reasonable, I'll definitely support it.

## **Main Updates in This Release**

- **Performance Optimization**
    - 2.5× compression ratio for bitmap.cntx cache.
    - 10× faster bitmap.cntx cache generation.
    - Option to store bitmap.cntx cache in RAM rather than only on disk.
- **Material & Texture Updates**
    - Materials now include basic metal and glossiness properties.
    - Subsurface material workflow changed: now uses a single color and color radius.
    - New thin-film texture node, suited for connecting to material reflection color.
    - New complex refractive index texture node, suited for connecting to material reflection color.
    - Edge shading option added to the attenuation texture node.
- **Lighting Improvements**
    - Textured regular light sources: textured emission materials must be assigned to the light.
    - Regular light sources now include a diffusion/directional option (for area rectangle, disc, and spotlight).
    - Regular light sources now include a projector/gobo option (for area rectangle, disc, and spotlight).
    - Regular light sources now include IES light distribution (for area rectangle, disc, and spotlight).
- **Other Features & Fixes**
    - Forward UVW texture coordinate mode based on camera pixel position, available in the UVW projection texture node and material tags.
    - Camera-aligned perspective correction, aligning the camera up vector with the Y-axis.
    - Interactive preview render adds a gray render mode.
    - Fixed the issue where .exr bitmaps couldn't be used.
    - Fixed a crash related to referenced materials.
    - CUDA version support with RTX 50XX GPUs.
- **Future Development Plans**
    - A material converter for this version of the Cinema 4D CentiLeo plugin is in development—has been for some time.
    - Will continue to fix bugs in this free version.
    - The next paid version will add new graphics features.

---

OK, that's it for this issue. If you find the content here worthwhile, welcome to use [RSS](https://cgartlab.com/rss.xml) or [Email Subscription](https://cgartlab.com/weekly/) , we summarize these notes into an email sent to you weekly. Of course, your [letters](mailto:hello@cgartlab.com) are also welcome, and we'll do our best to reply.

This article was first published on [Black Light Weekly](https://cgartlab.com/weekly/) and is also serialized on [CG Art Lab](https://cgartlab.com/).
