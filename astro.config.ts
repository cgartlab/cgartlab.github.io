import type { SitemapItem } from '@astrojs/sitemap'
import { readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import Compress from 'astro-compress'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import rehypeMermaid from 'rehype-mermaid'

import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive'
import remarkMath from 'remark-math'
import UnoCSS from 'unocss/astro'

import { base, defaultLocale, themeConfig } from './src/config'
import { langMap } from './src/i18n/config'
import { rehypeCodeCopyButton } from './src/plugins/rehype-code-copy-button.mjs'
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.mjs'
import { rehypeGlossary } from './src/plugins/rehype-glossary.ts'
import { rehypeHeadingAnchor } from './src/plugins/rehype-heading-anchor.mjs'
import { rehypeImageProcessor } from './src/plugins/rehype-image-processor.mjs'
import { remarkContainerDirectives } from './src/plugins/remark-container-directives.mjs'
import { remarkGlossary } from './src/plugins/remark-glossary.ts'
import { remarkLeafDirectives } from './src/plugins/remark-leaf-directives.mjs'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'

const { url: site } = themeConfig.site
const { imageHostURL } = themeConfig.preload ?? {}
const imageConfig = imageHostURL
  ? { image: { domains: [imageHostURL], remotePatterns: [{ protocol: 'https' }] } }
  : {}

function buildLastmodMap(): Map<string, string> {
  const map = new Map<string, string>()
  const postsDir = fileURLToPath(new URL('./src/content/posts', import.meta.url))

  function walk(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      }
      else if (entry.isFile() && /\.(?:md|mdx)$/.test(entry.name)) {
        const content = readFileSync(fullPath, 'utf-8')
        const frontmatter = content.split('---', 3)[1]
        if (!frontmatter)
          continue

        let updated = ''
        let published = ''
        let abbrlink = ''
        let lang = ''
        let isDraft = false

        for (const line of frontmatter.split('\n')) {
          const trimmed = line.trim()
          if (trimmed.startsWith('updated:'))
            updated = trimmed.slice('updated:'.length).trim()

          if (trimmed.startsWith('published:'))
            published = trimmed.slice('published:'.length).trim()

          if (trimmed.startsWith('abbrlink:'))
            abbrlink = trimmed.slice('abbrlink:'.length).trim()

          if (trimmed.startsWith('lang:'))
            lang = trimmed.slice('lang:'.length).trim()

          if (trimmed.startsWith('draft:'))
            isDraft = trimmed.slice('draft:'.length).trim() === 'true'
        }

        // Skip drafts — mirror the route filter so no dead keys or warnings are emitted
        if (isDraft)
          continue

        const lastmod = updated || published
        if (!lastmod)
          continue

        // Generate slug
        let slug: string
        if (abbrlink) {
          slug = abbrlink
        }
        else {
          // Fallback must mirror post.id semantics (keeps '-en' suffix and subdir prefix),
          // matching the route layer (posts/[slug].astro uses post.id as the slug).
          // Normalize Windows separators so keys match real URLs on any platform.
          const relPath = fullPath.slice(postsDir.length + 1).split(sep).join('/')
          slug = relPath.replace(/\.(md|mdx)$/, '')
        }

        // Encode each path segment
        const encodedSlug = slug.split('/').map(encodeURIComponent).join('/')

        // Strip YAML quoting and inline comments so the map agrees with the
        // collection schema, which parses these via a real YAML parser
        const raw = lastmod.replace(/^["']|["']$/g, '').split(' #')[0].trim()
        const parsed = new Date(raw)
        if (Number.isNaN(parsed.valueOf())) {
          console.warn(`[sitemap] invalid lastmod "${lastmod}" in ${fullPath}, skipping`)
          continue
        }
        const lastmodIso = parsed.toISOString()

        // Determine which URL(s) this file serves based on its lang,
        // so zh/en files never overwrite each other regardless of readdirSync order
        if (lang === 'en') {
          map.set(`/en/posts/${encodedSlug}/`, lastmodIso)
        }
        else if (lang === 'zh') {
          map.set(`/posts/${encodedSlug}/`, lastmodIso)
        }
        else {
          // universal (lang '') renders in every locale
          map.set(`/posts/${encodedSlug}/`, lastmodIso)
          map.set(`/en/posts/${encodedSlug}/`, lastmodIso)
        }
      }
    }
  }

  walk(postsDir)
  return map
}

const lastmodMap = buildLastmodMap()

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always', // 不建议更改
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'viewport', // hover, tap, viewport, load
  },
  ...imageConfig,
  i18n: {
    locales: Object.entries(langMap).map(([path, codes]) => ({
      path,
      codes: [...codes] as [string, ...string[]],
    })),
    defaultLocale,
  },
  integrations: [
    UnoCSS({}),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag'],
      },
    }),
    sitemap({
      serialize(item: SitemapItem): SitemapItem | undefined {
        const lm = lastmodMap.get(new URL(item.url).pathname)
        return lm ? { ...item, lastmod: lm } : item
      },
    }),
    Compress({
      CSS: true,
      HTML: true,
      Image: false,
      JavaScript: true,
      SVG: false,
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkDirective,
        remarkMath,
        remarkContainerDirectives,
        remarkLeafDirectives,
        remarkReadingTime,
        remarkGlossary,
      ],
      rehypePlugins: [
        rehypeKatex,
        [rehypeMermaid, { strategy: 'pre-mermaid' }],
        rehypeSlug,
        rehypeHeadingAnchor,
        rehypeImageProcessor,
        rehypeGlossary,
        rehypeExternalLinks,
        rehypeCodeCopyButton,
      ],
    }),
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      // 可用主题: https://shiki.style/themes
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
    plugins: [
      {
        name: 'prefix-font-urls-with-base',
        transform(code, id) {
          if (!id.split('?')[0].endsWith('src/styles/font.css')) {
            return null
          }

          return code.replace(/url\(\s*(['"]?)\/fonts\//g, `url($1${base}/fonts/`)
        },
      },
    ],
  },
  devToolbar: {
    enabled: false,
  },
})
