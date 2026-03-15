const fs = require("fs");
const path = require("path");

const releaseDir = path.join(__dirname, "..", "release");
const destDir = path.join(__dirname, "..", "public", "downloads");

function run() {
  if (!fs.existsSync(releaseDir)) {
    console.warn("copy-installer: release/ not found, skipping.");
    return;
  }

  const exes = fs
    .readdirSync(releaseDir)
    .filter((f) => f.endsWith(".exe") && !f.includes("blockmap"))
    .sort();

  if (exes.length === 0) {
    console.warn("copy-installer: no .exe found in release/, skipping.");
    return;
  }

  const src = path.join(releaseDir, exes[exes.length - 1]);
  fs.mkdirSync(destDir, { recursive: true });

  // Always write as a fixed name so the path is stable and predictable
  const dest = path.join(destDir, "CanSat-Setup.exe");
  fs.copyFileSync(src, dest);
  console.log(`copy-installer: ${src} → ${dest}`);
}

run();
