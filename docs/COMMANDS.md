# Commands Reference

All npm scripts and build tools documented here. Run with `pnpm <script>`.

---

## Core Development

### `pnpm dev`

```bash
pnpm dev
```

Runs `astro check` (TypeScript type checking) then `astro dev` (development server with HMR). Changes to `.astro`, `.ts`, `.css`, and `src/content/` files trigger hot reload.

**Development mode special behavior**: `draft: true` articles are visible.

---

### `pnpm build`

```bash
pnpm build
```

Full production build pipeline. **Order-sensitive steps**:

```
1. astro check          TypeScript type checking (fails on type errors)
2. astro build          SSG → dist/ (all HTML/CSS/JS generated)
3. tsx generate-llms    Writes public/llms.txt (top 30 zh + 30 en posts)
4. pnpm apply-lqip      Scans dist/_astro/*.webp → injects --lqip CSS vars
```

The `generate-llms` step must complete before `apply-lqip` since the latter modifies dist/ HTML files.

---

### `pnpm preview`

```bash
pnpm preview
```

Serves `dist/` locally via `astro preview` for post-build verification.

---

## Code Quality

### `pnpm lint`

```bash
pnpm lint
```

Runs ESLint with `@antfu/eslint-config` (TypeScript + Astro + UnoCSS). `src/content/**` is completely ignored.

### `pnpm lint:fix`

```bash
pnpm lint:fix
```

Runs ESLint with `--fix`. Auto-fixes `.js`, `.ts`, and `.astro` files.

**Note**: `simple-git-hooks` runs `lint-staged` on pre-commit, which runs `eslint --fix` on staged files. Manual `lint:fix` is rarely needed.

---

## Content Management

### `pnpm new-post "标题"`

```bash
pnpm new-post "我的新文章"
```

Creates `src/content/posts/我的新文章.md` with auto-generated frontmatter. Template:

```yaml
---
title: 我的新文章
published: 2026-06-13T...
description: ''
updated: ''
tags:
  - Tag
draft: false
pin: 0
toc: true  # from themeConfig.global.toc
lang: ''
abbrlink: ''
---
```

**Weekly posts**: Manually move the file to `src/content/posts/weekly/` and rename to `No.XX 玄光周刊.md` per the template.

---

### `pnpm format-posts`

```bash
pnpm format-posts
```

Runs `autocorrect-node` on all `.md` and `.mdx` files in `src/content/`. Fixes:
- CJK character spacing (no space between CJK characters)
- CJK punctuation (full-width vs half-width)
- Preserves Markdown syntax (images, links, code blocks)
- Temporarily replaces image syntax to avoid corruption

---

### `pnpm fix-internal-links`

```bash
pnpm fix-internal-links
```

Scans `src/content/posts/` and appends trailing slashes to internal Markdown links. Respects `trailingSlash: 'always'` configuration.

---

## Build-Time Generators

### `pnpm apply-lqip`

```bash
pnpm apply-lqip
```

**Step 1**: Scans `dist/_astro/*.webp` for all optimized images

**Step 2**: For each image:
- `sharp` resizes to 3×3 px
- Extracts 3 RGB colors (top-left, center, bottom-right)
- Encodes as 32-bit hex via `packColor11Bit()` / `packColor10Bit()`
- Writes to `src/assets/lqip-map.json`

**Step 3**: Parses all `dist/**/*.html` files, finds `<img>` tags matching dist assets, injects:

```html
<img style="--lqip:#{hex}" src="...">
```

**Step 4**: `lqip.css` renders a 3-color radial gradient placeholder:

```css
[style*="--lqip:"] {
  background: radial-gradient(...);
}
```

**Warning**: `lqip-map.json` is build-generated. Do not manually edit.

---

### `tsx scripts/generate-llms.ts`

```bash
tsx scripts/generate-llms.ts
```

Generates `public/llms.txt` — a plain-text index of the site's content for LLM consumption. Includes top 30 Chinese and top 30 English posts (sorted by published date desc), each formatted as:

```
# Article Title
https://cgartlab.com/posts/slug/
Description text here...
tags: tag1, tag2
---
```

---

## Testing

### `pnpm exec playwright test`

```bash
pnpm exec playwright test
```

Runs Playwright end-to-end tests. Requires `playwright` to be installed (`pnpm add -D playwright`).

---

## Syncthing Cleanup (Optional)

### `bash scripts/syncthing-cleanup.sh` (macOS/Linux)

```bash
bash scripts/syncthing-cleanup.sh
```

Deletes Syncthing conflict files (files matching `*.conflict*`, `*.sync-conflict*`). Run from repo root.

### `pwsh scripts/syncthing-cleanup.ps1` (Windows)

```powershell
pwsh scripts/syncthing-cleanup.ps1
```

Same as above for Windows PowerShell.

---

## Quick Reference Table

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Type check + dev server |
| `pnpm build` | Full production build |
| `pnpm preview` | Preview built site |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm new-post "标题"` | Create new article |
| `pnpm format-posts` | Normalize CJK text |
| `pnpm apply-lqip` | Generate LQIP placeholders |
| `pnpm fix-internal-links` | Fix trailing slashes |
| `pnpm exec playwright test` | Run E2E tests |