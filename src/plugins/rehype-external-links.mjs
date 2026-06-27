import { visit } from 'unist-util-visit'

export function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        if (/^(?:https?:|\/\/)/.test(node.properties.href)) {
          node.properties.target = '_blank'
          node.properties.rel = ['noopener', 'noreferrer']

          // 添加 Umami 外链跟踪（如果已有事件名如 wiki-term-click 则不覆盖）
          if (!node.properties.dataUmamiEvent) {
            node.properties.dataUmamiEvent = 'outbound-link-click'
          }
          node.properties.dataUmamiEventUrl = node.properties.href
        }
      }
    })
  }
}
