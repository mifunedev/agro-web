# PRD: Sync the site docs with the harness docs

Status: DRAFT

Issue: #65. Epic: mifunedev/agro#1206.

## User Stories

The copy rule applies to each story that adds or syncs a page:

1. The source is the harness page of the same path in `docs/` on mifunedev/agro at the pinned commit `587f5524`. `587f5524` is the tip of `development` after mifunedev/agro#1207 merges.
2. The site page keeps its front matter keys `sidebar_position` and `slug`. Every other line comes from the source page.
3. Replace each unresolved relative link with an absolute GitHub link. An unresolved link points outside `docs/`, or to a harness page with no site copy. A file link uses `https://github.com/mifunedev/agro/blob/development/<repo path>`. A directory link uses `tree` in place of `blob`.
4. No other line changes.

To examine the copy rule for a page `<p>`, run the command below from the repository root. The output must hold only front matter lines and rewritten link lines.

```bash
diff <(grep -vE '^(sidebar_position|slug):' docs/<p>) <(git -C /home/sandbox/harness show 587f5524:docs/<p>)
```

### US-001: Allow the harness uses of retired tokens in the drift gate

**Description:** As a site maintainer, I want the drift gate to accept the harness text, so that a verbatim copy passes `pnpm run check:docs-drift`.

**Acceptance Criteria:**

- [x] `ALLOW` in `scripts/check-docs-drift.mjs` has one entry for each of these file and token pairs, each with a `why`: `harnesses/overview.md` and `lifecycle-commands.md` with the pre-systemd container lifecycle token (`link-providers.sh --init` is the supported repair flag), and `agro-compatibility.md` with the pre-systemd container lifecycle token and the `get-oh.sh` token (the page names retired items to say that they are retired).
- [x] `RETIRED` does not change.
- [x] `pnpm test` exits 0.
- [x] `pnpm run check:docs-drift` exits 0.

### US-002: Add the Antigravity CLI harness page

**Description:** As an operator, I want the Antigravity CLI page on the site, so that the links from the harness table and the quickstart resolve.

**Acceptance Criteria:**

- [x] `docs/harnesses/antigravity-cli.md` exists and follows the copy rule.
- [x] The front matter has `sidebar_position: 9`.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/antigravity-cli` shows the heading "Antigravity CLI". Verify in browser using agent-browser skill.

### US-003: Add the AGRO naming page

**Description:** As an operator, I want the AGRO naming page on the site, so that the pages that link to it resolve.

**Depends on:** US-001.

**Acceptance Criteria:**

- [x] `docs/agro-compatibility.md` exists and follows the copy rule.
- [x] The front matter has `sidebar_position: 15`.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/agro-compatibility` shows the harness H1. Verify in browser using agent-browser skill.

### US-004: Replace the `.oh/` layout page with the `.agro/` layout page

**Description:** As an operator, I want the directory layout page to describe `.agro/`, so that the site matches the harness.

**Acceptance Criteria:**

