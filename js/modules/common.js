export function setupCurrentYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('#year').forEach((node) => {
    node.textContent = year;
  });
}

export function setupHeaderScrollState() {
  const header = document.querySelector('.site-header');
  if (!header) {
    return;
  }

  const root = document.documentElement;
  let lastHeaderHeight = '';
  const readBaseHeaderHeight = () =>
    parseFloat(getComputedStyle(root).getPropertyValue('--header-min-height')) || 84;

  const updateState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  const syncHeaderHeight = () => {
    const measuredHeaderHeight = Math.ceil(header.getBoundingClientRect().height);
    const baseHeaderHeight = Math.ceil(readBaseHeaderHeight());
    const nextHeaderHeight = `${Math.max(baseHeaderHeight, measuredHeaderHeight)}px`;
    if (nextHeaderHeight === lastHeaderHeight) {
      return;
    }

    lastHeaderHeight = nextHeaderHeight;
    root.style.setProperty('--header-height', nextHeaderHeight);
  };

  window.addEventListener('scroll', updateState, { passive: true });
  window.addEventListener('resize', syncHeaderHeight);
  window.addEventListener('ui:nav-layout-change', syncHeaderHeight);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      syncHeaderHeight();
    });

    resizeObserver.observe(header);
  }

  updateState();
  syncHeaderHeight();
}
