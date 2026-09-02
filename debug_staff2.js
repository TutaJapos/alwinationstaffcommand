const fs = require('fs');
const vm = require('vm');

// Build sandbox once
const c = vm.createContext({
  window: { ALWINA: null, MAIN: null, addEventListener: () => {}, location: { hash: '#/' }, history: { pushState: () => {} }, document: null },
  navigator: { clipboard: { writeText: async () => {} }, userAgent: 'test' },
  console, setTimeout, clearTimeout
});

// Create a SINGLE shared MAIN element
const sharedMain = {
  innerHTML: '',
  classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
  offsetWidth: 1,
  style: {}
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

// Load modules
vm.runInContext(fs.readFileSync('app.js', 'utf8'), c);
c.ALWINA = c.window.ALWINA;
vm.runInContext(fs.readFileSync('render.js', 'utf8'), c);

// Now test all staff roles sharing the same MAIN
const ranks = ['j-helper','helper','s-helper','t-moderator','moderator','s-moderator'];
ranks.forEach(function(r) {
  sharedMain.innerHTML = '';
  c.renderStaffRole(r);
  const html = sharedMain.innerHTML;
  if (!html || html.length === 0) {
    console.log(r + ': RENDER EMPTY (' + html.length + ')');
    return;
  }
  const cmdCount = (html.match(/command-card/g) || []).length;
  const featCount = (html.match(/staff-feature-card/g) || []).length;
  const docCount = (html.match(/doc-card/g) || []).length;
  const ownCmds = c.ALWINA.getCommandsForRank(r).filter(function(x) {
    return x.minimumRank === c.ALWINA.RANK_BY_ID[r].name;
  }).length;
  console.log(r + ': ' + cmdCount + ' cmd, ' + featCount + ' feat, ' + docCount + ' docs, ' + ownCmds + ' own, comingSoon=' + html.includes('Commands coming soon'));
});
