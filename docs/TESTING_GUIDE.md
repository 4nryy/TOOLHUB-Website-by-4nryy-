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
Test dengan opsi `{ todo: "alasan" }` dilaporkan sebagai TODO. Di sandbox, runner Node bawaan keluar dengan exit 0, tetapi validasi lokal Product Owner melaporkan `npm test` keluar dengan exit code 1 (penyebabnya belum diselidiki; di luar lingkup Task 2A). Saat ini ada satu: ikon kategori Documents (`file`) dan Business (`briefcase`) tidak ada di `ToolIcon`.

## Cakupan saat ini (295 test; 294 pass, 1 todo di sandbox setelah perbaikan review)

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
| `client-storage.test.ts` | favorites, recent, demo user, SSR, error handling | 17 |
| `ui-wiring.test.ts` | 12 cabang UI + 12 ikon + 2 guard + 1 todo | 27 |

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

Dua sumber dicatat terpisah. Keduanya tidak boleh dicampur.

**Lokal (Product Owner):** dijalankan pada tree Task 2A sebelum perbaikan self-review (293 pass; belum memuat test regresi `ms`).
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm test`: 293 pass, 0 fail, 1 todo; exit code 1 dilaporkan (penyebabnya belum diselidiki)
- Uji manual Base64: PASS

**Sandbox audit:** Linux tanpa network, dengan binary esbuild Windows di `node_modules`.
- `npm test` dan `npm run check` tidak bisa berjalan (esbuild). `npm run build` tidak bisa berjalan (`next: Permission denied`; SWC tidak bisa diunduh).
- Pengujian memakai runner Node bawaan + resolver sementara di luar repo: 295 test, 294 pass, 0 fail, 1 todo (exit 0). Test yang sama, runner berbeda.

Sebelum commit, jalankan ulang `npm run typecheck`, `npm test`, dan `npm run build` pada tree final. Hanya angka dari run itu yang berlaku sebagai validasi lokal.
