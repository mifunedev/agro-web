# Open Harness Web

Docusaurus documentation site for [Open Harness](https://github.com/mifunedev/agro), published at <https://oh.mifune.dev>.

## Develop

```bash
pnpm install
pnpm start
pnpm build
```

## Content

- `docs/` — product and operator documentation mirrored from the Open Harness repo at extraction time.
- `blog/` — long-form Open Harness posts.
- `src/` + `static/` — Docusaurus theme, landing page, and assets.

The Open Harness core repo now keeps concise GitHub-readable markdown and points readers here/DeepWiki for the rendered site experience.

## Drift and prose checks

Each build runs two checks before `pnpm run build`, and a failure stops the deploy.
`pnpm run check:docs-drift` fails when `docs/`, `blog/`, `promos/`, or `src/pages/`
names a command, file, or setting that AGRO retired. It skips `docs/agro/`, which
the build syncs from the AGRO release. `pnpm run check:ste` runs the STE checker
from the synced AGRO release on `docs/*.md`, `docs/console/`, `blog/`, and the
visible text of `src/pages/*.tsx`. When AGRO retires a command, add the command
to `RETIRED` in `scripts/check-docs-drift.mjs` in the same change.

```bash
pnpm run check:docs-drift
pnpm run check:ste
```

## The script mirror

Four paths under the site root serve executable content that users pipe into a
shell. The build copies each one from a GitHub Release asset of `mifunedev/agro`.

| URL | Written by | Release asset |
| --- | --- | --- |
| `/install.sh` | `scripts/sync-external-scripts.mjs` → `static/install.sh` | `install.sh` |
| `/get-agro.sh` | `scripts/sync-external-scripts.mjs` → `static/get-agro.sh` | `install.sh` |
| `/agro.js` | `scripts/build-oh-cli.mjs` → `static/agro.js` | `agro.js` |
| `/oh.js` | `scripts/build-oh-cli.mjs` → `static/oh.js` | `agro.js` |

Both scripts resolve the repo and the release tag through `scripts/oh-source.mjs`.
The repo defaults to **`mifunedev/agro`** and the tag to its **latest release**.
Set `AGRO_SCRIPTS_REF` to a release tag (for example `v0.18.1`) to mirror that
release instead. `AGRO_GITHUB_REPO` sets the repo. The `OH_*` names still work;
the `AGRO_*` names win when both are set. A ref that is not a release tag fails the
build. The build log names the release asset URL of each file.

`scripts/sync-agro-docs.mjs` copies `docs/` of the same release to the gitignored `docs/agro/`.

All four artifacts are gitignored. They exist only as build output, so the deployed
site is always as fresh as its last successful build.

**A failed mirror fails the build.** A missing asset, a tag that does not resolve, a
body without a shebang, or an `agro.js` that does not contain the tag's version all
exit non-zero rather than deploying. Only a transient network failure (DNS, TCP,
5xx, rate limit) warns and keeps the previously published artifact, and even that is
fatal when no previous artifact exists.

### Refreshing the mirror

The site rebuilds on push to `main`, on a daily schedule, on manual
`workflow_dispatch` (whose optional `ref` input names a release tag), and on a `repository_dispatch` of
type `agro-release` (the legacy `openharness-release` type still works):

```bash
gh api repos/mifunedev/agro-web/dispatches \
  -f event_type=agro-release \
  -F 'client_payload[ref]=v0.18.1'
```

Sending that dispatch from the harness repo's release workflow is a follow-up on the
harness side, not part of this repo.
