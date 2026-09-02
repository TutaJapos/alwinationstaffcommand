const fs = require('fs');
const vm = require('vm');

const c = vm.createContext({
  window: { ALWINA: null, MAIN: null, addEventListener: () => {}, location: { hash: '#/' }, history: { pushState: () => {} }, document: null },
  navigator: { clipboard: { writeText: async () => {} }, userAgent: 'test' },
  console, setTimeout, clearTimeout
});

const sharedMain = {
  innerHTML: '',
  classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
  offsetWidth: 1, style: {}
};

const doc = {
  getElementById(id) {
    if (id === 'mainContent') {
      c.window.MAIN = sharedMain;
      c.MAIN = sharedMain;
      return sharedMain;
    }
    return null;
  },
  createElement(tag) {
    return { tagName: tag.toUpperCase(), src: '', onload: null, style: {}, appendChild: () => {}, remove: () => {}, addEventListener: () => {}, parentNode: null };
  },
  body: { appendChild: () => {}, removeChild: () => {} },
  querySelectorAll() { return []; },
  addEventListener() {},
  head: { appendChild: () => {}, removeChild: () => {}, childNodes: [] },
  dispatchEvent() {}
};
c.document = doc;
c.window.document = doc;

// Load modules with function exposure
let renderSrc = fs.readFileSync('render.js', 'utf8');
renderSrc = renderSrc.replace(
  /^((?:function|const|let|var)\s+(renderDashboard|renderStaffList|renderStaffRole|renderCommandDetail|renderCoreProtect|renderJavaBedrock|renderServerRealm|renderAbout|renderNotFound|commandCard|commandDetailCard|docCard|staffFeatureCard|breadcrumb|filterBar|parseRoute|escapeHtml|escapeAttr)\s*)/gm,
  'c.$2 = $1'
);

vm.runInContext(fs.readFileSync('app.js', 'utf8'), c);
c.ALWINA = c.window.ALWINA;
vm.runInContext(renderSrc, c);

console.log('=== FINAL VERIFICATION ===\n');

const ranks = [
  { id: 'j-helper', expCmd: 8,  expFeat: 0, expDoc: 3, expSoon: false },
  { id: 'helper',   expCmd: 15, expFeat: 6, expDoc: 3, expSoon: false },
  { id: 's-helper', expCmd: 15, expFeat: 6, expDoc: 3, expSoon: false },
  { id: 't-moderator', expCmd: 15, expFeat: 6, expDoc: 3, expSoon: false },
  { id: 'moderator', expCmd: 15, expFeat: 6, expDoc: 3, expSoon: false },
  { id: 's-moderator', expCmd: 15, expFeat: 6, expDoc: 3, expSoon: false },
];

let allPass = true;
ranks.forEach(function(spec) {
  sharedMain.innerHTML = '';
  try {
    c.renderStaffRole(spec.id);
  } catch (e) {
    console.log(spec.id + ': RENDER ERROR — ' + e.message);
    allPass = false;
    return;
  }
  const html = sharedMain.innerHTML;
  if (!html || html.length === 0) {
    console.log(spec.id + ': EMPTY RENDER');
    allPass = false;
    return;
  }
  // Count actual ELEMENTS (not CSS class names)
  const aCmd    = html.match(/<a class="command-card"/g) || [];
  const aFeat   = html.match(/<div class="staff-feature-card"/g) || [];
  const aDoc    = html.match(/<div class="doc-card"/g) || [];
  const hasSoon = html.includes('Commands coming soon');

  const cmdOk    = aCmd.length   === spec.expCmd;
  const featOk   = aFeat.length  === spec.expFeat;
  const docOk    = aDoc.length   === spec.expDoc;
  const soonOk   = hasSoon       === spec.expSoon;
  const ok = cmdOk && featOk && docOk && soonOk;
  if (!ok) allPass = false;

  console.log(spec.id + ': ' + (ok ? 'PASS' : 'FAIL'));
  if (!cmdOk)   console.log('  cmd: got ' + aCmd.length + ', expected ' + spec.expCmd);
  if (!featOk)  console.log('  feat: got ' + aFeat.length + ', expected ' + spec.expFeat);
  if (!docOk)   console.log('  doc: got ' + aDoc.length + ', expected ' + spec.expDoc);
  if (!soonOk)  console.log('  comingSoon: got ' + hasSoon + ', expected ' + spec.expSoon);
});

console.log('\n=== RESULT:', allPass ? 'ALL PASSED' : 'HAS FAILURES', '===');

// Print sample for J-Helper
sharedMain.innerHTML = '';
c.renderStaffRole('j-helper');
console.log('\n=== J-HELPER PAGE SAMPLE ===');
console.log(sharedMain.innerHTML.substring(0, 600) + '...');
