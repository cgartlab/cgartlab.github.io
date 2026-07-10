import type { SitemapItem } from '@astrojs/sitemap'
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
import { VitePWA } from 'vite-plugin-pwa'
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

export default defineConfig({
  compressHTML: false,
  site,
  base,
  output: 'static',
  trailingSlash: 'always', // 不建议更改
  prefetch: {
    prefetchAll: true,
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
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false, // Disable SW in dev to avoid interference
        },
        manifest: {
          name: 'CGArtLab - 探索数字艺术的边界',
          short_name: 'CGArtLab',
          description: 'CG艺术实验室官方博客',
          theme_color: '#ffFAF0',
          background_color: '#ffFAF0',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
              },
            },
            {
              urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
              },
            },
            {
              urlPattern: /\/posts\//,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'posts-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
              },
            },
          ],
        },
      }),
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
