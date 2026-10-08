# PRD: Align the docs site with the Console and AGRO

Status: DRAFT

## User Stories

### US-001: Restore the build with the release installer

**Description:** As a site maintainer, I want the build to mirror the AGRO release installer so that the site deploys again.

**Acceptance Criteria:**

- [ ] `scripts/oh-source.mjs` resolves the latest `mifunedev/agro` release tag by default, and `AGRO_SCRIPTS_REF` still overrides the tag.
- [ ] `scripts/sync-external-scripts.mjs` copies the release asset `install.sh` to `static/install.sh` and to `static/get-agro.sh`, and no source names `.agro/scripts/get-agro.sh`.
- [ ] `scripts/build-oh-cli.mjs` builds `static/agro.js` from the same release tag, and `static/agro.js` contains the version of that tag.
- [ ] After a deploy, `curl -fsSI https://agro.mifune.dev/install.sh` returns HTTP 200. Today the path returns HTTP 404 from GitHub Pages.
- [ ] `scripts/sync-external-scripts.mjs` contains no comment about a CDN redirect for `install.sh`.
- [ ] `pnpm test` and `pnpm build` exit 0.

### US-002: Sync the AGRO docs from the latest release

**Description:** As a self-hosting user, I want the AGRO pages to match the latest AGRO release so that each command works.

**Acceptance Criteria:**

- [ ] A prebuild script copies `docs/` from the latest `mifunedev/agro` release tag to `docs/agro/`, and git ignores `docs/agro/`.
- [ ] The script adds a `title` frontmatter field to each copied page that has none, from the first `#` heading.
- [ ] The script rewrites each relative link that leaves `docs/` to a `https://github.com/mifunedev/agro/blob/<tag>/<path>` URL.
- [ ] The repository holds no hand copy of a page that the sync script writes.
- [ ] `docusaurus.config.ts` sets `onBrokenLinks: "throw"`, and `pnpm build` exits 0.
- [ ] A test in `scripts/` covers the frontmatter step and the link rewrite.

### US-003: Make the Console the first path in the site structure

**Description:** As a visitor, I want the Console guide first and the self-host guide second so that I find my product.

**Acceptance Criteria:**

- [ ] The navbar shows "Console", "Self-host AGRO", "Blog", and "GitHub", in that order.
- [ ] `sidebars.ts` defines one sidebar for `docs/console/` and one sidebar for `docs/agro/`.
- [ ] `/docs` opens the Console introduction.
- [ ] Each earlier `/docs/<page>` URL of an AGRO page redirects to `/docs/agro/<page>`.
- [ ] Verify in browser using agent-browser skill.
- [ ] `pnpm build` exits 0.

### US-004: Rewrite the home page for both products

**Description:** As a first-time visitor, I want the home page to state both products and the current commands so that my first step works.

**Acceptance Criteria:**

- [ ] `src/pages/index.tsx` contains no `oh ` command, no `oh-sbx`, no `open-harness`, and no `get-agro.sh`.
- [ ] The hero links to the Console guide first and to the self-host guide second.
- [ ] The self-host quickstart block uses `npm install -g @mifune/agro` and the release `install.sh` command.
- [ ] The harness grid lists each harness in the AGRO catalog of the synced release.
- [ ] Each visible sentence passes the STE checker.
- [ ] Verify in browser using agent-browser skill.

### US-005: Write the Console getting-started guide

**Description:** As a new Console user, I want one guide from sign-in to a running free node so that I start without help.

**Acceptance Criteria:**

- [ ] `docs/console/intro.md` states what the Console is, who operates it, and that AI usage is not included.
- [ ] `docs/console/getting-started.md` covers GitHub sign-in, the personal and organization contexts, and the creation of a first free `n4` node.
- [ ] The guide covers the "After you connect" steps: `gh auth login`, `agro harness install <id> --host`, and the editor folder `/home/sandbox/.agro/workspaces/harness`.
- [ ] Each page passes the STE checker.

