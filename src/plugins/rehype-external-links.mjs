import { visit } from 'unist-util-visit'

const SITE_HOSTNAMES = ['cgartlab.com', 'www.cgartlab.com']

function isExternalUrl(href) {
  if (!/^(?:https?:|\/\/)/.test(href))
    return false
  try {
    const { hostname } = new URL(href.startsWith('//') ? `https:${href}` : href)
    return !SITE_HOSTNAMES.includes(hostname)
  }
  catch {
    return false
  }
}

export function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        if (isExternalUrl(node.properties.href)) {
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
