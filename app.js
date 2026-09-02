// ============================================================================
// AlwiNation Command Staff — Centralized Data & Application Logic
// ============================================================================

// ----------------------------------------------------------------------------
// STAFF RANKS
// ----------------------------------------------------------------------------
const STAFF_RANKS = [
  {
    id: 'j-helper',
    name: 'J-Helper',
    level: 1,
    title: 'Junior Staff',
    shortDesc: 'Entry-level staff. Assists players and monitors chat.',
    responsibilities: [
      'Membantu player.',
      'Menjawab pertanyaan.',
      'Membantu menjaga chat.',
      'Melaporkan player bermasalah kepada Helper ke atas.',
    ],
  },
  {
    id: 'helper',
    name: 'Helper',
    level: 2,
    title: 'Support Staff',
    shortDesc: 'Handles player issues, moderates chat, and accesses Discord tickets.',
    responsibilities: [
      'Menangani masalah player.',
      'Membantu moderasi chat.',
      'Menangani laporan sederhana.',
      'Membantu J-Helper.',
      'Memiliki akses ticket Discord.',
    ],
  },
  {
    id: 's-helper',
    name: 'S-Helper',
    level: 3,
    title: 'Senior Helper',
    shortDesc: 'Supervises Helpers and handles more complex cases.',
    responsibilities: [
      'Mengawasi Helper.',
      'Menangani kasus yang lebih kompleks.',
      'Membantu Moderator.',
      'Membimbing staff level bawah.',
    ],
  },
  {
    id: 't-moderator',
    name: 'T-Moderator',
    level: 4,
    title: 'Trial Moderator',
    shortDesc: 'Trial-level moderator in training.',
    responsibilities: [
      'Menangani moderasi chat secara langsung.',
      'Menjalani pelatihan moderator.',
      'Membantu Moderator senior.',
    ],
  },
  {
    id: 'moderator',
    name: 'Moderator',
    level: 5,
    title: 'Moderator',
    shortDesc: 'Full moderator with broad authority.',
    responsibilities: [
      'Menangani moderasi chat dan player.',
      'Memberikan punishment tingkat menengah.',
      'Mengawasi staff level bawah.',
    ],
  },
  {
    id: 's-moderator',
    name: 'S-Moderator',
    level: 6,
    title: 'Senior Moderator',
    shortDesc: 'Senior moderator with full authority.',
    responsibilities: [
      'Penanganan kasus kompleks dan punishment berat.',
      'Mengawasi seluruh staff moderator.',
      'Keputusan akhir pada kasus sulit.',
    ],
  },
];

const RANK_BY_ID = Object.fromEntries(STAFF_RANKS.map((r) => [r.id, r]));
const RANK_BY_LEVEL = Object.fromEntries(STAFF_RANKS.map((r) => [r.level, r]));

// ----------------------------------------------------------------------------
// COMMAND TYPES
// ----------------------------------------------------------------------------
const COMMAND_TYPES = ['Minecraft', 'Discord', 'Staff Feature', 'Documentation'];

// ----------------------------------------------------------------------------
// CATEGORIES
// ----------------------------------------------------------------------------
const CATEGORIES = [
  'Punishment',
  'Investigation',
  'Teleportation',
  'Utility',
  'CoreProtect',
  'Ticket Management',
  'Bug Report',
  'Staff',
  'Other',
];

