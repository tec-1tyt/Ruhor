/**
 * RUHOR logo geometry — single source of truth for the inline SVG logo,
 * the brand kit in /brand and the favicons (see scripts/brand.mjs).
 *
 * Construction grid: cap height 48, stroke 10, all curves are true circular arcs.
 * The R is built from three structural elements:
 *   pillar (vertical load)  ·  arch (the bowl)  ·  strut (diagonal brace, accent colour)
 * Paint order is strut → arch → pillar so the overlaps hide under solid parts
 * (no hairline seams, no accent colour bleeding into the bowl).
 */
export const R = {
  strut: 'M9 24H21L37 48H25Z',
  arch: 'M6 0H22A15 15 0 0 1 22 30H6V20H22A5 5 0 0 0 22 10H6Z',
  pillar: 'M0 0H10V48H0Z',
} as const;

/** Blocks the R parts morph from in the intro animation (three foundation stones). */
export const R_BLOCKS = {
  strut: 'M27 38H37V48H27Z',
  arch: 'M13.5 38H23.5V48H13.5Z',
  pillar: 'M0 38H10V48H0Z',
} as const;

export const GLYPHS = {
  U: 'M0 0H10V29A9 9 0 0 0 28 29V0H38V29A19 19 0 0 1 0 29Z',
  H: 'M0 0H10V19H28V0H38V48H28V29H10V48H0Z',
  // stadium "O": outer + inner counter, rendered with fill-rule evenodd
  O: 'M0 19A19 19 0 0 1 38 19V29A19 19 0 0 1 0 29Z M10 19V29A9 9 0 0 0 28 29V19A9 9 0 0 0 10 19Z',
} as const;

/** Letter positions in the wordmark (optically spaced: rounds sit 2 units tighter). */
export const WORDMARK_LAYOUT = [
  { glyph: 'R', x: 0 },
  { glyph: 'U', x: 49 },
  { glyph: 'H', x: 99 },
  { glyph: 'O', x: 147 },
  { glyph: 'R', x: 195 },
] as const;

export const WORDMARK_SIZE = { width: 232, height: 48 } as const;
export const MARK_SIZE = { width: 37, height: 48 } as const;

export const BRAND_COLORS = {
  ink: '#131518',
  basalt: '#1C1F23',
  iron: '#2A2E34',
  concrete: '#5A5F66',
  ash: '#9CA1A8',
  stone: '#F2F0EB',
  plaster: '#E7E3DB',
  line: '#D6D1C7',
  kiln: '#E0592A',
  kilnDeep: '#B5441B',
  kilnSoft: '#F07A4A',
} as const;
