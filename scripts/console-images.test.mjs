import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { checkConsoleImages, loadConsoleTree } from "./console-images.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const page = (content) => ({ path: "docs/console/page.md", content });
const png = (name, width = 1280, height = 720) => ({ name, width, height });

const GOOD = [
  "1. Open the page.",
  "   ![The page shows the button.](/img/console/page-1.png)",
  "   Callouts: 1 is the button.",
].join("\n");

test("a complete page and its files pass", () => {
  assert.deepEqual(checkConsoleImages({ pages: [page(GOOD)], files: [png("page-1.png")] }), []);
});

test("an image link to a missing file fails", () => {
  const problems = checkConsoleImages({ pages: [page(GOOD)], files: [] });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /page-1\.png.*does not exist/);
});

test("an image without alt text fails", () => {
  const content = GOOD.replace("The page shows the button.", " ");
  const problems = checkConsoleImages({ pages: [page(content)], files: [png("page-1.png")] });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /no alt text/);
});

test("an image without a Callouts line in the next 3 lines fails", () => {
  const content = GOOD.replace("   Callouts: 1 is the button.", "\n\n\n   Callouts: 1 is the button.");
  const problems = checkConsoleImages({ pages: [page(content)], files: [png("page-1.png")] });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /no Callouts: line/);
});

test("a file without a reference fails", () => {
  const problems = checkConsoleImages({
    pages: [page(GOOD)],
    files: [png("page-1.png"), png("orphan.png")],
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /orphan\.png.*no reference/);
});

test("a PNG that is not 1280x720 fails", () => {
  const problems = checkConsoleImages({ pages: [page(GOOD)], files: [png("page-1.png", 1920, 1080)] });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /page-1\.png is 1920x1080, not 1280x720/);
});

test("the repository Console guide images pass", () => {
  const tree = loadConsoleTree(ROOT);
  assert.ok(tree.files.length > 0);
  assert.deepEqual(checkConsoleImages(tree), []);
});
