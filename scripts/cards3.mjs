/**
 * Business cards, set 3: more distinctive layouts (J blueprint, K paving fan, L tape measure,
 * M portrait, N diagonal). Uses the final rhombus logo.   node scripts/cards3.mjs
 * Output: brand/cards3/<lang>/card-<V>-{front,back}.png, print-<V>.pdf, sheet.png
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
  ico: '29886856',
};
const QR_FROM = 'C:/Users/Tec-1/AppData/Local/Temp/claude/e593ecc021efd419/7a8060c7-8225-4560-8e76-1ae036c5925f/scratchpad/qr/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'brand', 'cards3');
const WORK = path.join(OUT, '_html');
await fs.mkdir(path.join(WORK, 'fonts'), { recursive: true });
const QRCode = createRequire(QR_FROM)('qrcode');
const C = { ink: '#131518', stone: '#F2F0EB', plaster: '#E7E3DB', kiln: '#E0592A', brass: '#C4A46A', brassDark: '#8A6D3B', ash: '#9CA1A8' };

const rGlyph = (fill, strut) => `<path fill="${strut}" d="${R.strut}"/><path fill="${fill}" d="${R.arch}"/><path fill="${fill}" d="${R.pillar}"/>`;
const diamond = (size, [d, r, s], style = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 212 212" style="display:block;${style}"><polygon points="106,0 212,106 106,212 0,106" fill="${d}"/><polygon points="106,14 198,106 106,198 14,106" fill="none" stroke="${r}" stroke-width="1.6" opacity="0.55"/><g transform="translate(${106 - 29.6} ${106 - 38.4}) scale(1.6)">${rGlyph(r, s)}</g></svg>`;

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
  uk: { tag: 'Будівельна компанія в Празі', tel: 'Телефон', mail: 'E-mail', web: 'Сайт', scan: 'Наш сайт', svc: 'Наші послуги' },
  cs: { tag: 'Stavební firma v Praze', tel: 'Telefon', mail: 'E-mail', web: 'Web', scan: 'Náš web', svc: 'Naše služby' },
};
const dicts = {};
for (const l of Object.keys(LANG)) dicts[l] = JSON.parse(await fs.readFile(path.join(root, 'src/i18n', `${l}.json`), 'utf8'));
const shortUrl = CONFIG.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
const qr = (color, size) => QRCode.toString(CONFIG.siteUrl, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: color, light: '#0000' } }).then((s) => s.replace('<svg ', `<svg width="${size}" height="${size}" `));

const css = `${fontCss}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:'Geologica',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.card{position:relative;overflow:hidden;background:var(--bg);color:var(--fg)}
.L{width:340px;height:220px}.P{width:220px;height:340px}
svg{display:block}
.abs{position:absolute}
.lbl{font-size:5.4px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);font-weight:500}
.val{font-size:9.2px;font-weight:450;letter-spacing:.01em;line-height:1.25}
.name{display:flex;align-items:center;justify-content:center;gap:9px;color:var(--fg);font-weight:600;font-size:10px;letter-spacing:.3em;white-space:nowrap;text-transform:uppercase}
.name b{font-weight:600;margin-right:-.3em}
.name i{display:block;width:24px;height:.7px;background:var(--acc)}
.tag{font-size:5.6px;letter-spacing:.18em;text-transform:uppercase;color:var(--acc);font-weight:500}
.svc{font-size:5.6px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;line-height:1.18;white-space:normal}
.svc em{display:inline-block;min-width:11px}
.svc em{font-style:normal;color:var(--acc);margin-right:5px;font-weight:600}
`;

const T = {
  ink: { bg: '#111417', fg: '#FFFFFF', acc: C.brass, dia: [C.brass, C.ink, C.stone], qr: C.brass },
  stone: { bg: C.stone, fg: C.ink, acc: C.brassDark, dia: [C.ink, C.stone, C.kiln], qr: C.ink },
  brass: { bg: C.brass, fg: C.ink, acc: C.ink, dia: [C.ink, C.brass, C.stone], qr: C.ink },
};
const vars = (th) => `--bg:${th.bg};--fg:${th.fg};--acc:${th.acc}`;
const services = (d) => SERVICE_IDS.map((id, i) => `<div class="svc"><em>${String(i + 1).padStart(2, '0')}</em>${d.services.items[id].name}</div>`);

const FAN = [[20, 20], [0, 10], [40, 10], [0, 30], [40, 30]].flatMap(([cx, cy]) => [5, 10, 15, 20].map((r) => `<path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}"/>`)).join('');
const ruler = (w, h, vertical = false, color = C.ink, numbers = true) => {
  let s = '';
  for (let i = 0; i <= w / 5.4; i++) {
    const len = i % 10 === 0 ? 12 : i % 5 === 0 ? 8 : 5;
    s += vertical ? `<path d="M${w} ${i * 5.4}H${w - len}"/>` : `<path d="M${i * 5.4} 0V${len}"/>`;
    if (numbers && i % 10 === 0 && i > 0 && !vertical) s += `<text x="${i * 5.4}" y="21" font-size="5.2" font-family="Geologica" font-weight="600" text-anchor="middle" fill="${color}" stroke="none">${i / 10}</text>`;
  }
  return `<svg width="${vertical ? w : w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute" fill="none" stroke="${color}" stroke-width="1">${s}</svg>`;
};

async function face(v, side, lang) {
  const t = LANG[lang], d = dicts[lang];
  const svcs = services(d);
  const row = (l, val, s = 9.2) => `<div><div class="lbl">${l}</div><div class="val" style="font-size:${s}px">${val}</div></div>`;
  let size = 'L', th = T.ink, inner = '';

  if (v === 'J') {
    th = T.ink;
    const gridBg = `background-image:linear-gradient(rgba(196,164,106,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(196,164,106,.11) 1px,transparent 1px);background-size:17px 17px;background-position:8px 8px`;
    if (side === 'front') {
      inner = `<div class="abs" style="inset:0;${gridBg}"></div>
      <svg class="abs" style="left:0;top:0" width="340" height="220" viewBox="0 0 340 220" fill="none" stroke="${C.brass}" stroke-width=".6">
        <path d="M0 105H340M170 0V220" opacity=".4"/>
        <path d="M10 22V10H22M318 10H330V22M10 198V210H22M318 210H330V198" stroke-width="1" />
        <path d="M60 178H280M60 171V185M280 171V185" />
        <path d="M68 178L76 175V181ZM272 178L264 175V181Z" fill="${C.brass}"/>
      </svg>
      <div class="abs" style="left:120px;top:55px">${diamond(100, th.dia)}</div>
      <div class="abs name" style="left:50%;top:178px;transform:translate(-50%,-50%);background:var(--bg);padding:3px 12px"><b>${CONFIG.fullName}</b></div>
      <div class="abs tag" style="left:22px;top:18px">${t.tag}</div><div class="abs tag" style="right:22px;top:18px">IČO ${CONFIG.ico}</div>`;
    } else {
      inner = `<div class="abs" style="inset:0;${gridBg}"></div>
      <div class="abs lbl" style="left:18px;top:14px">${t.svc}</div>
      <div class="abs" style="left:18px;top:28px;right:18px;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-flow:column;grid-template-rows:repeat(6,auto);row-gap:4px;column-gap:9px">${svcs.join('')}</div>
      <div class="abs" style="left:18px;right:18px;bottom:12px;height:56px;border:.7px solid var(--acc);background:var(--bg);display:grid;grid-template-columns:118px minmax(0,1fr) 54px;grid-template-rows:1fr 1fr;overflow:hidden">
        <div style="padding:4px 8px;border-right:.7px solid var(--acc);border-bottom:.7px solid var(--acc)">${row(t.tel, CONFIG.phone, 8.4)}</div>
        <div style="padding:4px 8px;border-bottom:.7px solid var(--acc)">${row(t.mail, CONFIG.email, 8.2)}</div>
        <div style="grid-row:1/3;grid-column:3;border-left:.7px solid var(--acc);display:grid;place-items:center">${await qr(th.qr, 40)}</div>
        <div style="padding:4px 8px;border-right:.7px solid var(--acc)">${row(t.web, shortUrl, 8.2)}</div>
        <div style="padding:4px 8px;display:flex;align-items:center"><div class="name" style="font-size:6.8px;justify-content:flex-start;letter-spacing:.26em"><b>${CONFIG.fullName}</b></div></div>
      </div>`;
    }
  }

  if (v === 'K') {
    if (side === 'front') {
      th = T.ink;
      inner = `<div class="abs" style="inset:0;-webkit-mask-image:radial-gradient(ellipse 190px 120px at 50% 46%,#000 10%,transparent 100%);mask-image:radial-gradient(ellipse 190px 120px at 50% 46%,#000 10%,transparent 100%)">
        <svg width="340" height="220"><defs><pattern id="f" width="40" height="20" patternUnits="userSpaceOnUse"><g fill="none" stroke="${C.brass}" stroke-width=".9">${FAN}</g></pattern></defs><rect width="340" height="220" fill="url(#f)"/></svg></div>
      <svg class="abs" style="left:110px;top:30px" width="120" height="120" viewBox="0 0 212 212"><polygon points="106,-12 224,106 106,224 -12,106" fill="${th.bg}"/></svg>
      <div class="abs" style="left:120px;top:40px">${diamond(100, th.dia)}</div>
      <div class="abs name" style="left:50%;top:176px;transform:translate(-50%,-50%);background:var(--bg);padding:4px 14px"><i></i><b>${CONFIG.fullName}</b><i></i></div>`;
    } else {
      th = T.stone;
      let arcs = '';
      for (let r = 30; r <= 250; r += 14) arcs += `<path d="M${170 - r} 232A${r} ${r} 0 0 1 ${170 + r} 232" opacity="${(0.65 - r / 520).toFixed(2)}"/>`;
      inner = `<svg class="abs" style="left:0;top:0" width="340" height="220" fill="none" stroke="${C.brassDark}" stroke-width=".7">${arcs}</svg>
      <div class="abs" style="left:26px;top:26px;display:flex;align-items:center;gap:12px">${diamond(44, th.dia)}<div><div class="name" style="justify-content:flex-start;letter-spacing:.26em;font-size:9px"><b>${CONFIG.fullName}</b></div><div class="tag" style="margin-top:5px">${t.tag}</div></div></div>
      <div class="abs" style="left:26px;top:96px;display:grid;gap:9px">${row(t.tel, CONFIG.phone)}${row(t.mail, CONFIG.email)}${row(t.web, shortUrl)}</div>
      <div class="abs" style="right:26px;top:92px;text-align:center;background:var(--bg);padding:5px 5px 3px">${await qr(th.qr, 56)}<div class="lbl" style="margin-top:3px;font-size:4.8px">${t.scan}</div></div>`;
    }
  }

  if (v === 'L') {
    if (side === 'front') {
      th = T.ink;
      inner = `<div class="abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding-bottom:30px">${diamond(84, th.dia)}<div class="name"><i></i><b>${CONFIG.fullName}</b><i></i></div></div>
      <div class="abs" style="left:0;right:0;bottom:0;height:30px;background:${C.kiln}"></div>
      <div class="abs" style="left:0;bottom:0;width:340px;height:30px;transform:scaleY(-1)">${ruler(340, 30, false, C.ink, false)}</div>
      <div class="abs" style="left:0;bottom:0;width:340px;height:30px">${ruler(340, 30, false, C.ink, true).replace('style="position:absolute"', 'style="position:absolute;top:0"')}</div>`;
      // flip-free: draw numbers ruler on top-edge of band (see ruler()); the mirrored copy above is removed below
      inner = inner.replace(/<div class="abs" style="left:0;bottom:0;width:340px;height:30px;transform:scaleY\(-1\)">[\s\S]*?<\/div>\s*/, '');
    } else {
      th = T.brass;
      const wall = Array.from({ length: 4 }, () => SERVICE_IDS.map((id) => d.services.items[id].name).join(' · ')).join(' · ');
      inner = `<div class="abs" style="inset:-6px;padding:4px 40px 4px 40px;font-size:7px;line-height:1.95;letter-spacing:.1em;text-transform:uppercase;font-weight:500;text-align:justify;color:rgba(19,21,24,.2);overflow:hidden">${wall}</div>
      <div class="abs" style="left:0;top:0;bottom:0;width:26px;background:${C.ink}"></div>
      <svg class="abs" style="left:0;top:0" width="26" height="220" viewBox="0 0 26 220" fill="none" stroke="${C.brass}" stroke-width="1">${Array.from({ length: 41 }, (_, i) => `<path d="M0 ${i * 5.4}H${i % 10 === 0 ? 14 : i % 5 === 0 ? 9 : 5}"/>`).join('')}</svg>
      <div class="abs" style="left:58px;top:34px;right:26px;background:var(--bg);padding:10px 12px;display:grid;grid-template-columns:1fr 54px;gap:12px;align-items:center;border:.7px solid var(--fg)">
        <div style="display:grid;gap:8px">${row(t.tel, CONFIG.phone)}${row(t.mail, CONFIG.email)}${row(t.web, shortUrl)}</div>
        <div style="text-align:center">${await qr(th.qr, 54)}<div class="lbl" style="margin-top:3px;font-size:4.6px">${t.scan}</div></div>
      </div>
      <div class="abs" style="left:26px;right:0;bottom:0;height:42px;background:var(--bg)"></div>
      <div class="abs" style="left:58px;right:26px;bottom:16px;padding:5px 0"><div class="name" style="font-size:7.6px"><i></i><b>${CONFIG.fullName}</b><i></i></div></div>`;
    }
  }

  if (v === 'M') {
    size = 'P';
    if (side === 'front') {
      th = T.ink;
      inner = `<div class="abs" style="left:60px;top:28px">${diamond(100, th.dia)}</div>
      <div class="abs name" style="left:0;right:0;top:146px;font-size:8.6px;gap:7px"><i style="width:16px"></i><b>${CONFIG.fullName}</b><i style="width:16px"></i></div>
      <div class="abs tag" style="left:0;right:0;top:168px;text-align:center">${t.tag}</div>
      <div class="abs" style="left:24px;right:24px;top:194px;height:.6px;background:var(--acc)"></div>
      <div class="abs" style="left:24px;right:24px;top:203px;display:grid;gap:7px;text-align:center">${row(t.tel, CONFIG.phone, 10.5)}${row(t.mail, CONFIG.email, 8.6)}${row(t.web, shortUrl, 8.6)}</div>
      <div class="abs" style="left:0;right:0;bottom:12px;text-align:center"><div style="display:inline-block">${await qr(th.qr, 34)}</div></div>`;
    } else {
      th = T.brass;
      inner = `<div class="abs" style="left:85px;top:22px">${diamond(50, th.dia)}</div>
      <div class="abs lbl" style="left:0;right:0;top:84px;text-align:center">${t.svc}</div>
      <div class="abs" style="left:34px;right:20px;top:100px;display:grid;gap:5.4px;align-content:start">${svcs.join('')}</div>
      <div class="abs name" style="left:0;right:0;bottom:20px;font-size:7.4px;gap:6px"><i style="width:12px"></i><b>${CONFIG.fullName}</b><i style="width:12px"></i></div>`;
    }
  }

  if (v === 'N') {
    if (side === 'front') {
      th = T.ink;
      inner = `<div class="abs" style="inset:0;background:${C.brass};clip-path:polygon(76% 0,100% 0,100% 100%,57% 100%)"></div>
      <div class="abs" style="left:200px;top:14px">${diamond(190, [C.ink, C.brass, C.stone])}</div>
      <div class="abs" style="left:24px;top:26px"><div class="name" style="justify-content:flex-start;letter-spacing:.28em;font-size:10px"><b>${CONFIG.fullName}</b></div><div style="height:.7px;background:var(--acc);width:110px;margin:9px 0 7px"></div><div class="tag">${t.tag}</div></div>
      <div class="abs" style="left:24px;bottom:24px;display:grid;gap:9px">${row(t.tel, CONFIG.phone)}${row(t.mail, CONFIG.email)}</div>`;
    } else {
      th = T.ink;
      const col = (a) => `<div style="display:grid;gap:7px;align-content:start">${a.join('')}</div>`;
      inner = `<div class="abs lbl" style="left:24px;top:22px">${t.svc}</div>
      <div class="abs" style="left:24px;top:38px;width:200px;display:grid;grid-template-columns:1fr 1fr;column-gap:12px">${col(svcs.slice(0, 9))}${col(svcs.slice(9))}</div>
      <div class="abs" style="left:242px;top:22px;bottom:22px;width:.6px;background:var(--acc)"></div>
      <div class="abs" style="left:256px;top:24px;width:66px;display:grid;gap:10px;justify-items:start">${await qr(th.qr, 66)}<div class="lbl">${t.scan}</div>${row(t.tel, CONFIG.phone, 6.6)}</div>
      <div class="abs name" style="left:24px;bottom:20px;font-size:7.8px;justify-content:flex-start;letter-spacing:.26em"><b>${CONFIG.fullName}</b></div>`;
    }
  }
  return { size, html: `<div class="card ${size}" style="${vars(th)}">${inner}</div>` };
}

