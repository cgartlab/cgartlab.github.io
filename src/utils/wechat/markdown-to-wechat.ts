/**
 * 微信公众号 Markdown 转 HTML 转换器
 * 将 Markdown 内容转换为适合微信阅读的 HTML 格式
 */

import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

interface WechatStyleOptions {
  primaryColor?: string
  fontSize?: string
  lineHeight?: string
  codeTheme?: 'light' | 'dark'
}

const defaultOptions: Required<WechatStyleOptions> = {
  primaryColor: '#07c160', // 微信绿
  fontSize: '16px',
  lineHeight: '1.75',
  codeTheme: 'light',
}

/**
 * 生成微信风格的 CSS 样式
 */
function generateWechatStyles(options: Required<WechatStyleOptions>): string {
  return `
    <style>
      /* 基础样式重置 */
      .wechat-article {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        font-size: ${options.fontSize};
        line-height: ${options.lineHeight};
        color: #333;
        word-wrap: break-word;
        word-break: break-all;
      }

      /* 段落样式 */
      .wechat-article p {
        margin: 1em 0;
        text-align: justify;
      }

      /* 标题样式 */
      .wechat-article h1,
      .wechat-article h2,
      .wechat-article h3,
      .wechat-article h4,
      .wechat-article h5,
      .wechat-article h6 {
        margin: 1.5em 0 0.8em;
        font-weight: 600;
        line-height: 1.4;
        color: #1a1a1a;
      }

      .wechat-article h1 {
        font-size: 1.5em;
        border-bottom: 2px solid ${options.primaryColor};
        padding-bottom: 0.3em;
      }

      .wechat-article h2 {
        font-size: 1.3em;
        border-left: 4px solid ${options.primaryColor};
        padding-left: 0.5em;
      }

      .wechat-article h3 {
        font-size: 1.2em;
        color: ${options.primaryColor};
      }

      .wechat-article h4 {
        font-size: 1.1em;
      }

      .wechat-article h5,
      .wechat-article h6 {
        font-size: 1em;
      }

      /* 引用样式 */
      .wechat-article blockquote {
        margin: 1em 0;
        padding: 0.8em 1em;
        border-left: 4px solid ${options.primaryColor};
        background-color: #f6f6f6;
        color: #666;
        border-radius: 0 4px 4px 0;
      }

      .wechat-article blockquote p {
        margin: 0.5em 0;
      }

      /* 列表样式 */
      .wechat-article ul,
      .wechat-article ol {
        margin: 1em 0;
        padding-left: 1.5em;
      }

      .wechat-article li {
        margin: 0.5em 0;
      }

      .wechat-article ul > li {
        list-style-type: disc;
      }

      .wechat-article ol > li {
        list-style-type: decimal;
      }

      /* 链接样式 */
      .wechat-article a {
        color: ${options.primaryColor};
        text-decoration: none;
        border-bottom: 1px dashed ${options.primaryColor};
        word-break: break-all;
      }

      .wechat-article a:hover {
        opacity: 0.8;
      }

      /* 图片样式 */
      .wechat-article img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1em auto;
        border-radius: 4px;
      }

      /* 代码块样式 */
      .wechat-article pre {
        margin: 1em 0;
        padding: 1em;
        background-color: ${options.codeTheme === 'dark' ? '#2d2d2d' : '#f6f8fa'};
        border-radius: 6px;
        overflow-x: auto;
        font-size: 0.9em;
        line-height: 1.5;
      }

      .wechat-article code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        background-color: ${options.codeTheme === 'dark' ? '#2d2d2d' : '#f0f0f0'};
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
      }

      .wechat-article pre code {
        background-color: transparent;
        padding: 0;
        color: ${options.codeTheme === 'dark' ? '#e6e6e6' : '#24292e'};
      }

      /* 行内代码特殊处理 */
      .wechat-article p code,
      .wechat-article li code {
        color: #e83e8c;
      }

      /* 表格样式 */
      .wechat-article table {
        width: 100%;
        margin: 1em 0;
        border-collapse: collapse;
        font-size: 0.9em;
      }

      .wechat-article th,
      .wechat-article td {
        border: 1px solid #ddd;
        padding: 0.6em 0.8em;
        text-align: left;
      }

      .wechat-article th {
        background-color: ${options.primaryColor}15;
        color: #1a1a1a;
        font-weight: 600;
      }

      .wechat-article tr:nth-child(even) {
        background-color: #f9f9f9;
      }

      /* 分割线样式 */
      .wechat-article hr {
        border: none;
        border-top: 1px solid #eee;
        margin: 2em 0;
      }

      /* 强调文本 */
      .wechat-article strong {
        font-weight: 600;
        color: #1a1a1a;
      }

      .wechat-article em {
        font-style: italic;
        color: #555;
      }

      /* 任务列表 */
      .wechat-article input[type="checkbox"] {
        margin-right: 0.5em;
      }

      /* 响应式适配 */
      @media screen and (max-width: 600px) {
        .wechat-article {
          font-size: ${parseInt(options.fontSize) * 0.9}px;
          padding: 0 8px;
        }
        
        .wechat-article pre {
          padding: 0.8em;
          font-size: 0.85em;
        }
        
        .wechat-article table {
          font-size: 0.85em;
        }
        
        .wechat-article th,
        .wechat-article td {
          padding: 0.4em 0.5em;
        }
      }
    </style>
  `
}

