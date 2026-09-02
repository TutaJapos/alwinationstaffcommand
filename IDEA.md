# ALWINATION COMMAND STAFF — WEBSITE DEVELOPMENT PROMPT

Build a complete, modern, responsive web application called:

# **AlwiNation Command Staff**

A professional **Minecraft Staff Command Documentation & Management Dashboard** for the AlwiNation Minecraft Server.

The website should feel like a combination of:

* Minecraft Staff Wiki
* Command Documentation
* Staff Dashboard
* Internal Knowledge Base

Do NOT make it look like a generic Minecraft server website.

The design should be **dark, modern, professional, clean, minimal, and easy to navigate**.

---

# CORE USER FLOW

The main user experience must follow this flow:

**Dashboard → Select Staff Rank → View Commands → Select Command → View Command Details → Copy Command / Follow Usage Guide**

Example:

```text
Dashboard
    ↓
J-Helper
    ↓
J-Helper Commands
    ↓
/co lookup
    ↓
Command Details
    ↓
Usage + Examples + Filters + Notes
```

A staff member should be able to understand a command without needing to ask another staff member.

---

# STAFF HIERARCHY

The AlwiNation staff hierarchy is:

```text
J-Helper
   ↓
Helper
   ↓
S-Helper
   ↓
T-Moderator
   ↓
Moderator
   ↓
S-Moderator
```

Rank levels:

| Level | Rank        |
| ----- | ----------- |
| 1     | J-Helper    |
| 2     | Helper      |
| 3     | S-Helper    |
| 4     | T-Moderator |
| 5     | Moderator   |
| 6     | S-Moderator |

Use rank inheritance.

For example:

If a command requires **J-Helper**, then:

```text
J-Helper      ✓
Helper        ✓
S-Helper      ✓
T-Moderator   ✓
Moderator     ✓
S-Moderator   ✓
```

If a command requires **Helper**:

```text
J-Helper      🔒
Helper        ✓
S-Helper      ✓
T-Moderator   ✓
Moderator     ✓
S-Moderator   ✓
```

Do NOT show higher-level commands as usable by lower ranks.

---

# WEBSITE STRUCTURE

Create the following pages:

```text
/
├── Dashboard
├── Commands
│   ├── All Commands
│   ├── Minecraft Commands
│   └── Discord Commands
├── Staff Roles
│   ├── J-Helper
│   ├── Helper
│   ├── S-Helper
│   ├── T-Moderator
│   ├── Moderator
│   └── S-Moderator
├── Categories
├── Documentation
│   ├── CoreProtect
│   ├── Java & Bedrock
│   └── Server / Realm
└── About
```

---

# 1. DASHBOARD

The dashboard should immediately communicate what the website is for.

Hero:

```text
ALWINATION

COMMAND STAFF
```

Subtitle:

```text
Your complete command reference for AlwiNation Staff.
```

Description:

```text
Quickly find commands, understand their usage,
check staff permissions, and follow investigation procedures.
```

Primary buttons:

```text
[ Browse Commands ]
[ Staff Roles ]
```

---

## Dashboard Statistics

Create dynamic statistics cards:

```text
Total Commands
Minecraft Commands
Discord Commands
Staff Roles
Categories
```

The values must automatically update based on the command data.

Do NOT hard-code statistics.

---

## Quick Staff Access

Create six large rank cards:

```text
J-HELPER
Junior Staff

HELPER
Support Staff

S-HELPER
Senior Helper

T-MODERATOR
Trial Moderator

MODERATOR
Moderator

S-MODERATOR
Senior Moderator
```

Each card should contain:

* Rank
* Rank number
* Short description
* Number of available commands
* "View Commands" button

Clicking the card should navigate to that rank's command page.

---

# 2. RANK COMMAND PAGE

When the user clicks:

**J-Helper**

open:

```text
J-HELPER COMMANDS
```

Show a header:

```text
J-Helper
Junior Staff

Commands available for J-Helper and above.
```

Then display all commands available to that rank.

For J-Helper:

```text
/invsee
/tpo
/tempmute
/muteadvertise
/co inspect
/co lookup
/warn
/vanish
```

For Helper:

```text
All J-Helper commands

+

/tempban

Discord Staff Features
Discord Commands
```

