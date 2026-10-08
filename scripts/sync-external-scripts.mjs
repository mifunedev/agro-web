// Build-time mirror of the AGRO release installer into static/, so GitHub Pages
// serves it at https://agro.mifune.dev/install.sh and /get-agro.sh.
//
// Runs as the `prebuild` hook. A missing asset or a body that is not a script FAILS
// the build. Only genuinely transient network failures warn and keep the previous
// artifact.
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  REPO, MirrorError, fetchReleaseAsset, reportAndExit, resolveReleaseTag,
} from "./oh-source.mjs";

const TAG = "sync-scripts";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const INSTALLER = { asset: "install.sh", dests: ["static/install.sh", "static/get-agro.sh"] };

export async function syncInstaller({
  fetchImpl = globalThis.fetch.bind(globalThis),
  destRoot = ROOT,
  resolve: resolveTag = resolveReleaseTag,
} = {}) {
  const tag = await resolveTag();
  const { url, body } = await fetchReleaseAsset(tag, INSTALLER.asset, { fetchImpl });
  if (!body.startsWith("#!")) {
    throw new MirrorError(`${url} did not return a script (no shebang)`);
  }
  for (const dest of INSTALLER.dests) {
    const out = join(destRoot, dest);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, body, { mode: 0o644 });
    console.log(`[${TAG}] wrote ${dest} <- ${url} (${REPO}@${tag}, ${Buffer.byteLength(body)} bytes)`);
  }
  return { tag, url };
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  try {
    await syncInstaller();
  } catch (err) {
    reportAndExit(TAG, err, INSTALLER.dests.map((dest) => join(ROOT, dest)));
  }
}
