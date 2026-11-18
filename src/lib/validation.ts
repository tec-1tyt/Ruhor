/**
 * Contact-form validation shared by the browser (scripts/form.ts) and the
 * serverless endpoint (pages/api/contact.ts), so both always agree.
 */
export const LIMITS = { name: 100, contact: 120, message: 3000 } as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^[+\d\s().\-/]+$/;

/** "@" → validate as email; otherwise as a phone number with at least 9 digits. */
export function isValidContact(value: string): boolean {
  const v = value.trim();
  if (v.includes('@')) return EMAIL_RE.test(v);
  return PHONE_CHARS_RE.test(v) && v.replace(/\D/g, '').length >= 9 && v.replace(/\D/g, '').length <= 15;
}

export type FieldErrorCode = 'nameRequired' | 'contactRequired' | 'contactInvalid' | 'messageRequired' | 'messageTooLong';
export type FormFields = { name: string; contact: string; message: string; service: string };

export function validate(f: FormFields): Partial<Record<'name' | 'contact' | 'message', FieldErrorCode>> {
  const errors: Partial<Record<'name' | 'contact' | 'message', FieldErrorCode>> = {};
  if (f.name.trim().length < 2) errors.name = 'nameRequired';
  if (!f.contact.trim()) errors.contact = 'contactRequired';
  else if (!isValidContact(f.contact) || f.contact.length > LIMITS.contact) errors.contact = 'contactInvalid';
  if (f.message.trim().length < 5) errors.message = 'messageRequired';
  else if (f.message.length > LIMITS.message) errors.message = 'messageTooLong';
  return errors;
}
