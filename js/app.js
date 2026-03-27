import { setupAccessibilityControls } from './modules/accessibility.js';
import { setupCurrentYear, setupHeaderScrollState } from './modules/common.js';
import { setupContactFormEnhancement } from './modules/contact.js';
import {
  setupRevealAnimations,
  setupParallaxLayers,
  setupInteractiveSurfaceGlow,
  setupTiltCards,
  setupHeroFrameLine,
  setupHeroNameTypewriter,
  setupHeroSubtitleTypewriter,
} from './modules/effects.js';
import { initGradePage } from './modules/grade.js';
import { setupMobileNav, setupHomeSectionNav } from './modules/navigation.js';
import { initProjectsSection } from './modules/projects.js';

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || 'home';

  setupCurrentYear();
  setupHeaderScrollState();
  setupAccessibilityControls();
  setupMobileNav();
  setupRevealAnimations();
  setupParallaxLayers();
  setupInteractiveSurfaceGlow();
  setupTiltCards();

  if (page === 'home') {
    setupHomeSectionNav();
    initProjectsSection();
    setupContactFormEnhancement();
    setupHeroFrameLine();
    setupHeroNameTypewriter();
    setupHeroSubtitleTypewriter();
  }

  if (page === 'grade') {
    initGradePage();
  }
});
