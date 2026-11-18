/**
 * Five alternative logo directions for RUHOR (drawn from geometry, no fonts).
 * Run: node scripts/concepts.mjs  → brand/concepts/concept-1..5.svg and board.png
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { R, GLYPHS, WORDMARK_LAYOUT, WORDMARK_SIZE, MARK_SIZE } from '../src/brand/logo.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'brand', 'concepts');
await fs.mkdir(OUT, { recursive: true });

const C = { ink: '#131518', basalt: '#1C1F23', stone: '#F2F0EB', plaster: '#E7E3DB', kiln: '#E0592A', brass: '#C4A46A', brassLight: '#DCC48E', concrete: '#5A5F66' };

const rGlyph = (fill, strut, x = 0) =>
  `<g transform="translate(${x} 0)"><path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/></g>`;
const bold = (fill, strut = fill) =>
  WORDMARK_LAYOUT.map(({ glyph, x }, i) =>
    glyph === 'R' ? rGlyph(fill, i === 0 ? strut : fill, x) : `<path transform="translate(${x} 0)" fill="${fill}"${glyph === 'O' ? ' fill-rule="evenodd"' : ''} d="${GLYPHS[glyph]}"/>`,
  ).join('');

// monoline alphabet (height 48)
const MONO = {
  R: { w: 27, d: 'M0 48V0H15A12.5 12.5 0 0 1 15 25H0M13 25L27 48' },
  U: { w: 24, d: 'M0 0V30A12 12 0 0 0 24 30V0' },
  H: { w: 24, d: 'M0 0V48M24 0V48M0 24H24' },
  O: { w: 24, d: 'M0 12A12 12 0 0 1 24 12V36A12 12 0 0 1 0 36Z' },
};
const monoWord = (stroke, sw, gap, accent) => {
  let x = 0;
  const out = [];
  'RUHOR'.split('').forEach((ch, i) => {
    const g = MONO[ch];
    out.push(`<path transform="translate(${x} 0)" d="${g.d}" fill="none" stroke="${i === 0 && accent ? accent : stroke}" stroke-width="${sw}" stroke-linecap="square" stroke-linejoin="miter"/>`);
    x += g.w + gap;
  });
  return { svg: out.join(''), width: x - gap };
};

const concepts = [];

// 1 — HERITAGE SEAL: brass double frame, monogram, small wordmark. Quiet luxury.
concepts.push({
  bg: C.ink, vb: [320, 300],
  svg: `
  <rect x="60" y="40" width="200" height="210" fill="none" stroke="${C.brass}" stroke-width="1.6"/>
  <rect x="68" y="48" width="184" height="194" fill="none" stroke="${C.brass}" stroke-width="0.6"/>
  ${[[58, 38], [258, 38], [58, 248], [258, 248]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="4" fill="${C.brass}"/>`).join('')}
  <g transform="translate(127.5 84) scale(1.75)">${rGlyph(C.brassLight, C.kiln)}</g>
  <path d="M84 206.5H122M198 206.5H236" stroke="${C.brass}" stroke-width="0.8"/>
  <g transform="translate(129 200) scale(0.27)">${bold(C.stone)}</g>
  <path d="M142 224H178" stroke="${C.brass}" stroke-width="0.8"/>`,
});

// 2 — ARCH, MONOLINE: gallery-like thin line art on stone.
{
  const w = monoWord(C.ink, 2, 20, C.kiln);
  const s = 0.5;
  concepts.push({
    bg: C.stone, vb: [300, 380],
    svg: `
    <path d="M90 214V90A60 60 0 0 1 210 90V214" fill="none" stroke="${C.ink}" stroke-width="1.6"/>
    <path d="M101 214V92A49 49 0 0 1 199 92V214" fill="none" stroke="${C.brass}" stroke-width="0.9"/>
    <path d="M70 214H230" stroke="${C.ink}" stroke-width="1.6"/>
    <g transform="translate(${150 - 13.5} 142)" fill="none" stroke-width="2.4" stroke-linecap="square">
      <path d="M0 48V0H15A12.5 12.5 0 0 1 15 25H0" stroke="${C.ink}"/><path d="M13 25L27 48" stroke="${C.kiln}"/>
    </g>
    <g transform="translate(${150 - (w.width * s) / 2} 262) scale(${s})">${w.svg}</g>
    <path d="M138 308H162" stroke="${C.brass}" stroke-width="1"/>`,
  });
}

// 3 — STRATA: heavy slab wordmark cut into three shifted ground layers.
{
  const bands = [[0, 15.5, 0, C.stone], [17.5, 31, -5, C.stone], [33, 48, 5, C.kiln]];
  concepts.push({
    bg: C.ink, vb: [380, 200],
    svg: `
    <defs>${bands.map((b, i) => `<clipPath id="c3b${i}"><rect x="-50" y="${b[0]}" width="400" height="${b[1] - b[0]}"/></clipPath>`).join('')}</defs>
    <g transform="translate(${190 - (WORDMARK_SIZE.width * 1.2) / 2} ${100 - 29}) scale(1.2)">
      ${bands.map((b, i) => `<g clip-path="url(#c3b${i})"><g transform="translate(${b[2]} 0)">${bold(b[3])}</g></g>`).join('')}
    </g>`,
  });
}

// 4 — FAN EMBLEM: paving fan arcs inside a ring, R standing on the horizon.
concepts.push({
  bg: C.basalt, vb: [320, 340],
  svg: `
  <defs><clipPath id="c4"><circle cx="160" cy="150" r="93"/></clipPath></defs>
  <circle cx="160" cy="150" r="100" fill="none" stroke="${C.brass}" stroke-width="1.5"/>
  <circle cx="160" cy="150" r="93" fill="none" stroke="${C.brass}" stroke-width="0.6"/>
  <g clip-path="url(#c4)" fill="none" stroke="${C.brass}" stroke-width="0.9">
    ${[84, 70, 56, 42, 28].map((r) => `<path d="M${160 - r} 205A${r} ${r} 0 0 1 ${160 + r} 205" opacity="${0.35 + r / 140}"/>`).join('')}
    <path d="M60 205H260" stroke-width="1.2"/>
  </g>
  <g transform="translate(${160 - 22.2} 147.4) scale(1.2)">
    <g stroke="${C.basalt}" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${rGlyph(C.brassLight, C.kiln)}</g>
  </g>
  <g transform="translate(${160 - 34.8} 282) scale(0.3)">${bold(C.stone)}</g>`,
});

// 5 — MODULAR PAVER: the R built from square pavers, strut tiles in accent.
{
  const rows = ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X.X..', 'X..X.', 'X...X'];
  const T = 22, G = 5, gw = 5 * T + 4 * G;
  const tiles = rows.flatMap((row, y) =>
    row.split('').map((c, x) => (c === 'X' ? `<rect x="${x * (T + G)}" y="${y * (T + G)}" width="${T}" height="${T}" fill="${y >= 4 && x >= 2 ? C.kiln : C.ink}"/>` : '')),
  ).join('');
  concepts.push({
    bg: C.plaster, vb: [300, 400],
    svg: `
    <g transform="translate(${150 - gw / 2} 48)">${tiles}</g>
    <g transform="translate(${150 - 34.8} 292) scale(0.3)">${bold(C.ink)}</g>
    <path d="M122 330H178" stroke="${C.ink}" stroke-width="1"/>`,
  });
}

// ---------- write files ----------
const standalone = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.vb[0]} ${c.vb[1]}"><rect width="${c.vb[0]}" height="${c.vb[1]}" fill="${c.bg}"/>${c.svg}</svg>\n`;
for (const [i, c] of concepts.entries()) await fs.writeFile(path.join(OUT, `concept-${i + 1}.svg`), standalone(c));

// ---------- board: 3 + 2 panels ----------
const GAP = 16, PW = 640, PH = 640;
const layout = [[0, 0, PW, PH], [PW + GAP, 0, PW, PH], [2 * (PW + GAP), 0, PW, PH], [0, PH + GAP, 976, PH], [976 + GAP, PH + GAP, 976, PH]];
const W = 3 * PW + 2 * GAP, H = 2 * PH + GAP;
const panels = concepts.map((c, i) => {
  const [x, y, w, h] = layout[i];
  const k = Math.min((w * 0.82) / c.vb[0], (h * 0.82) / c.vb[1]);
  const ox = x + (w - c.vb[0] * k) / 2, oy = y + (h - c.vb[1] * k) / 2;
  const dots = Array.from({ length: i + 1 }, (_, n) => `<circle cx="${x + 28 + n * 14}" cy="${y + 28}" r="3.5" fill="${c.bg === C.ink || c.bg === C.basalt ? C.brass : C.ink}"/>`).join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.bg}"/><g transform="translate(${ox} ${oy}) scale(${k})">${c.svg}</g>${dots}`;
}).join('');
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#08090a"/>${panels}</svg>`;
await sharp(Buffer.from(board), { density: 96 }).png().toFile(path.join(OUT, 'board.png'));
console.log('written', OUT);
