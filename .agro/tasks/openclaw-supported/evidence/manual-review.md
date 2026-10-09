# Manual review: OpenClaw as a supported harness (#77)

## Finding

`docs/agro/` is gitignored. `scripts/sync-agro-docs.mjs` generates `docs/agro/` at build time from the latest AGRO release.
The latest release is `v0.18.1`. Commit `e00e5a56` is not in `v0.18.1`, so `v0.18.1` has no `docs/harnesses/openclaw.md`.
The tracked change is the redirect and the landing entry. The OpenClaw page arrives with the first AGRO release that contains `e00e5a56`.

## Checks against the latest release (v0.18.1)

| Command | Exit status | Result |
| --- | --- | --- |
| `pnpm test` | 0 | 90 tests pass |
| `pnpm run check:docs-drift` | 0 | PASS, 26 files |
| `pnpm run check:ste` | 0 | no findings in 23 files |
| `pnpm build` | 1 | `You are trying to create client-side redirections to invalid paths. - /docs/agro/harnesses/openclaw` |

## Preview build against e00e5a56

Commands:

```
node --input-type=module -e 'import {syncAgroDocs} from "./scripts/sync-agro-docs.mjs"; await syncAgroDocs({resolve: async()=>"e00e5a561f6c05f3408f61b93bd1e7af8d636d60"});'
pnpm exec docusaurus build
node scripts/check-theme-script-order.mjs
```

| Command | Exit status | Result |
| --- | --- | --- |
| sync from `e00e5a56` | 0 | 32 pages; `openclaw.md` gets `sidebar_position: 18`, after `hermes.md` at 17 |
| `pnpm exec docusaurus build` | 0 | `[SUCCESS] Generated static files in "build".` |
| `node scripts/check-theme-script-order.mjs` | 0 | PASS |

## Browser review

The preview build ran in tmux session `aw77-serve` with `pnpm exec docusaurus serve --port 3077 --host 127.0.0.1 --no-open`. The session was killed after the review.

| Step | Result |
| --- | --- |
| Open `/docs/agro/harnesses/openclaw` | Title `OpenClaw \| AGRO`. H1 `OpenClaw`. The sidebar shows OpenClaw after Hermes. |
| Open `/docs/harnesses/openclaw` | Redirects to `/docs/agro/harnesses/openclaw` |
| Landing page entry | Text `OpenClaw OpenClaw is the gateway-first personal agent runtime.` after Hermes. The icon `/img/agents/openclaw.png` loads at natural width 180. |
| Click the landing entry | Opens `/docs/agro/harnesses/openclaw` |

## Landing order repair

The landing list matches the mifune.dev picker (mifunedev/website#76, commit `a890637`, `src/sections/AgentPickerSection.tsx`).
`static/img/agents/openclaw.png` is `https://openclaw.ai/apple-touch-icon.png`: a 180x180 PNG with sha256 `e8c7ce0a3a6c52bd904cc55e31a5b3a8b6392dcd70ba9e220ecf0ef1d6bd8c16`.

The browser reads this card order from the served preview build:

```
["Claude Code","Codex","OpenCode","Pi","Hermes","OpenClaw","Grok Build","Muse Code","Antigravity CLI","fx","T3 Code"]
```

| Command | Exit status | Result |
| --- | --- | --- |
| `pnpm test` | 0 | 90 tests pass |
| `pnpm run check:docs-drift` | 0 | PASS, 26 files |
| `pnpm run check:ste` | 0 | no findings in 23 files |
| sync from `e00e5a56`, then `pnpm exec docusaurus build` | 0 | `[SUCCESS] Generated static files in "build".` |
| `node scripts/check-theme-script-order.mjs` | 0 | PASS |

Screenshots:

- `openclaw-docs-page.png`
- `landing-openclaw-entry.png`
