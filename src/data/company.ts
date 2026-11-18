/**
 * Company facts. Everything here is real data from the project folder,
 * EXCEPT values marked `null` — those are unknown and must be provided by the owner.
 * A `null` value is never rendered as a placeholder on the site: the related UI
 * (call button, street address, register file number…) is simply hidden until filled in.
 */
export const company = {
  brand: 'RUHOR',
  legalName: 'RUHOR Company s.r.o.',
  /** IČO from the Commercial Register extract (Obchodní rejstřík). */
  ico: '29886856',
  city: 'Praha',
  countryCode: 'CZ',
  email: 'ruhor.company@seznam.cz',

  /** TODO(owner): phone in international format, e.g. '+420 777 123 456'. Enables click-to-call. */
  phone: null as string | null,
  /** TODO(owner): registered office street + number, e.g. 'Vinohradská 1234/56'. */
  street: null as string | null,
  /** TODO(owner): ZIP code of the registered office, e.g. '120 00'. */
  postalCode: null as string | null,
  /** TODO(owner): register file number (spisová značka), e.g. 'C 123456 vedená u Městského soudu v Praze'. */
  registryFile: null as string | null,
  /** TODO(owner): social profiles, e.g. [{ label: 'Instagram', url: 'https://instagram.com/…' }]. */
  social: [] as { label: string; url: string }[],

  /**
   * TODO(owner): messengers. `telegram` = username without "@" (e.g. 'ruhor_company').
   * `whatsapp` / `viber`: set to true if the phone number above is on that messenger.
   * Only channels that are filled in appear on the site (contact block + mobile contact bar).
   */
  messengers: { telegram: null as string | null, whatsapp: false, viber: false },

  /** Figures used on the site. pavingM2 is ONE project in Germany (owner, 17.11.2026) — never present it as total company volume. */
  stats: {
    /** One project in Germany: 3 600 m² of paving. */
    pavingM2: 3600,
    /** Number of services in the owner's list (see data/services.ts). */
    services: 17,
  },
};

/** Single-line address for maps and structured data (falls back to the city). */
export const addressLine = [company.street, [company.postalCode, company.city].filter(Boolean).join(' ')]
  .filter(Boolean)
  .join(', ');

/** Universal Google Maps link — opens the native maps app on phones. */
export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${addressLine}, Česká republika`,
)}`;

export const telHref = company.phone ? `tel:${company.phone.replace(/[^\d+]/g, '')}` : null;
export const mailHref = `mailto:${company.email}`;
