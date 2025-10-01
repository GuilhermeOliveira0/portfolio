// Aguarda o carregamento completo do conteúdo da página antes de executar o script
document.addEventListener("DOMContentLoaded", function() {

  // --- LÓGICA PRINCIPAL: CARREGAR A NAVBAR E DEPOIS EXECUTAR O RESTO ---
  fetch('navbar.html')
    .then(response => {
      // Verifica se o arquivo foi encontrado. Se não, gera um erro.
      if (!response.ok) {
        throw new Error('Navbar.html não encontrado. Verifique o caminho do arquivo.');
      }
      return response.text();
    })
    .then(data => {
      // Insere o HTML da navbar no elemento com o ID 'navbar-placeholder'
      const navbarPlaceholder = document.getElementById('navbar-placeholder');
      if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = data;
      }

      // =====================================================================
      // TODAS AS FUNÇÕES AGORA SÃO EXECUTADAS DEPOIS DA NAVBAR ESTAR NA TELA
      // =====================================================================

      // --- LÓGICA DE TEMA (MODO ESCURO) ---
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
          document.body.classList.add('dark-mode');
        }
        themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark-mode');
          let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
          localStorage.setItem('theme', theme);
        });
      }

      // --- LÓGICA DE TAMANHO DA FONTE ---
      const increaseFontBtn = document.getElementById('increase-font');
      const decreaseFontBtn = document.getElementById('decrease-font');
      const resetFontBtn = document.getElementById('reset-font');
      const rootElement = document.documentElement;

      if (increaseFontBtn && decreaseFontBtn && resetFontBtn) {
        const initialFontSize = 16;
        let currentFontSize = parseFloat(localStorage.getItem('fontSize')) || initialFontSize;

        const applyFontSize = () => {
          rootElement.style.fontSize = currentFontSize + 'px';
          localStorage.setItem('fontSize', currentFontSize);
        }
        applyFontSize();

        increaseFontBtn.addEventListener('click', () => {
          if (currentFontSize < 24) {
            currentFontSize += 1;
            applyFontSize();
          }
        });
        decreaseFontBtn.addEventListener('click', () => {
          if (currentFontSize > 12) {
            currentFontSize -= 1;
            applyFontSize();
          }
        });
        resetFontBtn.addEventListener('click', () => {
          currentFontSize = initialFontSize;
          applyFontSize();
        });
      }

      // --- LÓGICA DO MENU HAMBÚRGUER ---
      const hamburger = document.querySelector('.hamburger-menu');
      const mobileNav = document.querySelector('.mobile-nav');
      const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
      
      if (hamburger && mobileNav) {
        const accessibilityControls = document.querySelector('.accessibility-controls');
        if (window.innerWidth <= 768 && accessibilityControls) {
            mobileNav.appendChild(accessibilityControls);
        }
        
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

      // --- LÓGICA DE MARCAR O LINK DA PÁGINA ATIVA ---
      const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Garante que a home seja marcada
      const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
      
      navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
          link.classList.add('active');
        }
      });
    })
    .catch(error => {
      console.error('Erro ao carregar a navbar:', error);
      const navbarPlaceholder = document.getElementById('navbar-placeholder');
      if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = '<p style="text-align:center; color:red;">Erro ao carregar o menu de navegação.</p>';
      }
    });
});