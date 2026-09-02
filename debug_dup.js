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

vm.runInContext(fs.readFileSync('app.js', 'utf8'), c);
c.ALWINA = c.window.ALWINA;
vm.runInContext(fs.readFileSync('render.js', 'utf8'), c);

// Render J-Helper and dump the key section
c.renderStaffRole('j-helper');
const html = sharedMain.innerHTML;

console.log('=== J-HELPER RENDERED HTML ===');
console.log('Length:', html.length);
console.log('');

// Find and print the commands-grid sections
const gridSections = html.match(/<div class="commands-grid">[\s\S]*?<\/div>/g);
console.log('Found', gridSections ? gridSections.length : 0, 'commands-grid sections');
gridSections && gridSections.forEach(function(g, i) {
  console.log('\n--- commands-grid #' + (i+1) + ' (' + g.length + ' chars) ---');
  // Print just first 500 chars
  console.log(g.substring(0, 500));
  if (g.length > 500) console.log('...[truncated]');
});

console.log('\n=== Count command-card occurrences ===');
const allCards = html.match(/command-card/g);
console.log('Total command-card matches:', allCards ? allCards.length : 0);

// Check the HTML structure around command-card
const cardMatches = html.match(/<a class="command-card"/g);
console.log('Total <a class="command-card" matches:', cardMatches ? cardMatches.length : 0);

// Print the HTML between role-header and the end
const roleHeaderEnd = html.indexOf('</div>', html.indexOf('role-short-desc'));
const afterHeader = html.substring(roleHeaderEnd);
console.log('\n=== HTML after role-header (first 2000 chars) ===');
console.log(afterHeader.substring(0, 2000));
