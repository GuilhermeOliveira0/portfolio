export const MOBILE_BREAKPOINT = 920;

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage indisponivel (modo privado/restrito)
  }
}

export function prefersReducedMotion() {
  return !!reduceMotionQuery.matches;
}

export function getHeaderOffset() {
  const header = document.querySelector('.site-header');
  if (!header) {
    return 80;
  }

  const topOffset = Math.max(0, header.getBoundingClientRect().top);
  return header.offsetHeight + topOffset;
}

export function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll(selectors.join(','))).filter((element) => {
    if (element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    const styles = window.getComputedStyle(element);
    return styles.display !== 'none' && styles.visibility !== 'hidden';
  });
}
