import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { MirrorError } from "./oh-source.mjs";
import { buildFromResolvedCommit, checkoutExactCommit, runGit } from "./build-oh-cli.mjs";

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = join(dirname(SCRIPT), "..");
const BUILDER = join(dirname(SCRIPT), "build-oh-cli.mjs");

const gitQuiet = (args, cwd, opts = {}) => runGit(args, cwd, { capture: true, ...opts });

function gitOk(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")}: ${result.stderr || result.stdout || result.status}`);
  }
  return (result.stdout || "").trim();
}

function writeCli(dir, marker) {
  const cli = join(dir, ".agro", "cli");
  mkdirSync(cli, { recursive: true });
  writeFileSync(join(cli, "package.json"), `${JSON.stringify({
    name: "fixture-cli",
    version: "0.0.0",
    scripts: { build: "node ./build.mjs" },
  }, null, 2)}\n`);
  writeFileSync(join(cli, "package-lock.json"), `${JSON.stringify({
    name: "fixture-cli",
    lockfileVersion: 3,
    requires: true,
    packages: { "": { name: "fixture-cli" } },
  }, null, 2)}\n`);
  writeFileSync(join(cli, "marker.txt"), `${marker}\n`);
  writeFileSync(
    join(cli, "build.mjs"),
    `import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
mkdirSync("dist", { recursive: true });
const marker = readFileSync("marker.txt", "utf8").trim();
writeFileSync("dist/agro.js", "#!/usr/bin/env node\\nconsole.log(" + JSON.stringify(marker) + ")\\n");
`,
  );
}

function makeOrigin() {
  const dir = mkdtempSync(join(tmpdir(), "oh-cli-origin-"));
  gitOk(["init", "-b", "preview"], dir);
  gitOk(["config", "user.email", "t@example.test"], dir);
  gitOk(["config", "user.name", "fixture"], dir);
  gitOk(["config", "uploadpack.allowReachableSHA1InWant", "true"], dir);
  return dir;
}

function commitAll(dir, message) {
  gitOk(["add", "."], dir);
  gitOk(["commit", "-m", message], dir);
  return gitOk(["rev-parse", "HEAD"], dir);
}

test("builds the bundle from a SHA that is not a branch name", async () => {
  const origin = makeOrigin();
  const out = mkdtempSync(join(tmpdir(), "oh-cli-out-"));
  try {
    writeCli(origin, "PINNED_A");
    const sha = commitAll(origin, "a");
    gitOk(["branch", "-m", "preview", "other"], origin);
    const dests = [join(out, "agro.js"), join(out, "oh.js")];
    const result = await buildFromResolvedCommit({
      sha,
      originUrl: origin,
      dests,
      git: gitQuiet,
    });
    assert.equal(result.sha, sha);
    for (const dest of dests) {
      const body = readFileSync(dest, "utf8");
      assert.ok(body.startsWith("#!"), dest);
      assert.match(body, /PINNED_A/);
    }
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("a branch that moves after resolution still builds the resolved commit", async () => {
  const origin = makeOrigin();
  const out = mkdtempSync(join(tmpdir(), "oh-cli-out-"));
  try {
    writeCli(origin, "PINNED_A");
    const shaA = commitAll(origin, "a");
    writeCli(origin, "MOVED_B");
    const shaB = commitAll(origin, "b");
    assert.notEqual(shaA, shaB);
    assert.equal(gitOk(["rev-parse", "preview"], origin), shaB);
    const dests = [join(out, "agro.js"), join(out, "oh.js")];
    const fetched = [];
    const git = (args, cwd, opts = {}) => {
      if (args[0] === "fetch") fetched.push([...args]);
      return gitQuiet(args, cwd, opts);
    };
    await buildFromResolvedCommit({
      sha: shaA,
      originUrl: origin,
      dests,
      git,
    });
    assert.equal(fetched.length, 1);
    assert.equal(fetched[0].at(-1), shaA);
    assert.ok(!fetched[0].includes("--branch"));
    assert.ok(!fetched[0].includes("preview"));
    const body = readFileSync(dests[0], "utf8");
    assert.match(body, /PINNED_A/);
    assert.doesNotMatch(body, /MOVED_B/);
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("an injected checkout mismatch fails and writes no bundle", async () => {
  const origin = makeOrigin();
  const out = mkdtempSync(join(tmpdir(), "oh-cli-out-"));
  try {
    writeCli(origin, "PINNED_A");
    const sha = commitAll(origin, "a");
    const dests = [join(out, "agro.js"), join(out, "oh.js")];
    const git = (args, cwd, opts = {}) => {
      if (args[0] === "rev-parse" && args[1] === "HEAD") {
        return "0".repeat(40);
      }
      return gitQuiet(args, cwd, opts);
    };
    await assert.rejects(
      () => buildFromResolvedCommit({ sha, originUrl: origin, dests, git }),
      (err) => {
        assert.ok(err instanceof MirrorError);
        assert.match(err.message, /checkout mismatch/);
        assert.match(err.message, new RegExp(sha));
        return true;
      },
    );
    for (const dest of dests) assert.equal(existsSync(dest), false);
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("an unavailable commit fails and does not substitute main", async () => {
  const origin = makeOrigin();
  const out = mkdtempSync(join(tmpdir(), "oh-cli-out-"));
  try {
    writeCli(origin, "MAIN_ONLY");
    commitAll(origin, "main-content");
    gitOk(["branch", "-m", "preview", "main"], origin);
    const missing = "1".repeat(40);
    const dests = [join(out, "agro.js")];
    await assert.rejects(
      () => buildFromResolvedCommit({
        sha: missing,
        originUrl: origin,
        dests,
        git: gitQuiet,
      }),
      (err) => {
        assert.ok(err instanceof MirrorError);
        assert.match(err.message, /git fetch /);
        assert.ok(!err.message.includes("substitut"));
        return true;
      },
    );
    assert.equal(existsSync(dests[0]), false);
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("git calls use argument arrays", () => {
  const origin = makeOrigin();
  const dest = mkdtempSync(join(tmpdir(), "oh-cli-co-"));
  try {
    writeCli(origin, "PINNED_A");
    const sha = commitAll(origin, "a");
    const calls = [];
    const git = (args, cwd, opts = {}) => {
      assert.ok(Array.isArray(args), "git args must be an array");
      assert.equal(typeof args[0], "string");
      assert.ok(args.every((part) => typeof part === "string"));
      calls.push(args);
      return gitQuiet(args, cwd, opts);
    };
    checkoutExactCommit({ originUrl: origin, sha, dest, git });
    assert.ok(calls.some((args) => args[0] === "fetch" && args.includes(sha)));
    assert.ok(calls.every((args) => !args.includes("--branch")));
    assert.ok(calls.every((args) => !args.some((part) => part.includes(" && ") || part.includes(";"))));
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  }
});

test("a shell-metacharacter ref is rejected before git runs", () => {
  const pwned = join(tmpdir(), `oh-cli-pwned-${process.pid}`);
  rmSync(pwned, { force: true });
  const result = spawnSync(process.execPath, [BUILDER], {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      AGRO_SCRIPTS_REF: `main;touch ${pwned}`,
      OH_SCRIPTS_REF: "",
    },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not a valid ref/);
  assert.equal(existsSync(pwned), false);
});
