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
  if (path[0] === 'regulation' && path.length === 1) return { type: 'regulation' };

  if (path[0] === 'commands') {
    if (path[1] === 'minecraft') return { type: 'commands-minecraft' };
    if (path[1] === 'discord') return { type: 'commands-discord' };
    if (!path[1]) return { type: 'commands' };
    return { type: 'not-found' };
  }

  if (path[0] === 'staff-features' && path.length === 1) return { type: 'staff-features' };

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
  const totalCmds = ALWINA.COMMANDS.filter(command => command.name.startsWith('/')).length;
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
  `;

  const commandCards = ALWINA.COMMANDS.slice(4, 10).map(commandCard).join('');

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
    <h3 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:14px;">Quick Commands</h3>
    <div class="commands-grid">${commandCards}</div>
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
  let cmds = ALWINA.COMMANDS.filter(command => command.name.startsWith('/'));

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

  // CoreProtect actions
  if (cmd.actions && cmd.actions.length) {
    const rows = cmd.actions.map(action => `
      <tr>
        <td><code class="filter-code">${escapeHtml(action.code)}</code></td>
        <td>${escapeHtml(action.name)}</td>
        <td>${escapeHtml(action.desc)}</td>
      </tr>
    `).join('');
    body += `
      <div class="section-block">
        <div class="section-block-title"><span class="title-icon">◈</span>Actions</div>
        <table class="filters-table">
          <thead><tr><th>Action</th><th>Name</th><th>Description</th></tr></thead>
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

function renderStaffFeatures() {
  const features = ALWINA.COMMANDS.filter(cmd => cmd.type === 'Staff Feature');
  const cards = features.map(staffFeatureCard).join('');

  const html = `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Staff Features</h1>
        <p class="page-subtitle">Features and tools available to AlwiNation staff.</p>
      </div>
    </div>
    <div class="commands-grid">${cards}</div>
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
      <span style="font-size:11px;">Built for the AlwiNation Minecraft Server community.</span>
    </div>
  `;
  render(MAIN, html);
}

