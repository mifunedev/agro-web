// Build the standalone CLI bundle from the canonical harness repo and place it
// at static/agro.js and static/oh.js, so GitHub Pages serves it at
// https://oh.mifune.dev/agro.js and https://oh.mifune.dev/oh.js. `get-agro.sh`
// and `get-oh.sh` download this prebuilt bundle instead of building on the host.
//
// Runs as part of the `prebuild` hook. A failure to produce a fresh bundle FAILS
// the build. `oh` is the only door into Open Harness: a silently skipped build
// means every `curl … | bash` install keeps getting the previous bundle, which is
// how the published CLI fell weeks behind its own documentation. Only genuinely
// transient network failures warn and keep the previously published artifact.
import { spawnSync } from "node:child_process";
import {
  mkdtempSync, rmSync, copyFileSync, existsSync, readFileSync, mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { REPO, REF, MirrorError, reportAndExit, resolveSha, gitUrlFor, assertSafeRef } from "./oh-source.mjs";

const TAG = "build-oh-cli";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DESTS = ["agro.js", "oh.js"].map((name) => join(ROOT, "static", name));
const CLI_DIRS = [".agro/cli", ".oh/cli"];
const BUNDLE_NAMES = ["agro.js", "oh.js"];

const firstExisting = (dir, candidates, probe) =>
  candidates.find((candidate) => existsSync(join(dir, probe(candidate))));

export function runGit(args, cwd, { capture = false } = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) {
    throw new MirrorError(`git ${args.join(" ")} failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = `${result.stderr || result.stdout || ""}exit ${result.status}`.trim();
    throw new MirrorError(`git ${args.join(" ")} failed: ${detail}`);
  }
  return capture ? (result.stdout || "").trim() : "";
}

export function runNpm(args, cwd) {
  const result = spawnSync("npm", args, {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) {
    throw new MirrorError(`npm ${args.join(" ")} failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new MirrorError(`npm ${args.join(" ")} failed: exit ${result.status}`);
  }
}

export function checkoutExactCommit({ originUrl, sha, dest, git = runGit }) {
  assertSafeRef(sha, "commit");
  sha = sha.toLowerCase();
  mkdirSync(dest, { recursive: true });
  git(["init", "-b", "src"], dest);
  git(["remote", "add", "origin", originUrl], dest);
  git(["fetch", "--depth", "1", "origin", sha], dest);
  git(["checkout", "--detach", "FETCH_HEAD"], dest);
  const head = git(["rev-parse", "HEAD"], dest, { capture: true });
  if (head !== sha) {
    throw new MirrorError(`checkout mismatch: resolved ${sha}, checked out ${head}`);
  }
  return head;
}

function installCliDeps(cli, npm) {
  if (!existsSync(join(cli, "package-lock.json"))) {
    throw new MirrorError(`no package-lock.json in ${cli}; refusing to install without a lockfile`);
  }
  npm(["ci", "--no-audit", "--no-fund"], cli);
  npm(["run", "build"], cli);
}

export async function buildFromResolvedCommit({
  sha: shaOption,
  originUrl = gitUrlFor(),
  dests = DESTS,
  git = runGit,
  npm = runNpm,
  workDir,
  resolve = resolveSha,
} = {}) {
  let work;
  try {
    const sha = shaOption ?? await resolve();
    if (!sha) throw new MirrorError(`ref ${REPO}@${REF} resolved to an empty SHA`);
    console.log(`[${TAG}] source ${REPO}@${REF} pinned to ${sha}`);

    work = workDir ?? mkdtempSync(join(tmpdir(), "oh-cli-build-"));
    const src = join(work, "src");
    const cloned = checkoutExactCommit({ originUrl, sha, dest: src, git });

    const cliDir = firstExisting(src, CLI_DIRS, (dir) => join(dir, "package.json"));
    if (!cliDir) throw new MirrorError(`none of ${CLI_DIRS.join(", ")} found in ${REPO}@${cloned}`);
    const cli = join(src, cliDir);
    installCliDeps(cli, npm);
    const bundleName = firstExisting(cli, BUNDLE_NAMES, (name) => join("dist", name));
    if (!bundleName) throw new MirrorError(`build did not produce dist/${BUNDLE_NAMES.join(" or dist/")}`);
    const built = join(cli, "dist", bundleName);
    if (!readFileSync(built, "utf8").startsWith("#!")) throw new MirrorError(`built ${bundleName} has no shebang`);
    for (const dest of dests) {
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(built, dest);
      console.log(`[${TAG}] wrote ${basename(dest)} <- ${REPO}@${cloned} (${cliDir}/dist/${bundleName})`);
    }
    return { sha: cloned, dests };
  } finally {
    if (work && work !== workDir) rmSync(work, { recursive: true, force: true });
  }
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  try {
    await buildFromResolvedCommit();
  } catch (err) {
    reportAndExit(TAG, err, DESTS);
  }
}
