---
title: LayerRenamer 1.0 Script Released - Photoshop Layer Renaming Has Never Been Easier
published: 2024-09-10
description: Photoshop batch layer renaming script LayerRenamer 1.0 released, supporting custom naming rules and numbering formats to improve design workflow efficiency
updated: 2024-12-11
tags:
  - tech-sharing
draft: false
pin: 0
toc: true
lang: en
abbrlink: layerrenamer-1-en
---

![LayerRenamer script cover image, showcasing Photoshop batch layer renaming functionality](_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591673573.webp)

## Introduction

When working with `.psd` files containing numerous layers in graphic design using Photoshop, renaming layers one by one is a very tedious and time-consuming task.

After searching online, I found that most websites either require installing corresponding version plugins, or the scripts are outdated and simply rename all layers in a very brute-force manner. It's surprising that Photoshop, having developed for so many years, still hasn't incorporated such a simple and efficient feature.

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

## What I Needed Was

- Only modify currently selected layers
- Support for layers at any hierarchy level
- Ability to add numbering suffixes to these layers
- Preferably able to modify layer `color tag` simultaneously

## Creation Steps

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

## Usage Steps

1. Open Adobe Photoshop 2023.
2. Select the layers you want to rename (you can multi-select in the layers panel, supporting layers nested within layer groups).
3. Go to `File` -> `Scripts` -> `Browse...`, and select your saved script file.
4. After executing the script, three prompt boxes will appear:

![Three input prompt boxes displayed during Photoshop script execution, for setting layer name, starting number, and numbering format](_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591711857.webp)

- The first prompt box asks for the base layer name, for example "Layer".
- The second prompt box asks for the starting value of the numbering, for example "1".
- The third prompt box asks for the numbering format, for example "001", ensuring consistent digit length for numbers.

After confirming your selections, the script will automatically rename the selected layers according to your set format.

## Advanced Version

The above functionality is basically sufficient. If you need to simultaneously modify color tags, you can download the advanced version. The effect is shown below:

![LayerRenamer advanced version functionality demonstration, showing batch layer renaming and color tag setting effects](_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591720351.webp)

Download link:

【LayerRenamer_PS-2023.jsx】

<https://16b87ca7d6.znas.cn/AppH5/share/?nid=LIYDEMJQGBBDEOCELBIFU&code=r1DtQDtFZobo1ai8Jd0UylatvnNkQ3xcodyiJBPo4ejLcOfybeyVGW0o3LOTKTHF&mode=file&display=list>

Valid for 7 days, extraction password: 6633