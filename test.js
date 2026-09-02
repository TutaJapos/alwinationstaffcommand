// Browser environment simulation
global.window = { 
  addEventListener: () => {}, 
  removeEventListener: () => {}, 
  location: { hash: '#/' }, 
  history: { pushState: () => {} } 
};
global.navigator = { 
  clipboard: { writeText: async () => {} }, 
  userAgent: 'test' 
};
global.document = {
  'getElementById': (id) => {
    const map = {
      'mainContent': { 
        innerHTML: '', 
        classList: { 
          add: () => {}, 
          remove: () => {}, 
          contains: () => false, 
          toggle: () => {} 
        }, 
        offsetWidth: 1, 
        style: {} 
      },
      'sidebar': { 
        classList: { 
          add: () => {}, 
          remove: () => {}, 
          contains: () => false, 
          toggle: () => {} 
        } 
      },
      'mobileOverlay': { 
        classList: { 
          add: () => {}, 
          remove: () => {}, 
          contains: () => false 
        } 
      },
      'searchOverlay': { 
        classList: { 
          add: () => {}, 
          remove: () => {}, 
          contains: () => false 
        }, 
        setAttribute: () => {}, 
        getAttribute: () => '' 
      },
      'toast': { 
        textContent: '', 
        classList: { 
          add: () => {}, 
          remove: () => {}, 
          contains: () => false 
        }, 
        _hideTimer: null 
      },
      'searchInput': { 
        value: '', 
        focus: () => {}, 
        addEventListener: () => {} 
      },
      'searchResults': { 
        innerHTML: '', 
        querySelectorAll: () => [], 
        addEventListener: () => {} 
      },
      'searchEmpty': { 
        style: { display: '' }, 
        textContent: '' 
      },
      'searchClose': { addEventListener: () => {} },
      'searchTriggerMobile': { addEventListener: () => {} },
      'mobileMenuToggle': { addEventListener: () => {} },
      'head': { appendChild: () => {}, removeChild: () => {} },
    };
    return map[id] || null;
  },
  'createElement': (tag) => {
    return {
      tagName: tag.toUpperCase(),
      src: '',
      onload: null,
      style: {},
      appendChild: () => {},
      remove: () => {},
      addEventListener: () => {},
    };
  },
  body: { 
    appendChild: () => {}, 
    removeChild: () => {} 
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  head: { appendChild: () => {}, removeChild: () => {} },
};

const fs = require('fs');
const vm = require('vm');

// Load app.js (data layer)
const appCode = fs.readFileSync('app.js', 'utf8');
// app.js sets window.ALWINA when window exists
vm.runInThisContext(appCode);
// Copy to global so render.js can access it
if (global.window && global.window.ALWINA) {
  global.ALWINA = global.window.ALWINA;
}

// Load render.js
const renderCode = fs.readFileSync('render.js', 'utf8');
vm.runInThisContext(renderCode);
// Re-grab ALWINA (render.js may have added to it)
const ALWINA = global.window && global.window.ALWINA ? global.window.ALWINA : global.ALWINA;

// Load init.js
const initCode = fs.readFileSync('init.js', 'utf8');

console.log('=== COMPREHENSIVE VERIFICATION ===\n');

// ---- DATA LAYER TESTS ----
console.log('--- DATA LAYER ---');
console.log('Total commands:', ALWINA.COMMANDS.length);
console.log('Minecraft:', ALWINA.COMMANDS.filter(c => c.type === 'Minecraft').length);
console.log('Discord:', ALWINA.COMMANDS.filter(c => c.type === 'Discord').length);
console.log('Staff Feature:', ALWINA.COMMANDS.filter(c => c.type === 'Staff Feature').length);
console.log('Documentation:', ALWINA.COMMANDS.filter(c => c.type === 'Documentation').length);

const jh = ALWINA.getCommandsForRank('j-helper');
const hp = ALWINA.getCommandsForRank('helper');
console.log('\nJ-Helper commands:', jh.length);
console.log('Helper commands:', hp.length);
console.log('J-Helper cmd names:', jh.map(c => c.name).join(', '));
console.log('Helper-only cmd:', hp.filter(c => !jh.find(j => j.id === c.id)).map(c => c.name).join(', '));

// ---- CAN-USE TESTS ----
console.log('\n--- PERMISSION CHECKS ---');
const coLookup = ALWINA.COMMANDS.find(c => c.id === 'co-lookup');
const tempban = ALWINA.COMMANDS.find(c => c.id === 'tempban');
const notes = ALWINA.COMMANDS.find(c => c.id === 'notes');
const warn = ALWINA.COMMANDS.find(c => c.id === 'warn');

console.log('J-Helper can use /co lookup:', ALWINA.canUseCommand('j-helper', coLookup));
console.log('J-Helper can use /warn:', ALWINA.canUseCommand('j-helper', warn));
console.log('J-Helper can use /tempban:', ALWINA.canUseCommand('j-helper', tempban));
console.log('Helper can use /tempban:', ALWINA.canUseCommand('helper', tempban));
console.log('Helper can use /notes:', ALWINA.canUseCommand('helper', notes));
console.log('S-Helper can use /notes:', ALWINA.canUseCommand('s-helper', notes));
console.log('J-Helper can use /notes:', ALWINA.canUseCommand('j-helper', notes));

// ---- SEARCH TESTS ----
console.log('\n--- SEARCH ---');
const searchTests = [
  ['warn', ['/warn', '/tempban']],
  ['ban', ['/tempban']],
  ['co', ['/co inspect', '/co lookup']],
  ['coreprotect', ['/co inspect', '/co lookup', 'CoreProtect Investigation Guide']],
  ['lookup', ['/co lookup']],
  ['discord', ['/notes', '/staffhelp', '/ongoing add', '/ongoing kirim', '/ongoing delete', '/bugreport']],
  ['ticket', ['Akses Tickets', 'On Going Ticket', 'Laporan Claim Ticket']],
  ['staff', ['/notes', 'Bukti Kepemilikan Akun', 'Laporan Claim Ticket']],
  ['note', ['/notes']],
  ['vanish', ['/vanish']],
  ['van', ['/vanish']],
];

let allSearchOk = true;
for (const [query, expected] of searchTests) {
  const results = ALWINA.searchCommands(query);
  const names = results.map(c => c.name);
  const nameSet = new Set(names);
  const expectedSet = new Set(expected);
  const missing = [...expectedSet].filter(n => !nameSet.has(n));
  const extra = [...nameSet].filter(n => !expectedSet.has(n));
  let status = 'OK';
  if (missing.length || extra.length) {
    status = 'MISMATCH';
    allSearchOk = false;
  }
  console.log(`  "${query}": ${names.join(', ')} ${status}${missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''}${extra.length ? ' (extra: ' + extra.join(', ') + ')' : ''}`);
}

// ---- ROUTE TESTS ----
console.log('\n--- ROUTE HELPERS ---');
console.log('co-lookup url:', ALWINA.commandUrl(coLookup));
console.log('staff url for j-helper:', ALWINA.staffRoute('j-helper'));
console.log('slug for /co lookup:', ALWINA.slugify('/co lookup'));
console.log('find by slug co-lookup:', ALWINA.findCommandBySlug('co-lookup')?.name);

// ---- RANK COMMAND COUNTS ----
console.log('\n--- RANK COMMAND COUNTS (for dashboard stats) ---');
for (const rank of ALWINA.STAFF_RANKS) {
  const count = ALWINA.countCommandsForRank(rank.id);
  console.log(`${rank.name} (level ${rank.level}): ${count} commands`);
}

// ---- FILTER TESTS ----
console.log('\n--- COMMAND FILTERS ---');
console.log('All Punishment commands:', ALWINA.getCommandsByCategory('Punishment').map(c => c.name).join(', '));
console.log('All CoreProtect commands:', ALWINA.getCommandsByCategory('CoreProtect').map(c => c.name).join(', '));
console.log('All Investigation commands:', ALWINA.getCommandsByCategory('Investigation').map(c => c.name).join(', '));

// ---- UNIQUE CATEGORIES ----
const allCats = [...new Set(ALWINA.COMMANDS.flatMap(c => c.categories))];
console.log('\n--- ALL CATEGORIES ---');
console.log(allCats.join(', '));
console.log('Total categories:', allCats.length);

// ---- RENDERER VERIFICATION ----
console.log('\n--- RENDERER FUNCTIONS ---');
const renderers = [
  'renderDashboard', 'renderCommands', 'renderCommandDetail',
  'renderStaffRole', 'renderStaffList', 'renderCoreProtect',
  'renderJavaBedrock', 'renderServerRealm', 'renderAbout',
  'renderNotFound', 'parseRoute', 'commandRoute', 'staffRoute',
  'escapeHtml', 'breadcrumb', 'commandCard', 'filterBar'
];
for (const name of renderers) {
  console.log(`${name}: ${typeof window[name] !== 'undefined' ? 'DEFINED' : 'MISSING'}`);
}

// ---- ROUTER ROUTES ----
console.log('\n--- ROUTER ROUTES ---');
console.log(Object.keys(ROUTER).join(', '));

console.log('\n=== VERIFICATION COMPLETE ===');
console.log('All search tests: ' + (allSearchOk ? 'PASSED' : 'HAS ISSUES'));
