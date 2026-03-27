import { getFocusableElements, prefersReducedMotion } from './utils.js';
import { fetchJsonArray, toCleanString } from './data.js';

const AUTOPLAY_DELAY = 4800;
const AUTOPLAY_RESUME_DELAY = 6200;

function createStackLabel(tag) {
  const span = document.createElement('span');
  span.textContent = tag.label;

  if (tag.tooltip) {
    span.setAttribute('data-tooltip', tag.tooltip);
  }

  return span;
}

function createActionLink(label, href, className) {
  const link = document.createElement('a');
  link.className = className;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  return link;
}

function createProjectMedia(project, index) {
  const media = document.createElement('div');
  media.className = 'project-card-media ' + project.mediaClass;

  const mediaTop = document.createElement('div');
  mediaTop.className = 'project-card-media-top';

  const kicker = document.createElement('span');
  kicker.className = 'project-card-kicker';
  kicker.textContent = project.category || project.featuredLabel;

  const indexBadge = document.createElement('span');
  indexBadge.className = 'project-card-index';
  indexBadge.textContent = String(index + 1).padStart(2, '0');

  mediaTop.appendChild(kicker);
  mediaTop.appendChild(indexBadge);
  media.appendChild(mediaTop);

  const fallback = document.createElement('div');
  fallback.className = 'project-card-media-fallback';
  fallback.setAttribute('aria-hidden', 'true');

  const pill = document.createElement('span');
  pill.className = 'project-card-media-pill';
  pill.textContent = project.accentLabel || project.stack[0]?.label || 'Preview';

  const title = document.createElement('strong');
  title.textContent = project.title;

  const description = document.createElement('p');
  description.textContent = project.cardDescription;

  const stack = document.createElement('div');
  stack.className = 'project-card-media-stack';
  project.stack.slice(0, 3).forEach((item) => {
    const label = document.createElement('span');
    label.textContent = item.label;
    stack.appendChild(label);
  });

  fallback.appendChild(pill);
  fallback.appendChild(title);
  fallback.appendChild(description);
  fallback.appendChild(stack);
  media.appendChild(fallback);

  return media;
}

function createProjectCard(project, index) {
  const article = document.createElement('article');
  article.className = 'project-card project-slide';
  article.dataset.projectId = project.id;
  article.dataset.projectTitle = project.title;
  article.dataset.projectSummary = project.modalSummary;
  article.dataset.projectChallenge = project.modalChallenge;
  article.dataset.projectLink = project.repoLink || project.deployLink || '#';
  article.dataset.projectRepoLink = project.repoLink || '';
  article.dataset.projectDeployLink = project.deployLink || '';
  article.dataset.projectDeployLabel = project.deployLabel || 'Ver deploy';
  article.dataset.projectStack = project.stack.map((item) => item.label).join(',');

  const body = document.createElement('div');
  body.className = 'project-card-body';

  const copy = document.createElement('div');
  copy.className = 'project-card-copy';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'project-card-eyebrow';
  eyebrow.textContent = project.featuredLabel || project.category || 'Projeto selecionado';

  const title = document.createElement('h3');
  title.textContent = project.title;

  const description = document.createElement('p');
  description.className = 'project-card-description';
  description.textContent = project.cardDescription;

  const tags = document.createElement('div');
  tags.className = 'project-tags';
  project.stack.forEach((tag) => {
    tags.appendChild(createStackLabel(tag));
  });

  const actions = document.createElement('div');
  actions.className = 'project-actions';

  const detailsButton = document.createElement('button');
  detailsButton.className = 'btn btn-secondary btn-small project-details-btn';
  detailsButton.type = 'button';
  detailsButton.textContent = 'Detalhes';
  actions.appendChild(detailsButton);

  if (project.repoLink) {
    actions.appendChild(
      createActionLink(
        'Repositorio',
        project.repoLink,
        'btn ' + (project.deployLink ? 'btn-secondary' : 'btn-primary') + ' btn-small project-action-link'
      )
    );
  }

  if (project.deployLink) {
    actions.appendChild(
      createActionLink(
        project.deployLabel || 'Ver deploy',
        project.deployLink,
        'btn btn-primary btn-small project-action-link project-action-link--live'
      )
    );
  }

  copy.appendChild(eyebrow);
  copy.appendChild(title);
  copy.appendChild(description);
  body.appendChild(copy);
  body.appendChild(tags);
  body.appendChild(actions);

  article.appendChild(createProjectMedia(project, index));
  article.appendChild(body);

  return article;
}

