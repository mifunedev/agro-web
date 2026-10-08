import assert from "node:assert/strict";
import test from "node:test";

import { proseFiles, steCheckUrl, visibleText } from "./check-ste.mjs";

test("the STE checker URL pins the release tag", () => {
  assert.equal(
    steCheckUrl("v0.18.1"),
    "https://raw.githubusercontent.com/mifunedev/agro/v0.18.1/.agro/skills/ste/scripts/ste-check.sh",
  );
});

test("the prose set holds the site pages, the Console guide, and every blog post", () => {
  const files = proseFiles();
  assert.ok(files.includes("docs/open-core.md"));
  assert.ok(files.includes("docs/console/intro.md"));
  assert.ok(files.includes("blog/archive/2026-04-28-byoh.md"));
  assert.ok(files.some((f) => /^blog\/2026-.*\.md$/.test(f)));
  assert.equal(files.filter((f) => f.startsWith("docs/agro/")).length, 0);
});

const PAGE = `
import Link from "@docusaurus/Link";
const ITEMS = [{ name: "Claude Code", body: "Claude Code is an agent." }];
const SCRIPT = \`# a code block
agro shell\`;
export default function Home() {
  fetch("https://example.com/a b", { headers: { Accept: "x y" } });
  return (
    <Layout description="Run agents in a sandbox.">
      <p className="hero hero--big">
        Run <code>agro harness install &lt;id&gt;</code> to add a harness.
      </p>
      <span aria-hidden="true">·</span>
      <img alt="AGRO logo" src="/a b.png" />
      <h2>{title}</h2>
    </Layout>
  );
}
`;

test("visible text keeps JSX text, inline code, text attributes, and data strings", () => {
  const text = visibleText(PAGE);
  assert.ok(text.includes("Run `agro harness install <id>` to add a harness."));
  assert.ok(text.includes("Run agents in a sandbox."));
  assert.ok(text.includes("AGRO logo"));
  assert.ok(text.includes("Claude Code is an agent."));
});

test("visible text drops class names, call arguments, code blocks, and a bare inline code element", () => {
  const text = visibleText(PAGE);
  for (const dropped of ["hero hero--big", "x y", "https://example.com/a b", "/a b.png", "agro harness install <id>", "agro shell"]) {
    assert.ok(!text.some((s) => s === dropped || s.includes("# a code block")), dropped);
  }
});
