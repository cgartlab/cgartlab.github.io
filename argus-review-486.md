## Argus Design Review Summary
- Total Issues: 3 (P0: 0 | P1: 0 | P2: 1 | P3: 2)
- Files Reviewed: 1 (src/styles/home.css)
- Technology Stack: Astro + UnoCSS
- Documentation: https://docs.astro.build, https://uno.antfu.me/

## P0 — Blocking Issues (must fix, CI will fail)
✓ No issues found

## P1 — High Priority (must fix before merge)
✓ No issues found

## P2 — Medium Priority (should fix)

─────────────────────────────────────────────────
[P2] src/styles/home.css:45-46 — Bare `oklch()` values (`--home-brass: oklch(72% 0.052 74); --home-brass-deep: oklch(58% 0.062 64);`) declared inside `.home-stage {}` component rules, not in `:root`/`@keyframes` exempt zone. Should reference `var(--ds-*)` tokens for consistency with the `var(--un-preset-theme-colors-*)` system used elsewhere.

  Found:    `--home-brass: oklch(72% 0.052 74); --home-brass-deep: oklch(58% 0.062 64);`
  Expected: Use design token references, e.g. `--home-brass: var(--ds-color-primary);` or define `--home-brass` in `:root` where bare `oklch()` is permitted

  Fix:
  ```css
  /* Option 1: Reference design token (recommended) */
  --home-brass: var(--ds-color-primary);
  --home-brass-deep: var(--ds-color-on-primary);
  
  /* Option 2: Move to :root if brass is a global semantic color */
  :root {
    --home-brass: oklch(72% 0.052 74);
    --home-brass-deep: oklch(58% 0.062 64);
  }
  ```

  Token:    `--ds-color-primary` / `--ds-color-on-primary` (or equivalent brass tone token)
  Reference: https://css-tricks.com/oklch-in-css/, https://docs.astro.build/guides/typescript
  Note:     Component rules must use `var(--ds-*)` references. Token declarations in `:root` and `@keyframes` may use bare oklch/hex.
──

## P3 — Low Priority (optional polish)

─────────────────────────────────────────────────
[P3] src/styles/home.css:134-137 — Literal `opacity: 0.5` on `.home-leader-tip, .home-leader-anchor`

  Found:    `opacity: 0.5`
  Expected: Reference design token, e.g. `opacity: var(--ds-opacity-50);` or use a design system opacity scale

  Fix:
  ```css
  .home-leader-tip,
  .home-leader-anchor {
    fill: oklch(var(--un-preset-theme-colors-secondary));
    opacity: var(--ds-opacity-50);
  }
  ```

  Token:    `--ds-opacity-50` (or equivalent opacity design token)
  Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
  Note:     For leader line decorative elements, opacity can remain as literal if no design token exists, but token reference is preferred for consistency.

─────────────────────────────────────────────────
[P3] src/styles/home.css:120-128 — Literal `stroke-width: 1; stroke-dasharray: 1; stroke-dashoffset: 1` in `.home-leader-path`

  Found:    `stroke-width: 1; stroke-dasharray: 1; stroke-dashoffset: 1`
  Expected: Use design token references or CSS variables for stroke parameters

  Fix:
  ```css
  .home-leader-path {
    fill: none;
    stroke: color-mix(in srgb, oklch(var(--un-preset-theme-colors-secondary)) 50%, transparent);
    stroke-width: var(--ds-stroke-thin);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: var(--ds-stroke-dash-1);
    stroke-dashoffset: var(--ds-stroke-dash-offset-1);
    transition: stroke-dashoffset 380ms cubic-bezier(0.33, 0.9, 0.24, 1);
  }
  ```

  Token:    `--ds-stroke-thin`, `--ds-stroke-dash-1`, `--ds-stroke-dash-offset-1` (stroke design token scale)
  Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path_element
  Note:     Leader line technical dimensions are minor; token references preferred but not critical if no token defined.
──

✓ No issues found
✓ Tagline typography correctly uses `clamp(0.8rem, 1.05vw, 0.95rem)` matching `.home-sub`
✓ Dark mode has `.dark .home-stage` overrides for all color tokens
✓ Leader SVG is `aria-hidden`/`focusable="false"`
✓ No accessibility violations detected
✓ No issues in `node_modules/`, `.github/`, or workflow YAML files