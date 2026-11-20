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

### Blok "KNOWN ISSUES"
Perilaku yang sudah diketahui bermasalah dikunci di blok `describe("… — KNOWN ISSUES (current behavior, may change in Task 2)")`. Itu **bukan** pernyataan bahwa perilakunya benar. Saat bug diperbaiki: ubah assertion ke perilaku yang benar dan pindahkan ke blok perilaku normal.

### Test `todo`
Test dengan opsi `{ todo: "alasan" }` dilaporkan sebagai TODO dan tidak menggagalkan suite. Saat ini ada satu: ikon kategori Documents (`file`) dan Business (`briefcase`) tidak ada di `ToolIcon`.

## Cakupan saat ini (173 test; 172 pass, 1 todo di sandbox audit)

| File uji | Fungsi / area | Jumlah |
|---|---|---:|
| `base64.test.ts` | `base64Encode`, `base64Decode` | 14 |
| `text-format.test.ts` | `formatText` (6 mode) | 23 |
| `word-stats.test.ts` | `getWordStats` | 17 |
| `percentage.test.ts` | `calculatePercentageOf` | 13 |
| `date-diff.test.ts` | `diffInDays`, `calculateDateDifference` | 16 |
| `json-format.test.ts` | `formatJson` | 12 |
| `uuid.test.ts` | `clampUuidCount`, `generateUuids` | 8 |
| `invoice.test.ts` | `calculateInvoiceTotal` | 8 |
| `format-bytes.test.ts` | `formatBytes` | 8 |
| `tools.test.ts` | registry `tools`, `categories`, `getTool` | 10 |
| `client-storage.test.ts` | favorites, recent, demo user, SSR, error handling | 17 |
| `ui-wiring.test.ts` | 12 cabang UI + 12 ikon + 2 guard + 1 todo | 27 |

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

## Catatan verifikasi di sandbox audit
`tsx` tidak bisa dijalankan di sandbox (binary esbuild Windows), sehingga hasil test Task 1 di sandbox diperoleh dengan runner Node bawaan (type-stripping) + resolver sementara di luar repo. Test yang sama, runner berbeda. Hasil `npm test` di mesin lokal harus dikonfirmasi.
