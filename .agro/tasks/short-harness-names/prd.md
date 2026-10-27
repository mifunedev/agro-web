# PRD: Show the canonical harness names on the AGRO site

Status: DRAFT

## User Stories

### US-001: Update the hand-written install commands to the canonical names

**Description:** As a site visitor, I want each install command to use the canonical harness id so that the command matches the AGRO CLI.

**Acceptance Criteria:**

- [ ] `src/pages/index.tsx` shows `agro harness install claude` in the quick-start code block.
- [ ] `docs/console/getting-started.md` shows `agro harness install claude --host`.
- [ ] `blog/2026-07-06-first-sandbox-agent-auth.md`, `blog/2026-07-11-deploy-open-harness-with-docker.md`, and `blog/archive/2026-04-28-byoh.md` show `agro harness install claude`.
- [ ] `git grep -nE 'harness install (claude-code|grok-build|antigravity-cli|muse-code)' -- src docs blog` exits 1.
- [ ] The `AGENTS` ids in `src/pages/index.tsx` stay unchanged, because each id is the slug of a synced doc page.
- [ ] `pnpm typecheck` exits 0. `pnpm test` exits 0.
- [ ] Verify in browser using agent-browser skill: the landing page quick-start block shows `agro harness install claude`.

### US-002: Record the manual review evidence

**Description:** As the advisor, I want an annotated screenshot of the landing page so that the PR `## Manual review` section shows the change.

**Acceptance Criteria:**

- [ ] `pnpm build` exits 0.
- [ ] `.agro/tasks/short-harness-names/evidence/manual-review.md` embeds an annotated screenshot of the landing page quick-start block from `pnpm serve`.
- [ ] The advisor stops `pnpm serve` after the capture.

## Summary

The AGRO CLI renames the Claude Code id to `claude` (mifunedev/agro#1526) and adds the short ids `grok`, `antigravity`, and `muse`. The old ids stay supported names. `claude-code` stops working in AGRO 0.29.0.

`scripts/sync-agro-docs.mjs` copies `docs/agro/` from the latest AGRO release tag at build time. The synced harness pages show the new names after the next AGRO release. This task changes only the pages that the site writes by hand.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
|---|---|---|
| `src/pages/index.tsx` | quick-start code block, `AGENTS` | Landing page command |
| `docs/console/getting-started.md` | step 4 | Console guide command |
| `blog/` posts | install commands | Post commands |

## Interface Integration Points

| Surface | Change Type | Description |
|---|---|---|
| Landing page | Changed | The quick-start block names `claude`. |
| Console guide and blog posts | Changed | Each command names `claude`. |

## Storage

N/A. The site holds no persistent state.

## Architectural Decisions

- The synced pages under `docs/agro/` follow the AGRO release tag. This task does not copy unreleased AGRO docs.
- The doc slugs stay unchanged, because AGRO keeps the doc file names.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
|---|---|---|
| `scripts/**/*.test.mjs` | existing suite | No regression |
| agent-browser check | landing page block text | US-001 |

## Design Principles

- Change the commands, not the doc slugs.
- Keep the synced pages owned by the AGRO release.

## Out of Scope

- `docs/agro/` pages. The AGRO release sync owns them.
- `promos/banner-recipes/` JSON. The recipes record past banners.
- Blog tags such as `claude-code`.

## Open Questions

None.

## Acceptance Criteria

- [ ] No hand-written page under `src`, `docs`, or `blog` shows a deprecated or old harness id in an install command.
- [ ] `pnpm typecheck`, `pnpm test`, and `pnpm build` exit 0.
- [ ] `.agro/tasks/short-harness-names/evidence/manual-review.md` exists.

## Lessons
