---
title: EDIC Design System
published: 2026-06-08
description: An editorial design system for both humans and AI agents. Built with OKLch colors and design tokens, framework-agnostic, dark-mode ready.
tags:
  - Design Tool
draft: false
abbrlink: edic-design-system
toc: true
lang: en
---

![EDIC Design System cover](../_images/EDIC设计系统-1754664829706.webp)

## Overview

EDIC (Editorial Design Interface for Content) is a design system I built for personal use.

## Motivation

Initially, I wanted to leverage Agent capabilities to batch-generate consistent, controllable design assets — icons, components, color pairings. Manually tweaking styles each time was tedious, so I decided to lock in design decisions upfront, allowing Agents to produce compliant output directly.

After validating this approach in practice, I packaged it as an open source release.

## Why Open Source

Something that works well for me turned out to help others too. The system is pure static CSS with zero framework dependencies, making integration effortless.

## Features

- **200+ Design Tokens** — color, typography, spacing, motion, full coverage
- **20 Core + 5 Additional Components** — with complete states
- **100 SVG Icons**
- **Framework Agnostic** — single CSS works with HTML, React, Vue, Svelte, or email
- **AI Collaboration Tools** — prompts & Skills let Agents produce compliant designs

## Links

- Website: [edic.cgartlab.com](https://edic.cgartlab.com)
- GitHub: [github.com/cgartlab/edic-design-system](https://github.com/cgartlab/edic-design-system)