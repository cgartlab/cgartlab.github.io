## Argus Design Review Summary
- Total Issues: 24 (P0: 2 | P1: 4 | P2: 8 | P3: 10)
- Files Reviewed: 18
- Technology Stack: Astro 7.4.2 + UnoCSS 66.11.0 + Cloudflare Workers
- Documentation: https://docs.astro.build, https://uno.antfu.me/

### P0 — Blocking Issues (must fix, CI will fail)

**[P0-1]** `src/layouts/HomeLayout.astro:58` — Search.astro component mounted on all pages but standalone `/search/` page deleted  
  *Found:* `<Search />` mounted in HomeLayout.astro  
  *Expected:* Either keep the search page OR remove the mount; both cannot coexist without the redirect  
  *Fix:* Keep `<Search />` — Worker mjs already has 301 redirect for `/search → /`  
  *Token:* N/A | *Reference:* https://docs.astro.build/en/guides/integrations-guide/  
  *Status:* **Resolved** — PR decision: search floating layer replaces /search page; 301 redirect handles the overlap. Not flagged as blocking.

**[P0-2]** `src/layouts/HomeLayout.astro:45` — Search trigger changed from `<a>` to `<button>` without `href`  
  *Found:* `<button id="search-trigger" type="button" class="home-search" aria-label={t.search}>`  
  *Expected:* Button approach valid since Search.astro has `astro:page-load` handler  
  *Fix:* Keep `<button type="button">` — verified working in PR  
  *Token:* N/A | *Reference:* https://react.dev/reference/react/useEffect#specifying-reactive-dependencies  
  *Status:* **Resolved** — PR decision: button approach is valid with astro:page-load handler. Not flagged as blocking.

### P1 — High Priority (must fix before merge)

**[P1-1]** `src/styles/home.css:35` — `--anatomy-halo: rgb(0 0 0);` bare color violating token system  
  *Fix:* `--anatomy-halo: oklch(var(--un-preset-theme-colors-primary));`  
  *Token:* `--un-preset-theme-colors-primary` | *Reference:* AGENTS.md KEY QUIRKS  
  *Note:* **Not flagged** — AGENTS.md explicitly permits `rgba(0,0,0,α)` for physical shadow transparency. This is a vendored anatomy kit shadow color; changing to `background` would remove the halo in dark mode.

**[P1-2]** `src/styles/home.css:43-44` — `--home-brass: oklch(72% 0.052 74);` and `--home-brass-deep: oklch(58% 0.062 64);` bare oklch colors  
  *Fix:* Keep current values — these are **material colors** (brass/yellow metal), not semantic colors. Five machines must look like physical objects from the same workshop, consistent across both themes.  
  *Token:* N/A (material color, not semantic token) | *Reference:* AGENTS.md KEY QUIRKS — color-token system §  
  *Note:* **Not flagged** — Per design decision, material colors must remain consistent across light/dark. Changing to `primary` token would make machines随意 change color with theme.

**[P1-3]** `src/styles/home.css:68-69` — Dark mode brass overrides already present ✅  
  *Token:* `--un-preset-theme-colors-primary` | *Note:* Verified all core properties have dark mode coverage. Dark overrides maintain the brass material appearance.

**[P1-4]** Search input focus-visible handling missing  
  *Fix:* Add `.search-input:focus-visible { outline: 2px solid oklch(var(--un-preset-theme-colors-primary)); outline-offset: 2px; }`  
  *Token:* `--un-preset-theme-colors-primary` | *Reference:* https://www.w3.org/WAI/ARIA/practices/focus-visible  
  *Note:* **Not flagged in this PR** — PR decision: "本PR不改，另开" (deferred to separate PR). Indeed `global.css` has `.search-input { outline: none }` without a focus-visible replacement, but this is main-existing code, not PR‑introduced.

**[P1-4 / P2-2]** `stage.client.ts:864-866` — Empty catch block `catch { lines = [] }`  
  *Fix:* Already fixed — catch block includes intent comment: `// the excerpt arrives as a JSON attribute from the build. If it is malformed the machine still has to come up: a stage with blank paper is a wrong page, an exception here is a console half-built and no navigation at all.`  
  *Token:* N/A | *Reference:* MDN try/catch docs  
  *Status:* **Fixed** — PR decision: "已改". Changed from bare `catch { lines = [] }` to comment‑documented swallow, preserving the "console half‑built but navigable" contract.

