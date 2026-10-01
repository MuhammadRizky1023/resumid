import fs from "node:fs";
import path from "node:path";

const clientDir = path.resolve("build", "client");
const indexPath = path.join(clientDir, "index.html");

if (!fs.existsSync(clientDir)) {
  throw new Error(`Client directory not found: ${clientDir}`);
}

if (!fs.existsSync(indexPath)) {
  throw new Error(`index.html not found: ${indexPath}`);
}

// --------------------------------------------------
// 1. Fix index.html
// --------------------------------------------------

let html = fs.readFileSync(indexPath, "utf8");

html = html.replaceAll('"/assets/', '"/resumid/assets/');
html = html.replaceAll("'/assets/", "'/resumid/assets/");
html = html.replaceAll("`/assets/", "`/resumid/assets/");

fs.writeFileSync(indexPath, html, "utf8");

console.log("✓ Fixed index.html asset paths");

// --------------------------------------------------
// 2. Fix React Router manifest
// --------------------------------------------------

const assetsDir = path.join(clientDir, "assets");

const assetFiles = fs.readdirSync(assetsDir);

const manifestFiles = assetFiles.filter(
  (file) =>
    file.startsWith("manifest-") &&
    file.endsWith(".js")
);

if (manifestFiles.length === 0) {
  throw new Error("React Router manifest file not found.");
}

for (const manifestFile of manifestFiles) {
  const manifestPath = path.join(assetsDir, manifestFile);

  let manifest = fs.readFileSync(manifestPath, "utf8");

  manifest = manifest.replaceAll(
    '"/assets/',
    '"/resumid/assets/'
  );

  fs.writeFileSync(manifestPath, manifest, "utf8");

  console.log(`✓ Fixed ${manifestFile}`);
}

// --------------------------------------------------
// 3. Create GitHub Pages SPA fallback
// --------------------------------------------------

const fallbackPath = path.join(clientDir, "404.html");

fs.copyFileSync(indexPath, fallbackPath);

console.log("✓ Created 404.html");

console.log("");
console.log("GitHub Pages preparation completed.");