# TOOLHUB — Testing Guide

## Menjalankan

```bash
npm install            # sekali, di mesin yang sama dengan tempat test dijalankan
npm run typecheck      # tsc --noEmit — hanya pemeriksaan tipe, BUKAN linter
npm test               # node:test lewat tsx (semua src/**/*.test.ts)
npm run check          # typecheck + test
npm run build          # production build (dijalankan manual di mesin lokal, bukan bagian check)
```

Persyaratan: Node.js 22.12+ (disarankan 24 LTS), npm. Jalankan satu file saja:

```bash
node --import tsx --test src/lib/tool-logic/json-format.test.ts
```

Filter berdasarkan nama test: `node --import tsx --test --test-name-pattern="leap" "src/**/*.test.ts"`

**Lint sungguhan belum ada.** Menunggu persetujuan dependency ESLint (lihat `docs/TECHNICAL_DECISIONS.md`, D-008). Jangan menyebut `npm run typecheck` sebagai lint.

Jika muncul error `You installed esbuild for another platform`: `node_modules` berasal dari OS lain. Hapus `node_modules` lalu `npm ci` di OS yang sekarang dipakai.

## Struktur dan konvensi

| Lokasi | Isi |
|---|---|
| `src/lib/tool-logic/*.ts` | Logika murni tiap tool (tanpa React/DOM). Test di sampingnya: `*.test.ts` |
| `src/lib/tools.test.ts` | Integritas registry: tepat 12 slug, unik, kategori valid, `getTool` |
| `src/lib/client-storage.test.ts` | Favorites/Recent/demo user dengan `window.localStorage` palsu |
| `src/lib/ui-wiring.test.ts` | Smoke check berbasis teks: setiap slug punya cabang UI dan ikon (sementara; diganti di Task 3) |

- Gunakan `node:test` (`describe`/`it`) dan `node:assert/strict`.
- Import relatif tanpa ekstensi di dalam `tool-logic/` (tidak memakai alias `@/`).
- **Deterministik:** jangan bergantung pada zona waktu, locale mesin, atau jam. Fungsi yang memformat angka menerima parameter `locale` opsional; test memakai `"en-US"`.
- Satu perilaku per `it`; nama test menjelaskan perilaku, bukan implementasi.
- Setiap fungsi baru minimal diuji untuk: kasus normal, input kosong, input tidak valid, dan batas/edge case relevan.

### Blok "KNOWN ISSUES" dan "KNOWN LIMITATIONS"
- **KNOWN ISSUES (still open):** perilaku yang diketahui bermasalah dan belum diperbaiki, dikunci apa adanya. Itu **bukan** pernyataan bahwa perilakunya benar. Saat diperbaiki: ubah assertion ke perilaku yang benar dan pindahkan ke blok perilaku normal.
- **KNOWN LIMITATIONS (documented):** batas desain yang disengaja dan terdokumentasi di `docs/TECHNICAL_DECISIONS.md` (mis. singkatan di luar daftar, kunci duplikat JSON).
- Jangan menghapus satu blok utuh saat memperbaiki satu bug; periksa tiap test di dalamnya.

### Test `todo`
Test dengan opsi `{ todo: "alasan" }` dilaporkan sebagai TODO. Di sandbox, runner Node bawaan keluar dengan exit 0, tetapi validasi lokal Product Owner melaporkan `npm test` keluar dengan exit code 1 (penyebabnya belum diselidiki; di luar lingkup Task 2A). Saat ini tidak ada test `todo`: ikon kategori Documents dan Business sudah diperbaiki di Task 2B Phase 1 dan dicakup test nyata.

## Cakupan saat ini (355 test; 355 pass, 0 todo, sandbox, Task 2B Phase 1 revisi R1)

| File uji | Fungsi / area | Jumlah |
|---|---|---:|
| `base64.test.ts` | `base64Encode`, `base64Decode` (standar/URL-safe, padding, malformed; oracle: `Buffer`) | 30 |
| `text-format.test.ts` | `formatText` (6 mode, Unicode, singkatan, idempotensi) | 46 |
| `word-stats.test.ts` | `getWordStats` (kata, kalimat, singkatan, kutip, satuan `ms`) | 40 |
| `percentage.test.ts` | `calculatePercentageOf`, `parseDecimalInput` | 26 |
| `date-diff.test.ts` | `parseIsoDate`, `diffInDays`, `calculateDateDifference` | 32 |
| `json-format.test.ts` | `formatJson` (lossless, error, batas, differential vs `JSON.parse`) | 43 |
| `uuid.test.ts` | `clampUuidCount`, `generateUuids` | 8 |
| `invoice.test.ts` | `calculateInvoiceTotal` | 8 |
| `format-bytes.test.ts` | `formatBytes` | 8 |
| `tools.test.ts` | registry `tools`, `categories`, `getTool` | 10 |
| `client-storage.test.ts` | favorites, recent, demo user, SSR, kegagalan tulis/baca, storage diblokir, status per jenis data (5 skenario + isolasi) | 37 |
| `ui-wiring.test.ts` | 12 cabang UI + 12 ikon tool + 12 ikon kategori + 2 guard | 33 |
| `tool-icons.test.ts` | registry ikon, Documents/Business, kelas warna kategori dan aturan CSS | 34 |

### Differential test
`json-format.test.ts` memakai `JSON.parse`/`JSON.stringify` bawaan sebagai oracle: dokumen acak (seed tetap, jadi reproducible) harus tercetak identik, dan input hasil mutasi harus diterima/ditolak sama persis. `base64.test.ts` memakai `Buffer` Node sebagai oracle. Jika test ini gagal, `console` menampilkan input penyebabnya; salin ke test regresi tersendiri.

