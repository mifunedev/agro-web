import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { MirrorError, rawBaseFor } from "./oh-source.mjs";
import { SCRIPTS, syncFromResolvedCommit } from "./sync-external-scripts.mjs";

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = join(dirname(SCRIPT), "..");
const SYNC = join(dirname(SCRIPT), "sync-external-scripts.mjs");

function gitOk(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")}: ${result.stderr || result.stdout || result.status}`);
  }
  return (result.stdout || "").trim();
}

function writeScripts(dir, marker) {
  const scripts = join(dir, ".agro", "scripts");
  mkdirSync(scripts, { recursive: true });
  writeFileSync(join(scripts, "get-agro.sh"), `#!/bin/sh\necho ${marker}-agro\n`);
  writeFileSync(join(scripts, "get-oh.sh"), `#!/bin/sh\necho ${marker}-oh\n`);
}

function makeOrigin() {
  const dir = mkdtempSync(join(tmpdir(), "oh-sync-origin-"));
  gitOk(["init", "-b", "preview"], dir);
  gitOk(["config", "user.email", "t@example.test"], dir);
  gitOk(["config", "user.name", "fixture"], dir);
  return dir;
}

function commitAll(dir, message) {
  gitOk(["add", "."], dir);
  gitOk(["commit", "-m", message], dir);
  return gitOk(["rev-parse", "HEAD"], dir);
}

function gitShow(origin, sha, path) {
  const result = spawnSync("git", ["show", `${sha}:${path}`], { cwd: origin, encoding: "utf8" });
  if (result.status !== 0) return null;
  return result.stdout;
}

function stubFetch(origin, resolvedSha) {
  const requested = [];
  const fetchImpl = async (url) => {
    const href = String(url);
    requested.push(href);
    if (/\/repos\/[^/]+\/[^/]+\/commits\//.test(href)) {
      return new Response(resolvedSha, { status: 200 });
    }
    const raw = href.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/([^/]+)\/(.+)$/);
    if (!raw) return new Response("missing", { status: 404 });
    const [, ref, path] = raw;
    if (ref !== resolvedSha) {
      return new Response("#!/bin/sh\necho MOVING_REF\n", { status: 200 });
    }
    const body = gitShow(origin, ref, path);
    if (body == null) return new Response("missing", { status: 404 });
    return new Response(body, { status: 200 });
  };
  return { fetchImpl, requested };
}

test("Pages script endpoints stay get-agro.sh and get-oh.sh, with no install.sh", () => {
  assert.deepEqual(
    SCRIPTS.map((script) => script.dest),
    ["static/get-agro.sh", "static/get-oh.sh"],
  );
  assert.ok(SCRIPTS.every((script) => !script.dest.includes("install.sh")));
  assert.ok(SCRIPTS.every((script) => !script.src.includes("install.sh")));
});