/**
 * 创建微信专用的 Markdown 解析器
 */
export function createWechatMarkdownParser(
  options: WechatStyleOptions = {},
): { md: MarkdownIt; styles: string } {
  const opts = { ...defaultOptions, ...options }
  
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    xhtmlOut: true,
  })

  // 启用常用插件功能
  md.enable([
    'table',
    'strikethrough',
  ])

  // 自定义图片渲染，添加微信友好的属性
  const defaultImageRenderer = md.renderer.rules.image || ((tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options)
  })

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    
    // 添加微信友好的图片属性
    const srcIndex = token.attrIndex('src')
    const altIndex = token.attrIndex('alt')
    
    if (srcIndex >= 0) {
      token.attrs![srcIndex][1] = token.attrs![srcIndex][1].replace(/&/g, '&amp;')
    }
    
    // 添加 loading="lazy" 属性（微信支持）
    token.attrPush(['loading', 'lazy'])
    
    // 添加最大宽度限制
    token.attrPush(['style', 'max-width: 100%; display: block; margin: 1em auto;'])
    
    return defaultImageRenderer(tokens, idx, options, env, self)
  }

  // 优化链接渲染
  const defaultLinkRenderer = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options)
  })

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    // 添加外部链接标识（可选）
    // token.attrPush(['data-link-type', 'external'])
    return defaultLinkRenderer(tokens, idx, options, env, self)
  }

  // 优化代码块渲染
  const defaultCodeBlockRenderer = md.renderer.rules.fence || ((tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options)
  })

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const str = token.content
    
    // 添加语言类名
    const languageClass = info ? ` class="language-${info.split(' ')[0]}"` : ''
    
    return `<pre><code${languageClass}>${md.utils.escapeHtml(str)}</code></pre>`
  }

  // 优化表格渲染
  const defaultTableRenderer = md.renderer.rules.table_open || ((tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options)
  })

  md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
    return '<div style="overflow-x: auto;"><table>'
  }

  md.renderer.rules.table_close = () => '</table></div>'

  const styles = generateWechatStyles(opts)
  
  return { md, styles }
}

/**
 * 将 Markdown 转换为微信友好的 HTML
 * @param markdown Markdown 内容
 * @param options 样式选项
 * @returns 包含样式的完整 HTML
 */
export function convertMarkdownToWechatHtml(
  markdown: string,
  options: WechatStyleOptions = {},
): string {
  const { md, styles } = createWechatMarkdownParser(options)
  const content = md.render(markdown)
  
  // 包装在带有样式的容器中
  return `
${styles}
<div class="wechat-article">
${content}
</div>
  `.trim()
}

/**
 * 仅转换内容，不添加样式（用于需要自定义样式的场景）
 * @param markdown Markdown 内容
 * @param options 样式选项
 * @returns 纯 HTML 内容
 */
export function convertMarkdownToWechatContent(
  markdown: string,
  options: WechatStyleOptions = {},
): string {
  const { md } = createWechatMarkdownParser(options)
  return md.render(markdown)
}

/**
 * 为现有 HTML 添加微信样式包装
 * @param html 现有 HTML 内容
 * @param options 样式选项
 * @returns 带样式的完整 HTML
 */
export function wrapWithWechatStyles(
  html: string,
  options: WechatStyleOptions = {},
): string {
  const styles = generateWechatStyles({ ...defaultOptions, ...options })
  
  return `
${styles}
<div class="wechat-article">
${html}
</div>
  `.trim()
}

export default convertMarkdownToWechatHtml