// ----------------------------------------------------------------------------
// COMMANDS — centralized structured data
// All commands: name, aliases, type, category/categories, minimumRank,
// description, usage, examples, notes, permission, instructions
// ----------------------------------------------------------------------------
const COMMANDS = [
  // ---- J-HELPER: Minecraft ----
  {
    id: 'invsee',
    name: '/invsee',
    type: 'Minecraft',
    categories: ['Investigation'],
    minimumRank: 'J-Helper',
    description: 'Untuk melihat atau memantau isi dan pergerakan inventori player.',
    usage: '/invsee <nama>',
    permission: 'invsee',
  },
  {
    id: 'tpo',
    name: '/tpo',
    type: 'Minecraft',
    categories: ['Teleportation'],
    minimumRank: 'J-Helper',
    description: 'Untuk teleport ke player tanpa persetujuan (Instan Teleport).',
    usage: '/tpo <nama>',
    permission: 'tpo',
  },
  {
    id: 'tempmute',
    name: '/tempmute',
    type: 'Minecraft',
    categories: ['Punishment'],
    minimumRank: 'J-Helper',
    description: 'Untuk membisukan player.',
    usage: '/tempmute <nama player> <time> server:<realm> <reason>',
    examples: [
      '/tempmute Abcd1234 3d server:earth Toxic',
    ],
    notes: [
      'Reason tidak perlu ditulis ketika menggunakan command.',
    ],
    permission: 'tempmute',
  },
  {
    id: 'muteadvertise',
    name: '/muteadvertise',
    type: 'Minecraft',
    categories: ['Punishment'],
    minimumRank: 'J-Helper',
    description:
      'Membuat player tidak bisa mengakses command advertisement seperti WTB, WTS, dan ADS.',
    usage: '/muteadvertise <nama player>',
    examples: ['/muteadvertise Abcd1234'],
    permission: 'muteadvertise',
  },
  {
    id: 'co-inspect',
    name: '/co inspect',
    aliases: ['/co i'],
    type: 'Minecraft',
    categories: ['Investigation', 'CoreProtect'],
    minimumRank: 'J-Helper',
    description:
      'Mengaktifkan mode inspeksi untuk memeriksa perubahan blok dan entitas.',
    usage: '/co inspect',
    instructions: [
      'Ketik /co inspect.',
      'Klik kanan atau kiri pada blok atau entitas.',
      'Lihat informasi perubahan.',
      'Informasi dapat menunjukkan player, waktu, dan jenis perubahan.',
      'Ketik /co inspect lagi untuk menonaktifkan mode inspeksi.',
    ],
    permission: 'co.inspect',
  },
  {
    id: 'co-lookup',
    name: '/co lookup',
    aliases: ['/co l'],
    type: 'Minecraft',
    categories: ['Investigation', 'CoreProtect'],
    minimumRank: 'J-Helper',
    description:
      'Digunakan untuk melacak perubahan yang dilakukan oleh pemain atau pada area tertentu.',
    usage: '/co lookup [filters]',
    filters: [
      { filter: 't:[time]', function: 'Waktu perubahan', example: 't:1h' },
      { filter: 'u:[username]', function: 'Player yang terlibat', example: 'u:Steve' },
      { filter: 'r:[radius]', function: 'Radius area', example: 'r:10' },
      { filter: 'a:[action]', function: 'Jenis perubahan', example: 'a:block' },
    ],

    actions: [
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
    ],

    notes: [
      'Gunakan filter t: untuk menentukan rentang waktu (misal: t:1h untuk 1 jam terakhir).',
      'Gunakan filter u: untuk menentukan player yang ingin dilacak.',
      'Gunakan filter r: untuk menentukan radius area pencarian.',
      'Gunakan filter a: untuk menentukan jenis perubahan yang ingin dicari.',
    ],

    examples: ['/co lookup u:Steve t:1h r:10 a:block'],
    permission: 'co.lookup',
  },
  {
    id: 'warn',
    name: '/warn',
    type: 'Minecraft',
    categories: ['Punishment'],
    minimumRank: 'J-Helper',
    description: 'Untuk memberikan peringatan kepada player yang melanggar regulasi.',
    usage: '/warn <nama player> server:<realm> <reason>',
    examples: ['/warn Abcd1234 server:earth Membully anak kecil'],
    notes: ['Reason tidak perlu ditulis ketika menggunakan command.'],
    permission: 'warn',
  },
  {
    id: 'vanish',
    name: '/vanish',
    type: 'Minecraft',
    categories: ['Utility', 'Staff'],
    minimumRank: 'J-Helper',
    description:
      'Khusus Vanilla. Membuat diri kita menjadi tidak terlihat di tab, in-game, dan tidak bisa di-tag oleh player lain.',
    permission: 'vanish',
  },

  // ---- HELPER: Minecraft (adds to J-Helper) ----
  {
    id: 'tempban',
    name: '/tempban',
    type: 'Minecraft',
    categories: ['Punishment'],
    minimumRank: 'Helper',
    description: 'Digunakan untuk memberikan punishment berupa banned sementara.',
    usage: '/tempban <Nick> <Time> <server:> <reason>',
    examples: ['/tempban PertaMaxTurbo 1m server:oneblock toxic'],
    permission: 'tempban',
  },

  // ---- HELPER: Discord Commands ----
  {
    id: 'notes',
    name: '/notes',
    type: 'Discord',
    categories: ['Staff', 'Investigation'],
    minimumRank: 'Helper',
    description:
      'Digunakan untuk berdiskusi dengan staff lain dengan hasil investigasi.',
    permission: 'discord.notes',
  },
  {
    id: 'staffhelp',
    name: '/staffhelp',
    type: 'Discord',
    categories: ['Utility'],
    minimumRank: 'Helper',
    description: 'Digunakan untuk melihat command-command yang ada di Discord.',
    permission: 'discord.staffhelp',
  },
  {
    id: 'ongoing-add',
    name: '/ongoing add',
    type: 'Discord',
    categories: ['Ticket Management'],
    minimumRank: 'Helper',
    description:
      'Digunakan untuk menambahkan tiket ke dalam channel ongoing.',
    permission: 'discord.ongoing.add',
  },
  {
    id: 'ongoing-kirim',
    name: '/ongoing kirim',
    type: 'Discord',
    categories: ['Ticket Management'],
    minimumRank: 'Helper',
    description:
      'Digunakan untuk mengirim data terbaru tiket yang ditambahkan ke daftar ongoing.',
    permission: 'discord.ongoing.kirim',
  },
  {
    id: 'ongoing-delete',
    name: '/ongoing delete',
    type: 'Discord',
    categories: ['Ticket Management'],
    minimumRank: 'Helper',
    description: 'Digunakan untuk menghapus tiket dari daftar ongoing.',
    permission: 'discord.ongoing.delete',
  },
  {
    id: 'bugreport',
    name: '/bugreport',
    type: 'Discord',
    categories: ['Bug Report'],
    minimumRank: 'Helper',
    description: 'Digunakan untuk melaporkan bug yang terjadi di server.',
    permission: 'discord.bugreport',
  },

  // ---- HELPER: Discord Staff Features ----
  {
    id: 'akses-tickets',
    name: 'Akses Tickets',
    type: 'Staff Feature',
    categories: ['Ticket Management'],
    minimumRank: 'Helper',
    description:
      'Para Helper yang sudah naik jabatan dari Junior menjadi Helper akan diberikan akses Tickets untuk membantu staff dan player yang memiliki problem di server.',
  },
  {
    id: 'punishment-log',
    name: 'Punishment Log',
    type: 'Staff Feature',
    categories: ['Investigation'],
    minimumRank: 'Helper',
    description:
      'Untuk melihat track kasus yang pernah dilakukan player agar tidak salah dalam pemberian durasi punishment.',
  },
  {
    id: 'send-payment',
    name: 'Send Payment',
    type: 'Staff Feature',
    categories: ['Utility'],
    minimumRank: 'Helper',
    description:
      'Untuk memberi bukti pembayaran pemayaran pembelian rank/credits via ticket Top-Up.',
  },
  {
    id: 'on-going-ticket',
    name: 'On Going Ticket',
    type: 'Staff Feature',
    categories: ['Ticket Management'],
    minimumRank: 'Helper',
    description: 'Untuk menandai tiket yang belum selesai dikerjakan.',
  },
  {
    id: 'bukti-kepemilikan-akun',
    name: 'Bukti Kepemilikan Akun',
    type: 'Staff Feature',
    categories: ['Staff'],
    minimumRank: 'Helper',
    description:
      'Untuk mendata kepemilikan akun player yang berasal dari tiket.',
  },
  {
    id: 'laporan-claim-ticket',
    name: 'Laporan Claim Ticket',
    type: 'Staff Feature',
    categories: ['Staff'],
    minimumRank: 'Helper',
    description:
      'Untuk mendata tiket apa saja yang dikerjakan oleh staff sebagai bahan evaluasi.',
  },

  // ---- DOCUMENTATION ----
  {
    id: 'coreprotect-guide',
    name: 'CoreProtect Investigation Guide',
    type: 'Documentation',
    categories: ['CoreProtect', 'Investigation'],
    minimumRank: 'J-Helper',
    description:
      'Panduan lengkap penggunaan /co inspect dan /co lookup untuk investigasi perubahan di server.',
    isDocumentation: true,
  },
  {
    id: 'java-bedrock',
    name: 'Java & Bedrock Player Name',
    type: 'Documentation',
    categories: ['Utility'],
    minimumRank: 'J-Helper',
    description:
      'Penjelasan perbedaan format nama player antara Java Edition dan Bedrock Edition.',
    isDocumentation: true,
  },
  {
    id: 'server-realm',
    name: 'Server Parameter',
    type: 'Documentation',
    categories: ['Utility'],
    minimumRank: 'J-Helper',
    description: 'Penjelasan parameter server:<realm> dan pengaruhnya terhadap punishment.',
    isDocumentation: true,
  },
];

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

