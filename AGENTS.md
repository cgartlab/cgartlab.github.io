# AGENTS.md

## Project Overview
Astro-based static site for "CG艺术实验室" (cgartlab.com). Theme derived from `astro-theme-retypeset`.

## Dev Commands

```bash
pnpm dev          # astro check && astro dev (runs typecheck before starting)
pnpm build        # astro check && astro build && pnpm apply-lqip
pnpm preview      # astro preview
pnpm lint         # eslint .
pnpm lint:fix     # eslint . --fix
pnpm new-post     # tsx scripts/new-post.ts (creates MD in src/content/posts)
pnpm apply-lqip   # tsx scripts/apply-lqip.ts (generates low-quality image placeholders)
pnpm format-posts # tsx scripts/format-posts.ts (CJK spacing fix via autocorrect)
pnpm update-theme # tsx scripts/update-theme.ts (merge from upstream retypeset theme)
```

## Build Pipeline
`pnpm build` is NOT just `astro build`. It runs:
1. `astro check` (TypeScript validation)
2. `astro build`
3. `pnpm apply-lqip` (post-build LQIP processing)

LQIP data is stored in `src/assets/lqip-map.json` (gitignored). This script analyzes dist output, generates placeholders for new images, and injects `--lqip:` styles into HTML.

## Content Collections
- `src/content/posts/` - Blog posts (MD/MDX)
- `src/content/about/` - About pages

Frontmatter schema: `title`, `published`, `description?`, `updated?`, `tags?`, `draft?`, `pin?`, `toc?`, `lang?`, `abbrlink?`

## Styling & Config
- UnoCSS with `presetWind3` + `presetAttributify` + `presetTheme`
- Custom theme colors defined in `uno.config.ts` and `src/config.ts`
- ESLint ignores `src/content/**` (content files are not linted)
- `@antfu/eslint-config` with Astro and UnoCSS support

## i18n
Supported: `zh`, `en`, `zh-tw` (configured in `src/i18n/config.ts`)

## Environment
- `.env` contains `GOOGLE_ADSENSE_PUBLISHER_ID` (not committed to git)
- pnpm 10.33.0 required (enforced via `packageManager` field)
- Node.js 18+ required

## CI/CD
- GitHub Actions deploys to GitHub Pages on push to `main`
- Workflow: `.github/workflows/astro.yml`
- Uses Node 24 for builds (`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'`)

## Architecture Notes
- `astro.config.ts`: `trailingSlash: 'always'` - do not change
- `src/assets/lqip-map.json` is auto-generated, do not edit manually
- Custom rehype/remark plugins in `src/plugins/` for code copy, external links, heading anchors, image processing, reading time, container/leaf directives
