---
title: "The Skills That Really Do the Work: XuanGuang Weekly No.19"
published: 2026-06-02
updated: 2026-06-27
description: "Continuing from last issue, this week I introduce the second category of my OpenClaw Skills — the dedicated ones that truly carry the workload. They are deeply integrated with self-hosted services and have become part of my production workflow."
tags:
  - Weekly
  - Tech
  - Workflow
  - OpenClaw
draft: true
pin: 0
toc: true
lang: en
abbrlink: weekly-19
---

![](../_images/主题%20-%20No.18%20玄光周刊-1779030168319.webp)

This issue's cover photo was taken from an old wall on a Kunming street. The peeling paint is layered upon layer, each crack like a ring on a tree trunk. In this era of explosive AI tool迭代, some things still require years of accumulation to truly withstand pressure.

---

> [!note] About This Newsletter
> This is a weekly newsletter focused on knowledge management, covering digital art, visual design, and frontend development. It is published once a week, with each issue exploring a specific topic in depth.
>
> If you enjoy the content here and want a better reading experience, I recommend visiting the official website in your browser.
>
> You can also subscribe via **RSS** (https://weekly.cgartlab.com/feed/atom) or **email** (https://weekly.cgartlab.com).

---

## The Skills That Really Do the Work

Last issue introduced the first category of Skills — infrastructure-type Skills for information collection and integration. But those are more like "eyes" and "ears." What truly makes OpenClaw a productivity hub is the **second category of Skills** — dedicated Skills deeply integrated with self-hosted services.

If the first category solves "what to see," the second category solves "what to get done." These Skills share common characteristics: they require self-hosted services, involve real automated execution, and handle core parts of critical workflows.

> ℹ️ **About cgart-analysis / news-report**: The workflow for these two Skills was covered in detail last issue, so I won't重复 it here. Please refer back to [XuanGuang Weekly No.18](https://cgartlab.com/en/posts/weekly-18/) if needed.

**affine-cli**: An Affine command-line tool. This is my core tool for managing Affine documents, supporting both cloud and self-hosted modes. It lets me handle all operations on documents, tags, folders, collections, databases, comments, journals, and workspaces through the command line.

Common use cases include: managing daily journals (`affine-cli journal create / append`), searching documents (`affine-cli doc search`), operating databases (`affine-cli database query / insert / update`), and managing tags and folders. For anyone who needs to batch-operate Affine content, this Skill turns manual operations into programmable automation.

**affine_todo**: Task management based on the Affine database. This is my single source of truth for tasks — all tasks are stored in the "Task List" database within the Affine "Task Tracking" document, read and written through affine-cli.

Tasks are divided into three levels (L1 basic maintenance, L2 system optimization, L3 transformation and revolution), designed based on Musk's task理念. When asked "what's on my to-do list" or "what should I do next," I directly call the `what_next.py` script, which sorts and recommends the next step by level. This Skill keeps all my tasks in one place, not scattered across multiple tools.

**invest-advisor**: The investing advisor — operating guidelines. This is a set of operational rules designed specifically for the wealth-tracker container. The core goal is to absolutely avoid destructive operations and ensure zero data loss. It solves a致命 problem: the `assets` table has an `ON DELETE CASCADE` foreign key constraint. Executing a DELETE would simultaneously wipe all data from both the `assets` and `records` tables — irreversible.

Four iron rules: never use DELETE for deduplication — use sqlite3 directly instead; use Upsert (INSERT OR REPLACE) for data deduplication; update assets one by one with PUT; always back up before destructive operations. This Skill lets me operate on the NAS database without any心理负担, because any operation can be rolled back.

**daily-report**: The daily report system. This runs automatically at 7:30 AM and PM every day, sequentially executing the collection scripts of four Skills — sys_status, api-usage, check-update, news-report — then整合 them into a unified Markdown简报.

The流程 is: `run_all.sh` executes the collection scripts of the four Skills in order, outputting to a temp directory; `integrate.py` reads the collection results and generates a unified简报; finally, it's sent to Telegram via cron agentTurn. This lets me grasp system status, usage reports, and news updates in just 3 minutes every morning and evening, instead of switching between various tools.

**penpot-design**: The Penpot design workbench. This is an AI-assisted design workbench that reads and writes Penpot files through the MCP protocol, enabling designers to complete the full流程 from reading design information to creating and editing design elements with AI assistance. Its core principle is "read before design" — when entering any Penpot file, the first step is always a comprehensive read. Never touch anything you don't understand.

The reading phase gathers file information through 9 steps: read all pages, page structure, color library, font system, component library, tokens, all text content, artboard dimensions, constraints, and layout details. All data is immediately cached to avoid redundant queries. The execution phase strictly follows four iron rules: dimension constraints are the lifeline of layout, look before you draw, hierarchy first, spacing discipline. For designers who want to automate their design workflow, this Skill turns design from a "craft" into a "programmable pipeline."

---

## This Issue's Recommendations

### n8n — Open Source Workflow Automation Platform

![Image from original article](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036210576.webp)

🔗 https://n8n.io

n8n is an open-source workflow automation platform, similar to Zapier but fully self-hosted. Its biggest strength is **high customizability** — you can deploy a complete workflow engine yourself, and your data never leaves your server.

It supports over 400 integration nodes, from HTTP requests to AI models, code execution to data transformation, covering almost all common automation scenarios. Compared to commercial platforms, n8n's advantage is that you have full control over your data and automation logic. For users who need to deeply integrate OpenClaw with other services, n8n is an ideal middleware layer.

### Trae — A国产 AI IDE Redefining Programming

![Image from original article](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036148975.webp)

🔗 https://trae.ai

Trae is a国产 AI programming tool that has been getting a lot of attention recently. Unlike foreign products like Cursor and Windsurf, Trae focuses more on the habits of Chinese developers and comes with deep integration of multiple国产 large language models.

Its biggest highlight is **Chinese interface and国产 model priority**. For users who are not comfortable with English IDEs or need to frequently use国产 models, it's worth trying. Currently free to use, offering great value.

### Notion API — Infinite Possibilities for Structured Knowledge

🔗 https://developers.notion.com

The Notion API isn't new, but some recent automation workflows built on it have impressed me. Through the API, you can turn Notion into a **structured knowledge hub**, using automation tools to link notes, tasks, and databases.

I recommend checking out n8n's Notion node and Make's Notion integration. They can elevate your knowledge management in Notion to a new level.

### Windsurf — Codeium's AI Programming Tool

![Image from original article](../_images/我常用的%20OpenClaw%20工作流%20Skill%20-%20No.18%20玄光周刊-1779036946164.webp)

🔗 https://codeium.com/windsurf

Windsurf is an AI IDE from Codeium. Its **SUPERCOMPLETION** feature caught my eye. Unlike traditional code completion, SUPERCOMPLETION understands the full project context and generates code snippets across multiple files.

For large-scale refactoring and feature development, this feature can significantly reduce manual coding effort. However, it's still in early stages, and actual results vary by project.

---

## Video Pairing

[AI Programming Tool Showdown: Cursor vs Windsurf vs Trae](https://www.bilibili.com/video/BV1Ph4y1K7Uv/)

These AI IDEs have been generating a lot of buzz lately. This video provides a横向 comparison to help you choose the right one 👆.

---

## Wrap-Up and Preview

OpenClaw's Skill system goes far beyond this. The Skills I currently use can be divided into three categories: the first is infrastructure for information collection and integration, the second is the dedicated Skills that truly carry the workload (introduced today), and the third is **third-party Skills** that have delivered satisfying results.

Next issue, let's talk about those third-party Skills that feel like "finding treasure." They weren't designed by me, but they perform exceptionally well in certain scenarios.

---

This newsletter is first published on [CG Art Lab](https://cgartlab.com/weekly).