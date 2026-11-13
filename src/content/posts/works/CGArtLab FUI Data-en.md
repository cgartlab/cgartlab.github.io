---
title: CGArtLab FUI Data Data Controller Plugin
published: 2026-11-12
description: A data readout panel for After Effects. Select a text layer and turn its number into a formatted readout with units, zero padding, thousands separators and prefixes or suffixes, all keyframeable. Built in 34 data types and 173 units.
tags:
    - Design Tool
    - After Effects
    - Motion Design
    - Data Visualization
draft: false
abbrlink: fui-data
toc: true
lang: en
---

![CGArtLab FUI Data plugin cover](../_images/CGArtLab-FUI-Data-1794413956618.png)

> **Public beta** (Windows · After Effects 2023+ · v0.2.0)

<a class="fui-download-btn" href="/downloads/CGArtLab-FUI-Data-0.2.0-beta-win.zip">Download CGArtLab FUI Data 0.2.0 beta</a>

> Install: quit After Effects, unzip and run `install.cmd`, restart AE, then open Window > Extensions > CGArtLab FUI Data.
>
> Trial: all features are free for **14 days** (34 types / 173 units / batch apply); after that it falls back to the free 4 types (Plain Text, Number, Temperature, Percentage).
>
> Usage: select a text layer, pick a type and unit, click Apply, then keyframe Value.

## Overview

CGArtLab FUI Data is a data controller panel I built for After Effects. Select a text layer and the panel reads the number inside it, helps you convert the unit, pad zeros, add thousands separators and prefixes or suffixes, and turns the text into a readout you can keyframe.

In film FUI, HUD and data visualization work, a readout is usually "a number plus a set of formatting rules", such as `22.0 °C`, `$1,234.56`, `03:48:06` or `31°13'12"N`. The manual way is to retype the text, keyframe each layer and copy the formatting; changing the unit or the currency means redoing the whole animation. This plugin removes the repetitive formatting and conversion from the workflow, so I can focus on composition, pacing and the idea.

## Teaching Video

The video below introduces the plugin in full:

::bilibili{id="BV146WU6CESN"}

## What It Can Do

- Build a jumping temperature, pressure, speed or battery readout;
- Show `1234.56` as `¥1,234.56`, or as the Chinese uppercase form;
- Show seconds as a `00:03:48` timecode;
- Show coordinates as `31°13'12"N`;
- Select several text layers and batch-apply the same format;
- Change the unit and have existing keyframes converted along with it;
- Switch to an unbounded number control automatically when a value goes past one million.

## How to Use

Three steps:

1. Select the text layer in After Effects;
2. Pick a type and a unit in the panel, for example "Temperature" + `°F`;
3. Click Apply, then keyframe the Value.

After applying, the number, unit, prefix, suffix, decimal places and thousands separator all become adjustable parameters on the layer. You can keep editing them in After Effects' Effect Controls, or click the number in the panel preview to change it. The preview shows exactly the text that gets written to the layer.

When you select a new text layer, the panel reads its text once and fills in the type, unit and parameters; `22 °C`, for example, is recognized as Temperature / °C. Only when nothing is recognized does it fall back to Plain Text. Once a layer is detected, parameter changes are written back automatically (about 260 ms debounce), or you can click Apply to write immediately.

## Features and Capabilities

### Data Types and Units

An activated copy has 34 data types and 173 units built in. Common ones include temperature, currency, length, weight, speed, area, volume, pressure, frequency, voltage, heart rate, blood oxygen, percentage, angle, latitude/longitude and timer/stopwatch; there are also power, energy, force, torque, acceleration, current, resistance, capacitance, charge, flow, density, concentration, data size, illuminance, radiation dose and radioactivity. Unit conversion covers Celsius/Fahrenheit/Kelvin, meter/centimeter/millimeter/kilometer/inch/foot, pascal/hectopascal/kilopascal/bar/atmosphere, hertz/kilohertz/megahertz, volt/millivolt/kilovolt, gram/milligram/ton/pound/ounce and more.

### Formatting

You can set decimal places, leading zeros, thousands separators, sign, prefix and suffix, decimal point style, tracking, alignment and text color. Prefix, suffix and unit are written into the same run of text; spacing is set as a number of spaces (0–20).

### Special Formats

- Chinese RMB in uppercase words;
- Timecode `HH:MM:SS`, from a time or from milliseconds, supporting more than 24 hours and negative values;
- Latitude/longitude in degrees, minutes and seconds, with N/S for latitude, E/W for longitude, or no direction.

### Keyframeable

Value, decimal places, leading zeros, prefix space, unit space, suffix space, thousands separator, show milliseconds and color can all be keyframed in After Effects, and the panel has a matching button for each. Two keyframes on decimal places between 0 and 2, for example, make a digit-count animation.

### Edit the Preview Directly

The number in the preview can be clicked and edited: for numeric types it writes back to Value, and Enter or clicking away applies it; for Plain Text it does not write back, so edit the text in After Effects directly. The key icon to the left of the preview keyframes Value.

### Large Values

Value uses a normal slider by default; above ±1,000,000 it switches to an unbounded point control automatically, and existing keyframes move with it.

### Batch Processing

With several layers selected, the panel applies to each one. Where type, unit or parameters differ, it shows "— multiple values", and unchanged fields keep each layer's own value.

### Anchor Nine-Grid

Move the anchor to an edge or corner of the text content without the position on screen jumping.

## Install and Get It

The plugin is an Adobe CEP extension panel; once installed, open it from After Effects' Window > Extensions > CGArtLab FUI Data. On Windows there is a one-click script (`install.cmd` / `install.ps1`) that copies the files into the CEP extensions folder, cleans up leftovers from older versions, writes `PlayerDebugMode` and runs a self-check, with no administrator rights needed.

The current version is in internal beta. To get the installer, message me on the Bilibili video page; the official release will be published on cgartlab.com.

A new install comes with a 14-day full-feature trial (all 34 data types / 173 units and batch apply work). After the trial it drops to 4 free types (Plain Text, Number, Temperature, Percentage), and activating restores everything. A license is machine-bound; the status bar at the top right of the panel shows the machine code, and you paste a license there to activate.

## Suitability and Limitations

It is made for motion designers doing film FUI, HUD, data visualization and broadcast packaging, and for anyone who needs to batch-change readout formats. It does not handle composition, pacing or the idea, and it does not replace typesetting: fine control of font, size and tracking stays in After Effects.

Known limitations:

- It works on text layers only; shapes, solids and nulls do not apply;
- The main text layer has no font or size control; the prefix and suffix can use their own font and size;
- The panel UI is Simplified Chinese only;
- Only After Effects 2023 has been verified on a real machine; newer versions are declared supported but not tested one by one;
- Currency rates use built-in fixed factors; the "rate" field in the panel is a manual override and does not update online;
- For Percentage with `‰`, a readout above 10% shows as `100‰`; use Number with a `‰` suffix when you need larger values.

## Related Links

- Teaching video: [正式介绍 FUI-Data](https://www.bilibili.com/video/BV146WU6CESN/)
- Website: [cgartlab.com](https://cgartlab.com)
