// Quick debug: check what renderStaffRole actually renders
const fs = require('fs');
const vm = require('vm');

const c = vm.createContext({
  window: { ALWINA: null, MAIN: null, addEventListener: () => {}, location: { hash: '#/' }, history: { pushState: () => {} }, document: null },
  navigator: { clipboard: { writeText: async () => {} }, userAgent: 'test' },
  console, setTimeout, clearTimeout
});

const doc = {
  getElementById(id) {
    if (id === 'mainContent') {
      const el = { innerHTML: '', classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} }, offsetWidth: 1, style: {} };
      c.window.MAIN = el;
      c.MAIN = el;
      return el;
    }
    return null;
  },
  createElement(tag) { return { tagName: tag.toUpperCase(), src: '', onload: null, style: {}, appendChild: () => {}, remove: () => {}, addEventListener: () => {}, parentNode: null }; },
  body: { appendChild: () => {}, removeChild: () => {} },
  querySelectorAll() { return []; },
  addEventListener() {},
  head: { appendChild: () => {}, removeChild: () => {}, childNodes: [] },
  dispatchEvent() {}
};
c.document = doc;
c.window.document = doc;

vm.runInContext(fs.readFileSync('app.js', 'utf8'), c);
c.ALWINA = c.window.ALWINA;
vm.runInContext(fs.readFileSync('render.js', 'utf8'), c);

console.log('=== DEBUG: renderStaffRole ===');
const rank = 'j-helper';
const r = c.ALWINA.RANK_BY_ID[rank];
const cmds = c.ALWINA.getCommandsForRank(rank);
const executableCmds = cmds.filter(x => x.type !== 'Staff Feature' && x.type !== 'Documentation');
const staffFeatures = cmds.filter(x => x.type === 'Staff Feature');
const docs = cmds.filter(x => x.type === 'Documentation');
const ownCommands = cmds.filter(x => x.minimumRank === rank);

console.log('rank:', rank);
console.log('total cmds:', cmds.length);
console.log('executableCmds:', executableCmds.length, '(' + executableCmds.map(x => x.name).join(', ') + ')');
console.log('staffFeatures:', staffFeatures.length);
console.log('docs:', docs.length);
console.log('ownCommands:', ownCommands.length);
console.log('showComingSoon:', ownCommands.length === 0);

// Now render and check
c.renderStaffRole(rank);
const html = c.MAIN.innerHTML;
console.log('\nRendered HTML length:', html.length);
console.log('command-card count:', (html.match(/command-card/g) || []).length);
console.log('staff-feature-card count:', (html.match(/staff-feature-card/g) || []).length);
console.log('doc-card count:', (html.match(/doc-card/g) || []).length);
console.log('Has LEVEL 1:', html.includes('LEVEL 1'));
console.log('Has J-Helper title:', html.includes('J-Helper'));
console.log('Has Tanggung Jawab:', html.includes('Tanggung Jawab'));
console.log('Has command-card class in HTML:', html.includes('command-card'));

// Check for duplicate renderings
const uniqueCommandCards = [...new Set(html.match(/command-card"/g) || [])];
console.log('Unique command-card elements:', uniqueCommandCards.length);
