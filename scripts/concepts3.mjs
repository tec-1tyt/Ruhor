/**
 * Third set of logo directions (11–20): construction made obvious. Geometry only, no fonts.
 * Run: node scripts/concepts3.mjs  → brand/concepts/concept-11..20.svg, board3.png, board4.png
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { R, GLYPHS, WORDMARK_LAYOUT, WORDMARK_SIZE } from '../src/brand/logo.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'brand', 'concepts');
await fs.mkdir(OUT, { recursive: true });

const C = { ink: '#131518', basalt: '#1C1F23', stone: '#F2F0EB', plaster: '#E7E3DB', kiln: '#E0592A', kilnDeep: '#B5441B', brass: '#C4A46A', brassLight: '#DCC48E', concrete: '#5A5F66' };
const rGlyph = (fill, strut) => `<path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/>`;
const bold = (fill, strut = fill) =>
  WORDMARK_LAYOUT.map(({ glyph, x }, i) =>
    glyph === 'R'
      ? `<g transform="translate(${x} 0)">${rGlyph(fill, i === 0 ? strut : fill)}</g>`
      : `<path transform="translate(${x} 0)" fill="${fill}"${glyph === 'O' ? ' fill-rule="evenodd"' : ''} d="${GLYPHS[glyph]}"/>`,
  ).join('');
const WW = WORDMARK_SIZE.width;
const word = (cx, y, k, fill, strut) => `<g transform="translate(${cx - (WW * k) / 2} ${y}) scale(${k})">${bold(fill, strut)}</g>`;

const cs = [];

// 11 — HARD HAT
cs.push({
  bg: C.ink, vb: [320, 330],
  svg: `
  <path d="M70 192A90 90 0 0 1 250 192Z" fill="${C.kiln}"/>
  <path d="M148 104H172V192H148Z" fill="${C.kilnDeep}"/>
  <path d="M104 120A68 68 0 0 1 140 106M216 120A68 68 0 0 0 180 106" stroke="${C.stone}" stroke-width="2" fill="none" opacity="0.5"/>
  <rect x="44" y="190" width="232" height="20" rx="10" fill="${C.kilnDeep}"/>
  <g transform="translate(${160 - 18.5 * 1.1} 134) scale(1.1)" opacity="0"/>
  ${word(160, 246, 0.34, C.stone)}`,
});

// 12 — BRICK R
{
  const k = 3.4, ox = 160 - (37 * k) / 2, oy = 36;
  const clip = (id, paths) => `<clipPath id="${id}">${paths.map((d) => `<path transform="translate(${ox} ${oy}) scale(${k})" d="${d}"/>`).join('')}</clipPath>`;
  const bw = 30, bh = 13;
  let bricks = '';
  for (let r = 0; r * bh < 48 * k + bh; r++) {
    const off = (r % 2) * (bw / 2);
    for (let x = -bw; x < 37 * k + bw; x += bw) bricks += `<rect x="${(ox + x + off).toFixed(1)}" y="${(oy + r * bh).toFixed(1)}" width="${bw - 2.5}" height="${bh - 2.5}" rx="1"/>`;
  }
  cs.push({
    bg: C.plaster, vb: [320, 330],
    svg: `
    <defs>${clip('c12a', [R.arch, R.pillar])}${clip('c12b', [R.strut])}</defs>
    <g clip-path="url(#c12a)" fill="${C.ink}">${bricks}</g>
    <g clip-path="url(#c12b)" fill="${C.kiln}">${bricks}</g>
    ${word(160, 262, 0.3, C.ink)}`,
  });
}

// 13 — TOWER CRANE (monoline, brass)
{
  const cx = 190;
  let lattice = '';
  for (let y = 250, i = 0; y > 112; y -= 14, i++) lattice += `<path d="M${cx - 10} ${y}L${cx + 10} ${y - 14}M${cx + 10} ${y}L${cx - 10} ${y - 14}"/>`;
  cs.push({
    bg: C.ink, vb: [380, 340],
    svg: `
    <g fill="none" stroke="${C.brass}" stroke-width="1.4" stroke-linejoin="miter">
      <path d="M${cx - 10} 252V110M${cx + 10} 252V110" stroke-width="2.4"/>${lattice}
      <path d="M${cx - 12} 110H${cx + 12}V92H${cx - 12}Z"/>
      <path d="M${cx - 60} 92H${cx + 130}" stroke-width="3"/>
      <path d="M${cx} 58L${cx + 130} 92M${cx} 58L${cx - 56} 92M${cx} 58V92" />
      <path d="M${cx + 96} 92V168" stroke="${C.stone}" stroke-width="1"/>
      <path d="M${cx - 18} 258H${cx + 130}" stroke-width="2"/>
    </g>
    <rect x="${cx - 60}" y="92" width="26" height="20" fill="${C.brass}"/>
    <rect x="${cx + 84}" y="168" width="24" height="18" fill="${C.kiln}"/>
    <rect x="${cx - 18}" y="252" width="36" height="6" fill="${C.brass}"/>
    ${word(190, 284, 0.32, C.stone)}`,
  });
}

// 14 — HOUSE FRAME
cs.push({
  bg: C.basalt, vb: [320, 330],
  svg: `
  <path d="M64 228V140M256 228V140" stroke="${C.stone}" stroke-width="10" fill="none"/>
  <path d="M52 146L160 48L268 146" stroke="${C.kiln}" stroke-width="12" fill="none" stroke-linejoin="miter"/>
  <path d="M46 228H274" stroke="${C.stone}" stroke-width="4"/>
  <g transform="translate(${160 - 18.5 * 1.15} 150) scale(1.15)">${rGlyph(C.stone, C.kiln)}</g>
  ${word(160, 262, 0.34, C.stone)}`,
});

// 15 — SPIRIT LEVEL
cs.push({
  bg: C.stone, vb: [360, 260],
  svg: `
  <rect x="30" y="80" width="300" height="58" rx="5" fill="${C.ink}"/>
  <rect x="30" y="80" width="14" height="58" rx="3" fill="${C.brass}"/><rect x="316" y="80" width="14" height="58" rx="3" fill="${C.brass}"/>
  <rect x="146" y="92" width="68" height="34" rx="17" fill="${C.stone}"/>
  <path d="M168 92V126M192 92V126" stroke="${C.ink}" stroke-width="1.6" opacity="0.5"/>
  <circle cx="180" cy="109" r="9" fill="${C.kiln}"/>
  <circle cx="86" cy="109" r="14" fill="${C.stone}"/><circle cx="274" cy="109" r="14" fill="${C.stone}"/>
  ${word(180, 170, 0.4, C.ink)}`,
});

// 16 — PAVING ARCH WINDOW
{
  const fan = [[20, 20], [0, 10], [40, 10], [0, 30], [40, 30]]
    .flatMap(([cx, cy]) => [5, 10, 15, 20].map((r) => `<path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}"/>`))
    .join('');
  cs.push({
    bg: C.ink, vb: [300, 370],
    svg: `
    <defs>
      <pattern id="p16" width="40" height="20" patternUnits="userSpaceOnUse"><g fill="none" stroke="${C.brass}" stroke-width="0.9">${fan}</g></pattern>
      <clipPath id="c16"><path d="M70 296V130A80 80 0 0 1 230 130V296Z"/></clipPath>
    </defs>
    <path d="M70 296V130A80 80 0 0 1 230 130V296Z" fill="${C.basalt}"/>
    <rect x="60" y="40" width="180" height="260" fill="url(#p16)" clip-path="url(#c16)"/>
    <path d="M70 296V130A80 80 0 0 1 230 130V296Z" fill="none" stroke="${C.brass}" stroke-width="2"/>
    <g transform="translate(${150 - 18.5 * 1.6} 170) scale(1.6)"><g stroke="${C.basalt}" stroke-width="6" stroke-linejoin="round" paint-order="stroke">${rGlyph(C.stone, C.kiln)}</g></g>
    ${word(150, 328, 0.3, C.stone)}`,
  });
}

// 17 — I-BEAM LOCKUP
{
  const bolts = (y) => Array.from({ length: 12 }, (_, i) => `<circle cx="${60 + i * 26}" cy="${y}" r="2.4" fill="${C.basalt}"/>`).join('');
  cs.push({
    bg: C.basalt, vb: [400, 220],
    svg: `
    <rect x="40" y="38" width="320" height="20" fill="${C.kiln}"/>${bolts(48)}
    <rect x="40" y="162" width="320" height="20" fill="${C.kiln}"/>${bolts(172)}
    ${word(200, 85, 1.1, C.stone)}`,
  });
}

// 18 — CROSSED HAMMER AND TROWEL
cs.push({
  bg: C.ink, vb: [340, 340],
  svg: `
  <circle cx="170" cy="150" r="112" fill="none" stroke="${C.brass}" stroke-width="1.6"/>
  <circle cx="170" cy="150" r="104" fill="none" stroke="${C.brass}" stroke-width="0.6"/>
  <g transform="rotate(-45 170 150)"><rect x="165" y="64" width="10" height="170" rx="3" fill="${C.brassLight}"/><rect x="138" y="52" width="64" height="28" rx="3" fill="${C.stone}"/><rect x="198" y="58" width="12" height="16" fill="${C.stone}"/></g>
  <g transform="rotate(45 170 150)"><rect x="166" y="170" width="8" height="64" rx="3" fill="${C.brassLight}"/><path d="M170 58L198 172H142Z" fill="${C.kiln}"/></g>
  ${word(170, 286, 0.32, C.stone)}`,
});

// 19 — HEX NUT
{
  const hex = (r, cx, cy) => Array.from({ length: 6 }, (_, k) => `${(cx + r * Math.cos(((30 + 60 * k) * Math.PI) / 180)).toFixed(2)},${(cy + r * Math.sin(((30 + 60 * k) * Math.PI) / 180)).toFixed(2)}`).join(' ');
  cs.push({
    bg: C.plaster, vb: [320, 330],
    svg: `
    <polygon points="${hex(104, 160, 150)}" fill="${C.ink}"/>
    <polygon points="${hex(116, 160, 150)}" fill="none" stroke="${C.ink}" stroke-width="1"/>
    <circle cx="160" cy="150" r="72" fill="${C.plaster}"/>
    <circle cx="160" cy="150" r="72" fill="none" stroke="${C.kiln}" stroke-width="3"/>
    <g transform="translate(${160 - 18.5 * 1.5} ${150 - 36}) scale(1.5)">${rGlyph(C.ink, C.kiln)}</g>
    ${word(160, 286, 0.3, C.ink)}`,
  });
}

// 20 — TAPE MEASURE
{
  let ticks = '';
  for (let i = 0; i <= 56; i++) {
    const h = i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 7;
    ticks += `<path d="M${40 + i * 6} 140V${140 + h}"/>`;
  }
  cs.push({
    bg: C.ink, vb: [420, 220],
    svg: `
    ${word(210, 52, 1.3, C.stone, C.kiln)}
    <rect x="40" y="140" width="336" height="30" fill="${C.kiln}"/>
    <g stroke="${C.ink}" stroke-width="1.3">${ticks}</g>
    <rect x="376" y="140" width="14" height="30" fill="${C.brass}"/>`,
  });
}

// ---------- files + boards ----------
const standalone = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.vb[0]} ${c.vb[1]}"><rect width="${c.vb[0]}" height="${c.vb[1]}" fill="${c.bg}"/>${c.svg}</svg>\n`;
for (const [i, c] of cs.entries()) await fs.writeFile(path.join(OUT, `concept-${i + 11}.svg`), standalone(c));

const GAP = 16, PW = 640, PH = 640;
const layout = [[0, 0, PW, PH], [PW + GAP, 0, PW, PH], [2 * (PW + GAP), 0, PW, PH], [0, PH + GAP, 976, PH], [976 + GAP, PH + GAP, 976, PH]];
const W = 3 * PW + 2 * GAP, H = 2 * PH + GAP;
async function board(list, file, base) {
  const panels = list.map((c, i) => {
    const [x, y, w, h] = layout[i];
    const k = Math.min((w * 0.8) / c.vb[0], (h * 0.8) / c.vb[1]);
    const ox = x + (w - c.vb[0] * k) / 2, oy = y + (h - c.vb[1] * k) / 2;
    const dark = ![C.stone, C.plaster].includes(c.bg);
    const col = dark ? C.brass : C.ink;
    const dots = Array.from({ length: i + 1 }, (_, n) => `<circle cx="${x + 28 + n * 14}" cy="${y + 28}" r="3.5" fill="${col}"/>`).join('');
    const ring = base ? `<circle cx="${x + 28 + (i + 1) * 14 + 6}" cy="${y + 28}" r="5" fill="none" stroke="${col}" stroke-width="1.5"/>` : '';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.bg}"/><g transform="translate(${ox} ${oy}) scale(${k})">${c.svg}</g>${dots}${ring}`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#08090a"/>${panels}</svg>`;
  await sharp(Buffer.from(svg), { density: 96 }).png().toFile(path.join(OUT, file));
}
await board(cs.slice(0, 5), 'board3.png', false);
await board(cs.slice(5), 'board4.png', true);
console.log('written');
