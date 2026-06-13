# Custom Plugins Reference

This project has 7 custom remark/rehype plugins in `src/plugins/`. All are documented below.

---

## Remark Plugins (AST → AST)

### 1. remark-container-directives

**File**: `src/plugins/remark-container-directives.mjs`

Converts Markdown container directives (`:::type[title]`) and GitHub-style blockquotes (`> [!NOTE]`) into semantic HTML admonition elements.

**Supported types**:

| Type | Output HTML | Default Title |
|------|-------------|---------------|
| `note` | `<blockquote class="admonition-note">` | NOTE |
| `tip` | `<blockquote class="admonition-tip">` | TIP |
| `important` | `<blockquote class="admonition-important">` | IMPORTANT |
| `warning` | `<blockquote class="admonition-warning">` | WARNING |
| `caution` | `<blockquote class="admonition-caution">` | CAUTION |
| `fold` | `<details><summary>` | — (requires `[title]`) |
| `gallery` | `<div class="gallery-container">` | — |

**Syntax**:

```markdown
:::note[Optional Title]
Content here
:::

:::fold[Click to Expand]
Hidden content
:::

:::gallery
![Image 1](path1)
![Image 2](path2)
:::

> [!tip] Also supports GitHub-style
> Block quote content
```

**Key behavior**:
- Custom title in `[brackets]` overrides the default
- `:::fold` requires non-empty `[title]` or logs a warning
- Gallery images are later processed by `rehypeImageProcessor` → `<figure class="gallery-item">`
- `rehypeImageProcessor` runs after, converting gallery images to individual `<figure>` elements

---

### 2. remark-leaf-directives

**File**: `src/plugins/remark-leaf-directives.mjs`

Converts inline leaf directives (`{youtube id=...}`, `{github repo=...}`, etc.) into semantic HTML embeds.

**Supported directives**:

| Directive | Output | Required Attributes |
|-----------|--------|----------------------|
| `{youtube id=VIDEO_ID}` | `<figure><lite-youtube>` | `id` |
| `{bilibili id=BVID}` | `<figure><iframe>` (Bilibili player) | `id` |
| `{github repo=owner/repo}` | `<a class="gc-container">` (GitHub card) | `repo` |
| `{tweet url=https://x.com/.../status/...}` | `<figure><blockquote class="twitter-tweet">` | `url` |
| `{codepen url=https://codepen.io/user/pen/slug}` | `<figure><iframe>` (CodePen embed) | `url` |
| `{spotify url=https://open.spotify.com/...}` | `<figure><iframe>` (Spotify embed) | `url` |

**Syntax**:

```markdown
{youtube id=dQw4w9WgXcQ}

{bilibili id=BV1xx411c7XD}

{github repo=cgartlab/cgartlab.github.io}
```

**Key behavior**:
- Missing required attributes log a console warning and output nothing
- GitHub repo format must be `owner/name` (both parts required)
- Tweet URL is normalized: `x.com` → `twitter.com`
- Spotify URL is matched against `open.spotify.com/(track|album|playlist|artist|episode|show)/id`
- All embeds get `loading="lazy"` and appropriate `allow` attributes

---

### 3. remark-reading-time

**File**: `src/plugins/remark-reading-time.mjs`

Calculates estimated reading time and injects it into the frontmatter.

**Behavior**:
- Extracts all text from the AST using `mdast-util-to-string`
- Uses `reading-time` library (words-per-minute algorithm)
- Rounds minutes and enforces minimum of 1
- Writes to `data.astro.frontmatter.minutes`

**Access in templates**:

```astro
---
const { minutes } = Astro.props.entry.data.astro.frontmatter
---
<span>{minutes} min read</span>
```

---

## Rehype Plugins (AST → HTML)

### 4. rehype-heading-anchor

**File**: `src/plugins/rehype-heading-anchor.mjs`

Appends an anchor link (SVG icon) to each heading that has an `id` property (set by `rehype-slug`).

**Behavior**:
- Targets `h1`–`h4` with an `id`
- Extracts heading text for `aria-label`
- Appends a link: `<a href="#{id}" class="heading-anchor-link" aria-label="链接到 {headingText}">`
- Uses `SKIP` to avoid traversing children twice

**Output structure**:

