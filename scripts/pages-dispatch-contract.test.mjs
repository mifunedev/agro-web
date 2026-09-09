import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const WORKFLOW_PATH = fileURLToPath(new URL("../.github/workflows/pages.yml", import.meta.url));
const workflow = readFileSync(WORKFLOW_PATH, "utf8");

const PRODUCER_EVENT_TYPE = "agro-release";
const PRODUCER_PAYLOAD_KEY = "ref";
const ACCEPTED_DISPATCH_EVENT_TYPES = ["agro-release", "openharness-release"];
const REF_PRECEDENCE = ["github.event.client_payload.ref", "inputs.ref", "'main'"];
const WORKFLOW_DISPATCH_REF_DEFAULT = "main";
const PUBLISH_BRANCH_GUARD = "github.ref == 'refs/heads/main'";
const PUBLISH_REPOSITORY_GUARD =
  `contains(fromJSON('["mifunedev/agro-web", "mifunedev/openharness-web"]'), github.repository)`;
const PUBLISHING_ACTIONS = [
  "actions/configure-pages",
  "actions/upload-pages-artifact",
  "actions/deploy-pages",
];

const uncomment = (text) => text.replace(/^\s*#.*$/gm, "");

function dispatchEventTypes() {
  const match = /^\s*repository_dispatch:\s*\n\s*types:\s*\[([^\]]*)\]/m.exec(uncomment(workflow));
  assert.ok(match, "pages.yml must declare repository_dispatch with an inline types list");
  return match[1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function scriptsRefExpression() {
  const match = /^env:\n(?:[ \t]+.*\n)*?[ \t]+OH_SCRIPTS_REF:[^\n]*\n[ \t]+\$\{\{([^}]*)\}\}/m.exec(
    workflow,
  );
  assert.ok(match, "OH_SCRIPTS_REF must be a workflow-level env expression");
  return match[1].trim();
}

function refPrecedenceOperands() {
  return scriptsRefExpression()
    .split("||")
    .map((operand) => operand.trim());
}

function workflowDispatchRefInput() {
  const match =
    /^\s*workflow_dispatch:\s*\n\s*inputs:\s*\n\s*ref:\s*\n((?:\s{8,}\S[^\n]*\n)+)/m.exec(workflow);
  assert.ok(match, "workflow_dispatch must declare a `ref` input");
  const fields = {};
  for (const line of match[1].split("\n")) {
    const field = /^\s*([a-z]+):\s*(.+?)\s*$/.exec(line);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

function blockLines() {
  return uncomment(workflow).split("\n");
}

function guardsFor(actionPrefix) {
  const lines = blockLines();
  const index = lines.findIndex((line) => new RegExp(`^\\s*uses:\\s*${actionPrefix}@`).test(line));
  assert.notEqual(index, -1, `pages.yml must still use ${actionPrefix}`);

  const guards = [];
  let stepStart = null;
  let jobStart = null;
  for (let i = index; i >= 0; i -= 1) {
    if (stepStart === null && /^\s*- name:/.test(lines[i])) stepStart = i;
    if (/^ {2}\S+:\s*$/.test(lines[i])) {
      jobStart = i;
      break;
    }
  }
  assert.notEqual(jobStart, null, `could not locate the job containing ${actionPrefix}`);

  const stepGuard = stepStart === null ? null : findIf(lines, stepStart, index);
  const jobHeaderEnd = lines.findIndex((line, i) => i > jobStart && /^\s*steps:\s*$/.test(line));
  const jobGuard = findIf(lines, jobStart, jobHeaderEnd === -1 ? lines.length : jobHeaderEnd);
  for (const guard of [stepGuard, jobGuard]) if (guard) guards.push(guard);
  return guards;
}

function findIf(lines, start, end) {
  for (let i = start; i < end; i += 1) {
    const match = /^\s*if:\s*(.+?)\s*$/.exec(lines[i]);
    if (match) return match[1];
  }
  return null;
}

test("pages.yml accepts exactly the repository_dispatch event types it documents", () => {
  assert.deepEqual(dispatchEventTypes(), ACCEPTED_DISPATCH_EVENT_TYPES);
});

test("recorded producer expectation, unverifiable from this repository: mifunedev/agro sends event_type=agro-release, and only the accepted-types list on disk is checked here", () => {
  assert.ok(
    dispatchEventTypes().includes(PRODUCER_EVENT_TYPE),
    `pages.yml must keep accepting ${PRODUCER_EVENT_TYPE}; the producer repository is not present here, so this asserts only the consumer half`,
  );
});

test("OH_SCRIPTS_REF resolves client_payload.ref, then inputs.ref, then the literal main, in that order", () => {
  assert.deepEqual(refPrecedenceOperands(), REF_PRECEDENCE);
});

test("recorded producer expectation, unverifiable from this repository: the dispatch payload key is client_payload.ref, and only this workflow's read of it is checked here", () => {
  const [first] = refPrecedenceOperands();
  assert.equal(first, `github.event.client_payload.${PRODUCER_PAYLOAD_KEY}`);
});

test("the workflow_dispatch ref input keeps its documented default", () => {
  const input = workflowDispatchRefInput();
  assert.equal(input.default, WORKFLOW_DISPATCH_REF_DEFAULT);
  assert.equal(input.required, "false");
});

test("every step and job that publishes to Pages is guarded to refs/heads/main and to the allowed repositories", () => {
  for (const action of PUBLISHING_ACTIONS) {
    const guards = guardsFor(action);
    assert.ok(guards.length > 0, `${action} must be guarded`);
    assert.ok(
      guards.some((guard) => guard.includes(PUBLISH_BRANCH_GUARD)),
      `${action} must be gated on ${PUBLISH_BRANCH_GUARD}; guards found: ${JSON.stringify(guards)}`,
    );
    assert.ok(
      guards.some((guard) => guard.includes(PUBLISH_REPOSITORY_GUARD)),
      `${action} must be gated on the allowed repository list; guards found: ${JSON.stringify(guards)}`,
    );
  }
});

test("the branch and repository gates are conjunctive, so a fork on main still publishes nothing", () => {
  for (const action of PUBLISHING_ACTIONS) {
    const combined = guardsFor(action).find(
      (guard) => guard.includes(PUBLISH_BRANCH_GUARD) && guard.includes(PUBLISH_REPOSITORY_GUARD),
    );
    assert.ok(combined, `${action} must carry both gates in one expression`);
    assert.ok(
      /&&/.test(combined) && !/\|\|/.test(combined),
      `${action} must join its gates with && and never ||: ${combined}`,
    );
  }
});

test("the deploy job runs only after a build that produced the artifact", () => {
  const deployJob = /^ {2}deploy:\s*\n([\s\S]*)$/m.exec(uncomment(workflow));
  assert.ok(deployJob, "pages.yml must define a deploy job");
  assert.match(deployJob[1], /^\s*needs:\s*build\s*$/m);
});

test("a pull_request run reaches the build but no Pages publish path is reachable from it", () => {
  assert.match(uncomment(workflow), /^\s*pull_request:\s*$/m);
  for (const action of PUBLISHING_ACTIONS) {
    assert.ok(
      guardsFor(action).some((guard) => guard.includes(PUBLISH_BRANCH_GUARD)),
      `${action} must remain unreachable from a pull_request run`,
    );
  }
});
