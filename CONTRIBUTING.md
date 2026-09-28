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

> ⚠️ **Known baseline issue**: commit `54febc7` ran prettier across the repo, which conflicts with the
> antfu eslint style (2-space indent / single quotes / no semicolons). A single unscoped `eslint --fix`
> therefore reformats the whole file (+hundreds of lines) and drowns a small fix. For minimal-diff
> bug fixes, keep the surrounding formatting as-is and skip the hook with `git commit --no-verify`
> — then say so in the PR description. Repo-wide formatting belongs in its own dedicated PR.

### 3. Run Checks Locally

```bash
pnpm build       # Full build pipeline (type check → build → generate-llms → apply-lqip)
pnpm verify-feed # RSS / Atom output validation (what CI runs)
pnpm sync-docs:check  # Generated doc-fact blocks are up to date
pnpm lint        # ESLint check (antfu config) — currently red on main, see the note above
```

These mirror CI except `pnpm lint`: **CI does not run lint** (`ci.yml` = install → `pnpm audit --prod`
→ `pnpm build` → `pnpm verify-feed` → `pnpm sync-docs:check`). `pnpm build` already runs `astro check`,
so type errors do fail CI.

### 4. Commit

```bash
git add src/components/NewWidget.astro   # add explicit paths
git commit -m "feat(component): add new widget"
```

> **Never `git add -A` / `git add .`** — this workspace shares the repository root with other
> uncommitted work. Add only the files you actually changed.

> There is **no commit-message validation** in this repo (verified 2026-09-28): `simple-git-hooks`
> only registers `pre-commit` = `pnpm lint-staged`, and that task only matches `*.{js,ts,astro}`.
> No `commit-msg` hook, no commitlint, no CI check on commit or PR titles — the format above is
> enforced by review convention only.

### 5. Push and Create PR

```bash
git push origin dev-feature-name
# Then create PR via GitHub UI or gh CLI
```

PR title should mirror the commit message format (it becomes the squash commit message).

### 6. PR Review

- PRs trigger the **Argus-Flash** GitHub App for automatic code review
- Argus reports issues with priority labels P0/P1/P2/P3; assess each finding:
  - **Verify first** — confirm the issue actually exists in the code before fixing
  - `rgba()`/`hsl()` values in frosted-glass gradients and shadows are **intentional** and should not be converted to theme tokens
  - Fixed semantic function colors (e.g., validation error red) are **intentional**
  - Bare hex values that duplicate existing theme tokens **should** be fixed
  - **Bot-generated issues** (Daily Inspection Bot) — evaluate actual risk before fixing: check for real bug history, current CI coverage, and ROI. Close non-actionable issues with explanation rather than creating unnecessary PRs
- CI checks must pass (`pnpm build`, `pnpm verify-feed`, `pnpm sync-docs:check`, `pnpm audit --prod`)
- ⚠️ **No automated gate on `main`** — the `protect-main` ruleset exists but
  `gh api repos/cgartlab/cgartlab.github.io/rules/branches/main` returns `[]` (it matches no branch),
  and the repo allows merge / rebase / squash merges. Human review is **convention, not enforcement**:
  confirm CI is green and every bot finding has been assessed before merging

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
| `lang` | `''` \| `'en'` | No | `''` | Only enabled locales. `'zh-tw'` is **rejected** by the schema (build-breaking) |
| `abbrlink` | string | No | `''` | Lowercase letters, digits, hyphens only |

## TypeScript Type Safety

The project uses `@ts-expect-error` in exactly **1 place** (AGENTS.md-enforced):
1. `MediaEmbed.astro` — MediaEmbed component

**Do not add new suppressions.** If you encounter a type error, fix the underlying code instead.

## ESLint Exemptions

`src/content/**` is completely ignored by ESLint. No suppressions needed for Markdown/MDX files.

## Syncthing Conflict Files

Syncthing 已停用（见 AGENTS.md），相关残留已于 2026-09-28 全部清理（`.stignore`、`.stignore-common`、
`scripts/syncthing-cleanup.*`、`scripts/SYNCTHING-SETUP.md`、`scripts/clean-sync-conflicts.sh`）。
如历史遗留的 `*.sync-conflict-*` 文件再次出现，直接删除即可。

## Deployment

| Environment | How |
|-------------|-----|
| Production | Push to `main` → Cloudflare Worker + Static Assets auto-deploys |
| Preview | Local `pnpm build && pnpm preview` (production-equivalent `dist/`); no PR preview URL is configured (`wrangler.jsonc` has no `preview_urls`) |

No manual deployment steps needed. The `dist/` directory is not committed. After a `main` merge you can
confirm the rollout with `pnpm exec wrangler deployments list` and by checking the live output
(`curl -s https://cgartlab.com/rss.xml`, etc.) — Cloudflare caches HTML for 10 min / 30 min at the edge.

## Getting Help

- **AGENTS.md** — Full project conventions and architecture reference（架构、约定、命令的唯一权威文档）
- **README.md** — 项目概览、技术栈、常用命令
- **.github/ISSUE_TEMPLATE / PULL_REQUEST_TEMPLATE** — 提 issue / PR 模板
