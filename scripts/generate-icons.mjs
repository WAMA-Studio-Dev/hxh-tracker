// Rasterizes public/icon.svg (the source of truth for the app icon) into every
// PWA/browser icon asset via sharp.
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const svgPath = join(ROOT, "public", "icon.svg");
const iconsDir = join(ROOT, "public", "icons");
mkdirSync(iconsDir, { recursive: true });

const baseSvg = readFileSync(svgPath, "utf8");

// Maskable variant: full-bleed square background (no corner radius, edge-to-edge)
// with the glyph scaled down + centered so it stays inside the ~80%-diameter safe circle.
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#0f1715"/>
<stop offset="100%" stop-color="#0a0d0c"/>
</linearGradient>
</defs>
<rect x="0" y="0" width="380" height="380" fill="url(#bg2)"/>
<g transform="translate(190,190) scale(0.72) translate(-190,-190)">
<path d="M55 60 L150 200 L60 300" fill="none" stroke="#e8e6e0" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M325 60 L230 200 L320 300" fill="none" stroke="#e8e6e0" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
<polygon points="190,110 238,190 190,270 142,190" fill="#10b981" stroke="#059669" stroke-width="4"/>
<polygon points="190,142 214,190 190,238 166,190" fill="#0a0d0c" opacity="0.55"/>
<circle cx="190" cy="190" r="7" fill="#f59e0b"/>
</g>
</svg>
`;

function renderPng(svg, size, outPath) {
  return sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toFile(outPath);
}

function buildIco(pngBuffers, outPath) {
  const count = pngBuffers.length;
  let offset = 6 + 16 * count;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4); // image count

  const dirEntries = [];
  const imageBuffers = [];
  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(buffer.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // offset
    offset += buffer.length;
    dirEntries.push(entry);
    imageBuffers.push(buffer);
  }

  writeFileSync(outPath, Buffer.concat([header, ...dirEntries, ...imageBuffers]));
}

async function main() {
  await renderPng(baseSvg, 192, join(iconsDir, "icon-192.png"));
  await renderPng(baseSvg, 512, join(iconsDir, "icon-512.png"));
  await renderPng(baseSvg, 180, join(ROOT, "public", "apple-touch-icon.png"));
  await renderPng(maskableSvg, 512, join(iconsDir, "icon-maskable-512.png"));

  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const size of icoSizes) {
    const buffer = await sharp(Buffer.from(baseSvg), { density: 384 }).resize(size, size).png().toBuffer();
    pngBuffers.push({ size, buffer });
  }
  buildIco(pngBuffers, join(ROOT, "public", "favicon.ico"));

  console.log("Icons generated from public/icon.svg: public/icons/*, public/apple-touch-icon.png, public/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
