# PRD: Show each harness install command on the landing page

Status: DRAFT

## User Stories

### US-001: Show the canonical install command on each agent card

**Description:** As a site visitor, I want each agent card to show its install command so that I type the canonical harness id.

**Acceptance Criteria:**

- [ ] Each entry in `AGENTS` in `src/pages/index.tsx` holds an `install` field with the canonical AGRO harness id, or no `install` field for an on-demand harness.
- [ ] The `install` values are `claude`, `codex`, `opencode`, `pi`, `hermes`, `openclaw`, `grok`, `muse`, `antigravity`, and `fx`. The T3 Code entry has no `install` field.
- [ ] Each card with an `install` field shows `agro harness install <install>` in a `<code>` element. The T3 Code card shows no install command.
- [ ] The `id` of each entry stays unchanged, because each `id` is the slug of a synced doc page.
- [ ] `git grep -nE 'install: "(claude-code|grok-build|antigravity-cli|muse-code|agy)"' -- src` exits 1.
- [ ] `pnpm typecheck` exits 0. `pnpm test` exits 0.
- [ ] Verify in browser using agent-browser skill: the landing page shows `agro harness install grok`, `agro harness install muse`, `agro harness install antigravity`, and `agro harness install claude` on the agent cards, and shows no old id.

### US-002: Record the manual review evidence

**Description:** As the advisor, I want an annotated screenshot of the agent cards so that the PR `## Manual review` section shows the change.

**Acceptance Criteria:**

- [ ] `pnpm build` exits 0.
- [ ] `.agro/tasks/landing-install-ids/evidence/manual-review.md` embeds an annotated screenshot of the agent cards from `pnpm serve`. The callouts mark the Grok Build, Muse Code, and Antigravity CLI install commands.
- [ ] The advisor stops `pnpm serve` after the capture.
- [ ] After the merge, the live page at `https://agro.mifune.dev/` shows `agro harness install grok`, `agro harness install muse`, and `agro harness install antigravity`.

## Summary

AGRO makes `grok`, `antigravity`, and `muse` the canonical harness ids (mifunedev/agro#1530), and `claude` replaces `claude-code` (mifunedev/agro#1526). The landing page agent cards link to the synced doc pages, but the cards show no install command. The synced doc pages show the new ids only after the next AGRO release.

This task adds the canonical install command to each card. The site then shows the short names without a wait for the AGRO release.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
|---|---|---|
| `src/pages/index.tsx` | `AGENTS`, the agent grid | Card data and markup |
| `src/pages/index.module.css` | agent card styles | Style of the install command |

## Interface Integration Points

| Surface | Change Type | Description |
|---|---|---|
| Landing page agent cards | Changed | Each installable card shows `agro harness install <id>`. |

## Storage

N/A. The site holds no persistent state.

## Architectural Decisions

- The `install` field holds the CLI id. The `id` field stays the doc slug. The two fields differ for Claude Code, Grok Build, Muse Code, and Antigravity CLI.
- T3 Code runs on demand, so the T3 Code card shows no install command.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
|---|---|---|
| `scripts/**/*.test.mjs` | existing suite | No regression |
| agent-browser check | card install commands | US-001 |

## Design Principles

- Keep the doc slugs stable.
- Show the canonical id that the AGRO CLI lists in `agro harness list`.

## Out of Scope

- `docs/agro/` pages. The AGRO release sync owns them.
- The supported alternative names. The synced harness pages state them after the AGRO release.

## Open Questions

None.

## Acceptance Criteria

- [ ] The landing page shows the canonical install command for each installable harness, including `grok`, `muse`, and `antigravity`.
- [ ] `pnpm typecheck`, `pnpm test`, and `pnpm build` exit 0.
- [ ] The live site at `https://agro.mifune.dev/` shows the short install commands after the merge.
- [ ] `.agro/tasks/landing-install-ids/evidence/manual-review.md` exists.

## Lessons
