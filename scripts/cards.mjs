/**
 * Final rhombus logo + business cards (4 variants × front/back × uk/cs).
 *   node scripts/cards.mjs
 * Output: brand/logo/*, brand/cards/<lang>/*.png, print.pdf (85×55 mm), sheet.png
 * Cards are rendered with headless Chrome so real fonts (Geologica) are used.
 * Edit the CONFIG block for phone / site address.
 */
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { R, GLYPHS, WORDMARK_LAYOUT, WORDMARK_SIZE } from '../src/brand/logo.ts';

// ───────────── CONFIG ─────────────
const CONFIG = {
  phone: '+420 000 000 000', // TODO(owner): real number (placeholder on purpose)
  email: 'ruhor.company@seznam.cz',
  siteUrl: 'https://ruhor-website.vercel.app/', // TODO: replace with the final domain
  fullName: 'RUHOR Company',
};
const QR_FROM = 'C:/Users/Tec-1/AppData/Local/Temp/claude/e593ecc021efd419/7a8060c7-8225-4560-8e76-1ae036c5925f/scratchpad/qr/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// ──────────────────────────────────

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGO_DIR = path.join(root, 'brand', 'logo');
const CARD_DIR = path.join(root, 'brand', 'cards');
const WORK = path.join(CARD_DIR, '_html');
await fs.mkdir(LOGO_DIR, { recursive: true });
await fs.mkdir(path.join(WORK, 'fonts'), { recursive: true });
const QRCode = createRequire(QR_FROM)('qrcode');

const C = { ink: '#131518', stone: '#F2F0EB', plaster: '#E7E3DB', kiln: '#E0592A', brass: '#C4A46A', brassLight: '#DCC48E', brassDark: '#8A6D3B', ash: '#9CA1A8' };

// ───────────── logo ─────────────
const rGlyph = (fill, strut) => `<path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/>`;
const bold = (fill, strut = fill) =>
  WORDMARK_LAYOUT.map(({ glyph, x }, i) =>
    glyph === 'R'
      ? `<g transform="translate(${x} 0)">${rGlyph(fill, i === 0 ? strut : fill)}</g>`
      : `<path transform="translate(${x} 0)" fill="${fill}"${glyph === 'O' ? ' fill-rule="evenodd"' : ''} d="${GLYPHS[glyph]}"/>`,
  ).join('');
/** Rhombus mark in a 212×212 box. */
const mark = ({ d, r, s, line }) =>
  `<polygon points="106,0 212,106 106,212 0,106" fill="${d}"/><polygon points="106,14 198,106 106,198 14,106" fill="none" stroke="${line ?? r}" stroke-width="1.6" opacity="0.55"/><g transform="translate(${106 - 29.6} ${106 - 38.4}) scale(1.6)">${rGlyph(r, s)}</g>`;
