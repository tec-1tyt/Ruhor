import { projectPhotos } from './photos';

/**
 * Portfolio. Titles/descriptions describe what is visible in the owner's photos —
 * no invented locations, clients, dates or areas. Text lives in i18n → projects.items.<id>.
 * Filter chips are generated from `categories`, so the filter always covers every project.
 */
export const projectCategories = ['paving', 'outdoor', 'interiors', 'groundworks'] as const;
export type ProjectCategory = (typeof projectCategories)[number];

const defs = [
  { id: 'granite-square', categories: ['paving'] },
  { id: 'showroom', categories: ['interiors'] },
  { id: 'industrial-yard', categories: ['paving', 'groundworks'] },
  { id: 'yards', categories: ['outdoor'] },
  { id: 'hall-fan', categories: ['paving'] },
  { id: 'mall', categories: ['interiors'] },
  { id: 'stairs', categories: ['outdoor'] },
  { id: 'parking', categories: ['paving'] },
  { id: 'paths', categories: ['outdoor', 'paving'] },
  { id: 'interiors', categories: ['interiors'] },
  { id: 'curbs', categories: ['paving', 'groundworks'] },
  { id: 'utilities', categories: ['groundworks'] },
  // Ústí Region: text-only entry (no photos yet). Add usti-region-1.jpg … to src/assets/photos to get a gallery.
  { id: 'usti-region', categories: [], region: true },
] as const satisfies readonly { id: string; categories: readonly ProjectCategory[]; region?: boolean }[];

export type ProjectId = (typeof defs)[number]['id'];

export const projects = defs.map((p) => {
  const photos = projectPhotos(p.id);
  return { ...p, photos, cover: photos[0] ?? null };
});

export const categoryCounts = Object.fromEntries(
  projectCategories.map((c) => [c, projects.filter((p) => (p.categories as readonly string[]).includes(c)).length]),
) as Record<ProjectCategory, number>;
