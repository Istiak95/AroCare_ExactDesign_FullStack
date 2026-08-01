import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../backend/src/data.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
for (const product of products) {
  const file = path.join(root, "frontend", "public", product.image.replace(/^\//, ""));
  assert.ok(fs.existsSync(file), `Missing image: ${product.image}`);
  assert.ok(fs.statSync(file).size > 10_000, `Image looks incomplete: ${product.image}`);
}
const placeholder = path.join(root, "frontend", "public", "products", "placeholder.png");
assert.ok(fs.existsSync(placeholder), "Missing placeholder image");
console.log(`Product image checks passed for ${products.length} products.`);
