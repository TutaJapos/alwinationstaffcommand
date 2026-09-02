// ============================================================================
// AlwiNation Command Staff — Render Engine (complete rewrite)
// ============================================================================
'use strict';

// ---- DOM refs ----
const MAIN = document.getElementById('mainContent');

// ---- Utilities ----

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function render(el, html) {
  if (el) el.innerHTML = html;
}

// ---- Route helpers ----

function commandRoute(cmd) {
  if (!cmd || !cmd.name) return '#/commands';
  return '#/command/' + ALWINA.slugify(cmd.name);
}

function commandAliasMarkup(cmd) {
  if (!cmd.aliases || !cmd.aliases.length) return '';
  return `<span class="command-alias">Aliases: ${cmd.aliases.map(escapeHtml).join(', ')}</span>`;
}

function staffRoute(rankId) {
  if (!rankId) return '#/staff';
  return '#/staff/' + rankId;
}

function parseRoute() {
  const hash = window.location.hash || '#/';
  const path = hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  if (path.length === 0) return { type: 'dashboard' };

  if (path[0] === 'commands') {
    if (path[1] === 'minecraft') return { type: 'commands-minecraft' };
    if (path[1] === 'discord') return { type: 'commands-discord' };
    if (!path[1]) return { type: 'commands' };
    return { type: 'not-found' };
  }

  if (path[0] === 'staff') {
    if (!path[1]) return { type: 'staff' };
    if (path.length === 2 && ALWINA.RANK_BY_ID[path[1]]) {
      return { type: 'staff-role', rankId: path[1] };
    }
    return { type: 'not-found' };
  }

  if (path[0] === 'docs') {
    const docsRoute = {
      coreprotect: 'docs-coreprotect',
      'java-bedrock': 'docs-java-bedrock',
      'server-realm': 'docs-server-realm',
    };
    if (path.length === 2 && docsRoute[path[1]]) {
      return { type: docsRoute[path[1]] };
    }
    return { type: 'not-found' };
  }

  if (path[0] === 'about' && path.length === 1) return { type: 'about' };

  if (path[0] === 'command' && path.length === 2) {
    return { type: 'command', cmd: ALWINA.findCommandBySlug(path[1]) };
  }

  return { type: 'not-found' };
}

// ---- Breadcrumb ----
function breadcrumb(items) {
  if (!items || !items.length) return '';
  let html = '<nav class="page-breadcrumb">';
  items.forEach((item, i) => {
    if (item.target) {
      html += `<a href="${item.target}" class="breadcrumb-link" data-nav>${escapeHtml(item.label)}</a>`;
    } else {
      html += `<span class="breadcrumb-link" style="color:var(--text-muted);cursor:default;">${escapeHtml(item.label)}</span>`;
    }
    if (i < items.length - 1) {
      html += '<span class="breadcrumb-sep">/</span>';
    }
  });
  html += '</nav>';
  return html;
}

// ---- Card: commandCard (small card for commands grid) ----

function commandCard(cmd) {
  const cats = (cmd.categories || []).map(c => `<span class="category-tag">${escapeHtml(c)}</span>`).join('');
  return `
    <a href="${commandRoute(cmd)}" class="command-card" data-nav>
      <div class="command-card-header">
        <span class="command-name">${escapeHtml(cmd.name)}</span>
        <span class="command-rank-badge">${escapeHtml(cmd.minimumRank)}</span>
      </div>
      ${cats ? `<div class="command-category-row">${cats}</div>` : ''}
      <p class="command-description">${escapeHtml(cmd.description)}</p>
      <div class="command-card-footer">
        <span class="command-min-rank">Min: ${escapeHtml(cmd.minimumRank)}</span>

      </div>
    </a>
  `;
}

// ---- Card: commandDetailCard (full detail view) ----

