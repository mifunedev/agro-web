import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  fetchReleaseAsset, isRateLimited, isTransientResponse, MirrorError, resolveReleaseTag,
} from "./oh-source.mjs";

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
  const result = loadSource({
    AGRO_SCRIPTS_REF: "v0.18.1",
    OH_SCRIPTS_REF: "v0.17.0",
  });
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout.trim().split("\n").at(-1));
  assert.equal(payload.REF, "v0.18.1");
});

test("OH_SCRIPTS_REF is used when AGRO_SCRIPTS_REF is unset", () => {
  const result = loadSource({
    AGRO_SCRIPTS_REF: "",
    OH_SCRIPTS_REF: "v0.17.0",
  });
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout.trim().split("\n").at(-1));
  assert.equal(payload.REF, "v0.17.0");
});

test("no ref setting means the latest release", () => {
  const result = loadSource({ AGRO_SCRIPTS_REF: "", OH_SCRIPTS_REF: "" });
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout.trim().split("\n").at(-1));
  assert.equal(payload.REF, "");
});

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers });

test("resolveReleaseTag asks GitHub for the latest release by default", async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(String(url));
    return json({ tag_name: "v0.18.1" });
  };
  assert.equal(await resolveReleaseTag({ ref: "", fetchImpl }), "v0.18.1");
  assert.deepEqual(urls, ["https://api.github.com/repos/mifunedev/agro/releases/latest"]);
});

test("an explicit ref overrides the latest release without a lookup", async () => {
  const fetchImpl = async () => {
    throw new Error("must not fetch");
  };
  assert.equal(await resolveReleaseTag({ ref: "v0.17.0", fetchImpl }), "v0.17.0");
});

test("a missing latest release is fatal", async () => {
  const fetchImpl = async () => json({ message: "Not Found" }, 404);
  await assert.rejects(
    () => resolveReleaseTag({ ref: "", fetchImpl }),
    (err) => {
      assert.ok(err instanceof MirrorError);
      assert.equal(err.transient, false);
      assert.match(err.message, /latest release/);
      return true;
    },
  );
});

test("a rate-limited or unreachable release lookup is transient", async () => {
  const limited = async () => json({}, 403, { "x-ratelimit-remaining": "0" });
  await assert.rejects(
    () => resolveReleaseTag({ ref: "", fetchImpl: limited }),
    (err) => err instanceof MirrorError && err.transient === true,
  );
  const down = async () => {
    throw new Error("ECONNRESET");
  };
  await assert.rejects(
    () => resolveReleaseTag({ ref: "", fetchImpl: down }),
    (err) => err instanceof MirrorError && err.transient === true,
  );
});

test("an unsafe tag name from GitHub is rejected", async () => {
  const fetchImpl = async () => json({ tag_name: "-v1;rm" });
  await assert.rejects(() => resolveReleaseTag({ ref: "", fetchImpl }), /not a valid ref/);
});

test("fetchReleaseAsset downloads from the release of the tag", async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(String(url));
    return new Response("#!/bin/sh\n", { status: 200 });
  };
  const { url, body } = await fetchReleaseAsset("v0.18.1", "install.sh", { fetchImpl });
  assert.equal(url, "https://github.com/mifunedev/agro/releases/download/v0.18.1/install.sh");
  assert.deepEqual(urls, [url]);
  assert.equal(body, "#!/bin/sh\n");
});

test("a ref without that release asset fails with a clear fatal error", async () => {
  const fetchImpl = async () => new Response("Not Found", { status: 404 });
  await assert.rejects(
    () => fetchReleaseAsset("main", "install.sh", { fetchImpl }),
    (err) => {
      assert.ok(err instanceof MirrorError);
      assert.equal(err.transient, false);
      assert.match(err.message, /main/);
      assert.match(err.message, /release tag/);
      return true;
    },
  );
});

test("a 5xx asset download is transient", async () => {
  const fetchImpl = async () => new Response("", { status: 502 });
  await assert.rejects(
    () => fetchReleaseAsset("v0.18.1", "agro.js", { fetchImpl }),
    (err) => err instanceof MirrorError && err.transient === true,
  );
});

test("a shell-metacharacter ref exits before any fetch", () => {
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
