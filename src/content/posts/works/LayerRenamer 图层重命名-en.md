---
title: LayerRenamer Batch Layer Rename
published: 2024-09-10
description: Batch rename layers for Photoshop and After Effects. Custom naming rules, numbering formats, color labels, dry-run preview, and 3 conflict resolution strategies.
tags:
  - Designer-Tools
  - Photoshop
  - Script
draft: false
abbrlink: layerrenamer
toc: true
lang: en
---

![LayerRenamer](../_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591673573.webp)

## Overview

LayerRenamer is an ExtendScript script for Photoshop and After Effects that batch-renames selected layers. It supports custom naming rules, numbering formats, color labels, a dry-run preview mode, and three conflict resolution strategies.

## Motivation

When working with PSDs containing dozens or hundreds of layers, renaming them one by one is tedious. Scripts found online are either outdated or aggressively rename everything without fine-grained control.

Wrote one that only renames selected layers, supports numbering formats with zero-padding, includes a preview mode, and gives you a choice when names collide — skip, overwrite, or auto-append suffixes.

## Why Open Source

Every designer probably has their own version of this kind of tool, but most are rough around the edges. Making it a proper project with clear documentation and a compatibility matrix means anyone with the same need can use it directly — and help improve it too.

## How to Use

### Photoshop — 4 Steps

**Step 1: Select layers**

In the Layers panel, hold Ctrl/Cmd to multi-select the layers you want to rename. Selecting a layer group (folder) works too — the script auto-expands it and includes all child layers.

**Step 2: Load the script**

Go to **File → Scripts → Browse…**, find the downloaded `LayerRenamer_PS-2023.jsx`, and open it. You can also drop the script into Photoshop's presets folder (`/Presets/Scripts/`) so it appears in the menu permanently.

**Step 3: Fill in the settings**

A dialog pops up with a few fields:

- **Base name**: the prefix for all renamed layers. Type `Text` and your layers become `Text 001`, `Text 002`...
- **Start number**: where numbering begins. Default is 1.
- **Number format**: use zeros to set digit count. Type `001` for three-digit (001, 002, 003…), `01` for two-digit (01, 02, 03…).
- **Color label** (optional): batch-tag layers with colors. Red for text layers, green for shapes — instant visual grouping.
- **Dry-run preview**: check this on your first run. The script shows the rename plan without actually doing anything — lets you verify before committing.

**Step 4: Confirm**

With Dry-run on, clicking confirm shows a preview table: "original name → new name" for every layer. Once you're happy, **run the script a second time with Dry-run unchecked** to actually rename.

### What if a name already exists?

If your target name collides with an existing layer (e.g. you rename `Layer 001` but another layer is already called that), you have three options:

| Strategy | What happens | When to use |
|----------|-------------|-------------|
| **Skip** | skips that layer, keeps original name | when unsure, play safe |
| **Overwrite** | allows the name (PS handles dupes itself) | when you know it's safe |
| **Auto-suffix** | auto-generates unique names like `Layer_1`, `Layer_2` | simplest, no conflicts ever |

### After Effects version

Same steps as Photoshop, with a few differences:

- Script file is `LayerRenamer_AE-2023.jsx`
- Must have a composition open (select one in the Project panel) before running
- Ctrl+Z undoes the entire batch rename
- Place the script in AE's `ScriptUI Panels` folder to make it a permanent panel

## Features

### Dual Platform Support

- **Photoshop 2023+** — run via File → Scripts menu
- **After Effects 2023+** — usable as a floating panel
- Pure ExtendScript, no plugin installation required

### Conflict Resolution Strategies

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| Skip | skips the layer if target name exists | conservative, avoids surprises |
| Overwrite | allows target name (host may auto-handle duplicates) | when you're sure it's safe |
| Auto-suffix | auto-generates unique names (e.g. `_1`, `_2`) | batch ops guarantee no dupes |

## Links

- Full article: [LayerRenamer 1.0 — PS Layer Renaming Made Simple](/posts/layerrenamer-1/) (Chinese)
- GitHub: [github.com/cgartlab/LayerRenamer](https://github.com/cgartlab/LayerRenamer)
