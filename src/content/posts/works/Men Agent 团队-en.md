---
title: Men (门) Agent Team
published: 2026-08-27
description: "A 6+1 Agent team system for solo content creation and engineering collaboration. Debuts on OpenCode, mechanical verification first, no fake completions. Single-character names: men · si · ji · chi · yi · xun."
tags:
  - ai
  - open-source
  - agent-team
  - design-tool
draft: false
abbrlink: men
toc: true
lang: en
---

![Screenshot of the Men (门) Agent team site showing the 6+1 role collaboration interface](../_images/ScreenShot_2026-08-27_163611_874.png)

## Recent Updates

### 2026-08-27: The six roles are better defined

I re-sorted what each of the six Agents is responsible for, so they stop grabbing the same work and you always know who to talk to:

- **men** is now the only dispatcher. You only talk to it; it hands work out and collects the results, and the other roles no longer assign tasks to each other.
- **si** became the one who "thinks and manages knowledge" — it works out the plan and stores experience, and no longer writes code itself.
- **ji** focuses on writing code and docs, and checks its own work once before handing it over.
- **yi**'s core shifted to image-generation prompts, making "getting AI to produce good images" solid.
- **chi** picked up data statistics on top of investment review.
- **xun** set a hard rule: nothing goes out until it's verified.

Along the way I synced the role descriptions and collaboration diagram on the site and docs to the new split, and corrected the skill count (removed one empty shell).

### 2026-08-21: From a runnable repo to a team that improves itself

This release upgraded men from "a runnable program" to "a team with rules, process, and retrospectives":

- **The open-source basics are in place**: license, contribution guide, security policy, automated CI checks... others can now contribute by the book, and bad code can't reach the main branch.
- **Added "self-learning"**: after each job, men writes the pitfalls it hit and the tricks that worked into `knowledge/`, so it won't repeat the same mistakes; it also computes 8 KPIs for itself (completion rate, first-pass rate, regression rate...), so you can see from the numbers whether the team is getting better.
- **Tools grew from 3 to 7**: it can now fetch web pages, operate GitHub, keep long-term memory, and do complex reasoning — clearly able to do more.

## Overview

Men (门) is an Agent team system I built on OpenCode. The situation it solves: one person wants to both write and ship projects, so it gives you six virtual assistants with different strengths, plus a "men" that handles coordination. You just throw your ideas at it; it splits the work, watches quality, and reports back when done.

Using AI to get specific content done really just comes down to "finished, and finished right." So what Men cares about most is **mechanical verification first, no fake completions**: when the AI says "I'm done," that doesn't count — the program scans the evidence first, then a fresh sub-agent double-checks it. Trust the artifact, not the claim.

## 6+1 Roles

Sounds like a small studio; it's really six Agents plus one dispatch core:

- **men · front desk / project manager**: every instruction enters through it; it figures out what you want, who to assign it to, and finally hands the result back to you. It doesn't do the hands-on work itself.
- **si · the team's brain**: deep thinking, working out the plan, and storing knowledge. It only produces plans, not code.
- **ji · the doer**: writes front-end code, technical docs, and operates GitHub per the plan, and runs its own check before delivering.
- **chi · finance + QA**: does your investment math on one side and acts as an independent judge on the other — since it didn't do the work, it can critique objectively.
- **yi · designer**: turns a simple command into a professional prompt, generates images, and sets colors and layout.
- **xun · researcher**: searches the web, reads RSS, checks facts; the rule is "no output until verified."
- **men** is the only one who assigns work; nested assignment between roles is forbidden; all six share 7 red lines no one may cross.

## Core Mechanisms

To make these assistants cooperate by the rules, I designed the following red-line rules:

- **Double check**: after the work, run `verify.mjs` for five mechanical checks (correct exit code, file actually generated, no leaked secrets, no leftover TODO, correct structure); once all pass, chi re-checks independently with a fresh context. "Saying you're done yourself" doesn't count — "both the machine and an onlooker nod" does.
- **Parallel when possible**: work that doesn't depend on each other starts together, up to four at once; each sub-task's requirements are written out clearly, so no need to ask back midway.
- **Ask before acting**: for the four kinds of tasks — "research / produce / multi-role collaboration / big project planning" — when unsure, confirm with you first; never guess and barrel ahead.
- **Safety rope**: `gate.mjs` whitelists what can be touched to prevent injection; if the same job fails 5 times in a row, it stops and calls for help instead of burning your machine.
- **Full trace**: 14 key event types are logged in `events.jsonl`, append-only, so you can replay them one by one afterward and see who made what decision.
- **Retrospective**: `learn.mjs` distills experience from the logs, and `eval-metrics.mjs` computes the team's KPIs — how it's doing, the numbers tell you.
- **Zero dependencies**: the verification, gate, and audit trio are all pure Node, no third-party libraries, so the environment bar is very low and it runs on any machine.

## Quick Start

The laziest way — send the line below straight to any AI assistant (OpenCode / Claude / Cursor all work), and it'll install and launch for you:

> Install and launch men for me: `git clone https://github.com/cgartlab/men.git && cd men && node scripts/install.mjs && npx astro dev --config site/astro.config.mjs`

If you'd rather type it yourself:

```bash
# Linux / macOS
bash <(curl -fsSL https://raw.githubusercontent.com/cgartlab/men/main/install.sh)

# Windows (PowerShell 7+)
irm https://raw.githubusercontent.com/cgartlab/men/main/install.ps1 | iex
```

After install, run `opencode` in the project directory; the default agent is men. The three most-used commands:

- `/ultrawork <task>`: hand it a sentence and the 9-step protocol auto-dispatches the team to finish the job
- `/verify <role>`: mechanical check + independent review to confirm the artifact is solid
- `/hyperplan <project>`: for big projects, think it through first, then break it into executable steps

## Links

- GitHub: [github.com/cgartlab/men](https://github.com/cgartlab/men)
- Site: [men.cgartlab.com](https://men.cgartlab.com)
- License: MIT
