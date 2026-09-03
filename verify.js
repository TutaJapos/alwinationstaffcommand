// Full end-to-end render verification for AlwiNation Command Staff
const fs = require('fs');
const vm = require('vm');

// Build a proper browser-like sandbox
const sandbox = {
  window: { 
    ALWINA: null, 
    MAIN: null,
    addEventListener: () => {},
    location: { hash: '#/' },
    history: { pushState: () => {} },
    document: null,
  },
  navigator: { clipboard: { writeText: async () => {} }, userAgent: 'test' },
  console,
  setTimeout,
  clearTimeout,
};

// Create the document stub
const docStub = {
  getElementById(id) {
    if (id === 'mainContent') {
      const el = { 
        innerHTML: '', 
        classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
        offsetWidth: 1,
        style: {}
      };
      sandbox.window.MAIN = el;
      sandbox.MAIN = el;
      return el;
    }
    const store = {
      sidebar: { classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} } },
      mobileOverlay: { classList: { add: () => {}, remove: () => {}, contains: () => false } },
      searchOverlay: { classList: { add: () => {}, remove: () => {}, contains: () => false }, setAttribute: () => {}, getAttribute: () => '' },
      toast: { textContent: '', classList: { add: () => {}, remove: () => {}, contains: () => false }, _hideTimer: null },
      searchInput: { value: '', focus: () => {}, addEventListener: () => {} },
      searchResults: { innerHTML: '', querySelectorAll: () => [], addEventListener: () => {} },
      searchEmpty: { style: { display: '' }, textContent: '' },
      searchClose: { addEventListener: () => {} },
      searchTriggerMobile: { addEventListener: () => {} },
      mobileMenuToggle: { addEventListener: () => {} },
      head: { appendChild: () => {}, removeChild: () => {}, childNodes: [] },
    };
    return store[id] || null;
  },
  createElement(tag) {
    return { 
      tagName: tag.toUpperCase(), 
      src: '', 
      onload: null, 
      style: {}, 
      appendChild: () => {}, 
      remove: () => {},
      addEventListener: () => {},
      parentNode: null,
    };
  },
  body: { appendChild: () => {}, removeChild: () => {} },
  querySelectorAll() { return []; },
  addEventListener() {},
  head: { appendChild: () => {}, removeChild: () => {}, childNodes: [] },
  dispatchEvent() {},
};

sandbox.document = docStub;
sandbox.window.document = docStub;

vm.createContext(sandbox);

// Load app.js
vm.runInContext(fs.readFileSync('app.js', 'utf8'), sandbox);
sandbox.ALWINA = sandbox.window.ALWINA;

// Load render.js
vm.runInContext(fs.readFileSync('render.js', 'utf8'), sandbox);

console.log('=== VERIFICATION START ===\n');
console.log('MAIN:', sandbox.window.MAIN === null ? 'NULL' : 'OK');
console.log('ALWINA:', sandbox.window.ALWINA === null ? 'NULL' : 'OK');

// ---- Dashboard ----
console.log('\n--- Dashboard ---');
sandbox.renderDashboard();
const dashHTML = sandbox.window.MAIN.innerHTML;
console.log('Dashboard HTML length:', dashHTML.length);
console.log('Has stat-value:', dashHTML.includes('stat-value'));
console.log('Has rank-card:', dashHTML.includes('rank-card'));
console.log('Has Browse Commands:', dashHTML.includes('Browse Commands'));
console.log('Has Staff Roles:', dashHTML.includes('Staff Roles'));
const statCount = (dashHTML.match(/stat-value/g) || []).length;
console.log('Stat card count:', statCount);
const rankCount = (dashHTML.match(/rank-card/g) || []).length;
console.log('Rank card count:', rankCount);

// Extract stat values
const statMatches = dashHTML.match(/stat-value[^<]*<\/div>/g);
console.log('Stat values:', statMatches ? statMatches.map(m => m.match(/>(\d+)</)[1]).join(', ') : 'none');

// ---- Staff List ----
console.log('\n--- Staff List ---');
sandbox.renderStaffList();
const staffHTML = sandbox.window.MAIN.innerHTML;
console.log('Staff HTML length:', staffHTML.length);
console.log('Has J-Helper:', staffHTML.includes('J-Helper'));
console.log('Has S-Moderator:', staffHTML.includes('S-Moderator'));
const roleCards = (staffHTML.match(/staff-role-card/g) || []).length;
console.log('Role card count:', roleCards);

// ---- Command Detail ----
console.log('\\n--- Command Detail (/co lookup) ---');
sandbox.commandDetailCard(sandbox.ALWINA.COMMANDS.find(c => c.id === 'co-lookup'));
const cmdHTML = sandbox.window.MAIN.innerHTML;
console.log('Command HTML length:', cmdHTML.length);
console.log('Has /co lookup:', cmdHTML.includes('/co lookup'));
console.log('Has Usage:', cmdHTML.includes('Usage'));
console.log('Has Filters:', cmdHTML.includes('Filters'));
console.log('Has Example:', cmdHTML.includes('Example'));
console.log('Has Available Ranks:', cmdHTML.includes('Available Ranks'));
console.log('Has breadcrumb:', cmdHTML.includes('breadcrumb'));
console.log('Has Copy button:', cmdHTML.includes('Copy'));
console.log('Has rank badge J-HELPER:', cmdHTML.includes('J-HELPER+'));

// ---- /warn detail ----
console.log('\n--- Command Detail (/warn) ---');
sandbox.renderCommandDetail(sandbox.ALWINA.COMMANDS.find(c => c.id === 'warn'));
const warnHTML = sandbox.window.MAIN.innerHTML;
console.log('Has warning notes:', warnHTML.includes('Reason tidak perlu ditulis'));

