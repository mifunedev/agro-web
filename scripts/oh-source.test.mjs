import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { isRateLimited, isTransientResponse, rawBaseFor, gitUrlFor, MirrorError, resolveSha } from "./oh-source.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(SCRIPT_DIR, "oh-source.mjs");

const response = (status, headers = {}) => ({ status, headers: new Headers(headers) });

test("the statuses that were already transient stay transient", () => {
  for (const status of [408, 429, 500, 502, 503, 504, 599]) {
    assert.equal(
      isTransientResponse(response(status)),
      true,
      `HTTP ${status} must stay transient`,
    );
  }
});

test("an exhausted quota makes a 403 transient", () => {
  assert.equal(isTransientResponse(response(403, { "x-ratelimit-remaining": "0" })), true);
});

test("a 403 without exhausted-quota evidence stays fatal", () => {
  assert.equal(isTransientResponse(response(403)), false);
  assert.equal(isTransientResponse(response(403, { "x-ratelimit-remaining": "1" })), false);
  assert.equal(isTransientResponse(response(403, { "x-ratelimit-remaining": "4999" })), false);
});

test("a genuine authorization failure is never softened, however it is shaped", () => {
  assert.equal(isTransientResponse(response(401)), false);
  assert.equal(isTransientResponse(response(403, { "retry-after": "60" })), false);
});

test("a missing ref stays fatal, which is the guard's whole purpose", () => {
  for (const status of [400, 404, 409, 410, 422]) {
    assert.equal(
      isTransientResponse(response(status)),
      false,
      `HTTP ${status} must fail the deploy`,
    );
  }
});

test("the quota header is only believed on a 403", () => {
  assert.equal(isTransientResponse(response(404, { "x-ratelimit-remaining": "0" })), false);
});

test("a response with no headers at all does not throw", () => {
  assert.equal(isTransientResponse({ status: 403 }), false);
  assert.equal(isTransientResponse({ status: 500 }), true);
});

test("isRateLimited reads only an exact zero", () => {
  assert.equal(isRateLimited(new Headers({ "x-ratelimit-remaining": "0" })), true);
  assert.equal(isRateLimited(new Headers({ "x-ratelimit-remaining": "00" })), false);
  assert.equal(isRateLimited(new Headers()), false);
  assert.equal(isRateLimited(undefined), false);
});

test("the header is matched case-insensitively, as HTTP requires", () => {
  assert.equal(isTransientResponse(response(403, { "X-RateLimit-Remaining": "0" })), true);
});

function loadSource(env) {
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", "import { REF, REPO } from './oh-source.mjs'; process.stdout.write(JSON.stringify({ REF, REPO }))"],
    {
      cwd: SCRIPT_DIR,
      encoding: "utf8",
      env: { ...process.env, ...env },
    },
  );
  return result;
}

test("AGRO_SCRIPTS_REF wins over OH_SCRIPTS_REF", () => {
  const sha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const result = loadSource({
    AGRO_SCRIPTS_REF: sha,
    OH_SCRIPTS_REF: "main",
  });
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout.trim().split("\n").at(-1));
  assert.equal(payload.REF, sha);
});

test("OH_SCRIPTS_REF is used when AGRO_SCRIPTS_REF is unset", () => {
  const sha = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const result = loadSource({
    AGRO_SCRIPTS_REF: "",
    OH_SCRIPTS_REF: sha,
  });
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout.trim().split("\n").at(-1));
  assert.equal(payload.REF, sha);
});

test("rawBaseFor pins the URL to the resolved commit", () => {
  const sha = "cccccccccccccccccccccccccccccccccccccccc";
  assert.equal(rawBaseFor(sha), `https://raw.githubusercontent.com/mifunedev/agro/${sha}`);
  assert.ok(!rawBaseFor(sha).includes("/main/"));
  assert.equal(gitUrlFor("mifunedev/agro"), "https://github.com/mifunedev/agro.git");
});

test("resolveSha returns the full SHA and never substitutes main", async () => {
  const sha = "dddddddddddddddddddddddddddddddddddddddd";
  const orig = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return new Response(sha, { status: 200 });
  };
  try {
    assert.equal(await resolveSha(), sha);
    assert.ok(urls.every((url) => !url.endsWith("/main") || url.includes("/commits/")));
  } finally {
    globalThis.fetch = orig;
  }
});

test("a 404 ref is fatal and does not become main", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = async () => new Response("Not Found", { status: 404 });
  try {
    await assert.rejects(
      () => resolveSha(),
      (err) => {
        assert.ok(err instanceof MirrorError);
        assert.equal(err.transient, false);
        assert.match(err.message, /does not resolve/);
        assert.ok(!err.message.includes("substitut"));
        return true;
      },
    );
  } finally {
    globalThis.fetch = orig;
  }
});

test("a non-SHA GitHub body is fatal", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = async () => new Response("main", { status: 200 });
  try {
    await assert.rejects(() => resolveSha(), /did not resolve to a full SHA/);
  } finally {
    globalThis.fetch = orig;
  }
});

test("a shell-metacharacter ref exits before any git or fetch", () => {
  const pwned = join(tmpdir(), `oh-source-pwned-${process.pid}`);
  rmSync(pwned, { force: true });
  const result = spawnSync(process.execPath, [SOURCE], {
    cwd: SCRIPT_DIR,
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