const run = (a) => execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox', ...a], { stdio: 'pipe', timeout: 90000 });
const wrap = (body, extra = '') => `<!doctype html><meta charset="utf-8"><style>${css}${extra}</style><body>${body}</body>`;
const VARS = ['J', 'K', 'L', 'M', 'N'];

for (const lang of Object.keys(LANG)) {
  const dir = path.join(OUT, lang);
  await fs.mkdir(dir, { recursive: true });
  const dims = {};
  for (const v of VARS) {
    const pages = [];
    for (const side of ['front', 'back']) {
      const { size, html } = await face(v, side, lang);
      dims[v] = size;
      const [w, h] = size === 'L' ? [340, 220] : [220, 340];
      const f = path.join(WORK, `${lang}-${v}-${side}.html`);
      await fs.writeFile(f, wrap(html));
      run([`--screenshot=${path.join(dir, `card-${v}-${side}.png`)}`, `--window-size=${w},${h}`, '--force-device-scale-factor=6', '--virtual-time-budget=4000', pathToFileURL(f).href]);
      pages.push(`<div class="page">${html}</div>`);
    }
    const mm = dims[v] === 'L' ? '85mm 55mm' : '55mm 85mm';
    const zoom = dims[v] === 'L' ? 0.94488 : 0.94488;
    const pf = path.join(WORK, `${lang}-print-${v}.html`);
    await fs.writeFile(pf, wrap(pages.join(''), `@page{size:${mm};margin:0}html,body{width:${dims[v] === 'L' ? '85mm' : '55mm'}}.page{zoom:${zoom};break-after:page;overflow:hidden}`));
    run([`--print-to-pdf=${path.join(dir, `print-${v}.pdf`)}`, '--no-pdf-header-footer', '--virtual-time-budget=4000', pathToFileURL(pf).href]);
  }
  // overview
  const H = 647, G = 36, P = 48, WL = 1000, WP = 417;
  const comps = [];
  for (const [ri, v] of VARS.entries()) for (const [ci, side] of ['front', 'back'].entries()) {
    const w = dims[v] === 'L' ? WL : WP;
    const buf = await sharp(path.join(dir, `card-${v}-${side}.png`)).resize(w, H).composite([{ input: Buffer.from(`<svg width="${w}" height="${H}"><rect width="${w}" height="${H}" rx="14" fill="#fff"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
    const left = dims[v] === 'L' ? P + ci * (WL + G) : P + (WL * 2 + G - (WP * 2 + G)) / 2 + ci * (WP + G);
    comps.push({ input: buf, left: Math.round(left), top: P + ri * (H + G) });
  }
  await sharp({ create: { width: P * 2 + WL * 2 + G, height: P * 2 + VARS.length * H + (VARS.length - 1) * G, channels: 4, background: '#d8d4ca' } }).composite(comps).png().toFile(path.join(dir, 'sheet.png'));
}
await fs.rm(WORK, { recursive: true, force: true });
console.log('done');
