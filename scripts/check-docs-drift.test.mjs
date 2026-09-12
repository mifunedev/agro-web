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

test("importing the checker has no side effects and running it directly passes", () => {
  const run = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /\[docs-drift\] PASS — \d+ file\(s\)/);
});
