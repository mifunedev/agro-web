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
import { INSTALLER, syncInstaller } from "./sync-external-scripts.mjs";

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = join(dirname(SCRIPT), "..");
const SYNC = join(dirname(SCRIPT), "sync-external-scripts.mjs");
const SOURCE_FILES = ["sync-external-scripts.mjs", "oh-source.mjs", "build-oh-cli.mjs"]
  .map((name) => join(dirname(SCRIPT), name));

const INSTALLER_BODY = "#!/usr/bin/env bash\necho installer-v0.18.1\n";

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

test("the release installer is served at install.sh and get-agro.sh", () => {
  assert.equal(INSTALLER.asset, "install.sh");
  assert.deepEqual(INSTALLER.dests, ["static/install.sh", "static/get-agro.sh"]);
});

test("no mirror source names the retired get-agro.sh source path", () => {
  for (const file of SOURCE_FILES) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /\.agro\/scripts\/get-agro\.sh/, file);
  }
});

test("the sync script carries no CDN redirect note for install.sh", () => {
  assert.doesNotMatch(readFileSync(SYNC, "utf8"), /CDN|302/);
});

test("mirrors the release installer of the resolved tag to both paths", async () => {
  const destRoot = mkdtempSync(join(tmpdir(), "agro-sync-out-"));
  try {
    const { fetchImpl, requested } = releaseFetch({
      "v0.18.1": { "install.sh": INSTALLER_BODY },
      "v0.17.0": { "install.sh": "#!/bin/sh\necho OLD\n" },
    });
    const result = await syncInstaller({ resolve: async () => "v0.18.1", fetchImpl, destRoot });
    assert.equal(result.tag, "v0.18.1");
    assert.deepEqual(requested, ["https://github.com/mifunedev/agro/releases/download/v0.18.1/install.sh"]);
    for (const dest of INSTALLER.dests) {
      assert.equal(readFileSync(join(destRoot, dest), "utf8"), INSTALLER_BODY, dest);
    }
  } finally {
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("a ref that is not a release fails without writing the installer", async () => {
  const destRoot = mkdtempSync(join(tmpdir(), "agro-sync-out-"));
  try {
    const { fetchImpl } = releaseFetch({});
    await assert.rejects(
      () => syncInstaller({ resolve: async () => "main", fetchImpl, destRoot }),
      (err) => {
        assert.ok(err instanceof MirrorError);
        assert.equal(err.transient, false);
        assert.match(err.message, /release tag/);
        return true;
      },
    );
    for (const dest of INSTALLER.dests) assert.equal(existsSync(join(destRoot, dest)), false);
  } finally {
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("a body without a shebang is fatal", async () => {
  const destRoot = mkdtempSync(join(tmpdir(), "agro-sync-out-"));
  try {
    const { fetchImpl } = releaseFetch({ "v0.18.1": { "install.sh": "<html>nope</html>" } });
    await assert.rejects(
      () => syncInstaller({ resolve: async () => "v0.18.1", fetchImpl, destRoot }),
      /no shebang/,
    );
    for (const dest of INSTALLER.dests) assert.equal(existsSync(join(destRoot, dest)), false);
  } finally {
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("a transient failure leaves the previous installer untouched", async () => {
  const destRoot = mkdtempSync(join(tmpdir(), "agro-sync-out-"));
  try {
    mkdirSync(join(destRoot, "static"), { recursive: true });
    writeFileSync(join(destRoot, "static/install.sh"), "#!/bin/sh\necho STALE\n");
    const fetchImpl = async () => {
      throw Object.assign(new Error("ECONNRESET"), { code: "ECONNRESET" });
    };
    await assert.rejects(
      () => syncInstaller({ resolve: async () => "v0.18.1", fetchImpl, destRoot }),
      (err) => err instanceof MirrorError && err.transient === true,
    );
    assert.equal(readFileSync(join(destRoot, "static/install.sh"), "utf8"), "#!/bin/sh\necho STALE\n");
  } finally {
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("a release lookup failure writes nothing", async () => {
  const destRoot = mkdtempSync(join(tmpdir(), "agro-sync-out-"));
  try {
    await assert.rejects(
      () => syncInstaller({
        destRoot,
        resolve: async () => {
          throw new MirrorError("latest release of mifunedev/agro does not resolve (HTTP 404)");
        },
      }),
      /does not resolve/,
    );
    for (const dest of INSTALLER.dests) assert.equal(existsSync(join(destRoot, dest)), false);
  } finally {
    rmSync(destRoot, { recursive: true, force: true });
  }
});

test("a shell-metacharacter ref is rejected before fetch runs", () => {
  const pwned = join(tmpdir(), `agro-sync-pwned-${process.pid}`);
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
