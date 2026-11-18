/**
 * Contact form: same validation as the server, inline errors with aria-invalid,
 * async submit with clear sending / success / error states. On any delivery failure
 * the visitor gets a ready-made email with their text, so the enquiry is never lost.
 */
import { validate, type FormFields } from '../lib/validation';
import { animator } from './lazy-gsap';

type ErrorStrings = Record<string, string>;

export function initForm() {
  const form = document.querySelector<HTMLFormElement>('[data-form]');
  if (!form) return;
  const success = document.querySelector<HTMLElement>('[data-form-success]');
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const ts = form.querySelector<HTMLInputElement>('[data-ts]');
  const errors = JSON.parse(form.dataset.errors ?? '{}') as ErrorStrings;
  const submitHTML = submit.innerHTML;

  form.noValidate = true; // we show our own, translated messages
  if (ts) ts.value = String(Date.now());

  const fieldsOf = (): FormFields => ({
    name: (form.elements.namedItem('name') as HTMLInputElement).value,
    contact: (form.elements.namedItem('contact') as HTMLInputElement).value,
    message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    service: (form.elements.namedItem('service') as HTMLSelectElement).value,
  });

  const showErrors = (errs: Partial<Record<string, string>>) => {
    for (const key of ['name', 'contact', 'message']) {
      const input = form.elements.namedItem(key) as HTMLInputElement;
      const slot = form.querySelector<HTMLElement>(`[data-error-for="${key}"]`);
      const code = errs[key];
      input.setAttribute('aria-invalid', code ? 'true' : 'false');
      if (slot) slot.textContent = code ? errors[code] ?? '' : '';
    }
  };

  // Re-validate a field as soon as the user fixes it (not while typing the first time).
  form.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.getAttribute('aria-invalid') !== 'true') return;
    const errs = validate(fieldsOf());
    const code = errs[el.name as keyof typeof errs];
    if (!code) {
      el.setAttribute('aria-invalid', 'false');
      const slot = form.querySelector<HTMLElement>(`[data-error-for="${el.name}"]`);
      if (slot) slot.textContent = '';
    }
  });

  const mailtoHref = (f: FormFields) => {
    const body = `${f.message}\n\n— ${f.name}\n${f.contact}`;
    return `mailto:${form.dataset.email}?subject=${encodeURIComponent(form.dataset.subject ?? '')}&body=${encodeURIComponent(body)}`;
  };

  const setSending = (on: boolean) => {
    submit.disabled = on;
    submit.innerHTML = on
      ? `<span class="spinner" aria-hidden="true"></span><span>${form.dataset.sending ?? '…'}</span>`
      : submitHTML;
  };

  const showFailure = (f: FormFields) => {
    status.className = 'form__status form__status--error';
    status.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = errors.failed ?? '';
    const a = document.createElement('a');
    a.className = 'btn btn--sm';
    a.href = mailtoHref(f);
    a.innerHTML = `<span class="btn__roll"><span></span><span aria-hidden="true"></span></span>`;
    a.querySelectorAll('.btn__roll > span').forEach((s) => (s.textContent = errors.mailto ?? 'Email'));
    status.append(p, a);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    const f = fieldsOf();
    const errs = validate(f);
    showErrors(errs);
    if (Object.keys(errs).length) {
      status.textContent = errors.summary ?? '';
      const first = form.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }

    setSending(true);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...f, lang: form.dataset.lang, ts: ts?.value, website: (form.elements.namedItem('website') as HTMLInputElement).value }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Record<string, string> };
      if (res.ok && data.ok) {
        form.reset();
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus();
          animator()?.gsap.from(success.children, { y: 24, opacity: 0, stagger: 0.07, duration: 0.8 });
        }
      } else if (res.status === 422 && data.errors) {
        showErrors(data.errors);
        status.textContent = errors.summary ?? '';
      } else {
        showFailure(f);
      }
    } catch {
      showFailure(f);
    } finally {
      setSending(false);
    }
  });

  document.querySelector('[data-form-again]')?.addEventListener('click', () => {
    if (!success) return;
    success.hidden = true;
    form.hidden = false;
    if (ts) ts.value = String(Date.now());
    (form.elements.namedItem('name') as HTMLInputElement).focus();
  });
}
