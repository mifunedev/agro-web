# PRD: Correct the agro update download source in the docs

Status: DRAFT

Issue: [#61](https://github.com/mifunedev/agro-web/issues/61)

## User Stories

### US-001: State the agro update download source and guard the retired variable

**Description:** As a reader of the docs site, I want the `agro update` row to name the real override and default so that my override works.

**Acceptance Criteria:**

- [ ] Before the docs change, `pnpm run check:docs-drift` exits 1 and names `OH_JS_URL` in `docs/lifecycle-commands.md`. The evidence records the command and the exit status.
- [ ] `docs/lifecycle-commands.md` row `get-agro.sh` names `AGRO_JS_URL` only and the default `https://github.com/mifunedev/agro/releases/latest/download/agro.js`.
- [ ] `scripts/check-docs-drift.mjs` `RETIRED` has one entry that matches `OH_JS_URL`, with an `instead` text that names `AGRO_JS_URL`.
- [ ] `scripts/check-docs-drift.test.mjs` asserts that the entry matches `OH_JS_URL` and does not match `AGRO_JS_URL`.
- [ ] After the docs change, `pnpm run check:docs-drift`, `pnpm test`, `pnpm run typecheck`, and `pnpm run build` exit 0.

## Summary

Verified current state (advisor, `main` at `bb9b6cf`, 2026-09-23): `docs/lifecycle-commands.md:106` states that `agro update` downloads `AGRO_JS_URL`, falls back to `OH_JS_URL`, and defaults to `https://agro.mifune.dev/agro.js`. No other page names `OH_JS_URL`.

The harness source disagrees. `.agro/cli/src/commands/self-upgrade.ts` sets the default to `https://github.com/mifunedev/agro/releases/latest/download/agro.js`. `.agro/cli/src/__tests__/self-upgrade.test.ts` asserts that `agro update` uses `AGRO_JS_URL`, ignores the retired `OH_JS_URL`, and falls back to the release asset.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
| --- | --- | --- |
| `docs/lifecycle-commands.md` | the `get-agro.sh` row of the `agro update` table | Corrected. |
| `scripts/check-docs-drift.mjs` | `RETIRED` | One entry for `OH_JS_URL`. |
| `scripts/check-docs-drift.test.mjs` | test cases | Pins the entry. |

## Interface Integration Points

| Surface | Change Type | Description |
| --- | --- | --- |
| Docs site page `lifecycle-commands` | content | The row names the real override and default. |

## Storage

N/A. Docs content only.

## Architectural Decisions

- The harness CLI source is the source of truth for the default URL.
- The guard follows the PR #58 and PR #60 pattern: one `RETIRED` entry and one test.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
| --- | --- | --- |
| `scripts/check-docs-drift.test.mjs` | `OH_JS_URL` matches; `AGRO_JS_URL` does not | The entry catches the retired variable only. |
| `pnpm run check:docs-drift` | before and after | The page is clean after the edit. |

## Design Principles

- State only what the harness source proves.
- Change one row.

## Out of Scope

- Other `oh`-era wording on the page (#37).

## Open Questions

None.

## Acceptance Criteria

- [ ] No page under `docs/` names `OH_JS_URL`.
- [ ] The `agro update` row names `AGRO_JS_URL` and the release-asset default.
- [ ] `pnpm run check:docs-drift`, `pnpm test`, `pnpm run typecheck`, and `pnpm run build` exit 0.

## Lessons

Filled by the advisor before undraft.
