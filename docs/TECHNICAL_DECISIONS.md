# TOOLHUB — Technical Decisions

Format ringkas (ADR). Status: **Accepted** (sudah diputuskan Product Owner), **Proposed** (menunggu persetujuan), **Pending** (menunggu informasi).
Keputusan penting baru ditambahkan di sini, bukan hanya di chat. Sumber kebenaran: repository.

| ID | Keputusan | Status | Dikerjakan di |
|---|---|---|---|
| D-001 | Test otomatis memakai `node:test` + `tsx` | Accepted | Task 1 ✅ |
| D-002 | Percentage Calculator: 2 mode (persentase dari nilai, perubahan persentase) | Accepted | Task 2 |
| D-003 | Image Compressor: output JPEG/PNG/WebP, transparansi PNG/WebP terjaga | Accepted | Task 2 |
| D-004 | Google Fonts di-self-host | Accepted | Task 2 (jadwal perlu dikonfirmasi) |
| D-005 | Kondisi Git dicek lebih dulu oleh Product Owner | Pending | — |
| D-006 | Production build diuji di mesin lokal | Accepted | Setiap review |
| D-007 | `typecheck` dipisah dari `lint`; `tsc` tidak disebut linter | Accepted | Task 1 ✅ |
| D-008 | ESLint sungguhan (butuh dependency baru) | **Proposed** | Menunggu persetujuan |
| D-009 | Logika tool diekstrak ke `src/lib/tool-logic/` dengan characterization tests | Accepted | Task 1 ✅ |
| D-010 | JSON Formatter: parser strict lossless (angka disalin apa adanya) | Implemented, menunggu review | Task 2A |
| D-011 | Base64 decode: standar + URL-safe, padding opsional, validasi ketat | Implemented, menunggu review | Task 2A |
| D-012 | Konvensi validasi input: kosong ≠ 0, format ketat, error spesifik | Implemented, menunggu review | Task 2A |
| D-013 | Text Formatter: trim per baris, Unicode, daftar singkatan pendek | Implemented, menunggu review | Task 2A |
| D-014 | Word Counter: heuristik singkatan sederhana (bukan NLP) | Implemented, menunggu review | Task 2A |

---

### D-001 — `node:test` + `tsx`
- **Konteks:** tidak ada test; `tsx` sudah ada di devDependencies; tidak mau menambah framework.
- **Keputusan:** `npm test` = `node --import tsx --test "src/**/*.test.ts"`. Test ditaruh di samping source (`*.test.ts`), memakai `node:assert/strict`.
- **Konsekuensi:** tanpa dependency baru. Belum ada pengujian komponen React/DOM (butuh jsdom/Testing Library atau Playwright, keputusan terpisah). Perlu Node ≥ 22 (README sudah menyarankan 24 LTS / min 22.12).
- **Catatan lingkungan:** `tsx` memakai `esbuild` berbinary per-OS. `node_modules` hasil `npm install` di Windows tidak bisa dipakai di Linux/Docker; jalankan `npm ci` di platform tujuan.

### D-002 — Percentage Calculator dua mode
Mode A "X% dari Y" (sudah ada) dan Mode B "perubahan persentase dari A ke B". Edge case yang harus ditetapkan saat Task 2: nilai awal 0 pada mode B (pembagian nol), tanda hasil (naik/turun), format desimal. Field kosong harus ditolak, bukan dianggap 0.

### D-003 — Image Compressor multi-format
Pilihan output sederhana: JPEG, PNG, WebP. Transparansi harus terjaga untuk PNG/WebP; untuk JPEG, transparansi diganti latar putih dan pengguna diberi tahu. Hal yang perlu diputuskan saat Task 2: kontrol kualitas (PNG tidak punya parameter kualitas di `canvas.toBlob`), perilaku jika output lebih besar dari input, batas ukuran file/dimensi, dan dukungan WebP encode di browser target (diperiksa dengan fallback).

### D-004 — Self-host fonts
Saat ini `globals.css` memakai `@import` ke `fonts.googleapis.com` (request pihak ketiga, mengirim IP pengunjung). Rencana: `next/font/local` atau berkas WOFF2 di `public/fonts/` untuk DM Sans dan Plus Jakarta Sans, lalu hapus `@import`. Kedua font diterbitkan lewat Google Fonts dan diperkirakan berlisensi SIL OFL (boleh di-self-host); **lisensi harus dikonfirmasi dari sumber resmi font saat implementasi** dan berkas lisensinya disertakan. Perubahan ini menyentuh `globals.css`, `layout.tsx`, dan `public/`.

### D-005 — Git
Arsip audit tidak berisi `.git`. Menunggu hasil pemeriksaan Product Owner. Saran terkait: tambahkan `*.tsbuildinfo` ke `.gitignore` (file `tsconfig.tsbuildinfo` saat ini ikut dalam arsip); jika sudah ter-track, hapus dari index dengan `git rm --cached`.

