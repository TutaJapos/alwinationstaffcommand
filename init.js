/* ============================================================================
   AlwiNation Command Staff — Initialization & Wiring
   ============================================================================ */

(function () {
  'use strict';

  const loginScreen = document.getElementById('loginScreen');
  const loginForm = document.getElementById('loginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const DEV_BYPASS_LOGIN = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  let authenticated = false;

  function setAuthenticated(value) {
    authenticated = value;
    document.body.classList.toggle('authenticated', value);
    document.body.classList.toggle('auth-locked', !value);
    if (loginScreen) loginScreen.setAttribute('aria-hidden', String(value));
  }

  async function authenticate(event) {
    event.preventDefault();
    loginError.textContent = '';
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: loginUsername.value.trim(),
          password: loginPassword.value,
        }),
      });
      if (!response.ok) {
        loginError.textContent = response.status === 401
          ? 'Invalid username or password.'
          : 'Login service unavailable.';
        loginPassword.select();
        return;
      }
      loginPassword.value = '';
      setAuthenticated(true);
      handleRoute();
    } catch (error) {
      loginError.textContent = 'Login service unavailable.';
      console.error('Login request failed:', error);
    } finally {
      submitButton.disabled = false;
    }
  }

  async function checkSession() {
    if (DEV_BYPASS_LOGIN) {
      setAuthenticated(false); // true for enable dev bypass login
      return;
    }

    try {
      const response = await fetch('/api/session', {
        credentials: 'same-origin',
      });
      setAuthenticated(response.ok);
    } catch (error) {
      setAuthenticated(false);
      loginError.textContent = 'Connect this site to the Vercel login API.';
      console.error('Session check failed:', error);
    }
  }

  // ---- Grab DOM refs ----
  const MAIN = document.getElementById('mainContent');
  const sidebar = document.getElementById('sidebar');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchEmpty = document.getElementById('searchEmpty');
  const searchClose = document.getElementById('searchClose');
  const searchTriggerMobile = document.getElementById('searchTriggerMobile');
  const toast = document.getElementById('toast');

  if (loginForm) loginForm.addEventListener('submit', authenticate);
  setAuthenticated(DEV_BYPASS_LOGIN);

  // ---- Navigation (hash-based routing) ----
  let commandFilters = { rank: 'all', type: 'all', category: 'all' };

  function navigate(hash) {
    if (hash && !hash.startsWith('#')) hash = '#' + hash;
    if (!hash) hash = location.hash || '#/';
    if (hash === '#/commands') {
      commandFilters = { rank: 'all', type: 'all', category: 'all' };
    } else if (hash === '#/commands/minecraft') {
      commandFilters = { rank: 'all', type: 'Minecraft', category: 'all' };
    } else if (hash === '#/commands/discord') {
      commandFilters = { rank: 'all', type: 'Discord', category: 'all' };
    }
    if (hash !== location.hash) {
      history.pushState(null, '', hash);
    }
    handleRoute();
  }

  function handleRoute() {
    if (!authenticated) return;
    const route = parseRoute();
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (MAIN) MAIN.scrollTop = 0;
    // Update sidebar active state
    const activeTarget = route.type;
    document.querySelectorAll('.nav-item').forEach(item => {
      const page = item.dataset.page;
      item.classList.toggle('active', page === activeTarget);
    });
    // Render
    renderForRoute(route);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  // Map route types to render functions
  function renderForRoute(route) {
    switch (route.type) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'regulation':
        renderRegulation();
        break;
      case 'commands':
        renderCommands(null, commandFilters);
        break;
      case 'commands-minecraft':
        renderCommands('minecraft', { rank: 'all', type: 'Minecraft', category: 'all' });
        break;
      case 'commands-discord':
        renderCommands('discord', { rank: 'all', type: 'Discord', category: 'all' });
        break;
      case 'staff':
        renderStaffList();
        break;
      case 'staff-features':
        renderStaffFeatures();
        break;
      case 'staff-role':
        renderStaffRole(route.rankId);
        break;
      case 'docs-coreprotect':
        renderCoreProtect();
        break;
      case 'docs-java-bedrock':
        renderJavaBedrock();
        break;
      case 'docs-server-realm':
        renderServerRealm();
        break;
      case 'about':
        renderAbout();
        break;
      case 'command':
        renderCommandDetail(route.cmd);
        break;
      default:
        renderNotFound();
        break;
    }
  }

  // ---- Event delegation for nav links ----
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-nav]');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigate(href);
        return;
      }
    }
  });

  // ---- COMMAND FILTERS ----
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.filter-btn[data-filter]');
    if (!button) return;

    const filter = button.dataset.filter;
    const value = button.dataset.value;
    if (!['rank', 'type', 'category'].includes(filter) || !value) return;

    commandFilters = { ...commandFilters, [filter]: value };
    const route = parseRoute();
    if (route.type === 'commands-minecraft') commandFilters.type = 'Minecraft';
    if (route.type === 'commands-discord') commandFilters.type = 'Discord';
    if (route.type === 'commands' || route.type === 'commands-minecraft' || route.type === 'commands-discord') {
      renderCommands(null, commandFilters);
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id !== 'regulationSearch') return;
    regulationState.query = e.target.value;
    updateRegulationResults();
  });

  document.addEventListener('change', (e) => {
    if (e.target.id !== 'regulationSectionFilter') return;
    regulationState.section = e.target.value;
    renderRegulation();
  });

  // ---- Hashchange (back/forward) ----
  window.addEventListener('hashchange', handleRoute);

  // ---- SIDEBAR: mobile toggle ----
  function openMobile() {
    sidebar.classList.add('open');
    mobileOverlay.classList.add('visible');
  }

  function closeMobile() {
    sidebar.classList.remove('open');
    mobileOverlay.classList.remove('visible');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) {
        closeMobile();
      } else {
        openMobile();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobile);
  }

  // ---- SIDEBAR: swipe gestures on touch devices ----
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartedInSidebar = false;

  document.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartedInSidebar = sidebar.contains(event.target);
  }, { passive: true });

  document.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (!sidebar.classList.contains('open') && touchStartX <= 28 && deltaX > 0) {
      openMobile();
    } else if (sidebar.classList.contains('open') && touchStartedInSidebar && deltaX < 0) {
      closeMobile();
    }
  }, { passive: true });

  // ---- SEARCH OVERLAY ----
  let selectedIndex = -1;
  let currentResults = [];

  function openSearch() {
    searchOverlay.classList.add('open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => searchInput.focus(), 50);
    performSearch(searchInput.value);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchEmpty.style.display = '';
  }

  function performSearch(query) {
    const q = query.trim();
    if (!q) {
      currentResults = [];
      selectedIndex = -1;
      searchResults.innerHTML = '';
      searchEmpty.style.display = '';
      return;
    }
    const results = ALWINA.searchCommands(q).slice(0, 12);
    currentResults = results;
    selectedIndex = results.length ? 0 : -1;
    renderSearchResults(results, q);
  }

  function renderSearchResults(results, query) {
    if (!results.length) {
      searchResults.innerHTML = '';
      searchEmpty.style.display = '';
      searchEmpty.textContent = 'No commands match "' + query + '".';
      return;
    }
    searchEmpty.style.display = 'none';

    const items = results.map((cmd, i) => {
      const isSelected = i === selectedIndex;
      const typeIcon = cmd.type === 'Discord' ? '◆' :
                       cmd.type === 'Staff Feature' ? '♟' :
                       cmd.type === 'Documentation' ? '▤' : '▣';
      return `
        <div class="search-result-item ${isSelected ? 'selected' : ''}"
             data-index="${i}"
             data-url="${commandRoute(cmd)}">
          <span class="result-icon">${typeIcon}</span>
          <span class="result-name">${escapeHtml(cmd.name)}${cmd.aliases && cmd.aliases.length ? ' <span style="color:var(--text-dim);font-size:11px;">(' + cmd.aliases.join(', ') + ')</span>' : ''}</span>
          <span class="result-meta">${escapeHtml(cmd.minimumRank)}</span>
        </div>`;
    }).join('');

    searchResults.innerHTML = items;
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (!currentResults.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
        updateSearchSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSearchSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
          const url = currentResults[selectedIndex] ?
            commandRoute(currentResults[selectedIndex]) :
            '#/';
          closeSearch();
          navigate(url);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
      }
    });
  }

  function updateSearchSelection() {
    const items = searchResults.querySelectorAll('.search-result-item');
    items.forEach((el, i) => {
      el.classList.toggle('selected', i === selectedIndex);
      if (i === selectedIndex) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // Close search buttons
  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }
  if (searchTriggerMobile) {
    searchTriggerMobile.addEventListener('click', () => {
      closeMobile();
      openSearch();
    });
  }

  // Click on search result items
  searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    const url = item.dataset.url;
    if (url) {
      closeSearch();
      navigate(url);
    }
  });

  // Click outside panel to close
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  // ---- GLOBAL KEYBOARD SHORTCUT: Ctrl+K ----
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchOverlay.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    if (e.key === 'Escape') {
      if (searchOverlay.classList.contains('open')) closeSearch();
      if (sidebar.classList.contains('open')) closeMobile();
    }
  });

  // ---- COPY TO CLIPBOARD ----
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    e.preventDefault();
    const text = btn.getAttribute('data-copy');
    if (!text) return;

    ALWINA.copyToClipboard(text).then(() => {
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 1400);
      ALWINA.showToast('Copied to clipboard');
    });
  });

  // ---- BREADCRUMB NAV ----
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.breadcrumb-link');
    if (!link) return;
    const href = link.getAttribute('data-nav') || link.getAttribute('href');
    if (href) {
      e.preventDefault();
      navigate(href);
      closeMobile();
    }
  });

  // ---- INIT ----
  checkSession().then(() => {
    if (authenticated) {
      handleRoute();
    } else if (loginUsername) {
      loginUsername.focus();
    }
  });

  // Handle popstate (browser back/forward)
  window.addEventListener('popstate', handleRoute);
})();