```html
<h2 id="my-heading">My Heading
  <a href="#my-heading" class="heading-anchor-link" aria-label="链接到 My Heading">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.6 21.4c2 2 5.9 2.9 8.9 0l3.5-3.5-1-1-3.5 3.5c-1.4 1.4-4.2 1.9-6.4-.3..."/>
      <path d="m8.01 14.97 6.93-6.93 1.061 1.06-6.93 6.93z"/>
    </svg>
  </a>
</h2>
```

---

### 5. rehype-image-processor

**File**: `src/plugins/rehype-image-processor.mjs`

Wraps standalone images in paragraphs into `<figure>`/`<figcaption>` elements. Processes both regular images and gallery images.

**Behavior**:
- Scans for paragraphs (`<p>`) containing only image nodes
- **Single image in paragraph** → converts `<p>` to `<figure>`, adds `<figcaption>` from `alt` text
- **Multiple images in paragraph** → replaces `<p>` with individual `<figure>`s (no figcaption)
- **Alt text starting with `_`** → `<figure>` without `<figcaption>`
- **Images in gallery container** → `<figure class="gallery-item">` (no figcaption)
- Non-image content in paragraph → skipped unchanged

**Alt text → caption mapping**:

| Alt text | Output |
|----------|--------|
| `![描述文字](url)` | `<figure><img><figcaption>描述文字</figcaption></figure>` |
| `![_no_caption](url)` | `<figure><img></figure>` |
| Gallery images | `<figure class="gallery-item"><img></figure>` |

---

### 6. rehype-external-links

**File**: `src/plugins/rehype-external-links.mjs`

Adds `target="_blank"`, `rel="noopener noreferrer"`, and Umami tracking to all external links.

**Behavior**:
- Matches links starting with `https:`, `http:`, or `//` (protocol-relative)
- Sets `target="_blank"` and `rel="noopener noreferrer"`
- Sets `data-umami-event="outbound-link-click"` and `data-umami-event-url="{href}"` for Umami Analytics

---

### 7. rehype-code-copy-button

**File**: `src/plugins/rehype-code-copy-button.mjs`

Wraps each `<pre><code>` block in a container div and prepends a copy button.

**Output structure**:

```html
<div class="code-block-wrapper">
  <button class="code-copy-button" type="button" aria-label="复制代码">
    <svg class="icon-copy">...</svg>   <!-- shown by default -->
    <svg class="icon-check">...</svg>  <!-- shown after copy -->
  </button>
  <pre><code>...</code></pre>
</div>
```

**Key behavior**:
- Only targets `<pre>` whose first child is `<code>` (skip nested code blocks)
- Uses `_hasCopyButton` flag to avoid double-wrapping on hot reload
- Copy functionality is implemented via client-side JavaScript (not in this plugin)

---

## Plugin Execution Order

```
remark-container-directives     → remark-leaf-directives → remark-reading-time
                                                                ↓
                                  ← AST ←
                                                                ↓
rehype-katex → rehype-mermaid → rehype-slug → rehype-heading-anchor → rehype-image-processor → rehype-external-links → rehype-code-copy-button
```

The plugin pipeline is configured in `astro.config.ts`. `remark-reading-time` writes to frontmatter during remark phase; all other custom plugins run in rehype phase (except the remark plugins).

---

## Adding a New Plugin

1. Create the plugin file in `src/plugins/` (`.mjs` for ESM compatibility)
2. Export a default function matching the plugin signature:

   **Remark**: `(tree, api) => void`
   **Rehype**: `(tree) => void`

3. Import and add to the appropriate array in `astro.config.ts`:

   ```ts
   remarkPlugins: [remarkContainerDirectives, remarkLeafDirectives, remarkReadingTime],
   rehypePlugins: [rehypeKatex, rehypeHeadingAnchor, ...],
   ```

4. Use `unist-util-visit` for tree traversal:

   ```js
   import { visit } from 'unist-util-visit'
   // visit(tree, 'element', (node, index, parent) => { ... })
   // visit(tree, 'text', (node) => { ... })
   ```

5. For remark plugins needing frontmatter access, use the `data` parameter:

   ```js
   return (tree, { data }) => {
     data.astro.frontmatter.customField = 'value'
   }
   ```