// ---- /co inspect detail ----
console.log('\n--- Command Detail (/co inspect) ---');
sandbox.renderCommandDetail(sandbox.ALWINA.COMMANDS.find(c => c.id === 'co-inspect'));
const inspectHTML = sandbox.window.MAIN.innerHTML;
console.log('Has instructions:', inspectHTML.includes('Ketik /co inspect'));

// ---- CoreProtect Docs ----
console.log('\n--- CoreProtect Docs ---');
sandbox.renderCoreProtect();
const cpHTML = sandbox.window.MAIN.innerHTML;
console.log('Has title:', cpHTML.includes('CoreProtect Investigation Guide'));
console.log('Has Action Reference:', cpHTML.includes('Action Reference'));
console.log('Has a:block:', cpHTML.includes('a:block'));
console.log('Has a:chat:', cpHTML.includes('a:chat'));
console.log('Has a:kill:', cpHTML.includes('a:kill'));
console.log('Has a:session:', cpHTML.includes('a:session'));
console.log('Has a:container:', cpHTML.includes('a:container'));
console.log('Has a:username:', cpHTML.includes('a:username'));
const actionCount = (cpHTML.match(/doc-section/g) || []).length;
console.log('Action section count:', actionCount);

// ---- Java/Bedrock Docs ----
console.log('\n--- Java/Bedrock Docs ---');
sandbox.renderJavaBedrock();
const jbHTML = sandbox.window.MAIN.innerHTML;
console.log('Has Java Edition:', jbHTML.includes('Java Edition'));
console.log('Has Bedrock Edition:', jbHTML.includes('Bedrock Edition'));
console.log('Has warning:', jbHTML.includes('Perhatian') || jbHTML.includes('Perhatikan'));

// ---- Server/Realm Docs ----
console.log('\n--- Server/Realm Docs ---');
sandbox.renderServerRealm();
const srHTML = sandbox.window.MAIN.innerHTML;
console.log('Has server:tycoon:', srHTML.includes('server:tycoon'));
console.log('Has server:earth:', srHTML.includes('server:earth'));
console.log('Has Global:', srHTML.includes('Global'));

// ---- About ----
console.log('\n--- About ---');
sandbox.renderAbout();
const aboutHTML = sandbox.window.MAIN.innerHTML;
console.log('Has About title:', aboutHTML.includes('About'));

// ---- Commands page (all) ----
console.log('\n--- Commands Page (All) ---');
sandbox.renderCommands(null, { rank: 'all', type: 'all', category: 'all' });
const allCmdsHTML = sandbox.window.MAIN.innerHTML;
console.log('Has filter bar:', allCmdsHTML.includes('filter-bar'));
console.log('Has All Ranks:', allCmdsHTML.includes('All') && allCmdsHTML.includes('J-HELPER'));
console.log('Has Minecraft type filter:', allCmdsHTML.includes('Minecraft'));
console.log('Has Punishment category filter:', allCmdsHTML.includes('Punishment'));
const allCmdCards = (allCmdsHTML.match(/command-card/g) || []).length;
console.log('All command card count:', allCmdCards);

// ---- Commands page (Minecraft filter) ----
console.log('\n--- Commands Page (Minecraft) ---');
sandbox.renderCommands('minecraft', { rank: 'all', type: 'Minecraft', category: 'all' });
const mcHTML = sandbox.window.MAIN.innerHTML;
const mcCards = (mcHTML.match(/command-card/g) || []).length;
console.log('Minecraft command card count:', mcCards, '(expected 9)');
console.log('Correct count:', mcCards === 9 ? 'YES' : 'NO (' + mcCards + ')');

// ---- Search verification ----
console.log('\n--- Search Tests ---');
const searchTests = [
  ['warn', ['/warn'], 'should find /warn'],
  ['temp', ['/tempban', '/tempmute'], 'should find temp commands'],
  ['co', ['/co inspect', '/co lookup'], 'should find /co commands'],
  ['coreprotect', ['/co inspect', '/co lookup', 'CoreProtect Investigation Guide'], 'should find CoreProtect items'],
  ['discord', ['/notes', '/staffhelp', '/ongoing add', '/ongoing kirim', '/ongoing delete', '/bugreport'], 'should find Discord commands'],
  ['vanish', ['/vanish'], 'should find /vanish'],
  ['staff', ['/notes', 'Bukti Kepemilikan Akun', 'Laporan Claim Ticket'], 'should find staff items'],
  ['ticket', ['/ongoing add', '/ongoing kirim', '/ongoing delete', 'Akses Tickets', 'On Going Ticket', 'Laporan Claim Ticket'], 'should find ticket items'],
];

let allSearchOk = true;
for (const [query, expected, desc] of searchTests) {
  const results = sandbox.ALWINA.searchCommands(query);
  const names = results.map(c => c.name);
  const nameSet = new Set(names);
  const expectedSet = new Set(expected);
  const missing = [...expectedSet].filter(n => !nameSet.has(n));
  const extra = [...nameSet].filter(n => !expectedSet.has(n));
  const status = missing.length || extra.length ? 'FAIL' : 'PASS';
  if (status === 'FAIL') allSearchOk = false;
  console.log(`  ${status} Search "${query}" (${desc}): found ${names.length} results`);
  if (missing.length) console.log(`    Missing: ${missing.join(', ')}`);
  if (extra.length) console.log(`    Extra: ${extra.join(', ')}`);
}

console.log('\n=== ALL TESTS COMPLETE ===');
console.log('All search tests:', allSearchOk ? 'PASSED' : 'HAS ISSUES');