function commandDetailCard(cmd) {
  if (!cmd) return '<div class="empty-state"><div class="empty-state-icon">⚠</div><div class="empty-state-text">Command not found.</div></div>';

  const cats = (cmd.categories || []).map(c => `<span class="category-tag">${escapeHtml(c)}</span>`).join('');
  let body = '';

  // Usage section
  if (cmd.usage) {
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">⌨</span>Usage</div>
        <div class="usage-block">
          <div class="usage-code"><code>${escapeHtml(cmd.usage)}</code></div>
          <div class="usage-actions">
            <button class="btn-copy" data-copy="${escapeHtml(cmd.usage)}">Copy Usage</button>
          </div>
        </div>
      </div>
    `;
  }

  // Filters section
  if (cmd.filters && cmd.filters.length) {
    const rows = cmd.filters.map(f => `
      <tr>
        <td><code class="filter-code">${escapeHtml(f.filter)}</code></td>
        <td>${escapeHtml(f.function)}</td>
        <td><code class="filter-example">${escapeHtml(f.example)}</code></td>
      </tr>
    `).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">⚙</span>Filters</div>
        <table class="filters-table">
          <thead>
            <tr><th>Filter</th><th>Function</th><th>Example</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // Example section
  if (cmd.examples && cmd.examples.length) {
    const examples = cmd.examples.map(e => `
      <div class="example-block">
        <div class="example-code"><code>${escapeHtml(e)}</code></div>
        <div class="usage-actions">
          <button class="btn-copy" data-copy="${escapeHtml(e)}">Copy Example</button>
        </div>
      </div>
    `).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">📋</span>Example</div>
        ${examples}
      </div>
    `;
  }

  // Instructions section
  if (cmd.instructions && cmd.instructions.length) {
    const items = cmd.instructions.map(i => `<li>${escapeHtml(i)}</li>`).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">📖</span>Instructions</div>
        <div class="instructions-box">
          <div class="instructions-box-title">Step by Step</div>
          <ol>${items}</ol>
        </div>
      </div>
    `;
  }

  // Notes section
  if (cmd.notes && cmd.notes.length) {
    const items = cmd.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">⚠</span>Notes</div>
        <div class="notes-box">
          <div class="notes-box-title">Important</div>
          <ul>${items}</ul>
        </div>
      </div>
    `;
  }

  // Permission section
  if (cmd.permission) {
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">🔑</span>Permission</div>
        <p style="font-size:13px;color:var(--text-muted);font-family:var(--mono);">${escapeHtml(cmd.permission)}</p>
      </div>
    `;
  }

  // Available ranks section
  const availableRanks = ALWINA.getAvailableRanksForCommand(cmd);
  const rankRows = availableRanks.map(r => {
    const canUse = ALWINA.canUseCommand(r.id, cmd);
    return `
      <div class="available-rank-row">
        <span class="available-rank-name">${escapeHtml(r.name)}</span>
        ${canUse
          ? `<span class="available-rank-badge">✓</span>`
          : `<span class="available-rank-lock">🔒</span>`}
      </div>
    `;
  }).join('');

  if (rankRows) {
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">👤</span>Available Ranks</div>
        <div class="available-ranks">${rankRows}</div>
      </div>
    `;
  }

  return `
    <div class="command-detail">
      <div class="command-detail-banner">
        <div class="command-detail-header">
          <span class="command-detail-name">${escapeHtml(cmd.name)} ${commandAliasMarkup(cmd)}</span>
          <span class="command-detail-rank">${escapeHtml(cmd.minimumRank)}+</span>
        </div>
        ${cats ? `<div class="command-detail-categories">${cats}</div>` : ''}
        <p class="command-detail-description">${escapeHtml(cmd.description)}</p>
      </div>
      ${body}
    </div>
  `;
}

// ---- Card: staffFeatureCard ----

function staffFeatureCard(cmd) {
  return `
    <div class="staff-feature-card">
      <div class="staff-feature-name">${escapeHtml(cmd.name)}</div>
      <div class="staff-feature-desc">${escapeHtml(cmd.description)}</div>
    </div>
  `;
}

// ---- Card: docCard ----

function docCard(cmd) {
  return `
    <div class="doc-card">
      <div class="doc-card-icon">▤</div>
      <div class="doc-card-body">
        <div class="doc-card-name">${escapeHtml(cmd.name)}</div>
        <div class="doc-card-desc">${escapeHtml(cmd.description)}</div>
      </div>
    </div>
  `;
}

// ---- DASHBOARD ----

