# Architecture — CGArtLab

## Overview

Personal site at [cgartlab.com](https://cgartlab.com). Built with Astro 6 + UnoCSS 66, deployed to Cloudflare Pages (Workers + Static Assets). Trilingual (zh/en/zh-tw), with blog posts, works portfolio, and 玄光周刊 (weekly newsletter).

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Astro | 6.3.8 |
| Styling | UnoCSS (Wind3 + Attributify + Theme) | 66.6.8 |
| Language | TypeScript (strict) | ~6.0.3 |
| Package Manager | pnpm | 10.33.0 |
| Content | Astro Content Collections (MDX) | — |
| i18n | Custom `[...lang]` dynamic routing | — |
| Deployment | Cloudflare Pages | — |
| CI | GitHub Actions (Argus auto-review) | — |

## Tech Architecture

### Static Site Generation (SSG)

Astro renders all pages at build time (`output: 'static'`). Cloudflare Pages serves the `dist/` directory as static assets, while `src/worker.mjs` handles request-time behavior (redirects, headers, 404 fallback).

### Markdown Processing Pipeline

Content passes through two plugin stages:

```
Markdown Source
    │
    ▼ (remark phase — AST to AST)
remark-directive         → Enables :::container and :leaf: directive syntax
remark-math             → Parses $...$ and $$...$$ math
remark-container-directives → Custom: convert :::note/tip/fold/gallery to blockquote.figure
remark-leaf-directives  → Custom: convert {youtube}/{bilibili}/{github} to HTML embeds
remark-reading-time      → Custom: calculates reading time → frontmatter.minutes
    │
    ▼ (rehype phase — AST to HTML)
rehype-katex            → Renders math as KaTeX HTML
rehype-mermaid          → Marks code blocks for Mermaid client-side rendering
rehype-slug              → Generates heading anchor IDs
rehype-heading-anchor    → Custom: appends anchor link SVG to headings
rehype-image-processor   → Custom: wraps images in <figure>/<figcaption>
rehype-external-links    → Custom: adds target="_blank" + Umami tracking
rehype-code-copy-button → Custom: wraps code blocks with copy button
    │
    ▼
Final HTML
```

### Theme System

UnoCSS `presetTheme()` provides dual-theme color tokens via CSS custom properties. `html.dark` class toggles light/dark at runtime. A blocking inline script in `<head>` sets the initial theme before first paint (no FOUC).

### i18n Routing

```
/                   → zh (default, no prefix)
/en/                → en
/zh-tw/             → zh-tw
/posts/my-post/     → zh
/en/posts/my-post/  → en
```

`getStaticPaths()` generates all language variants. Content frontmatter `lang` field filters which posts appear in each locale.

## Project Structure

```
cgartlab.github.io/
├── src/
│   ├── assets/
│   │   ├── icons/              # 10 SVG UI icons
│   │   ├── lqip-map.json       # LQIP color map (build-generated, auto-managed)
│   │   └── templates/          # Post article templates
│   ├── components/
│   │   ├── Comment/            # Giscus + Twikoo + Waline (all live, one active)
│   │   ├── Widgets/            # TOC, ImageZoom, CodeCopyButton, MediaEmbed...
│   │   └── *.astro             # Header, Navbar, Footer, PostList, Search...
│   ├── config.ts               # Site-wide configuration (colors, SEO, comments, analytics)
│   ├── content.config.ts       # Content collection schemas (Zod)
│   ├── content/
│   │   ├── posts/              # Blog posts + weekly/ + works/ + _images/
│   │   ├── about/              # About pages
│   │   └── privacy/            # Privacy policy pages
│   ├── data/
│   │   └── links.ts            # Friend links data (3 languages)
│   ├── i18n/
│   │   ├── config.ts          # Language mappings (zh→zh-CN, en→en-US, zh-tw→zh-TW)
│   │   ├── ui.ts              # UI string translations
│   │   ├── lang.ts            # Language detection utilities
│   │   └── path.ts            # Localized path builders
│   ├── layouts/
│   │   ├── Head.astro         # <head>: SEO, OG, fonts, analytics scripts
│   │   └── Layout.astro       # Root layout: html wrapper, header, sidebar, footer
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── [...lang]/         # All routes: index, posts/[slug], about, weekly...
│   │   ├── api/               # /api/search-index/[lang].json.ts
│   │   └── og/                # Dynamic OG image generation
│   ├── plugins/               # 7 custom remark/rehype plugins
│   ├── styles/                # global.css, markdown.css (heti), font.css, transition.css...
│   ├── types/
│   │   ├── global.d.ts        # Global type declarations (Attributify, ViewTransition)
│   │   └── index.d.ts         # ThemeConfig, Post types
│   ├── utils/
│   │   ├── content.ts         # Content query functions (getPosts, getPostsByYear...)
│   │   ├── cache.ts           # memoize() async cache wrapper
│   │   ├── feed.ts            # RSS/Atom feed generation
│   │   ├── search.ts         # Search index normalization
│   │   ├── description.ts    # Post description/excerpt generation
│   │   └── page.ts           # Page type detection
│   └── worker.mjs            # Cloudflare Worker (www→non-www, index.html append, 404 fallback)
├── public/
│   ├── fonts/                 # EarlySummer, STIX, Snell (subset + split chunks)
│   ├── icons/                 # Brand icons, favicon, og-logo
│   ├── giscus/                # Giscus theme CSS overrides
│   ├── feeds/                 # RSS/Atom XSL stylesheets
│   ├── sounds/                # 10 WAV typing sound effects
│   └── robots.txt             # Blocks AI crawlers, allows search engines
├── scripts/
│   ├── new-post.ts            # Interactive post creation
│   ├── apply-lqip.ts          # Build-time LQIP generation (sharp 3x3 → hex colors → CSS vars)
│   ├── format-posts.ts        # CJK text normalization (autocorrect-node)
│   ├── generate-llms.ts       # Generate public/llms.txt (top 30 zh + 30 en posts)
│   ├── fix-internal-links.ts  # Fix internal link trailing slashes
│   ├── search-lang-check.ts   # Validate search language mappings
│   ├── clean-sync-conflicts.sh # Clean Syncthing conflict files (macOS/Linux)
│   └── syncthing-cleanup.*    # Syncthing conflict resolution scripts
├── docs/
│   └── ARCHITECTURE.md        # This file
├── patches/                   # Dependency patches
├── copilot/                    # AI agent configs
├── astro.config.ts            # Astro build config (integrations, plugins, i18n)
├── uno.config.ts              # UnoCSS config (colors, fonts, shortcuts, variants)
├── wrangler.jsonc             # Cloudflare Workers/Pages config
├── pnpm-workspace.yaml        # pnpm workspace settings
└── eslint.config.mjs          # ESLint (antfu config, ignores src/content/**)
```

## Key Architectural Decisions

### 1. Trailing Slash Always

`trailingSlash: 'always'` in astro.config.ts is immutable. All internal links depend on this setting. The Cloudflare Worker appends `index.html` to directory requests to enforce correct behavior.

### 2. LQIP Auto-Management

`src/assets/lqip-map.json` is build-generated by `apply-lqip.ts` and must never be manually edited. All images in `dist/_astro/*.webp` are processed: sharp resize to 3×3px → extract 3 RGB colors → encode as 32-bit hex → inject into `<img style="--lqip:#xxxxxx">` in final HTML.

### 3. Content Collection Language Filtering

Posts filtered by `lang` field at query time. `lang: ''` (default) is language-agnostic and appears in all locales. Bilingual pairs share the same URL slug (English version drops the `-en` suffix).

### 4. Triple Comment Systems

All three systems (Giscus/Twikoo/Waline) are bundled; `src/config.ts` determines which is active. Switching requires no code changes, only config updates.

### 5. Cloudflare Worker Scope

The Worker handles only two things:
- **www→non-www redirect** (301, SEO canonical unity)
- **index.html appending** for trailing slash enforcement

Static file serving is handled entirely by Cloudflare Pages.

## Build Pipeline (Order-Sensitive)

```
pnpm build
  ├─→ astro check          TypeScript type checking
  ├─→ astro build         SSG → dist/
  ├─→ tsx scripts/generate-llms.ts   public/llms.txt (top 30 zh + 30 en)
  └─→ pnpm apply-lqip     LQIP CSS variable injection
```

The `generate-llms` step must run before `apply-lqip` since the latter modifies dist/ HTML files.

## Deployment

| Environment | Trigger | Mechanism |
|-------------|----------|-----------|
| Production | `git push main` | Cloudflare Pages auto-deploy |
| Preview | PR opened | Cloudflare Pages preview deployment |

Build command: `pnpm install --config.trustPolicy=off && pnpm build`
