/**
 * Header behaviour:
 *  - light/dark theme follows the section currently under the header
 *  - translucent backdrop after the first scroll
 *  - hides on scroll down, returns on scroll up (never while focused)
 *  - scroll-spy: marks the nav link of the section in view with aria-current
 */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const sections = [...document.querySelectorAll<HTMLElement>('main [data-theme], footer[data-theme]')];

  // --- theme under the header: observe a 1px line at the header's vertical centre
  let themeObserver: IntersectionObserver | null = null;
  const observeTheme = () => {
    themeObserver?.disconnect();
    const mid = Math.round(header.offsetHeight / 2);
    themeObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const theme = (e.target as HTMLElement).dataset.theme === 'dark' ? 'dark' : 'light';
            header.dataset.theme = theme;
          }
        }
      },
      { rootMargin: `-${mid}px 0px -${Math.max(0, window.innerHeight - mid - 1)}px 0px` },
    );
    sections.forEach((s) => themeObserver!.observe(s));
  };
  observeTheme();
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(observeTheme, 150);
  });

  // --- scroll state + hide/show
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    const menuOpen = document.documentElement.classList.contains('is-locked');
    if (!menuOpen && !header.matches(':focus-within')) {
      if (y > lastY + 6 && y > 160) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y <= 160) header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();

  // --- scroll-spy for the desktop nav
  const links = new Map(
    [...header.querySelectorAll<HTMLAnchorElement>('[data-nav]')].map((a) => [a.dataset.nav!, a] as const),
  );
  const spyTargets = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  if (spyTargets.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const link = links.get(e.target.id);
          if (!link) continue;
          if (e.isIntersecting) {
            links.forEach((l) => l.removeAttribute('aria-current'));
            link.setAttribute('aria-current', 'true');
          } else if (link.getAttribute('aria-current')) {
            link.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    spyTargets.forEach((s) => spy.observe(s));
  }
}
