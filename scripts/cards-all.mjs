/**
 * One catalogue PDF with every business card design (3 sets, 13 designs), front + back side by side.
 *   node scripts/cards-all.mjs → brand/RUHOR-business-cards-<lang>.pdf
 * Run after cards.mjs, cards2.mjs and cards3.mjs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = path.join(root, 'brand');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const DESIGNS = [
  ['cards', 'A', 'Золото на чорному · Brass on ink'],
  ['cards', 'B', 'Світла · Stone'],
  ['cards', 'C', 'Суцільне золото · Solid brass'],
  ['cards', 'D', 'Архітектурна · Architectural'],
  ['cards2', 'E', 'Класика, чорна · Classic ink'],
  ['cards2', 'F', 'Горизонтальна · Horizontal'],
  ['cards2', 'G', 'Класика, світла · Classic stone'],
  ['cards2', 'H', 'Класика, золото · Classic brass'],
  ['cards3', 'J', 'Креслення · Blueprint'],
  ['cards3', 'K', 'Віяло з бруківки · Paving fan'],
  ['cards3', 'L', 'Рулетка · Tape measure'],
  ['cards3', 'M', 'Вертикальна · Portrait (55×85 mm)'],
  ['cards3', 'N', 'Діагональ · Diagonal'],
];

for (const lang of ['cs', 'uk']) {
  const url = (set, v, side) => pathToFileURL(path.join(BRAND, set, lang, `card-${v}-${side}.png`)).href;
  const pages = DESIGNS.map(([set, v, name], i) => {
    const portrait = v === 'M';
    const h = portrait ? 150 : 100; // mm, card image height on the page
    return `<section><header><b>${v}</b><span>${name}</span><em>${i + 1} / ${DESIGNS.length}</em></header>
      <div class="row"><figure><img style="height:${h}mm" src="${url(set, v, 'front')}"><figcaption>${lang === 'cs' ? 'Přední strana' : 'Лицьова сторона'}</figcaption></figure>
      <figure><img style="height:${h}mm" src="${url(set, v, 'back')}"><figcaption>${lang === 'cs' ? 'Zadní strana' : 'Зворотна сторона'}</figcaption></figure></div>
      <footer>RUHOR COMPANY · 85 × 55 mm</footer></section>`;
  });
  const html = `<!doctype html><meta charset="utf-8"><style>
@page{size:297mm 210mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;color:#131518;background:#d8d4ca}
section{width:297mm;height:210mm;page-break-after:always;position:relative;padding:14mm 16mm;background:#d8d4ca;overflow:hidden}
header{display:flex;align-items:baseline;gap:6mm}
header b{font-size:26pt;font-weight:600;color:#8A6D3B}
header span{font-size:13pt;letter-spacing:.02em}
header em{margin-left:auto;font-style:normal;font-size:9pt;color:#5A5F66}
.row{position:absolute;left:16mm;right:16mm;top:38mm;bottom:20mm;display:flex;gap:12mm;justify-content:center;align-items:center}
figure{text-align:center}
img{display:block;border-radius:2.4mm;box-shadow:0 3mm 8mm rgba(0,0,0,.28)}
figcaption{margin-top:4mm;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:#5A5F66}
footer{position:absolute;left:16mm;bottom:9mm;font-size:7.5pt;letter-spacing:.2em;color:#5A5F66}
</style><body>${pages.join('')}</body>`;
  const f = path.join(BRAND, `_all-${lang}.html`);
  await fs.writeFile(f, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', `--print-to-pdf=${path.join(BRAND, `RUHOR-business-cards-${lang}.pdf`)}`, '--no-pdf-header-footer', '--virtual-time-budget=15000', pathToFileURL(f).href], { stdio: 'pipe', timeout: 180000 });
  await fs.rm(f);
}
console.log('done');
