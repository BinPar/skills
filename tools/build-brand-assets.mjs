// Maintainer script: derives app tiles, favicons and PNG logo renders from the
// official SVGs (manual v1.0 specs), then syncs shared assets into binpar-documents.
// Usage: node tools/build-brand-assets.mjs   (needs Chrome + python3 with Pillow for .ico)
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launchChrome } from "../skills/binpar-documents/scripts/lib/chrome.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "skills/binpar-brand-design-system/assets");
const DOCS = join(ROOT, "skills/binpar-documents/assets");
const LOGOS = join(BRAND, "logos");
const ICONS = join(BRAND, "icons");
mkdirSync(join(LOGOS, "png"), { recursive: true });
mkdirSync(ICONS, { recursive: true });

const isoPath = readFileSync(join(LOGOS, "binpar-isotipo-light.svg"), "utf8").match(/ d="([^"]+)"/)[1];
const ISO_W = 121.76;
const ISO_H = 131.79;

// Tile: 96 side, radius 28, isotype at 58% width, 145deg gradient (manual p.06/12).
function tile(theme, { radius = 28 } = {}) {
  const t = {
    light: { a: "#FFFFFF", b: "#F6FAFC", mark: "#006D79", line: "rgba(5,33,94,0.08)" },
    dark: { a: "#172C3D", b: "#0C1C2B", mark: "#00BCBB", line: "rgba(125,211,252,0.16)" },
  }[theme];
  const w = 96 * 0.58;
  const s = w / ISO_W;
  const x = (96 - w) / 2;
  const y = (96 - ISO_H * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="9.6" y1="-6.8" x2="86.4" y2="102.8">
      <stop offset="0" stop-color="${t.a}"/>
      <stop offset="1" stop-color="${t.b}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="95" height="95" rx="${radius}" fill="url(#g)" stroke="${t.line}"/>
  <path transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) scale(${s.toFixed(5)})" fill="${t.mark}" d="${isoPath}"/>
</svg>
`;
}

// Favicon: bare isotype, no tile (manual p.12); follows the browser theme.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ISO_W} ${ISO_H}">
  <style>path{fill:#006D79}@media (prefers-color-scheme:dark){path{fill:#00BCBB}}</style>
  <path d="${isoPath}"/>
</svg>
`;

// Flaps (manual p.34): organic veils of cyan, a displaced copy behind for depth,
// linear endless morph. Keyframes from the website's ProductSignal. No yellow.
const FLAP = [
  "M72 96C108 34 184 34 230 76C270 112 326 98 348 150C376 214 312 260 250 288C190 314 156 342 106 314C54 286 78 242 42 202C8 164 28 122 72 96Z",
  "M104 62C148 22 214 48 242 100C270 150 338 122 354 184C374 256 292 276 226 268C164 260 148 326 94 294C38 260 78 222 38 180C0 140 58 100 104 62Z",
  "M54 122C90 50 168 26 226 62C284 98 304 118 346 154C390 194 326 272 272 306C218 340 168 320 114 304C58 288 72 240 34 200C-2 162 12 142 54 122Z",
  "M92 70C132 18 208 28 238 88C266 142 332 106 362 164C394 226 306 270 240 300C176 330 136 322 90 294C40 262 86 226 38 184C0 148 50 108 92 70Z",
  "M64 108C100 34 178 44 224 68C270 92 324 108 344 168C364 226 318 284 252 284C186 284 174 340 112 318C54 298 70 248 38 208C8 172 20 134 64 108Z",
];
const flap = (theme, dur) => {
  const c = theme === "light" ? { a: "#0891B2", b: "#14B8A6", o1: 0.16, o2: 0.07 } : { a: "#00BCBB", b: "#14B8A6", o1: 0.14, o2: 0.05 };
  const loop = (shift) => [...FLAP.slice(shift), ...FLAP.slice(0, shift), FLAP[shift]].join(";");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 384" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="f" x1="52" y1="48" x2="330" y2="318" gradientUnits="userSpaceOnUse">
      <stop stop-color="${c.a}" stop-opacity="${c.o1}"/>
      <stop offset="1" stop-color="${c.b}" stop-opacity="${c.o2}"/>
    </linearGradient>
  </defs>
  <path transform="translate(-24 40)" fill="url(#f)" opacity="0.55" d="${FLAP[1]}">
    <animate attributeName="d" dur="${(dur * 1.37).toFixed(1)}s" repeatCount="indefinite" values="${loop(1)}"/>
  </path>
  <path fill="url(#f)" d="${FLAP[0]}">
    <animate attributeName="d" dur="${dur}s" repeatCount="indefinite" values="${loop(0)}"/>
  </path>
</svg>
`;
};
const SHAPES = join(BRAND, "shapes");
mkdirSync(SHAPES, { recursive: true });
for (const theme of ["light", "dark"]) {
  writeFileSync(join(SHAPES, `flap-large-${theme}.svg`), flap(theme, 15));
  writeFileSync(join(SHAPES, `flap-small-${theme}.svg`), flap(theme, 10));
}

writeFileSync(join(ICONS, "app-tile-light.svg"), tile("light"));
writeFileSync(join(ICONS, "app-tile-dark.svg"), tile("dark"));
writeFileSync(join(ICONS, "favicon.svg"), favicon);

const browser = await launchChrome();
const page = await browser.newPage({ width: 1200, height: 1200 });

async function rasterize(svgFile, outFile, w, h) {
  const html = `<html><body style="margin:0;background:transparent">
<img src="${pathToFileURL(svgFile)}" style="display:block;width:${w}px;height:${h}px"></body></html>`;
  const tmp = join(ICONS, ".tmp.html");
  writeFileSync(tmp, html);
  await page.goto(pathToFileURL(tmp).href);
  writeFileSync(outFile, await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, transparent: true }));
  execFileSync("rm", [tmp]);
}

// Square full-bleed tile for platforms that apply their own mask (iOS, Android).
const square = (theme) => tile(theme, { radius: 0 }).replace(/ stroke="[^"]+"/, "");
writeFileSync(join(ICONS, ".sq.svg"), square("light"));
await rasterize(join(ICONS, ".sq.svg"), join(ICONS, "apple-touch-icon.png"), 180, 180);
await rasterize(join(ICONS, ".sq.svg"), join(ICONS, "icon-512-maskable.png"), 512, 512);
execFileSync("rm", [join(ICONS, ".sq.svg")]);

for (const theme of ["light", "dark"]) {
  for (const size of [192, 512]) await rasterize(join(ICONS, `app-tile-${theme}.svg`), join(ICONS, `app-tile-${theme}-${size}.png`), size, size);
}
for (const size of [16, 32, 48]) {
  const light = join(LOGOS, "binpar-isotipo-light.svg");
  const w = Math.round((size * ISO_W) / ISO_H);
  await rasterize(light, join(ICONS, `.fav-${size}.png`), w, size);
}

// Logo PNGs for media that can't take SVG (docx, pptx, email).
for (const f of readdirSync(LOGOS).filter((n) => n.endsWith(".svg"))) {
  const vb = readFileSync(join(LOGOS, f), "utf8").match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const h = f.includes("isotipo") ? 512 : f.includes("vertical") ? 512 : 256;
  const w = Math.round((h * vb[2]) / vb[3]);
  await rasterize(join(LOGOS, f), join(LOGOS, "png", f.replace(".svg", ".png")), w, h);
}
await browser.close();

// .ico (16/32/48) via Pillow, square-padded.
execFileSync("python3", [
  "-I",
  "-c",
  `
from PIL import Image
import sys, os
d = sys.argv[1]
frames = []
for s in (16, 32, 48):
    src = Image.open(os.path.join(d, f'.fav-{s}.png')).convert('RGBA')
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    sq.paste(src, ((s - src.width) // 2, 0))
    frames.append(sq)
    os.remove(os.path.join(d, f'.fav-{s}.png'))
frames[2].save(os.path.join(d, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)], append_images=frames[:2])
`,
  ICONS,
]);

// binpar-documents ships its own copy so it works when installed alone.
// Fonts for PDFs are static instances (tools/make-static-fonts.py), not the variable files.
cpSync(join(BRAND, "logos"), join(DOCS, "logos"), { recursive: true, filter: (p) => !p.includes("/png") });
for (const f of ["OFL-Sora.txt", "OFL-PlusJakartaSans.txt"]) cpSync(join(BRAND, "fonts", f), join(DOCS, "fonts", f));
for (const f of ["tokens.css", "components.css"]) cpSync(join(BRAND, "css", f), join(DOCS, "css", f));
console.log("Brand assets built and synced.");
