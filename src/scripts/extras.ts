/**
 * Small interactive pieces (no GSAP needed, so they work immediately):
 *  - before/after sliders (pointer drag + keyboard through the hidden range input)
 *  - mobile contact bar visibility
 */

export function initCompare() {
  document.querySelectorAll<HTMLElement>('[data-compare]').forEach((root) => {
    const range = root.querySelector<HTMLInputElement>('.compare__range');
    if (!range) return;
    const set = (pct: number) => {
      const v = Math.min(100, Math.max(0, pct));
      root.style.setProperty('--pos', `${v}%`);
      range.value = String(Math.round(v));
    };
    range.addEventListener('input', () => set(Number(range.value)));

    let dragging = false;
    const fromEvent = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    root.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      root.setPointerCapture(e.pointerId);
      range.focus({ preventScroll: true });
      fromEvent(e);
    });
    root.addEventListener('pointermove', (e) => dragging && fromEvent(e));
    const stop = () => (dragging = false);
    root.addEventListener('pointerup', stop);
    root.addEventListener('pointercancel', stop);
  });
}

export function initDock() {
  const dock = document.querySelector<HTMLElement>('[data-dock]');
  const hero = document.getElementById('top');
  const contact = document.getElementById('contact');
  if (!dock || !hero) return;
  let pastHero = false;
  let inContact = false;
  const update = () => dock.classList.toggle('is-visible', pastHero && !inContact);
  new IntersectionObserver(([e]) => {
    pastHero = !!e && !e.isIntersecting && e.boundingClientRect.top < 0;
    update();
  }).observe(hero);
  if (contact) {
    new IntersectionObserver(([e]) => {
      inContact = !!e?.isIntersecting;
      update();
    }, { threshold: 0.15 }).observe(contact);
  }
}
