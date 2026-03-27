import { getFocusableElements, prefersReducedMotion } from './utils.js';
import { fetchJsonArray, toCleanString } from './data.js';

const ICON_THEMES = [
  {
    accent: '#58e1ff',
    soft: 'rgba(88, 225, 255, 0.14)',
    glow: 'rgba(88, 225, 255, 0.18)',
    background: 'linear-gradient(135deg, rgba(88, 225, 255, 0.18) 0%, rgba(59, 130, 246, 0.28) 100%)',
  },
  {
    accent: '#7dd3fc',
    soft: 'rgba(125, 211, 252, 0.14)',
    glow: 'rgba(59, 130, 246, 0.18)',
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.18) 0%, rgba(59, 130, 246, 0.28) 100%)',
  },
  {
    accent: '#5eead4',
    soft: 'rgba(94, 234, 212, 0.14)',
    glow: 'rgba(45, 212, 191, 0.17)',
    background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.16) 0%, rgba(14, 165, 233, 0.24) 100%)',
  },
  {
    accent: '#a5b4fc',
    soft: 'rgba(165, 180, 252, 0.14)',
    glow: 'rgba(99, 102, 241, 0.17)',
    background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.16) 0%, rgba(59, 130, 246, 0.26) 100%)',
  },
];

const ICON_FALLBACK_STOP_WORDS = new Set([
  'a',
  'as',
  'e',
  'o',
  'os',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'na',
  'no',
]);

function resolveIconTheme(seed) {
  const value = toCleanString(seed) || 'disciplina';
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) >>> 0;
  }

  return ICON_THEMES[hash % ICON_THEMES.length];
}

function getFallbackLabel(title) {
  const words = (toCleanString(title).match(/[A-Za-z]+/g) || []).filter((word) => {
    return !ICON_FALLBACK_STOP_WORDS.has(word.toLowerCase());
  });

  const label = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  return label || 'TI';
}

function stripUnsafeSvgAttributes(root) {
  [root, ...root.querySelectorAll('*')].forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith('on')) {
        element.removeAttribute(attribute.name);
      }
    });
  });
}

function createFallbackIcon(title) {
  const fallback = document.createElement('span');
  fallback.className = 'grade-card-icon-fallback';
  fallback.textContent = getFallbackLabel(title);
  return fallback;
}

function createDisciplinaIcon(disciplina) {
  const iconShell = document.createElement('div');
  iconShell.className = 'grade-card-icon';
  iconShell.setAttribute('aria-hidden', 'true');

  const iconMarkup = toCleanString(disciplina.icon);

  if (iconMarkup && /^<svg[\s>]/i.test(iconMarkup)) {
    const template = document.createElement('template');
    template.innerHTML = iconMarkup.trim();

    const svg = template.content.firstElementChild;
    const unsafeNode = template.content.querySelector('script, iframe, object, embed');

    if (svg && svg.tagName.toLowerCase() === 'svg' && !unsafeNode) {
      stripUnsafeSvgAttributes(svg);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      iconShell.appendChild(svg);
      return iconShell;
    }
  }

  iconShell.appendChild(createFallbackIcon(disciplina.titulo));
  return iconShell;
}

function formatSemesterLabel(semester) {
  const value = toCleanString(String(semester || ''));
  return value ? value + ' Ano' : 'Disciplina';
}

function applyCardTheme(card, disciplina) {
  const theme = resolveIconTheme(disciplina.id || disciplina.titulo);
  card.style.setProperty('--card-accent', theme.accent);
  card.style.setProperty('--card-accent-soft', theme.soft);
  card.style.setProperty('--card-glow', theme.glow);
  card.style.setProperty('--card-icon-bg', theme.background);
}

