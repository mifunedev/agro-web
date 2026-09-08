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
import { execSync } from "node:child_process";
import {
  mkdtempSync, rmSync, copyFileSync, existsSync, readFileSync, mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { REPO, REF, MirrorError, reportAndExit, resolveSha } from "./oh-source.mjs";

const TAG = "build-oh-cli";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTS = ["agro.js", "oh.js"].map((name) => join(ROOT, "static", name));
const CLI_DIRS = [".agro/cli", ".oh/cli"];
const BUNDLE_NAMES = ["agro.js", "oh.js"];

const firstExisting = (dir, candidates, probe) =>
  candidates.find((candidate) => existsSync(join(dir, probe(candidate))));

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit" });
const capture = (cmd, cwd) => execSync(cmd, { cwd, encoding: "utf8" }).trim();

let work;
try {
  // Resolving the ref first separates "GitHub is unreachable" from "that ref does
  // not exist", which a bare `git clone` failure conflates.
  const sha = await resolveSha();
  console.log(`[${TAG}] source ${REPO}@${REF} (${sha})`);

  work = mkdtempSync(join(tmpdir(), "oh-cli-build-"));
  run(`git clone --depth 1 --branch ${REF} https://github.com/${REPO}.git src`, work);
  const src = join(work, "src");
  const cloned = capture("git rev-parse HEAD", src);
  if (cloned !== sha) console.warn(`[${TAG}] ref moved during build: resolved ${sha}, cloned ${cloned}`);

  const cliDir = firstExisting(src, CLI_DIRS, (dir) => join(dir, "package.json"));
  if (!cliDir) throw new MirrorError(`none of ${CLI_DIRS.join(", ")} found in ${REPO}@${REF}`);
  const cli = join(src, cliDir);
  run("npm install --no-audit --no-fund", cli);
  run("npm run build", cli);
  const bundleName = firstExisting(cli, BUNDLE_NAMES, (name) => join("dist", name));
  if (!bundleName) throw new MirrorError(`build did not produce dist/${BUNDLE_NAMES.join(" or dist/")}`);
  const built = join(cli, "dist", bundleName);
  if (!readFileSync(built, "utf8").startsWith("#!")) throw new MirrorError(`built ${bundleName} has no shebang`);
  for (const dest of DESTS) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(built, dest);
    console.log(`[${TAG}] wrote static/${basename(dest)} <- ${REPO}@${REF} (${cloned}, ${cliDir}/dist/${bundleName})`);
  }
} catch (err) {
  reportAndExit(TAG, err, DESTS);
} finally {
  if (work) rmSync(work, { recursive: true, force: true });
}