---

# 3. COMMAND CARDS

Each command should be displayed as a modern card.

Example:

```text
┌─────────────────────────────────────┐
│ /co lookup                    J-HELPER│
│                                     │
│ Investigation • CoreProtect         │
│                                     │
│ Track changes made by players or    │
│ changes within a specific area.    │
│                                     │
│ Minimum Rank: J-Helper              │
│                                     │
│ [ View Details ]      [ Copy ]      │
└─────────────────────────────────────┘
```

Command cards should support:

* Hover animation
* Click interaction
* Copy button
* Rank badge
* Category badge
* Search
* Filtering

---

# 4. COMMAND DETAIL PAGE

Every command must have a dedicated detail view.

Example:

# `/co lookup`

Badge:

```text
J-HELPER+
```

Category:

```text
Investigation
CoreProtect
```

Description:

```text
Digunakan untuk melacak perubahan yang dilakukan oleh pemain
atau perubahan pada area tertentu.
```

---

## Usage

Display:

```text
/co lookup [filters]
```

Use a code block with a copy button.

---

## Filters

Show:

| Filter         | Function             | Example   |
| -------------- | -------------------- | --------- |
| `t:[time]`     | Waktu perubahan      | `t:1h`    |
| `u:[username]` | Player yang terlibat | `u:Steve` |
| `r:[radius]`   | Radius area          | `r:10`    |
| `a:[action]`   | Jenis perubahan      | `a:block` |

---

## Example

```text
/co lookup u:Steve t:1h r:10 a:block
```

Add:

```text
[ Copy Example ]
```

---

## Notes

Display important notes inside an information/warning box.

---

## Available Ranks

Display:

```text
J-Helper       ✓
Helper         ✓
S-Helper       ✓
T-Moderator    ✓
Moderator      ✓
S-Moderator    ✓
```

---

# 5. SEARCH SYSTEM

Add a global command search.

Search placeholder:

```text
Search commands...
```

Keyboard shortcut:

```text
Ctrl + K
```

Search should support:

* Command name
* Alias
* Description
* Category
* Rank
* Permission
* Usage

Example:

Searching:

```text
ban
```

could return:

```text
/tempban
/ban
```

Searching:

```text
coreprotect
```

returns:

```text
/co inspect
/co lookup
```

---

# 6. COMMAND FILTER

Provide filters:

### Rank

```text
All
J-Helper
Helper
S-Helper
T-Moderator
Moderator
S-Moderator
```

### Type

```text
All
Minecraft
Discord
Staff Feature
```

### Category

```text
All
Punishment
Investigation
Teleportation
Utility
CoreProtect
Ticket Management
Bug Report
Staff
Other
```

Filters must work together.

---

# 7. J-HELPER COMMAND DATA

Add the following commands as official AlwiNation J-Helper commands.

---

## `/invsee`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Investigation
```

Description:

```text
Untuk melihat atau memantau isi dan pergerakan inventori player.
```

---

## `/tpo <nama>`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Teleportation
```

Description:

```text
Untuk teleport ke player tanpa persetujuan (Instan Teleport).
```

Usage:

```text
/tpo <nama>
```

---

## `/tempmute`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Punishment
```

Description:

```text
Untuk membisukan player.
```

---

## `/muteadvertise`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Punishment
```

Description:

```text
Membuat player tidak bisa mengakses command advertisement
seperti WTB, WTS, dan ADS.
```

Usage:

```text
/muteadvertise <nama player>
```

---

## `/co inspect`

Aliases:

```text
/co i
```

Minimum Rank:

```text
J-Helper
```

Category:

```text
Investigation
CoreProtect
```

Description:

```text
Mengaktifkan mode inspeksi untuk memeriksa perubahan blok dan entitas.
```

Usage:

```text
/co inspect
```

Instructions:

```text
1. Ketik /co inspect.
2. Klik kanan atau kiri pada blok atau entitas.
3. Lihat informasi perubahan.
4. Informasi dapat menunjukkan player, waktu, dan jenis perubahan.
5. Ketik /co inspect lagi untuk menonaktifkan mode inspeksi.
```

---

# `/co lookup`

Aliases:

```text
/co l
```

Minimum Rank:

```text
J-Helper
```

Category:

```text
Investigation
CoreProtect
```

Description:

```text
Digunakan untuk melacak perubahan yang dilakukan oleh pemain
atau pada area tertentu.
```

Usage:

```text
/co lookup [filters]
```

Supported filters:

```text
t:[time]
u:[username]
r:[radius]
a:[action]
```

Example:

```text
/co lookup u:Steve t:1h r:10 a:block
```

---

# COREPROTECT ACTION DOCUMENTATION

Create a dedicated documentation page:

# CoreProtect Investigation Guide

Explain `/co inspect` and `/co lookup`.

Create expandable sections for the following actions.

### Block

```text
a:block
```

Blok yang diletakkan/dihancurkan.

```text
a:+block
```

Blok yang diletakkan.

```text
a:-block
```

Blok yang dihancurkan.

### Chat

```text
a:chat
```

Pesan yang dikirim di chat.

### Click

```text
a:click
```

Interaksi pemain.

### Command

```text
a:command
```

Perintah yang digunakan.

### Container

```text
a:container
```

Item diambil atau dimasukkan ke peti.

```text
a:+container
```

Item dimasukkan ke peti.

```text
a:-container
```

Item diambil dari peti.

### Inventory

```text
a:inventory
```

Item ditambahkan atau dihapus dari inventori pemain.

```text
a:+inventory
```

Item ditambahkan ke inventori.

```text
a:-inventory
```

Item dihapus dari inventori.

### Item

```text
a:item
```

Item dijatuhkan, dilempar, diambil, disimpan, atau ditarik oleh pemain.

```text
a:+item
```

Item diambil atau ditarik.

```text
a:-item
```

Item dijatuhkan, dilempar, atau disimpan.

### Kill

```text
a:kill
```

Mobs atau hewan yang dibunuh.

### Session

```text
a:session
```

Pemain login/logout.

```text
a:+session
```

Pemain login.

```text
a:-session
```

Pemain logout.

### Sign

```text
a:sign
```

Pesan yang ditulis di papan.

### Username

```text
a:username
```

Perubahan nama pengguna.

---

# `/warn`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Punishment
```

Description:

```text
Untuk memberikan peringatan kepada player yang melanggar regulasi.
```

Usage:

```text
/warn <nama player> server:<realm> <reason>
```

Important:

`Reason:` tidak perlu ditulis ketika menggunakan command.

Example:

```text
/warn Abcd1234 server:earth Membully anak kecil
```

---

# `/tempmute`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Punishment
```

Usage:

```text
/tempmute <nama player> <time> server:<realm> <reason>
```

Important:

`Reason:` tidak perlu ditulis.

Example:

```text
/tempmute Abcd1234 3d server:earth Toxic
```

---

# `/muteadvertise`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Punishment
```

Usage:

```text
/muteadvertise <nama player>
```

Example:

```text
/muteadvertise Abcd1234
```

---

# `/vanish`

Minimum Rank:

```text
J-Helper
```

Category:

```text
Staff / Utility
```

Description:

```text
Khusus Vanilla.

