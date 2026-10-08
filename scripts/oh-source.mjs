// Shared resolution of the AGRO release that the site mirrors. Both mirror scripts
// must agree on one release tag. With no ref setting the tag is the latest release.
import { existsSync } from "node:fs";
import process from "node:process";

const stripHeads = (ref) => ref.replace(/^refs\/heads\//, "");

function resolveSetting(agroName, legacyName, fallback, normalize = (value) => value) {
  const agro = process.env[agroName] ? normalize(process.env[agroName]) : "";
  const legacy = process.env[legacyName] ? normalize(process.env[legacyName]) : "";
  if (agro && legacy && agro !== legacy) {
    console.warn(`[oh-source] ${agroName} and ${legacyName} are both set and differ — using ${agroName}`);
  }
  return { name: agro ? agroName : legacyName, value: agro || legacy || fallback };
}

const repoSetting = resolveSetting("AGRO_GITHUB_REPO", "OH_GITHUB_REPO", "mifunedev/agro");
const refSetting = resolveSetting("AGRO_SCRIPTS_REF", "OH_SCRIPTS_REF", "", stripHeads);

export const REPO = repoSetting.value;
export const REF = refSetting.value;

const SAFE = /^[A-Za-z0-9][A-Za-z0-9._\/-]*$/;
for (const { name, value } of [repoSetting, refSetting]) {
  if (value && !SAFE.test(value)) {
    console.error(`[oh-source] FATAL: ${name}=${JSON.stringify(value)} is not a valid ref or repo slug.`);
    process.exit(1);
  }
}

export function assertSafeRef(value, label = "ref") {
  if (!SAFE.test(value)) {
    throw new MirrorError(`${label}=${JSON.stringify(value)} is not a valid ref`);
  }
  return value;
}

export class MirrorError extends Error {
  constructor(message, { transient = false } = {}) {
    super(message);
    this.name = "MirrorError";
    this.transient = transient;
  }
}

// A transient failure is one where the upstream content is presumably fine and we
// simply could not reach it: DNS, TCP, TLS, 5xx, or a rate limit. Everything else
// means the mirror would publish something wrong, and must fail the deploy instead.
const RATE_LIMIT_REMAINING_HEADER = "x-ratelimit-remaining";

export function isRateLimited(headers) {
  return headers?.get?.(RATE_LIMIT_REMAINING_HEADER) === "0";
}

export function isTransientResponse({ status, headers }) {
  if (status === 408 || status === 429 || status >= 500) return true;
  return status === 403 && isRateLimited(headers);
}

export function classifyFetchError(err) {
  return new MirrorError(err.message, { transient: true });
}

function authHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : {};
}

const defaultFetch = () => globalThis.fetch.bind(globalThis);

async function get(url, fetchImpl, headers = {}) {
  let res;
  try {
    res = await fetchImpl(url, { headers: { ...headers, ...authHeaders() } });
  } catch (err) {
    throw classifyFetchError(err);
  }
  if (!res.ok && isTransientResponse(res)) {
    const reason = isRateLimited(res.headers) ? "GitHub rate limit exhausted" : "could not reach GitHub";
    throw new MirrorError(`${reason} (${url} -> HTTP ${res.status})`, { transient: true });
  }
  return res;
}

export async function resolveReleaseTag({ ref = REF, fetchImpl = defaultFetch() } = {}) {
  if (ref) return assertSafeRef(ref, "AGRO_SCRIPTS_REF");
  const url = `https://api.github.com/repos/${REPO}/releases/latest`;
  const res = await get(url, fetchImpl, { accept: "application/vnd.github+json" });
  if (!res.ok) {
    throw new MirrorError(`latest release of ${REPO} does not resolve (${url} -> HTTP ${res.status})`);
  }
  const { tag_name: tag } = await res.json();
  if (!tag) throw new MirrorError(`latest release of ${REPO} has no tag_name`);
  return assertSafeRef(tag, "tag_name");
}

export function releaseAssetUrl(tag, asset) {
  return `https://github.com/${REPO}/releases/download/${assertSafeRef(tag, "tag")}/${asset}`;
}

export async function fetchReleaseAsset(tag, asset, { fetchImpl = defaultFetch() } = {}) {
  const url = releaseAssetUrl(tag, asset);
  const res = await get(url, fetchImpl);
  if (!res.ok) {
    throw new MirrorError(
      `${REPO}@${tag} has no release asset ${asset} (${url} -> HTTP ${res.status}); AGRO_SCRIPTS_REF must name a release tag`,
    );
  }
  return { url, body: await res.text() };
}

// A transient failure is survivable only when there is already a good artifact to
// keep. In CI the mirrored files are gitignored and therefore absent on a fresh
// checkout, so "warn and continue" there would deploy a site missing them entirely.
export function reportAndExit(tag, err, artifacts = []) {
  if (err instanceof MirrorError && err.transient) {
    const missing = artifacts.filter((path) => !existsSync(path));
    if (missing.length === 0) {
      console.warn(`[${tag}] transient: ${err.message} — keeping the previously published artifact`);
      return { fallback: true };
    }
    console.error(`[${tag}] FATAL: ${err.message}`);
    console.error(`[${tag}] the failure looks transient, but there is no previous artifact to fall back on: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.error(`[${tag}] FATAL: ${err.message}`);
  console.error(`[${tag}] refusing to deploy a site whose mirrored artifacts are stale or wrong.`);
  process.exit(1);
}
