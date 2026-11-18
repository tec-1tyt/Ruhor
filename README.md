# RUHOR Company — website

Marketing site for **RUHOR Company s.r.o.** (Praha, IČO 29886856) in four languages:
Ukrainian (default), Czech, German, English.

**Stack:** Astro 7 (static pages + one serverless function), TypeScript, Tailwind CSS 4 (tokens/utilities)
with hand-written component CSS, GSAP 3.15 (ScrollTrigger, MorphSVG, SplitText, Flip, CustomEase).
Astro ships zero JS by default, which suits a content site that has to score 90+ on mobile. Its image
pipeline generates AVIF/WebP from the original photos, and the Vercel adapter turns the contact
endpoint into a free serverless function while every page stays static.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321/uk/
npm run build        # production build → dist/ and .vercel/output/
npm run check        # TypeScript + Astro diagnostics (must be 0 errors)
```

Node 22.12+ is required (Vercel runs Node 24).

To test the contact form locally without sending email, create `.env` with `CONTACT_DRY_RUN=true`:
enquiries are then printed in the terminal. See `.env.example`.

## Project structure

```
src/
  i18n/            uk.json · cs.json · de.json · en.json  ← ALL texts, one file per language
  i18n/index.ts    language list, helpers (plural, number format, routes)
  data/
    company.ts     company facts + TODO placeholders (phone, street, register file no.)
    services.ts    17 services in 4 groups (+ photo and pictogram per group)
    projects.ts    portfolio entries (ids, categories)
    photos.ts      photo lookup by file name
  assets/photos/   normalised project photos  <project-id>-<n>.jpg
  assets/fonts/    self-hosted Geologica + IBM Plex Mono (woff2 subsets)
  brand/logo.ts    logo geometry (single source of truth)
  components/      Header, Footer, Logo, Button, … and sections/ (Hero, Services, Projects, …)
  layouts/         BaseLayout.astro — SEO head, hreflang, Open Graph, JSON-LD, fonts
  pages/
    index.astro    "/" → picks visitor language → /uk/ /cs/ /de/ /en/
    [lang]/        index (home), privacy, thanks (after a no-JS form post)
    404.astro      one 404 that switches language from the URL
    api/contact.ts serverless contact endpoint (Resend)
  scripts/         client JS: header, menu, lang switcher, services, projects (filter + lightbox),
                   form, motion (GSAP, loaded after page load)
  styles/global.css design tokens + all component styles
brand/             logo kit (SVG), brand board preview, BRAND.md guidelines
scripts/brand.mjs  regenerates brand kit, favicons and og.jpg from src/brand/logo.ts
public/            favicons, manifest, og.jpg
vercel.json        security headers, trailing slash
```

## Editing content

- **Texts:** edit `src/i18n/<lang>.json`. Keys are identical in all four files; `npm run check` fails
  if a language is missing a key. Placeholders like `{n}` or `{paving}` are filled in by the code.
- **Company data:** `src/data/company.ts`. Fill in `phone`, `street`, `postalCode`, `registryFile`
  and `social` when known. Empty (`null`) values are never shown as placeholders on the site;
  the related UI (call button, street line…) just stays hidden until filled.
- **Add a project:**
  1. Put photos in `src/assets/photos/` as `my-project-1.jpg`, `my-project-2.jpg`, … (JPG, ≤ 2400 px
     long edge recommended; the first photo is the cover).
  2. Add `{ id: 'my-project', categories: ['paving'] }` to `src/data/projects.ts`
     (categories: `paving`, `outdoor`, `interiors`, `groundworks`).
  3. Add `projects.items["my-project"]` with `title`, `desc`, `alt` to all four language files.
  Filter chips and counts update automatically.
- **Messengers:** in `src/data/company.ts` set `messengers.telegram` (username without @) and
  `whatsapp` / `viber` to `true` (they use the main phone number). They appear in the contact block and
  in the mobile contact bar; with nothing filled in, the bar shows e-mail + "Enquire".
- **Before/after:** `src/components/sections/Transform.astro` (two photo pairs from `src/assets/photos`).
- **Services:** names/descriptions in `services.items.*` of each language file; grouping in `src/data/services.ts`.
- **Logo:** edit `src/brand/logo.ts`, then `npm run brand` to regenerate `/brand`, favicons and `og.jpg`.

## Adding a language

1. Copy `src/i18n/en.json` to `src/i18n/<code>.json` and translate every value.
2. In `src/i18n/index.ts`: import it, add it to `dictionaries`, and add an entry to `languages`
   (`hreflang`, `intl` locale, and `fontSubset`: `latin` or `cyrillic`).
3. In `astro.config.mjs` → `sitemap.i18n.locales`, add the code.
4. If the language needs another script (e.g. Greek), add that font subset in `astro.config.mjs`.

Routes (`/<code>/`, `/<code>/privacy/`), hreflang tags, the language switcher, the root
language redirect, the 404 page and the sitemap are all generated from the language list.

## Contact form (Resend)

1. Create a free account at <https://resend.com> **with ruhor.company@seznam.cz** (or verify your own
   domain under Domains to send from an address like `web@your-domain.cz`).
2. Create an API key.
3. In Vercel → Project → Settings → Environment Variables add `RESEND_API_KEY`
   (and optionally `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`). Redeploy.
4. Send a test enquiry from the live site and check the inbox (and spam folder once).

Without the key the endpoint returns *not configured* and the visitor is offered a pre-filled email.
The form never pretends to have sent a message. Spam protection: honeypot field, minimum fill
time, rate limit, and Astro's Origin check against cross-site posts.

## Deploy to Vercel

1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket). If the repository root is the
   parent folder, set **Root Directory = `ruhor-website`** in Vercel.
2. Vercel → *Add New Project* → import the repo. The framework (Astro) is detected; keep the defaults.
3. Add the environment variables above. Deploy.
4. Custom domain: Vercel → Settings → Domains. Then set `SITE_URL=https://your-domain` and redeploy,
   so canonical URLs, hreflang and the sitemap use the final domain.

CLI alternative: `npx vercel` (preview) and `npx vercel --prod`.

## Quality notes

- Lighthouse 12 (production build, Brotli, simulated mobile 4G): Performance 95–96,
  Accessibility 100, Best Practices 100, SEO 100 for all four languages; desktop 100/100/100/100.
  CLS 0, TBT 30 ms. GSAP loads after the `load` event, so the main bundle is ~14 KB.
- The build output is ~100 MB because the Vercel adapter also keeps the 60 original photos
  (for its on-demand image endpoint) next to the AVIF/WebP variants. Visitors only download the
  variant that fits their screen.
- No cookies, no analytics, no third-party requests. Fonts and images are self-hosted.
- `prefers-reduced-motion` gives a static, complete page; all features work without animation.
- Without JavaScript: every section, all projects and the contact form still work.
- QA builds only: `PUBLIC_QA_HOOKS=true npm run build` exposes GSAP on `window` and supports
  `?static` (motionless screenshots). Normal builds don't contain this code.
