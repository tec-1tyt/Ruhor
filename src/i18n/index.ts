import uk from './uk.json';
import cs from './cs.json';
import de from './de.json';
import en from './en.json';

/**
 * Languages. To add one: create src/i18n/<code>.json (copy uk.json), add it below,
 * and add the locale to the sitemap config in astro.config.mjs. Routes are generated automatically.
 */
export type Dict = typeof uk;
export const dictionaries = { uk, cs, de, en } satisfies Record<string, Dict>;
export type Lang = keyof typeof dictionaries;

export const languages: { code: Lang; hreflang: string; intl: string; fontSubset: 'latin' | 'cyrillic' }[] = [
  { code: 'uk', hreflang: 'uk', intl: 'uk-UA', fontSubset: 'cyrillic' },
  { code: 'cs', hreflang: 'cs', intl: 'cs-CZ', fontSubset: 'latin' },
  { code: 'de', hreflang: 'de', intl: 'de-DE', fontSubset: 'latin' },
  { code: 'en', hreflang: 'en', intl: 'en-GB', fontSubset: 'latin' },
];
export const defaultLang: Lang = 'uk';
export const langCodes = languages.map((l) => l.code);

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && v in dictionaries;
export const t = (lang: Lang): Dict => dictionaries[lang];
export const langInfo = (lang: Lang) => languages.find((l) => l.code === lang)!;

/** Replace {placeholders} in a string. */
export const fmt = (str: string, vars: Record<string, string | number>) =>
  str.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));

/** Locale-aware number: 3 600 (uk, cs) · 3.600 (de) · 3,600 (en). */
export const num = (lang: Lang, n: number) => new Intl.NumberFormat(langInfo(lang).intl).format(n);

/** Plural forms via Intl.PluralRules (Czech/Ukrainian have one/few/many/other). */
export const plural = (lang: Lang, n: number, forms: Record<'one' | 'few' | 'many' | 'other', string>) => {
  const rule = new Intl.PluralRules(langInfo(lang).intl).select(n) as keyof typeof forms;
  return fmt(forms[rule] ?? forms.other, { n });
};

/** Route helpers — every URL ends with a slash (matches trailingSlash: 'always'). */
export const paths = {
  home: (lang: Lang) => `/${lang}/`,
  privacy: (lang: Lang) => `/${lang}/privacy/`,
};
export type PageKey = keyof typeof paths;
