/**
 * Second set of logo directions (6–10) for RUHOR. Geometry only, no fonts.
 * Run: node scripts/concepts2.mjs  → brand/concepts/concept-6..10.svg and board2.png
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { R, GLYPHS, WORDMARK_LAYOUT, WORDMARK_SIZE } from '../src/brand/logo.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'brand', 'concepts');
await fs.mkdir(OUT, { recursive: true });

const C = { ink: '#131518', basalt: '#1C1F23', stone: '#F2F0EB', plaster: '#E7E3DB', kiln: '#E0592A', brass: '#C4A46A', brassLight: '#DCC48E', concrete: '#5A5F66', blue: '#0E1C26' };

const rGlyph = (fill, strut) => `<path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/>`;
const bold = (fill, strut = fill) =>
  WORDMARK_LAYOUT.map(({ glyph, x }, i) =>
    glyph === 'R'
      ? `<g transform="translate(${x} 0)">${rGlyph(fill, i === 0 ? strut : fill)}</g>`
      : `<path transform="translate(${x} 0)" fill="${fill}"${glyph === 'O' ? ' fill-rule="evenodd"' : ''} d="${GLYPHS[glyph]}"/>`,
  ).join('');
const WW = WORDMARK_SIZE.width; // 232

const concepts = [];

// 6 — RHOMBUS SEAL: brass diamond with the R cut out of it.
concepts.push({
  bg: C.ink, vb: [320, 340],
  svg: `
  <polygon points="160,44 266,150 160,256 54,150" fill="${C.brass}"/>
  <polygon points="160,58 252,150 160,242 68,150" fill="none" stroke="${C.ink}" stroke-width="1" opacity="0.55"/>
  <g transform="translate(${160 - 29.6} ${150 - 38.4}) scale(1.6)">${rGlyph(C.ink, C.stone)}</g>
  <g transform="translate(${160 - 34.8} 290) scale(0.3)">${bold(C.stone)}</g>
  <path d="M78 301H118M202 301H242" stroke="${C.brass}" stroke-width="0.8"/>`,
});

// 7 — KEYSTONE ARCH: nine voussoirs, the keystone in accent colour, R standing under the arch.
{
  const cx = 170, cy = 190, n = 9, gapDeg = 2.2;
  const pt = (deg, r) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const wedges = Array.from({ length: n }, (_, i) => {
    const a1 = 180 + (180 / n) * i + gapDeg / 2, a2 = 180 + (180 / n) * (i + 1) - gapDeg / 2;
    const key = i === Math.floor(n / 2);
    const ro = key ? 112 : 100, ri = 72;
    const [x1o, y1o] = pt(a1, ro), [x2o, y2o] = pt(a2, ro), [x2i, y2i] = pt(a2, ri), [x1i, y1i] = pt(a1, ri);
    return `<path d="M${x1o.toFixed(2)} ${y1o.toFixed(2)}A${ro} ${ro} 0 0 1 ${x2o.toFixed(2)} ${y2o.toFixed(2)}L${x2i.toFixed(2)} ${y2i.toFixed(2)}A${ri} ${ri} 0 0 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)}Z" fill="${key ? C.kiln : C.stone}"/>`;
  }).join('');
  concepts.push({
    bg: C.ink, vb: [340, 300],
    svg: `
    ${wedges}
    <rect x="${cx - 100}" y="${cy}" width="200" height="1.5" fill="${C.stone}" opacity="0.35"/>
    <g transform="translate(${cx - 20} ${cy - 55}) scale(1.05)">${rGlyph(C.stone, C.kiln)}</g>
    <g transform="translate(${cx - (WW * 0.34) / 2} 226) scale(0.34)">${bold(C.stone)}</g>`,
  });
}

// 8 — ISOMETRIC BLOCK: three tones, the R lying on the top face.
{
  const s = 90, dx = s * Math.cos(Math.PI / 6), dy = s * 0.5;
  const T = [160, 50], UR = [160 + dx, 50 + dy], M = [160, 50 + 2 * dy], UL = [160 - dx, 50 + dy], LR = [160 + dx, 50 + dy + s], B = [160, 50 + 2 * dy + s], LL = [160 - dx, 50 + dy + s];
  const poly = (...p) => p.map((q) => q.map((v) => v.toFixed(2)).join(',')).join(' ');
  const sc = 1.05;
  const a = 0.866 * sc, b = -0.5 * sc, c = 0.866 * sc, d = 0.5 * sc;
  const e = 160 - (a * 18.5 + c * 24), f = 95 - (b * 18.5 + d * 24) + 0;
  concepts.push({
    bg: C.basalt, vb: [320, 340],
    svg: `
    <polygon points="${poly(T, UR, M, UL)}" fill="${C.stone}"/>
    <polygon points="${poly(UL, M, B, LL)}" fill="${C.concrete}"/>
    <polygon points="${poly(M, UR, LR, B)}" fill="${C.ink}" stroke="${C.brass}" stroke-width="1"/>
    <g transform="matrix(${a} ${b} ${c} ${d} ${e} ${f})">${rGlyph(C.ink, C.kiln)}</g>
    <g transform="translate(${160 - (WW * 0.32) / 2} 276) scale(0.32)">${bold(C.stone)}</g>`,
  });
}

// 9 — MOMENTUM: slanted heavy wordmark with a long accent bar (confident, contemporary).
{
  const k = 1.3, k14 = Math.tan((14 * Math.PI) / 180);
  concepts.push({
    bg: C.stone, vb: [420, 220],
    svg: `
    <g transform="translate(${210 - (WW * k) / 2 + k14 * 70} 62) skewX(-14)">
      <g transform="scale(${k})">${bold(C.ink, C.kiln)}</g>
      <rect x="0" y="${48 * k + 14}" width="${WW * k}" height="7" fill="${C.kiln}"/>
      <rect x="${WW * k - 46}" y="${48 * k + 28}" width="46" height="2" fill="${C.ink}"/>
    </g>`,
  });
}

// 10 — BLUEPRINT: survey crosshair + monoline R and a dimension line. Technical, precise.
{
  const cx = 180, cy = 150;
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const ang = (i * 10 * Math.PI) / 180, major = i % 9 === 0, r1 = 90, r2 = major ? 106 : 96;
    return `<path d="M${(cx + r1 * Math.cos(ang)).toFixed(2)} ${(cy + r1 * Math.sin(ang)).toFixed(2)}L${(cx + r2 * Math.cos(ang)).toFixed(2)} ${(cy + r2 * Math.sin(ang)).toFixed(2)}"/>`;
  }).join('');
  concepts.push({
    bg: C.blue, vb: [360, 350],
    svg: `
    <g fill="none" stroke="${C.stone}" stroke-width="0.9" opacity="0.9">
      <circle cx="${cx}" cy="${cy}" r="84"/>${ticks}
      <path d="M40 ${cy}H78M282 ${cy}H320M${cx} 22V60M${cx} 240V278" stroke-dasharray="none"/>
    </g>
    <g transform="translate(${cx - 13.5 * 1.5} ${cy - 36}) scale(1.5)" fill="none" stroke-width="2" stroke-linecap="square">
      <path d="M0 48V0H15A12.5 12.5 0 0 1 15 25H0" stroke="${C.stone}"/><path d="M13 25L27 48" stroke="${C.kiln}"/>
    </g>
    <g stroke="${C.stone}" stroke-width="0.9" fill="none">
      <path d="M52 312H132M228 312H308M52 304V320M308 304V320"/>
      <path d="M62 308L52 312L62 316M298 308L308 312L298 316" fill="${C.stone}"/>
    </g>
    <g transform="translate(${180 - (WW * 0.32) / 2} ${312 - 7.7}) scale(0.32)">${bold(C.stone)}</g>`,
  });
}

// ---------- write files ----------
const standalone = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.vb[0]} ${c.vb[1]}"><rect width="${c.vb[0]}" height="${c.vb[1]}" fill="${c.bg}"/>${c.svg}</svg>\n`;
for (const [i, c] of concepts.entries()) await fs.writeFile(path.join(OUT, `concept-${i + 6}.svg`), standalone(c));

const GAP = 16, PW = 640, PH = 640;
const layout = [[0, 0, PW, PH], [PW + GAP, 0, PW, PH], [2 * (PW + GAP), 0, PW, PH], [0, PH + GAP, 976, PH], [976 + GAP, PH + GAP, 976, PH]];
const W = 3 * PW + 2 * GAP, H = 2 * PH + GAP;
const panels = concepts.map((c, i) => {
  const [x, y, w, h] = layout[i];
  const k = Math.min((w * 0.82) / c.vb[0], (h * 0.82) / c.vb[1]);
  const ox = x + (w - c.vb[0] * k) / 2, oy = y + (h - c.vb[1] * k) / 2;
  const dark = ![C.stone, C.plaster].includes(c.bg);
  const col = dark ? C.brass : C.ink;
  // marker: hollow ring + i+1 dots = concept (i + 6) is "second set, number i+1"
  const dots = Array.from({ length: i + 1 }, (_, n) => `<circle cx="${x + 52 + n * 14}" cy="${y + 28}" r="3.5" fill="${col}"/>`).join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.bg}"/><g transform="translate(${ox} ${oy}) scale(${k})">${c.svg}</g><circle cx="${x + 30}" cy="${y + 28}" r="5" fill="none" stroke="${col}" stroke-width="1.5"/>${dots}`;
}).join('');
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#08090a"/>${panels}</svg>`;
await sharp(Buffer.from(board), { density: 96 }).png().toFile(path.join(OUT, 'board2.png'));
console.log('written');
