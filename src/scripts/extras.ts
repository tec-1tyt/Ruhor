/**
 * Small interactive pieces (no GSAP needed, so they work immediately):
 *  - before/after sliders (pointer drag + keyboard through the hidden range input)
 *  - hero: pointer light (desktop, transform-only)
 *  - click-to-load interactive map (OpenStreetMap, nothing is requested before the click)
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

export function initMap() {
  const btn = document.querySelector<HTMLButtonElement>('[data-map-load]');
  const fig = document.querySelector<HTMLElement>('[data-map]');
  const live = fig?.querySelector<HTMLElement>('[data-map-live]');
  if (!btn || !fig || !live) return;
  btn.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = btn.dataset.src ?? '';
    frame.title = btn.dataset.title ?? '';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('allowfullscreen', '');
    live.replaceChildren(frame);
    live.hidden = false;
    fig.classList.add('is-live');
    btn.hidden = true;
    // The embedded map would swallow page scrolling: it only reacts after a click/tap on it,
    // and gives control back as soon as the pointer leaves or the user taps elsewhere.
    live.addEventListener('click', () => live.classList.add('is-active'));
    live.addEventListener('mouseleave', () => live.classList.remove('is-active'));
    document.addEventListener('pointerdown', (e) => {
      if (!live.contains(e.target as Node)) live.classList.remove('is-active');
    });
  });
}

/** Desktop browsers often have no mail program, so the email tile opens Gmail's compose window instead. */
export function initMailLink() {
  const a = document.querySelector<HTMLAnchorElement>('[data-mail-web]');
  if (!a?.dataset.mailWeb) return;
  const web = a.dataset.mailWeb;
  a.addEventListener('click', (e) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return; // phones: the mail app via mailto:
    e.preventDefault();
    window.open(web, '_blank', 'noopener');
  });
}

/** Light path for phones: elements below the fold fade up once, using only IntersectionObserver + CSS. */
export function initLightReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-img]')];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('rv-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px' },
  );
  for (const el of els) {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) continue; // already on screen: leave alone
    el.classList.add('rv');
    io.observe(el);
  }
}

/** Hero pointer light. Desktop with a mouse only; everything else keeps the quiet static pattern. */
export function initHeroGlow() {
  const hero = document.querySelector<HTMLElement>('.hero');
  const glow = hero?.querySelector<HTMLElement>('[data-hero-glow]');
  const par = hero?.querySelector<HTMLElement>('[data-hero-par]');
  if (!hero || !glow || !par) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)').matches) {
    glow.hidden = true;
    return;
  }
  const HALF = 450; // half of the 900 px light window
  let left = 0, top = 0, hw = 0, hh = 0;
  const measure = () => {
    const r = hero.getBoundingClientRect();
    left = r.left + window.scrollX;
    top = r.top + window.scrollY;
    hw = r.width;
    hh = r.height;
  };
  measure();
  let timer = 0;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = window.setTimeout(measure, 150); });

  let tx = hw * 0.72, ty = hh * 0.4, x = tx, y = ty, raf = 0;
  const apply = () => {
    glow.style.transform = `translate3d(${(x - HALF).toFixed(1)}px,${(y - HALF).toFixed(1)}px,0)`;
    // photo drifts slightly against the cursor (max ±14 px)
    const px = ((x / hw) - 0.5) * -28, py = ((y / hh) - 0.5) * -28;
    par.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
  };
  const tick = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    apply();
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.4 ? requestAnimationFrame(tick) : 0;
  };
  apply();
  hero.addEventListener('pointermove', (e) => {
    tx = e.pageX - left;
    ty = e.pageY - top;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
}
