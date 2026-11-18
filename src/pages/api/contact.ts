/**
 * POST /api/contact/ — serverless function on Vercel.
 *
 * Delivery: Resend HTTP API (no SDK). Configure in Vercel → Settings → Environment Variables:
 *   RESEND_API_KEY      required — from resend.com
 *   CONTACT_TO_EMAIL    optional — defaults to the company email
 *   CONTACT_FROM_EMAIL  optional — defaults to "RUHOR web <onboarding@resend.dev>"
 * If the key is missing the endpoint answers 503 and the form offers a pre-filled email
 * instead — it never pretends to have sent anything.
 *
 * Spam protection: honeypot field, minimum fill time, per-instance rate limit,
 * and Astro's built-in Origin check (security.checkOrigin) against cross-site posts.
 */
import type { APIRoute } from 'astro';
import { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, CONTACT_DRY_RUN } from 'astro:env/server';
import { company } from '../../data/company';
import { allServiceIds } from '../../data/services';
import { isLang, paths, t, defaultLang, type Lang } from '../../i18n';
import { validate, LIMITS, type FormFields } from '../../lib/validation';

export const prerender = false;

const MIN_FILL_MS = 2500;
const RATE = { windowMs: 10 * 60_000, max: 5 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((ts) => now - ts < RATE.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE.max;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function readBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const json = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, typeof v === 'string' ? v : '']));
  }
  const form = await request.formData();
  return Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));
}

async function deliver(fields: FormFields, lang: Lang): Promise<'sent' | 'not_configured' | 'failed'> {
  const uk = t('uk'); // the owner reads notifications in Ukrainian
  const serviceName = fields.service && fields.service !== 'other'
    ? uk.services.items[fields.service as keyof typeof uk.services.items]?.name ?? fields.service
    : fields.service === 'other' ? uk.contact.form.serviceOther : '—';
  const rows: [string, string][] = [
    ['Ім’я', fields.name],
    ['Контакт', fields.contact],
    ['Вид робіт', serviceName],
    ['Мова сайту', lang.toUpperCase()],
  ];
  const text = `Новий запит із сайту RUHOR\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nПовідомлення:\n${fields.message}\n`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.55;color:#131518">
<h2 style="margin:0 0 16px;font-size:18px">Новий запит із сайту RUHOR</h2>
<table style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#5a5f66">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>
<p style="margin:20px 0 6px;color:#5a5f66">Повідомлення:</p>
<p style="margin:0;white-space:pre-wrap">${esc(fields.message)}</p></div>`;

  if (import.meta.env.DEV && CONTACT_DRY_RUN) {
    console.info('[contact] DRY RUN — not sent:\n' + text);
    return 'sent';
  }
  if (!RESEND_API_KEY) return 'not_configured';

  const replyTo = fields.contact.includes('@') ? fields.contact.trim() : undefined;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL || 'RUHOR web <onboarding@resend.dev>',
        to: [CONTACT_TO_EMAIL || company.email],
        subject: `Новий запит із сайту — ${fields.name}`.slice(0, 140),
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error('[contact] Resend error', res.status, await res.text());
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    console.error('[contact] network error', err);
    return 'failed';
  }
}

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  let body: Record<string, string>;
  try {
    body = await readBody(request);
  } catch {
    return new Response(JSON.stringify({ ok: false, code: 'bad_request' }), { status: 400 });
  }

  const lang: Lang = isLang(body.lang) ? body.lang : defaultLang;
  const fields: FormFields = {
    name: (body.name ?? '').trim().slice(0, LIMITS.name),
    contact: (body.contact ?? '').trim(),
    message: (body.message ?? '').trim(),
    service: allServiceIds.includes(body.service as never) || body.service === 'other' ? body.service! : '',
  };

  const respond = (status: number, payload: Record<string, unknown>) => {
    if (wantsJson) return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
    if (payload.ok) return redirect(paths.thanks(lang), 303);
    // No-JS error: a minimal localized page with a way back.
    const d = t(lang);
    const msg = payload.code === 'invalid' ? d.contact.errors.summary : d.contact.errors.failed;
    return new Response(
      `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RUHOR</title>
<body style="font:17px/1.6 system-ui,sans-serif;max-width:40rem;margin:15vh auto;padding:0 20px;background:#131518;color:#f2f0eb">
<p>${esc(msg)}</p><p><a style="color:#f07a4a" href="mailto:${company.email}">${company.email}</a></p>
<p><a style="color:#f2f0eb" href="${paths.home(lang)}#contact">← ${esc(d.notFound.back)}</a></p></body></html>`,
      { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  };

  // Spam traps: pretend success so bots learn nothing.
  const ts = Number(body.ts);
  if (body.website || (ts && Date.now() - ts < MIN_FILL_MS)) return respond(200, { ok: true });
  if (rateLimited(clientAddress ?? 'unknown')) return respond(429, { ok: false, code: 'rate_limited' });

  const errors = validate(fields);
  if (Object.keys(errors).length) return respond(422, { ok: false, code: 'invalid', errors });

  const result = await deliver(fields, lang);
  if (result === 'sent') return respond(200, { ok: true });
  return respond(result === 'not_configured' ? 503 : 502, { ok: false, code: result });
};

export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
