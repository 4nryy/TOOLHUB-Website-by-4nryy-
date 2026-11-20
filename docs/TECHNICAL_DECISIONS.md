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