// ---- REGULATION PAGE ----
// Source: REGULATIONS ALWINATION.pdf (updated 13/08/2026).
const REGULATION_SECTIONS = [
  {
    number: '1', title: 'Peraturan Umum',
    jurisdiction: 'Berlaku bagi semua anggota komunitas AlwiNation, baik di dalam game Minecraft maupun di server Discord.',
    groups: [
      { number: '1.1', title: 'Etika dan Perilaku', rules: [
        ['1.1.1', 'Hormati Sesama', 'Setiap anggota wajib menghormati Pemain lain, Staff, maupun Owner tanpa memandang ras, agama, gender, usia, jabatan, atau latar belakang. Segala bentuk penghinaan, pelecehan, ejekan, provokasi, maupun tindakan merendahkan terhadap Pemain lain, Staff, maupun Owner tidak diperbolehkan.', 'Peringatan → Mute/Time Out 10 menit → Ban 1 hari → Ban permanen.'],
        ['1.1.2', 'Bahasa yang Sopan', 'Gunakan bahasa yang sopan dalam semua komunikasi. Hindari kata-kata kasar, kotor, atau yang dapat menyinggung orang lain.', 'Peringatan → Mute/Time Out 10 menit → Ban 1 hari → Ban permanen.'],
        ['1.1.3', 'Larangan Perilaku Toxic', 'Tidak diperbolehkan trolling, memprovokasi, atau menyebarkan kebencian, baik secara langsung maupun tidak langsung.', 'Peringatan → Mute/Time Out 10 menit → Ban 1 hari → Ban permanen.'],
      ]},
      { number: '1.2', title: 'Konten yang Dilarang', rules: [
        ['1.2.1', 'Konten Terlarang', 'Dilarang membahas, memprovokasi, maupun memperdebatkan topik sensitif yang berpotensi menimbulkan konflik, keributan, atau perpecahan di dalam komunitas. Topik seperti politik, SARA, atau konflik sosial yang berpotensi menimbulkan perpecahan tidak diperkenankan dibahas di komunitas.', 'Ban 7 hari → Ban 30 hari → Ban permanen.'],
        ['1.2.2', 'Pembahasan Sensitif', 'Topik seperti politik, SARA, atau konflik sosial yang berpotensi menimbulkan perpecahan tidak diperkenankan dibahas di komunitas.', 'Mute 10 menit → Ban 1 hari → Ban permanen.'],
      ]},
      { number: '1.3', title: 'Keamanan dan Privasi', rules: [
        ['1.3.1', 'Informasi Pribadi', 'Dilarang menyebarkan informasi pribadi orang lain tanpa izin, seperti alamat, nomor telepon, identitas, atau foto.', 'Ban 30 hari → Ban 90 hari → Ban permanen & IP.'],
        ['1.3.2', 'Keamanan Akun', 'Pemain bertanggung jawab penuh atas keamanan akun mereka. Jika akun disalahgunakan karena kelalaian, sanksi tetap berlaku.', 'Disesuaikan dengan jenis pelanggaran.'],
      ]},
      { number: '1.4', title: 'Nama dan Identitas', rules: [
        ['1.4.1', 'Nama Tidak Pantas', 'Dilarang menggunakan nama karakter, tim, pulau, mob, atau item dengan unsur pornografi, SARA, politik, iklan, atau penghinaan.', 'Ganti nama dalam 1x24 jam & Peringatan → Ban permanen.'],
        ['1.4.2', 'UU ITE', 'Tindakan yang melanggar hukum Indonesia, seperti pencemaran nama baik, penyebaran hoaks, atau pelanggaran hak cipta akan ditindak tegas.', 'Ban permanen dan IP.'],
      ]},
    ],
  },
  {
    number: '2', title: 'Peraturan Server Minecraft',
    jurisdiction: 'Berlaku untuk seluruh pemain Minecraft di server AlwiNation.',
    groups: [
      { number: '2.1', title: 'Fair Play dalam Gameplay', rules: [
        ['2.1.1', 'Penyalahgunaan Fitur Game', 'Dilarang menggunakan fitur, sistem, maupun command server secara tidak semestinya atau menyimpang dari fungsi aslinya untuk memperoleh keuntungan pribadi.', 'Peringatan → TempMute 1 jam → Jail 24 jam & AdsMute Permanen.'],
        ['2.1.1.1', 'Abuse Auction House', 'Melakukan rename item dengan tujuan untuk mempromosikan PW, melakukan penipuan (scam), atau menjual item tersebut melalui /AH (Auction House).', 'Ban 7 Hari → Permanen'],
        ['2.1.2', 'Cheating/Hacking', 'Menggunakan perangkat tambahan, modifikasi client, maupun metode lainnya yang memberikan keuntungan tidak adil dibanding pemain lain. Termasuk dalam kategori pelanggaran berikut:', ''],
        ['2.1.2.1', 'X-Ray & FreeCam - Cheating/Unfair Advantage', 'Menggunakan Texture/Resource Pack, Modifikasi, atau Client yang memungkinkan pemain melihat menembus block untuk memperoleh keuntungan.', 'Ban 3 hari→ Ban 7 hari → Ban permanen.'],
        ['2.1.2.2', 'Auto-Clicker - Cheating/Unfair Advantage', 'Menggunakan Modifikasi client maupun Modifikasi eksternal, termasuk program pihak ketiga, mouse clicker, mouse macro, dan sejenisnya yang memodifikasi timing atau pola klik untuk memperoleh keuntungan pribadi. Pengecualian hanya diberikan untuk fitur Hold Left Click atau metode berbasis tahan klik kiri seperti F3 + T.', 'Jail 6 Jam → Ban 7 hari → Ban permanen.'],
        ['2.1.2.3', 'Auto Fish - Cheating/Unfair Advantage', 'Menggunakan sistem atau modifikasi memancing otomatis dalam bentuk apa pun. Pengecualian diberikan pada sistem AN-Mancing karena fitur tersebut memang memiliki mekanisme auto-fish bawaan.', 'Jail 6 Jam → Ban 7 hari → Ban permanen.'],
        ['2.1.2.4', 'Hacked Client - Cheating/Unfair Advantage', 'Menggunakan Client Modifikasi/Hacked Client maupun program eksternal yang memberikan keuntungan tidak wajar dalam gameplay. Termasuk namun tidak terbatas pada: MiniMap, KillAura, Reach, Macro, Aimbot, ESP, Fly Hack, Speed Hack, Jesus, Scaffold, Inventory Move, Phase, Blink, TriggerBot, NoFall, Anti Knockback, Auto Totem, Fast Break, Script/Inject, Ghost Client, serta program pihak ketiga sejenis lainnya.', 'Ban permanen.'],
        ['2.1.2.5', 'Litematica - Unfair Advantage', 'Penggunaan Litematica diperbolehkan, tetapi fitur-fitur tambahan yang memberikan keuntungan tidak adil terhadap player lain dalam bermain dilarang digunakan, seperti Easy Place, Printing, dan fitur sejenis lainnya.', 'Ban permanen.'],
        ['2.1.3', 'Bug Abuse & Exploit', 'Menyalahgunakan bug, glitch, atau kesalahan sistem server untuk memperoleh keuntungan dalam bentuk apa pun, termasuk mencoba maupun menyebarkan exploit kepada pemain lain tanpa melaporkannya kepada staff.', 'Ban permanen.'],
        ['2.1.3.1', 'Item Illegal - Bug Abuse & Exploit', 'Memiliki, menggunakan, menyimpan, atau memperdagangkan item, uang, maupun resource yang diperoleh melalui pelanggaran pada poin 2.1.3 akan ditindak sesuai regulasi yang berlaku.', 'Penghapusan Base/Stash + Ban permanen.'],
        ['2.1.3.2', 'Proteksi Pemain - Bug Abuse & Exploit', 'Player yang melaporkan serta mendokumentasikan Bug atau Glitch sebagaimana dimaksud pada poin 2.1.3 akan diberikan penghargaan sesuai tingkat dan dampak bug/glitch tersebut.', 'Toleransi: Penyitaan Item + Pengurangan masa Ban (Jika terkena Sanksi).'],
        ['2.1.4', 'Multi-Accounting', 'Memiliki lebih dari 3 akun (Bedrock/Java) dalam satu kepemilikan untuk menyalahgunakan fitur server.', 'Peringatan & Alt account di-ban → Akun utama ban 7 hari → Ban permanen.'],
        ['2.1.5', 'Ban Evade', 'Mencoba menghindari sanksi dengan menggunakan akun lain. Apabila suatu akun menerima sanksi berat, yang mana berlaku terhadap semua pelanggaran berat, maka akun utama maupun akun alternatif yang digunakan akan dianggap melakukan pelanggaran Ban Evasion.', 'Ban permanen & Ban IP.'],
        ['2.1.6', 'Mekanisme Redstone', 'Dilarang membuat loop, clock, maupun mekanisme otomatis berbasis redstone yang berjalan terus-menerus dan berpotensi menyebabkan lag atau mengganggu performa server.', 'Penghancuran Mekanisme & Peringatan → Jail 6 Jam → Ban 7 hari → Ban permanen.'],
        ['2.1.7', 'Bot, Botting & Automasi', 'Dilarang menggunakan Bot, Botting, Script Automasi, maupun sistem berbasis AI yang menjalankan aktivitas permainan secara otomatis tanpa kontrol pemain secara langsung. Termasuk namun tidak terbatas pada: Auto Farming, Auto Mining, Auto Movement, AI Automation, Script Auto Task, Baritone, AutoCleft, Automatone, Bot Pihak ketiga dan sejenisnya.', 'Ban permanen.'],
      ]},
      { number: '2.2', title: 'Interaksi Antar Pemain', rules: [
        ['2.2.1', 'Stealing', 'Mengambil, menguasai, atau memindahkan item milik pemain lain tanpa izin dari pemiliknya.', 'Penyitaan Item & 8-24 Jam (Bergantung pada beban hukuman) → Ban 7 hari → Ban permanen.'],
        ['2.2.2', 'Griefing', 'Merusak properti pemain lain, membunuh entity milik orang lain, atau menghancurkan area sekitar — bahkan jika belum terproteksi secara resmi. Semua tindakan yang menunjukkan niat merusak atau mengganggu lingkungan komunitas akan dikenakan sanksi.', '8-12 Jam (Bergantung pada beban hukuman) → Ban 7 hari → Ban permanen.'],
        ['2.2.3', 'PvP, Trapping, & Random Kill', 'Dilarang melakukan serangan PvP terhadap pemain lain tanpa persetujuan bersama. Selain itu, segala bentuk trapping atau penjebakan yang bertujuan untuk membunuh, menjebak, mengambil item, atau merugikan pemain lain secara sengaja juga tidak diperbolehkan. Setiap tindakan yang memanfaatkan mekanisme permainan untuk menciptakan kerugian bagi pemain lain tanpa persetujuan mereka akan dianggap sebagai pelanggaran.', 'Ban 7 hari + Clear Inventory/EnderChest → Ban 30 hari → Ban permanen.'],
        ['2.2.4', 'Berbohong kepada Staff', 'Memberikan informasi palsu atau menyembunyikan informasi saat proses investigasi.', 'Klarifikasi → Ban 7 hari → Ban permanen.'],
        ['2.2.5', 'Inappropriate Builds', 'Membangun konten yang mengandung vulgaritas, simbol politik/agama, atau provokasi.', 'Peringatan → Ban 3 hari → Ban permanen.'],
        ['2.2.6', 'Inappropriate Warp/Guild Name/Island Name', 'Dilarang menggunakan nama Warp, Guild, Island, maupun nama terkait lainnya yang mengandung unsur tidak pantas, ofensif, provokatif, pornografi, diskriminasi, ujaran kebencian, penghinaan, atau hal lain yang melanggar aturan server.', 'Rename/Penghapusan Nama & Peringatan → Ban 3 Hari → Ban Permanen.'],
      ]},
      { number: '2.3', title: 'Komunikasi & Chat', rules: [
        ['2.3.1', 'Spam & Flooding', 'Mengirim pesan secara berulang, berlebihan, tidak relevan, atau memenuhi chat dalam waktu singkat sehingga mengganggu kenyamanan pemain lain maupun aktivitas server. Termasuk spam teks, simbol, huruf berulang, maupun pesan yang dikirim secara terus-menerus.', 'Peringatan → Mute 10 menit → Mute 30 menit → Jail 3 Jam → Jail 6 Jam.'],
        ['2.3.2', 'Iklan Tanpa Izin', 'Melakukan promosi server lain, media sosial, atau produk tanpa izin resmi staff.', 'Mute 24 jam → Ban 3 hari → Ban permanen.'],
        ['2.3.3', 'Toxic Behavior & Bahasa Kasar', 'Dilarang melakukan toxic behavior, menghina, memprovokasi, melecehkan, maupun menggunakan bahasa kasar yang dapat mengganggu kenyamanan pemain lain. Termasuk namun tidak terbatas pada: Ucapan ofensif atau penghinaan berlebihan, Flaming dan tindakan yang memicu keributan, Pelecehan verbal, Pembahasan atau penyebaran unsur pornografi, Penghinaan, Pengejekan, Perkataan yang bersifat merendahkan, Diskriminatif, maupun tidak pantas. Peraturan ini berlaku di seluruh chat, voice chat, maupun media komunikasi lainnya yang berkaitan dengan server.', 'Peringatan → Mute 10 menit → Mute 30 menit → Ban 1 hari → Ban Permanen'],
        ['2.3.3.1', 'Toxic Behavior & Bahasa Kasar - Non-Toleransi', 'Segala bentuk penghinaan, pelecehan, maupun pengejekan yang membawa nama orang tua, keluarga, maupun agama termasuk pelanggaran berat dan tidak memiliki toleransi. Termasuk namun tidak terbatas pada: Menghina orang tua atau keluarga pemain lain maupun Staff/Owner, Pelecehan terhadap agama atau kepercayaan tertentu, Ucapan yang bersifat merendahkan, menistakan, atau memprovokasi terkait keluarga maupun agama.', 'Ban permanen.'],
        ['2.3.3.2', 'Toxic Behavior & Bahasa Kasar - Insulting Server & Staff', 'Dilarang melakukan penghinaan, pelecehan, fitnah, provokasi, ujaran kebencian, maupun tindakan lain yang bertujuan merendahkan, mencemarkan nama baik, atau menyerang Server Alwination, Staff Alwination, Owner, maupun anggota tim lainnya. Kritik, saran, dan masukan yang disampaikan secara sopan dan konstruktif tetap diperbolehkan. Namun, penyampaiannya harus dilakukan dengan cara yang baik dan tidak mengandung unsur penghinaan maupun serangan pribadi', 'Ban permanen.'],
        ['2.3.4', 'Penyalahgunaan Command', 'Dilarang menggunakan command in-game secara tidak semestinya atau untuk tujuan yang mengganggu pemain lain maupun aktivitas server. Termasuk penggunaan simbol atau format command seperti [/], /ADS, /WTB, /WTS, /WORK untuk kepentingan selain showcase, demonstrasi, atau penggunaan command yang sebenarnya.', 'Peringatan + adsMute → Mute 10 menit → Mute 30 menit → → Jail 3 Jam → Jail 24 Jam.'],
      ]},
      { number: '2.4', title: 'Aktivitas Terlarang dan Pelanggaran Berat', rules: [
        ['2.4.1', 'RMT & Trading', 'Melakukan transaksi Jual-beli akun, Balance, atau Item dengan uang nyata (IRL-trade/Cross-server trade), atau dengan imbalan Up-Rank & Credits.', 'Ban permanen/Ban IP.'],
        ['2.4.1.1', 'RMT & Trading - Perencanaan', 'Segala bentuk perencanaan, percobaan, negosiasi, promosi, maupun upaya yang berkaitan dengan aktivitas Real Money Trading (RMT) akan dianggap sebagai pelanggaran dan ditindak sesuai ketentuan pada poin 2.4.1.', 'Ban Permanen/Ban IP.'],
        ['2.4.1.2', 'RMT & Trading - In-Game Trade', 'Segala bentuk Transaksi, Pertukaran, maupun perdagangan antar Realm AlwiNation maupun dengan server di luar AlwiNation tidak diperbolehkan. Termasuk pertukaran item, uang, akun, maupun resource lintas Realm atau lintas Server.', 'Peringatan + Penyitaan Barang → Ban 30 hari → Ban permanen.'],
        ['2.4.2', 'Scamming', 'Melakukan penipuan terhadap pemain lain dalam bentuk apa pun, termasuk Transaksi, Perdagangan, Peminjaman, Jasa, maupun Janji yang sengaja tidak ditepati untuk memperoleh keuntungan pribadi. Segala bentuk manipulasi, informasi palsu, maupun tindakan yang merugikan pemain lain akan dianggap sebagai pelanggaran.', 'Ban 7 hari + kompensasi → Ban permanen.'],
        ['2.4.2.1', 'Scamming - Item Rename', 'Mengubah nama asli suatu item menjadi nama yang menyesatkan atau tidak sesuai dengan tujuan untuk menipu, memanipulasi, maupun mengelabui pemain lain demi keuntungan pribadi. Termasuk pemalsuan nama item yang menyerupai item bernilai lebih tinggi, item spesial, maupun item dengan fungsi tertentu.', 'Ban 3 hari + Kompensasi → Ban 7 hari → Ban permanen.'],
        ['2.4.3', 'Pelecehan & Ancaman', 'Mengintimidasi, melecehkan, atau mendorong tindakan berbahaya terhadap diri sendiri atau orang lain.', 'Ban permanen.'],
        ['2.4.4', 'Diskriminasi', 'Menghina berdasarkan suku, agama, ras, gender, orientasi seksual, atau kondisi fisik.', 'Ban permanen.'],
        ['2.4.5', 'Melakukan Perjudian', 'Melakukan bentuk perjudian apapun, seperti taruhan uang, item, atau kegiatan game lain.', 'Jail 12 Jam → Ban permanen.'],
      ]},
    ],
  },
  {
    number: '3', title: 'Peraturan Server Discord',
    jurisdiction: 'Berlaku untuk semua aktivitas dan komunikasi di server Discord AlwiNation.',
    groups: [
      { number: '3.1', title: 'Etika Komunikasi', rules: [['3.1.1', 'Spam, Caps Lock, Promosi Spam', 'Dilarang mengirim spam, emoji berlebihan, atau caps lock berulang yang mengganggu kenyamanan.', 'Peringatan → Time Out 1 jam → Time Out 12 jam → Ban permanen.']] },
      { number: '3.2', title: 'Konten dan Media', rules: [['3.2.1', 'NSFW & Link Berbahaya', 'Dilarang membagikan konten dewasa, kekerasan ekstrem, atau tautan berbahaya (phishing, virus).', 'Kick → Ban 7 hari → Ban permanen.']] },
      { number: '3.3', title: 'Penggunaan Channel', rules: [
        ['3.3.1', 'Voice Channel & Iklan', 'Gunakan voice channel dengan sopan. Hindari suara bising, interupsi, atau promosi tanpa izin yang mengganggu kenyamanan pengguna lain.', 'Peringatan → Kick/Time Out → Ban sementara.'],
        ['3.3.2', 'Gunakan Channel Sesuai Topik', 'Pastikan setiap pesan atau aktivitas sesuai dengan fungsi channel. Spam, off-topic, atau penyalahgunaan saluran akan ditindak.', 'Peringatan → Kick/Time Out → Ban sementara.'],
      ]},
      { number: '3.4', title: 'Interaksi Staff', rules: [
        ['3.4.1', 'Hormati Staff & Sistem Tiket', 'Hormati keputusan staff dan gunakan sistem tiket untuk semua bentuk komunikasi resmi terkait server. Staff tidak berkewajiban menanggapi pesan pribadi (DM) terkait permasalahan server. Diskusi diperbolehkan jika dilakukan secara sopan dan konstruktif.', 'Peringatan → Mute 6 jam → Ban 7 hari.'],
        ['3.4.2', 'Meniru Staff', 'Dilarang menggunakan nama, format, gaya chat, atau tampilan yang menyerupai staff — baik dengan niat menipu maupun tidak. Hal ini dapat menimbulkan kebingungan, penyalahgunaan identitas, dan mengganggu kredibilitas sistem staff.', 'Peringatan → Ban permanen.'],
      ]},
      { number: '3.5', title: 'Keamanan & Privasi', rules: [
        ['3.5.1', 'Info Pribadi & Data Server', 'Dilarang menyebarkan, membagikan, maupun memperjualbelikan data pribadi pemain, informasi internal staff, maupun data sensitif server tanpa izin resmi.', 'Peringatan → Ban 7 hari → Ban permanen.'],
        ['3.5.2', 'Privasi Pemain & Pelanggar', 'Staff wajib menjaga privasi seluruh pemain maupun pelanggar selama proses penanganan kasus berlangsung. Informasi, bukti, maupun data terkait pelanggaran tidak diperbolehkan untuk disebarluaskan atau melibatkan pihak ketiga tanpa alasan dan kepentingan resmi yang berkaitan langsung dengan administrasi server.', ''],
      ]},
      { number: '3.6', title: 'Kode Etik dan Wewenang Staff', rules: [['3.6.1', 'Penyalahgunaan Wewenang Staff (Staff Abuse)', 'Semua staff wajib bertindak adil dan profesional. Dilarang menggunakan kekuasaan untuk kepentingan pribadi, balas dendam, atau memberi sanksi tanpa prosedur/bukti yang jelas.', 'Teguran internal → Penurunan jabatan → Suspensi staff → Pencopotan permanen (sesuai tingkat pelanggaran).']] },
    ],
  },
  {
    number: '4', title: 'Sanksi dan Penindakan', groups: [
      { number: '4.1', title: 'Jenis Sanksi', rules: [
        ['4.1', 'Jenis Sanksi', 'Jenis sanksi yang dapat diberikan oleh staff meliputi:', 'Peringatan: Teguran lisan atau tertulis dari staff.\nMute: Pemblokiran sementara untuk mengirim pesan di chat.\nJail: Penahanan karakter dalam game untuk jangka waktu tertentu.\nKick: Mengeluarkan pemain dari server sementara.\nBan Sementara: Pemblokiran akses sementara ke server.\nBan Permanen: Pemblokiran akses permanen ke server.\nPenghapusan Konten: Penghapusan bangunan, pesan, atau konten lain yang melanggar peraturan.\n\nCatatan Penting: Sanksi yang tercantum pada setiap aturan merupakan sanksi maksimal yang dapat dijatuhkan. Staff berhak memberikan sanksi yang lebih ringan berdasarkan konteks, tingkat kesalahan, dan riwayat pelanggaran. Namun, staff tidak diperbolehkan memberikan sanksi yang lebih berat dari yang tercantum tanpa persetujuan High Staff.'],
      ]},
      { number: '4.2', title: 'Prosedur Penindakan', rules: [['4.2', 'Prosedur Penindakan', 'Setiap penindakan dilakukan melalui tahapan prosedural yang adil:', 'Investigasi: Staff akan melakukan penyelidikan terhadap laporan atau temuan pelanggaran dengan mengumpulkan bukti.\nBukti: Keputusan sanksi harus berdasarkan bukti kuat, seperti screenshot, log, atau saksi terpercaya. Apabila tidak mengikuti prosedur sesuai yang diminta akan langsung diajukan ke ban permanent dan tiket akan ditutup.\nKomunikasi: Staff akan menginformasikan alasan sanksi kepada pemain (kecuali dalam pelanggaran berat yang jelas).\nBanding: Pemain memiliki hak untuk mengajukan banding melalui sistem tiket dalam waktu 7 hari setelah sanksi dijatuhkan.\nKeputusan Final: Keputusan High Staff bersifat mutlak dan tidak dapat diganggu gugat.']] },
      { number: '4.3', title: 'Durasi Pelanggaran', rules: [
        ['4.3.1', 'Sanksi Lebih Berat', 'Pelanggaran yang dilakukan secara berulang akan dikenakan sanksi yang lebih berat dari hukuman sebelumnya. Tingkat sanksi akan disesuaikan berdasarkan riwayat pelanggaran, tingkat kesalahan, serta dampak yang ditimbulkan terhadap pemain lain maupun server.', ''],
        ['4.3.1.1', 'Sanksi Lebih Berat - Akumulasi', 'Seluruh hukuman bersifat akumulatif dan dapat digabungkan dengan sanksi dari pelanggaran lainnya. Apabila seorang pemain terbukti melakukan beberapa pelanggaran sekaligus atau menerima pelanggaran berat yang berulang, staff berhak menjatuhkan sanksi yang lebih tinggi sesuai tingkat pelanggaran. Sebagai contoh, akumulasi dua pelanggaran yang masing-masing berujung pada Ban Permanen dapat ditingkatkan menjadi Ban IP atau sanksi yang lebih berat sesuai keputusan staff.', ''],
        ['4.3.2', 'Zero Tolerance', 'Untuk pelanggaran berat, tidak ada toleransi dan akan langsung diberikan sanksi maksimal.', ''],
      ]},
      { number: '4.4', title: 'Hak Pemain atas Banding dan Informasi', rules: [
        ['4.4', 'Hak Pemain atas Banding dan Informasi', 'Semua pemain memiliki hak untuk mengetahui alasan sanksi dan berhak mengajukan banding resmi melalui sistem tiket.', ''],
        ['4.4.1', 'Transparansi', 'Staff wajib memberikan penjelasan yang masuk akal atas sanksi, kecuali dalam kasus sensitif atau berbahaya.', ''],
        ['4.4.2', 'Hak Banding', 'Setiap pemain boleh mengajukan banding satu kali per sanksi, maksimal 7 hari setelah keputusan dijatuhkan.', ''],
        ['4.4.3', 'Jalur Resmi', 'Banding hanya diterima melalui sistem tiket. Permintaan melalui DM, chat umum, atau jalur tidak resmi akan diabaikan.', ''],
        ['4.4.4', 'Keputusan Final', 'Setelah proses banding selesai, keputusan akhir berada di tangan High Staff dan bersifat mutlak.', ''],
        ['4.4.4.1', 'Keputusan Final - Supervisor', 'Keputusan yang ditetapkan oleh Supervisor bersifat final dan tidak dapat diajukan banding, kecuali apabila terdapat pertimbangan khusus atau dispensasi dari Supervisor lain yang berwenang.', ''],
        ['4.4.4.2', 'Keputusan Final - Blacklist', 'Status Blacklist hanya dapat diberikan oleh Supervisor dan merupakan sanksi permanen. Hukuman ini dapat berlaku terhadap seluruh akun yang terafiliasi dengan pelanggar, termasuk akun alternatif maupun pihak lain yang terbukti terlibat dalam pelanggaran yang sama.', ''],
      ]},
    ],
  },
  {
    number: '5', title: 'Ketentuan Tambahan', groups: [{ number: '5', title: 'Ketentuan Tambahan', rules: [
      ['5.1', 'Perubahan Peraturan', 'Peraturan dapat berubah sewaktu-waktu sesuai dengan kebutuhan, perkembangan komunitas, atau kebijakan internal dari tim AlwiNation. Pemain diimbau untuk selalu memeriksa pembaruan peraturan secara berkala.', ''],
      ['5.2', 'Kewajiban Pemain', 'Ketidaktahuan terhadap peraturan tidak membebaskan pemain dari sanksi. Setiap pemain wajib membaca, memahami, dan mengikuti seluruh peraturan yang berlaku di komunitas ini.', ''],
      ['5.3', 'Hak Cipta dan Kepemilikan', 'Semua konten, struktur, sistem, dan aset yang ada dalam server merupakan hak cipta milik AlwiNation. Dilarang menyalin, memodifikasi, atau mendistribusikan konten tanpa izin tertulis dari pemilik server.', ''],
      ['5.4', 'Batasan Tanggung Jawab', 'AlwiNation tidak bertanggung jawab atas kerusakan atau kerugian yang terjadi akibat kelalaian pemain, termasuk namun tidak terbatas pada kehilangan item, data, akun, atau kerugian akibat akses tidak sah.', ''],
    ]}] },
  { number: '6', title: 'Penutup', groups: [{ number: '6', title: 'Penutup', rules: [['6', 'Penutup', 'Terima kasih telah menjadi bagian dari komunitas AlwiNation. Dengan menaati peraturan ini, kita bersama-sama menciptakan tempat bermain yang aman, nyaman, dan adil bagi semua pemain.\n\nJika kamu membutuhkan bantuan atau memiliki pertanyaan terkait peraturan, silakan gunakan sistem tiket melalui ・ᴛɪᴄᴋᴇᴛꜱ dan hubungi staff resmi kami.\n\nMari kita ciptakan petualangan yang penuh kenangan dan komunitas yang tumbuh bersama dengan semangat kebersamaan dan rasa saling menghargai.\n\nAlwiNation — Petualangan Tanpa Batas.\nUpdated — 13/08/2026', '']] }] },
];

