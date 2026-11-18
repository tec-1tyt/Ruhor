import type { ImageMetadata } from 'astro';
import { photo } from './photos';

/**
 * The 17 services from the owner's list, grouped by construction stage.
 * Names and descriptions live in src/i18n/<lang>.json → services.items.<id>.
 */
export const serviceCategories = [
  {
    id: 'groundworks',
    image: photo('utilities-4'),
    items: ['excavation', 'demolition', 'sewerage', 'waste'],
    // Pictogram (48×48) morphed in the sticky panel: trench cross-section
    shape: 'M4 14H17V33H31V14H44V44H4Z',
  },
  {
    id: 'construction',
    image: photo('stairs-4'),
    items: ['concrete', 'masonry', 'houses', 'roofing', 'facade'],
    // gable house
    shape: 'M7 44V21L24 6L41 21V44Z',
  },
  {
    id: 'paving',
    image: photo('industrial-yard-1'),
    items: ['paving', 'landscaping', 'terraces', 'carports'],
    // fan segment — the arch from the logo
    shape: 'M4 44A20 20 0 0 1 44 44Z',
  },
  {
    id: 'interiors',
    image: photo('showroom-1'),
    items: ['renovation', 'drywall', 'painting', 'flooring'],
    // tile
    shape: 'M6 6H42V42H6Z',
  },
] as const satisfies readonly { id: string; image: ImageMetadata; items: readonly string[]; shape: string }[];

export type ServiceCategoryId = (typeof serviceCategories)[number]['id'];
export type ServiceId = (typeof serviceCategories)[number]['items'][number];

export const allServiceIds: ServiceId[] = serviceCategories.flatMap((c) => [...c.items]);
