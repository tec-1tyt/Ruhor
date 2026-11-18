import { company, telHref } from './company';

const phoneDigits = company.phone ? company.phone.replace(/\D/g, '') : null;

/** Direct channels that are actually available (hidden until the owner fills the data in company.ts). */
export const channels: { id: 'call' | 'telegram' | 'whatsapp' | 'viber'; href: string; external: boolean }[] = [
  ...(telHref ? [{ id: 'call' as const, href: telHref, external: false }] : []),
  ...(company.messengers.telegram
    ? [{ id: 'telegram' as const, href: `https://t.me/${company.messengers.telegram}`, external: true }]
    : []),
  ...(phoneDigits && company.messengers.whatsapp
    ? [{ id: 'whatsapp' as const, href: `https://wa.me/${phoneDigits}`, external: true }]
    : []),
  ...(phoneDigits && company.messengers.viber
    ? [{ id: 'viber' as const, href: `viber://chat?number=%2B${phoneDigits}`, external: false }]
    : []),
];