let regulationState = { query: '', section: 'all' };

function regulationRuleMarkup(rule) {
  const [number, title, content, sanctions] = rule;
  const text = escapeHtml(content).replace(/\n/g, '<br>');
  return `<details class="regulation-rule" name="regulation-rule" data-regulation-search="${escapeHtml(`${number} ${title} ${content} ${sanctions}`.toLowerCase())}"><summary><span class="regulation-number">${escapeHtml(number)}</span><span>${escapeHtml(title)}</span></summary><div class="regulation-rule-body"><p>${text}</p>${sanctions ? `<div class="regulation-sanction"><strong>Sanksi:</strong><span>${escapeHtml(sanctions).replace(/\n/g, '<br>')}</span></div>` : ''}</div></details>`;
}

function regulationSectionsMarkup(query) {
  return REGULATION_SECTIONS.map(section => {
    const sectionText = `${section.number} ${section.title} ${section.jurisdiction || ''}`.toLowerCase();
    const groups = section.groups.map(group => {
      const rules = group.rules.filter(rule => !query || `${group.number} ${group.title} ${rule.join(' ')}`.toLowerCase().includes(query));
      if (query && !rules.length && !sectionText.includes(query)) return '';
      return `<div class="regulation-group"><h3>${escapeHtml(group.number)} ${escapeHtml(group.title)}</h3>${rules.map(regulationRuleMarkup).join('')}</div>`;
    }).join('');
    if (!groups || (query && !groups.includes('regulation-rule') && !sectionText.includes(query))) return '';
    return `<section class="regulation-section" id="regulation-section-${escapeHtml(section.number)}" data-regulation-section="${escapeHtml(section.number)}"><div class="regulation-section-heading"><span class="regulation-section-number">${escapeHtml(section.number)}</span><div><h2>${escapeHtml(section.title)}</h2>${section.jurisdiction ? `<p><strong>Yurisdiksi:</strong> ${escapeHtml(section.jurisdiction)}</p>` : ''}</div></div>${groups}</section>`;
  }).join('');
}