- [x] `docs/oh-directory-layout.md` does not exist.
- [x] `docs/agro-directory-layout.md` exists, follows the copy rule, and has `sidebar_position: 11`.
- [x] `docusaurus.config.ts` has the redirect `{ from: "/docs/oh-directory-layout", to: "/docs/agro-directory-layout" }`.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/agro-directory-layout` shows the harness H1, and `/docs/oh-directory-layout` redirects to it. Verify in browser using agent-browser skill.

### US-005: Sync `docs/integrations/langfuse.md`

**Description:** As an operator, I want `docs/integrations/langfuse.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/integrations/langfuse.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/integrations/langfuse` shows the harness H1. Verify in browser using agent-browser skill.

### US-006: Sync `docs/installation.md`

**Description:** As an operator, I want `docs/installation.md` to match the harness page, so that the site describes the current AGRO.

**Depends on:** US-002, US-003.

**Acceptance Criteria:**

- [x] `docs/installation.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/installation` shows the harness H1. Verify in browser using agent-browser skill.

### US-007: Sync `docs/lifecycle-commands.md`

**Description:** As an operator, I want `docs/lifecycle-commands.md` to match the harness page, so that the site describes the current AGRO.

**Depends on:** US-001, US-003.

**Acceptance Criteria:**

- [x] `docs/lifecycle-commands.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/lifecycle-commands` shows the harness H1. Verify in browser using agent-browser skill.

### US-008: Sync `docs/quickstart.md`

**Description:** As an operator, I want `docs/quickstart.md` to match the harness page, so that the site describes the current AGRO.

**Depends on:** US-002, US-003.

**Acceptance Criteria:**

- [x] `docs/quickstart.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/quickstart` shows the harness H1. Verify in browser using agent-browser skill.

### US-009: Sync `docs/deployment-prebuilt-image.md`

**Description:** As an operator, I want `docs/deployment-prebuilt-image.md` to match the harness page, so that the site describes the current AGRO.

**Depends on:** US-004.

**Acceptance Criteria:**

- [x] `docs/deployment-prebuilt-image.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/deployment-prebuilt-image` shows the harness H1. Verify in browser using agent-browser skill.

### US-010: Sync `docs/configuration.md`

**Description:** As an operator, I want `docs/configuration.md` to match the harness page, so that the site describes the current AGRO.

**Depends on:** US-004.

**Acceptance Criteria:**

- [x] `docs/configuration.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/configuration` shows the harness H1. Verify in browser using agent-browser skill.

### US-011: Sync `docs/runtimes/microsandbox.md`

**Description:** As an operator, I want `docs/runtimes/microsandbox.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/runtimes/microsandbox.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/runtimes/microsandbox` shows the harness H1. Verify in browser using agent-browser skill.

### US-012: Sync `docs/harnesses/overview.md`

**Description:** As an operator, I want `docs/harnesses/overview.md` to match the harness page, so that the site describes the current AGRO.

**Depends on:** US-001, US-002.

**Acceptance Criteria:**

- [x] `docs/harnesses/overview.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/overview` shows the harness H1. Verify in browser using agent-browser skill.

### US-013: Sync `docs/integrations/slack.md`

**Description:** As an operator, I want `docs/integrations/slack.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/integrations/slack.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/integrations/slack` shows the harness H1. Verify in browser using agent-browser skill.

### US-014: Sync `docs/contributing.md`

**Description:** As an operator, I want `docs/contributing.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/contributing.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/contributing` shows the harness H1. Verify in browser using agent-browser skill.

### US-015: Sync `docs/harnesses/hermes.md`

**Description:** As an operator, I want `docs/harnesses/hermes.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/hermes.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/hermes` shows the harness H1. Verify in browser using agent-browser skill.

### US-016: Sync `docs/glossary.md`

**Description:** As an operator, I want `docs/glossary.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/glossary.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/glossary` shows the harness H1. Verify in browser using agent-browser skill.

### US-017: Sync `docs/security-considerations.md`

**Description:** As an operator, I want `docs/security-considerations.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/security-considerations.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/security-considerations` shows the harness H1. Verify in browser using agent-browser skill.

### US-018: Sync `docs/harnesses/pi.md`

**Description:** As an operator, I want `docs/harnesses/pi.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/pi.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/pi` shows the harness H1. Verify in browser using agent-browser skill.

### US-019: Sync `docs/integrations/github.md`

**Description:** As an operator, I want `docs/integrations/github.md` to match the harness page, so that the site describes the current AGRO.

**Depends on:** US-003.

**Acceptance Criteria:**

- [x] `docs/integrations/github.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/integrations/github` shows the harness H1. Verify in browser using agent-browser skill.

### US-020: Sync `docs/connecting.md`

**Description:** As an operator, I want `docs/connecting.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/connecting.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/connecting` shows the harness H1. Verify in browser using agent-browser skill.

### US-021: Sync `docs/harnesses/codex.md`

**Description:** As an operator, I want `docs/harnesses/codex.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/codex.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/codex` shows the harness H1. Verify in browser using agent-browser skill.

### US-022: Sync `docs/runtimes/overview.md`

**Description:** As an operator, I want `docs/runtimes/overview.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/runtimes/overview.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/runtimes/overview` shows the harness H1. Verify in browser using agent-browser skill.

### US-023: Sync `docs/integrations/sshd.md`

**Description:** As an operator, I want `docs/integrations/sshd.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/integrations/sshd.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/integrations/sshd` shows the harness H1. Verify in browser using agent-browser skill.

### US-024: Sync `docs/harnesses/muse-code.md`

**Description:** As an operator, I want `docs/harnesses/muse-code.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/muse-code.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/muse-code` shows the harness H1. Verify in browser using agent-browser skill.

### US-025: Sync `docs/runtimes/docker.md`

**Description:** As an operator, I want `docs/runtimes/docker.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/runtimes/docker.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/runtimes/docker` shows the harness H1. Verify in browser using agent-browser skill.

### US-026: Sync `docs/intro.md`

**Description:** As an operator, I want `docs/intro.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/intro.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs` shows the harness H1. Verify in browser using agent-browser skill.

### US-027: Sync `docs/harnesses/claude-code.md`

**Description:** As an operator, I want `docs/harnesses/claude-code.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/claude-code.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/claude-code` shows the harness H1. Verify in browser using agent-browser skill.

### US-028: Sync `docs/integrations/herdr.md`

**Description:** As an operator, I want `docs/integrations/herdr.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/integrations/herdr.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/integrations/herdr` shows the harness H1. Verify in browser using agent-browser skill.

### US-029: Sync `docs/harnesses/grok-build.md`

**Description:** As an operator, I want `docs/harnesses/grok-build.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/grok-build.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/grok-build` shows the harness H1. Verify in browser using agent-browser skill.

### US-030: Sync `docs/open-core.md`

**Description:** As an operator, I want `docs/open-core.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/open-core.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/open-core` shows the harness H1. Verify in browser using agent-browser skill.

### US-031: Sync `docs/harnesses/opencode.md`

**Description:** As an operator, I want `docs/harnesses/opencode.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/opencode.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/opencode` shows the harness H1. Verify in browser using agent-browser skill.

### US-032: Sync `docs/integrations/pi-fff.md`

**Description:** As an operator, I want `docs/integrations/pi-fff.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/integrations/pi-fff.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/integrations/pi-fff` shows the harness H1. Verify in browser using agent-browser skill.

### US-033: Sync `docs/integrations/debugmcp.md`

**Description:** As an operator, I want `docs/integrations/debugmcp.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/integrations/debugmcp.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/integrations/debugmcp` shows the harness H1. Verify in browser using agent-browser skill.

### US-034: Sync `docs/resources.md`

**Description:** As an operator, I want `docs/resources.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/resources.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/resources` shows the harness H1. Verify in browser using agent-browser skill.

### US-035: Sync `docs/harnesses/t3code.md`

**Description:** As an operator, I want `docs/harnesses/t3code.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/harnesses/t3code.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/harnesses/t3code` shows the harness H1. Verify in browser using agent-browser skill.

### US-036: Sync `docs/property-testing.md`

**Description:** As an operator, I want `docs/property-testing.md` to match the harness page, so that the site describes the current AGRO.

**Acceptance Criteria:**

- [x] `docs/property-testing.md` follows the copy rule.
- [x] `pnpm build` exits 0, and the build log has no broken-link warning for this page.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/property-testing` shows the harness H1. Verify in browser using agent-browser skill.

