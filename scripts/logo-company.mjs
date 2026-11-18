/**
 * Rhombus logo with "RUHOR" and the full name "RUHOR COMPANY" underneath.
 *   node scripts/logo-company.mjs → brand/logo/ruhor-company-{dark,light,transparent-*}.png + .pdf (vector)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { R, GLYPHS, WORDMARK_LAYOUT, WORDMARK_SIZE } from '../src/brand/logo.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'brand', 'logo');
const WORK = path.join(OUT, '_tmp');
await fs.mkdir(path.join(WORK, 'fonts'), { recursive: true });
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const C = { ink: '#131518', stone: '#F2F0EB', kiln: '#E0592A', brass: '#C4A46A', brassDark: '#8A6D3B' };

const rGlyph = (fill, strut) => `<path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/>`;
const bold = (fill, strut) =>
  WORDMARK_LAYOUT.map(({ glyph, x }, i) =>
    glyph === 'R'
      ? `<g transform="translate(${x} 0)">${rGlyph(fill, i === 0 ? strut : fill)}</g>`
      : `<path transform="translate(${x} 0)" fill="${fill}"${glyph === 'O' ? ' fill-rule="evenodd"' : ''} d="${GLYPHS[glyph]}"/>`,
  ).join('');

const RANGES = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122',
  'latin-ext': 'U+0100-02BA,U+1E00-1E9F',
  cyrillic: 'U+0400-045F,U+0490-0491,U+2116',
};
let fontCss = '';
for (const [s, r] of Object.entries(RANGES)) {
  await fs.copyFile(path.join(root, 'src/assets/fonts', `geologica-${s}-wght-normal.woff2`), path.join(WORK, 'fonts', `g-${s}.woff2`));
  fontCss += `@font-face{font-family:'Geologica';src:url(fonts/g-${s}.woff2) format('woff2');font-weight:100 900;unicode-range:${r}}`;
}

const W = 1000, H = 890;
const html = (t) => `<!doctype html><meta charset="utf-8"><style>
${fontCss}
@page{size:${W}px ${H}px;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:${t.bg}}
body{position:relative;font-family:'Geologica',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.mark{position:absolute;left:${(W - 520) / 2}px;top:90px}
.row{position:absolute;left:0;right:0;top:690px;display:flex;align-items:center;justify-content:center;gap:34px}
.row i{display:block;width:150px;height:2px;background:${t.line}}
.co{position:absolute;left:0;right:0;top:812px;text-align:center;font-size:46px;font-weight:500;letter-spacing:.46em;padding-left:.46em;color:${t.co};text-transform:uppercase}
.co2{position:absolute;left:${(W - 140) / 2}px;top:892px;width:140px;height:2px;background:${t.line}}
</style><body>
<svg class="mark" width="520" height="520" viewBox="0 0 212 212"><polygon points="106,0 212,106 106,212 0,106" fill="${t.d}"/><polygon points="106,14 198,106 106,198 14,106" fill="none" stroke="${t.r}" stroke-width="1.6" opacity="0.55"/><g transform="translate(${106 - 29.6} ${106 - 38.4}) scale(1.6)">${rGlyph(t.r, t.s)}</g></svg>
${t.single
  ? `<div class="row" style="top:700px;gap:30px"><i style="width:90px"></i><span style="font-size:50px;font-weight:600;letter-spacing:.3em;margin-right:-.3em;color:${t.word};text-transform:uppercase;white-space:nowrap">RUHOR Company</span><i style="width:90px"></i></div>`
  : `<div class="row"><i></i><svg width="${WORDMARK_SIZE.width * 1.3}" height="${48 * 1.3}" viewBox="0 0 ${WORDMARK_SIZE.width} 48">${bold(t.word, t.word)}</svg><i></i></div>
<div class="co">RUHOR Company</div><div class="co2"></div>`}
</body>`;

const THEMES = {
  dark: { bg: C.ink, d: C.brass, r: C.ink, s: C.stone, word: C.stone, line: C.brass, co: C.brass },
  light: { bg: C.stone, d: C.ink, r: C.stone, s: C.kiln, word: C.ink, line: C.brassDark, co: C.brassDark },
  'v1-dark': { single: true, bg: C.ink, d: C.brass, r: C.ink, s: C.stone, word: '#FFFFFF', line: C.brass, co: C.brass },
  'v1-light': { single: true, bg: C.stone, d: C.ink, r: C.stone, s: C.kiln, word: C.ink, line: C.brassDark, co: C.brassDark },
  'v1-transparent-white': { single: true, bg: 'transparent', d: C.brass, r: C.ink, s: C.stone, word: '#FFFFFF', line: C.brass, co: C.brass },
  'transparent-onDark': { bg: 'transparent', d: C.brass, r: C.ink, s: C.stone, word: C.stone, line: C.brass, co: C.brass },
  'transparent-onLight': { bg: 'transparent', d: C.ink, r: C.stone, s: C.kiln, word: C.ink, line: C.brassDark, co: C.brassDark },
};
const run = (a) => execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox', ...a], { stdio: 'pipe', timeout: 90000 });
for (const [name, t] of Object.entries(THEMES)) {
  const f = path.join(WORK, `${name}.html`);
  await fs.writeFile(f, html(t));
  const png = path.join(OUT, `ruhor-company-${name}.png`);
  run([`--screenshot=${png}`, `--window-size=${W},${H}`, '--force-device-scale-factor=3', '--default-background-color=00000000', '--virtual-time-budget=4000', pathToFileURL(f).href]);
  if (['dark', 'light', 'v1-dark', 'v1-light'].includes(name)) run([`--print-to-pdf=${path.join(OUT, `ruhor-company-${name}.pdf`)}`, '--no-pdf-header-footer', '--virtual-time-budget=4000', pathToFileURL(f).href]);
}
await fs.rm(WORK, { recursive: true, force: true });
console.log('done');
