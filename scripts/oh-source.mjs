// Shared resolution of the upstream openharness ref that the site mirrors.
//
// Both mirror scripts (sync-external-scripts.mjs, build-oh-cli.mjs) must agree on
// exactly one ref. They previously disagreed: one defaulted to "refs/heads/main"
// and the other to "main", so an operator setting OH_SCRIPTS_REF in one form got
// a working sync and a silently skipped CLI build, or the reverse.
//
// The default is `main`, the release ref. `development` carries unreleased CLI
// behaviour; the site must not serve a bundle strangers `curl | bash` from a
// branch that has not been promoted.
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
const refSetting = resolveSetting("AGRO_SCRIPTS_REF", "OH_SCRIPTS_REF", "main", stripHeads);

export const REPO = repoSetting.value;
export const REF = refSetting.value;
export const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${REF}`;

// REF and REPO reach `git clone` as command arguments. Reject anything that is not
// a plausible ref/slug, and anything leading with `-`, which git would read as a flag.
const SAFE = /^[A-Za-z0-9][A-Za-z0-9._\/-]*$/;
for (const { name, value } of [repoSetting, refSetting]) {
  if (!SAFE.test(value)) {
    console.error(`[oh-source] FATAL: ${name}=${JSON.stringify(value)} is not a valid ref or repo slug.`);
    process.exit(1);
  }
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
// — a missing ref, a 404, a file that is not a script, a failed build — means the
// mirror would publish something wrong, and must fail the deploy instead.
//
// GitHub answers an exhausted PRIMARY rate limit with 403, not 429, so the status
// alone cannot separate "we are over quota" from "this token may not read that repo".
// `x-ratelimit-remaining: 0` is set in the first case and not the second, and it is
// the only evidence that makes a 403 safe to retry. Without it a 403 stays fatal:
// treating a real authorization failure as transient is how a deploy publishes the
// wrong mirror. raw.githubusercontent.com sends no such header, so a 403 from there
// remains fatal too, which is correct — it is not quota-limited.
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

// Resolves REF to a commit SHA. Doubles as the existence check for the ref, so a
// typo or an unpromoted branch fails here with a clear message rather than deep
// inside a `git clone`.
export async function resolveSha() {
  const url = `https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(REF)}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { accept: "application/vnd.github.sha", ...authHeaders() },
    });
  } catch (err) {
    throw classifyFetchError(err);
  }
  if (!res.ok) {
    const detail = `${url} -> HTTP ${res.status}`;
    if (isTransientResponse(res)) {
      const reason = isRateLimited(res.headers)
        ? "GitHub rate limit exhausted"
        : "could not reach GitHub";
      throw new MirrorError(`${reason} (${detail})`, { transient: true });
    }
    throw new MirrorError(`ref ${REPO}@${REF} does not resolve (${detail})`);
  }
  return (await res.text()).trim();
}

// A transient failure is survivable only when there is already a good artifact to
// keep. In CI the mirrored files are gitignored and therefore absent on a fresh
// checkout, so "warn and continue" there would deploy a site missing them entirely.
export function reportAndExit(tag, err, artifacts = []) {
  if (err instanceof MirrorError && err.transient) {
    const missing = artifacts.filter((path) => !existsSync(path));
    if (missing.length === 0) {
      console.warn(`[${tag}] transient: ${err.message} — keeping the previously published artifact`);
      return;
    }
    console.error(`[${tag}] FATAL: ${err.message}`);
    console.error(`[${tag}] the failure looks transient, but there is no previous artifact to fall back on: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.error(`[${tag}] FATAL: ${err.message}`);
  console.error(`[${tag}] refusing to deploy a site whose mirrored artifacts are stale or wrong.`);
  process.exit(1);
}
