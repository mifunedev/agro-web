# PRD: Remove the retired /spec, /retro, and /wiki compile from the docs

Status: DRAFT

Issue: [#59](https://github.com/mifunedev/agro-web/issues/59)

## User Stories

### US-001: Describe the core chain and guard the retired names

**Description:** As a reader of the docs site, I want the docs to describe current skills only so that I follow no retired workflow.

**Acceptance Criteria:**

- [ ] Before the docs change, `pnpm run check:docs-drift` exits 1 and names each current mention of `/spec` and `/retro` in `docs/glossary.md`, `docs/security-considerations.md`, and `docs/oh-directory-layout.md`. The evidence records the command and the exit status.
- [ ] `scripts/check-docs-drift.mjs` `RETIRED` has one entry that matches `/spec`, `/retro`, `/wiki compile`, and `skills/spec/` and `skills/retro/` paths, with an `instead` text that names the core chain (`/prd` → draft PR → `/delegate` → ready PR).
- [ ] `scripts/check-docs-drift.test.mjs` asserts that the entry matches each retired shape and does not match a current skill name such as `/prd`, `/delegate`, or `/wiki query`.
- [ ] `docs/security-considerations.md` anchors the human merge gate to `https://github.com/mifunedev/agro/blob/development/.agro/skills/git/SKILL.md#ready-for-review`.
- [ ] After the docs change, `pnpm run check:docs-drift`, `pnpm test`, and `pnpm run typecheck` exit 0.
- [ ] `pnpm run build` exits 0.

## Summary

`mifunedev/agro` retired `/spec`, `/retro`, and `/wiki compile` in mifunedev/agro#1156 (PR mifunedev/agro#1157). The core chain is `/prd` → draft PR → `/delegate` → ready PR. Each plan's `## Lessons` section is the only lesson record.

Verified current state (advisor, `main` at `2c4b852`, 2026-09-23): 17 lines name `/spec` or `/retro` in three pages:

- `docs/glossary.md`: 13 lines (loop, terminal state, implementation owner, and role-skill entries, with source links to `.oh/skills/spec/...`).
- `docs/security-considerations.md`: 2 lines (the merge-gate doctrine link).
- `docs/oh-directory-layout.md`: 2 lines (the `tasks/` and `knowledge/` rows).

The pages have drifted from the harness `docs/` by 79 to 96 lines per page, so the task edits these pages directly. `scripts/check-docs-drift.mjs` owns retirement regression protection through its `RETIRED` list. PR #58 set the pattern: one `RETIRED` entry plus a test file.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
| --- | --- | --- |
| `docs/glossary.md`, `docs/security-considerations.md`, `docs/oh-directory-layout.md` | the 17 lines | Rewritten for the core chain. |
| `scripts/check-docs-drift.mjs` | `RETIRED` | One entry for the retired skills. |
| `scripts/check-docs-drift.test.mjs` | test cases | Pins the entry's shapes. |

## Interface Integration Points

| Surface | Change Type | Description |
| --- | --- | --- |
| Docs site pages | content | Three pages describe the core chain. |
| `pnpm run check:docs-drift` | guard | Fails on a new mention of a retired skill. |

## Storage

N/A. Docs content only.

## Architectural Decisions

- The `RETIRED` pattern anchors on a leading `/` or on the `skills/` path segment, so prose such as "a spec" or "retrospective" does not match.
- The task adds no `ALLOW` exemption unless a page must name a retired skill to say that it is retired.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
| --- | --- | --- |
| `scripts/check-docs-drift.test.mjs` | retired shapes match; current skill names do not | The entry catches the retired names only. |
| `pnpm run check:docs-drift` | before and after | The pages are clean after the edit. |
| `pnpm run build` | full site | The edited pages build. |

## Design Principles

- Follow the PR #58 pattern: one `RETIRED` entry and one test.
- Describe current behavior only.

## Out of Scope

- Other `.oh/` path names in these pages.
- Blog posts.

## Open Questions

None.

## Acceptance Criteria

- [ ] No page under `docs/` names `/spec`, `/retro`, or `/wiki compile` as a current skill.
- [ ] `docs/security-considerations.md` anchors the human merge gate to the harness `/git` § Ready for review.
- [ ] `pnpm run check:docs-drift`, `pnpm test`, `pnpm run typecheck`, and `pnpm run build` exit 0.

## Lessons

Filled by the advisor before undraft.
