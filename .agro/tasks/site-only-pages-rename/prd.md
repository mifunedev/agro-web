# PRD: Rename AGRO on the two site-only docs pages

Status: DRAFT

Issue: #67. Epic: mifunedev/agro#1206.

## User Stories

### US-001: Update the Docker deployment page to AGRO names

**Description:** As an operator, I want the Docker deployment recipe to use the AGRO names, so that the commands work on the current release.

**Acceptance Criteria:**

- [x] `docs/docker-deployment.md` uses these replacements, and changes no other text:

  | Old | New |
  |---|---|
  | `Open Harness` | `AGRO` |
  | the `oh` command, such as `oh sandbox install docker` | the `agro` command, such as `agro sandbox install docker` |
  | `ghcr.io/mifunedev/openharness:latest` | `ghcr.io/mifunedev/agro:latest` |
  | the network `openharness` | the network `agro` |
  | the containers `oh-a` and `oh-b`, and their volumes | `agro-a` and `agro-b`, and their volumes |
  | `/srv/openharness-a` | `/srv/agro-a` |
  | `/opt/oh-seed` | `/opt/agro-seed` |
  | `.oh/.image-seeded` | `.agro/.image-seeded` |

- [x] `grep -nE 'Open Harness|openharness|\boh-[ab]\b|\.oh/|/opt/oh-|(^|[^a-z.-])oh (sandbox|shell|stop|destroy|harness|tool)' docs/docker-deployment.md` prints nothing.
- [x] `pnpm build` exits 0, and the build log has no broken-link or broken-anchor warning.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/docker-deployment` shows `ghcr.io/mifunedev/agro:latest` in its first `docker run` block. Verify in browser using agent-browser skill.

### US-002: Update the model selection page to the AGRO name

**Description:** As an operator, I want the model selection page to use the AGRO name, so that the page matches the rest of the site.

**Acceptance Criteria:**

- [x] `docs/model-selection.md` replaces each `Open Harness` with `AGRO`, and changes no other text.
- [x] `grep -n 'Open Harness' docs/model-selection.md` prints nothing.
- [x] `pnpm build` exits 0, and the build log has no broken-link or broken-anchor warning.
- [x] `pnpm run check:docs-drift` exits 0.
- [x] The rendered page at `/docs/model-selection` shows "AGRO currently consults". Verify in browser using agent-browser skill.

## Summary

`docs/docker-deployment.md` and `docs/model-selection.md` exist only on the site. The docs sync in #66 did not change them, apart from one anchor.

- `docs/docker-deployment.md` has 34 lines with stale names: `Open Harness`, the `oh` command, the image `ghcr.io/mifunedev/openharness`, the network `openharness`, the containers `oh-a` and `oh-b`, `/opt/oh-seed`, and `.oh/.image-seeded`.
- `docs/model-selection.md` names `Open Harness` two times.

The harness docs give the current names. `docs/deployment-prebuilt-image.md` names the image `ghcr.io/mifunedev/agro` and the marker `.agro/.image-seeded`. `.devcontainer/Dockerfile` names the seed directory `/opt/agro-seed`.

Selected approach: keep both pages, because `src/pages/index.tsx` links to `/docs/docker-deployment`. Change only the names in the table.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
|---|---|---|
| `docs/docker-deployment.md` | commands, image, network, container, and path names | US-001 |
| `docs/model-selection.md` | project name | US-002 |
| harness `docs/deployment-prebuilt-image.md`, `.devcontainer/Dockerfile` | image, marker, and seed names | Source of truth for the new names |

## Interface Integration Points

| Surface | Change Type | Description |
|---|---|---|
| `/docs/docker-deployment` | Content update | AGRO image, commands, and names |
| `/docs/model-selection` | Content update | AGRO name |

## Storage

N/A. The change edits Markdown only.

## Architectural Decisions

- The harness is the source of truth for each name. The pages keep their structure and their recipe.
- The redirect from `/docs/oh-directory-layout` stays. No page moves, so this PR adds no redirect.
- Branch `task/67-site-only-pages-rename` starts from `main`, and the PR targets `main`.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
|---|---|---|
| `grep` on each page | no old name remains | US-001, US-002 |
| `pnpm build` | exit 0, no broken-link or broken-anchor warning | US-001, US-002 |
| `pnpm run check:docs-drift` | exit 0 | US-001, US-002 |
| agent-browser | each page renders the new name | US-001, US-002 |

## Design Principles

- Change names, not the recipe.
- Take each new name from the harness.

## Out of Scope

- A check that the `docker run` flags match the current image. The harness owns the image, and the recipe did not fail in this sync.
- Blog posts. The site policy keeps blog posts as dated records.
- An extension of the drift gate to the `openharness` image name.

## Open Questions

None.

## Acceptance Criteria

- [x] US-001 and US-002 have `passes: true` in `prd.json`.
- [x] CI is green on the PR.
- [x] The PR body closes #67.

## Lessons

None.
