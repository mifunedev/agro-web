import assert from "node:assert/strict";
import test from "node:test";

import { addTitleFrontmatter, prefixCategoryDocId, rewriteOutboundLinks, transformPage } from "./sync-agro-docs.mjs";

const TAG = "v0.18.1";
const BLOB = `https://github.com/mifunedev/agro/blob/${TAG}`;

test("a page without frontmatter gets a title from its first # heading", () => {
  const out = addTitleFrontmatter("Intro text.\n\n# AGRO \"docs\"\n\n## Later\n");
  assert.equal(out, '---\ntitle: "AGRO \\"docs\\""\n---\n\nIntro text.\n\n# AGRO "docs"\n\n## Later\n');
});

test("a page with frontmatter but no title gets a title field", () => {
  const out = addTitleFrontmatter("---\nsidebar_position: 2\n---\n\n# Configuration\n");
  assert.equal(out, '---\ntitle: "Configuration"\nsidebar_position: 2\n---\n\n# Configuration\n');
});

test("a page that already has a title is unchanged", () => {
  const page = '---\ntitle: "Introduction"\n---\n\n# AGRO\n';
  assert.equal(addTitleFrontmatter(page), page);
});

test("a # line inside a fenced code block is not a heading", () => {
  const out = addTitleFrontmatter("```bash\n# comment\n```\n\n# Real title\n");
  assert.match(out, /^---\ntitle: "Real title"\n---\n/);
});

test("a page with no # heading is unchanged", () => {
  assert.equal(addTitleFrontmatter("## Only h2\n"), "## Only h2\n");
});

test("a relative link that leaves docs/ becomes a blob URL at the tag", () => {
  const page = "See [license](../LICENSE) and [hook](../../.pi/UPSTREAM.md#top).\n";
  assert.equal(
    rewriteOutboundLinks(page, "integrations/slack.md", TAG),
    "See [license](../LICENSE) and [hook](" + BLOB + "/.pi/UPSTREAM.md#top).\n",
  );
  assert.equal(
    rewriteOutboundLinks("[l](../LICENSE)", "intro.md", TAG),
    `[l](${BLOB}/LICENSE)`,
  );
});

test("links that stay in docs/, absolute links, and anchors are unchanged", () => {
  const page = "[a](../connecting.md) [b](./pi.md#x) [c](https://x.dev) [d](#here) [e](/docs/x) [f](mailto:a@b.c)\n";
  assert.equal(rewriteOutboundLinks(page, "harnesses/pi.md", TAG), page);
});

test("reference-style definitions and link titles are rewritten", () => {
  const page = '[x]: ../agro.json\n[y](../.agro/hooks/ "Hooks")\n';
  assert.equal(
    rewriteOutboundLinks(page, "security-considerations.md", TAG),
    `[x]: ${BLOB}/agro.json\n[y](${BLOB}/.agro/hooks/ "Hooks")\n`,
  );
});

test("links inside fenced code blocks are unchanged", () => {
  const page = "```md\n[l](../LICENSE)\n```\n";
  assert.equal(rewriteOutboundLinks(page, "intro.md", TAG), page);
});

test("transformPage applies both steps", () => {
  const out = transformPage("# Security\n\n[e](../.example.env)\n", "security-considerations.md", TAG);
  assert.equal(out, `---\ntitle: "Security"\n---\n\n# Security\n\n[e](${BLOB}/.example.env)\n`);
});

test("a category link names the doc by its id under docs/agro/", () => {
  const json = '{\n  "label": "Harnesses",\n  "link": { "type": "doc", "id": "harnesses/overview" }\n}\n';
  assert.deepEqual(JSON.parse(prefixCategoryDocId(json, "agro")), {
    label: "Harnesses",
    link: { type: "doc", id: "agro/harnesses/overview" },
  });
  const plain = '{ "label": "Integrations" }';
  assert.equal(prefixCategoryDocId(plain, "agro"), plain);
});
