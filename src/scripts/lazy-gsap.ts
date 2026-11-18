/**
 * GSAP (+ plugins, ~70 KB gz) is loaded after the page has loaded, so it never competes
 * with the first paint. Interactive features work immediately without it and simply
 * animate once it is available.
 */
type GsapModule = typeof import('./gsap');

let mod: GsapModule | null = null;
let pending: Promise<GsapModule> | null = null;

export const loadGsap = () => (pending ??= import('./gsap').then((m) => (mod = m)));

/** The GSAP module if it has finished loading, otherwise null. */
export const gsapNow = () => mod;

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** GSAP module only when motion is allowed and the library is already loaded. */
export const animator = () => (!reducedMotion() && mod ? mod : null);
