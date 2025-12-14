import { visit } from 'unist-util-visit'

const admonitionTypes = {
  note: 'NOTE',
  tip: 'TIP',
  important: 'IMPORTANT',
  warning: 'WARNING',
  caution: 'CAUTION',
}

// 从指令标签中提取文本
function getLabelText(node) {
  return node?.children
    ?.map(child => child.type === 'text' ? child.value : '')
    .join('')
    .trim() || ''
}

// 警告块
function createAdmonition(node, type, title) {
  const titleSpan = `<span class="admonition-title">${title}</span>`

  node.data ??= {}
  node.data.hName = 'blockquote'
  node.data.hProperties = {
    className: `admonition-${type}`,
  }

  node.children.unshift({
    type: 'html',
    value: titleSpan,
  })
}

// 可折叠部分
function createFoldSection(node, title) {
  const summary = `<summary>${title}</summary>`

  node.data ??= {}
  node.data.hName = 'details'

  node.children.unshift({
    type: 'html',
    value: summary,
  })
}

// 画廊容器
function createGallery(node) {
  node.data ??= {}
  node.data.hName = 'div'
  node.data.hProperties = {
    className: ['gallery-container'],
  }
}

export function remarkContainerDirectives() {
  const githubAdmonitionRegex = new RegExp(
    `^\\s*\\[!(${Object.values(admonitionTypes).join('|')})\\]\\s*`,
    'i',
  )

  return (tree) => {
    // 处理 :::type[title] 语法
    visit(tree, 'containerDirective', (node) => {
      const type = node.name
      const labelNode = node.children?.[0]

      // 警告块
      if (admonitionTypes[type]) {
        // 警告块的可选 [title]
        let title = admonitionTypes[type]

        if (labelNode?.data?.directiveLabel) {
          const customTitle = getLabelText(labelNode)
          if (customTitle) {
            title = customTitle
          }
          node.children.shift()
        }

        createAdmonition(node, type, title)
        return
      }

      // 可折叠部分
      if (type === 'fold') {
        // 需要非空的 [title]
        const title = getLabelText(labelNode)
        if (!labelNode?.data?.directiveLabel || !title) {
          console.warn(`:::fold 语法需要带有非空内容的 [title] 括号`)
          return
        }

        node.children.shift()
        createFoldSection(node, title)
        return
      }

      // 画廊容器
      if (type === 'gallery') {
        // 移除存在的标签
        if (labelNode?.data?.directiveLabel) {
          node.children.shift()
        }

        createGallery(node)
      }
    })

    // 处理 > [!TYPE] 语法
    visit(tree, 'blockquote', (node) => {
      const firstTextNode = node.children?.[0]?.children?.[0]
      if (firstTextNode?.type !== 'text') {
        return
      }

      const match = firstTextNode.value.match(githubAdmonitionRegex)
      if (!match) {
        return
      }

      const type = match[1].toLowerCase()
      const title = admonitionTypes[type]

      if (!title) {
        return
      }

      firstTextNode.value = firstTextNode.value.substring(match[0].length)

      createAdmonition(node, type, title)
    })
  }
}