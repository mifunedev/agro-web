# PRD: Host tools and workspace create --ref docs

Status: DRAFT

Issue: #63. Epic: mifunedev/agro-console#180. mifunedev/agro#1203 merged on 2026-09-26.

## User Stories

### US-001: Document `agro workspace` and `--ref`

**Description:** As an operator, I want the public docs to describe `agro workspace create --ref`, so that I can pin a workspace to a release.

**Acceptance Criteria:**

- [ ] `docs/lifecycle-commands.md` has a `## Host workspaces: \`agro workspace\`` section. The section copies the harness section of the same name from `docs/lifecycle-commands.md` on mifunedev/agro `development`, including the `--ref <ref>` bullet.
- [ ] The verb table in `docs/lifecycle-commands.md` has the row for `agro workspace create [<name>] [--path <dir>] [--ref <ref>] [--json]` and `agro workspace list [--json]`.
- [ ] `pnpm build` exits 0.
- [ ] `pnpm run check:docs-drift` exits 0.
- [ ] `bash /home/sandbox/harness/.agro/skills/ste/scripts/ste-check.sh <abs path>` reports no finding on a line that this story adds.
- [ ] The rendered page shows the new section. Verify in browser using agent-browser skill.

### US-002: Document the host tools and root-level installs

**Description:** As an operator, I want the public docs to list the new host tools, so that I know each install level and removal path.

**Acceptance Criteria:**

- [ ] The tools paragraph in `docs/installation.md` names `code-server` as `kind: "installable"`.
- [ ] `docs/installation.md` has the host install text from the harness `docs/installation.md` on mifunedev/agro `development` after #1203 merges: the two host install limits, the host tool table for `code-server`, `docker-engine`, and `desktop` with a `Level` column, the `sudo -n` rule, and the four desktop steps.
- [ ] The table marks `docker-engine` and `desktop` as `root`, and the text states that `agro tool list` marks them `(root)`.
- [ ] `docs/installation.md` has the "Remove a root-level tool" section from #1203, and the text states that `agro tool uninstall` refuses both root-level tools.
- [ ] `pnpm build` exits 0.
- [ ] `pnpm run check:docs-drift` exits 0.
- [ ] `bash /home/sandbox/harness/.agro/skills/ste/scripts/ste-check.sh <abs path>` reports no finding on a line that this story adds.
- [ ] The rendered page shows the host tool table and the removal section. Verify in browser using agent-browser skill.

## Summary

`docs/` in this repository is a hand copy of the harness `docs/`. Nothing syncs it. The copy predates AGRO 0.15.0:

- `docs/installation.md` names `herdr`, `cloudflared`, `agent-browser`, and `tailscale` as installable tools. The page does not name `code-server`, `docker-engine`, `desktop`, host installs, or root-level installs.
- `docs/lifecycle-commands.md` has no `agro workspace` section and no `--ref` flag for `workspace create`.

The harness docs on mifunedev/agro `development` already hold the correct text for each item. mifunedev/agro#1203 adds the "Remove a root-level tool" section.

Selected approach: copy the named harness sections into the two pages, and change nothing else. Each story copies the text and keeps the harness wording, with relative links adjusted to this site.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
|---|---|---|
| `docs/installation.md` | tools paragraph, host install text, removal section | US-002 |
| `docs/lifecycle-commands.md` | verb table, `agro workspace` section | US-001 |
| `scripts/check-docs-drift.mjs` | `RETIRED`, `ALLOW` | Drift gate |
| harness `docs/installation.md`, `docs/lifecycle-commands.md` | source sections | Source of truth |

## Interface Integration Points

| Surface | Change Type | Description |
|---|---|---|
| `https://oh.mifune.dev/docs/installation` | Content addition | Host tools, root-level installs, removal steps |
| `https://oh.mifune.dev/docs/lifecycle-commands` | Content addition | `agro workspace` and `--ref` |

## Storage

N/A. The change edits Markdown only.

## Architectural Decisions

- The harness docs are the source of truth. This site copies the named sections without new claims.
- Branch `docs/63-host-tools-workspace-ref` starts from `main`, and the PR targets `main`.
- US-002 copies the removal section that mifunedev/agro#1203 merged.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
|---|---|---|
| `scripts/check-docs-drift.mjs` | no retired token in the changed pages | US-001, US-002 |
| `pnpm build` | the site builds with the new sections and links | US-001, US-002 |
| agent-browser | the rendered sections appear on `pnpm serve` | US-001, US-002 |

## Design Principles

- Copy the source text. Do not write a second description.
- Keep the change to the sections that issue #63 names.

## Out of Scope

- Other drift in `docs/lifecycle-commands.md` and `docs/installation.md`, such as `oh update` and `agro update`. A separate docs sync can take that work.
- A sync tool for the hand copy.

## Open Questions

None.

## Acceptance Criteria

- [ ] US-001 and US-002 have `passes: true` in `prd.json`.
- [ ] `pnpm build` and `pnpm run check:docs-drift` exit 0 on the task branch.
- [ ] The PR body closes #63.

## Lessons

- mifunedev/agro#1203 placed "Remove a root-level tool" in the middle of the harness tools text, so later paragraphs render under that heading. Evidence: the first US-002 copy put the tailscale paragraph under the removal heading. Outcome: fixed in this PR for the site; issue mifunedev/agro#1205 for the harness.
- The site copy lags the harness on more pages than #63 names. Evidence: `docs/lifecycle-commands.md` still describes `oh update`. Outcome: issue #65.
