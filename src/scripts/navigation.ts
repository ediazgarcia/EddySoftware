const initializedNavigations = new WeakSet<HTMLElement>();

function initNavigation(nav: HTMLElement): void {
  if (initializedNavigations.has(nav)) return;

  const toggle = nav.querySelector<HTMLButtonElement>('.nav__toggle');
  const links = nav.querySelector<HTMLElement>('.nav__links');
  if (!toggle || !links) {
    throw new Error('Navegación: falta el botón móvil o el contenedor de enlaces.');
  }
  initializedNavigations.add(nav);

  const setOpen = (open: boolean): void => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  links.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 721px)').addEventListener('change', () => setOpen(false));
}

const initializeNavigations = (): void => {
  document.querySelectorAll<HTMLElement>('.nav').forEach(initNavigation);
};

initializeNavigations();
new MutationObserver(initializeNavigations).observe(document.body, { childList: true, subtree: true });
