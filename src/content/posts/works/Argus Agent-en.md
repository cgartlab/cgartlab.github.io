---
title: Argus Frontend Design Review Agent
published: 2026-06-13
description: AI code review agent specialized in frontend design quality. Runs as a GitHub App, auto-reviews PRs for hardcoded values, design token violations, accessibility issues, and dark mode coverage.
tags:
  - AI
  - Code Review
  - GitHub App
  - Design Tool
draft: false
abbrlink: argus
toc: true
lang: en
---

![](../_images/Argus设计审查Agent-1787318582945.webp)

## Overview

Argus is an AI code review agent specialized in frontend design quality. It runs as a GitHub App ([argus-flash](https://github.com/apps/argus-flash)) — install it on any repo and every PR gets an automated design review that catches what humans and regular lint tools often miss. It can also run standalone in any agent framework like Claude Code, Cursor, or Kiro.

## Motivation

While building the EDIC Design System, **maintaining design consistency** proved harder than writing components.

You might have been there: a PR with `background: #f5f5f0` or a spacing value of `27px` that looks harmless, but in a system with 200+ design tokens, every bare color and every magic number is a landmine waiting to detonate. ESLint can't catch these. Manual review misses them — especially at 11 PM.

If they're design rules, why not have an AI review them? Thus Argus was born.

## Why Open Source

Design system maintenance is a pain point for every team. Argus's review rules are configurable. Open sourcing it means other teams can plug it in directly, or customize the review dimensions to match their own design system.

## Review Dimensions

Argus checks things that most linters can't:

- **Design Token Audit**: detects bare oklch / hex / rgb values outside `:root`
- **Hardcoded Value Detection**: magic numbers in spacing, radii, type scale
- **Accessibility Review**: aria-labels, alt text, focus indicators, WCAG AA contrast
- **Dark Mode Coverage**: verifies light/dark dual-mode style completeness
- **CSS Consistency**: duplicate rules, invalid BEM naming, empty catch blocks
- **HTML Structure Validation**: semantic elements, proper link vs button usage
- **Framework API Validation**: React / Vue / Angular / Svelte / Astro framework API usage patterns

## A few things you might not know about

- **Consumer Config**: drop a `.argus.yml` at your repo root to customize review dimensions, models, and output format — no code changes needed
- **Fixture Regression Tests**: 4 test suites (design-tokens / accessibility / hardcoded-values / css-quality) with 87+ test cases, preventing rule regressions after updates
- **Fallback Model Queue**: `free-models.yml` auto-refreshes every 12 hours; auto-fallback when the primary model is unavailable
- **Current version**: v0.3.3
- **License**: BSL 1.1 (Business Source License)

## How It Works

```shell
GitHub PR → argus-flash App → review pipeline → PR comment feedback
                         ↑
            AGENTS.md (hard rules)
            SKILL.md (review dimensions)
```

- **AGENTS.md**: hard rules, injected into the prompt
- **SKILL.md**: review dimension definitions, loaded dynamically
- **Runtime injection**: rule updates propagate to all consumer repos automatically

## 3-Step Setup

**Step 1: Install the "Security Guard"**

Go to the [GitHub App page](https://github.com/apps/argus-flash) and click Install. This adds argus-flash to your GitHub account — think of it as hiring an automated reviewer that watches every PR in your repos.

**Step 2: Set up the "Keys" and "Rules"**

In your repo's settings, go to **Secrets and variables** → **Actions**, then create two secrets:
- `ARGUS_FLASH_APP_ID`: your argus-flash App ID (found in GitHub App settings)
- `ARGUS_FLASH_PRIVATE_KEY`: the PEM private key generated when you created the App (paste the whole content)

Optional: add a `.argus.yml` file at your repo root to customize review dimensions, models, and output format. Without it, Argus uses built-in defaults.

This step tells Argus who's allowed to act on your repos and which rules to apply — like giving the guard an access card and a checklist.

**Step 3: Add one line to your "Task List"**

Create a GitHub Actions workflow file (e.g. `.github/workflows/review.yml`) and add a single line:

```yaml
- uses: cgartlab/argus/.github/actions/argus-review@main
```

This one line means: "every time someone opens a PR, tell Argus to check it." No extra logic needed — Argus reads the rules, runs the review, and posts comments on its own.

---

After that, every new PR triggers Argus automatically. It flags issues as PR comments, and re-checks after you push fixes.

## Links

- GitHub: [github.com/cgartlab/argus](https://github.com/cgartlab/argus)
- GitHub App: [argus-flash](https://github.com/apps/argus-flash)
