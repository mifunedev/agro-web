// Mirror the AGRO release bundle agro.js into static/, so GitHub Pages serves it at
// https://agro.mifune.dev/agro.js. static/oh.js receives the same bundle.
//
// Runs as part of the `prebuild` hook. A missing asset, a body that is not a
// script, or a bundle that does not carry the release version FAILS the build.
// Only genuinely transient network failures warn and keep the previous artifact.
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  REPO, MirrorError, fetchReleaseAsset, reportAndExit, resolveReleaseTag,
} from "./oh-source.mjs";

const TAG = "build-oh-cli";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DESTS = ["agro.js", "oh.js"].map((name) => join(ROOT, "static", name));

export async function mirrorBundle({
  fetchImpl = globalThis.fetch.bind(globalThis),
  dests = DESTS,
  resolve: resolveTag = resolveReleaseTag,
} = {}) {
  const tag = await resolveTag();
  const { url, body } = await fetchReleaseAsset(tag, "agro.js", { fetchImpl });
  if (!body.startsWith("#!")) throw new MirrorError(`${url} has no shebang`);
  const version = tag.replace(/^v/, "");
  if (!body.includes(version)) throw new MirrorError(`${url} does not contain version ${version}`);
  for (const dest of dests) {
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, body, { mode: 0o644 });
    console.log(`[${TAG}] wrote ${basename(dest)} <- ${url} (${REPO}@${tag}, ${Buffer.byteLength(body)} bytes)`);
  }
  return { tag, url };
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  try {
    await mirrorBundle();
  } catch (err) {
    reportAndExit(TAG, err, DESTS);
  }
}
