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

![Men (门) Agent team site cover](../_images/ScreenShot_2026-08-27_163611_874.png)

## Overview

Men Agent is an Agent team collaboration system I built on OpenCode. The situation it solves: one person wants to both write and ship projects, so it gives you five specialized virtual assistants, plus a coordinating "men" (门). You just throw your ideas at it; it automatically recognizes the nature of the task, judges your intent, routes the professional work to the right assistant, and reports back when done.

Using AI to get specific content done really just comes down to "finished, and finished right." So what Men cares about most is **mechanical verification first, no fake completions**: when the AI says "I'm done," that doesn't count — the program scans the evidence first, then a fresh sub-agent double-checks it. Trust the artifact, not the claim.

## 6+1 Roles

It's really six Agents plus the user — when using Agents for creation, it's easy to forget the human's key role:

- **men (门) · orchestration & routing core**: the only role that receives user instructions. Intent triage (IntentGate), task routing, multi-Wave scheduling, result aggregation & de-confliction, event-audit writing — every instruction enters through this door and is routed to the most suitable role. It writes no code, no copy, and does no design itself.
- **si (思) · thinking & knowledge management**: deep thinking produces multi-angle plans, delivered as a plan envelope — a plan document containing a dependency graph, parallel waves, and acceptance criteria; it curates the knowledge base; plans only, no execution, and its plans must pass chi's verification before being released.
- **ji (记) · code & engineering**: implements front-end code per the plan, operates GitHub PR/Issue, writes technical docs/weekly reports, and audits directory structure; before delivering it runs a layer of L1 verification (typecheck/lint) to pass the local gate first.
- **chi (持) · data/investment review + independent Judge**: dual identity — investment position analysis and profit math on one side, independent judge on the other; when judging it reviews with a fresh context, never reusing the reviewed agent's context — it trusts only the artifact.
- **yi (艺) · image generation & aesthetics**: an image-prompt expert; it drafts multiple prompt sets during thinking and generates images via SenseNova; owns design decisions & token definition, color/layout, aesthetic analysis, and logo concepts. Image generation is mounted only on it.
- **xun (寻) · search & research**: web search (Exa), RSS aggregation, knowledge-base retrieval, multi-source cross-checked fact verification; read-only — it never modifies source data, and search results must include source links.
- **The user** is the "gatekeeper" (门神) and final decision-maker, responsible for the final quality of what ships.

## Core Mechanisms

To make these assistants cooperate by the rules, I designed the following mechanisms:

- **10-step orchestration protocol**: a task runs through CERTAINTY → TRIAGE → PLAN → DISPATCH → COLLECT → EVALUATE → VERIFY → REPORT → LOOP, each step with clear inputs and outputs, turning a sentence into a deliverable.
- **Intent gate routing (IntentGate)**: the task is first classified into one of four intents — search (find info) / analyze (produce + review) / team (multi-role collaboration) / hyperplan (complex project planning); when confidence is low, it confirms with you first and never guesses.
- **Wave parallel scheduling**: work with no dependencies starts at the same time (parallel cap ≤4); dependent work waits for the previous wave's output; each sub-task's requirements are written self-contained so sub-agents don't need to ask back midway.
- **Double-layer mechanical verification**: after the work, run `verify.mjs` for five mechanical checks (exit code, file existence, secret leaks, leftover TODOs, structure); once all PASS, chi independently reviews as Judge with a fresh context. "Saying you're done yourself" doesn't count — "both the machine and an onlooker nod" does; fake completions are always caught.
- **Event audit (14 kinds)**: `events.jsonl` records session.created/ended, boundary, workflow.phase, gate.passed/failed, blocker.raised, decision.made/missing, verify, judge, error, dispatch, handoff — 14 event types, append-only, replayable one by one afterward.
- **Self-learning loop (M7)**: `learn.mjs` distills experience from the event stream into `knowledge/errors` and `knowledge/patterns` so the same mistakes aren't repeated; `eval-metrics.mjs` computes 8 KPIs (pass rate, regression rate, average time...), so the numbers tell you how it's doing.
- **Safety gate**: `gate.mjs` whitelists what can be touched to prevent injection; if the same job fails 5 times in a row it stops and calls for help instead of burning your machine.
- **Zero dependencies**: the verification, gate, and audit trio are all pure Node, no third-party libraries, so the environment bar is very low and it runs on any machine.

## Quick Start

After install, run `opencode` in any directory; the default agent is men (门). Current version v0.3.3, requires Node ≥ 18.

The laziest way — the official npm one-liner (automatically runs scaffolding, dependencies, environment check, and verification):

```bash
npx @cgartlab/men
```

If you'd rather type it yourself, use the pipe scripts:

```bash
# Linux / macOS
bash <(curl -fsSL https://raw.githubusercontent.com/cgartlab/men/main/install.sh)

# Windows (PowerShell 7+)
irm https://raw.githubusercontent.com/cgartlab/men/main/install.ps1 | iex
```

Or send the line below to any AI assistant (OpenCode / Claude / Cursor all work) and it'll install and launch for you:

> Install and launch men for me: `npx @cgartlab/men && cd men && npx astro dev --config site/astro.config.mjs`

The three most-used commands:

- `/ultrawork <task>`: hand it a sentence and the 10-step protocol auto-dispatches the team to finish the job
- `/verify <role>`: mechanical check + independent review to confirm the artifact is solid
- `/hyperplan <project>`: for big projects, think it through first, then break it into executable steps

## Links

- GitHub: [github.com/cgartlab/men](https://github.com/cgartlab/men)
- Site: [men.cgartlab.com](https://men.cgartlab.com)
- License: MIT
