# PRD: Add annotated screenshots to the Console guide

Status: DRAFT

## User Stories

### US-001: Prepare a local Console with demo data

**Description:** As a docs maintainer, I want a local Console at release v1.8.1 with demo data. Then each screenshot shows the released UI and no real customer data.

**Acceptance Criteria:**

- [ ] A local Console runs from the `v1.8.1` tag of `mifunedev/agro-console`, in its own worktree.
- [ ] The demo data lives in a separate local database. The run does not change the development database of the operator.
- [ ] The demo data has one personal space and one organization, with the three roles `viewer`, `operator`, and `admin`.
- [ ] The demo data has nodes in the statuses **Running**, **Paused**, **Creating VM**, and **Failed**, one free node with used free hours, one paid node with a snapshot, and one destroyed node with a snapshot.
- [ ] Each IPv4 address in the demo data is in the documentation range `192.0.2.0/24`. Each email address is in the `example.com` domain.
- [ ] The capture tooling (demo-data script and capture list) lives in the private `mifunedev/agro-console` repo, in a pull request to `development` with its own issue.
- [ ] The run creates no VM at a cloud provider and no live payment. The run uses only the Stripe test mode.
- [ ] A teardown step stops each process and deletes the local demo data.

### US-002: Add screenshots to the getting-started guide

**Description:** As a new Console user, I want to see each step of the first sign-in and the first free node. Then I find each control.

**Acceptance Criteria:**

- [ ] `docs/console/getting-started.md` shows the sign-in page, the context switcher, the **Create your free node** page, and a running free node.
- [ ] Each image is a PNG at 1280x720 in `static/img/console/`, with a name of the form `<page>-<step>.png`.
- [ ] Each image has alt text, and a `Callouts:` line under it that names each numbered callout.
- [ ] Each callout points at the control that the step names, with the label text from the UI.
- [ ] Verify in browser using agent-browser skill.

### US-003: Add screenshots to the nodes and connect pages

**Description:** As a Console user, I want to see the node actions and the Connect menu so that I pick the correct control.

**Acceptance Criteria:**

- [ ] `docs/console/nodes.md` shows the **Nodes** page, the node page with its action buttons, and one status in progress.
- [ ] `docs/console/connect.md` shows the open Connect menu, the **SSH** dialog, and the **Add SSH key** dialog.
- [ ] Each image follows the file, size, alt-text, and `Callouts:` rules of US-002.
- [ ] Verify in browser using agent-browser skill.

### US-004: Add screenshots to the snapshots and free-tier pages

**Description:** As a Console user, I want to see the snapshot card and the free-hours cards so that I recognize each state.

**Acceptance Criteria:**

- [ ] `docs/console/snapshots.md` shows the **Snapshot** card and the **Snapshots** page.
- [ ] `docs/console/free-tier.md` shows the free-hours values on the node page and the **Free hours used for this month** card of a paused free node.
- [ ] Each image follows the file, size, alt-text, and `Callouts:` rules of US-002.
- [ ] Verify in browser using agent-browser skill.

### US-005: Add screenshots to the billing, organizations, and API tokens pages

**Description:** As an organization admin, I want to see the billing, member, and token pages so that I find each setting.

**Acceptance Criteria:**

- [ ] `docs/console/billing.md` shows the **Billing** page and the **Usage & spend** view.
- [ ] `docs/console/organizations.md` shows the **Members** page and the invite dialog.
- [ ] `docs/console/api-tokens.md` shows the **API tokens** page and the **Token created** dialog.
- [ ] The **Token created** screenshot shows a token from the local Console only, and the run revokes that token before the teardown.
- [ ] Each image follows the file, size, alt-text, and `Callouts:` rules of US-002.
- [ ] Verify in browser using agent-browser skill.

### US-006: Guard the images

**Description:** As a docs maintainer, I want CI to stop a missing image or a missing callout line so that each guide page stays complete.

**Acceptance Criteria:**

