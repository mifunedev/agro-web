import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const PAGES_DIR = "docs/console";
export const IMAGES_DIR = "static/img/console";
export const WIDTH = 1280;
export const HEIGHT = 720;
const CALLOUT_WINDOW = 3;
const IMAGE = /!\[([^\]]*)\]\(\/img\/console\/([^)\s]+)\)/g;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function checkConsoleImages({ pages, files }) {
  const problems = [];
  const names = new Set(files.map((file) => file.name));
  const referenced = new Set();

  for (const { path, content } of pages) {
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      for (const [, alt, name] of line.matchAll(IMAGE)) {
        const where = `${path}:${index + 1}`;
        referenced.add(name);
        if (!names.has(name)) problems.push(`${where}: ${name} does not exist in ${IMAGES_DIR}`);
        if (alt.trim() === "") problems.push(`${where}: ${name} has no alt text`);
        const next = lines.slice(index + 1, index + 1 + CALLOUT_WINDOW);
        if (!next.some((candidate) => candidate.trim().startsWith("Callouts:"))) {
          problems.push(`${where}: ${name} has no Callouts: line in the next ${CALLOUT_WINDOW} lines`);
        }
      }
    });
  }

  for (const { name, width, height } of files) {
    if (!referenced.has(name)) problems.push(`${IMAGES_DIR}/${name} has no reference from ${PAGES_DIR}`);
    if (width !== WIDTH || height !== HEIGHT) {
      problems.push(`${IMAGES_DIR}/${name} is ${width}x${height}, not ${WIDTH}x${HEIGHT}`);
    }
  }
  return problems;
}

export function readPngSize(buffer) {
  const isPng = buffer.length >= 24 && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
  if (!isPng || buffer.toString("ascii", 12, 16) !== "IHDR") return { width: 0, height: 0 };
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export function loadConsoleTree(root) {
  const pagesDir = join(root, PAGES_DIR);
  const imagesDir = join(root, IMAGES_DIR);
  const pages = readdirSync(pagesDir)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => ({ path: `${PAGES_DIR}/${name}`, content: readFileSync(join(pagesDir, name), "utf8") }));
  const files = readdirSync(imagesDir).map((name) => ({
    name,
    ...readPngSize(readFileSync(join(imagesDir, name))),
  }));
  return { pages, files };
}
