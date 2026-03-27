import { prefersReducedMotion } from './utils.js';

const INTERACTIVE_SURFACE_SELECTOR = '.about-card, .skill-card, .project-card, .contact-links a, .hero-panel';
const TILT_SURFACE_SELECTOR = '[data-tilt-card]';

function updateSurfacePointer(surface, event) {
  const rect = surface.getBoundingClientRect();
  const relativeX = (event.clientX - rect.left) / rect.width;
  const relativeY = (event.clientY - rect.top) / rect.height;
  const xPercent = Math.max(0, Math.min(100, relativeX * 100));
  const yPercent = Math.max(0, Math.min(100, relativeY * 100));

  surface.style.setProperty('--pointer-x', xPercent.toFixed(2) + '%');
  surface.style.setProperty('--pointer-y', yPercent.toFixed(2) + '%');

  if (!surface.matches(TILT_SURFACE_SELECTOR) || prefersReducedMotion()) {
    return;
  }

  const offsetX = relativeX - 0.5;
  const offsetY = relativeY - 0.5;
  const rotateY = offsetX * 14;
  const rotateX = offsetY * -14;
  const glareStrength = Math.min(0.42, 0.16 + (Math.abs(offsetX) + Math.abs(offsetY)) * 0.34);

  surface.style.setProperty('--tilt-rotate-x', rotateX.toFixed(2) + 'deg');
  surface.style.setProperty('--tilt-rotate-y', rotateY.toFixed(2) + 'deg');
  surface.style.setProperty('--tilt-glare-opacity', glareStrength.toFixed(3));
}

function resetSurfacePointer(surface) {
  surface.style.removeProperty('--pointer-x');
  surface.style.removeProperty('--pointer-y');

  if (!surface.matches(TILT_SURFACE_SELECTOR)) {
    return;
  }

  surface.style.setProperty('--tilt-rotate-x', '0deg');
  surface.style.setProperty('--tilt-rotate-y', '0deg');
  surface.style.setProperty('--tilt-glare-opacity', '0');
}

function ensureHeroSubtitleTypewriterParts(subtitle) {
  let content = subtitle.querySelector('.hero-subtitle__content');
  let prefix = subtitle.querySelector('.hero-subtitle__prefix');
  let tail = subtitle.querySelector('.hero-subtitle__tail');
  let lastChar = subtitle.querySelector('.hero-subtitle__last-char');
  let cursor = subtitle.querySelector('.hero-subtitle__cursor');

  if (content && prefix && tail && lastChar && cursor) {
    return { content, prefix, tail, lastChar, cursor };
  }

  subtitle.textContent = '';

  content = document.createElement('span');
  content.className = 'hero-subtitle__content';

  prefix = document.createElement('span');
  prefix.className = 'hero-subtitle__prefix';

  tail = document.createElement('span');
  tail.className = 'hero-subtitle__tail';

  lastChar = document.createElement('span');
  lastChar.className = 'hero-subtitle__last-char';

  cursor = document.createElement('span');
  cursor.className = 'hero-subtitle__cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.textContent = '|';

  tail.append(lastChar, cursor);
  content.append(prefix, tail);
  subtitle.append(content);

  return { content, prefix, tail, lastChar, cursor };
}

function renderHeroSubtitleText(parts, value) {
  const safeValue = value || '';
  const lastCharStart = Math.max(safeValue.length - 1, 0);

  parts.prefix.textContent = safeValue.slice(0, lastCharStart);
  parts.lastChar.textContent = safeValue.slice(lastCharStart);
}

export function setupRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) {
    return;
  }

  document.querySelectorAll('[data-section]').forEach((section) => {
    const revealGroup = Array.from(section.querySelectorAll('.reveal'));
    revealGroup.forEach((element, index) => {
      if (!element.style.getPropertyValue('--reveal-delay')) {
        element.style.setProperty('--reveal-delay', Math.min(index * 75, 420) + 'ms');
      }
    });
  });

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, targetObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          targetObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((element) => observer.observe(element));
}

export function setupParallaxLayers() {
  const layers = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!layers.length || prefersReducedMotion()) {
    return;
  }

  const activeLayers = new Set();
  let ticking = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeLayers.add(entry.target);
        } else {
          activeLayers.delete(entry.target);
        }
      });

      requestTick();
    },
    {
      rootMargin: '25% 0px 25% 0px',
      threshold: 0,
    }
  );

  const updateLayerPositions = () => {
    if (!activeLayers.size) {
      ticking = false;
      return;
    }

    activeLayers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallaxSpeed || '0.1');
      const container = layer.closest('[data-parallax-container]');

      if (!container) {
        layer.style.transform = 'translate3d(0, ' + (window.scrollY * speed).toFixed(2) + 'px, 0)';
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;
      const distance = sectionCenter - viewportCenter;
      const offset = -(distance * speed);

      layer.style.transform = 'translate3d(0, ' + offset.toFixed(2) + 'px, 0)';
    });

    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateLayerPositions);
    }
  };

  layers.forEach((layer) => observer.observe(layer));
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  requestTick();
}