function rankLevel(rankId) {
  const r = RANK_BY_ID[rankId];
  if (r) return r.level;
  // fallback: match by display name
  const byName = STAFF_RANKS.find((s) => s.name === rankId);
  return byName ? byName.level : 99;
}

function canUseCommand(rankId, command) {
  const userLevel = rankLevel(rankId);
  const cmdLevel = rankLevel(command.minimumRank);
  return userLevel >= cmdLevel;
}

function getCommandsForRank(rankId) {
  return COMMANDS.filter((cmd) => canUseCommand(rankId, cmd));
}

function getCommandsByType(type) {
  return COMMANDS.filter((cmd) => cmd.type === type);
}

function getCommandsByCategory(category) {
  return COMMANDS.filter((cmd) => cmd.categories.includes(category));
}

function getCommandsByRankAndType(rankId, type) {
  return getCommandsForRank(rankId).filter((cmd) => cmd.type === type);
}

function getAvailableRanksForCommand(command) {
  const cmdLevel = rankLevel(command.minimumRank);
  return STAFF_RANKS.filter((r) => r.level >= cmdLevel);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function commandUrl(command) {
  return '/command/' + slugify(command.name);
}

function findCommandBySlug(slug) {
  return COMMANDS.find((cmd) => slugify(cmd.name) === slug);
}

function countCommandsForRank(rankId) {
  return getCommandsForRank(rankId).length;
}

function totalCommands() {
  return COMMANDS.length;
}

function countByType(type) {
  return COMMANDS.filter((c) => c.type === type).length;
}

// ----------------------------------------------------------------------------
// SEARCH
// ----------------------------------------------------------------------------
function searchCommands(query) {
  if (!query || query.trim() === '') return [];
  const q = query.toLowerCase().trim();
  // Minimum length 3 for fuzzy matching to avoid excessive false positives
  const canFuzzy = q.length >= 3;
  return COMMANDS.filter((cmd) => {
    // Name (always check)
    if (cmd.name.toLowerCase().includes(q)) return true;
    // Aliases
    if (cmd.aliases && cmd.aliases.some((a) => a.toLowerCase().includes(q)))
      return true;
    // For short queries (< 3 chars), only match name/aliases
    if (!canFuzzy) return false;
    // Description
    if (cmd.description.toLowerCase().includes(q)) return true;
    // Categories
    if (cmd.categories.some((c) => c.toLowerCase().includes(q))) return true;
    // Minimum rank
    if (cmd.minimumRank.toLowerCase().includes(q)) return true;
    // Usage
    if (cmd.usage && cmd.usage.toLowerCase().includes(q)) return true;
    // Permission
    if (cmd.permission && cmd.permission.toLowerCase().includes(q)) return true;
    // Examples
    if (cmd.examples && cmd.examples.some((e) => e.toLowerCase().includes(q)))
      return true;
    // Type
    if (cmd.type.toLowerCase().includes(q)) return true;
    return false;
  });
}

// ----------------------------------------------------------------------------
// COPY TO CLIPBOARD
// ----------------------------------------------------------------------------
function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(resolve)
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  });
}

function fallbackCopy(text) {
  return new Promise((resolve) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (e) {
      resolve();
    }
    document.body.removeChild(ta);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

// Export for clarity (not a real module, but documents the API)
if (typeof window !== 'undefined') {
  window.ALWINA = {
    STAFF_RANKS,
    RANK_BY_ID,
    RANK_BY_LEVEL,
    COMMANDS,
    CATEGORIES,
    COMMAND_TYPES,
    canUseCommand,
    getCommandsForRank,
    getCommandsByType,
    getCommandsByCategory,
    getCommandsByRankAndType,
    getAvailableRanksForCommand,
    countCommandsForRank,
    totalCommands,
    countByType,
    searchCommands,
    copyToClipboard,
    showToast,
    commandUrl,
    findCommandBySlug,
    slugify,
  };
}