## Summary

`docs/` in this repository is a hand copy of the harness `docs/`. Nothing syncs the copy. The comparison with harness `development` at `d152f6b6` gives these results:

- 32 pages exist in both repositories and differ. The differences range from 4 lines (`property-testing.md`) to 602 lines (`integrations/langfuse.md`). Most pages still use the former Open Harness name, the `oh` command, and `.oh/` paths.
- The synced pages link to 3 harness pages that the site does not have: `harnesses/antigravity-cli.md`, `agro-compatibility.md`, and `agro-directory-layout.md`. The harness renamed `oh-directory-layout.md` to `agro-directory-layout.md` in mifunedev/agro#1136.
- The synced pages link to harness files outside `docs/`, such as `../AGENTS.md`, `../.devcontainer/Dockerfile`, and `rfcs/rfc-runtime-support.md`. These links do not resolve on the site.
- A verbatim copy fails `pnpm run check:docs-drift` with 4 findings: 3 for `--init` in `link-providers.sh --init`, and 1 for `get-oh.sh` in `agro-compatibility.md`. Each finding names a supported flag, or names a retired item to say that it is retired.
- `docusaurus.config.ts` sets `onBrokenLinks: "warn"`, so a broken link does not fail `pnpm build`. The build on `main` at `a9ac73a` prints no broken-link warning.