const svgOf = (inner, w, h, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`;

const LOGOS = {
  'rhombus-brass': { d: C.brass, r: C.ink, s: C.stone },
  'rhombus-ink': { d: C.ink, r: C.stone, s: C.kiln, line: C.stone },
  'rhombus-mono-ink': { d: C.ink, r: C.stone, s: C.stone, line: C.stone },
  'rhombus-mono-brass': { d: C.brass, r: C.ink, s: C.ink },
};
for (const [name, c] of Object.entries(LOGOS)) {
  const svg = svgOf(mark(c), 212, 212, 'RUHOR');
  await fs.writeFile(path.join(LOGO_DIR, `logo-${name}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 600 }).resize(3000, 3000).png().toFile(path.join(LOGO_DIR, `logo-${name}-3000px.png`));
}
// horizontal wordmark lockup (vector, no fonts)
for (const [name, fg, c] of [['dark-bg', C.stone, LOGOS['rhombus-brass']], ['light-bg', C.ink, LOGOS['rhombus-ink']]]) {
  const k = 0.62;
  const inner = `<g transform="translate(0 0) scale(0.5)">${mark(c)}</g><g transform="translate(130 ${53 - (48 * k) / 2}) scale(${k})">${bold(fg, C.kiln)}</g>`;
  const w = 130 + WORDMARK_SIZE.width * k;
  const svg = svgOf(inner, Math.ceil(w), 106, 'RUHOR');
  await fs.writeFile(path.join(LOGO_DIR, `logo-lockup-${name}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 600 }).resize({ width: 3600 }).png().toFile(path.join(LOGO_DIR, `logo-lockup-${name}-3600px.png`));
}

// ───────────── fonts for Chrome ─────────────
const RANGES = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212',
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113',
  cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
};
let fontCss = '';
for (const [sub, range] of Object.entries(RANGES)) {
  await fs.copyFile(path.join(root, 'src/assets/fonts', `geologica-${sub}-wght-normal.woff2`), path.join(WORK, 'fonts', `g-${sub}.woff2`));
  fontCss += `@font-face{font-family:'Geologica';src:url(fonts/g-${sub}.woff2) format('woff2');font-weight:100 900;unicode-range:${range}}`;
}

// ───────────── content ─────────────
const SERVICE_IDS = ['excavation', 'demolition', 'sewerage', 'waste', 'concrete', 'masonry', 'houses', 'roofing', 'facade', 'paving', 'landscaping', 'terraces', 'carports', 'renovation', 'drywall', 'painting', 'flooring'];
const LANG = {
  uk: { tag: 'Будівельна компанія в Празі', tel: 'Телефон', mail: 'E-mail', web: 'Сайт', scan: 'Скануйте — наш сайт', services: 'Наші послуги' },
  cs: { tag: 'Stavební firma v Praze', tel: 'Telefon', mail: 'E-mail', web: 'Web', scan: 'Naskenujte — náš web', services: 'Naše služby' },
};
const dicts = {};
for (const l of Object.keys(LANG)) dicts[l] = JSON.parse(await fs.readFile(path.join(root, 'src/i18n', `${l}.json`), 'utf8'));

const qrSvg = async (color) => QRCode.toString(CONFIG.siteUrl, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: color, light: '#0000' } });
const shortUrl = CONFIG.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
const phoneHref = CONFIG.phone;

// ───────────── card HTML ─────────────
const THEMES = {
  A: { front: { bg: C.ink, fg: C.stone, acc: C.brass, mut: C.ash, logo: LOGOS['rhombus-brass'] }, back: { bg: C.ink, fg: C.stone, acc: C.brass, wall: 'rgba(196,164,106,.2)', logo: LOGOS['rhombus-brass'] } },
  B: { front: { bg: C.stone, fg: C.ink, acc: C.brassDark, mut: '#5A5F66', logo: LOGOS['rhombus-ink'] }, back: { bg: C.stone, fg: C.ink, acc: C.brassDark, wall: 'rgba(19,21,24,.13)', logo: LOGOS['rhombus-ink'] } },
  C: { front: { bg: C.brass, fg: C.ink, acc: C.ink, mut: '#4a3d22', logo: { d: C.ink, r: C.brassLight, s: C.stone, line: C.brassLight } }, back: { bg: C.brass, fg: C.ink, acc: C.ink, wall: 'rgba(19,21,24,.2)', logo: { d: C.ink, r: C.brassLight, s: C.stone, line: C.brassLight } } },
  D: { front: { bg: C.ink, fg: C.stone, acc: C.brass, mut: C.ash, logo: LOGOS['rhombus-brass'] }, back: { bg: C.plaster, fg: C.ink, acc: C.brassDark, wall: 'rgba(19,21,24,.1)', logo: LOGOS['rhombus-ink'] } },
};
const NAMES = { A: 'Brass on ink', B: 'Stone', C: 'Solid brass', D: 'Architectural' };

const css = `
${fontCss}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:'Geologica',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.card{width:340px;height:220px;position:relative;overflow:hidden;background:var(--bg);color:var(--fg)}
.page{width:340px;height:220px}
svg{display:block}
.lbl{font-size:5.6px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);font-weight:500}
.val{font-size:9.6px;font-weight:450;letter-spacing:.01em;line-height:1.25}
.tag{font-size:6px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);font-weight:500;line-height:1.5}
.foot{position:absolute;left:22px;right:22px;bottom:13px;display:flex;align-items:center;gap:10px;justify-content:center;color:var(--acc)}
.foot i{flex:1;height:.6px;background:currentColor;opacity:.7}
.foot b{font-weight:500;font-size:7.2px;letter-spacing:.34em;text-transform:uppercase;white-space:nowrap;color:var(--fg)}
.wall{position:absolute;inset:-6px;padding:4px 14px;font-size:7.3px;line-height:1.95;letter-spacing:.1em;text-transform:uppercase;font-weight:500;text-align:justify;color:var(--wall);overflow:hidden;word-spacing:.15em}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse 92px 78px at 50% 47%,var(--bg) 55%,transparent 100%)}
`;

function contacts(t, th, withWeb) {
  const row = (l, v) => `<div style="margin-top:8px"><div class="lbl">${l}</div><div class="val">${v}</div></div>`;
  return row(t.tel, CONFIG.phone) + row(t.mail, CONFIG.email) + (withWeb ? row(t.web, shortUrl) : '');
}

async function faceHtml(variant, side, lang) {
  const t = LANG[lang], d = dicts[lang], th = THEMES[variant][side];
  const vars = `--bg:${th.bg};--fg:${th.fg};--acc:${th.acc};--mut:${th.mut ?? th.acc};--wall:${th.wall ?? 'transparent'}`;
  const logo = (size, extra = '') => `<svg width="${size}" height="${size}" viewBox="0 0 212 212" style="${extra}">${mark(th.logo)}</svg>`;
  const strip = side === 'back' ? `<div style="position:absolute;left:0;right:0;bottom:0;height:32px;background:var(--bg)"></div>` : '';
  const footer = `${strip}<div class="foot"><i></i><b>${CONFIG.fullName}</b><i></i></div>`;
  const wallText = Array.from({ length: 4 }, () => SERVICE_IDS.map((id) => d.services.items[id].name).join(' · ')).join(' · ');
  let inner = '';

  if (side === 'front') {
    if (variant === 'D') {
      inner = `
      <svg style="position:absolute;right:-46px;top:-6px" width="232" height="232" viewBox="0 0 212 212">${mark({ d: 'none', r: C.brass, s: C.kiln, line: C.brass }).replace('fill="none"', 'fill="none" stroke="#C4A46A" stroke-width="1.4"')}</svg>
      <div style="position:absolute;left:22px;top:22px">${logo(40)}</div>
      <div class="tag" style="position:absolute;left:74px;top:26px;width:130px">${t.tag}</div>
      <div style="position:absolute;left:22px;top:84px">${contacts(t, th, true)}</div>
      ${footer}`;
    } else {
      inner = `
      <div style="position:absolute;left:22px;top:20px">${logo(variant === 'C' ? 64 : 62)}</div>
      <div class="tag" style="position:absolute;right:22px;top:24px;text-align:right;width:150px">${t.tag}</div>
      <div style="position:absolute;left:22px;top:92px">${contacts(t, th, false)}</div>
      ${footer}`;
    }
  } else {
    const qr = await qrSvg(variant === 'A' ? C.brass : variant === 'C' ? C.ink : variant === 'D' ? C.ink : C.ink);
    if (variant === 'D') {
      inner = `
      <div class="wall">${wallText}</div>
      <div style="position:absolute;left:22px;top:30px;width:92px;height:92px;background:var(--bg);padding:8px;display:grid;place-items:center">${qr.replace('<svg ', '<svg width="76" height="76" ')}</div>
      <div class="lbl" style="position:absolute;left:22px;top:132px;background:var(--bg);padding:2px 4px 2px 0">${t.scan}</div>
      <div style="position:absolute;right:22px;top:36px;width:156px;background:var(--bg);padding:6px 0 6px 10px;text-align:right">${logo(54, 'margin-left:auto')}<div class="val" style="margin-top:10px">${shortUrl}</div><div class="val" style="margin-top:3px">${CONFIG.phone}</div></div>
      ${footer}`;
    } else {
      inner = `
      <div class="wall">${wallText}</div>
      <div class="vig"></div>
      <div style="position:absolute;left:50%;top:43px;margin-left:-37px">${logo(74)}</div>
      <div class="val" style="position:absolute;left:0;right:0;top:132px;text-align:center;font-size:8.6px;letter-spacing:.05em;background:linear-gradient(to right,transparent,var(--bg) 22%,var(--bg) 78%,transparent);padding:3px 0">${shortUrl}<span style="opacity:.55"> · </span>${CONFIG.phone}</div>
      <div style="position:absolute;right:14px;top:14px;width:40px;height:40px;background:var(--bg);padding:4px">${qr.replace('<svg ', '<svg width="32" height="32" ')}</div>
      ${footer}`;
    }
  }
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>${css}</style><body><div class="card" style="${vars}">${inner}</div></body></html>`;
}

