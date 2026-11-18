/**
 * Client entry. Every feature runs in its own guard, so a failure in one
 * (e.g. animation) never breaks navigation, the menu or the contact form.
 * Core behaviour starts immediately; the motion layer (GSAP) loads after `load`.
 */
import { initHeader } from './header';
import { initMenu } from './menu';
import { initLang } from './lang';
import { initServices } from './services';
import { initProjects } from './projects';
import { initForm } from './form';
import { initCompare, initHeroFan, initDock } from './extras';
import { loadGsap } from './lazy-gsap';

const guard = (name: string, fn: () => void) => {
  try {
    fn();
  } catch (err) {
    console.error(`[ruhor:${name}]`, err);
  }
};

guard('header', initHeader);
guard('menu', initMenu);
guard('lang', initLang);
guard('services', initServices);
guard('projects', initProjects);
guard('form', initForm);
guard('compare', initCompare);
guard('heroFan', initHeroFan);
guard('dock', initDock);

const startMotion = () =>
  loadGsap()
    .then(() => import('./motion'))
    .then((m) => guard('motion', m.initMotion))
    .catch((err) => console.error('[ruhor:motion] failed to load', err));

if (document.readyState === 'complete') startMotion();
else window.addEventListener('load', startMotion, { once: true });
