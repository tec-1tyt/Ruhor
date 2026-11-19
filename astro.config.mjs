// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Public site URL (used for canonical, hreflang, sitemap, Open Graph).
 * Priority: SITE_URL env → Vercel production domain → local dev.
 * Set SITE_URL in Vercel once a custom domain is connected.
 */
const SITE =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

// Fonts are self-hosted from src/assets/fonts (copied from @fontsource packages).
// Unicode ranges match Fontsource subsets, so browsers download only what a page uses.
// Variant order matters: BaseLayout preloads one subset per language by index.
const UR = {
  latin: ['U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'],
  'latin-ext': ['U+0100-02BA', 'U+02BD-02C5', 'U+02C7-02CC', 'U+02CE-02D7', 'U+02DD-02FF', 'U+0304', 'U+0308', 'U+0329', 'U+1D00-1DBF', 'U+1E00-1E9F', 'U+1EF2-1EFF', 'U+2020', 'U+20A0-20AB', 'U+20AD-20C0', 'U+2113', 'U+2C60-2C7F', 'U+A720-A7FF'],
  cyrillic: ['U+0301', 'U+0400-045F', 'U+0490-0491', 'U+04B0-04B1', 'U+2116'],
};
// cyrillic-ext is deliberately omitted: Ukrainian is fully covered by 'cyrillic', and its range
// overlaps ґ (U+0491), which would make browsers download both files.
const SUBSETS = /** @type {const} */ (['latin', 'latin-ext', 'cyrillic']);
/** @param {(s: string) => string} file @param {string} weight */
const variants = (file, weight) =>
  /** @type {any} */ (SUBSETS.map((s) => ({ src: [`./src/assets/fonts/${file(s)}`], weight, style: 'normal', unicodeRange: UR[s] })));

export default defineConfig({
  site: SITE,
  // One canonical URL shape everywhere: /uk/, /uk/privacy/ (no redirect hops).
  trailingSlash: 'always',
  // CSS is small (~8 KB brotli) — inlining it removes the only render-blocking request.
  build: { format: 'directory', inlineStylesheets: 'always' },
  adapter: vercel(),
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'uk',
        // same codes as the <link hreflang> tags in the HTML
        locales: { uk: 'uk', cs: 'cs', de: 'de', en: 'en' },
      },
      // Only indexable pages: no root language redirect.
      filter: (page) => new URL(page).pathname !== '/',
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geologica',
      cssVariable: '--font-geologica',
      fallbacks: ['system-ui', 'sans-serif'],
      options: { variants: variants((s) => `geologica-${s}-wght-normal.woff2`, '100 900') },
    },
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      // One weight (500) for every mono label — 400 requests resolve to it, fewer files to load.
      options: { variants: variants((s) => `ibm-plex-mono-${s}-500-normal.woff2`, '500') },
    },
  ],
});