Selected approach: one story for each page, as the operator asked. US-001 prepares the drift gate. US-002 to US-004 add the missing linked pages. US-005 to US-036 sync the 32 shared pages.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
|---|---|---|
| `docs/**/*.md` | page text | Synced pages |
| `scripts/check-docs-drift.mjs` | `ALLOW` | Drift gate exceptions for the harness text |
| `docusaurus.config.ts` | `@docusaurus/plugin-client-redirects` `redirects` | Redirect for the renamed layout page |
| harness `docs/` at `587f5524` | source pages | Source of truth |

## Interface Integration Points

| Surface | Change Type | Description |
|---|---|---|
| `https://agro.mifune.dev/docs/*` | Content update | 32 pages match the harness text |
| `/docs/harnesses/antigravity-cli`, `/docs/agro-compatibility`, `/docs/agro-directory-layout` | New pages | Pages that the synced text links to |
| `/docs/oh-directory-layout` | Redirect | Sends old links to `/docs/agro-directory-layout` |

## Storage

N/A. The change edits Markdown and site configuration only.

## Architectural Decisions

- The harness docs are the source of truth. The site copies the text and changes only front matter and links.
- The source is harness `development`, not `main`. Issue #65 names `main`, but #63 copied `development`, and epic mifunedev/agro#1206 orders this work after #1205. `main` does not have #1203 or #1205.
- The intro page loses the site admonition "OpenHarness is now AGRO". The new `agro-compatibility.md` page describes the rename.
- Branch `task/65-harness-docs-sync` starts from `main`, and the PR targets `main`. The tracker accepts only `feat`, `bug`, `task`, `audit`, and `skill` as branch prefixes.
- Each worker owns one page. US-001 owns `scripts/check-docs-drift.mjs`. US-004 owns `docusaurus.config.ts`. No two stories write the same file.
- The advisor dispatches the page stories in waves of at most 5 workers. A worker can take a sequence of small pages, one commit for each story.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
|---|---|---|
| copy-rule `diff` | only front matter and link lines differ from the source page | US-002 to US-036 |
| `pnpm build` | exit 0, and no broken-link warning in the build log | every story |
| `pnpm run check:docs-drift` | exit 0 | every story |
| `pnpm test` | `scripts/check-docs-drift.test.mjs` and the other script tests pass | US-001 |
| agent-browser | each new or synced page renders its H1 on `pnpm serve` | US-002 to US-036 |

## Design Principles

- Copy the source text. Do not write a second description.
- Change a link only when the link does not resolve on the site.
- One page per story, and one owner per file.

## Out of Scope

- `docs/docker-deployment.md` and `docs/model-selection.md`. The harness has no page with these names, so the copy rule has no source. Both pages still use the Open Harness name. The Lessons section proposes a follow-up issue.
- Harness pages that no synced page links to, such as `evals.md`, `sandbox-python.md`, the `rfcs/` pages, and the repair runbooks.
- Blog posts, `promos/`, and `src/pages/`.
- A sync tool for the hand copy.
- A change to `onBrokenLinks`.

## Open Questions

None.

## Acceptance Criteria

- [x] Each story has `passes: true` in `prd.json`.
- [x] `pnpm build`, `pnpm test`, and `pnpm run check:docs-drift` exit 0 on the task branch.
- [x] The PR body closes #65.

## Lessons

- Two harness pages break a verbatim site copy. Evidence: `docs/intro.md` links to the anchor `#3-sandbox-isolation--the-docker-socket-caveat--enforced-with-a-caveat`, but the heading is now section 4. `docs/runtimes/docker.md` uses the bare autolink `<https://docs.docker.com/engine/install/>`, and the MDX build rejects it. Outcome: proposed harness issue; the site copy carries both fixes in this PR.
- The site-only pages `docs/docker-deployment.md` and `docs/model-selection.md` still use the Open Harness name and the `oh` command. The copy rule has no source for these pages. Evidence: both pages start with "Open Harness". Outcome: proposed agro-web issue; this PR changes only one stale anchor in `docs/docker-deployment.md`.
