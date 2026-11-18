/**
 * Portfolio:
 *  - filter chips with GSAP Flip layout animation, live-region count for screen readers
 *  - lightbox on a native <dialog>: arrows, swipe, Esc, backdrop click,
 *    explicit focus return to the card that opened it (lesson A-03)
 */
import { gsapNow, animator } from './lazy-gsap';

export function initProjects() {
  initFilter();
  initLightbox();
}

function initFilter() {
  const bar = document.querySelector<HTMLElement>('[data-filters]');
  const grid = document.querySelector<HTMLElement>('[data-projects-grid]');
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  if (!bar || !grid) return;
  bar.hidden = false; // filters are a JS-only enhancement; without JS every project is listed
  const cards = [...grid.querySelectorAll<HTMLElement>('.pcard')];
  const chips = [...bar.querySelectorAll<HTMLButtonElement>('[data-filter]')];

  const relayout = () => {
    let count = 0;
    for (const c of cards) {
      if (c.style.display === 'none') continue;
      const slot = count++ % 6;
      c.dataset.slot = String(slot);
      // keep responsive image selection honest when a card changes width
      const sizes = slot === 0 || slot === 5 ? grid.dataset.sizesWide : grid.dataset.sizesNarrow;
      if (sizes) c.querySelectorAll('source, img').forEach((el) => el.getAttribute('sizes') !== sizes && el.setAttribute('sizes', sizes));
    }
    return count;
  };

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      if (chip.getAttribute('aria-pressed') === 'true') return;
      const filter = chip.dataset.filter!;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));

      // Finish any pending scroll reveals so the new layout is measured in its final state.
      const loaded = gsapNow();
      if (loaded) {
        const { gsap } = loaded;
        cards.forEach((c) => {
          gsap.killTweensOf(c);
          gsap.set(c, { clearProps: 'opacity,transform' });
          c.querySelectorAll('[data-reveal-img], [data-reveal-img] img').forEach((el) => {
            gsap.killTweensOf(el);
            gsap.set(el, { clearProps: 'clipPath,transform' });
          });
        });
      }

      const g = animator();
      const state = g?.Flip.getState(cards, { props: 'opacity' });
      for (const c of cards) {
        const show = filter === 'all' || c.dataset.categories!.split(' ').includes(filter);
        c.style.display = show ? '' : 'none';
      }
      const visible = relayout();
      if (status) status.textContent = (status.dataset.template ?? '{n}').replace('{n}', String(visible));

      if (g && state) {
        g.Flip.from(state, {
          duration: 0.8,
          ease: 'brand',
          absolute: true,
          scale: false,
          nested: true,
          onEnter: (els) => g.gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }),
          onLeave: (els) => g.gsap.to(els, { opacity: 0, duration: 0.3 }),
          onComplete: () => g.ScrollTrigger.refresh(),
        });
      } else {
        gsapNow()?.ScrollTrigger.refresh();
      }
    }),
  );
}

function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog) return;
  const stage = dialog.querySelector<HTMLElement>('[data-lb-stage]')!;
  const titleEl = dialog.querySelector<HTMLElement>('[data-lb-title]')!;
  const countEl = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
  const prevBtn = dialog.querySelector<HTMLButtonElement>('[data-lb-prev]')!;
  const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-lb-next]')!;
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-lb-close]')!;
  const photoOf = dialog.dataset.photoOf ?? '{n} / {total}';

  let slides: HTMLElement[] = [];
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    if (!slides.length) return;
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
    countEl.textContent = photoOf.replace('{n}', String(index + 1)).replace('{total}', String(slides.length));
    const single = slides.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
  };

  const open = (id: string, title: string, btn: HTMLElement) => {
    const tpl = document.getElementById(`gallery-${id}`) as HTMLTemplateElement | null;
    if (!tpl) return;
    opener = btn;
    stage.replaceChildren(tpl.content.cloneNode(true));
    slides = [...stage.querySelectorAll<HTMLElement>('.lightbox__slide')];
    titleEl.textContent = title;
    show(0);
    dialog.showModal();
    document.documentElement.classList.add('is-locked');
    animator()?.gsap.fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    closeBtn.focus();
  };

  const close = () => {
    if (!dialog.open) return;
    const g = animator();
    if (!g) return dialog.close();
    g.gsap.to(dialog, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => dialog.close() });
  };

  dialog.addEventListener('close', () => {
    dialog.style.removeProperty('opacity');
    document.documentElement.classList.remove('is-locked');
    stage.replaceChildren();
    slides = [];
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  let swiped = false;
  dialog.addEventListener('click', (e) => {
    // backdrop / empty stage area closes; images and controls don't
    if (swiped) return void (swiped = false);
    const t = e.target as HTMLElement;
    if (t === dialog || t === stage || t.classList.contains('lightbox__slide')) close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  closeBtn.addEventListener('click', close);

  // Swipe (horizontal only — vertical gestures stay native)
  let x0: number | null = null;
  let y0 = 0;
  stage.addEventListener('pointerdown', (e) => {
    x0 = e.clientX;
    y0 = e.clientY;
  });
  stage.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      show(index + (dx < 0 ? 1 : -1));
      setTimeout(() => (swiped = false), 0);
    }
  });

  document.querySelectorAll<HTMLButtonElement>('[data-gallery]').forEach((btn) =>
    btn.addEventListener('click', () => open(btn.dataset.gallery!, btn.dataset.title ?? '', btn)),
  );
}
