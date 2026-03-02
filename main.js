// Aguarda o carregamento completo do conteúdo da página antes de executar o script
// v2.0 - Fix Live Server script injection
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
    })
    .catch(error => {
      console.error('Erro ao carregar a navbar:', error);
      const navbarPlaceholder = document.getElementById('navbar-placeholder');
      if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = '<p style="text-align:center; color:red;">Erro ao carregar o menu de navegação.</p>';
      }
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