export function setupInteractiveSurfaceGlow() {
  if (!window.matchMedia('(pointer:fine)').matches) {
    return;
  }

  const surfaces = Array.from(document.querySelectorAll(INTERACTIVE_SURFACE_SELECTOR));
  if (!surfaces.length) {
    return;
  }

  const bindGlow = (surface) => {
    if (surface.dataset.surfacePointerBound === 'true') {
      return;
    }

    surface.addEventListener('pointerenter', (event) => updateSurfacePointer(surface, event));
    surface.addEventListener('pointermove', (event) => updateSurfacePointer(surface, event));
    surface.addEventListener('pointerleave', () => resetSurfacePointer(surface));
    surface.dataset.surfacePointerBound = 'true';
  };

  if (!('IntersectionObserver' in window)) {
    surfaces.forEach(bindGlow);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          bindGlow(entry.target);
        }
      });
    },
    {
      rootMargin: '20% 0px 20% 0px',
      threshold: 0,
    }
  );

  surfaces.forEach((surface) => observer.observe(surface));
}

export function setupTiltCards() {
  if (prefersReducedMotion() || !window.matchMedia('(pointer:fine)').matches) {
    return;
  }

  const cards = Array.from(document.querySelectorAll(TILT_SURFACE_SELECTOR));
  if (!cards.length) {
    return;
  }

  const initializeTiltCard = (card) => {
    if (card.dataset.tiltBound === 'true') {
      return;
    }

    card.style.setProperty('--tilt-rotate-x', '0deg');
    card.style.setProperty('--tilt-rotate-y', '0deg');
    card.style.setProperty('--tilt-glare-opacity', '0');
    card.dataset.tiltBound = 'true';
  };

  if (!('IntersectionObserver' in window)) {
    cards.forEach(initializeTiltCard);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          initializeTiltCard(entry.target);
        }
      });
    },
    {
      rootMargin: '20% 0px 20% 0px',
      threshold: 0,
    }
  );

  cards.forEach((card) => observer.observe(card));
}

export function setupHeroNameTypewriter() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName) {
    return;
  }

  const fullName = (heroName.dataset.text || heroName.textContent || '').replace(/\s+/g, ' ').trim();
  if (!fullName) {
    return;
  }

  const applyNameState = () => {
    heroName.textContent = fullName;
    heroName.classList.toggle('name-pulsing', !prefersReducedMotion());
  };

  heroName.dataset.text = fullName;
  heroName.setAttribute('aria-label', fullName);

  if (heroName.dataset.nameTypewriterBound === 'true') {
    applyNameState();
    return;
  }

  heroName.dataset.nameTypewriterBound = 'true';
  window.addEventListener('pageshow', applyNameState);

  applyNameState();
}

