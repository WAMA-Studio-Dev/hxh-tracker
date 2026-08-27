// Draws the Hunter License-style mark (hexagon + aura ring) as raw pixels via
// pngjs — no native/canvas dependency, keeps the toolchain light.
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const BG = [10, 13, 12];
const RING = [16, 185, 129];
const DOT = [16, 185, 129];

function hexPath(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby || 1)));
  const cx = ax + t * abx;
  const cy = ay + t * aby;
  return Math.hypot(px - cx, py - cy);
}

function distToPolygonOutline(x, y, pts) {
  let min = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    min = Math.min(min, distToSegment(x, y, pts[i][0], pts[i][1], pts[j][0], pts[j][1]));
  }
  return min;
}

function blend(dst, src, alpha) {
  return dst.map((c, i) => Math.round(c * (1 - alpha) + src[i] * alpha));
}

function drawIcon(size, { maskable = false } = {}) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  const cornerRadius = size * 0.22;
  // Maskable icons need ~safe-zone padding (content within the inner 80% circle).
  const scale = maskable ? 0.62 : 0.82;
  const ringR = (size / 2) * scale;
  const hexR = ringR * 0.72;
  const dotR = size * 0.045;
  const hex = hexPath(cx, cy, hexR);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // rounded-square background clip
      const dx = Math.max(Math.abs(x - cx) - (size / 2 - cornerRadius), 0);
      const dy = Math.max(Math.abs(y - cy) - (size / 2 - cornerRadius), 0);
      const outsideCorner = Math.hypot(dx, dy) > cornerRadius;
      const insideBounds = maskable ? true : !outsideCorner;

      let color = BG;
      let alpha = insideBounds ? 1 : 0;

      if (insideBounds) {
        const distFromCenter = Math.hypot(x - cx, y - cy);
        const ringDist = Math.abs(distFromCenter - ringR);
        const ringWidth = size * 0.014;
        if (ringDist < ringWidth) {
          const a = 1 - ringDist / ringWidth;
          color = blend(BG, RING, Math.min(1, a) * 0.75);
        }

        const hexDist = distToPolygonOutline(x, y, hex);
        const hexStroke = size * 0.018;
        if (hexDist < hexStroke) {
          const a = 1 - hexDist / hexStroke;
          color = blend(color, RING, Math.min(1, a));
        }

        if (distFromCenter < dotR) {
          const a = Math.min(1, (dotR - distFromCenter) / (dotR * 0.4) + 0.3);
          color = blend(color, DOT, Math.min(1, a));
        }
      }

      png.data[idx] = color[0];
      png.data[idx + 1] = color[1];
      png.data[idx + 2] = color[2];
      png.data[idx + 3] = Math.round(alpha * 255);
    }
  }

  return PNG.sync.write(png);
}

const iconsDir = join(ROOT, "public", "icons");
mkdirSync(iconsDir, { recursive: true });

writeFileSync(join(iconsDir, "icon-192.png"), drawIcon(192));
writeFileSync(join(iconsDir, "icon-512.png"), drawIcon(512));
writeFileSync(join(iconsDir, "icon-maskable-512.png"), drawIcon(512, { maskable: true }));
writeFileSync(join(ROOT, "public", "apple-touch-icon.png"), drawIcon(180));

console.log("Icons generated in public/icons and public/apple-touch-icon.png");
