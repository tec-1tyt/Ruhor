/**
 * Business cards, set 2: built around the final lockup (rhombus + "RUHOR COMPANY" with lines).
 *   node scripts/cards2.mjs → brand/cards2/<lang>/card-{E,F,G,H}-{front,back}.png, print PDF, sheet.png
 * Phone / site: edit CONFIG below.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
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
const OUT = path.join(root, 'brand', 'cards2');
const WORK = path.join(OUT, '_html');
await fs.mkdir(path.join(WORK, 'fonts'), { recursive: true });
const QRCode = createRequire(QR_FROM)('qrcode');
const C = { ink: '#131518', stone: '#F2F0EB', plaster: '#E7E3DB', kiln: '#E0592A', brass: '#C4A46A', brassDark: '#8A6D3B', ash: '#9CA1A8' };

const rGlyph = (fill, strut) => `<path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/>`;
const diamond = (size, d, r, s) =>
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

const SERVICE_IDS = ['excavation', 'demolition', 'sewerage', 'waste', 'concrete', 'masonry', 'houses', 'roofing', 'facade', 'paving', 'landscaping', 'terraces', 'carports', 'renovation', 'drywall', 'painting', 'flooring'];
const LANG = {
  uk: { tag: 'Будівельна компанія в Празі', tel: 'Телефон', mail: 'E-mail', web: 'Сайт', scan: 'Наш сайт' },
  cs: { tag: 'Stavební firma v Praze', tel: 'Telefon', mail: 'E-mail', web: 'Web', scan: 'Náš web' },
};
const dicts = {};
for (const l of Object.keys(LANG)) dicts[l] = JSON.parse(await fs.readFile(path.join(root, 'src/i18n', `${l}.json`), 'utf8'));
const shortUrl = CONFIG.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
const qrSvg = (color) => QRCode.toString(CONFIG.siteUrl, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: color, light: '#0000' } });

// themes: ink / stone / brass
const T = {
  ink: { bg: C.ink, fg: '#FFFFFF', acc: C.brass, dia: [C.brass, C.ink, C.stone], wall: 'rgba(196,164,106,.18)', qr: C.brass },
  stone: { bg: C.stone, fg: C.ink, acc: C.brassDark, dia: [C.ink, C.stone, C.kiln], wall: 'rgba(19,21,24,.12)', qr: C.ink },
  brass: { bg: C.brass, fg: C.ink, acc: C.ink, dia: [C.ink, C.brass, C.stone], wall: 'rgba(19,21,24,.2)', qr: C.ink },
};
const VARIANTS = {
  E: { front: 'center', back: 'panel', theme: 'ink' },
  F: { front: 'side', back: 'logo', theme: 'ink' },
  G: { front: 'center', back: 'panel', theme: 'stone' },
  H: { front: 'center', back: 'panel', theme: 'brass' },
};

const css = `${fontCss}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:'Geologica',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.card{width:340px;height:220px;position:relative;overflow:hidden;background:var(--bg);color:var(--fg)}
.page{width:340px;height:220px}
svg{display:block}
.lbl{font-size:5.4px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);font-weight:500}
.val{font-size:9.4px;font-weight:450;letter-spacing:.01em;line-height:1.25}
.name{display:flex;align-items:center;justify-content:center;gap:9px;color:var(--fg);font-weight:600;font-size:10.4px;letter-spacing:.3em;white-space:nowrap;text-transform:uppercase}
.name i{display:block;width:26px;height:.7px;background:var(--acc)}
.name b{font-weight:600;margin-right:-.3em}
.wall{position:absolute;inset:-6px;padding:4px 14px;font-size:7.2px;line-height:1.95;letter-spacing:.1em;text-transform:uppercase;font-weight:500;text-align:justify;color:var(--wall);overflow:hidden;word-spacing:.15em}
.tag{font-size:5.8px;letter-spacing:.18em;text-transform:uppercase;color:var(--acc);font-weight:500}
`;

async function face(vk, side, lang) {
  const v = VARIANTS[vk], th = T[v.theme], t = LANG[lang], d = dicts[lang];
  const vars = `--bg:${th.bg};--fg:${th.fg};--acc:${th.acc};--wall:${th.wall}`;
  const dia = (n) => diamond(n, ...th.dia);
  const wallText = Array.from({ length: 4 }, () => SERVICE_IDS.map((id) => d.services.items[id].name).join(' · ')).join(' · ');
  const row = (l, val) => `<div style="margin-top:7px"><div class="lbl">${l}</div><div class="val">${val}</div></div>`;
  let inner = '';
  if (side === 'front') {
    if (v.front === 'center') {
      inner = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:17px">${dia(96)}<div class="name"><i></i><b>${CONFIG.fullName}</b><i></i></div></div>`;
    } else {
      inner = `
      <div style="position:absolute;left:24px;top:26px">${dia(66)}</div>
      <div style="position:absolute;left:104px;top:34px"><div class="name" style="justify-content:flex-start;gap:0;font-size:10.6px"><b style="margin-right:0">${CONFIG.fullName}</b></div><div style="height:.7px;background:var(--acc);margin:8px 0 8px;width:150px"></div><div class="tag">${t.tag}</div></div>
      <div style="position:absolute;left:24px;right:24px;bottom:22px;display:flex;gap:26px;border-top:.6px solid var(--acc);padding-top:9px">
        <div><div class="lbl">${t.tel}</div><div class="val">${CONFIG.phone}</div></div>
        <div><div class="lbl">${t.mail}</div><div class="val">${CONFIG.email}</div></div>
      </div>`;
    }
  } else {
    const qr = await qrSvg(th.qr);
    if (v.back === 'panel') {
      inner = `
      <div class="wall">${wallText}</div>
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:236px;background:var(--bg);border:.7px solid var(--acc);padding:13px 16px 14px;display:grid;grid-template-columns:1fr 54px;gap:12px;align-items:center">
        <div>${row(t.tel, CONFIG.phone).replace('margin-top:7px', 'margin-top:0')}${row(t.mail, CONFIG.email)}${row(t.web, shortUrl)}</div>
        <div style="text-align:center">${qr.replace('<svg ', '<svg width="54" height="54" ')}<div class="lbl" style="margin-top:4px;font-size:4.6px">${t.scan}</div></div>
      </div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:23px;background:var(--bg);display:flex;align-items:center;justify-content:center"><div class="name" style="font-size:7px;gap:7px"><i style="width:18px"></i><b>${CONFIG.fullName}</b><i style="width:18px"></i></div></div>`;
    } else {
      inner = `
      <div class="wall">${wallText}</div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 112px 84px at 50% 46%,var(--bg) 58%,transparent 100%)"></div>
      <div style="position:absolute;left:50%;top:40px;margin-left:-40px">${dia(80)}</div>
      <div class="val" style="position:absolute;left:0;right:0;top:134px;text-align:center;font-size:8.6px;letter-spacing:.04em;background:linear-gradient(to right,transparent,var(--bg) 20%,var(--bg) 80%,transparent);padding:3px 0">${shortUrl}</div>
      <div style="position:absolute;right:13px;top:13px;width:38px;height:38px;background:var(--bg);padding:3px">${qr.replace('<svg ', '<svg width="32" height="32" ')}</div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:24px;background:var(--bg);display:flex;align-items:center;justify-content:center"><div class="name" style="font-size:7px;gap:7px"><i style="width:18px"></i><b>${CONFIG.fullName}</b><i style="width:18px"></i></div></div>`;
    }
  }
  return `<div class="card" style="${vars}">${inner}</div>`;
}

const run = (a) => execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox', ...a], { stdio: 'pipe', timeout: 90000 });
const wrap = (body, extra = '') => `<!doctype html><meta charset="utf-8"><style>${css}${extra}</style><body>${body}</body>`;

for (const lang of Object.keys(LANG)) {
  const dir = path.join(OUT, lang);
  await fs.mkdir(dir, { recursive: true });
  const pages = [];
  for (const vk of Object.keys(VARIANTS)) for (const side of ['front', 'back']) {
    const html = await face(vk, side, lang);
    pages.push(`<div class="page">${html}</div>`);
    const f = path.join(WORK, `${lang}-${vk}-${side}.html`);
    await fs.writeFile(f, wrap(html));
    run([`--screenshot=${path.join(dir, `card-${vk}-${side}.png`)}`, '--window-size=340,220', '--force-device-scale-factor=6', '--virtual-time-budget=4000', pathToFileURL(f).href]);
  }
  const pf = path.join(WORK, `${lang}-print.html`);
  await fs.writeFile(pf, wrap(pages.join(''), '@page{size:85mm 55mm;margin:0}html,body{width:85mm}.page{zoom:.94488;break-after:page;overflow:hidden}'));
  run([`--print-to-pdf=${path.join(dir, 'print-85x55mm.pdf')}`, '--no-pdf-header-footer', '--virtual-time-budget=4000', pathToFileURL(pf).href]);

  const W = 1000, H = 647, G = 36, P = 48, n = Object.keys(VARIANTS).length;
  const comps = [];
  for (const [ri, vk] of Object.keys(VARIANTS).entries()) for (const [ci, side] of ['front', 'back'].entries()) {
    const buf = await sharp(path.join(dir, `card-${vk}-${side}.png`)).resize(W, H).composite([{ input: Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="14" fill="#fff"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
    comps.push({ input: buf, left: P + ci * (W + G), top: P + ri * (H + G) });
  }
  await sharp({ create: { width: P * 2 + W * 2 + G, height: P * 2 + n * H + (n - 1) * G, channels: 4, background: '#d8d4ca' } }).composite(comps).png().toFile(path.join(dir, 'sheet.png'));
}
await fs.rm(WORK, { recursive: true, force: true });
console.log('done');
