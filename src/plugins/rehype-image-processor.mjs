import { visit } from 'unist-util-visit'

function createFigure(imgNode, isInGallery = false) {
  // 获取替代文本
  const altText = imgNode.properties?.alt
  // 如果没有替代文本或者以_开头则跳过说明
  const shouldSkipCaption = !altText || altText.startsWith('_')
  if (shouldSkipCaption && !isInGallery) {
    return imgNode
  }

  const children = [imgNode]

  // 添加说明文字
  if (!shouldSkipCaption) {
    children.push({
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: [{ type: 'text', value: altText }],
    })
  }

  return {
    type: 'element',
    tagName: 'figure',
    properties: isInGallery ? { className: ['gallery-item'] } : {},
    children,
  }
}

export function rehypeImageProcessor() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // 跳过非段落元素、空段落和孤立节点
      if (node.tagName !== 'p' || !node.children || node.children.length === 0 || !parent) {
        return
      }

      // 从段落中收集图片
      const imgNodes = []
      for (const child of node.children) {
        if (child.tagName === 'img') {
          imgNodes.push(child)
        }
        else if (child.type !== 'text' || child.value.trim() !== '') {
          return // 跳过包含非图像内容的段落
        }
      }

      if (imgNodes.length === 0) {
        return
      }

      const isInGallery = parent?.properties?.className?.includes('gallery-container')

      // 画廊容器：将图片转换为带说明的图像
      if (isInGallery) {
        const figures = imgNodes.map(imgNode => createFigure(imgNode, true))
        parent.children.splice(index, 1, ...figures)
        return
      }

      // 单张图片：在非画廊容器中转换为带说明的图像
      if (imgNodes.length === 1) {
        const figure = createFigure(imgNodes[0], false)
        if (figure !== imgNodes[0]) {
          // 仅在发生转换时替换
          node.tagName = 'figure'
          node.properties = figure.properties
          node.children = figure.children
        }
        return
      }

      // 多张图片：在非画廊容器中展开
      parent.children.splice(index, 1, ...imgNodes)
    })
  }
}