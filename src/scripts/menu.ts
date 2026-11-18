/**
 * Mobile menu on a native modal <dialog>: focus is trapped by the browser,
 * Esc closes it, and focus returns explicitly to the burger (Safari does not
 * always restore it — lesson A-03 from the sushi audit).
 * Animates with GSAP when it is loaded and motion is allowed; otherwise opens instantly.
 */
import { animator } from './lazy-gsap';

export function initMenu() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || !openBtn) return;
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-menu-close]');
  const items = dialog.querySelectorAll<HTMLElement>('.menu__nav a, .menu__langs, .menu__foot > *');
  let closing = false;

  const lock = (on: boolean) => document.documentElement.classList.toggle('is-locked', on);

  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    lock(true);
    openBtn.setAttribute('aria-expanded', 'true');
    const g = animator();
    if (!g) return;
    g.gsap.killTweensOf([dialog, items]);
    g.gsap.fromTo(dialog, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 });
    g.gsap.fromTo(items, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, delay: 0.15 });
  };

  const finish = () => {
    dialog.close();
    closing = false;
  };

  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    openBtn.setAttribute('aria-expanded', 'false');
    lock(false);
    const g = animator();
    if (!g) return finish();
    g.gsap.killTweensOf([dialog, items]);
    g.gsap.to(dialog, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.5, ease: 'power3.inOut', onComplete: finish });
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => {
    dialog.style.removeProperty('clip-path');
    items.forEach((el) => el.style.removeProperty('opacity'));
    lock(false);
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus({ preventScroll: true });
  });
  // In-page links: let the browser jump to the anchor, then close the menu.
  dialog.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((a) => a.addEventListener('click', close));
  // Close if the viewport grows past the mobile breakpoint while open.
  window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => e.matches && dialog.open && finish());
}
