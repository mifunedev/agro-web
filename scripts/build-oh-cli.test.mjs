import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync, mkdtempSync, readFileSync, rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { MirrorError } from "./oh-source.mjs";
import { mirrorBundle } from "./build-oh-cli.mjs";

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = join(dirname(SCRIPT), "..");
const BUILDER = join(dirname(SCRIPT), "build-oh-cli.mjs");

const bundle = (version) => `#!/usr/bin/env node\nvar VERSION = "${version}";\n`;

function releaseFetch(assets) {
  const requested = [];
  const fetchImpl = async (url) => {
    const href = String(url);
    requested.push(href);
    const match = href.match(/^https:\/\/github\.com\/mifunedev\/agro\/releases\/download\/([^/]+)\/(.+)$/);
    const body = match && assets[match[1]]?.[match[2]];
    return body == null ? new Response("Not Found", { status: 404 }) : new Response(body, { status: 200 });
  };
  return { fetchImpl, requested };
}

test("mirrors agro.js from the release of the resolved tag", async () => {
  const out = mkdtempSync(join(tmpdir(), "agro-cli-out-"));
  try {
    const dests = [join(out, "agro.js"), join(out, "oh.js")];
    const { fetchImpl, requested } = releaseFetch({
      "v0.18.1": { "agro.js": bundle("0.18.1") },
      "v0.17.0": { "agro.js": bundle("0.17.0") },
    });
    const result = await mirrorBundle({ resolve: async () => "v0.18.1", fetchImpl, dests });
    assert.equal(result.tag, "v0.18.1");
    assert.deepEqual(requested, ["https://github.com/mifunedev/agro/releases/download/v0.18.1/agro.js"]);
    for (const dest of dests) {
      const body = readFileSync(dest, "utf8");
      assert.ok(body.startsWith("#!"), dest);
      assert.match(body, /0\.18\.1/);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("a bundle that does not carry the tag version is fatal", async () => {
  const out = mkdtempSync(join(tmpdir(), "agro-cli-out-"));
  try {
    const dests = [join(out, "agro.js")];
    const { fetchImpl } = releaseFetch({ "v0.18.1": { "agro.js": bundle("0.17.0") } });
    await assert.rejects(
      () => mirrorBundle({ resolve: async () => "v0.18.1", fetchImpl, dests }),
      (err) => err instanceof MirrorError && /0\.18\.1/.test(err.message),
    );
    assert.equal(existsSync(dests[0]), false);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("a bundle without a shebang is fatal", async () => {
  const out = mkdtempSync(join(tmpdir(), "agro-cli-out-"));
  try {
    const dests = [join(out, "agro.js")];
    const { fetchImpl } = releaseFetch({ "v0.18.1": { "agro.js": "var VERSION = \"0.18.1\";\n" } });
    await assert.rejects(
      () => mirrorBundle({ resolve: async () => "v0.18.1", fetchImpl, dests }),
      /no shebang/,
    );
    assert.equal(existsSync(dests[0]), false);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("a ref that is not a release fails without writing the bundle", async () => {
  const out = mkdtempSync(join(tmpdir(), "agro-cli-out-"));
  try {
    const dests = [join(out, "agro.js")];
    const { fetchImpl } = releaseFetch({});
    await assert.rejects(
      () => mirrorBundle({ resolve: async () => "main", fetchImpl, dests }),
      (err) => err instanceof MirrorError && err.transient === false && /release tag/.test(err.message),
    );
    assert.equal(existsSync(dests[0]), false);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("a shell-metacharacter ref is rejected before fetch runs", () => {
  const pwned = join(tmpdir(), `agro-cli-pwned-${process.pid}`);
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