## Yang BELUM diuji otomatis
- Image Compressor, PDF Merger, QR Generator (butuh canvas/File/Blob browser; logika masih di `ToolWorkspace.tsx`).
- Timer Pomodoro (efek `setInterval` di komponen).
- Interaksi UI (klik, input, download, print), aksesibilitas, tampilan responsif.
- Route `GET /api/v1/tools`, halaman Next.js, dan `next build`.
- Prisma/database (belum terhubung).

## Checklist QA manual (browser) per rilis
Jalankan `npm run dev`, buka tiap tool, dan periksa: kasus normal, input kosong, input tidak valid (pesan jelas), hasil bisa di-copy/di-download, layout mobile, navigasi keyboard dasar.

| Tool | Periksa khusus |
|---|---|
| Word Counter / Text Formatter / JSON / Base64 | Teks panjang, emoji, JSON tidak valid, Base64 tidak valid |
| UUID | Jumlah 1–100, copy, unduh `.txt` |
| QR | URL panjang, unduh PNG, scan dengan ponsel |
| Image Compressor | JPG/PNG/WebP, PNG transparan, gambar sangat besar, ukuran sebelum/sesudah |
| PDF Merger | 2+ PDF, urutan hasil, PDF terenkripsi/rusak |
| Percentage / Date | Nol, negatif, desimal, rentang lintas tahun kabisat |
| Pomodoro | Start/pause/reset, ganti mode, tab di latar |
| Invoice | Print → Save as PDF, hanya pratinjau invoice yang tercetak |
| Favorites/Recent/Dashboard | Muat ulang halaman, localStorage dihapus manual |

## Status validasi

Riwayat dipisah per task dan per sumber. Jangan mencampur angka dari sumber yang berbeda.

### Sumber hasil
- **Sandbox:** Linux, Node 22.23.5, tanpa network, tanpa browser. Runner: Node bawaan + resolver sementara di luar repo. Tidak bisa menjalankan `npm test` (tsx) atau `npm run build` karena binary `esbuild` untuk `win32-x64` dan `next` tanpa izin eksekusi.
- **Lokal Product Owner:** dijalankan Product Owner di mesinnya. Hanya hasil run itu yang berlaku sebagai validasi lokal.
- **Browser manual:** uji oleh tangan di browser sesuai checklist.

### Riwayat per task

| Task | Sumber | Hasil | Catatan |
|---|---|---|---|
| Task 1 | Sandbox | Lihat `DEVELOPMENT_LOG.md` entri Task 1 | Di-commit `afea53b` |
| Task 2A | Lokal PO (sebelum perbaikan self-review) | typecheck PASS, build PASS, test 293 pass, 0 fail, 1 todo; exit code 1 dilaporkan | Penyebab exit 1 belum diselidiki (di luar lingkup 2A) |
| Task 2A | Sandbox (setelah perbaikan self-review) | 294 pass, 0 fail, 1 todo (exit 0, runner Node) | Tidak mengganti hasil lokal PO |
| Task 2A | Lokal PO untuk commit `8e866d2` | **Tidak tercatat di dokumen ini** | Di-commit dan di-push |
| Task 2B Phase 1 (awal) | Sandbox | 346 pass, 0 fail, 0 todo | Digantikan R1 |
| Task 2B Phase 1 R1 | Sandbox | **355 pass, 0 fail, 0 todo** (exit 0). typecheck exit 0. `npm test` exit 1 (esbuild). `npm run build` exit 127 (next) | Lihat `DEVELOPMENT_LOG.md` |
| Task 2B Phase 1 R1 | Lokal PO | **Belum dijalankan** | Perlu: typecheck, test, build, `git diff --check` |
| Task 2B Phase 1 R1 | Browser manual | **Belum dilakukan** | Lihat "Pengujian manual" |

Lima skenario status per jenis data (favorites gagal, recent gagal, demo user gagal, semua gagal, pemulihan) ada di `client-storage.test.ts`. Mereka tercakup oleh sandbox, belum oleh validasi lokal.

## Pengujian manual: localStorage gagal (Task 2B Phase 1 R1)

Automated test memverifikasi fungsi storage. Perilaku UI harus diuji di browser. Catat hasil per langkah. **Status: belum dilakukan.**

1. Blokir penyimpanan situs ini di pengaturan browser (atau DevTools), lalu muat ulang.
2. Homepage dan halaman tool harus render normal. Tidak ada error atau layar kosong.
3. Buka sebuah tool. Halaman harus tetap bisa dipakai.
4. Di workspace tool, klik "Add to Favorites". Tombol berubah ke "Added to Favorites" dan muncul teks "Session only". Di kartu (homepage/direktori), `title` tombol bintang menyebut favorit untuk sesi itu saja.
5. Buka `/dashboard`. Footnote harus menyebut hanya jenis data yang bermasalah (favorites dan/atau recent tools). Favorit dari langkah 4 tampil selama halaman belum ditutup.
6. Buka `/login`, masukkan nama, lanjut. Dashboard dan navbar menampilkan nama untuk sesi itu. Footnote menyebut nama demo bila storage tidak bisa menulis.
7. **Skenario selektif:** izinkan penyimpanan lagi, lalu blokir hanya penulisan (jika browser mendukung), atau cukup periksa bahwa tidak ada notice untuk jenis data yang tidak bermasalah.
8. Izinkan penyimpanan, muat ulang halaman. Footnote kembali ke pesan prototype normal bila tidak ada jenis yang degraded.
9. Catat hasil per langkah sebagai bagian dari log QA. Jangan menandai langkah lulus bila belum benar-benar dijalankan.
