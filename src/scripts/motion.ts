/**
 * Motion language — one curve ("brand" = cubic-bezier(.16,1,.3,1)), three durations
 * (0.25 / 0.5 / 0.9 s), transform + opacity + clip-path only.
 *
 * Rules that keep it glitch-free:
 *  - nothing is hidden by CSS waiting for JS; above-the-fold entrances are pure CSS
 *  - this module loads after `load` (see main.ts); anything already on screen or scrolled
 *    past at that moment is left alone → no visible→hidden flash
 *  - split headings return to plain DOM after their reveal → no re-split flicker on resize
 *  - everything lives inside gsap.matchMedia, so prefers-reduced-motion gets a static,
 *    fully visible page and toggling the OS setting cleans up instantly
 */
import { gsap, ScrollTrigger, SplitText } from './gsap';
import { R_BLOCKS } from '../brand/logo';

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/** True if the element is (at least partly) on screen or above it right now. */
const alreadySeen = (el: Element) => el.getBoundingClientRect().top < window.innerHeight * 0.92;

export function initMotion() {
  // QA builds only: ?static renders the final, motionless layout for screenshot review.
  if (import.meta.env.PUBLIC_QA_HOOKS === 'true' && location.search.includes('static')) {
    document.getAnimations().forEach((a) => a.finish());
    return;
  }
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    splitHeadings();
    reveals();
    imageReveals();
    archEdges();
    processTrack();
    counters();
    scaleTiles();
    parallax();
    footerMark();
    magnetic();
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Section headings: masked line-by-line rise. */
function splitHeadings() {
  $$('[data-split]').forEach((el) => {
    if (alreadySeen(el)) return;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      // lines keep whole words, so screen readers read the text as-is — no aria-label
      // needed (aria-label on <p>/<h2> generic roles is flagged by axe)
      aria: 'none',
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onComplete: () => self.revert(),
        });
      },
    });
  });
}

/** Generic fade-up for text blocks, batched so siblings stagger together. */
function reveals() {
  const els = $$('[data-reveal]').filter((el) => !alreadySeen(el));
  if (!els.length) return;
  gsap.set(els, { opacity: 0, y: 32 });
  ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, clearProps: 'transform' }),
  });
}

/** Photos: wipe in from the bottom while the image settles from a zoom. */
function imageReveals() {
  $$('[data-reveal-img]').forEach((frame) => {
    if (alreadySeen(frame)) return;
    const img = frame.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 88%', once: true } });
    tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, clearProps: 'clipPath' });
    if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 1.4, clearProps: 'transform' }, 0);
  });
}

/** Dark sections start with a hanging arch that flattens as they scroll in. */
function archEdges() {
  $$<SVGPathElement>('[data-arch-edge]').forEach((path) => {
    const section = path.closest('section');
    if (!section) return;
    const state = { h: 20 };
    const draw = () => path.setAttribute('d', `M0 0H100V0Q50 ${state.h.toFixed(2)} 0 0Z`);
    gsap.to(state, {
      h: 0,
      ease: 'none',
      onUpdate: draw,
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 35%', scrub: true },
    });
  });
}

/** Process track draws along the steps; each node lights up as the line reaches it. */
function processTrack() {
  const root = document.querySelector<HTMLElement>('[data-steps]');
  const fill = root?.querySelector<HTMLElement>('[data-steps-fill]');
  const track = fill?.parentElement;
  if (!root || !fill || !track) return;
  const steps = $$('[data-step]', root);
  let marks: number[] = [];

  const measure = () => {
    const tr = track.getBoundingClientRect();
    const horizontal = tr.width > tr.height;
    marks = steps.map((s) => {
      const n = s.querySelector('.step__node')!.getBoundingClientRect();
      return horizontal ? (n.left + n.width / 2 - tr.left) / tr.width : (n.top + n.height / 2 - tr.top) / tr.height;
    });
  };
  const paint = (p: number) => {
    fill.style.setProperty('--p', p.toFixed(4));
    steps.forEach((s, i) => s.classList.toggle('is-reached', p >= (marks[i] ?? 1) - 0.002));
  };

  measure();
  paint(0);
  ScrollTrigger.create({
    trigger: root,
    start: 'top 80%',
    end: () => (track.offsetWidth > track.offsetHeight ? 'top 35%' : 'bottom 60%'),
    scrub: 0.5,
    invalidateOnRefresh: true,
    onRefresh: measure,
    onUpdate: (self) => paint(self.progress),
  });
}

/** Figures count up once, with width locked so nothing around them shifts. */
function counters() {
  $$('[data-count]').forEach((el) => {
    if (alreadySeen(el)) return;
    const target = Number(el.dataset.count);
    const fmt = new Intl.NumberFormat(document.documentElement.lang === 'en' ? 'en-GB' : document.documentElement.lang);
    el.style.display = 'inline-block';
    el.style.minWidth = `${el.offsetWidth}px`;
    const obj = { v: 0 };
    el.textContent = fmt.format(0);
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = fmt.format(Math.round(obj.v))),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/** 3 600 m² grid: squares "get paved" in a diagonal wave; the last one (yours) lands in accent colour. */
function scaleTiles() {
  const grid = document.querySelector<HTMLElement>('[data-tiles]');
  if (!grid || alreadySeen(grid)) return;
  const cols = Number(getComputedStyle(grid).getPropertyValue('--cols')) || 20;
  const tiles = [...grid.children];
  gsap.from(tiles, {
    opacity: 0,
    scale: 0.3,
    duration: 0.5,
    stagger: { amount: 1.8, grid: [Math.ceil(tiles.length / cols), cols], from: 'start' },
    clearProps: 'transform,opacity',
    scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
  });
}

/** Gentle depth on large photos (image moves inside its frame, frame never moves). */
function parallax() {
  $$('[data-parallax]').forEach((img) => {
    const frame = img.closest('.frame');
    if (!frame) return;
    gsap.fromTo(
      img,
      { yPercent: -5, scale: 1.12 },
      { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/** Footer signature: the R assembles from blocks, the other letters rise. */
function footerMark() {
  const mark = document.querySelector('[data-footer-mark] svg');
  if (!mark || alreadySeen(mark)) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: mark, start: 'top 92%', once: true } });
  // Letters U-H-O-R rise from below the baseline…
  const rest = mark.querySelectorAll(':scope > path, :scope > g:not([data-logo-r])');
  tl.from(rest, { yPercent: 105, duration: 1.1, stagger: 0.06 }, 0.15);
  // …while the first R is assembled from three foundation blocks (MorphSVG).
  (['pillar', 'arch', 'strut'] as const).forEach((part, i) => {
    const path = mark.querySelector(`[data-logo-r] [data-part="${part}"]`);
    if (path) tl.from(path, { morphSVG: R_BLOCKS[part], duration: 1.1 }, i * 0.1);
  });
}

/** Magnetic primary CTAs — fine pointers only, small travel, same easing. */
function magnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'brand' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'brand' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * 12);
      y(((e.clientY - r.top) / r.height - 0.5) * 10);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}