function renderDashboard() {
  const totalCmds = ALWINA.countCommandsForRank('j-helper');
  const mcCount = ALWINA.countByType('Minecraft');
  const discordCount = ALWINA.countByType('Discord');
  const sfCount = ALWINA.countByType('Staff Feature');
  const docCount = ALWINA.countByType('Documentation');
  const rankCount = Object.keys(ALWINA.RANK_BY_ID).length;
  const catCount = ALWINA.CATEGORIES.length;

  const statCards = `
    <div class="stat-card">
      <div class="stat-value">${totalCmds}</div>
      <div class="stat-label">Total Commands</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${mcCount}</div>
      <div class="stat-label">Minecraft Commands</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${discordCount}</div>
      <div class="stat-label">Discord Commands</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${rankCount}</div>
      <div class="stat-label">Staff Roles</div>
    </div>
  `;

  const staffCards = ALWINA.STAFF_RANKS.map(rank => {
    const cmdCount = ALWINA.countCommandsForRank(rank.id);
    return `
      <a href="${staffRoute(rank.id)}" class="rank-card" data-nav>
        <span class="rank-card-badge">${escapeHtml(rank.name)}</span>
        <div class="rank-card-rank">${escapeHtml(rank.name)}</div>
        <div class="rank-card-desc">${escapeHtml(rank.shortDesc)}</div>
        <span class="rank-card-cmd-count">${cmdCount} commands</span>
        <span class="rank-card-btn btn btn-primary btn-sm">View Commands</span>
      </a>
    `;
  }).join('');

  const html = `
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <h1 class="page-title">ALWINATION</h1>
          <h2 class="page-subtitle">COMMAND STAFF</h2>
        </div>
      </div>
      <p style="font-size:14px;color:var(--text-muted);margin-top:8px;">Your complete command reference for AlwiNation Staff.</p>
      <p style="font-size:13px;color:var(--text-dim);margin-top:4px;">Quickly find commands, understand their usage, check staff permissions, and follow investigation procedures.</p>
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
        <a href="#/commands" class="btn btn-primary">Browse Commands</a>
        <a href="#/staff" class="btn btn-ghost">Staff Roles</a>
      </div>
    </div>
    <div class="stats-grid">${statCards}</div>
    <h3 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:14px;">Quick Staff Access</h3>
    <div class="rank-cards-grid">${staffCards}</div>
  `;
  render(MAIN, html);
}

// ---- COMMANDS PAGE ----

