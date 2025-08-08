---
title: LayerRenamer 1.0 脚本发布，PS 图层重命名从未如此简单
published: 2024-09-10
description: Photoshop图层批量重命名脚本LayerRenamer 1.0发布，支持自定义命名规则和编号格式，提升设计工作效率
updated: 2024-12-11
tags:
  - 技术分享
draft: false
pin: 0
toc: true
lang: zh
---

![封面](./_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591673573.webp)

# 引言

平面设计在使用 Photoshop 处理图层数较多的 `.psd` 文件时，挨个对图层重命名是非常繁琐耗时的工作。

上网搜了一下，各大网站要么需要安装对应版本的插件，要么脚本发布日期久远，且非常暴力的把所有图层全部重命名了。Photoshop 发展了这么多年，居然一直没加入这样简洁高效的功能，也是匪夷所思。

以下是网上广为流传的版本，供参考。

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

# 而我需要的功能是

- 只修改我当前选中的图层
- 图层支持任意层级
- 可以为这些图层加入编号后缀
- 最好能够同时修改图层的 `color tag` 颜色标签

## 制作步骤

使用文本编辑器新建文本文件，粘贴下面的代码，可以通过 Adobe Photoshop 2023 的脚本功能实现批量重命名图层。该脚本可以遍历当前文档中所有所选的图层，并提示用户输入自定义的图层名称和编号的格式，然后按照用户指定的格式为每个图层进行命名。脚本会自动处理图层是否位于图层组中。

```json
#target photoshop
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

以上代码实现了基本的图层重命名和编号排序功能，将文件保存名为 `xxx.jsx` 的脚本文件即可。

## 使用步骤：

1. 打开 Adobe Photoshop 2023。
2. 选择要重命名的图层（可以在图层面板中多选，支持嵌套在图层组中的图层）。
3. 进入 `文件` -> `脚本` -> `浏览…`，选择你保存的脚本文件。
4. 执行脚本后，会出现三个提示框：
![](./_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591711857.webp)
  - 第一个提示框要求输入基础图层名称，例如 "Layer"。
  - 第二个提示框要求输入编号的起始值，例如 "1"。
  - 第三个提示框要求输入编号格式，例如 "001"，确保编号保持一致的位数。
5. 选择确认后，脚本会自动按照你设定的格式重命名所选图层。

## 进阶版

以上功能基本够用了，如果需要加入同时修改颜色标签可下载进阶版。效果如下所示：

![](./_images/LayerRenamer%201.0%20脚本发布，PS%20图层重命名从未如此简单-1754591720351.webp)

下载链接:

【LayerRenamer_PS-2023.jsx】

https://16b87ca7d6.znas.cn/AppH5/share/?nid=LIYDEMJQGBBDEOCELBIFU&code=r1DtQDtFZobo1ai8Jd0UylatvnNkQ3xcodyiJBPo4ejLcOfybeyVGW0o3LOTKTHF&mode=file&display=list

有效期 7 天，提取密码：6633