test("downloads scripts by the resolved commit, not a moving branch URL", async () => {
  const origin = makeOrigin();
  const destRoot = mkdtempSync(join(tmpdir(), "oh-sync-out-"));
  try {
    writeScripts(origin, "PINNED_A");
    const shaA = commitAll(origin, "a");
    writeScripts(origin, "MOVED_B");
    const shaB = commitAll(origin, "b");
    assert.notEqual(shaA, shaB);
    const { fetchImpl, requested } = stubFetch(origin, shaA);
    const logs = [];
    const origLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(String).join(" "));
    };
    let result;
    try {
      result = await syncFromResolvedCommit({ sha: shaA, fetchImpl, destRoot });
    } finally {
      console.log = origLog;
    }
    assert.equal(result.sha, shaA);
    assert.ok(requested.every((url) => !url.includes("/preview/")));
    assert.ok(requested.every((url) => !url.includes("/main/")));
    assert.ok(requested.some((url) => url.includes(`/${shaA}/`)));
    const agro = readFileSync(join(destRoot, "static/get-agro.sh"), "utf8");
    const oh = readFileSync(join(destRoot, "static/get-oh.sh"), "utf8");
    assert.equal(agro, "#!/bin/sh\necho PINNED_A-agro\n");
    assert.equal(oh, "#!/bin/sh\necho PINNED_A-oh\n");
    assert.ok(logs.some((line) => line.includes(shaA)));
    assert.ok(logs.every((line) => !line.includes("MOVING_REF")));
    assert.equal(rawBaseFor(shaA), `https://raw.githubusercontent.com/mifunedev/agro/${shaA}`);
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("moving-ref substitution is rejected as release evidence", async () => {
  const origin = makeOrigin();
  const destRoot = mkdtempSync(join(tmpdir(), "oh-sync-out-"));
  try {
    writeScripts(origin, "PINNED_A");
    const shaA = commitAll(origin, "a");
    writeScripts(origin, "MOVED_B");
    commitAll(origin, "b");
    const requested = [];
    const fetchImpl = async (url) => {
      const href = String(url);
      requested.push(href);
      const raw = href.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/([^/]+)\/(.+)$/);
      if (!raw) return new Response("missing", { status: 404 });
      const [, ref, path] = raw;
      if (ref !== shaA) {
        return new Response("#!/bin/sh\necho MOVING_REF\n", { status: 200 });
      }
      const body = gitShow(origin, ref, path);
      return new Response(body ?? "missing", { status: body ? 200 : 404 });
    };
    await syncFromResolvedCommit({ sha: shaA, fetchImpl, destRoot });
    const agro = readFileSync(join(destRoot, "static/get-agro.sh"), "utf8");
    assert.notEqual(agro, "#!/bin/sh\necho MOVING_REF\n");
    assert.match(agro, /PINNED_A-agro/);
    assert.ok(requested.every((url) => !/\/(main|preview)\//.test(url)));
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("stale-asset fallback cannot satisfy release verification", async () => {
  const destRoot = mkdtempSync(join(tmpdir(), "oh-sync-out-"));
  const sha = "a".repeat(40);
  try {
    mkdirSync(join(destRoot, "static"), { recursive: true });
    writeFileSync(join(destRoot, "static/get-agro.sh"), "#!/bin/sh\necho STALE\n");
    writeFileSync(join(destRoot, "static/get-oh.sh"), "#!/bin/sh\necho STALE\n");
    const fetchImpl = async () => {
      throw Object.assign(new Error("ECONNRESET"), { code: "ECONNRESET" });
    };
    await assert.rejects(
      () => syncFromResolvedCommit({ sha, fetchImpl, destRoot }),
      (err) => {
        assert.ok(err instanceof MirrorError);
        assert.equal(err.transient, true);
        return true;
      },
    );
    const leftover = readFileSync(join(destRoot, "static/get-agro.sh"), "utf8");
    assert.equal(leftover, "#!/bin/sh\necho STALE\n");
    assert.notEqual(leftover, `#!/bin/sh\necho ${sha}\n`);
  } finally {
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("an invalid ref fails without writing scripts", async () => {
  const destRoot = mkdtempSync(join(tmpdir(), "oh-sync-out-"));
  try {
    await assert.rejects(
      () => syncFromResolvedCommit({
        destRoot,
        resolve: async () => {
          throw new MirrorError("ref mifunedev/agro@missing does not resolve (HTTP 404)");
        },
      }),
      (err) => {
        assert.ok(err instanceof MirrorError);
        assert.match(err.message, /does not resolve/);
        return true;
      },
    );
    assert.equal(existsSync(join(destRoot, "static/get-agro.sh")), false);
  } finally {
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("a shell-metacharacter ref is rejected before fetch runs", () => {
  const pwned = join(tmpdir(), `oh-sync-pwned-${process.pid}`);
  rmSync(pwned, { force: true });
  const result = spawnSync(process.execPath, [SYNC], {
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
