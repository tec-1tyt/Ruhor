/**
 * Services sticky panel (desktop): as each stage crosses the middle of the viewport,
 * its photo is revealed (clip from the bottom) and the pictogram morphs to the stage's shape.
 * Without GSAP (still loading, or reduced motion) the swap is instant.
 */
import { animator } from './lazy-gsap';

export function initServices() {
  const root = document.querySelector<HTMLElement>('[data-services]');
  if (!root) return;
  const imgs = [...root.querySelectorAll<HTMLElement>('[data-service-img]')];
  const cats = [...root.querySelectorAll<HTMLElement>('[data-service-cat]')];
  const shape = root.querySelector<SVGPathElement>('[data-service-shape]');
  const index = root.querySelector<HTMLElement>('[data-service-index]');
  if (!imgs.length || !cats.length) return;

  let active = 0;
  const activate = (i: number) => {
    if (i === active) return;
    const prev = imgs[active]!;
    const next = imgs[i]!;
    const down = i > active;
    active = i;
    if (index) index.textContent = String(i + 1).padStart(2, '0');
    const targetShape = cats[i]?.dataset.shape;

    const g = animator();
    if (!g) {
      imgs.forEach((el) => {
        el.classList.toggle('is-active', el === next);
        el.style.removeProperty('clip-path');
      });
      if (shape && targetShape) shape.setAttribute('d', targetShape);
      return;
    }
    const { gsap } = g;
    gsap.killTweensOf([next, prev]);
    next.classList.add('is-active');
    gsap.set(next, { zIndex: 2 });
    gsap.set(prev, { zIndex: 1 });
    gsap.fromTo(
      next,
      { clipPath: down ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.9,
        onComplete: () => {
          imgs.forEach((el) => el !== next && el.classList.remove('is-active'));
          gsap.set(next, { clearProps: 'clipPath,zIndex' });
        },
      },
    );
    gsap.fromTo(next.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.2 });
    if (shape && targetShape) gsap.to(shape, { morphSVG: targetShape, duration: 0.8 });
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
