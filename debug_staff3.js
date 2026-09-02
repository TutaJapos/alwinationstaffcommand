const fs = require('fs');
const vm = require('vm');

// Create sandbox with persistent MAIN
const c = vm.createContext({
  window: { ALWINA: null, MAIN: null, addEventListener: () => {}, location: { hash: '#/' }, history: { pushState: () => {} }, document: null },
  navigator: { clipboard: { writeText: async () => {} }, userAgent: 'test' },
  console, setTimeout, clearTimeout
});

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
const renderSrc = fs.readFileSync('render.js', 'utf8');
console.log('Render.js length:', renderSrc.length);
vm.runInContext(renderSrc, c);

console.log('\n=== Testing all staff role pages ===');

const ranks = ['j-helper', 'helper', 's-helper', 't-moderator', 'moderator', 's-moderator'];

ranks.forEach(function(rankId) {
  // Reset shared main
  sharedMain.innerHTML = '';

  const rank = c.ALWINA.RANK_BY_ID[rankId];
  const cmds = c.ALWINA.getCommandsForRank(rankId);
  const executableCmds = cmds.filter(function(x) { return x.type !== 'Staff Feature' && x.type !== 'Documentation'; });
  const staffFeatures = cmds.filter(function(x) { return x.type === 'Staff Feature'; });
  const docsList = cmds.filter(function(x) { return x.type === 'Documentation'; });
  const ownRankName = rank.name;
  const ownCommands = cmds.filter(function(x) { return x.minimumRank === ownRankName; });
  const showComingSoon = ownCommands.length === 0;

  console.log('\n--- ' + rankId + ' (' + rank.name + ') ---');
  console.log('  total cmds:', cmds.length);
  console.log('  executable:', executableCmds.length, '(' + executableCmds.map(function(x) { return x.name; }).join(', ') + ')');
  console.log('  staff features:', staffFeatures.length);
  console.log('  docs:', docsList.length);
  console.log('  own commands:', ownCommands.length, '(' + ownCommands.map(function(x) { return x.name; }).join(', ') + ')');
  console.log('  showComingSoon:', showComingSoon);

  // Call render
  c.renderStaffRole(rankId);
  const html = sharedMain.innerHTML;

  const cmdCardCount = (html.match(/command-card/g) || []).length;
  const featCardCount = (html.match(/staff-feature-card/g) || []).length;
  const docCardCount = (html.match(/doc-card/g) || []).length;

  console.log('  RENDERED: ' + cmdCardCount + ' command-cards, ' + featCardCount + ' feature-cards, ' + docCardCount + ' doc-cards');
  console.log('  Has coming soon:', html.includes('Commands coming soon'));
  console.log('  HTML length:', html.length);

  // Verify consistency
  if (cmdCardCount !== executableCmds.length) {
    console.log('  *** MISMATCH: expected ' + executableCmds.length + ' command cards, got ' + cmdCardCount);
  }
  if (featCardCount !== staffFeatures.length) {
    console.log('  *** MISMATCH: expected ' + staffFeatures.length + ' feature cards, got ' + featCardCount);
  }
  if (docCardCount !== docsList.length) {
    console.log('  *** MISMATCH: expected ' + docsList.length + ' doc cards, got ' + docCardCount);
  }
  if (showComingSoon && !html.includes('Commands coming soon')) {
    console.log('  *** MISMATCH: showComingSoon=true but no "Commands coming soon" in HTML');
  }
  if (!showComingSoon && html.includes('Commands coming soon')) {
    console.log('  *** MISMATCH: showComingSoon=false but "Commands coming soon" IS in HTML');
  }
});

console.log('\n=== Done ===');
