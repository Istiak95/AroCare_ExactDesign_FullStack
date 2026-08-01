import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "frontend", "src");
const hooks = ["useState", "useEffect", "useMemo", "useRef", "useCallback"];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const jsxFiles = walk(src).filter((file) => file.endsWith(".jsx"));
for (const file of jsxFiles) {
  const text = fs.readFileSync(file, "utf8");
  assert.match(text, /import\s+React(?:\s*,|\s+from)/, `React import missing: ${path.relative(root, file)}`);
  const reactImport = text.match(/import\s+React(?:\s*,\s*\{([^}]*)\})?\s+from\s+["']react["']/)?.[1] || "";
  for (const hook of hooks) {
    if (new RegExp(`\\b${hook}\\s*\\(`).test(text)) {
      assert.ok(reactImport.split(",").map((item) => item.trim()).includes(hook), `${hook} import missing: ${path.relative(root, file)}`);
    }
  }
}

const allSource = walk(src).filter((file) => /\.(jsx|js)$/.test(file)).map((file) => fs.readFileSync(file, "utf8")).join("\n");
assert.doesNotMatch(allSource, /\/products\/p\d+\.svg/, "Old SVG product references remain in frontend source");
console.log(`Frontend static checks passed for ${jsxFiles.length} JSX files.`);
