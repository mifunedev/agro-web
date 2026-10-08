// Build-time copy of docs/ from the AGRO release that the site mirrors into
// docs/agro/. Runs as part of the `prebuild` hook and uses the same release tag as
// the installer and agro.js mirrors.
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { REPO, MirrorError, get, reportAndExit, resolveReleaseTag } from "./oh-source.mjs";

const TAG = "sync-agro-docs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEST = "docs/agro";

const FENCE = /^\s*(```|~~~)/;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function mapOutsideFences(text, fn) {
  let inFence = false;
  return text
    .split("\n")
    .map((line) => {
      if (FENCE.test(line)) {
        inFence = !inFence;
        return line;
      }
      return inFence ? line : fn(line);
    })
    .join("\n");
}

function firstHeading(text) {
  let inFence = false;
  for (const line of text.split("\n")) {
    if (FENCE.test(line)) inFence = !inFence;
    else if (!inFence) {
      const match = line.match(/^#\s+(.+?)\s*#*\s*$/);
      if (match) return match[1];
    }
  }
  return null;
}

export function addTitleFrontmatter(text) {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatter && /^title\s*:/m.test(frontmatter[1])) return text;
  const title = firstHeading(frontmatter ? text.slice(frontmatter[0].length) : text);
  if (!title) return text;
  const field = `title: ${JSON.stringify(title)}`;
  if (frontmatter) return text.replace(/^---\n/, `---\n${field}\n`);
  return `---\n${field}\n---\n\n${text}`;
}

function outboundUrl(target, pagePath, tag) {
  if (!target || target.startsWith("#") || target.startsWith("/") || SCHEME.test(target)) return null;
  const [path, fragment] = target.split(/(?=#)/);
  const resolved = posix.normalize(posix.join("docs", posix.dirname(pagePath), path));
  if (resolved === "docs" || resolved.startsWith("docs/") || resolved.startsWith("..")) return null;
  return `https://github.com/${REPO}/blob/${tag}/${resolved}${fragment ?? ""}`;
}

export function rewriteOutboundLinks(text, pagePath, tag) {
  const swap = (whole, before, target, after) => {
    const url = outboundUrl(target, pagePath, tag);
    return url ? `${before}${url}${after}` : whole;
  };
  return mapOutsideFences(text, (line) =>
    line
      .replace(/(\]\(\s*)([^\s)]+)((?:\s+"[^"]*")?\s*\))/g, swap)
      .replace(/^(\s*\[[^\]]+\]:\s*)(\S+)(.*)$/, swap),
  );
}

export function prefixCategoryDocId(json, prefix) {
  const category = JSON.parse(json);
  if (category.link?.type !== "doc" || !category.link.id) return json;
  category.link.id = `${prefix}/${category.link.id}`;
  return `${JSON.stringify(category, null, 2)}\n`;
}

export const INDEX = "README.md";

export function readmeOrder(readme) {
  const order = [];
  mapOutsideFences(readme, (line) => {
    for (const [, target] of line.matchAll(/\]\(\s*([^\s)#]+\.mdx?)(?:#[^\s)]*)?(?:\s+"[^"]*")?\s*\)/g)) {
      if (SCHEME.test(target) || target.startsWith("/")) continue;
      const path = posix.normalize(target);
      if (path.startsWith("..") || order.includes(path)) continue;
      order.push(path);
    }
    return line;
  });
  return order;
}

export function addSidebarPosition(text, position) {
  if (position === undefined) return text;
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatter && /^sidebar_position\s*:/m.test(frontmatter[1])) return text;
  const field = `sidebar_position: ${position}`;
  if (frontmatter) return text.replace(/^(---\n[\s\S]*?)\n---\n/, `$1\n${field}\n---\n`);
  return `---\n${field}\n---\n\n${text}`;
}

export function transformPage(text, pagePath, tag, position) {
  return rewriteOutboundLinks(addSidebarPosition(addTitleFrontmatter(text), position), pagePath, tag);
}

async function extractDocs(tag, fetchImpl, workDir) {
  const url = `https://github.com/${REPO}/archive/${tag}.tar.gz`;
  const res = await get(url, fetchImpl);
  if (!res.ok) throw new MirrorError(`${REPO}@${tag} has no source archive (${url} -> HTTP ${res.status})`);
  const archive = join(workDir, "source.tar.gz");
  await writeFile(archive, Buffer.from(await res.arrayBuffer()));
  const tar = spawnSync("tar", ["-xzf", archive, "-C", workDir], { encoding: "utf8" });
  if (tar.status !== 0) throw new MirrorError(`tar could not extract ${url}: ${tar.stderr || tar.error}`);
  const top = (await readdir(workDir, { withFileTypes: true })).find((e) => e.isDirectory());
  const docs = top && join(workDir, top.name, "docs");
  if (!docs || !existsSync(docs)) throw new MirrorError(`${url} holds no docs/ directory`);
  return { url, docs };
}

export async function syncAgroDocs({
  fetchImpl = globalThis.fetch.bind(globalThis),
  destRoot = ROOT,
  resolve: resolveTag = resolveReleaseTag,
} = {}) {
  const tag = await resolveTag();
  const workDir = await mkdtemp(join(tmpdir(), "agro-docs-"));
  try {
    const { url, docs } = await extractDocs(tag, fetchImpl, workDir);
    const index = join(docs, INDEX);
    const order = existsSync(index) ? readmeOrder(await readFile(index, "utf8")) : [];
    await rm(index, { force: true });
    const files = await readdir(docs, { recursive: true });
    const pages = files.filter((f) => /\.mdx?$/.test(f));
    for (const file of pages) {
      const full = join(docs, file);
      const position = order.indexOf(file.split(sep).join("/"));
      await writeFile(full, transformPage(await readFile(full, "utf8"), file, tag, position < 0 ? undefined : position));
    }
    for (const file of files.filter((f) => posix.basename(f) === "_category_.json")) {
      const full = join(docs, file);
      await writeFile(full, prefixCategoryDocId(await readFile(full, "utf8"), posix.basename(DEST)));
    }
    const out = join(destRoot, DEST);
    await rm(out, { recursive: true, force: true });
    await cp(docs, out, { recursive: true });
    console.log(`[${TAG}] wrote ${DEST}/ <- ${url} (${REPO}@${tag}, ${pages.length} pages)`);
    return { tag, url, pages };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  try {
    await syncAgroDocs();
  } catch (err) {
    reportAndExit(TAG, err, [join(ROOT, DEST)]);
  }
}