function normalizeProject(project) {
  const stack = Array.isArray(project.stack)
    ? project.stack
        .map((item) => {
          if (typeof item === 'string') {
            const clean = item.trim();
            return clean ? { label: clean, tooltip: '' } : null;
          }

          if (item && typeof item === 'object') {
            const label = typeof item.label === 'string' ? item.label.trim() : '';
            if (!label) {
              return null;
            }

            const tooltip = typeof item.tooltip === 'string' ? item.tooltip.trim() : '';
            return { label, tooltip };
          }

          return null;
        })
        .filter(Boolean)
    : [];

  const title = toCleanString(project.title);

  return {
    id: toCleanString(project.id) || title.toLowerCase().replace(/\s+/g, '-'),
    title,
    featuredLabel: toCleanString(project.featuredLabel) || 'Projeto em destaque',
    category: toCleanString(project.category),
    accentLabel: toCleanString(project.accentLabel),
    cardDescription: toCleanString(project.cardDescription),
    modalSummary: toCleanString(project.modalSummary),
    modalChallenge: toCleanString(project.modalChallenge),
    repoLink: toCleanString(project.repoLink),
    deployLink: toCleanString(project.deployLink),
    deployLabel: toCleanString(project.deployLabel) || 'Ver deploy',
    mediaClass:
      typeof project.mediaClass === 'string' && project.mediaClass.trim()
        ? project.mediaClass.trim()
        : 'project-card-media--portfolio',
    stack,
  };
}

function isValidProject(project) {
  return (
    project.title &&
    project.cardDescription &&
    project.modalSummary &&
    project.modalChallenge &&
    (project.repoLink || project.deployLink) &&
    project.stack.length > 0
  );
}

function setProjectsStatus(message, type) {
  const track = document.getElementById('projects-track');
  const announcer = document.getElementById('projects-announcer');
  if (!track) {
    return;
  }

  track.innerHTML = '';
  track.style.removeProperty('transform');
  track.style.removeProperty('transition-duration');

  const status = document.createElement('p');
  status.className = 'projects-status';
  status.textContent = message;
  status.setAttribute('role', type === 'error' ? 'alert' : 'status');
  track.appendChild(status);

  if (announcer) {
    announcer.textContent = message;
  }

  const dotsContainer = document.getElementById('projects-dots');
  const prevButton = document.querySelector('[data-slider-action="prev"]');
  const nextButton = document.querySelector('[data-slider-action="next"]');

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
  }

  if (prevButton) {
    prevButton.disabled = true;
  }

  if (nextButton) {
    nextButton.disabled = true;
  }
}

async function fetchProjects() {
  const data = await fetchJsonArray('projects.json');
  const normalized = data.map(normalizeProject).filter(isValidProject);
  if (!normalized.length) {
    throw new Error('projects_empty_data');
  }

  return normalized;
}

function renderProjects(projects) {
  const track = document.getElementById('projects-track');
  if (!track) {
    return false;
  }

  track.innerHTML = '';
  projects.forEach((project, index) => {
    track.appendChild(createProjectCard(project, index));
  });

  return true;
}

function setSlideFocusableState(slide, isDisabled) {
  slide.querySelectorAll('a[href], button').forEach((element) => {
    if (isDisabled) {
      element.setAttribute('tabindex', '-1');
    } else {
      element.removeAttribute('tabindex');
    }
  });
}

function buildSlide(template, index, total, isClone) {
  const slide = template.cloneNode(true);
  slide.dataset.clone = isClone ? 'true' : 'false';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  if (isClone) {
    slide.setAttribute('aria-hidden', 'true');
    setSlideFocusableState(slide, true);
  } else {
    const title = slide.dataset.projectTitle || 'Projeto';
    slide.setAttribute('aria-label', 'Projeto ' + (index + 1) + ' de ' + total + ': ' + title);
    slide.removeAttribute('aria-hidden');
    setSlideFocusableState(slide, false);
  }

  return slide;
}

