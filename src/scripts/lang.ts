/**
 * Language switcher: accessible disclosure (button + list) on desktop.
 * Switching language keeps the section you were reading (#hash is carried over).
 */
export function initLang() {
  const root = document.querySelector<HTMLElement>('[data-lang]');
  const btn = root?.querySelector<HTMLButtonElement>('.lang__btn');
  const list = root?.querySelector<HTMLElement>('.lang__list');

  if (root && btn && list) {
    const setOpen = (open: boolean) => {
      btn.setAttribute('aria-expanded', String(open));
      list.classList.toggle('is-open', open);
    };
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open) list.querySelector<HTMLAnchorElement>('a')?.focus();
    });
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target as Node)) setOpen(false);
    });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const links = [...list.querySelectorAll<HTMLAnchorElement>('a')];
        const i = links.indexOf(document.activeElement as HTMLAnchorElement);
        if (i === -1) return;
        e.preventDefault();
        links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length]!.focus();
      }
    });
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget as Node)) setOpen(false);
    });
  }

  // Keep the current section when switching language.
  document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((a) => {
    a.addEventListener('click', () => {
      const hash = location.hash;
      if (hash && !a.href.includes('#') && !a.hasAttribute('aria-current')) a.href = a.href + hash;
    });
  });
}
