import assert from "node:assert/strict";
import test from "node:test";

import {
  addSidebarPosition,
  addTitleFrontmatter,
  prefixCategoryDocId,
  readmeOrder,
  rewriteOutboundLinks,
  transformPage,
} from "./sync-agro-docs.mjs";

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

test("readmeOrder lists relative .md links in order, first occurrence wins", () => {
  const readme = [
    "- [Intro](intro.md)",
    "- [Quick](./quickstart.md#top) · [Intro again](intro.md)",
    "- [Out](../.agro/x.md) [Web](https://x.dev/a.md) [Abs](/docs/a.md) [Img](logo.png)",
    "```md",
    "[Fenced](fenced.md)",
    "```",
    "- [Codex](harnesses/codex.md \"Codex\")",
  ].join("\n");
  assert.deepEqual(readmeOrder(readme), ["intro.md", "quickstart.md", "harnesses/codex.md"]);
});

test("addSidebarPosition adds a position to frontmatter or creates frontmatter", () => {
  assert.equal(
    addSidebarPosition('---\ntitle: "Intro"\n---\n\n# Intro\n', 0),
    '---\ntitle: "Intro"\nsidebar_position: 0\n---\n\n# Intro\n',
  );
  assert.equal(addSidebarPosition("Body\n", 3), "---\nsidebar_position: 3\n---\n\nBody\n");
});

test("addSidebarPosition keeps an existing position and skips an unlisted page", () => {
  const page = "---\nsidebar_position: 7\n---\n\n# X\n";
  assert.equal(addSidebarPosition(page, 2), page);
  assert.equal(addSidebarPosition("# Y\n", undefined), "# Y\n");
});

test("transformPage adds title and position together", () => {
  assert.equal(
    transformPage("# Codex\n", "harnesses/codex.md", TAG, 12),
    '---\ntitle: "Codex"\nsidebar_position: 12\n---\n\n# Codex\n',
  );
});

test("a generated title drops inline Markdown and keeps the text", () => {
  const title = (heading) => addTitleFrontmatter(`# ${heading}\n`).match(/^title: (.*)$/m)[1];
  assert.equal(title("Creating a sandbox: `agro sandbox install docker`"), '"Creating a sandbox: agro sandbox install docker"');
  assert.equal(title("`.agro/` directory layout"), '".agro/ directory layout"');
  assert.equal(title("**Bold** and __strong__ and *em* and _under_ text"), '"Bold and strong and em and under text"');
  assert.equal(title("See [the guide](./guide.md) now"), '"See the guide now"');
  assert.equal(title("Keep snake_case_name"), '"Keep snake_case_name"');
});