### US-006: Document nodes and their lifecycle

**Description:** As a Console user, I want each node action and its billing effect documented so that I control my cost.

**Acceptance Criteria:**

- [ ] `docs/console/nodes.md` covers Create, Rename, Restart, Pause, Resume, Rebuild, and Destroy, with the role that each action needs.
- [ ] The page states that Pause and Destroy stop billing, and that Rebuild changes the IPv4 address.
- [ ] The page lists the node specs `n4`, `n8`, `n16`, `n32`, and `n64`, and links to `https://mifune.dev/pricing` for prices.
- [ ] The page explains each node status that the Console shows to a user.
- [ ] Each page passes the STE checker.

### US-007: Document browser access and SSH

**Description:** As a Console user, I want to know each way to open a node so that I pick the right one.

**Acceptance Criteria:**

- [ ] `docs/console/connect.md` covers the browser editor, the browser terminal, the remote desktop, and SSH.
- [ ] The page marks the remote desktop as experimental and states that it runs over Tailscale.
- [ ] The page states that the SSH key is optional, and that a node with no key accepts no SSH connection.
- [ ] The page covers the key generation, the key paste, and the SSH command from the Connect menu.
- [ ] Each page passes the STE checker.

### US-008: Document snapshots

**Description:** As a Console user, I want to save and restore my workspace so that I recover from a mistake.

**Acceptance Criteria:**

- [ ] `docs/console/snapshots.md` covers Create, Replace, Restore, Delete, and the creation of a node from a snapshot.
- [ ] The page states that an archive snapshot restores only to a new node.
- [ ] The page uses the term "snapshot" and no "recovery point".
- [ ] Each page passes the STE checker.

### US-009: Document the free tier and billing

**Description:** As a Console user, I want the free-tier limits and the billing steps documented so that no charge surprises me.

**Acceptance Criteria:**

- [ ] `docs/console/free-tier.md` states one `n4` node, 24 running hours per UTC month, no card, the pause at the limit, the 60-day workspace retention, and "Continue on paid usage".
- [ ] `docs/console/billing.md` covers the card, the billing portal, the spend view, the unpaid-invoice block, and billing managers.
- [ ] Neither page states a monthly plan.
- [ ] Each page passes the STE checker.

### US-010: Document organizations and access

**Description:** As an organization admin, I want members, roles, and tokens documented so that I share access safely.

**Acceptance Criteria:**

- [ ] `docs/console/organizations.md` covers the creation of an organization, invitations, the three roles `viewer`, `operator`, and `admin`, and leaving or deleting an organization.
- [ ] The page has a table of the actions that each role can take.
- [ ] `docs/console/api-tokens.md` covers token creation and the `Authorization: Bearer` header.
- [ ] Each page passes the STE checker.

### US-011: Resolve the site-only pages

**Description:** As a visitor, I want each remaining site page to be current so that no page contradicts another.

**Acceptance Criteria:**

- [ ] `docs/property-testing.md` and `docs/agro-compatibility.md` are removed, with a redirect for each URL.
- [ ] `docs/open-core.md` names the Console and links to the Console guide.
- [ ] `docs/glossary.md`, `docs/model-selection.md`, and `docs/resources.md` contain no retired term that `scripts/check-docs-drift.mjs` lists.
- [ ] `docs/docker-deployment.md` and `docs/runtimes/docker.md` are merged into a synced AGRO page or removed, with a redirect for each URL.
- [ ] Each remaining site page passes the STE checker.

### US-012: Rewrite the 2026-05 and 2026-06 blog posts

**Description:** As a reader, I want each older post to use current names and commands so that I can follow it.

**Acceptance Criteria:**

- [ ] The five posts dated 2026-05-19 to 2026-06-16 contain no `oh ` command, no `.oh/`, no `oh.json`, and no "Open Harness" except one dated note on the former name.
- [ ] Each post keeps its URL.
- [ ] Each post passes the STE checker.

