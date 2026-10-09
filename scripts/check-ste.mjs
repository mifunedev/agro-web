import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import ts from "typescript";

import { get, MirrorError, REPO, resolveReleaseTag } from "./oh-source.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROSE = /\.mdx?$/;
const TEXT_ATTRIBUTES = new Set(["alt", "aria-label", "title", "description"]);

export function steCheckUrl(tag) {
  return `https://raw.githubusercontent.com/${REPO}/${tag}/.agro/skills/ste/scripts/ste-check.sh`;
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export function proseFiles(root = ROOT) {
  const topLevelDocs = readdirSync(join(root, "docs"))
    .map((entry) => join(root, "docs", entry))
    .filter((path) => PROSE.test(path) && statSync(path).isFile());
  const nested = ["docs/console", "blog"].flatMap((dir) => walk(join(root, dir)).filter((path) => PROSE.test(path)));
  return [...topLevelDocs, ...nested].map((path) => relative(root, path)).sort();
}

const squash = (text) => text.replace(/\s+/g, " ").trim();

function elementText(node, sourceFile) {
  return node.children
    .map((child) => {
      if (ts.isJsxText(child)) return child.getText(sourceFile);
      if (ts.isJsxElement(child) && child.children.every(ts.isJsxText)) {
        const inner = squash(child.children.map((c) => c.getText(sourceFile)).join(""));
        return child.openingElement.tagName.getText(sourceFile) === "code" ? ` \`${inner}\` ` : ` ${inner} `;
      }
      return " ";
    })
    .join("");
}

const decode = (text) =>
  text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

export function visibleText(source, fileName = "page.tsx") {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const strings = [];
  const visit = (node) => {
    if (ts.isJsxElement(node) && node.children.some((c) => ts.isJsxText(c) && c.getText(sourceFile).trim())) {
      strings.push(decode(squash(elementText(node, sourceFile))));
      ts.forEachChild(node.openingElement, visit);
      node.children.filter((c) => !(ts.isJsxElement(c) && c.children.every(ts.isJsxText))).forEach(visit);
      return;
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sourceFile);
      if (TEXT_ATTRIBUTES.has(name) && node.initializer && ts.isStringLiteral(node.initializer)) {
        strings.push(node.initializer.text);
      }
      return;
    } else if (ts.isStringLiteral(node) && /\s/.test(node.text) && !ts.isImportDeclaration(node.parent)) {
      const call = ts.findAncestor(node, ts.isCallExpression);
      if (!call) strings.push(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return strings.filter((s) => /[A-Za-z]/.test(s)).map(squash);
}

function pageTextFiles(outDir, root = ROOT) {
  const pagesDir = join(root, "src/pages");
  return readdirSync(pagesDir)
    .filter((entry) => entry.endsWith(".tsx"))
    .map((entry) => {
      const out = join(outDir, `src-pages-${basename(entry, ".tsx")}.md`);
      const strings = visibleText(readFileSync(join(pagesDir, entry), "utf8"), entry);
      writeFileSync(out, strings.join("\n\n") + "\n");
      return out;
    });
}

async function fetchSteCheck(tag) {
  const url = steCheckUrl(tag);
  const res = await get(url, globalThis.fetch.bind(globalThis));
  if (!res.ok) throw new MirrorError(`${REPO}@${tag} has no STE checker (${url} -> HTTP ${res.status})`);
  return { url, body: await res.text() };
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  const workDir = mkdtempSync(join(tmpdir(), "agro-web-ste-"));
  let checker;
  try {
    const tag = await resolveReleaseTag();
    const { url, body } = await fetchSteCheck(tag);
    checker = join(workDir, "ste-check.sh");
    writeFileSync(checker, body);
    console.log(`[ste] ${url}`);
  } catch (err) {
    console.error(`[ste] FATAL: ${err.message}`);
    process.exit(1);
  }
  const files = [...proseFiles(), ...pageTextFiles(workDir)];
  console.log(`[ste] src/pages/*.tsx visible text: ${workDir}`);
  const run = spawnSync("bash", [checker, ...files], { cwd: ROOT, stdio: "inherit" });
  process.exit(run.status ?? 1);
}
