import fs from "node:fs";
import path from "node:path";

const clientDir = path.resolve("build/client");
const indexPath = path.join(clientDir, "index.html");
const fallbackPath = path.join(clientDir, "404.html");

if (!fs.existsSync(indexPath)) {
  throw new Error(`index.html tidak ditemukan: ${indexPath}`);
}

let html = fs.readFileSync(indexPath, "utf8");

// Fix React Router/Vite asset paths for GitHub Pages project site.
html = html.replaceAll('"/assets/', '"/resumid/assets/');

// Save fixed index.html.
fs.writeFileSync(indexPath, html, "utf8");

// GitHub Pages SPA fallback.
fs.copyFileSync(indexPath, fallbackPath);

console.log("GitHub Pages preparation completed.");
console.log(`- Fixed: ${indexPath}`);
console.log(`- Created: ${fallbackPath}`);