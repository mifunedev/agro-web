// Fails when a hand-written page, post, promo, or site page names something AGRO retired.
// Add a token to RETIRED in the same change that retires the command, file, or knob.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SCANNED = ["docs", "promos", "src/pages", "blog"];
export const SKIPPED = ["docs/agro"];
export const DATED_NOTE = /^Updated on \d{4}-\d{2}-\d{2}\. /;

const OH_VERBS = [
  "sandbox", "harness", "tool", "config", "gateway", "destroy", "langfuse", "secret", "vendor",
  "workspace", "stop", "shell", "self-upgrade", "ps", "update", "logs", "compose", "restart",
  "init", "runtime", "start", "migrate", "cron", "doctor", "status", "version", "help",
];

export const RETIRED = [
  {
    pattern: /\bmake\s+(sandbox|shell|destroy|ps|stop|restart|logs|config|gateway|help|harness-config)\b/g,
    name: "make <verb>",
    instead: "the equivalent `agro` verb — see docs/agro/lifecycle-commands.md",
  },
  {
    pattern: /\.env\.example\b|\benv\.example\b/g,
    name: ".env.example",
    instead: "`agro.json` for non-secrets and root `.example.env` for secret names",
  },
  {
    pattern: /\b(WORKTREES_DIR|PROJECTS_DIR|CRONS_DIR)\b/g,
    name: "a retired layout knob",
    instead: "the fixed layout: .worktrees/, projects/, crons/ at the repo root",
  },
  {
    pattern: /no host CLI/gi,
    name: '"no host CLI"',
    instead: "the truth: `agro` is a host CLI and the only lifecycle door",
  },
  {
    pattern: /\bharness\.yaml\b/g,
    name: "harness.yaml",
    instead: "`agro.json`",
  },
  {
    pattern: /\b(claude-auth|codex-auth|pi-auth|opencode-auth|grok-auth|deepagents-auth|herdr-data|cloudflared-auth)\b/g,
    name: "a retired per-tool volume",
    instead: "the single `/home/sandbox` mount — see docs/agro/installation.md",
  },
  {
    pattern: /\boh_workspace\b/g,
    name: "oh_workspace",
    instead: "the single `/home/sandbox` mount, managed as `<sandbox-name>_workspace` unless `storage.homePath` binds it",
  },
  {
    pattern: /\bprojectRoot\b|\bOH_PROJECT_ROOT\b/g,
    name: "projectRoot / OH_PROJECT_ROOT",
    instead: "the fixed checkout path `/home/sandbox/harness`",
  },
  {
    pattern: /\boh init\b|\bopenharness init\b/g,
    name: "oh init",
    instead: "`agro vendor` to equip a checkout with .agro/ + crons/, or `agro sandbox install docker` to create a sandbox",
  },
  {
    pattern: /\boh runtime\b/g,
    name: "oh runtime",
    instead: "`agro sandbox --help` (catalog), `agro sandbox install docker` (provision), `agro tool install microsandbox` (msb)",
  },
  {
    pattern: /\boh sandbox\b(?!\s+(?:install|list)\b|\s+--help\b|\s+<)/g,
    name: "bare `oh sandbox`",
    instead: "`agro sandbox install docker [--name <name>] [--repo <dir>]`, or `agro sandbox list`",
  },
  {
    pattern: /--persist-only\b|--no-persist\b/g,
    name: "--persist-only / --no-persist",
    instead: "plain `agro harness install <id>` / `agro tool install <id>` — agro.json carries no install field",
  },
  {
    pattern: /\binstall\.(?:\*|(?:opencode|grokBuild|grok_build|deepagents|hermes|agentBrowser)\b)|"install"\s*:/g,
    name: "an install.* key",
    instead: "`agro harness install <id>` or `agro tool install <id>`; agro.json holds no install field",
  },
  {
    pattern: /\bINSTALL_(?:OPENCODE|GROK_BUILD|DEEPAGENTS|HERMES|AGENT_BROWSER)\b/g,
    name: "an INSTALL_* build flag",
    instead: "`agro harness install <id>` / `agro tool install <id>` into the running sandbox",
  },
  {
    pattern: /\bHERMES_DASHBOARD(?:_PORT)?=/g,
    name: "a HERMES_DASHBOARD env flag",
    instead: "`agro config set hermesDashboard.enabled true` and `hermesDashboard.port` — see docs/agro/harnesses/hermes.md",
  },
  {
    pattern: /\bcron-watchdog\b|\bcron-system\b(?!-)|\bsystem-cron\b|\bCRON_WATCHDOG_INTERVAL\b|\/tmp\/cron-watchdog[.\w]*|\brestart-openharness-tmux\.sh\b/g,
    name: "the retired tmux cron supervision",
    instead:
      "`agro-cron.service` under systemd — `systemctl reload|restart|status agro-cron.service`; per-fire `tmux: true` sessions are unchanged",
  },
  {
    pattern: /\bsleep infinity\b|^\s*init:\s*true\b|--init\b|\bentrypoint:\s*\/usr\/local\/bin\/entrypoint\.sh/gm,
    name: "the pre-systemd container lifecycle",
    instead:
      "the image's own `CMD [\"/sbin/init\"]` plus `--cgroupns private --cap-add SYS_ADMIN --security-opt apparmor=unconfined --tmpfs /run --tmpfs /run/lock --tmpfs /sys/fs`",
  },
  {
    pattern: /\bgvisor\b|\brunsc\b/gi,
    name: "gvisor",
    instead: "the catalog is docker (provisionable) and microsandbox (planned) — see docs/agro/runtimes/overview.md",
  },
  {
    pattern: /\bFlavor [AB]\b/g,
    name: "Flavor A/B",
    instead: "`agro sandbox install docker` (published image) versus `--repo <dir>` (bind-mounted checkout)",
  },
  {
    pattern: /\bpre-?installed\b|\binstalled by default\b/gi,
    name: '"preinstalled"',
    instead: "nothing installs at boot; `agro harness install <id>` / `agro tool install <id>` are the only door",
  },
  {
    pattern: /\bpi-autoresearch\b|\/(?:skill:)?autoresearch\b/g,
    name: "pi-autoresearch",
    instead: "nothing — the package is no longer part of the harness; see docs/agro/harnesses/pi.md for the default Pi packages",
  },
  {
    pattern: /(?<![\w./-])\/(?:spec|retro)\b(?![\w-])|\/wiki compile\b|\bskills\/(?:spec|retro)\//g,
    name: "a retired /spec, /retro, or /wiki compile skill",
    instead:
      "the core chain: `/prd` → draft PR → `/delegate` → ready PR; the advisor accepts each story in `prd.json`, a human merges, and each plan's `## Lessons` records lessons",
  },
  {
    pattern: /\bget-oh\.sh\b/g,
    name: "get-oh.sh",
    instead: "`install.sh` — https://agro.mifune.dev/install.sh",
  },
  {
    pattern: /\/home\/sandbox\/project\b/g,
    name: "/home/sandbox/project",
    instead: "the fixed checkout path `/home/sandbox/harness`",
  },
  {
    pattern: /\bOH_JS_URL\b/g,
    name: "OH_JS_URL",
    instead: "`AGRO_JS_URL` (default https://github.com/mifunedev/agro/releases/latest/download/agro.js)",
  },
  {
    pattern: /\bget-agro\.sh\b/g,
    name: "get-agro.sh",
    instead: "`install.sh` — https://agro.mifune.dev/install.sh",
  },
  {
    pattern: /\bagro migrate\b/g,
    name: "agro migrate",
    instead: "`agro sandbox upgrade <name> --version <X.Y.Z>` — see docs/agro/lifecycle-commands.md",
  },
  {
    pattern: /\bagro start\b/g,
    name: "agro start",
    instead: "`agro sandbox install docker` to create a sandbox, or `agro restart [name]`",
  },
  {
    pattern: /\boh-sbx\b/g,
    name: "oh-sbx",
    instead: "`agro-sbx-1`, the default sandbox name",
  },
  {
    pattern: new RegExp(`(?<![\\w./-])oh\\s+(?:${OH_VERBS.join("|")})\\b`, "g"),
    name: "oh <verb>",
    instead: "the same verb on `agro`; the `oh` alias is retired",
    scope: ["docs", "src/pages", "blog"],
  },
];