export function initGradePage() {
  const disciplinasGrid = document.getElementById('disciplinas-grid');
  const modal = document.getElementById('disciplina-modal');
  const modalContent = modal ? modal.querySelector('.grade-modal-content') : null;
  const modalCloseBtn = modal ? modal.querySelector('.modal-close') : null;
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const canTrackPointer = !prefersReducedMotion() && window.matchMedia('(pointer:fine)').matches;

  if (!disciplinasGrid || !modal || !modalContent || !modalCloseBtn) {
    return;
  }

  const modalTitle = document.getElementById('modal-title');
  const modalResumo = document.getElementById('modal-resumo');
  const modalProfessor = document.getElementById('modal-professor');
  const modalConteudo = document.getElementById('modal-conteudo');
  const modalProjetoContainer = document.getElementById('modal-projeto-container');
  const modalProjetoTitulo = document.getElementById('modal-projeto-titulo');
  const modalProjetoLink = document.getElementById('modal-projeto-link');

  let disciplinas = [];
  let lastTrigger = null;

  function normalizeDisciplina(item) {
    const conteudo = Array.isArray(item.conteudo)
      ? item.conteudo.map((entry) => toCleanString(entry)).filter(Boolean)
      : [];

    return {
      id: toCleanString(item.id),
      titulo: toCleanString(item.titulo),
      resumo: toCleanString(item.resumo),
      descricao: toCleanString(item.descricao),
      professor: toCleanString(item.professor),
      semestre: toCleanString(item.semestre),
      icon: toCleanString(item.icon),
      conteudo,
      projeto:
        item.projeto && typeof item.projeto === 'object'
          ? {
              titulo: toCleanString(item.projeto.titulo),
              link: toCleanString(item.projeto.link),
            }
          : null,
    };
  }

  function isValidDisciplina(item) {
    return item.id && item.titulo && item.descricao;
  }

  function bindCardPointerTracking(card) {
    if (!canTrackPointer) {
      return;
    }

    const updatePointerPosition = (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty('--pointer-x', x.toFixed(2) + '%');
      card.style.setProperty('--pointer-y', y.toFixed(2) + '%');
    };

    const clearPointerPosition = () => {
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
    };

    card.addEventListener('pointermove', updatePointerPosition);
    card.addEventListener('pointerleave', clearPointerPosition);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');

    if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  function trapModalFocus(event) {
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
  }

  function openModal(disciplina, trigger) {
    lastTrigger = trigger || null;

    modalTitle.textContent = disciplina.titulo || 'Disciplina';
    modalResumo.textContent = disciplina.resumo || disciplina.descricao || 'Resumo nao informado.';
    modalProfessor.textContent = disciplina.professor || 'Nao informado';

    const conteudo = Array.isArray(disciplina.conteudo) ? disciplina.conteudo : [];
    const contentItems = conteudo.length ? conteudo : ['Conteudo nao informado.'];

    modalConteudo.replaceChildren(
      ...contentItems.map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      })
    );

    if (disciplina.projeto && disciplina.projeto.link) {
      modalProjetoContainer.style.display = 'grid';
      modalProjetoTitulo.textContent = disciplina.projeto.titulo || 'Projeto da disciplina';
      modalProjetoLink.href = disciplina.projeto.link;
      modalProjetoLink.textContent = disciplina.projeto.link.includes('github')
        ? 'Ver no GitHub'
        : 'Abrir projeto';
    } else {
      modalProjetoContainer.style.display = 'none';
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');

    requestAnimationFrame(() => {
      modalCloseBtn.focus();
    });
  }

  function renderStatus(message, role) {
    const status = document.createElement('p');
    status.className = 'status-message';
    status.textContent = message;
    status.setAttribute('role', role || 'status');
    disciplinasGrid.replaceChildren(status);
  }

  function createDisciplinaCard(disciplina, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'grade-card';
    card.dataset.id = disciplina.id;
    card.style.setProperty('--card-delay', Math.min(index * 55, 360) + 'ms');
    card.setAttribute(
      'aria-label',
      (disciplina.titulo || 'Disciplina') +
        '. ' +
        formatSemesterLabel(disciplina.semestre) +
        '. Abrir detalhes.'
    );

    applyCardTheme(card, disciplina);

    const top = document.createElement('div');
    top.className = 'grade-card-top';

    const badge = document.createElement('span');
    badge.className = 'grade-card-badge';
    badge.textContent = formatSemesterLabel(disciplina.semestre);

    const header = document.createElement('div');
    header.className = 'grade-card-header';

    const icon = createDisciplinaIcon(disciplina);

    const copy = document.createElement('div');
    copy.className = 'grade-card-copy';

    const title = document.createElement('h3');
    title.className = 'grade-card-title';
    title.textContent = disciplina.titulo || 'Disciplina';

    const description = document.createElement('p');
    description.className = 'grade-card-description';
    description.textContent = disciplina.descricao || disciplina.resumo || '';

    const action = document.createElement('span');
    action.className = 'grade-card-action';
    action.textContent = 'Ver detalhes';

    top.appendChild(badge);
    copy.append(title, description);
    header.append(icon, copy);
    card.append(top, header, action);

    bindCardPointerTracking(card);

    return card;
  }

  function renderGrid(items) {
    if (!items.length) {
      renderStatus('Nenhuma disciplina encontrada para o filtro selecionado.', 'status');
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((disciplina, index) => {
      fragment.appendChild(createDisciplinaCard(disciplina, index));
    });

    disciplinasGrid.replaceChildren(fragment);
  }

  function applyFilter(semester) {
    const filtered =
      semester === 'todos'
        ? disciplinas
        : disciplinas.filter((item) => String(item.semestre) === String(semester));

    renderGrid(filtered);
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => {
        const isSelected = btn === button;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });

      applyFilter(button.dataset.semestre);
    });
  });

  disciplinasGrid.addEventListener('click', (event) => {
    const trigger = event.target.closest('.grade-card');
    if (!trigger) {
      return;
    }

    const selected = disciplinas.find((item) => String(item.id) === String(trigger.dataset.id));
    if (selected) {
      openModal(selected, trigger);
    }
  });

  modalCloseBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', trapModalFocus);

  disciplinasGrid.setAttribute('aria-busy', 'true');

  fetchJsonArray('disciplinas.json')
    .then((data) => {
      disciplinas = data.map(normalizeDisciplina).filter(isValidDisciplina);

      const activeButton = filterButtons.find((button) => button.classList.contains('is-active'));
      applyFilter(activeButton ? activeButton.dataset.semestre : 'todos');
    })
    .catch(() => {
      renderStatus('Erro ao carregar disciplinas. Verifique o arquivo disciplinas.json.', 'alert');
    })
    .finally(() => {
      disciplinasGrid.setAttribute('aria-busy', 'false');
    });
}