function setupProjectsSlider() {
  const shell = document.querySelector('.projects-shell');
  const slider = document.getElementById('projects-slider');
  const viewport = slider ? slider.querySelector('.projects-viewport') : null;
  const track = document.getElementById('projects-track');
  const dotsContainer = document.getElementById('projects-dots');
  const prevButton = document.querySelector('[data-slider-action="prev"]');
  const nextButton = document.querySelector('[data-slider-action="next"]');
  const announcer = document.getElementById('projects-announcer');

  if (!shell || !slider || !viewport || !track || !dotsContainer || !prevButton || !nextButton) {
    return;
  }

  const baseSlides = Array.from(track.querySelectorAll('.project-slide')).map((slide) =>
    slide.cloneNode(true)
  );
  const totalSlides = baseSlides.length;
  if (!totalSlides) {
    prevButton.disabled = true;
    nextButton.disabled = true;
    dotsContainer.innerHTML = '';
    return;
  }

  const reducedMotion = prefersReducedMotion();
  const autoplayPauseReasons = new Set();
  let allSlides = [];
  let visibleCount = 1;
  let cloneCount = 0;
  let currentIndex = 0;
  let trackIndex = 0;
  let slideGap = 0;
  let slideWidth = 0;
  let isAnimating = false;
  let loopEnabled = false;
  let autoplayTimer = 0;
  let resizeFrame = 0;
  let nextAutoplayDelay = AUTOPLAY_DELAY;

  const normalizeIndex = (value) => ((value % totalSlides) + totalSlides) % totalSlides;

  const getVisibleCount = () => {
    const rawValue = parseFloat(getComputedStyle(shell).getPropertyValue('--projects-visible-cards'));
    return Math.max(1, Math.round(rawValue || 1));
  };

  const getTrackGap = () => {
    const styles = getComputedStyle(track);
    return parseFloat(styles.columnGap || styles.gap || '0');
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = 0;
    }
  };

  const scheduleAutoplay = (delay = AUTOPLAY_DELAY) => {
    stopAutoplay();

    if (reducedMotion || totalSlides <= 1 || autoplayPauseReasons.size) {
      return;
    }

    autoplayTimer = window.setTimeout(() => {
      if (document.hidden || isAnimating) {
        scheduleAutoplay(delay);
        return;
      }

      moveBy(1);
    }, delay);
  };

  const addPauseReason = (reason) => {
    autoplayPauseReasons.add(reason);
    stopAutoplay();
  };

  const removePauseReason = (reason, delay = AUTOPLAY_DELAY) => {
    autoplayPauseReasons.delete(reason);
    if (!autoplayPauseReasons.size) {
      scheduleAutoplay(delay);
    }
  };

  const announceCurrentSlide = () => {
    if (!announcer) {
      return;
    }

    const title = baseSlides[currentIndex]?.dataset.projectTitle || 'Projeto';
    announcer.textContent = 'Projeto ' + (currentIndex + 1) + ' de ' + totalSlides + ': ' + title;
  };

  const setTrackTransition = (enabled) => {
    if (enabled && !reducedMotion) {
      track.style.removeProperty('transition-duration');
      return;
    }

    track.style.setProperty('transition-duration', '0ms');
  };

  const syncSlideWidths = () => {
    slideGap = getTrackGap();
    slideWidth = Math.max(
      0,
      (viewport.clientWidth - slideGap * Math.max(visibleCount - 1, 0)) / visibleCount
    );

    allSlides.forEach((slide) => {
      slide.style.width = slideWidth.toFixed(2) + 'px';
    });
  };

  const applyTrackPosition = (animate = true) => {
    const offset = trackIndex * (slideWidth + slideGap);
    setTrackTransition(animate);
    track.style.transform = 'translate3d(-' + offset.toFixed(2) + 'px, 0, 0)';
  };

  const updateControls = (announce = false) => {
    prevButton.disabled = !loopEnabled && currentIndex <= 0;
    nextButton.disabled = !loopEnabled && currentIndex >= totalSlides - 1;

    Array.from(dotsContainer.querySelectorAll('.slider-dot')).forEach((dot, index) => {
      const selected = index === currentIndex;
      dot.setAttribute('aria-selected', selected ? 'true' : 'false');
      dot.setAttribute('tabindex', selected ? '0' : '-1');
    });

    if (announce) {
      announceCurrentSlide();
    }
  };

  const buildDots = () => {
    dotsContainer.innerHTML = '';

    baseSlides.forEach((slide, index) => {
      const dot = document.createElement('button');
      const title = slide.dataset.projectTitle || 'Projeto ' + (index + 1);

      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Ir para ' + title);
      dot.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
      dot.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
      dot.addEventListener('click', () => {
        goToIndex(index, true);
      });

      dotsContainer.appendChild(dot);
    });
  };

  const rebuildTrack = (preserveIndex = true) => {
    const nextIndex = preserveIndex ? normalizeIndex(currentIndex) : 0;

    visibleCount = Math.min(getVisibleCount(), totalSlides);
    loopEnabled = totalSlides > visibleCount;
    cloneCount = loopEnabled ? visibleCount : 0;

    track.innerHTML = '';

    if (loopEnabled) {
      baseSlides.slice(-cloneCount).forEach((slide, cloneOffset) => {
        track.appendChild(buildSlide(slide, totalSlides - cloneCount + cloneOffset, totalSlides, true));
      });
    }

    baseSlides.forEach((slide, index) => {
      track.appendChild(buildSlide(slide, index, totalSlides, false));
    });

    if (loopEnabled) {
      baseSlides.slice(0, cloneCount).forEach((slide, index) => {
        track.appendChild(buildSlide(slide, index, totalSlides, true));
      });
    }

    allSlides = Array.from(track.querySelectorAll('.project-slide'));
    syncSlideWidths();

    currentIndex = nextIndex;
    trackIndex = loopEnabled ? currentIndex + cloneCount : currentIndex;

    applyTrackPosition(false);
    void track.getBoundingClientRect();
    setTrackTransition(true);
    buildDots();
    updateControls(true);
  };

  const finishAnimation = () => {
    if (loopEnabled) {
      if (trackIndex < cloneCount) {
        trackIndex += totalSlides;
        applyTrackPosition(false);
        void track.getBoundingClientRect();
      } else if (trackIndex >= totalSlides + cloneCount) {
        trackIndex -= totalSlides;
        applyTrackPosition(false);
        void track.getBoundingClientRect();
      }
    }

    isAnimating = false;
    updateControls(true);
    scheduleAutoplay(nextAutoplayDelay);
    nextAutoplayDelay = AUTOPLAY_DELAY;
  };

  const animateTo = (nextTrackIndex, nextLogicalIndex) => {
    if (isAnimating) {
      return;
    }

    currentIndex = normalizeIndex(nextLogicalIndex);
    trackIndex = nextTrackIndex;
    isAnimating = !reducedMotion;

    applyTrackPosition(!reducedMotion);

    if (!isAnimating) {
      finishAnimation();
      return;
    }

    updateControls(false);
  };

  function moveBy(step) {
    if (totalSlides <= 1 || isAnimating) {
      return;
    }

    if (!loopEnabled) {
      const nextIndex = Math.max(0, Math.min(currentIndex + step, totalSlides - 1));
      if (nextIndex === currentIndex) {
        return;
      }

      animateTo(nextIndex, nextIndex);
      return;
    }

    animateTo(trackIndex + step, currentIndex + step);
  }

  function goToIndex(index, isUserInitiated = false) {
    if (isAnimating || totalSlides <= 1) {
      return;
    }

    const targetIndex = normalizeIndex(index);
    if (targetIndex === currentIndex) {
      if (isUserInitiated) {
        scheduleAutoplay(AUTOPLAY_RESUME_DELAY);
      }
      return;
    }

    if (isUserInitiated) {
      nextAutoplayDelay = AUTOPLAY_RESUME_DELAY;
    }

    if (!loopEnabled) {
      animateTo(targetIndex, targetIndex);
    } else {
      const forwardDistance = (targetIndex - currentIndex + totalSlides) % totalSlides;
      const backwardDistance = forwardDistance - totalSlides;
      const step =
        Math.abs(backwardDistance) < Math.abs(forwardDistance) ? backwardDistance : forwardDistance;
      animateTo(trackIndex + step, targetIndex);
    }

    if (isUserInitiated && !isAnimating && !autoplayPauseReasons.size) {
      scheduleAutoplay(AUTOPLAY_RESUME_DELAY);
    }
  }

  prevButton.onclick = () => {
    nextAutoplayDelay = AUTOPLAY_RESUME_DELAY;
    moveBy(-1);
  };

  nextButton.onclick = () => {
    nextAutoplayDelay = AUTOPLAY_RESUME_DELAY;
    moveBy(1);
  };

  track.addEventListener('transitionend', (event) => {
    if (event.target !== track || event.propertyName !== 'transform' || !isAnimating) {
      return;
    }

    finishAnimation();
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextButton.click();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevButton.click();
    }
  });

  shell.addEventListener('mouseenter', () => addPauseReason('hover'));
  shell.addEventListener('mouseleave', () => removePauseReason('hover', AUTOPLAY_DELAY));
  shell.addEventListener('focusin', () => addPauseReason('focus'));
  shell.addEventListener('focusout', (event) => {
    if (!shell.contains(event.relatedTarget)) {
      removePauseReason('focus', AUTOPLAY_DELAY);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      addPauseReason('hidden');
    } else {
      removePauseReason('hidden', AUTOPLAY_DELAY);
    }
  });

  const handleResize = () => {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(() => {
      rebuildTrack(true);
    });
  };

  window.addEventListener('resize', handleResize);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(viewport);
  }

  rebuildTrack(false);
  scheduleAutoplay();
}

function setupProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalContent = modal ? modal.querySelector('.project-modal-content') : null;
  const closeButton = modal ? modal.querySelector('.project-modal-close') : null;
  const title = document.getElementById('project-modal-title');
  const summary = document.getElementById('project-modal-summary');
  const challenge = document.getElementById('project-modal-challenge');
  const stack = document.getElementById('project-modal-stack');
  const link = document.getElementById('project-modal-link');
  const deploy = document.getElementById('project-modal-deploy');

  if (
    !modal ||
    !modalContent ||
    !closeButton ||
    !title ||
    !summary ||
    !challenge ||
    !stack ||
    !link ||
    !deploy
  ) {
    return;
  }

  let lastTrigger = null;

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');

    if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  function openModal(card, trigger) {
    lastTrigger = trigger || null;

    title.textContent = card.dataset.projectTitle || 'Projeto';
    summary.textContent = card.dataset.projectSummary || '';
    challenge.textContent = card.dataset.projectChallenge || '';
    if (card.dataset.projectRepoLink) {
      link.href = card.dataset.projectRepoLink;
      link.textContent = 'Abrir repositorio';
    } else {
      link.href = card.dataset.projectDeployLink || card.dataset.projectLink || '#';
      link.textContent = card.dataset.projectDeployLink
        ? card.dataset.projectDeployLabel || 'Abrir deploy'
        : 'Abrir projeto';
    }

    if (card.dataset.projectRepoLink && card.dataset.projectDeployLink) {
      deploy.href = card.dataset.projectDeployLink;
      deploy.textContent = card.dataset.projectDeployLabel || 'Ver deploy';
      deploy.hidden = false;
    } else {
      deploy.href = '#';
      deploy.textContent = 'Ver deploy';
      deploy.hidden = true;
    }

    stack.innerHTML = '';
    const stackItems = (card.dataset.projectStack || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    stackItems.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      stack.appendChild(li);
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');

    requestAnimationFrame(() => closeButton.focus());
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.project-details-btn');
    if (!button) {
      return;
    }

    const card = button.closest('.project-card');
    if (!card) {
      return;
    }

    openModal(card, button);
  });

  closeButton.onclick = closeModal;

  modal.onclick = (event) => {
    if (event.target === modal) {
      closeModal();
    }
  };

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusables = getFocusableElements(modalContent);
    if (!focusables.length) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

export async function initProjectsSection() {
  const track = document.getElementById('projects-track');
  if (!track) {
    return;
  }

  track.setAttribute('aria-busy', 'true');
  setProjectsStatus('Carregando projetos...', 'status');

  try {
    const projects = await fetchProjects();
    const rendered = renderProjects(projects);

    if (!rendered) {
      throw new Error('projects_render_failed');
    }

    setupProjectsSlider();
    setupProjectModal();
  } catch {
    setProjectsStatus('Nao foi possivel carregar os projetos agora.', 'error');
  } finally {
    track.setAttribute('aria-busy', 'false');
  }
}