export const ALLOW = [
  {
    file: "blog/2026-07-11-deploy-open-harness-with-docker.md",
    token: "an INSTALL_* build flag",
    why: "the post says that the INSTALL_HERMES setting is gone",
  },
  {
    file: "blog/2026-07-11-deploy-open-harness-with-docker.md",
    token: "the pre-systemd container lifecycle",
    why: "the post names the July 2026 Compose file to say that it is retired",
  },
];

const LEGACY_IDENTITY = {
  pattern: /\boh\.mifune\.dev\b|(?<!ghcr\.io\/)\bmifunedev\/openharness(?:-web)?\b/g,
  name: "the pre-AGRO host or repository name",
  instead: "agro.mifune.dev, mifunedev/agro, or mifunedev/agro-web — or name it as a compatibility alias on that line or under a compatibility heading",
  scope: ["docs", "src/pages", "blog"],
};
const COMPATIBILITY = /compatibility/i;
const HEADING = /^(#{1,6})\s/;
const FENCE = /^\s*(```|~~~)/;
const SCANNED_EXTENSIONS = [".md", ".mdx", ".json", ".tsx"];

const under = (rel, dirs) => dirs.some((dir) => rel === dir || rel.startsWith(dir + "/"));

export const isScanned = (rel) =>
  under(rel, SCANNED) && !under(rel, SKIPPED) && SCANNED_EXTENSIONS.some((ext) => rel.endsWith(ext));

function compatibilityLines(lines) {
  const exempt = new Set();
  let sectionLevel = 0;
  let inFence = false;
  lines.forEach((line, i) => {
    if (FENCE.test(line)) inFence = !inFence;
    const heading = inFence ? null : HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (COMPATIBILITY.test(line)) sectionLevel = level;
      else if (sectionLevel && level <= sectionLevel) sectionLevel = 0;
    }
    if (sectionLevel || COMPATIBILITY.test(line)) exempt.add(i);
  });
  return exempt;
}

const allowed = (rel, token) =>
  ALLOW.some((a) => (rel === a.file || rel.endsWith("/" + a.file)) && a.token === token);

export function findDrift(rel, text) {
  if (!isScanned(rel)) return [];
  const lines = text.split("\n");
  const datedNote = (i) => under(rel, ["blog"]) && DATED_NOTE.test(lines[i].trim());
  const legacyExempt = compatibilityLines(lines);
  const violations = [];
  const scan = ({ pattern, name, instead, scope }, skip) => {
    if (scope && !under(rel, scope)) return;
    if (allowed(rel, name)) return;
    lines.forEach((line, i) => {
      if (datedNote(i) || skip(i)) return;
      pattern.lastIndex = 0;
      const hit = pattern.exec(line);
      if (hit) violations.push({ file: rel, line: i + 1, name, match: hit[0], instead, text: line.trim() });
    });
  };
  for (const rule of RETIRED) scan(rule, () => false);
  scan(LEGACY_IDENTITY, (i) => legacyExempt.has(i));
  return violations;
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  const pages = SCANNED.flatMap((name) => walk(join(ROOT, name)))
    .map((path) => ({ path, rel: relative(ROOT, path) }))
    .filter(({ rel }) => isScanned(rel));
  const violations = pages.flatMap(({ path, rel }) => findDrift(rel, readFileSync(path, "utf8")));
  const where = SCANNED.map((d) => `${d}/`).join(", ");

  if (violations.length > 0) {
    console.error(`[docs-drift] ${violations.length} retired reference(s) in ${where}:\n`);
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line} — ${v.name}: "${v.match}"`);
      console.error(`    ${v.text.length > 100 ? v.text.slice(0, 100) + "…" : v.text}`);
      console.error(`    use instead: ${v.instead}\n`);
    }
    console.error("[docs-drift] AGRO retired these. A page that names one tells a reader to run");
    console.error("[docs-drift] something that no longer exists. If a page names one to say that it");
    console.error("[docs-drift] is retired, add a per-file, per-token entry to ALLOW.");
    process.exit(1);
  }

  console.log(`[docs-drift] PASS — ${pages.length} file(s) under ${where} (skipping ${SKIPPED.map((d) => `${d}/`).join(", ")}), no retired references`);
}