// ───────────── render ─────────────
const run = (args) => execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox', ...args], { stdio: 'pipe', timeout: 90000 });
const jobs = [];
for (const lang of Object.keys(LANG)) {
  await fs.mkdir(path.join(CARD_DIR, lang), { recursive: true });
  for (const v of Object.keys(THEMES)) for (const side of ['front', 'back']) {
    const html = await faceHtml(v, side, lang);
    const file = path.join(WORK, `${lang}-${v}-${side}.html`);
    await fs.writeFile(file, html);
    const png = path.join(CARD_DIR, lang, `card-${v}-${side}.png`);
    run([`--screenshot=${png}`, '--window-size=340,220', '--force-device-scale-factor=6', '--virtual-time-budget=4000', pathToFileURL(file).href]);
    jobs.push({ lang, v, side, png });
  }
  // print PDF: all 8 faces at exact 85×55 mm
  const pages = [];
  for (const v of Object.keys(THEMES)) for (const side of ['front', 'back']) {
    const html = await faceHtml(v, side, lang);
    pages.push(`<div class="page">${html.match(/<div class="card"[\s\S]*<\/div><\/body>/)[0].replace('</body>', '')}</div>`);
  }
  const pdfHtml = `<!doctype html><meta charset="utf-8"><style>${css}@page{size:85mm 55mm;margin:0}html,body{width:85mm}.page{zoom:.94488;page-break-after:always;break-after:page;overflow:hidden}</style><body>${pages.join('')}</body>`;
  const pdfFile = path.join(WORK, `${lang}-print.html`);
  await fs.writeFile(pdfFile, pdfHtml);
  run([`--print-to-pdf=${path.join(CARD_DIR, lang, 'print-85x55mm.pdf')}`, '--no-pdf-header-footer', '--virtual-time-budget=4000', pathToFileURL(pdfFile).href]);

  // overview sheet: 4 rows (variants) × front/back
  const W = 1000, H = 647, G = 36, P = 48;
  const sheet = sharp({ create: { width: P * 2 + W * 2 + G, height: P * 2 + 4 * H + 3 * G, channels: 4, background: '#d8d4ca' } });
  const comps = [];
  let row = 0;
  for (const v of Object.keys(THEMES)) {
    for (const [ci, side] of ['front', 'back'].entries()) {
      const buf = await sharp(path.join(CARD_DIR, lang, `card-${v}-${side}.png`)).resize(W, H).composite([{ input: Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="14" fill="#fff"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
      comps.push({ input: buf, left: P + ci * (W + G), top: P + row * (H + G) });
    }
    row++;
  }
  await sheet.composite(comps).png().toFile(path.join(CARD_DIR, lang, 'sheet.png'));
}
await fs.rm(WORK, { recursive: true, force: true });
console.log('done', jobs.length, 'faces');
