/**
 * Services sticky panel (desktop): as each stage crosses the middle of the viewport, its photo
 * and pictogram cross-fade (pure CSS opacity transitions — cheap, no layout or paint work while
 * scrolling). Nothing here needs GSAP.
 */
export function initServices() {
  const root = document.querySelector<HTMLElement>('[data-services]');
  if (!root) return;
  const imgs = [...root.querySelectorAll<HTMLElement>('[data-service-img]')];
  const shapes = [...root.querySelectorAll<SVGPathElement>('[data-service-shape]')];
  const cats = [...root.querySelectorAll<HTMLElement>('[data-service-cat]')];
  const index = root.querySelector<HTMLElement>('[data-service-index]');
  if (!imgs.length || !cats.length) return;

  let active = 0;
  const activate = (i: number) => {
    if (i === active) return;
    active = i;
    imgs.forEach((el, n) => el.classList.toggle('is-active', n === i));
    shapes.forEach((el, n) => el.classList.toggle('is-active', n === i));
    if (index) index.textContent = String(i + 1).padStart(2, '0');
  };

  // A stage is "active" while it crosses the viewport's horizontal centre line.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) activate(Number((e.target as HTMLElement).dataset.serviceCat));
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  cats.forEach((c) => io.observe(c));
}
