import type { ImageMetadata } from 'astro';

/**
 * All project photos live in src/assets/photos as `<project>-<n>.jpg`
 * (normalised masters: EXIF/GPS stripped, ≤ 2400 px). Astro generates AVIF/WebP variants.
 */
const files = import.meta.glob<ImageMetadata>('../assets/photos/*.jpg', { eager: true, import: 'default' });

const byName = new Map(
  Object.entries(files).map(([path, img]) => [path.split('/').pop()!.replace('.jpg', ''), img]),
);

export function photo(name: string): ImageMetadata {
  const img = byName.get(name);
  if (!img) throw new Error(`Photo "${name}" not found in src/assets/photos`);
  return img;
}

/** All photos of a project in numeric order: granite-square-1, granite-square-2, … */
export function projectPhotos(projectId: string): ImageMetadata[] {
  return [...byName.entries()]
    .filter(([name]) => name.replace(/-\d+$/, '') === projectId)
    .sort(([a], [b]) => Number(a.split('-').pop()) - Number(b.split('-').pop()))
    .map(([, img]) => img);
}
