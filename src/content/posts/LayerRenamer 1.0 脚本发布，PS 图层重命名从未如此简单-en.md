---
title: "LayerRenamer — Free Photoshop Batch Layer Rename Script"
published: 2024-09-10
description: "Automate Photoshop layer renaming with LayerRenamer. Batch rename hundreds of layers with custom names, numbering, and color tags — free for personal use."
updated: 2024-12-11
tags:
    - tech-sharing
    - Photoshop
    - Automation
draft: false
pin: 0
toc: true
lang: en
abbrlink: layerrenamer-1
---

![LayerRenamer Photoshop script interface showing batch layer renaming functionality for designers](_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591673573.webp)

## Why Use LayerRenamer

Renaming dozens of Photoshop layers one by one is tedious, error-prone, and eats straight into your design time. LayerRenamer fixes this with three things:

- **Batch** — rename only the layers you select, at any hierarchy level, nested groups included
- **Rule-based** — custom base names, sequential numbering with zero-padding (`001`, `01`), and optional color tags in a single pass
- **Free** — no plugin installation, no license, works with Adobe Photoshop 2023's built-in script engine

## The Problem With Existing Scripts

Most scripts found online either require installing a version-specific plugin, or are outdated and rename *every* layer in a very brute-force way. It's surprising that Photoshop, after all these years, still doesn't ship this simple and efficient feature built in.

Here's the widely circulated version online for reference:

```json
app.bringToFront();
var YourName = prompt("请输入您需要重命名的图层名称",'请输入')
if (documents.length == 0) {
    alert("没有图层");
}
else {
    var visibility = false;
    var docRef = activeDocument;
        changeLayerName(docRef);
}

function changeLayerName(layer){

    var layers = layer.layers;

    if(layers){

    for(var i = 0; i < layers.length; i ++){
        layers[i].name = YourName + [i];
        changeLayerName(layers[i]);
    }
}
}
```

## Requirements

- Adobe Photoshop 2023 (ExtendScript compatible; also works with newer versions)
- macOS or Windows
- A text editor to create the `.jsx` script — or download the ready-to-use file in the [Advanced Version](#advanced-version) section

## What LayerRenamer Can Do

- Only modify currently selected layers
- Support layers at any hierarchy level
- Add sequential numbering suffixes to layers
- Modify layer `color tag` in the same pass (advanced version)

## How to Use

1. **Open Adobe Photoshop 2023** and open your `.psd` file.
2. **Select the layers** you want to rename — multi-select in the Layers panel works, and layers nested inside layer groups are supported.
3. **Run the script** via `File` → `Scripts` → `Browse…` and pick your saved `.jsx` file.
4. **Fill in the three prompts** that appear:

![Three input prompt boxes displayed during Photoshop script execution, for setting layer name, starting number, and numbering format](_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591711857.webp)

   - **Base layer name** — e.g. `Layer`
   - **Starting number** — e.g. `1`
   - **Number format** — e.g. `001`, ensuring consistent digit length for numbers

5. **Confirm** — the script renames every selected layer according to your format in one pass.

## Build the Script Yourself

Create a new text file using a text editor, paste the following code, and you can implement batch layer renaming through Adobe Photoshop 2023's script functionality. This script can traverse all selected layers in the current document, prompt the user to input custom layer names and numbering formats, then rename each layer according to the user-specified format. The script automatically handles whether layers are located within layer groups.

```json
//target photoshop
app.bringToFront();

if (app.documents.length === 0) {
    alert("没有打开的文档。");
    throw new Error("No document open.");
}

var doc = app.activeDocument;

var selectedLayers = getSelectedLayers();
if (selectedLayers.length === 0) {
    alert("没有选中的图层。");
    throw new Error("No layers selected.");
}

var baseName = prompt("请输入基础图层名称：", "Layer");
var startNumber = parseInt(prompt("请输入编号的起始值：", "1"), 10);
var numberFormat = prompt("请输入编号格式（例如 001，保持编号位数）：", "001");

if (isNaN(startNumber) || !baseName || !numberFormat) {
    alert("输入无效，请重新运行脚本。");
    throw new Error("Invalid input.");
}

renameLayers(selectedLayers, baseName, startNumber, numberFormat);

function getSelectedLayers() {
    var selectedLayers = [];
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);

    if (desc.hasKey(stringIDToTypeID('targetLayers'))) {
        var targetLayers = desc.getList(stringIDToTypeID('targetLayers'));
        for (var i = 0; i < targetLayers.count; i++) {
            var layerIndex = targetLayers.getReference(i).getIndex();
            selectedLayers.push(getLayerByIndex(layerIndex + 1));
        }
    } else {
        selectedLayers.push(doc.activeLayer);
    }
    return selectedLayers;
}

function getLayerByIndex(index) {
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index);
    var desc = executeActionGet(ref);
    var layerID = desc.getInteger(stringIDToTypeID("layerID"));
    return getLayerById(layerID);
}

function getLayerById(id) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), id);
    var desc = executeActionGet(ref);
    return doc.layers.getByName(desc.getString(charIDToTypeID("Nm  ")));
}

function renameLayers(layers, baseName, startNumber, numberFormat) {
    for (var i = 0; i < layers.length; i++) {
        var currentNumber = (startNumber + i).toString();
        var formattedNumber = zeroPad(currentNumber, numberFormat.length);
        var newName = baseName + formattedNumber;
        layers[i].name = newName;
    }
}

function zeroPad(num, width) {
    while (num.length < width) {
        num = '0' + num;
    }
    return num;
}
```

The above code implements basic layer renaming and numbering sorting functionality. Save the file as a script file named `xxx.jsx`.

## Advanced Version

The above functionality is basically sufficient. If you need to simultaneously modify color tags, you can download the advanced version. The effect is shown below:

![LayerRenamer advanced version functionality demonstration, showing batch layer renaming and color tag setting effects](_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591720351.webp)

Download link:

【LayerRenamer_PS-2023.jsx】

<https://16b87ca7d6.znas.cn/AppH5/share/?nid=LIYDEMJQGBBDEOCELBIFU&code=r1DtQDtFZobo1ai8Jd0UylatvnNkQ3xcodyiJBPo4ejLcOfybeyVGW0o3LOTKTHF&mode=file&display=list>

Valid for 7 days, extraction password: 6633

## vs Existing Solutions

| Approach | Batch renaming | Only selected layers | Custom rules | Color tags | Setup effort |
|----------|---------------|----------------------|--------------|------------|--------------|
| Manual renaming | ❌ | — | ❌ | ❌ | none |
| Generic online scripts | ✅ | ❌ renames everything | ⚠️ limited | ❌ | copy-paste, version-dependent |
| LayerRenamer | ✅ | ✅ | ✅ | ✅ (advanced) | 1 file, no install |

## FAQ

**Is LayerRenamer really free?**

Yes. The script is free to download and use — no plugin, license, or account required.

**Which Photoshop version do I need?**

The script targets the Photoshop 2023 script engine. It runs through `File → Scripts → Browse…` on both macOS and Windows.

**Does it rename layers inside groups?**

Yes. The script traverses selected layers at any hierarchy level, including layers nested within layer groups.

**Can I set color tags at the same time?**

Yes — that's what the advanced version adds. It applies the color tag in the same pass as the rename (see the download link above).

## Related Posts

- [Men (门) Agent Team](/en/posts/men/) — an AI agent team for solo content creation and engineering collaboration
- [The Odyssey, Custom Agents, and the Skills That Actually Solve Problems · No.19](/en/posts/weekly-19/) — the Skill ecosystem behind agent-driven workflows