### US-013: Rewrite the 2026-07 blog posts and the archive

**Description:** As a reader, I want each recent post to state the current product so that no post makes a false claim.

**Acceptance Criteria:**

- [ ] The posts dated 2026-07-06 to 2026-07-11 and the post in `blog/archive/` use `agro` commands and current names.
- [ ] No post states that the Mifune Console is not a shipped service.
- [ ] Each post keeps its URL.
- [ ] Each post passes the STE checker.

### US-014: Guard the site against drift

**Description:** As a site maintainer, I want CI to stop a stale or unclear page so that the site stays aligned.

**Acceptance Criteria:**

- [ ] `scripts/check-docs-drift.mjs` lists `get-agro.sh` outside `static/`, `agro migrate`, `agro start`, `oh-sbx`, and the `oh <verb>` pattern in `src/pages/`.
- [ ] `.github/workflows/pages.yml` runs the drift check and the STE checker on `docs/console/`, the site pages, `src/pages/`, and `blog/`, and a failure stops the deploy.
- [ ] The workflow runs the STE checker from `mifunedev/agro` at the synced release tag.
- [ ] `pnpm test` covers each new drift rule.

### US-015: Manual review evidence

**Description:** As the operator, I want a recorded browser review of the site so that I accept the change from evidence.

**Acceptance Criteria:**

- [ ] Depends on US-001 through US-014.
- [ ] `.agro/tasks/docs-site-alignment/evidence/manual-review.md` holds annotated screenshots of the home page, the Console introduction, one Console guide page, one synced AGRO page, and one blog post, at 1280x720 and 414x896.
- [ ] Each screenshot of a changed page has a matching screenshot of the live site before the change.
- [ ] The run uses a local `pnpm build` and `pnpm serve`, and stops each process that the run starts.
- [ ] The run records that `/install.sh` and `/get-agro.sh` return the release installer.

## Summary

The repository `mifunedev/agro-web` builds the public, customer-facing docs site at `https://agro.mifune.dev`. The site will later become `docs.mifune.dev`. The site will document the Mifune Console first and self-hosted AGRO second.

Verified current state:

