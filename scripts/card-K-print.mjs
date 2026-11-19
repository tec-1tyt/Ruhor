/**
 * Print-ready business card K (paving fan): 85×55 mm trim + 3 mm bleed (91×61 mm).
 *   node scripts/card-K-print.mjs → brand/print-K/<lang>/
 *     RUHOR-card-K-<lang>-front.png / -back.png   600 dpi, with bleed
 *     RUHOR-card-K-<lang>-bleed.pdf               vector, 2 pages, 91×61 mm (trim = inner 85×55)
 *     RUHOR-card-K-<lang>-marks.pdf               same + crop marks (page 101×71 mm)
 * Phone / site: edit CONFIG.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { R } from '../src/brand/logo.ts';

const CONFIG = {
  phone: '+420 000 000 000', // TODO(owner): real number (placeholder on purpose)
  email: 'ruhor.company@seznam.cz',
  siteUrl: 'https://ruhor-website.vercel.app/', // TODO: final domain
  fullName: 'RUHOR COMPANY',
};
const QR_FROM = 'C:/Users/Tec-1/AppData/Local/Temp/claude/e593ecc021efd419/7a8060c7-8225-4560-8e76-1ae036c5925f/scratchpad/qr/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'brand', 'print-K');
const WORK = path.join(OUT, '_html');
await fs.mkdir(path.join(WORK, 'fonts'), { recursive: true });
const QRCode = createRequire(QR_FROM)('qrcode');
const C = { ink: '#131518', stone: '#F2F0EB', brass: '#C4A46A', brassDark: '#8A6D3B', kiln: '#E0592A' };
const B = 12; // bleed in css px (1 px = 0.25 mm → 3 mm)

const rGlyph = (fill, strut) => `<path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/>`;
const diamond = (size, [d, r, s]) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 212 212" style="display:block"><polygon points="106,0 212,106 106,212 0,106" fill="${d}"/><polygon points="106,14 198,106 106,198 14,106" fill="none" stroke="${r}" stroke-width="1.6" opacity="0.55"/><g transform="translate(${106 - 29.6} ${106 - 38.4}) scale(1.6)">${rGlyph(r, s)}</g></svg>`;

const RANGES = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122',
  'latin-ext': 'U+0100-02BA,U+1E00-1E9F',
  cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+2116',
};
let fontCss = '';
for (const [s, r] of Object.entries(RANGES)) {
  await fs.copyFile(path.join(root, 'src/assets/fonts', `geologica-${s}-wght-normal.woff2`), path.join(WORK, 'fonts', `g-${s}.woff2`));
  fontCss += `@font-face{font-family:'Geologica';src:url(fonts/g-${s}.woff2) format('woff2');font-weight:100 900;unicode-range:${r}}`;
}
const LANG = {
  uk: { tag: 'Будівельна компанія в Празі', tel: 'Телефон', mail: 'E-mail', web: 'Сайт', scan: 'Наш сайт' },
  cs: { tag: 'Stavební firma v Praze', tel: 'Telefon', mail: 'E-mail', web: 'Web', scan: 'Náš web' },
};
const shortUrl = CONFIG.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
const qr = (color, size) => QRCode.toString(CONFIG.siteUrl, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: color, light: '#0000' } }).then((s) => s.replace('<svg ', `<svg width="${size}" height="${size}" `));
const FAN = [[20, 20], [0, 10], [40, 10], [0, 30], [40, 30]].flatMap(([cx, cy]) => [5, 10, 15, 20].map((r) => `<path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}"/>`)).join('');

const css = `${fontCss}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:'Geologica',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.bleed{position:relative;width:${340 + 2 * B}px;height:${220 + 2 * B}px;overflow:hidden;background:var(--bg);color:var(--fg)}
.in{position:absolute;left:${B}px;top:${B}px;width:340px;height:220px}
svg{display:block}
.abs{position:absolute}
.lbl{font-size:5.4px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);font-weight:500}
.val{font-size:9.2px;font-weight:450;letter-spacing:.01em;line-height:1.25}
.name{display:flex;align-items:center;justify-content:center;gap:9px;color:var(--fg);font-weight:600;font-size:10px;letter-spacing:.3em;white-space:nowrap;text-transform:uppercase}
.name b{font-weight:600;margin-right:-.3em}
.name i{display:block;width:24px;height:.7px;background:var(--acc)}
.tag{font-size:5.6px;letter-spacing:.18em;text-transform:uppercase;color:var(--acc);font-weight:500}
`;

async function face(side, lang) {
  const t = LANG[lang];
  const row = (l, v) => `<div><div class="lbl">${l}</div><div class="val">${v}</div></div>`;
  if (side === 'front') {
    const th = { bg: '#111417', fg: '#FFFFFF', acc: C.brass, dia: [C.brass, C.ink, C.stone] };
    const w = 340 + 2 * B, h = 220 + 2 * B;
    return `<div class="bleed" style="--bg:${th.bg};--fg:${th.fg};--acc:${th.acc}">
      <div class="abs" style="inset:0;-webkit-mask-image:radial-gradient(ellipse 190px 120px at 50% 50%,#000 10%,transparent 100%);mask-image:radial-gradient(ellipse 190px 120px at 50% 50%,#000 10%,transparent 100%)">
        <svg width="${w}" height="${h}"><defs><pattern id="f" width="40" height="20" patternUnits="userSpaceOnUse"><g fill="none" stroke="${C.brass}" stroke-width=".9">${FAN}</g></pattern></defs><rect width="${w}" height="${h}" fill="url(#f)"/></svg></div>
      <div class="in">
        <svg class="abs" style="left:110px;top:30px;overflow:visible" width="120" height="120" viewBox="0 0 212 212"><polygon points="106,-12 224,106 106,224 -12,106" fill="${th.bg}"/></svg>
        <div class="abs" style="left:120px;top:40px">${diamond(100, th.dia)}</div>
        <div class="abs name" style="left:50%;top:176px;transform:translate(-50%,-50%);background:var(--bg);padding:4px 14px"><i></i><b>${CONFIG.fullName}</b><i></i></div>
      </div></div>`;
  }
  const th = { bg: C.stone, fg: C.ink, acc: C.brassDark, dia: [C.ink, C.stone, C.kiln] };
  let arcs = '';
  for (let r = 30; r <= 250; r += 14) arcs += `<path d="M${170 + B - r} ${232 + B}A${r} ${r} 0 0 1 ${170 + B + r} ${232 + B}" opacity="${(0.65 - r / 520).toFixed(2)}"/>`;
  return `<div class="bleed" style="--bg:${th.bg};--fg:${th.fg};--acc:${th.acc}">
    <svg class="abs" style="left:0;top:0" width="${340 + 2 * B}" height="${220 + 2 * B}" fill="none" stroke="${C.brassDark}" stroke-width=".7">${arcs}</svg>
    <div class="in">
      <div class="abs" style="left:26px;top:26px;display:flex;align-items:center;gap:12px">${diamond(44, th.dia)}<div><div class="name" style="justify-content:flex-start;letter-spacing:.26em;font-size:9px"><b>${CONFIG.fullName}</b></div><div class="tag" style="margin-top:5px">${t.tag}</div></div></div>
      <div class="abs" style="left:26px;top:96px;display:grid;gap:9px">${row(t.tel, CONFIG.phone)}${row(t.mail, CONFIG.email)}${row(t.web, shortUrl)}</div>
      <div class="abs" style="right:26px;top:92px;text-align:center;background:var(--bg);padding:5px 5px 3px">${await qr(C.ink, 56)}<div class="lbl" style="margin-top:3px;font-size:4.8px">${t.scan}</div></div>
    </div></div>`;
}

const run = (a) => execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox', ...a], { stdio: 'pipe', timeout: 120000 });
const wrap = (body, extra = '') => `<!doctype html><meta charset="utf-8"><style>${css}${extra}</style><body>${body}</body>`;
const W = 340 + 2 * B, H = 220 + 2 * B;
const MM = 91 / W; // mm per css px of the bleed box → zoom = (91mm in px) / W
for (const lang of Object.keys(LANG)) {
  const dir = path.join(OUT, lang);
  await fs.mkdir(dir, { recursive: true });
  const faces = {};
  for (const side of ['front', 'back']) {
    faces[side] = await face(side, lang);
    const f = path.join(WORK, `${lang}-${side}.html`);
    await fs.writeFile(f, wrap(faces[side]));
    // 91 mm at 600 dpi = 2150 px → scale factor 2150 / W
    run([`--screenshot=${path.join(dir, `RUHOR-card-K-${lang}-${side}.png`)}`, `--window-size=${W},${H}`, `--force-device-scale-factor=${(2150 / W).toFixed(4)}`, '--virtual-time-budget=5000', pathToFileURL(f).href]);
  }
  const zoom = (91 / 25.4) * 96 / W; // 91 mm expressed in css px / W
  const bleedHtml = wrap(['front', 'back'].map((s) => `<div class="page">${faces[s]}</div>`).join(''), `@page{size:91mm 61mm;margin:0}html,body{width:91mm}.page{zoom:${zoom.toFixed(5)};break-after:page;overflow:hidden}`);
  await fs.writeFile(path.join(WORK, `${lang}-bleed.html`), bleedHtml);
  run([`--print-to-pdf=${path.join(dir, `RUHOR-card-K-${lang}-bleed.pdf`)}`, '--no-pdf-header-footer', '--virtual-time-budget=5000', pathToFileURL(path.join(WORK, `${lang}-bleed.html`)).href]);
  // crop marks: page 101 × 71 mm, card centred, marks in the outer 5 mm
  const marks = ['front', 'back'].map((s) => `<div class="mpage"><div class="mcard" style="zoom:${zoom.toFixed(5)}">${faces[s]}</div>
    <svg class="mk" width="101mm" height="71mm" viewBox="0 0 101 71" stroke="#000" stroke-width=".12" fill="none">
      ${[[8, 8], [93, 8], [8, 63], [93, 63]].map(([x, y]) => `<path d="M${x - 4} ${y}H${x - 1.2}M${x + 4} ${y}H${x + 1.2}M${x} ${y - 4}V${y - 1.2}M${x} ${y + 4}V${y + 1.2}"/>`.replace(/M(\S+) (\S+)H(\S+)M(\S+) (\S+)H(\S+)M(\S+) (\S+)V(\S+)M(\S+) (\S+)V(\S+)/, 'M$1 $2H$3M$4 $5H$6M$7 $8V$9M$10 $11V$12')).join('')}
    </svg></div>`).join('');
  const marksHtml = wrap(marks, `@page{size:101mm 71mm;margin:0}html,body{width:101mm}.mpage{position:relative;width:101mm;height:71mm;background:#fff;break-after:page;overflow:hidden}.mcard{position:absolute;left:5mm;top:5mm;width:${W}px}.mk{position:absolute;left:0;top:0}`);
  await fs.writeFile(path.join(WORK, `${lang}-marks.html`), marksHtml);
  run([`--print-to-pdf=${path.join(dir, `RUHOR-card-K-${lang}-marks.pdf`)}`, '--no-pdf-header-footer', '--virtual-time-budget=5000', pathToFileURL(path.join(WORK, `${lang}-marks.html`)).href]);
}
await fs.rm(WORK, { recursive: true, force: true });
console.log('done');
