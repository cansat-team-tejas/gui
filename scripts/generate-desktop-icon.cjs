const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const src = path.join(__dirname, "..", "public", "images", "logo-1.svg");
const dest = path.join(__dirname, "..", "public", "images", "logo-1.png");

async function main() {
  if (!fs.existsSync(src)) {
    throw new Error(`Desktop icon source not found: ${src}`);
  }

  await sharp(src)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(dest);

  console.log(`Generated desktop icon: ${dest}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