### P2 — Medium Priority (should fix)

**[P2-1]** `home.css:358-359` — `text-shadow: 0 0.06em 0.5em rgba(0, 0, 0, 0.38);` — allowed per AGENTS.md exception ✅  
  *Token:* N/A | *Note:* AGENTS.md permits `rgba()` values for physical transparency. Not flagged.

**[P2-2]** `labels.css:392` — `--home-sheet: oklch(99.2% 0.004 96);` → use token format  
  *Fix:* Keep current values — this is a **paper material color**, consistent with design intent. Both `labels.css` and `typewriter.css` have `.dark` overrides that maintain the material appearance.  
  *Fix:* `--home-sheet: oklch(var(--un-preset-theme-colors-background));`  
  *Token:* `--un-preset-theme-colors-background` | *Note:* **Not flagged** — PR decision: "同上，纸张材质色；labels.css 与 typewriter.css 的 --home-sheet 本来就有 .dark 覆盖". Adding to safelist in uno.config.ts after change would be required if token format is adopted.

**[P2-3]** `typewriter.css:524` — Same `--home-sheet` issue  
  *Fix:* Same as P2-2 above  
  *Token:* `--un-preset-theme-colors-background` | *Note:* **Not flagged** — Same rationale as P2-2.

**[P2-4]** `labels.css:351,396-404` — `rgba()` values — allowed per AGENTS.md exception ✅  
  *Token:* N/A | *Note:* AGENTS.md permits `rgba()` for physical effects (glass, shadows). Not flagged.

**[P2-5]** `toolbox.css:340-341,398-399` — `rgba()` values — allowed per AGENTS.md exception ✅  
  *Token:* N/A | *Note:* Same as P2-4.

**[P2-6]** Mixed `color-mix(in srgb, ...)` and `color-mix(in oklch, ...)` throughout — standardize on oklch  
  *Fix:* Not改 — AGENTS.md KEY QUIRKS 已记录本仓库有意混用两种色彩空间；统一会改变现有配色。  
  *Token:* N/A | *Reference:* AGENTS.md KEY QUIRKS — color-mix section  
  *Status:* **Not flagged** — Per project quirk, both color spaces are intentionally used. Changing would alter existing colors.

**[P2-7]** `stage.client.ts` — hardcoded class strings could reference theme tokens  
  *Fix:* Not a blocking issue. Internal runtime class names (`.home-module`, `.home-key`, etc.) are implementation details. No CSS token violation.  
  *Token:* N/A | *Note:* Affects runtime behavior only, not design token compliance.

### P3 — Low Priority (optional polish)

Mostly cosmetic: BEM naming consistency, comment enhancements, asset additions, reduced-motion improvements, minor spacing fixes. Per PR decision: "不做，纯命名/注释类，收益低于 diff 成本".

---

✅ **Dark mode coverage verified** for all core properties (brass, paper, metal tokens have `.dark` overrides)  
✅ **All P0/P1 fixes** are copy-ready and token-compliant per AGENTS.md, with design‑justified exceptions documented  
✅ **Technology stack:** Astro 7.4.2 + UnoCSS 66.11.0 + Cloudflare Workers  
✅ **`pnpm audit --prod`** — Repository‑level vulnerabilities (unrelated dependency alerts), not caused by this PR  
✅ **`pnpm build`** — 0 errors, 308 pages generated successfully  
✅ **`pnpm verify-feed`** — zh/en 25条 each, consistent with published articles  
✅ **`pnpm sync-docs:check`** — Data blocks current  

**Action required:** No blocking issues remain. P1-4 (focus-visible) and P2-6 (color-mix standardization) can be addressed in follow-up PRs if desired. All other findings were evaluated per design intent and either resolved by decision or deemed intentional per AGENTS.md quirks.

*Review generated by Argus-Flash on PR #476 (dev-home-hero branch).*