- [ ] A test in `scripts/` fails when an image link in `docs/console/` names a file that does not exist in `static/img/console/`.
- [ ] The test fails when an image in `docs/console/` has no alt text, or has no `Callouts:` line within the next 3 lines.
- [ ] The test fails when a file in `static/img/console/` has no reference from `docs/console/`.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm run check:docs-drift`, and `pnpm run check:ste` exit 0.

### US-007: Manual review evidence

**Description:** As the operator, I want a recorded browser review of each Console page with its images so that I accept the change from evidence.

**Acceptance Criteria:**

- [ ] Depends on US-002 through US-006.
- [ ] `.agro/tasks/console-guide-screenshots/evidence/manual-review.md` holds an annotated screenshot of each of the 8 changed Console pages at 1280x720 and 414x896.
- [ ] The review confirms that each image loads, and that no image shows a real name, a real email address, a real IP address, or a live payment detail.
- [ ] The run uses a local `pnpm build` and `pnpm serve`, and stops each process that the run starts.

## Summary

The Console guide on `https://agro.mifune.dev` has 9 pages of text and no image. A reader must find each control from its label alone. PR #71 adds the guide. This task starts after PR #71 merges.

Operator decisions:

- The screenshots come from a local Console at release `v1.8.1` with demo data. The screenshots show no real user, no real IP address, and no billing data.
- The AGRO self-host pages get screenshots in a later task, in the `mifunedev/agro` repo `docs/`. The site sync copies those pages, so this task changes no file in `docs/agro/`.

Verified facts:

- The Console repo has a local development mode with a development sign-in, a seed command for one organization, and a command that creates a session cookie for a headless browser. The seed creates no node.
- The local development mode can provision real VMs. The demo data must therefore insert node rows directly, and the run must not start the provisioner.
- `annotate-screenshot.sh` adds numbered callouts and prints the `Callouts:` line for each screenshot.
- The site serves images from `static/img/`. The blog already uses `/img/blog/<post>/<file>` links.

## Key Integration Points

| File | Function(s) / Symbol(s) | Role |
|---|---|---|
| `docs/console/*.md` | image links, `Callouts:` lines | Guide pages |
| `static/img/console/` | PNG files | Image source |
| `scripts/*.test.mjs` | image guard | US-006 |
| `.github/workflows/pages.yml` | `pnpm test` step | Runs the guard |
| `/home/sandbox/harness/.agro/skills/agent-browser/scripts/annotate-screenshot.sh` | callouts | Capture |
| `mifunedev/agro-console` at `v1.8.1` | local development mode, seed command | Capture environment |
| `mifunedev/agro-console` capture tooling | demo-data script, capture list | US-001, in a private pull request |

## Interface Integration Points

| Surface | Change Type | Description |
|---|---|---|
| `/docs/console/*` | Modified | Each page gets annotated screenshots |
| `/img/console/*.png` | Added | Screenshot files |

## Storage

The screenshots are PNG files in `static/img/console/`. The demo data lives only in the local Postgres of the capture run, and the teardown deletes the demo data.

## Architectural Decisions

- **Released UI only.** The capture runs the `v1.8.1` tag. A later Console release that changes a captured screen needs a new capture.
- **No real data.** The demo data uses the documentation IP range and the `example.com` domain. The run starts no provisioner and makes no live payment.
- **Public repo.** The agro-web repo is public. The plan, the images, and the alt text name no internal hostname, no Console source path, and no Console database detail.
- **One image source.** Each image file has one guide page that links it.

## Test Plan (TDD)

| Test File | Case(s) | Validates |
|---|---|---|
| `scripts/console-images.test.mjs` | missing file, missing alt text, missing `Callouts:` line, unreferenced file | US-006 |
| `pnpm build` | broken image link | US-002 to US-005 |
| `pnpm run check:ste` | prose and `Callouts:` lines | US-002 to US-005 |
| `.agro/tasks/console-guide-screenshots/evidence/manual-review.md` | each page with its images | US-007 |

## Design Principles

- Show the control that the step names. Put one callout on each value that the reader checks.
- Keep each image at 1280x720, so the text in the image stays readable.
- Apply `/ste` to each sentence and each `Callouts:` line.
- Document only released behavior.

## Out of Scope

- Screenshots of the AGRO self-host pages. A later task adds them in `mifunedev/agro` `docs/`.
- Dark-mode screenshots and mobile screenshots in the guide pages.
- A change to the Console UI copy.
- A capture against `console.mifune.dev`.

## Open Questions

None. The operator accepted the recommendation: the capture tooling lives in the private `mifunedev/agro-console` repo.

## Acceptance Criteria

- [ ] Each of the 8 Console guide pages after the introduction shows at least one annotated screenshot.
- [ ] Each image shows the `v1.8.1` UI with demo data only.
- [ ] CI fails on a missing image, a missing alt text, a missing `Callouts:` line, or an unreferenced image file.
- [ ] Each changed page passes the STE checker.

## Lessons

Filled by the advisor before undraft.