Membuat diri kita menjadi tidak terlihat di tab,
in-game, dan tidak bisa di-tag oleh player lain.
```

---

# 8. HELPER COMMAND DATA

Add:

# `/tempban`

Minimum Rank:

```text
Helper
```

Category:

```text
Punishment
```

Description:

```text
Digunakan untuk memberikan punishment berupa banned sementara.
```

Usage:

```text
/tempban <Nick> <Time> <server: > <reason>
```

Example:

```text
/tempban PertaMaxTurbo 1m server:oneblock toxic
```

---

# 9. HELPER DISCORD FEATURES

Create a dedicated section:

# Helper Discord Features

These features become available when a J-Helper is promoted to Helper.

---

## Akses Tickets

Description:

```text
Para Helper yang sudah naik jabatan dari Junior menjadi Helper
akan diberikan akses Tickets untuk membantu staff dan player
yang memiliki problem di server.
```

---

## Punishment Log

Description:

```text
Untuk melihat track kasus yang pernah dilakukan player
agar tidak salah dalam pemberian durasi punishment.
```

---

## Send Payment

Description:

```text
Untuk memberi bukti pembayaran pembelian rank/credits
via ticket Top-Up.
```

---

## On Going Ticket

Description:

```text
Untuk menandai tiket yang belum selesai dikerjakan.
```

---

## Bukti Kepemilikan Akun

Description:

```text
Untuk mendata kepemilikan akun player yang berasal dari tiket.
```

---

## Laporan Claim Ticket

Description:

```text
Untuk mendata tiket apa saja yang dikerjakan oleh staff
sebagai bahan evaluasi.
```

---

# 10. HELPER DISCORD COMMANDS

Add the following Discord commands.

---

## `/notes`

Category:

```text
Investigation / Staff
```

Description:

```text
Digunakan untuk berdiskusi dengan staff lain
dengan hasil investigasi.
```

---

## `/staffhelp`

Category:

```text
Utility
```

Description:

```text
Digunakan untuk melihat command-command yang ada di Discord.
```

---

## `/ongoing add`

Category:

```text
Ticket Management
```

Description:

```text
Digunakan untuk menambahkan tiket ke dalam channel ongoing.
```

---

## `/ongoing kirim`

Category:

```text
Ticket Management
```

Description:

```text
Digunakan untuk mengirim data terbaru tiket yang ditambahkan
ke daftar ongoing.
```

---

## `/ongoing delete`

Category:

```text
Ticket Management
```

Description:

```text
Digunakan untuk menghapus tiket dari daftar ongoing.
```

---

## `/bugreport`

Category:

```text
Bug Report
```

Description:

```text
Digunakan untuk melaporkan bug yang terjadi di server.
```

---

# 11. JAVA & BEDROCK DOCUMENTATION

Create documentation:

# Java & Bedrock Player Name

Explain the difference clearly.

Java:

```text
Abcd1234
```

Bedrock:

```text
.Abcd1234
```

Create a prominent warning:

> Perhatikan titik sebelum nama player Bedrock. Jika lupa menggunakan titik, command dapat tidak berpengaruh atau berpotensi mengenai akun lain.

Add examples:

```text
Java:
 /warn Abcd1234 server:earth Toxic

Bedrock:
 /warn .Abcd1234 server:earth Toxic
```

---

# 12. SERVER / REALM DOCUMENTATION

Create:

# Server Parameter

Supported server values:

```text
server:tycoon
server:oneblock
server:survival
server:survival2
server:earth
server:vanilla:lobby
server:survivalwar
```

Explain:

```text
Tanpa server:<realm> = Global
```

Example:

```text
/warn Steve Toxic
```

Global punishment.

Example:

```text
/warn Steve server:earth Toxic
```

Earth-specific punishment.

---

# 13. COMMAND TYPE

Every command must have a type:

```text
Minecraft
Discord
Staff Feature
Documentation
```

Examples:

```text
/warn
Minecraft

/notes
Discord

Akses Tickets
Staff Feature

CoreProtect Action List
Documentation
```

---

# 14. STAFF ROLE PAGE

Each staff role gets its own page.

Example:

# J-Helper

```text
LEVEL 1
JUNIOR STAFF
```

Responsibilities:

* Membantu player.
* Menjawab pertanyaan.
* Membantu menjaga chat.
* Melaporkan player bermasalah kepada Helper ke atas.

Command count should be dynamic.

---

# Helper

```text
LEVEL 2
SUPPORT STAFF
```

Responsibilities:

* Menangani masalah player.
* Membantu moderasi chat.
* Menangani laporan sederhana.
* Membantu J-Helper.
* Memiliki akses ticket Discord.

---

# S-Helper

```text
LEVEL 3
SENIOR HELPER
```

Responsibilities:

* Mengawasi Helper.
* Menangani kasus yang lebih kompleks.
* Membantu Moderator.
* Membimbing staff level bawah.

Display:

```text
Commands coming soon.
```

Do not invent commands.

---

# T-Moderator

```text
LEVEL 4
TRIAL MODERATOR
```

Display:

```text
Commands coming soon.
```

---

# Moderator

```text
LEVEL 5
MODERATOR
```

Display:

```text
Commands coming soon.
```

---

# S-Moderator

```text
LEVEL 6
SENIOR MODERATOR
```

Display:

```text
Commands coming soon.
```

---

# 15. COMMAND DATABASE

Do NOT hard-code commands directly inside UI components.

Use centralized structured data.

Example:

```ts
interface Command {
  id: string;
  name: string;
  aliases?: string[];
  type: "Minecraft" | "Discord" | "Staff Feature";
  category: string;
  minimumRank: StaffRank;
  description: string;
  usage?: string;
  examples?: string[];
  notes?: string[];
  permission?: string;
}
```

Staff rank:

```ts
type StaffRank =
  | "J-Helper"
  | "Helper"
  | "S-Helper"
  | "T-Moderator"
  | "Moderator"
  | "S-Moderator";