export function setupHeroSubtitleTypewriter() {
  const subtitle = document.querySelector('.hero-subtitle');
  if (!subtitle || subtitle.dataset.typewriterBound === 'true') {
    return;
  }

  const fullText = (subtitle.dataset.text || subtitle.textContent || '').replace(/\s+/g, ' ').trim();
  if (!fullText) {
    return;
  }

  subtitle.dataset.typewriterBound = 'true';
  subtitle.dataset.text = fullText;
  subtitle.setAttribute('aria-label', fullText);
  const subtitleParts = ensureHeroSubtitleTypewriterParts(subtitle);
  const setSubtitleText = (value) => renderHeroSubtitleText(subtitleParts, value);

  const typeSpeed = 62;
  const deleteSpeed = 40;
  const holdAfterComplete = 1350;
  const holdBeforeRestart = 560;
  const initialDelay = 920;

  let cursor = 0;
  let phase = 'typing';
  let timerId = null;
  let isStaticMode = false;
  let resizeFrame = 0;

  const clearTimer = () => {
    if (!timerId) {
      return;
    }

    window.clearTimeout(timerId);
    timerId = null;
  };

  const schedule = (nextFn, delay) => {
    clearTimer();
    timerId = window.setTimeout(nextFn, delay);
  };

  const shouldUseStaticSubtitle = () => prefersReducedMotion() || window.innerWidth <= 1080;

  const syncReservedHeight = () => {
    const parent = subtitle.parentElement;
    if (!parent) {
      return;
    }

    const computedStyles = window.getComputedStyle(subtitle);
    const parentWidth = parent.getBoundingClientRect().width;
    const explicitMaxWidth = Number.parseFloat(computedStyles.maxWidth);
    const fallbackWidth = subtitle.getBoundingClientRect().width;
    const targetWidth = Number.isFinite(explicitMaxWidth)
      ? Math.min(parentWidth || explicitMaxWidth, explicitMaxWidth)
      : Math.max(fallbackWidth, parentWidth);

    const measurement = subtitle.cloneNode(false);
    measurement.classList.add('hero-subtitle--measure');
    measurement.classList.remove('hero-subtitle--static');
    measurement.removeAttribute('id');
    measurement.removeAttribute('aria-label');
    measurement.setAttribute('aria-hidden', 'true');
    measurement.style.width = `${Math.max(1, Math.ceil(targetWidth))}px`;
    measurement.style.maxWidth = 'none';

    const measurementParts = ensureHeroSubtitleTypewriterParts(measurement);

    parent.appendChild(measurement);
    let nextHeight = 0;
    for (let index = 0; index <= fullText.length; index += 1) {
      renderHeroSubtitleText(measurementParts, fullText.slice(0, index));
      nextHeight = Math.max(nextHeight, Math.ceil(measurement.getBoundingClientRect().height));
    }

    measurement.remove();

    if (nextHeight > 0) {
      subtitle.style.setProperty('--hero-subtitle-reserved-height', `${nextHeight}px`);
    }
  };

  const requestReservedHeightSync = () => {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      syncReservedHeight();
    });
  };

  const applyStaticState = () => {
    clearTimer();
    cursor = fullText.length;
    phase = 'typing';
    isStaticMode = true;
    setSubtitleText(fullText);
    subtitle.classList.add('hero-subtitle--static');
  };

  const startAnimatedLoop = (delay = initialDelay) => {
    if (shouldUseStaticSubtitle()) {
      applyStaticState();
      return;
    }

    clearTimer();
    cursor = 0;
    phase = 'typing';
    isStaticMode = false;
    setSubtitleText('');
    subtitle.classList.remove('hero-subtitle--static');
    schedule(runStep, delay);
  };

  const runStep = () => {
    timerId = null;

    if (shouldUseStaticSubtitle()) {
      applyStaticState();
      return;
    }

    if (phase === 'typing') {
      cursor = Math.min(cursor + 1, fullText.length);
      setSubtitleText(fullText.slice(0, cursor));

      if (cursor >= fullText.length) {
        phase = 'deleting';
        schedule(runStep, holdAfterComplete);
        return;
      }

      schedule(runStep, typeSpeed);
      return;
    }

    cursor = Math.max(cursor - 1, 0);
    setSubtitleText(fullText.slice(0, cursor));

    if (cursor <= 0) {
      phase = 'typing';
      schedule(runStep, holdBeforeRestart);
      return;
    }

    schedule(runStep, deleteSpeed);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearTimer();
      return;
    }

    if (shouldUseStaticSubtitle()) {
      applyStaticState();
      return;
    }

    if (!timerId) {
      schedule(runStep, isStaticMode ? 0 : typeSpeed);
    }
  };

  const syncMode = () => {
    requestReservedHeightSync();

    if (shouldUseStaticSubtitle()) {
      applyStaticState();
      return;
    }

    if (document.hidden) {
      return;
    }

    if (isStaticMode || !timerId) {
      startAnimatedLoop(isStaticMode ? 0 : initialDelay);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('resize', syncMode);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      requestReservedHeightSync();
    });
  }

  syncMode();
}

export function setupHeroFrameLine() {
  const wraps = Array.from(document.querySelectorAll('.hero-photo-wrap'));
  if (!wraps.length) {
    return;
  }

  const syncFrameGeometry = (wrap) => {
    const svg = wrap.querySelector('.hero-frame-line');
    const rect = svg?.querySelector('rect');
    if (!svg || !rect) {
      return;
    }

    const box = svg.getBoundingClientRect();
    const width = box.width;
    const height = box.height;
    if (!width || !height) {
      return;
    }

    const styles = window.getComputedStyle(wrap);
    const strokeWidth = parseFloat(styles.getPropertyValue('--frame-line-width')) || 2;
    const inset = strokeWidth / 2;
    const radius = parseFloat(styles.borderTopLeftRadius) || 0;
    const adjustedRadius = Math.max(0, Math.min(radius - inset, width / 2 - inset, height / 2 - inset));

    svg.setAttribute('viewBox', `0 0 ${width.toFixed(2)} ${height.toFixed(2)}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    rect.setAttribute('x', inset.toFixed(2));
    rect.setAttribute('y', inset.toFixed(2));
    rect.setAttribute('width', Math.max(0, width - strokeWidth).toFixed(2));
    rect.setAttribute('height', Math.max(0, height - strokeWidth).toFixed(2));
    rect.setAttribute('rx', adjustedRadius.toFixed(2));
    rect.setAttribute('ry', adjustedRadius.toFixed(2));
  };

  const syncAll = () => wraps.forEach(syncFrameGeometry);

  syncAll();

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => syncFrameGeometry(entry.target));
    });

    wraps.forEach((wrap) => observer.observe(wrap));
    return;
  }

  window.addEventListener('resize', syncAll);
}
