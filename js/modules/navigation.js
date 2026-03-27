import { MOBILE_BREAKPOINT, getFocusableElements, getHeaderOffset, prefersReducedMotion } from './utils.js';

export function setupMobileNav() {
  const header = document.querySelector('.site-header');
  const container = document.querySelector('.nav-container');
  const brand = document.querySelector('.brand');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinksGroup = nav ? nav.querySelector('.site-nav__links') : null;
  const navActionsGroup = nav ? nav.querySelector('.site-nav__actions') : null;
  const navControlsGroup = nav ? nav.querySelector('.a11y-controls--icon') : null;
  if (!header || !container || !brand || !toggle || !nav) {
    return;
  }

  let trapActive = false;
  let lastLayoutMode = '';
  let resizeFrame = 0;

  function syncToggleLabel() {
    const isOpen = nav.classList.contains('is-open');
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  }

  function isViewportMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function isCollapsedView() {
    return isViewportMobile() || header.classList.contains('nav--collapsed');
  }

  function publishLayoutChange() {
    const layoutMode = header.classList.contains('nav--collapsed')
      ? 'collapsed'
      : header.classList.contains('nav--compact')
        ? 'compact'
        : 'full';

    if (layoutMode === lastLayoutMode) {
      return;
    }

    lastLayoutMode = layoutMode;
    window.dispatchEvent(new CustomEvent('ui:nav-layout-change', { detail: { layoutMode } }));
  }

  function hasInlineOverflow() {
    const overflowAllowance = 1;
    const groups = [container, nav, brand, navLinksGroup, navActionsGroup, navControlsGroup].filter(Boolean);
    const measurableItems = Array.from(
      header.querySelectorAll('.brand-text strong, .brand-text small, .nav-link, .a11y-btn')
    ).filter((element) => {
      const styles = window.getComputedStyle(element);
      return styles.display !== 'none' && styles.visibility !== 'hidden';
    });

    const hasGroupOverflow = groups.some((element) => {
      return element.scrollWidth > element.clientWidth + overflowAllowance;
    });
    const hasItemOverflow = measurableItems.some((element) => {
      return element.scrollWidth > element.clientWidth + overflowAllowance;
    });

    return (
      hasGroupOverflow ||
      hasItemOverflow ||
      container.scrollWidth > container.clientWidth + overflowAllowance ||
      nav.scrollWidth > nav.clientWidth + overflowAllowance ||
      brand.scrollWidth > brand.clientWidth + overflowAllowance
    );
  }

  function determineLayoutMode() {
    if (isViewportMobile()) {
      return 'collapsed';
    }

    header.classList.remove('nav--compact', 'nav--collapsed');
    void header.offsetWidth;

    if (!hasInlineOverflow()) {
      return 'full';
    }

    header.classList.add('nav--compact');
    void header.offsetWidth;

    return hasInlineOverflow() ? 'collapsed' : 'compact';
  }

  function applyLayoutMode() {
    const nextMode = determineLayoutMode();
    const menuWasOpen = nav.classList.contains('is-open');

    header.classList.toggle('nav--compact', nextMode === 'compact');
    header.classList.toggle('nav--collapsed', nextMode === 'collapsed');

    if (nextMode === 'collapsed') {
      nav.setAttribute('aria-hidden', menuWasOpen ? 'false' : 'true');
    } else {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'false');
      document.body.classList.remove('menu-open');
      trapActive = false;
    }

    syncToggleLabel();
    publishLayoutChange();
  }

  function closeMenu(restoreFocus) {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    if (isCollapsedView()) {
      nav.setAttribute('aria-hidden', 'true');
    } else {
      nav.setAttribute('aria-hidden', 'false');
    }

    trapActive = false;

    if (restoreFocus) {
      toggle.focus();
    }

    syncToggleLabel();
  }

  function openMenu() {
    nav.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    trapActive = true;

    const focusables = getFocusableElements(nav);
    if (focusables.length) {
      requestAnimationFrame(() => focusables[0].focus());
    }

    syncToggleLabel();
  }

  function syncLayoutState() {
    applyLayoutMode();

    if (isCollapsedView()) {
      const opened = nav.classList.contains('is-open');
      nav.setAttribute('aria-hidden', opened ? 'false' : 'true');
    } else {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'false');
      document.body.classList.remove('menu-open');
      trapActive = false;
    }

    syncToggleLabel();
  }

  function requestSyncLayoutState() {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      syncLayoutState();
    });
  }

  toggle.addEventListener('click', () => {
    if (!isCollapsedView()) {
      return;
    }

    if (nav.classList.contains('is-open')) {
      closeMenu(false);
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('click', () => {
      if (isCollapsedView() && nav.classList.contains('is-open')) {
        const isToggleControl = element.classList.contains('a11y-btn');
        if (!isToggleControl) {
          closeMenu(false);
        }
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!isCollapsedView()) {
      return;
    }

    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key !== 'Tab' || !trapActive || !nav.classList.contains('is-open')) {
      return;
    }

    const focusables = getFocusableElements(nav);
    if (!focusables.length) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!isCollapsedView() || !nav.classList.contains('is-open')) {
      return;
    }

    const clickOnNav = nav.contains(event.target);
    const clickOnToggle = toggle.contains(event.target);
    if (!clickOnNav && !clickOnToggle) {
      closeMenu(false);
    }
  });

  window.addEventListener('resize', requestSyncLayoutState);
  window.addEventListener('load', requestSyncLayoutState);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      requestSyncLayoutState();
    });
  }

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      requestSyncLayoutState();
    });

    resizeObserver.observe(container);
    resizeObserver.observe(brand);
    resizeObserver.observe(nav);
  }

  syncLayoutState();
}

export function setupHomeSectionNav() {
  const links = Array.from(document.querySelectorAll('.site-nav [data-nav-target]'));
  if (!links.length) {
    return;
  }

  const sections = links.map((link) => document.getElementById(link.dataset.navTarget)).filter(Boolean);

  if (!sections.length) {
    return;
  }

  function setActive(targetId) {
    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.navTarget === targetId);
      if (link.dataset.navTarget === targetId) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  const hash = window.location.hash.replace('#', '');
  if (hash && sections.some((section) => section.id === hash)) {
    setActive(hash);
  } else {
    setActive(sections[0].id);
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const sectionId = link.dataset.navTarget;
      const section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      event.preventDefault();
      const top = section.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - 8;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      window.history.replaceState(null, '', '#' + sectionId);
      setActive(sectionId);
    });
  });

  if (!('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-' + (getHeaderOffset() + 18) + 'px 0px -52% 0px',
      threshold: 0.15,
    }
  );

  sections.forEach((section) => observer.observe(section));
}
