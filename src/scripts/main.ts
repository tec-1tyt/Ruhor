/**
 * Client entry. Every feature runs in its own guard, so a failure in one
 * (e.g. animation) never breaks navigation or the menu.
 * Core behaviour starts immediately; the motion layer (GSAP) loads after `load`.
 */
import { initHeader } from './header';
import { initMenu } from './menu';
import { initLang } from './lang';
import { initServices } from './services';
import { initProjects } from './projects';
import { initCompare, initDock, initMap, initMailLink, initLightReveal, initHeroGlow } from './extras';
import { loadGsap } from './lazy-gsap';

const guard = (name: string, fn: () => void) => {
  try {
    fn();
  } catch (err) {
    console.error(`[ruhor:${name}]`, err);
  }
};

// Mouse vs keyboard: the orange focus ring is for keyboard users only (see extras.css)
const root = document.documentElement;
window.addEventListener('pointerdown', () => { root.dataset.mouse = ''; }, { capture: true, passive: true });
window.addEventListener('keydown', (e) => { if (e.key === 'Tab') delete root.dataset.mouse; }, { capture: true });

guard('header', initHeader);
guard('menu', initMenu);
guard('lang', initLang);
guard('services', initServices);
guard('projects', initProjects);
guard('compare', initCompare);
guard('dock', initDock);
guard('map', initMap);
guard('mail', initMailLink);
guard('heroGlow', initHeroGlow);

// Phones and touch devices get the light path: plain CSS fade-ins, and the animation library is
// never downloaded. Full scroll-linked motion (GSAP) is for desktop-class devices only.
const light = window.matchMedia('(max-width: 1023px), (pointer: coarse)').matches;

const startMotion = () =>
  loadGsap()
    .then(() => import('./motion'))
    .then((m) => guard('motion', m.initMotion))
    .catch((err) => console.error('[ruhor:motion] failed to load', err));

if (light) {
  guard('reveal', initLightReveal);
} else if (document.readyState === 'complete') startMotion();
else window.addEventListener('load', startMotion, { once: true });