- The site has not deployed since 2026-10-03. Each daily build since 2026-10-04 fails, because `scripts/sync-external-scripts.mjs` requires `.agro/scripts/get-agro.sh`, and AGRO 0.16.2 renamed the file to `install.sh` (agro-web#69).
- `docs/` is a hand copy of the AGRO repo `docs/`, last synced on 2026-09-26 against AGRO 0.15.0. AGRO is now at v0.18.1. No script syncs the prose.
- The site documents `agro migrate` and `agro start`, which do not exist, and omits `agro sandbox upgrade` and the `fx` harness. The quickstart installs from `agro.mifune.dev/get-agro.sh`. The home page shows retired `oh` commands. The served CLI bundle is 0.15.1.
- The site has no Console page. `docs/open-core.md` names the Console once. A blog post states that the Cloud is not a shipped service.
- The AGRO repo `docs/` has 1 STE finding in 32 files. The site-only pages have 35 findings in 8 files. The blog has 192 findings in 8 files.

Operator decisions: the guide calls the product "Mifune Console". The guide documents the remote desktop as experimental. US-001 serves `/install.sh`, because no CDN rule serves the path now. The build syncs the AGRO pages from the latest release, so the AGRO repo stays the only source of those pages. One site holds a Console sidebar and a self-host sidebar, with the Console first. The domain move to `docs.mifune.dev` is a separate plan. The plan rewrites the blog posts and archives none.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
|---|---|---|
| `scripts/oh-source.mjs` | `REPO`, `REF`, `resolveSha` | Upstream repository and ref |
| `scripts/sync-external-scripts.mjs` | `SCRIPTS`, `syncOne` | Installer mirror |
| `scripts/build-oh-cli.mjs` | CLI bundle build | `static/agro.js` |
| `scripts/check-docs-drift.mjs` | `RETIRED`, `ALLOW`, `LEGACY_IDENTITY` | Retired-term guard |
| `docusaurus.config.ts` | `navbar`, `onBrokenLinks`, client redirects, docs preset | Site structure |
| `sidebars.ts` | autogenerated sidebar | Sidebars |
| `src/pages/index.tsx` | hero, quickstart, agent grid | Home page |
| `.github/workflows/pages.yml` | build and deploy jobs | CI and deploy |
| `mifunedev/agro` `docs/` | release tag | Source of the AGRO pages |
| `mifunedev/agro` `.agro/cli/src/lib/harnesses/catalog.ts` | harness catalog | Source of the harness grid |
| `mifunedev/agro-console` `apps/web/` | routes and components | Source of the Console guide facts |

## Interface Integration Points

| Surface | Change Type | Description |
|---|---|---|
| `/` | Modified | Home page for both products |
| `/docs` | Modified | Opens the Console introduction |
| `/docs/console/*` | Added | Console guide |
| `/docs/agro/*` | Added | Synced AGRO pages |
| `/docs/<page>` | Redirect | Earlier AGRO page URLs |
| `/blog/*` | Modified | Rewritten posts, same URLs |
| `/install.sh`, `/get-agro.sh` | Modified | Release installer |

## Storage

N/A. The site is static content and stores no data.

## Architectural Decisions

- **One source per product.** The AGRO repo `docs/` at the latest release tag is the source of the AGRO pages. The Console guide lives in `docs/console/`, and the Console code sets each fact in it.
- **Release, not branch.** The installer, the CLI bundle, the AGRO pages, and the harness grid come from one release tag, so the site never documents an unreleased behavior.
- **STE at the source.** The STE checker governs each hand-written page and each blog post. The AGRO repo applies STE to the synced pages.
- **Public content only.** The site states no internal hostname, endpoint, bucket, cost margin, runbook step, or source path of `agro-console`.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
|---|---|---|
| `scripts/*.test.mjs` | release-tag resolution, installer mirror | US-001 |
| `scripts/*.test.mjs` | frontmatter step, link rewrite | US-002 |
| `scripts/check-docs-drift.test.mjs` | each new drift rule | US-014 |
| `pnpm build` | broken links throw | US-002, US-003 |
| `bash .agro/skills/ste/scripts/ste-check.sh <files>` | each hand-written page and post | US-004 to US-013 |
| `.agro/tasks/docs-site-alignment/evidence/manual-review.md` | before and after screenshots | US-015 |

## Design Principles

- Write each page for a customer. The repository is public.
- Apply `/ste` to each page, each post, and each page string.
- Call the product "Mifune Console" on each page.
- Match the Console UI terms: Node, Snapshots, Keys, Members, Tokens, Billing, `viewer`, `operator`, `admin`, and `n4` to `n64`.
- Link to `https://mifune.dev/pricing` for prices instead of a copy of each price.
- Document only released behavior.

## Out of Scope

- The move to `docs.mifune.dev`, the repository rename (agro-web#69), and the DNS change.
- A change to the AGRO repo `docs/`, including the 1 STE finding in `docs/harnesses/pi.md`. The AGRO repo fixes the finding at the source.
- Console UI copy that contradicts the Console behavior. Examples: the first-run checklist names a monthly rate, and the spec picker says that Destroy is how you stop paying. An agro-console issue tracks the fix.
- Monthly billing, which the Console gates off, and the draft legal pages.
- Versioned docs for earlier AGRO releases.

## Open Questions

None.

## Acceptance Criteria

- [ ] The site builds and deploys from `main`.
- [ ] Each AGRO page matches the AGRO repo `docs/` at the latest release tag.
- [ ] The Console guide covers each user task in US-005 to US-010.
- [ ] No page, post, or page string names a retired command or a retired name, except a dated note on a former name.
- [ ] Each hand-written page and each post passes the STE checker.

## Lessons

Filled by the advisor before undraft.
