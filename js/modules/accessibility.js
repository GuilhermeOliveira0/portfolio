import { safeGetItem, safeSetItem } from './utils.js';

const COLORBLIND_STORAGE_KEY = 'colorblindMode';
const COLORBLIND_FILTER_NAME = 'Deuteranopia';
const COLORBLIND_CLASS = 'colorblind-mode';

export function setupAccessibilityControls() {
  const controls = Array.from(document.querySelectorAll('[data-a11y-action]'));
  if (!controls.length) {
    return;
  }

  const root = document.documentElement;
  const colorblindButtons = controls.filter((btn) => btn.dataset.a11yAction === 'toggle-colorblind');
  const themeButtons = controls.filter((btn) => btn.dataset.a11yAction === 'toggle-theme');
  const vlibrasButtons = controls.filter((btn) => btn.dataset.a11yAction === 'toggle-vlibras');

  function isColorblindEnabled() {
    return document.documentElement.classList.contains(COLORBLIND_CLASS);
  }

  function setColorblindEnabled(enabled) {
    document.documentElement.classList.toggle(COLORBLIND_CLASS, enabled);
    document.body.classList.toggle(COLORBLIND_CLASS, enabled);
  }

  function getColorblindToggleLabel(isEnabled) {
    return isEnabled
      ? `Desativar filtro de daltonismo (${COLORBLIND_FILTER_NAME})`
      : `Ativar filtro de daltonismo (${COLORBLIND_FILTER_NAME})`;
  }

  function getVlibrasToggleLabel(isEnabled) {
    return isEnabled
      ? 'Desativar acessibilidade em Libras'
      : 'Ativar acessibilidade em Libras';
  }

  function updateToggleStates() {
    const colorblindEnabled = isColorblindEnabled();
    const lightThemeEnabled = root.dataset.theme === 'light';
    const vlibrasEnabled = !document.body.classList.contains('hide-vlibras');

    colorblindButtons.forEach((button) => {
      button.classList.toggle('is-active', colorblindEnabled);
      button.setAttribute('aria-pressed', colorblindEnabled ? 'true' : 'false');
      const label = getColorblindToggleLabel(colorblindEnabled);
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);

      const srOnlyLabel = button.querySelector('.sr-only');
      if (srOnlyLabel) {
        srOnlyLabel.textContent = label;
      }
    });

    themeButtons.forEach((button) => {
      button.classList.toggle('is-active', lightThemeEnabled);
      button.setAttribute('aria-pressed', lightThemeEnabled ? 'true' : 'false');
    });

    vlibrasButtons.forEach((button) => {
      button.classList.toggle('is-active', vlibrasEnabled);
      button.setAttribute('aria-pressed', vlibrasEnabled ? 'true' : 'false');

      const label = getVlibrasToggleLabel(vlibrasEnabled);
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);

      const srOnlyLabel = button.querySelector('.sr-only');
      if (srOnlyLabel) {
        srOnlyLabel.textContent = label;
      }
    });
  }

  const savedColorblind = safeGetItem(COLORBLIND_STORAGE_KEY);
  if (savedColorblind === 'enabled') {
    setColorblindEnabled(true);
  }

  const savedTheme = safeGetItem('themePreference');
  if (savedTheme === 'light') {
    root.dataset.theme = 'light';
  } else {
    delete root.dataset.theme;
  }

  const savedVlibras = safeGetItem('vlibrasVisibility');
  if (savedVlibras === 'hidden') {
    document.body.classList.add('hide-vlibras');
  } else {
    document.body.classList.remove('hide-vlibras');
  }

  updateToggleStates();

  colorblindButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextColorblindState = !isColorblindEnabled();
      setColorblindEnabled(nextColorblindState);
      safeSetItem(
        COLORBLIND_STORAGE_KEY,
        nextColorblindState ? 'enabled' : 'disabled'
      );
      updateToggleStates();
    });
  });

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
      if (nextTheme === 'light') {
        root.dataset.theme = 'light';
      } else {
        delete root.dataset.theme;
      }

      safeSetItem('themePreference', nextTheme);
      updateToggleStates();
    });
  });

  vlibrasButtons.forEach((button) => {
    button.addEventListener('click', () => {
      document.body.classList.toggle('hide-vlibras');
      safeSetItem(
        'vlibrasVisibility',
        document.body.classList.contains('hide-vlibras') ? 'hidden' : 'visible'
      );
      updateToggleStates();
    });
  });
}
