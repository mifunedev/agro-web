// Build-time sync of shipped install scripts from the canonical openharness repo
// into static/, so GitHub Pages serves them at the site root (e.g.
// https://oh.mifune.dev/get-oh.sh) without a copy that can drift.
//
// Runs as the `prebuild` hook. A missing file, a 404, or a body that is not a
// script FAILS the build: `oh` is the only door into Open Harness, so publishing
// a site whose bootstrap script is stale or absent is worse than not deploying.
// Only genuinely transient network failures warn and keep the previous artifact.
//
// NOTE — install.sh is deliberately absent from SCRIPTS[]. It is currently served
// by a 302 configured at the CDN layer in front of static/CNAME, pointing at
// raw.githubusercontent.com/mifunedev/openharness/refs/heads/main/.oh/scripts/install.sh.
// That rule lives outside this repo, so adding install.sh here would write a
// static/install.sh that the redirect shadows — two mechanisms serving one path.
// Removing the CDN rule is tracked as a follow-up; do not mirror it until then.
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  REF, REPO, MirrorError, classifyFetchError, isTransientResponse, reportAndExit, resolveSha, rawBaseFor,
} from "./oh-source.mjs";

const TAG = "sync-scripts";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const SCRIPTS = [
  { src: ".agro/scripts/get-agro.sh", dest: "static/get-agro.sh" },
  { src: ".agro/scripts/get-oh.sh", dest: "static/get-oh.sh" },
];
const PRE_RENAME_SCRIPTS_DIR = ".oh/";
const sourceCandidates = (src) => [src, src.replace(/^\.agro\//, PRE_RENAME_SCRIPTS_DIR)];

async function fetchScript(src, dest, { base, fetchImpl }) {
  const url = `${base}/${src}`;
  let res;
  try {
    res = await fetchImpl(url);
  } catch (err) {
    throw classifyFetchError(err);
  }
  const body = await res.text();
  if (res.ok) return { url, body };
  const detail = `${url} -> HTTP ${res.status}`;
  if (isTransientResponse(res)) {
    throw new MirrorError(`could not fetch ${dest} (${detail})`, { transient: true });
  }
  return { url, missing: detail };
}

async function syncOne({ src, dest }, { base, sha, fetchImpl, destRoot }) {
  const looked = [];
  let found;
  for (const candidate of sourceCandidates(src)) {
    const result = await fetchScript(candidate, dest, { base, fetchImpl });
    if (result.body !== undefined) {
      found = result;
      break;
    }
    looked.push(result.missing);
  }
  if (!found) {
    throw new MirrorError(`${dest} is not present at ${REPO}@${sha}; looked for ${looked.join(", ")}`);
  }
  const { url, body } = found;
  if (!body.startsWith("#!")) {
    throw new MirrorError(`${url} did not return a script (no shebang)`);
  }
  const out = join(destRoot, dest);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, body, { mode: 0o644 });
  console.log(`[${TAG}] wrote ${dest} <- ${url} (${sha}, ${body.length} bytes)`);
  return { dest, url, sha, bytes: body.length };
}

export async function syncFromResolvedCommit({
  sha: shaOption,
  fetchImpl = globalThis.fetch.bind(globalThis),
  destRoot = ROOT,
  resolve = resolveSha,
  scripts = SCRIPTS,
} = {}) {
  const sha = shaOption ?? await resolve();
  if (!sha) throw new MirrorError(`ref ${REPO}@${REF} resolved to an empty SHA`);
  const base = rawBaseFor(sha);
  console.log(`[${TAG}] source ${REPO}@${REF} pinned to ${sha}`);
  const written = [];
  for (const script of scripts) {
    written.push(await syncOne(script, { base, sha, fetchImpl, destRoot }));
  }
  return { sha, written };
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  try {
    await syncFromResolvedCommit();
  } catch (err) {
    reportAndExit(TAG, err, SCRIPTS.map((s) => join(ROOT, s.dest)));
  }
}
