---
title: "Apple Watch Design Analysis: Curves, NURBS & Surfaces"
published: 2024-07-27
description: "How Apple Watch achieves its seamless form: curve continuity grades, NURBS surfaces, and Rhino modeling for product designers."
updated: 2024-11-30
tags:
    - Design
    - Industrial-Design
    - Apple
draft: false
pin: 0
toc: true
lang: en
abbrlink: apple-watch-design
---

![Cover: Apple Watch design schematics - Industrial design drawings showcasing precision manufacturing](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584361183.webp)

# Introduction

A friend recently asked me to train some undergraduate and graduate students in "Rhino3D Product Industrial Design." My own background is in animation, but the underlying technical principles overlap, so I agreed. Preparing teaching materials meant finding good case studies, and while working on the Apple Watch example, I found myself exploring a territory that felt both familiar and陌生的. The detailed lecture notes will be updated on my [backup site](https://cgartlab.super.site/). The cover image comes from publicly available Apple Watch design drawings.

# Product Industrial Design

You can't jump straight into teaching software without covering some theory. Product industrial design is a comprehensive discipline that aims to meet user needs and enhance product competitiveness by innovating and optimizing appearance, functionality, and user experience.

The general workflow looks like this:

- Market research — investigate market demand, define target audience, etc.
- Concept design — develop product concepts and key messaging based on research.
- Detailed design — sketch product form, determine dimensions, evaluate options.
- Industrial design — create 3D models and physical prototypes.
- Validation — test design solutions, iterate, and refine.
- Production planning
- Mass production and quality control

There is one company on this planet that has taken product industrial design to the extreme, carried it forward for generations, and is universally recognized — and only one: Apple. Using their products as teaching cases is natural, and for me, it was no small challenge.

# From Rounded Corner to Rounded Corner

![iPhone X rounded corner design comparison - Visual contrast between rounded and sharp design languages](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584421352.webp)

If you've used an iPhone since the X series, you're probably familiar with rounded corners. I say "since the iPhone X" because that generation marked the divide between Apple's two design philosophies: "rounded" and "sharp."

The foundation of "rounded" is the rounded corner.

Take the iPhone X — rounded corners are visible everywhere: the body contour, buttons, screen edges, and app icons. It's not hard to sense the designer's pursuit of a seamless whole. All these rounded corners, large and small, originate from a single invisible curve.

This is the direct reason iPhone hardware and software feel so "cohesive" visually. The screen edge, the body surface — all designed and constructed from the same curve. This highly unified, minimalist aesthetic makes it easy to overlook the complexity and intricacy behind the appearance.

![iOS 7 Weather app icon - Early application of Apple's continuous curve rounded corners](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584430047.webp)

Apple started using this kind of rounded corner with iOS 7 (the iPhone 4's bezel may also qualify, but that needs verification). The image above shows the iOS 7 Weather app icon. Before iOS 7, icons were drawn using the standard rounded rectangle method described below.

In most graphic design software, a rounded rectangle is created by applying a "bevel" command to the four corners of a regular rectangle. This means it's actually four straight lines joined with four circular arcs. The seams are perceptible, and the result doesn't feel continuous. But Apple's designers draw rounded rectangles as **a single continuous curve.**

# Curves Have Grades Too

In design, computers primarily handle three types of curves: Bezier curves, B-spline curves, and NURBS curves.

These names borrow from mathematics. For designers, the key thing to know is that in terms of controllability and precision: Bezier < B-spline < NURBS. Industrial design naturally uses NURBS.

If we consider a straight line as a type of curve (which it technically is), it's a curve with zero curvature. In industrial design, curves are classified by different "grades," measured in units called "degrees" — another mathematical concept used to distinguish the equation complexity of a curve.

For example, in Autodesk CAD or Rhino, you can draw curves from degree 0 to degree 11. The higher the degree, the smoother the curve, but also the more complex it is to modify and compute. Degrees 3 and 5 are most commonly used — you can look up specific usage details yourself.

Correspondingly, the continuity between connected curves also has grades. As shown above, curve continuity is classified into G0, G1, G2, G3, and G4 — five levels. The higher the level, the better the continuity and the smoother the curve.

![Curve continuity detection comparison - Curvature analysis difference between continuous curves and standard rounded rectangles](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584440396.webp)

In Rhino, you can use the curvature analysis tool to check curve continuity. As shown above, the left side is a single continuous curve, and the right side is a standard rounded rectangle. The white comb-like lines represent the curvature of each segment. A continuous curve has continuous curvature. A rounded rectangle, at the junction between the arc and the straight line, has its curvature suddenly drop from a constant value to zero. That's the difference in curve quality.

![iOS 7 icon curve analysis - Apple's 9th-degree 10-point complex curve construction for app icons](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584451863.webp)

According to materials from Apple's developer site, the curves used for iOS 7 icons approximate 9th-degree 10-point curves. The actual curves are even more complex — constructed from five 3rd-degree curve segments spliced together. But a 9th-degree curve drawn manually already achieves a visually convincing result, which is sufficient for mockups.

The phone's outer contour isn't a "simple" splicing of a few 3rd-degree curves either — it's far more complex. This shows the level of rigor Apple applies to design. (I'll add a side note: I'm willing to pay for this kind of design, but I'll always protest paying an extra $200 for double the RAM.)

# On to the Apple Watch

Compared to phones, watches are much more personal. Beyond functionality, a watch worn on the wrist and exposed to the world carries the attributes of jewelry (the iPhone felt this way in its early days too, but the Apple Watch is far more pronounced). Watches are also smaller, demanding even greater precision.

In fact, the first-generation Apple Watch was unveiled as a "One more thing" back in 2014 — three years before the iPhone X. I'm convinced the iPhone X borrowed its exterior treatment from the Apple Watch. If you look only at the silhouette, the iPhone X is essentially a stretched, enlarged Apple Watch.

![Apple Watch industrial design model - Precision surface construction of smartwatch 3D modeling](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584478541.webp)

![Apple Watch edge curve detail - 9th-degree curve construction of the watch face precision contour](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584485426.webp)

![Apple Watch side profile modeling - Surface generation techniques in industrial design](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584496686.webp)

![Apple Watch body modeling process - Quarter-surface mirror construction of the complete watch face](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584503733.webp)

![Apple Watch precision component modeling - Consistent curve grade across all components](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584510143.webp)

The images above show the Apple Watch model and edge curves I created in Rhino. The watch body uses two 9th-degree 10-point curves — the front contour as a path and the side profile as a shape — to generate a quarter-surface through sweeping, then mirrored to create the complete closed body model.

![Apple Watch modeling process animation - From curves to 3D model in industrial design workflow](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584544835.gif)

The industry has a tool called "zebra analysis" for surface inspection. As the name suggests, it projects zebra-like stripes onto the model surface. By rotating the model and observing whether the stripes flow smoothly, you can detect surface imperfections invisible to the naked eye.

![Zebra analysis demonstration - Surface smoothness detection technique in industrial design](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584558898.webp)

![Apple Watch band connector modeling - Precision-fit industrial design details](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584566691.webp)

![Apple Watch full assembly model - Complete product showcase with precision-fit components](./_images/跟着%20Apple%20Watch%20初识产品工业设计-1754584573918.webp)

As mentioned earlier, it's not just the watch body — every component of the Apple Watch is generated using curves of the same grade.

Consider this: the entire product design is executed by Apple, but manufacturing happens all over the world, yet the precision and consistency are astonishing. It's as if these parts were detached from the same body inside a computer. Holding the physical object, it's hard to believe these components share no physical connection. You may disagree with Apple's business practices, but their design deserves respect and study.

# Summary

This is just a glimpse into commercial product design — barely scratching the surface for someone like me who has one foot in the door. I welcome professionals to discuss and share their insights.

For something you use every day, as a designer, you're naturally curious about what's inside, how it works, how it's made, and what it's communicating to you. Rounded corners and the curves that draw them are just a tiny detail. Like any other design discipline, if you don't care about it, there's no need to go to great lengths. But once you do care — once you care whether a line is perfect, even if it only looks perfect — the pursuit becomes endless.