### D-006 — Build di mesin lokal
Sandbox audit tidak punya network dan memakai binary Windows di `node_modules`, jadi `next build` tidak bisa dijalankan. Setiap review menyertakan output `npm run typecheck`, `npm test`, dan `npm run build` dari mesin Product Owner.

### D-007 — Typecheck ≠ lint
`typecheck` hanya memeriksa tipe. Ia tidak menegakkan aturan gaya, hooks, atau aksesibilitas. Script `lint` lama (alias `tsc`) dihapus. `npm run check` sekarang = `typecheck` + `test`. Script `lint` baru hanya akan ada setelah D-008 disetujui.

### D-008 — ESLint (PROPOSED, menunggu persetujuan)
- **Alasan:** Next.js 16 tidak menyediakan perintah `next lint` (diperiksa: tidak ada CLI-nya di `next@16.4.6` terpasang), sehingga lint harus lewat ESLint langsung. Lint sungguhan menangkap hal yang tidak ditangkap `tsc`: aturan React Hooks, aksesibilitas (`jsx-a11y`, relevan dengan syarat "dapat dipakai dengan keyboard" di Definition of Done), dan praktik Next.js (mis. `<img>` vs `next/image`).
- **Dependency yang diusulkan (devDependencies saja):** `eslint` (v9, flat config) dan `eslint-config-next` (versi mengikuti Next 16.4.x). Daftar plugin transitif dan peer dependency akan diperiksa saat instalasi (belum bisa diverifikasi di sandbox tanpa network).
- **Perubahan kode:** `eslint.config.mjs` (baru), script `"lint": "eslint ."`. Temuan awal kemungkinan berupa warning (mis. `<img>` untuk blob URL di QR/Image Compressor); akan diberi pengecualian beralasan atau diperbaiki dalam task kecil tersendiri, bukan diam-diam.
- **Alternatif tanpa dependency (hanya parsial):** mengaktifkan `noUnusedLocals`/`noUnusedParameters` di `tsconfig.json`. Sudah terverifikasi lulus setelah Task 1, tetapi ini tetap pemeriksaan tipe, bukan lint, dan akan membuat `next build` ikut gagal bila ada variabel tak terpakai.
- **Alternatif lain:** Biome (satu dependency, tanpa plugin React/Next yang setara). Tidak disarankan sekarang.

### D-009 — `src/lib/tool-logic/` + characterization tests
- **Keputusan:** logika murni (tanpa React/DOM/`@/` alias) berada di `src/lib/tool-logic/`, diuji langsung. Modul memakai import relatif tanpa ekstensi.
- **Characterization:** test mengunci perilaku **saat ini**. Perilaku bermasalah yang sudah diketahui ditempatkan dalam blok `describe("… — KNOWN ISSUES (current behavior, may change in Task 2)")`. Saat bug diperbaiki di Task 2, test di blok itu **diubah dan dipindah** ke blok perilaku normal, bukan dihapus.
- **Konsekuensi:** refactor Task 3 (registry + pecah per tool) bisa dilakukan dengan jaring pengaman. `src/lib/ui-wiring.test.ts` membaca source sebagai teks dan dirancang sementara; akan diganti saat Task 3.

---

## Keputusan Task 2A (diimplementasikan, menunggu review Product Owner)

### D-010 — JSON Formatter lossless
- **Masalah:** `JSON.parse` mengubah semua angka menjadi double: `12345678901234567890` → `12345678901234567000`, `1.10` → `1.1`, `-0` → `0`, `1e400` → `null`.
- **Keputusan:** parser JSON strict (RFC 8259) ±200 baris di `json-format.ts` yang membangun pohon kecil di mana angka/`true`/`false`/`null` disimpan sebagai **teks aslinya**, lalu dicetak ulang. Formatting hanya mengubah whitespace. String dan kunci di-encode ulang seperti `JSON.stringify` (ejaan escape dinormalkan, **nilai** tidak berubah). Urutan kunci mengikuti sumber (tidak ada pemindahan kunci bilangan bulat ke depan seperti `JSON.parse`).
- **Alternatif yang ditolak:** (1) `reviver` dengan `context.source` dan `JSON.rawJSON`: belum tersedia di semua browser target; (2) konversi ke `BigInt` lewat regex pra-proses: rapuh dan tetap mengubah `1.10`/`-0`; (3) library: dilarang (tanpa dependency baru).
- **Validasi:** menerima dan menolak input yang sama dengan `JSON.parse`; dibuktikan dengan differential test dan fuzzing (lihat DEVELOPMENT_LOG). Error `SyntaxError` berformat `Invalid JSON at line L, column C: ...` dengan petunjuk untuk kesalahan umum (koma akhir, kutip tunggal, kunci tanpa kutip, `undefined`/`NaN`).
- **Batasan:** (a) kedalaman maksimum 1000 (`MAX_JSON_DEPTH`) karena parser rekursif; `JSON.parse` bisa membaca lebih dalam. Diterima sebagai keterbatasan yang disengaja untuk saat ini (keputusan Product Owner). (b) **Kunci duplikat masih dipadatkan** (nilai terakhir menang, posisi pertama), sama seperti perilaku sebelumnya. Dipertahankan agar test perilaku normal yang ada tidak berubah. Ini keputusan produk terbuka. (c) Seluruh dokumen ada di memori.

