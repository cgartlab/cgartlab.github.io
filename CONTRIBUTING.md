# Contributing to CGArtLab

## Branch Strategy

| Branch Pattern | Purpose | Merge Method |
|---------------|---------|--------------|
| `dev-{kebab-case}` | Code, feature, or style development | PR → squash merge → delete |
| `write-{kebab-case}` | Article or weekly newsletter writing | PR → squash merge → delete |
| `main` (protected) | Production-ready state | PR only, squash merge |

Branches are deleted after squash merge. Create a fresh branch for each change.

## Commit Message Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

**Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Exempted prefixes** (allowed without type):
- `Merge ...`
- `Revert ...` / `This reverts commit ...`
- `vault backup: ...`

**Examples**:

```
feat(search): add client-side search index caching
fix(toc): correct active heading detection on scroll
docs(weekly): add 玄光周刊 No.37
chore(deps): update astro to 6.4.0
ci(opencode): sync Argus workflow config
```

## Pull Request Workflow

### 1. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b dev-feature-name
# or
git checkout -b write-weekly-38
```

### 2. Make Changes

All `.js`, `.ts`, and `.astro` files are auto-linted on pre-commit via `simple-git-hooks` + `lint-staged`. ESLint runs with `--fix` automatically.

### 3. Run Checks Locally

```bash
pnpm lint        # ESLint check (antfu config)
pnpm build       # Full build pipeline (type check → build → generate-llms → apply-lqip)
```

### 4. Commit

```bash
git add .
git commit -m "feat(component): add new widget"
```

Commit message is validated by a pre-commit hook. Invalid messages are rejected.

### 5. Push and Create PR

```bash
git push origin dev-feature-name
# Then create PR via GitHub UI or gh CLI
```

PR title should mirror the commit message format (it becomes the squash commit message).

### 6. PR Review

- PRs trigger the **Argus** GitHub App for automatic code review
- At least one human review approval is required before merge
- CI checks must pass (lint, type check, build)

### 7. Merge

- **Squash merge only** — all commits on the branch become one commit on `main`
- The squash commit title follows Conventional Commits format
- Branch is auto-deleted after merge

## What to Contribute

### Code Changes (→ `dev-*` branch)

- New features or functionality
- Bug fixes
- Refactoring
- Style changes
- Performance improvements
- Test additions

### Content Changes (→ `write-*` branch)

- Blog posts (`src/content/posts/*.md`)
- Weekly newsletters (`src/content/posts/weekly/*.md`)
- Works entries (`src/content/posts/works/*.md`)

**Bilingual articles**: Create both `title.md` (Chinese, `lang: ''`) and `title-en.md` (English, `lang: 'en'`). Both share the same URL slug (Chinese filename without `-en`).

## Content Frontmatter Reference

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `title` | string | Yes | — | |
| `published` | date | Yes | — | Format: `YYYY-MM-DD` |
| `description` | string | No | `''` | Used for cards and SEO |
| `updated` | date | No | — | Empty string is ignored |
| `tags` | string[] | No | `[]` | Weekly must include `周刊` |
| `draft` | boolean | No | `false` | Hidden from production |
| `pin` | number (0-99) | No | `0` | Higher = higher priority |
| `toc` | boolean | No | follows config | |
| `lang` | `''` \| `'en'` \| `'zh-tw'` | No | `''` | |
| `abbrlink` | string | No | `''` | Lowercase letters, digits, hyphens only |

## TypeScript Type Safety

The project uses `@ts-expect-error` in exactly **2 places** (AGENTS.md-enforced):
1. `MediaEmbed.astro` — MediaEmbed component
2. Head.astro — ESLint disable

**Do not add new suppressions.** If you encounter a type error, fix the underlying code instead.

## ESLint Exemptions

`src/content/**` is completely ignored by ESLint. No suppressions needed for Markdown/MDX files.

## Syncthing Conflict Files

If you use Syncthing to sync `.obsidian/` across devices, conflict files (`*.conflict*`) may appear. Use the cleanup scripts:

```bash
# macOS/Linux
bash scripts/syncthing-cleanup.sh

# Windows
pwsh scripts/syncthing-cleanup.ps1
```

## Deployment

| Environment | How |
|-------------|-----|
| Production | Push to `main` → Cloudflare Pages auto-deploys |
| Preview | PR → Cloudflare Pages creates preview URL |

No manual deployment steps needed. The `dist/` directory is not committed.

## Getting Help

- **AGENTS.md** — Full project conventions and architecture reference
- **DEVELOPMENT_GUIDE.md** — Detailed development documentation (1422 lines)
- **docs/ARCHITECTURE.md** — System architecture overview
- **docs/PLUGINS.md** — Custom remark/rehype plugin reference
