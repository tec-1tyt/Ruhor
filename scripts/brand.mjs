/**
 * Generates the RUHOR brand kit from src/brand/logo.ts:
 *   brand/   — logo SVGs (full / icon, light / dark / mono), fan pattern, brand board preview
 *   public/  — favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512.png, og.jpg
 *
 * Run once after changing the logo:  npm run brand
 * (Node 22.18+ strips TypeScript types natively, so logo.ts is imported directly.)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { R, GLYPHS, WORDMARK_LAYOUT, WORDMARK_SIZE, MARK_SIZE, BRAND_COLORS as C } from '../src/brand/logo.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = path.join(root, 'brand');
const PUBLIC = path.join(root, 'public');
await fs.mkdir(BRAND, { recursive: true });

/** R glyph as SVG group; strut in accent colour unless mono. */
const rGroup = (fill, strutFill, x = 0) =>
  `<g transform="translate(${x} 0)"><path fill="${strutFill}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/></g>`;

const glyph = (g, x, fill) =>
  `<path transform="translate(${x} 0)" fill="${fill}"${g === 'O' ? ' fill-rule="evenodd"' : ''} d="${GLYPHS[g]}"/>`;

/** Full wordmark; only the first R carries the accent strut. */
const wordmarkBody = (fill, accent) =>
  WORDMARK_LAYOUT.map(({ glyph: g, x }, i) =>
    g === 'R' ? rGroup(fill, i === 0 ? accent : fill, x) : glyph(g, x, fill),
  ).join('');

const svg = (w, h, body, title, pad = 0) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

const tile = (size = 64, radius = 14) => {
  // R centred optically on an ink tile (stone letter, kiln strut)
  const s = 0.62 * size / MARK_SIZE.height;
  const x = (size - MARK_SIZE.width * s) / 2;
  const y = (size - MARK_SIZE.height * s) / 2;
  return `<rect width="${size}" height="${size}" rx="${radius}" fill="${C.ink}"/><g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(4)})">${rGroup(C.stone, C.kiln)}</g>`;
};

const files = {
  'logo-full-light.svg': svg(WORDMARK_SIZE.width, WORDMARK_SIZE.height, wordmarkBody(C.ink, C.kiln), 'RUHOR', 4),
  'logo-full-dark.svg': svg(WORDMARK_SIZE.width, WORDMARK_SIZE.height, wordmarkBody(C.stone, C.kiln), 'RUHOR', 4),
  'logo-full-mono-ink.svg': svg(WORDMARK_SIZE.width, WORDMARK_SIZE.height, wordmarkBody(C.ink, C.ink), 'RUHOR', 4),
  'logo-full-mono-stone.svg': svg(WORDMARK_SIZE.width, WORDMARK_SIZE.height, wordmarkBody(C.stone, C.stone), 'RUHOR', 4),
  'icon-light.svg': svg(MARK_SIZE.width, MARK_SIZE.height, rGroup(C.ink, C.kiln), 'RUHOR', 4),
  'icon-dark.svg': svg(MARK_SIZE.width, MARK_SIZE.height, rGroup(C.stone, C.kiln), 'RUHOR', 4),
  'icon-tile.svg': svg(64, 64, tile(), 'RUHOR'),
};

