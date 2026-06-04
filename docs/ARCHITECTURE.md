# Architecture — cgartlab.github.io

## Overview

Personal site at cgartlab.com. Built with Astro + UnoCSS, deployed to Cloudflare Pages. Bilingual (zh/en), with blog, works, and project showcase.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6 |
| Styling | UnoCSS (utility-first, on-demand), `@iconify-json` icons |
| Language | TypeScript (strict) |
| Content | Astro Content Collections (MDX) |
| i18n | Custom i18n system (`src/i18n/`) |
| Deployment | Cloudflare Pages |
| CI | GitHub Actions |

## Project Structure

```
cgartlab.github.io/
├── src/
│   ├── assets/           # Static assets (images, fonts)
│   ├── components/       # Astro/UI components
│   ├── config.ts         # Site configuration
│   ├── content/          # MDX content collections
│   ├── content.config.ts # Content collection schemas
│   ├── data/             # Structured data
│   ├── env.d.ts          # Type declarations
│   ├── i18n/             # Internationalization
│   ├── layouts/          # Page layout templates
│   ├── pages/            # Route pages
│   ├── plugins/          # Custom Astro plugins
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── worker.mjs        # Cloudflare worker
├── public/               # Public assets (served as-is)
├── scripts/              # Build/dev scripts
├── patches/              # Dependency patches
├── copilot/              # Copilot/AI agent configs
├── astro.config.ts       # Astro configuration
├── uno.config.ts         # UnoCSS configuration
├── wrangler.jsonc        # Cloudflare Workers config
└── pnpm-workspace.yaml   # pnpm workspace
```

## Key Files

| File | Purpose |
|---|---|
| `src/content.config.ts` | Content collection schemas (Zod validation) |
| `src/i18n/` | Translation keys + locale detection |
| `src/pages/` | Route definitions (Astro file-based routing) |
| `src/layouts/` | Base layout, blog layout, etc. |
| `astro.config.ts` | Astro build configuration, integrations |
| `uno.config.ts` | UnoCSS preset/rule configuration, dark mode |
| `wrangler.jsonc` | Cloudflare Pages deployment settings |
| `pnpm-workspace.yaml` | Monorepo workspace definition |

## Content Management

Content is authored in MDX under `src/content/` with Zod-validated frontmatter. Collections include:
- **Blog posts** (`src/content/blog/`)
- **Projects/works** 
- **Pages** (about, now, etc.)

## Build & Deploy

```bash
pnpm dev        # Local development
pnpm build      # Production build → dist/
pnpm preview    # Preview build locally
```

Build output is static HTML + assets deployed to Cloudflare Pages. The worker (`src/worker.mjs`) handles request-time behavior like redirects and headers.