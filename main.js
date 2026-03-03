// Aguarda o carregamento completo do conteúdo da página antes de executar o script
// v3.0 - Navbar inline (fix Live Server script injection on navbar.html too)
document.addEventListener("DOMContentLoaded", function() {

  // --- CONSTRUIR A NAVBAR VIA JS (evita bug do Live Server injetar scripts) ---
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    navbarPlaceholder.innerHTML = `
    <header>
      <div class="nav-inner">
        <a href="index.html" class="brand">
          <div class="logo">GH</div>
          <div>
            <div class="brand-text-name">Guilherme Henrique</div>
            <div class="brand-text-sub">Análise e Desenvolvimento de Sistemas</div>
          </div>
        </a>
        <div class="nav-controls">
          <nav class="desktop-nav">
            <a href="index.html">Home</a>
            <a href="sobre.html">Sobre</a>
            <a href="grade.html">Grade</a>
            <a href="projetos.html">Projetos</a>
            <a href="contato.html">Contato</a>
          </nav>
          <div class="accessibility-controls">
            <button id="decrease-font" aria-label="Diminuir fonte">A-</button>
            <button id="reset-font" aria-label="Restaurar fonte padrão">A</button>
            <button id="increase-font" aria-label="Aumentar fonte">A+</button>
            <button id="colorblind-toggle" aria-label="Ativar modo para daltonismo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button id="theme-toggle" aria-label="Alternar tema">
              <svg class="sun" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm-2.121-4.243a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"></path></svg>
              <svg class="moon" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            </button>
          </div>
        </div>
        <button class="hamburger-menu" aria-label="Abrir menu">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </button>
      </div>
    </header>
    <div class="mobile-nav-overlay"></div>
    <div class="mobile-nav">
      <a href="index.html">Home</a>
      <a href="sobre.html">Sobre</a>
      <a href="grade.html">Grade</a>
      <a href="projetos.html">Projetos</a>
      <a href="contato.html">Contato</a>
      <div class="accessibility-controls mobile-accessibility">
        <button id="decrease-font-mobile" aria-label="Diminuir fonte">A-</button>
        <button id="reset-font-mobile" aria-label="Restaurar fonte padrão">A</button>
        <button id="increase-font-mobile" aria-label="Aumentar fonte">A+</button>
        <button id="colorblind-toggle-mobile" aria-label="Ativar modo para daltonismo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button id="theme-toggle-mobile" aria-label="Alternar tema">
          <svg class="sun" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm-2.121-4.243a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"></path></svg>
          <svg class="moon" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
        </button>
      </div>
    </div>`;
  }

  // =====================================================================
  // TODAS AS FUNÇÕES AGORA SÃO EXECUTADAS DEPOIS DA NAVBAR ESTAR NA TELA
  // =====================================================================

      // --- LÓGICA DE TEMA (MODO ESCURO) ---
      const themeToggle = document.getElementById('theme-toggle');
      const themeToggleMobile = document.getElementById('theme-toggle-mobile');
      const colorblindToggle = document.getElementById('colorblind-toggle');
      const colorblindToggleMobile = document.getElementById('colorblind-toggle-mobile');

      function applyThemeToggle(btn) {
        if (!btn) return;
        btn.addEventListener('click', () => {
          document.body.classList.toggle('dark-mode');
          let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
          localStorage.setItem('theme', theme);
        });
      }

      if (themeToggle || themeToggleMobile) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
          document.body.classList.add('dark-mode');
        }
        applyThemeToggle(themeToggle);
        applyThemeToggle(themeToggleMobile);
      }

      function applyColorblindToggle(btn) {
        if (!btn) return;
        btn.addEventListener('click', () => {
          document.body.classList.toggle('colorblind-mode');
          const colorblindMode = document.body.classList.contains('colorblind-mode') ? 'enabled' : 'disabled';
          localStorage.setItem('colorblindMode', colorblindMode);
        });
      }

      const savedColorblindMode = localStorage.getItem('colorblindMode');
      if (savedColorblindMode === 'enabled') {
        document.body.classList.add('colorblind-mode');
      }
      applyColorblindToggle(colorblindToggle);
      applyColorblindToggle(colorblindToggleMobile);

      // --- LÓGICA DE TAMANHO DA FONTE ---
      const increaseFontBtn = document.getElementById('increase-font');
      const decreaseFontBtn = document.getElementById('decrease-font');
      const resetFontBtn = document.getElementById('reset-font');
      const increaseFontBtnMobile = document.getElementById('increase-font-mobile');
      const decreaseFontBtnMobile = document.getElementById('decrease-font-mobile');
      const resetFontBtnMobile = document.getElementById('reset-font-mobile');
      const rootElement = document.documentElement;

      if (increaseFontBtn || increaseFontBtnMobile) {
        const initialFontSize = 16;
        let currentFontSize = parseFloat(localStorage.getItem('fontSize')) || initialFontSize;

        const applyFontSize = () => {
          rootElement.style.fontSize = currentFontSize + 'px';
          localStorage.setItem('fontSize', currentFontSize);
        }
        applyFontSize();

        const increaseHandler = () => {
          if (currentFontSize < 24) { currentFontSize += 1; applyFontSize(); }
        };
        const decreaseHandler = () => {
          if (currentFontSize > 12) { currentFontSize -= 1; applyFontSize(); }
        };
        const resetHandler = () => {
          currentFontSize = initialFontSize; applyFontSize();
        };

        if (increaseFontBtn) increaseFontBtn.addEventListener('click', increaseHandler);
        if (decreaseFontBtn) decreaseFontBtn.addEventListener('click', decreaseHandler);
        if (resetFontBtn) resetFontBtn.addEventListener('click', resetHandler);
        if (increaseFontBtnMobile) increaseFontBtnMobile.addEventListener('click', increaseHandler);
        if (decreaseFontBtnMobile) decreaseFontBtnMobile.addEventListener('click', decreaseHandler);
        if (resetFontBtnMobile) resetFontBtnMobile.addEventListener('click', resetHandler);
      }

      // --- LÓGICA DO MENU HAMBÚRGUER ---
      const hamburger = document.querySelector('.hamburger-menu');
      const mobileNav = document.querySelector('.mobile-nav');
      const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
      
      if (hamburger && mobileNav) {
        
        const toggleMenu = () => {
          hamburger.classList.toggle('active');
          mobileNav.classList.toggle('active');
          if (mobileNavOverlay) mobileNavOverlay.classList.toggle('active');
          document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        };

        const closeMenu = () => {
          hamburger.classList.remove('active');
          mobileNav.classList.remove('active');
          if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
          document.body.style.overflow = '';
        };

        hamburger.addEventListener('click', toggleMenu);

        // Fechar menu ao clicar no overlay
        if (mobileNavOverlay) {
          mobileNavOverlay.addEventListener('click', closeMenu);
        }

        // Fechar menu ao clicar em um link
        const mobileLinks = document.querySelectorAll('.mobile-nav a');
        mobileLinks.forEach(link => {
          link.addEventListener('click', closeMenu);
        });

        // Fechar menu com tecla ESC
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMenu();
          }
        });
      }

      // --- EFEITO DE SCROLL NA NAVBAR ---
      const header = document.querySelector('header');
      let lastScroll = 0;
      
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
      });

      // --- ANIMAÇÕES DE SCROLL (Intersection Observer) ---
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-section');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observa elementos que devem animar ao entrar na tela
      const animatedElements = document.querySelectorAll('.card, .intro, .profile-card, .skill, .timeline-item');
      animatedElements.forEach(el => observer.observe(el));

      // --- LAZY LOADING DE IMAGENS ---
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      images.forEach(img => imageObserver.observe(img));

      // --- LÓGICA DE MARCAR O LINK DA PÁGINA ATIVA ---
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
      
      navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
          link.classList.add('active');
        }
      });

  // --- BOTÃO GLOBAL: VOLTAR AO TOPO ---
  const backToTopButton = document.createElement('button');
  backToTopButton.id = 'back-to-top';
  backToTopButton.setAttribute('aria-label', 'Voltar ao topo');
  backToTopButton.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 4.5l-7 7a1 1 0 101.4 1.4l4.6-4.6V20a1 1 0 102 0V8.3l4.6 4.6a1 1 0 001.4-1.4l-7-7z"/>
    </svg>`;
  document.body.appendChild(backToTopButton);

  const toggleBackToTopButton = () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  };

  window.addEventListener('scroll', toggleBackToTopButton);
  toggleBackToTopButton();

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- CARREGAR O FOOTER (construído via JS para evitar bug do Live Server) ---
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
    <footer>
      <div class="footer-content">
        <div class="footer-socials">
          <a href="https://github.com/GuilhermeOliveira0" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/guilherme--henrique" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
          </a>
        </div>
        <div class="footer-bottom">
          <p>&copy; <span id="year"></span> Direitos reservados de Guilherme Henrique de Oliveira.</p>
        </div>
      </div>
    </footer>`;

    // Atualiza o ano dinamicamente
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }
});