# Changelog

All notable project changes are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **docs/PLUGINS.md** — Complete reference for all 7 custom remark/rehype plugins (`remarkContainerDirectives`, `remarkLeafDirectives`, `remarkReadingTime`, `rehypeHeadingAnchor`, `rehypeImageProcessor`, `rehypeExternalLinks`, `rehypeCodeCopyButton`)
- **docs/COMMANDS.md** — Consolidated commands reference for all npm scripts and build tools
- **CONTRIBUTING.md** — PR workflow, commit conventions, branch strategy, and contribution guidelines
- **CHANGELOG.md** — This file

### Changed

- **docs/ARCHITECTURE.md** — Complete rewrite: removed outdated `blog/` content reference, updated project structure to reflect actual `posts/works/weekly/_images/` organization, added tech architecture sections (SSG, Markdown pipeline, theme system, i18n routing, LQIP pipeline), documented the 5 key architectural decisions (trailing slash, LQIP auto-management, language filtering, triple comments, Worker scope)

---

## [1.0.0] — 2024-XX-XX

### Added

- Trilingual support (zh/en/zh-tw) with dynamic `[...lang]` routing
- 玄光周刊 (Weekly Newsletter) system with 19 issues and gallery component
- Works portfolio section
- Three comment systems: Giscus, Twikoo, Waline (all bundled, configurable)
- Dual theme system (light/dark) with OKLCH color space
- LQIP (Low Quality Image Placeholder) system — sharp 3×3px → CSS radial gradient
- 7 custom remark/rehype plugins for enhanced Markdown
- UnoCSS with presetWind3 + presetAttributify + presetTheme
- KaTeX math rendering
- Mermaid diagram support
- View Transitions for theme switching and page navigation
- OG image generation via `astro-og-canvas` + `canvaskit-wasm`
- Partytown integration for offloading analytics to Web Workers
- AdSense integration with pre-submit checklist
- Client-side search with language-specific JSON indexes
- RSS + Atom feed generation with XSLT styling
- llms.txt auto-generation for LLM consumption
- Web3Forms contact inquiry form
- Typing sound effects (Web Audio API, 5 variants)
- Image zoom on click (fullscreen lightbox)
- Table of Contents with active heading tracking
- Code block copy button

### Security

- www → non-www redirect (301) via Cloudflare Worker (AdSense compliance)
- robots.txt blocks AI training crawlers (CC0 waiver)
- Umami Analytics external link tracking
- CSP-ready header structure

### Performance

- Static site generation (SSG) — all pages pre-rendered at build time
- Cloudflare Pages deployment (global CDN)
- Font subsetting and unicode-range splitting for EarlySummer
- astro-compress for HTML/CSS/JS (excludes images/SVG)
- Prefetch on viewport enter (`prefetchAll: true, strategy: 'viewport'`)

---

## [0.1.0] — 2021

Initial release. Single-language (zh) Astro site with basic blog functionality.

[unreleased]: https://github.com/cgartlab/cgartlab.github.io/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/cgartlab/cgartlab.github.io/tree/v1.0.0