```

This is important because additional commands will be added later.

---

# 16. FUTURE COMMAND SUPPORT

The architecture must make it extremely easy to add new commands.

For example, adding:

```text
/ban
```

should only require adding a new object to the command dataset.

The UI, statistics, filters, search, rank pages, and command counts should automatically recognize it.

---

# 17. COPY SYSTEM

Every command usage and example must have:

```text
[ Copy ]
```

When clicked:

```text
Copied!
```

Show a small toast notification.

Support copying:

* Command usage
* Command examples
* CoreProtect filters
* Server parameters

---

# 18. BREADCRUMB

Command detail pages should have breadcrumbs:

```text
Dashboard
/
J-Helper
/
Commands
/
CoreProtect
/
co lookup
```

This makes navigation easy.

---

# 19. SIDEBAR

Desktop sidebar:

```text
ALWINATION
Command Staff

⌂ Dashboard

COMMANDS
▣ All Commands
▣ Minecraft
▣ Discord

STAFF
♟ Staff Roles

DOCUMENTATION
▤ CoreProtect
▤ Java & Bedrock
▤ Server / Realm

ⓘ About
```

Mobile should use a responsive drawer.

---

# 20. DESIGN SYSTEM

Use a professional dark UI.

Background:

Very dark charcoal / black.

Cards:

Dark gray.

Borders:

Subtle.

Accent:

Use an AlwiNation-inspired accent color.

Typography:

Modern sans-serif.

Use monospace font for commands.

Command blocks should visually resemble developer documentation.

---

# 21. ANIMATIONS

Use subtle animations only:

* Fade-in
* Slide-in
* Hover elevation
* Button transitions
* Toast notifications
* Smooth page transitions

Do NOT use excessive animations.

Do NOT use excessive Minecraft pixel art.

The website should look like a professional internal administration tool.

---

# 22. RESPONSIVE DESIGN

Desktop:

```text
Sidebar | Main Content
```

Tablet:

Collapsible sidebar.

Mobile:

```text
Top Navbar
↓
Content
```

Cards should become one-column on mobile.

Command detail pages must remain easy to read on mobile.

---

# 23. IMPORTANT DATA RULE

The following commands are currently official data:

### J-Helper

```text
/invsee
/tpo
/tempmute
/muteadvertise
/co inspect
/co lookup
/warn
/vanish
```

### Helper

```text
/tempban
```

### Helper Discord

```text
/notes
/staffhelp
/ongoing add
/ongoing kirim
/ongoing delete
/bugreport
```

### Helper Discord Features

```text
Akses Tickets
Punishment Log
Send Payment
On Going Ticket
Bukti Kepemilikan Akun
Laporan Claim Ticket
```

Do NOT invent additional AlwiNation commands.

For higher ranks:

```text
S-Helper
T-Moderator
Moderator
S-Moderator
```

show:

```text
Commands coming soon.
```

until actual commands are provided.

---

# 24. FINAL EXPERIENCE

The finished website should feel like an internal AlwiNation Staff platform.

A J-Helper should be able to open the website and immediately understand:

```text
What commands can I use?
        ↓
What does this command do?
        ↓
How do I use it?
        ↓
What is the correct format?
        ↓
What example should I use?
        ↓
Does it work globally or on a specific realm?
        ↓
Is the player Java or Bedrock?
```

A Helper should additionally be able to understand:

```text
What Discord features do I have?
What ticket features can I access?
What Discord commands can I use?
How do I manage ongoing tickets?
How do I report bugs?
```

The website should ultimately become the **single source of truth for AlwiNation Staff commands and procedures**.

Build the application with clean reusable components, centralized data, scalable architecture, responsive design, and a polished professional UI.