### D-011 — Base64 decode
- Encode tidak berubah (standar, ber-padding).
- Decode: alfabet standar (`+/`) **atau** URL-safe (`-_`); padding opsional, tetapi jika ada harus tepat; whitespace ASCII di dalam diabaikan, whitespace Unicode di ujung dipangkas (perilaku lama `trim()`); karakter asing, alfabet campuran, `=` di tengah, dan panjang sisa 1 ditolak. UTF-8 tidak valid punya pesan sendiri.
- Tidak ada opsi encode URL-safe (di luar lingkup).

### D-012 — Konvensi validasi input
Satu aturan untuk Percentage dan Date: **kosong**, **tidak valid**, dan **nol yang sah** adalah tiga keadaan berbeda dengan pesan berbeda; kosong tidak pernah diam-diam menjadi 0.
- Percentage: hanya desimal biasa (`15`, `-3.5`, `.5`, `1e3`). `0x10`, `1,000`, `15,5`, `Infinity` ditolak. (`<input type="number">` sudah menormalkan desimal lokal ke `15.5`.)
- Date: hanya `YYYY-MM-DD` (4–6 digit tahun) yang benar-benar ada di kalender; diurai sebagai UTC tanpa `Date` yang "menggulung" tanggal mustahil; memakai `setUTCFullYear` agar tahun 0–99 tidak dipetakan ke 19xx.
- **Trimming (m5):** Percentage memangkas spasi di awal dan akhir input (`trim`), sehingga `" 200 "` diterima. Date tidak memangkas: `"2026-11-19 "` ditolak sebagai tanggal tidak valid. Ini perilaku saat ini dan tidak diubah di Task 2A. `<input type="date">` tidak menghasilkan spasi, sehingga tidak berdampak pada UI.
- Pesan error yang ada dipertahankan persis (`Enter valid numbers in both fields.`, `Choose both dates first.`).

### D-013 — Text Formatter
- `trim`: hanya memangkas ujung tiap baris; spasi dalam baris dibiarkan.
- Kapitalisasi kalimat memakai `\p{L}` (Unicode) sehingga `étude. égal` → `Étude. Égal`.
- **Singkatan:** daftar pendek `KNOWN_ACRONYMS` (64 entri: teknologi, organisasi, singkatan Indonesia). Hanya mempertahankan ejaan huruf besar yang ada di daftar (juga dengan angka di belakang: `HTML5`); tidak pernah menaikkan huruf kecil menjadi singkatan.
- **Alternatif yang ditolak:** heuristik "kata kapital di teks campuran disengaja". Itu memelihara `ARE` pada `how ARE you` dan melanggar test perilaku normal yang sudah ada.
- **Batasan:** singkatan di luar daftar tetap dihuruf-kecilkan (`ACME` → `Acme`); singkatan bertitik (`U.S.A.`) tidak dikenali; aturan Unicode default (`ß` → `SS`).

### D-014 — Word Counter
- Kata = token berspasi yang memuat huruf/angka/emoji (tanda baca sendirian tidak dihitung).
- Kalimat: `.`/`!`/`?` diikuti spasi/akhir teks, ditambah kutip/kurung penutup. `!`, `?`, dan elipsis selalu mengakhiri kalimat; titik tunggal diabaikan bila bagian dari singkatan: gelar/ekspresi tetap (Mr, Dr, Prof, e.g, i.e, Ir, Hj, Bpk, Jl), label + angka (`No. 5`, `hlm. 10`), inisial huruf kapital tunggal, singkatan "lunak" (etc, dll, Inc) hanya bila kata berikutnya berhuruf kapital, singkatan bertitik. Dialogue tag (`"Really?" she asked.`) satu kalimat. Satuan `ms` (huruf kecil) diperlakukan sebagai singkatan soft: hanya mengakhiri kalimat bila kata berikutnya berhuruf kapital. Gelar `Ms` (huruf kapital) tidak mengakhiri kalimat.
- **Tidak** mengubah: teks tanpa tanda baca akhir tetap 0 kalimat (keputusan produk terbuka).
- **Batasan:** singkatan di luar daftar dihitung akhir kalimat; kalimat yang berakhir dengan satu huruf kapital (`vitamin C.`) dikira inisial. Ini heuristik, bukan NLP.