// Brand pattern: segmental "fan" paving arcs derived from the R's arch.
const fanTile = (() => {
  const w = 80, h = 40, rows = [];
  for (const [ox, oy] of [[0, 0], [40, 20], [-40, 20], [0, 40], [80, 0]]) {
    for (const r of [40, 30, 20, 10]) rows.push(`<path d="M${ox + 40 - r} ${oy + 40}A${r} ${r} 0 0 1 ${ox + 40 + r} ${oy + 40}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none" stroke="${C.ink}" stroke-width="1"><title>RUHOR fan pattern tile</title>${rows.join('')}</svg>\n`;
})();
files['pattern-fan-tile.svg'] = fanTile;

for (const [name, content] of Object.entries(files)) await fs.writeFile(path.join(BRAND, name), content);

// ---------- favicons ----------
const tileSvg = (size, radius) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${tile(size, radius)}</svg>`);
await fs.writeFile(path.join(PUBLIC, 'favicon.svg'), files['icon-tile.svg']);
const png = (size, radius = Math.round(size * 0.22)) => sharp(tileSvg(size, radius)).png().toBuffer();
await fs.writeFile(path.join(PUBLIC, 'apple-touch-icon.png'), await sharp(tileSvg(180, 0)).png().toBuffer()); // iOS rounds corners itself
await fs.writeFile(path.join(PUBLIC, 'icon-192.png'), await png(192));
await fs.writeFile(path.join(PUBLIC, 'icon-512.png'), await png(512));
await fs.writeFile(path.join(PUBLIC, 'icon-maskable-512.png'), await sharp(tileSvg(512, 0)).png().toBuffer());

// favicon.ico with embedded 16/32/48 PNGs (ICO container is trivial to write by hand)
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(icoSizes.map((s) => png(s, Math.max(2, Math.round(s * 0.2)))));
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const dir = icoSizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(icoPngs[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += icoPngs[i].length; return e;
});
await fs.writeFile(path.join(PUBLIC, 'favicon.ico'), Buffer.concat([header, ...dir, ...icoPngs]));

// ---------- Open Graph image (language-neutral: logo + real project photo in the arch) ----------
const photo = await sharp(path.join(root, 'src/assets/photos/granite-square-2.jpg')).resize(560, 630, { fit: 'cover', position: 'right' }).jpeg({ quality: 82 }).toBuffer();
const arcs = [];
for (let r = 60; r <= 900; r += 60) arcs.push(`<circle cx="640" cy="760" r="${r}"/>`);
const og = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><clipPath id="arch"><path d="M640 630V280A280 280 0 0 1 1200 280V630Z"/></clipPath></defs>
  <rect width="1200" height="630" fill="${C.ink}"/>
  <g fill="none" stroke="${C.stone}" stroke-opacity="0.05">${arcs.join('')}</g>
  <image x="640" y="0" width="560" height="630" clip-path="url(#arch)" xlink:href="data:image/jpeg;base64,${photo.toString('base64')}"/>
  <g transform="translate(80 250) scale(2.05)">${wordmarkBody(C.stone, C.kiln)}</g>
  <rect x="80" y="400" width="64" height="4" fill="${C.kiln}"/>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(PUBLIC, 'og.jpg'));

// ---------- brand board preview (for review only) ----------
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="800" height="500" fill="${C.stone}"/><rect x="800" width="800" height="500" fill="${C.ink}"/>
  <g transform="translate(110 200) scale(2.5)">${wordmarkBody(C.ink, C.kiln)}</g>
  <g transform="translate(910 200) scale(2.5)">${wordmarkBody(C.stone, C.kiln)}</g>
  <rect y="500" width="1600" height="500" fill="${C.plaster}"/>
  <g transform="translate(110 590) scale(5)">${rGroup(C.ink, C.kiln)}</g>
  <g transform="translate(420 590)">${tile(240, 52)}</g>
  <g transform="translate(720 690)">${tile(64, 14)}</g><g transform="translate(820 706)">${tile(32, 7)}</g><g transform="translate(870 714)">${tile(16, 3)}</g>
  ${Object.entries({ ink: C.ink, basalt: C.basalt, concrete: C.concrete, ash: C.ash, stone: C.stone, line: C.line, kiln: C.kiln, kilnDeep: C.kilnDeep }).map(([, v], i) => `<rect x="${960 + (i % 4) * 150}" y="${600 + Math.floor(i / 4) * 170}" width="130" height="130" fill="${v}" stroke="${C.line}"/>`).join('')}
</svg>`;
await sharp(Buffer.from(board)).png().toFile(path.join(BRAND, 'brand-board-preview.png'));

console.log('Brand kit written to /brand and /public');