function renderCommands(page, filters) {
  // Build filter bar
  const rankOptions = [
    { value: 'all', label: 'All Ranks', active: filters.rank === 'all' },
    ...ALWINA.STAFF_RANKS.map(r => ({
      value: r.id,
      label: r.name,
      active: filters.rank === r.id
    }))
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types', active: filters.type === 'all' },
    { value: 'Minecraft', label: 'Minecraft', active: filters.type === 'Minecraft' },
    { value: 'Discord', label: 'Discord', active: filters.type === 'Discord' },
    { value: 'Staff Feature', label: 'Staff Feature', active: filters.type === 'Staff Feature' },
    { value: 'Documentation', label: 'Documentation', active: filters.type === 'Documentation' },
  ];

  const catOptions = [
    { value: 'all', label: 'All Categories', active: filters.category === 'all' },
    ...ALWINA.CATEGORIES.map(c => ({
      value: c,
      label: c,
      active: filters.category === c
    }))
  ];

  const rankBtns = rankOptions.map(o =>
    `<button class="filter-btn ${o.active ? 'active' : ''}" data-filter="rank" data-value="${o.value}">${o.label}</button>`
  ).join('');

  const typeBtns = typeOptions.map(o =>
    `<button class="filter-btn ${o.active ? 'active' : ''}" data-filter="type" data-value="${o.value}">${o.label}</button>`
  ).join('');

  const catBtns = catOptions.map(o =>
    `<button class="filter-btn ${o.active ? 'active' : ''}" data-filter="category" data-value="${o.value}">${o.label}</button>`
  ).join('');

  // Compute filtered commands
  let cmds = ALWINA.COMMANDS;

  if (filters.rank !== 'all') {
    cmds = cmds.filter(c => ALWINA.canUseCommand(filters.rank, c));
  }

  if (filters.type !== 'all') {
    cmds = cmds.filter(c => c.type === filters.type);
  }

  if (filters.category !== 'all') {
    cmds = cmds.filter(c => (c.categories || []).includes(filters.category));
  }

  const cmdCards = cmds.map(commandCard).join('');
  const count = cmds.length;

  const html = `
    <div class="commands-page-header">
      <div>
        <h1 class="page-title">Commands</h1>
        <p class="page-subtitle">All AlwiNation staff commands — Minecraft, Discord, and Staff Features.</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('searchOverlay').classList.add('open')">Search</button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">Rank</span>
        ${rankBtns}
      </div>
      <div class="filters-divider"></div>
      <div class="filter-group">
        <span class="filter-label">Type</span>
        ${typeBtns}
      </div>
      <div class="filters-divider"></div>
      <div class="filter-group category-filter-group">
        <span class="filter-label">Category</span>
        ${catBtns}
      </div>
    </div>

    ${count === 0
      ? `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No commands match the current filters.</div></div>`
      : `<div class="commands-page-controls">
          <span class="result-count">${count} command${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="commands-grid">${cmdCards}</div>`
    }
  `;
  render(MAIN, html);
}

// ---- COMMAND DETAIL PAGE ----

function renderCommandDetail(cmd) {
  if (!cmd) {
    renderNotFound();
    return;
  }

  const cats = (cmd.categories || []).map(c => `<span class="category-tag">${escapeHtml(c)}</span>`).join('');

  // Build breadcrumb
  const crumbs = [
    { label: 'Dashboard', target: '#/' },
    { label: 'Commands', target: '#/commands' },
  ];

  if (cmd.categories && cmd.categories.length) {
    crumbs.push({ label: cmd.categories[0], target: '#/commands' });
  }

  crumbs.push({ label: cmd.name, target: commandRoute(cmd) });

  let body = '';

  // Usage
  if (cmd.usage) {
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">⌨</span>Usage</div>
        <div class="usage-block">
          <div class="usage-code"><code>${escapeHtml(cmd.usage)}</code></div>
          <div class="usage-actions">
            <button class="btn-copy" data-copy="${escapeHtml(cmd.usage)}">Copy Usage</button>
          </div>
        </div>
      </div>
    `;
  }

  // Filters
  if (cmd.filters && cmd.filters.length) {
    const rows = cmd.filters.map(f => `
      <tr>
        <td><code class="filter-code">${escapeHtml(f.filter)}</code></td>
        <td>${escapeHtml(f.function)}</td>
        <td><code class="filter-example">${escapeHtml(f.example)}</code></td>
      </tr>
    `).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">⚙</span>Filters</div>
        <table class="filters-table">
          <thead><tr><th>Filter</th><th>Function</th><th>Example</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // Example
  if (cmd.examples && cmd.examples.length) {
    const examples = cmd.examples.map(e => `
      <div class="example-block">
        <div class="example-code"><code>${escapeHtml(e)}</code></div>
        <div class="usage-actions">
          <button class="btn-copy" data-copy="${escapeHtml(e)}">Copy Example</button>
        </div>
      </div>
    `).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">📋</span>Example</div>
        ${examples}
      </div>
    `;
  }

  // Instructions
  if (cmd.instructions && cmd.instructions.length) {
    const items = cmd.instructions.map(i => `<li>${escapeHtml(i)}</li>`).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">📖</span>Instructions</div>
        <div class="instructions-box">
          <div class="instructions-box-title">Step by Step</div>
          <ol>${items}</ol>
        </div>
      </div>
    `;
  }

  // Notes
  if (cmd.notes && cmd.notes.length) {
    const items = cmd.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">⚠</span>Notes</div>
        <div class="notes-box">
          <div class="notes-box-title">Important</div>
          <ul>${items}</ul>
        </div>
      </div>
    `;
  }

  // Permission
  if (cmd.permission) {
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">🔑</span>Permission</div>
        <p style="font-size:13px;color:var(--text-muted);font-family:var(--mono);">${escapeHtml(cmd.permission)}</p>
      </div>
    `;
  }

  // Available ranks
  const availableRanks = ALWINA.getAvailableRanksForCommand(cmd);
  const rankRows = availableRanks.map(r => {
    const canUse = ALWINA.canUseCommand(r.id, cmd);
    return `
      <div class="available-rank-row">
        <span class="available-rank-name">${escapeHtml(r.name)}</span>
        ${canUse
          ? `<span class="available-rank-badge">✓</span>`
          : `<span class="available-rank-lock">🔒</span>`}
      </div>
    `;
  }).join('');

  if (rankRows) {
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">👤</span>Available Ranks</div>
        <div class="available-ranks">${rankRows}</div>
      </div>
    `;
  }

  const html = `
    ${breadcrumb(crumbs)}
    <div class="command-detail">
      <div class="command-detail-banner">
        <div class="command-detail-header">
          <span class="command-detail-name">${escapeHtml(cmd.name)} ${commandAliasMarkup(cmd)}</span>
          <span class="command-detail-rank">${escapeHtml(cmd.minimumRank)}+</span>
        </div>
        ${cats ? `<div class="command-detail-categories">${cats}</div>` : ''}
        <p class="command-detail-description">${escapeHtml(cmd.description)}</p>
      </div>
      ${body}
    </div>
  `;
  render(MAIN, html);
}

// ---- STAFF ROLE PAGE ----

function renderStaffRole(rankId) {
  const rank = ALWINA.RANK_BY_ID[rankId];
  if (!rank) { renderNotFound(); return; }

  const cmds = ALWINA.getCommandsForRank(rankId);
  const executableCmds = cmds.filter(c => c.type !== 'Staff Feature' && c.type !== 'Documentation');
  const staffFeatures = cmds.filter(c => c.type === 'Staff Feature');
  const docs = cmds.filter(c => c.type === 'Documentation');

  const respItems = rank.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('');

  // Middle section
  let middle = '';
  if (executableCmds.length) {
    middle += `
      <div style="margin-top:20px;">
        <h3 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:12px;">Commands</h3>
        <div class="commands-grid">${executableCmds.map(commandCard).join('')}</div>
      </div>
    `;
  }
  if (staffFeatures.length) {
    middle += `
      <div style="margin-top:24px;">
        <h3 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:12px;">Staff Features</h3>
        <div class="commands-grid">${staffFeatures.map(staffFeatureCard).join('')}</div>
      </div>
    `;
  }
  if (docs.length) {
    middle += `
      <div style="margin-top:24px;">
        <h3 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:12px;">Documentation</h3>
        <div class="commands-grid">${docs.map(docCard).join('')}</div>
      </div>
    `;
  }

  if (!executableCmds.length && !staffFeatures.length && !docs.length) {
    middle = `
      <div class="role-coming-soon">
        <div class="role-coming-soon-icon">⌛</div>
        <div class="role-coming-soon-text">Commands coming soon.</div>
      </div>
    `;
  }

  const crumbs = [
    { label: 'Dashboard', target: '#/' },
    { label: 'Staff Roles', target: '#/staff' },
    { label: rank.name, target: staffRoute(rankId) },
  ];

  const html = `
    ${breadcrumb(crumbs)}
    <div class="role-header">
      <div class="role-header-top">
        <span class="role-level">LEVEL ${rank.level}</span>
        <h1 class="role-title">${rank.name}</h1>
      </div>
      <p class="role-short-desc">${escapeHtml(rank.title)}</p>
      <div class="section-block" style="background:transparent;border:none;padding:0;margin-bottom:0;">
        <div class="section-block-title" style="margin-bottom:10px;">Tanggung Jawab</div>
        <ul class="role-responsibilities">${respItems}</ul>
      </div>
      <div class="role-cmd-count">${cmds.length} command${cmds.length !== 1 ? 's' : ''} available</div>
    </div>
    ${middle}
  `;
  render(MAIN, html);
}

// ---- STAFF LIST PAGE ----

function renderStaffList() {
  const cards = ALWINA.STAFF_RANKS.map(rank => {
    const cmdCount = ALWINA.countCommandsForRank(rank.id);
    const hasCmds = cmdCount > 0;
    return `
      <a href="${staffRoute(rank.id)}" class="staff-role-card" data-nav>
        <div class="staff-role-rank">${escapeHtml(rank.name)}</div>
        <div class="staff-role-title">${escapeHtml(rank.title)}</div>
        <div class="staff-role-desc">${escapeHtml(rank.shortDesc)}</div>
        <div class="staff-role-cmd">
          ${hasCmds
            ? `${cmdCount} commands available`
            : '<span style="color:var(--text-dim);">Commands coming soon.</span>'}
        </div>
      </a>
    `;
  }).join('');

  const html = `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Staff Roles</h1>
        <p class="page-subtitle">The AlwiNation staff hierarchy — from Junior Staff to Senior Moderator.</p>
      </div>
    </div>
    <div class="staff-grid">${cards}</div>
  `;
  render(MAIN, html);
}

// ---- DOCS: CoreProtect ----

function renderCoreProtect() {
  const actions = [
    { code: 'a:block', name: 'Blok', desc: 'Blok yang diletakkan/dihancurkan.' },
    { code: 'a:+block', name: 'Blok diletakkan', desc: 'Blok yang diletakkan.' },
    { code: 'a:-block', name: 'Blok dihancurkan', desc: 'Blok yang dihancurkan.' },
    { code: 'a:chat', name: 'Chat', desc: 'Pesan yang dikirim di chat.' },
    { code: 'a:click', name: 'Click', desc: 'Interaksi pemain.' },
    { code: 'a:command', name: 'Command', desc: 'Perintah yang digunakan.' },
    { code: 'a:container', name: 'Container', desc: 'Item diambil atau dimasukkan ke peti.' },
    { code: 'a:+container', name: 'Item dimasukkan', desc: 'Item dimasukkan ke peti.' },
    { code: 'a:-container', name: 'Item diambil', desc: 'Item diambil dari peti.' },
    { code: 'a:inventory', name: 'Inventory', desc: 'Item ditambahkan atau dihapus dari inventori pemain.' },
    { code: 'a:+inventory', name: 'Item ditambahkan', desc: 'Item ditambahkan ke inventori.' },
    { code: 'a:-inventory', name: 'Item dihapus', desc: 'Item dihapus dari inventori.' },
    { code: 'a:item', name: 'Item', desc: 'Item dijatuhkan, dilempar, diambil, disimpan, atau ditarik.' },
    { code: 'a:+item', name: 'Item diambil/ditarik', desc: 'Item diambil atau ditarik.' },
    { code: 'a:-item', name: 'Item dijatuhkan/dilempar', desc: 'Item dijatuhkan, dilempar, atau disimpan.' },
    { code: 'a:kill', name: 'Kill', desc: 'Mobs atau hewan yang dibunuh.' },
    { code: 'a:session', name: 'Session', desc: 'Pemain login/logout.' },
    { code: 'a:+session', name: 'Player login', desc: 'Pemain login.' },
    { code: 'a:-session', name: 'Player logout', desc: 'Pemain logout.' },
    { code: 'a:sign', name: 'Sign', desc: 'Pesan yang ditulis di papan.' },
    { code: 'a:username', name: 'Username', desc: 'Perubahan nama pengguna.' },
  ];

  const sections = actions.map(a => `
    <div class="doc-section">
      <div class="doc-section-head">
        <span class="doc-section-chevron">▶</span>
        <span class="doc-action-code">${escapeHtml(a.code)}</span>
        <span class="doc-action-name">${escapeHtml(a.name)}</span>
      </div>
      <div class="doc-section-body">${escapeHtml(a.desc)}</div>
    </div>
  `).join('');

  const html = `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">CoreProtect Investigation Guide</h1>
        <p class="page-subtitle">Panduan lengkap penggunaan /co inspect dan /co lookup untuk investigasi perubahan di server.</p>
      </div>
    </div>

    <div class="doc-hero">
      <h2 class="doc-hero-title">CoreProtect Actions</h2>
      <p class="doc-hero-desc">Setiap perubahan yang terjadi di server tercatat oleh CoreProtect. Gunakan filter <code>a:[action]</code> pada /co lookup untuk menfilter berdasarkan jenis perubahan.</p>
    </div>

    ${sections}

    <div class="section-block" style="margin-top:20px;">
      <div class="section-block-title"><span class="title-icon">📋</span>Quick Reference</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
        <div class="doc-card">
          <div class="doc-card-icon">▣</div>
          <div class="doc-card-body">
            <div class="doc-card-name">/co inspect <span class="command-alias">(/co i)</span></div>
            <div class="doc-card-desc">Aktifkan mode inspeksi untuk memeriksa perubahan blok dan entitas secara langsung.</div>
          </div>
        </div>
        <div class="doc-card">
          <div class="doc-card-icon">▣</div>
          <div class="doc-card-body">
            <div class="doc-card-name">/co lookup <span class="command-alias">(/co l)</span></div>
            <div class="doc-card-desc">Cari perubahan berdasarkan filter: waktu, player, radius, dan jenis action.</div>
          </div>
        </div>
      </div>
    </div>
  `;
  render(MAIN, html);
}

// ---- DOCS: Java & Bedrock ----

function renderJavaBedrock() {
  const html = `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Java &amp; Bedrock Player Name</h1>
        <p class="page-subtitle">Perbedaan format nama player antara Java Edition dan Bedrock Edition.</p>
      </div>
    </div>

    <div class="doc-hero">
      <h2 class="doc-hero-title">Perbedaan Format Nama</h2>
      <p class="doc-hero-desc">Player Java Edition dan Bedrock Edition memiliki format nama yang berbeda saat digunakan dalam command. Perbedaan ini penting untuk diperhatikan agar command berjalan tepat pada player yang dimaksud.</p>
    </div>

    <div class="lang-compare">
      <div class="lang-card">
        <div class="lang-card-label">Java Edition</div>
        <div class="lang-card-name">Abcd1234</div>
        <div class="lang-card-desc">Nama player langsung tanpa awalan khusus.</div>
      </div>
      <div class="lang-card">
        <div class="lang-card-label">Bedrock Edition</div>
        <div class="lang-card-name">.Abcd1234</div>
        <div class="lang-card-desc">Nama player diawali dengan titik (.) sebelum nama.</div>
      </div>
    </div>

    <div class="lang-warning">
      <div class="lang-warning-title">⚠ Perhatian</div>
      <p class="lang-warning-text">Perhatikan titik sebelum nama player Bedrock. Jika lupa menggunakan titik, command dapat tidak berpengaruh atau berpotensi mengenai akun lain.</p>
    </div>
<br>
    <div class="section-block">
      <div class="section-block-title"><span class="title-icon">📋</span>Contoh Penggunaan</div>
      <div class="lang-examples">
        <div class="lang-example">
          <span class="lang-example-label">Java:</span>
          <code class="lang-example-code">/warn Abcd1234 server:earth Toxic</code>
        </div>
        <div class="lang-example">
          <span class="lang-example-label">Bedrock:</span>
          <code class="lang-example-code">/warn .Abcd1234 server:earth Toxic</code>
        </div>
      </div>
    </div>
  `;
  render(MAIN, html);
}

// ---- DOCS: Server / Realm ----

function renderServerRealm() {
  const params = [
    'server:tycoon',
    'server:arenapvp',
    'server:oneblock',
    'server:oneblock2',
    'server:survival',
    'server:survival2',
    'server:survivalwar',
    'server:earth',
    'server:vanilla:lobby',
    'server:vanilla:1',
    'server:vanilla:2',
    
  ];

  const paramCards = params.map(p =>
    `<div class="server-param">${escapeHtml(p)}</div>`
  ).join('');

  const html = `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Server Parameter</h1>
        <p class="page-subtitle">Penjelasan parameter server:&lt;realm&gt; dan pengaruhnya terhadap punishment.</p>
      </div>
    </div>

    <div class="doc-hero">
      <h2 class="doc-hero-title">Parameter Server</h2>
      <p class="doc-hero-desc">Setiap command punishment dapat ditambahkan parameter <code>server:&lt;realm&gt;</code> untuk membatasi punishment hanya pada server tertentu. Tanpa parameter ini, punishment berlaku secara global.</p>
    </div>

    <div class="server-params-grid">${paramCards}</div>

    <div class="server-note">
      <strong>Tanpa server:&lt;realm&gt; = Global</strong><br>
      <span style="font-size:12.5px;color:var(--text-dim);">Jika tidak ditentukan server, punishment berlaku di semua server.</span>
    </div>

    <div class="section-block">
      <div class="section-block-title"><span class="title-icon">📋</span>Contoh</div>
      <div class="global-example">
        <span class="global-example-label">Global punishment:</span>
        <code class="global-example-code">/warn Steve Toxic</code>
      </div>
      <p style="font-size:12px;color:var(--text-dim);margin-top:4px;">Steve dibanned di semua server.</p>
      <div class="global-example" style="margin-top:8px;">
        <span class="global-example-label">Earth-specific punishment:</span>
        <code class="global-example-code">/warn Steve server:earth Toxic</code>
      </div>
      <p style="font-size:12px;color:var(--text-dim);margin-top:4px;">Steve hanya dibanned di server Earth.</p>
    </div>
  `;
  render(MAIN, html);
}

// ---- ABOUT PAGE ----

function renderAbout() {
  const html = `
    <div class="about-hero">
      <h1 class="about-hero-title">About AlwiNation Command Staff</h1>
      <p class="about-hero-sub">Your complete command reference for AlwiNation Staff — built for the AlwiNation Minecraft server community.</p>
    </div>

    <div class="about-section">
      <div class="about-section-title">Purpose</div>
      <ul>
        <li>Quickly find commands by rank, type, or category</li>
        <li>Understand command usage with clear examples</li>
        <li>Check staff permissions and available ranks</li>
        <li>Follow investigation procedures step by step</li>
        <li>Learn the difference between Java and Bedrock player names</li>
      </ul>
    </div>

    <div class="about-section">
      <div class="about-section-title">Staff Hierarchy</div>
      <ul>
        <li><strong>J-Helper</strong> — Junior Staff, entry-level</li>
        <li><strong>Helper</strong> — Support Staff, handles player issues</li>
        <li><strong>S-Helper</strong> — Senior Helper, supervises Helpers</li>
        <li><strong>T-Moderator</strong> — Trial Moderator</li>
        <li><strong>Moderator</strong> — Full moderator</li>
        <li><strong>S-Moderator</strong> — Senior Moderator</li>
      </ul>
    </div>

    <div class="about-section">
      <div class="about-section-title">Command Types</div>
      <ul>
        <li><strong>Minecraft</strong> — In-game Minecraft commands</li>
        <li><strong>Discord</strong> — Discord bot commands for staff</li>
        <li><strong>Staff Feature</strong> — Features available to promoted staff</li>
        <li><strong>Documentation</strong> — Investigation guides and references</li>
      </ul>
    </div>

    <div class="about-section">
      <div class="about-section-title">Keyboard Shortcuts</div>
      <ul>
        <li><kbd style="font-family:var(--mono);font-size:11px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:3px;padding:1px 5px;">Ctrl + K</kbd> — Open global search</li>
        <li><kbd style="font-family:var(--mono);font-size:11px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:3px;padding:1px 5px;">Esc</kbd> — Close modals</li>
      </ul>
    </div>

    <div class="about-footer">
      AlwiNation Command Staff v1.0.0<br>
      <span style="font-size:11px;">Built for the AlwiNation Minecraft Server community.</span>
    </div>
  `;
  render(MAIN, html);
}

// ---- NOT FOUND ----

function renderNotFound() {
  const html = `
    <div class="empty-state" style="padding:80px 20px;text-align:center;">
      <div class="empty-state-icon">📄</div>
      <div class="empty-state-text" style="font-size:16px;color:var(--text);">Page not found</div>
      <p style="font-size:13px;color:var(--text-dim);margin-top:8px;">The page you're looking for doesn't exist.</p>
      <a href="#/" class="btn btn-primary" style="margin-top:16px;display:inline-block;">Go to Dashboard</a>
    </div>
  `;
  render(MAIN, html);
}

// ---- Export helpers for init.js ----

if (typeof window !== 'undefined') {
  window.commandRoute = commandRoute;
  window.staffRoute = staffRoute;
  window.parseRoute = parseRoute;
  window.breadcrumb = breadcrumb;
  window.commandCard = commandCard;
  window.commandDetailCard = commandDetailCard;
  window.staffFeatureCard = staffFeatureCard;
  window.docCard = docCard;
  window.escapeHtml = escapeHtml;
  window.renderDashboard = renderDashboard;
  window.renderCommands = renderCommands;
  window.renderCommandDetail = renderCommandDetail;
  window.renderStaffRole = renderStaffRole;
  window.renderStaffList = renderStaffList;
  window.renderCoreProtect = renderCoreProtect;
  window.renderJavaBedrock = renderJavaBedrock;
  window.renderServerRealm = renderServerRealm;
  window.renderAbout = renderAbout;
  window.renderNotFound = renderNotFound;
}