function updateRegulationResults() {
  const list = MAIN.querySelector('.regulation-list');
  if (!list) return;
  const query = regulationState.query.trim().toLowerCase();
  list.innerHTML = regulationSectionsMarkup(query) || '<div class="empty-state"><div class="empty-state-icon">⌕</div><div class="empty-state-text">Tidak ada peraturan yang cocok.</div></div>';
  if (regulationState.section !== 'all') {
    const target = MAIN.querySelector(`[data-regulation-section="${CSS.escape(regulationState.section)}"]`);
    MAIN.querySelectorAll('.regulation-section').forEach(section => { section.hidden = section !== target; });
  }
}

function renderRegulation() {
  const sections = regulationSectionsMarkup(regulationState.query.trim().toLowerCase());
  const contents = REGULATION_SECTIONS.map(s => `<li><a href="#regulation-section-${s.number}">${s.number}. ${escapeHtml(s.title)}</a></li>`).join('');
  const html = `<div class="page-header regulation-header">${breadcrumb([{ label: 'Dashboard', target: '#/' }, { label: 'Regulation' }])}
  <div class="eyebrow">AlwiNation Community Guidelines</div>
  <h1 class="page-title">Regulation</h1>
  <p class="page-subtitle">Peraturan resmi AlwiNation — baca, cari, dan telusuri setiap ketentuan tanpa mengubah isi aslinya.</p>
  </div>
  <div class="regulation-intro">
 
  <div class="regulation-controls">
  <label class="regulation-search">
  <span>⌕</span><input id="regulationSearch" type="search" value="${escapeHtml(regulationState.query)}" placeholder="Cari nomor, judul, atau isi peraturan..." aria-label="Cari peraturan"></label><label class="regulation-filter">Bagian<select id="regulationSectionFilter"><option value="all">Semua bagian</option>${REGULATION_SECTIONS.map(s => `<option value="${s.number}" ${regulationState.section === s.number ? 'selected' : ''}>${s.number}. ${escapeHtml(s.title)}</option>`).join('')}</select></label></div><div class="regulation-list">${sections || '<div class="empty-state"><div class="empty-state-icon">⌕</div><div class="empty-state-text">Tidak ada peraturan yang cocok.</div></div>'}</div>`;
  render(MAIN, html);
  updateRegulationResults();
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
  window.renderStaffFeatures = renderStaffFeatures;
  window.renderCoreProtect = renderCoreProtect;
  window.renderJavaBedrock = renderJavaBedrock;
  window.renderServerRealm = renderServerRealm;
  window.renderRegulation = renderRegulation;
  window.renderAbout = renderAbout;
  window.renderNotFound = renderNotFound;
}
