import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { ALLOW, RETIRED } from "./check-docs-drift.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, "check-docs-drift.mjs");

const entry = (name) => {
  const found = RETIRED.find((r) => r.name === name);
  assert.ok(found, `RETIRED has no entry named ${name}`);
  return found;
};

const matches = (pattern, line) => {
  pattern.lastIndex = 0;
  return pattern.test(line);
};

test("pi-autoresearch is a retired token", () => {
  const autoresearch = entry("pi-autoresearch");
  assert.match(autoresearch.instead, /no longer part of the harness/);
});

test("the pi-autoresearch pattern matches the shapes it must catch", () => {
  const { pattern } = entry("pi-autoresearch");
  for (const line of [
    "try it with `pi -e npm:pi-autoresearch@1.6.0`",
    "- [`pi-autoresearch`](../integrations/pi-autoresearch.md) — loops for Pi",
    "inspect results through `/autoresearch export`",
    "Use `/skill:autoresearch-create` to create `.auto/` session files",
  ]) {
    assert.ok(matches(pattern, line), `expected a match in: ${line}`);
  }
});

test("the pi-autoresearch pattern does not flag retained packages", () => {
  const { pattern } = entry("pi-autoresearch");
  for (const line of [
    '"npm:@ff-labs/pi-fff@0.9.5"',
    "`pi -e npm:@trevonistrevon/pi-loop`, or `pi -e npm:@guwidoe/pi-prompt-suggester@0.3.10`.",
    "- [`@tintinweb/pi-subagents`](https://pi.dev/packages/@tintinweb/pi-subagents)",
    "`@narumitw/pi-goal`, `@narumitw/pi-codex-usage`, `@tifan/pi-recap`",
    "use `/loop` or `LoopCreate` for cron-triggered follow-up prompts",
  ]) {
    assert.ok(!matches(pattern, line), `expected no match in: ${line}`);
  }
});

test("no page is exempted from the pi-autoresearch token", () => {
  assert.equal(ALLOW.filter((a) => a.token === "pi-autoresearch").length, 0);
});

const RETIRED_SKILLS = "a retired /spec, /retro, or /wiki compile skill";

test("the retired-skills entry names the core chain", () => {
  const { instead } = entry(RETIRED_SKILLS);
  assert.match(instead, /`\/prd` → draft PR → `\/delegate` → ready PR/);
});

test("the retired-skills pattern matches the shapes it must catch", () => {
  const { pattern } = entry(RETIRED_SKILLS);
  for (const line of [
    "the `/spec` pipeline reads and writes",
    "such as the `/spec execute` implementation cycle",
    "`/architect`, `/spec`, `/audit`, `/retro`, and",
    "run /retro after the merge",
    "`/wiki query`, `/wiki lint`, `/wiki compile`, and more",
    "Source: [`.oh/skills/spec/references/execute.md`](https://example.com)",
    "see .agro/skills/retro/SKILL.md",
  ]) {
    assert.ok(matches(pattern, line), `expected a match in: ${line}`);
  }
});

test("the retired-skills pattern does not flag current skills or prose", () => {
  const { pattern } = entry(RETIRED_SKILLS);
  for (const line of [
    "`/prd` writes the plan and `/delegate` runs the stories",
    "`/wiki query` and `/wiki lint` read the knowledge base",
    "write a spec, then hold a retrospective",
    "the OpenAPI /specification endpoint and /spec-kit",
    "https://example.com/spec and docs/spec/overview.md",
    "`/retrospective` is not a skill",
  ]) {
    assert.ok(!matches(pattern, line), `expected no match in: ${line}`);
  }
});

test("no page is exempted from the retired-skills token", () => {
  assert.equal(ALLOW.filter((a) => a.token === RETIRED_SKILLS).length, 0);
});

test("the get-oh.sh entry names get-agro.sh and its URL", () => {
  assert.match(entry("get-oh.sh").instead, /https:\/\/agro\.mifune\.dev\/get-agro\.sh/);
});

test("the get-oh.sh pattern matches the name in prose and in a URL", () => {
  const { pattern } = entry("get-oh.sh");
  for (const line of [
    "the `oh` CLI / `get-oh.sh` path",
    "curl -fsSL https://oh.mifune.dev/get-oh.sh | bash",
  ]) {
    assert.ok(matches(pattern, line), `expected a match in: ${line}`);
  }
});

test("the get-oh.sh pattern does not flag get-agro.sh", () => {
  const { pattern } = entry("get-oh.sh");
  for (const line of [
    "curl -fsSL https://agro.mifune.dev/get-agro.sh | bash",
    "`get-agro.sh` installs to `~/.local/bin/agro`",
  ]) {
    assert.ok(!matches(pattern, line), `expected no match in: ${line}`);
  }
});

test("the OH_JS_URL entry names AGRO_JS_URL", () => {
  assert.match(entry("OH_JS_URL").instead, /\bAGRO_JS_URL\b/);
});

test("the OH_JS_URL pattern matches OH_JS_URL and not AGRO_JS_URL", () => {
  const { pattern } = entry("OH_JS_URL");
  assert.ok(matches(pattern, "downloads `OH_JS_URL` into the same directory"));
  assert.ok(matches(pattern, "OH_JS_URL=https://o.example/oh.js agro update"));
  for (const line of [
    "downloads `AGRO_JS_URL` into the same directory",
    "AGRO_JS_URL=https://a.example/agro.js agro update",
  ]) {
    assert.ok(!matches(pattern, line), `expected no match in: ${line}`);
  }
});

test("importing the checker has no side effects and running it directly passes", () => {
  const run = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /\[docs-drift\] PASS — \d+ file\(s\)/);
});
