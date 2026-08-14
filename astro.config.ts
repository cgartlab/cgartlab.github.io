import type { SitemapItem } from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import Compress from 'astro-compress'
import { defineConfig } from 'astro/config'
import { unified } from '@astrojs/markdown-remark'
import rehypeKatex from 'rehype-katex'
import rehypeMermaid from 'rehype-mermaid'

import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive'
import remarkMath from 'remark-math'
import UnoCSS from 'unocss/astro'

import { VitePWA } from 'vite-plugin-pwa'
import { base, defaultLocale, themeConfig } from './src/config'
import { langMap } from './src/i18n/config'
import { rehypeCodeCopyButton } from './src/plugins/rehype-code-copy-button.mjs'
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.mjs'
import { rehypeGlossary } from './src/plugins/rehype-glossary.ts'
import { rehypeHeadingAnchor } from './src/plugins/rehype-heading-anchor.mjs'
import { remarkGlossary } from './src/plugins/remark-glossary.ts'
import { rehypeImageProcessor } from './src/plugins/rehype-image-processor.mjs'
import { remarkContainerDirectives } from './src/plugins/remark-container-directives.mjs'
import { remarkLeafDirectives } from './src/plugins/remark-leaf-directives.mjs'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'

const { url: site } = themeConfig.site
const { imageHostURL } = themeConfig.preload ?? {}
const imageConfig = imageHostURL
  ? { image: { domains: [imageHostURL], remotePatterns: [{ protocol: 'https' }] } }
  : {}

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
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
      lastmod: new Date(),
      serialize(item: SitemapItem): SitemapItem | undefined {
        if (/\/tags\/[^/]+\/$/.test(item.url)) {
          return { ...item, priority: 0.4, changefreq: 'weekly' as SitemapItem['changefreq'] }
        }
        if (/\/posts\/[^/]+\/$/.test(item.url)) {
          return { ...item, priority: 0.8, changefreq: 'monthly' as SitemapItem['changefreq'] }
        }
        return item
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
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['fonts/**/*'],
        manifest: {
          name: 'CGArtLab | CG艺术实验室',
          short_name: 'CGArtLab',
          description: '探索数字创作的边界',
          theme_color: themeConfig.color.light.background,
          background_color: themeConfig.color.light.background,
          display: 'standalone',
          icons: [
            { src: '/icons/favicon.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          globPatterns: ['**\/*.{js,css,html,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'npm-cdn',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /.*\.(?:png|jpg|jpeg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /.*\.(?:woff|woff2|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              urlPattern: /.*\/posts\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'posts',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
              },
            },
          ],
        },
      }),
    ],
    css: {
      devSourcemap: true,
    },
  },
})
