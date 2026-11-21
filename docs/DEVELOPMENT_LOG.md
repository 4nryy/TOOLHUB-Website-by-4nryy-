# TOOLHUB — Development Log

Catatan kerja kronologis (terbaru di atas). Satu entri per pekerjaan yang ditinjau Product Owner.
Aturan: hanya mencatat command yang **benar-benar dijalankan** beserta hasilnya. Command yang tidak dijalankan ditulis "tidak dijalankan".

Label temuan: **Verified** · **Partially verified** · **Planned** · **Unknown**.

---

## 2026-11-21 — Task 2A: Logic & validation fixes

**Status:** selesai. Validasi lokal sebelumnya oleh Product Owner: typecheck PASS dan build PASS, test 293 pass (sebelum perbaikan self-review). Validasi lokal penuh pada tree yang sudah diperbarui masih pending. Perbaikan self-review (M1–M2, m1–m6) sudah diterapkan; menunggu persetujuan commit. Task 2B/2C dan Task 3 belum dimulai.
**Baseline:** commit `afea53b` (Task 1), menurut Product Owner. Pekerjaan dilakukan di atas file Task 1 yang kuserahkan; jika repository lokal berbeda dari itu, periksa saat menerapkan patch.

### Tujuan
Memperbaiki bug logika dan validasi input pada 6 tool (Base64, JSON, Percentage, Date, Text Formatter, Word Counter) tanpa fitur baru, tanpa dependency baru, tanpa perubahan UI/arsitektur.

### Perubahan (ringkas; detail keputusan di `TECHNICAL_DECISIONS.md` D-010 s.d. D-014)
- **Base64:** decode menerima alfabet standar dan URL-safe, padding opsional; menolak karakter asing, alfabet campuran, padding salah, dan panjang mustahil. Pesan error baru yang jelas. Encode tidak berubah.
- **JSON Formatter:** parser JSON strict kecil (tanpa dependency) yang menyalin literal angka apa adanya, sehingga tidak ada kehilangan presisi. Error `SyntaxError` memuat baris dan kolom. Batas kedalaman 1000.
- **Percentage:** field kosong/blank ditolak dengan pesan spesifik; nol yang sah tetap diterima; hanya angka desimal biasa yang valid (hex, `1,000`, dst. ditolak); hasil `-0` tampil `0`; hasil yang terlalu besar ditolak.
- **Date:** hanya `YYYY-MM-DD` yang valid dan tanggal harus nyata (30 Feb ditolak); tidak ada `NaN`; "1 day" / "N days"; tahun 0–99 tidak lagi salah dipetakan.
- **Text Formatter:** "Trim each line" hanya memangkas ujung baris; kapitalisasi kalimat mendukung huruf Unicode; daftar singkatan pendek (HTML, API, URL, JSON, dst.) tidak dirusak pada title/sentence case.
- **Word Counter:** singkatan (Dr., Mr., etc., dll., e.g., inisial, "No. 5") tidak lagi membuat kalimat ekstra; tanda baca sendirian ("—", "&") tidak dihitung kata; kalimat yang berakhir di dalam tanda kutip penutup terhitung, dialogue tag tidak.
- **Tidak berubah:** `ToolWorkspace.tsx`, `DashboardClient.tsx`, `layout.tsx`, `tools.ts`, `client-storage.ts`, `package.json` (identik dengan Task 1, diverifikasi dengan `cmp`). Kode UI sudah menampilkan `error.message`, sehingga tidak perlu perubahan UI.
- `src/lib/tool-logic/index.ts`: menambah ekspor fungsi/konstanta baru.

### Test
- 295 test (sebelumnya 173): 294 pass, 0 fail, 1 todo (ikon kategori, sama dengan Task 1). Angka ini dari sandbox setelah perbaikan self-review. Validasi lokal Product Owner (293 pass) dijalankan sebelum test regresi `ms` ditambahkan.
- **Test lama tidak dilemahkan.** Dari 173 test Task 1, 12 nama test berubah: 10 assertion known-issue dibalik ke perilaku benar (karena bug-nya diperbaiki), dan 2 hanya diganti nama (assertion identik). Test Task 1 lainnya lulus tanpa perubahan. Ini dicek dengan membandingkan nama `it()` terhadap snapshot Task 1. Known-issue yang masih terbuka dipertahankan apa adanya.
- Differential test terhadap `JSON.parse` (oracle) dan `Buffer` (oracle Base64) ada di dalam suite.

### Validasi lokal (Product Owner, tree Task 2A sebelum perbaikan self-review)

| Command | Hasil |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm test` | 293 pass, 0 fail, 1 todo (TODO terkait UI wiring, di luar lingkup 2A). Exit code 1 dilaporkan; penyebabnya belum diselidiki |
| Uji manual Base64 | PASS: encode standar, Unicode/emoji, encode URL-safe, decode URL-safe tanpa padding, decode tanpa padding, input tidak valid |

### Validasi sandbox (audit, Linux, Node 22.23.5, tanpa network, setelah perbaikan self-review)

| Command | Hasil |
|---|---|
| `npm run typecheck` | exit 0 |
| `tsc --noEmit --noUnusedLocals --noUnusedParameters` | exit 0 |
| `npm test` | exit 1: binary `esbuild` adalah `win32-x64` (keterbatasan sandbox) |
| `npm run check` | exit 1 (typecheck lulus; `npm test` gagal karena alasan yang sama) |
| `npm run build` | exit 127: `next: Permission denied` (artefak ekstrak ZIP). `next build` lewat node gagal mengunduh SWC (tanpa network) |
| Runner Node bawaan + resolver sementara di luar repo | exit 0; 295 test: 294 pass, 0 fail, 1 todo |
| Sama, 4 zona waktu × 2 locale | 294 pass, 0 fail, 1 todo di semua kombinasi |
| Probe m3 terhadap `word-stats.ts` sebelum perbaikan | test regresi `ms` gagal; sesudah perbaikan lulus |
| Fuzz JSON dan mutation check | dijalankan sebelum perbaikan self-review, tidak diulang (lihat hasil di atas) |

Catatan: angka sandbox dan angka lokal berasal dari tree dan runner yang berbeda. Validasi lokal harus diulang pada tree final sebelum commit.

### Perbaikan setelah self-review
- **M1:** status verifikasi di dokumen diperbarui (bagian ini, TESTING_GUIDE, ROADMAP).
- **M2:** angka test Task 1 dikoreksi (bullet "Test lama tidak dilemahkan").
- **m1:** `base64.test.ts`: entri `"YQ=\n=="` dan logika `continue` yang tidak pernah dijalankan dihapus. Perilaku yang diuji tidak berubah (kasus itu tetap tercakup oleh `"YQ==="`).
- **m2:** nama test di `text-format.test.ts` sekarang sesuai isinya: lowercase, title, dan sentence mempertahankan panjang teks.
- **m3:** `word-stats.ts`: `ms` (satuan, huruf kecil) dipindah dari daftar non-terminating ke daftar soft. Gelar `Ms` (huruf kapital) tetap bukan akhir kalimat. Test regresi `I ran 10 ms. Then I rested.` → 2 kalimat ditambahkan. Test ini gagal pada kode sebelum perbaikan dan lulus sesudahnya. Test singkatan yang ada (termasuk `Ms. Ng left.`) tetap lulus.
- **m4:** header `json-format.ts` menyatakan pengecualian kedalaman. Tidak ada perubahan kode.
- **m5:** D-012 mencatat perbedaan trim antara tanggal dan persentase. Tidak ada perubahan runtime.
- **m6:** batas kedalaman 1000 dipertahankan dan dicatat sebagai keterbatasan yang diterima sementara (D-010). Tidak ada perubahan kode.

### Cacat yang ditemukan dan diperbaiki selama pengerjaan
- Heuristik "kata kapital di teks campuran = singkatan" merusak test lama (`how ARE you` → `are`); heuristik dibuang, diganti daftar singkatan pendek.
- Dukungan kutip penutup di Word Counter sempat menghitung dialogue tag (`"Really?" she asked.`) dua kali; diperbaiki.
- Penanganan whitespace Base64 sempat lebih longgar dari dokumentasinya (membuang NBSP/BOM di tengah teks); disamakan dengan perilaku lama.
- Dua angka harapan test salah hitung (jumlah hari 0000–9999 dan kalimat "a.b@c.org today."); dihitung ulang secara independen, kode benar.
- Audit nama test menunjukkan satu known-issue masih terbuka ikut terhapus; dipulihkan persis.

### Belum selesai / butuh keputusan
1. Ulangi validasi lokal pada tree saat ini (termasuk test regresi `ms`). Angka lokal di atas berasal dari tree sebelum perbaikan self-review. Jalankan `npm install`, `npm run typecheck`, `npm test`, `npm run build`.
2. **Kunci duplikat JSON** masih dipadatkan (nilai terakhir menang, seperti `JSON.parse`); menghapus data diam-diam itu masalah serupa, tetapi mengubahnya di luar lingkup 2A. Keputusan: pertahankan, atau laporkan/pertahankan semuanya?
3. **Kalimat tanpa tanda baca akhir** masih dihitung 0 (`"One. Two"` = 1). Keputusan produk.
4. **Daftar singkatan Text Formatter** (64 entri termasuk singkatan Indonesia) adalah pilihan saya; mohon ditinjau/ditambah.
5. Belum dikerjakan (di luar 2A): mode Percentage Change, tanggal default lokal (saat ini UTC), Pomodoro, Image Compressor, PDF Merger, ikon kategori, error tulis `localStorage`, self-host fonts.

---

## 2026-11-20 — Task 1: Test & quality baseline

**Status:** selesai, menunggu review Product Owner. Task 2 dan Task 3 belum dimulai.

### Tujuan
Memasang jaring pengaman (automated test + pemisahan typecheck dari lint) sebelum memperbaiki bug, tanpa mengubah fungsionalitas 12 tools.

### Perubahan
- **Logika murni diekstrak** dari `ToolWorkspace.tsx` ke `src/lib/tool-logic/` (tanpa React/DOM): `base64`, `text-format`, `word-stats`, `percentage`, `date-diff`, `json-format`, `uuid`, `invoice`, `format-bytes` + `index.ts`. Perilaku disalin apa adanya, **termasuk bug yang sudah diketahui** (itu bagian Task 2).
- `ToolWorkspace.tsx`: hanya mengganti kode inline dengan pemanggilan modul. JSX/UI tidak disentuh. Dua impor ikon tak terpakai dihapus.
- `DashboardClient.tsx`: satu impor tak terpakai dihapus.
- `app/layout.tsx`: menambah `data-scroll-behavior="smooth"` pada `<html>` (warning Next.js yang muncul berulang di log dev).
- `package.json`: script baru `typecheck`, `test`, `check`; script `lint` (alias menyesatkan ke `tsc`) dihapus. Tidak ada dependency baru.
- README: bagian pengecekan kualitas diperbarui. Dokumen ini dan 3 dokumen docs lain ditambahkan.
- **Test baru:** 12 file, 173 test (lihat `docs/TESTING_GUIDE.md`).

### Verifikasi (lingkungan sandbox: Linux, Node 22.23.5, tanpa network)

| Command | Hasil |
|---|---|
| `tsc --noEmit` (= `npm run typecheck`) | exit 0 |
| `tsc --noEmit --noUnusedLocals --noUnusedParameters` | exit 0 (sebelum Task 1: 3 error) |
| `npm test` (memakai `tsx`) | **Gagal di sandbox**: binary `esbuild` di `node_modules` adalah `win32-x64` (keterbatasan lingkungan). Validasi lokal: lihat entri Task 2A |
| `node --import <resolver sementara di luar repo> --test "src/**/*.test.ts"` (type-stripping bawaan Node, bukan tsx) | 173 test: **172 pass, 0 fail, 1 todo** |
| Sama seperti di atas, di 4 zona waktu (UTC, Asia/Jakarta, America/Los_Angeles, Pacific/Auckland) × 2 locale | 172 pass, 0 fail, 1 todo di semua kombinasi |
| Mutation check manual (12 mutan kode dimasukkan lalu dipulihkan, sha256 identik) | 11 tertangkap; 1 lolos adalah *equivalent mutant* (`atob` memang mengabaikan whitespace, jadi `.trim()` redundan) |
| Render awal asli vs modifikasi (`react-dom/server`, 12 tool + dashboard) | 13/13 HTML identik. **Hanya state awal**, interaksi tidak diuji |
| `npm run build` / `next build` | **Tidak dijalankan di sandbox Task 1** (Unknown di sandbox). Hasil lokal PASS dilaporkan pada validasi Task 2A |
| ESLint | **Tidak ada** (menunggu persetujuan dependency, lihat D-008) |

### Temuan baru selama Task 1
- Kategori **Documents** (`file`) dan **Business** (`briefcase`) memakai ikon yang tidak ada di `ToolIcon.tsx`, sehingga tampil sebagai ikon wrench generik. Tercatat sebagai test `todo`. (Partially verified: dari source + test, belum dilihat di browser.)
- `client-storage.ts` tidak menangkap error saat **menulis** `localStorage` (quota/private mode): `toggleFavorite`/`recordRecent`/`setDemoUser` akan melempar error. Tercatat sebagai known-issue test.
- Mode "Trim each line" juga memadatkan spasi di dalam baris; Date Calculator menampilkan "1 days"; tanggal tidak valid menjadi "NaN days". Semua tercatat sebagai known-issue test.

### Belum selesai / butuh tindakan
1. Validasi lokal dilaporkan pada tree Task 2A (typecheck PASS, build PASS, test lulus); lihat entri Task 2A.
2. Persetujuan dependency ESLint (D-008).
3. Periksa kondisi Git lokal (D-005). Arsip yang diaudit tidak berisi `.git`.

---

## 2026-11-19 — Audit Tahap 1 (read-only)

**Status:** selesai; hasil direview dan disetujui dengan keputusan D-001 s.d. D-006.

Ringkasan baseline sebelum perubahan apa pun:
- Stack: Next.js 16.4.6, React 19.3.1, TypeScript 5.9.3, Tailwind 4.3.5, Prisma 7.10.1 (belum dipakai).
- 12 tools berjalan 100% di browser. Backend/DB/auth belum ada; Prisma schema belum terhubung dan belum punya migrasi.
- `npm run check` dan `npm run lint` keduanya hanya `tsc --noEmit` (lulus). Tidak ada test. Production build tidak bisa diuji di sandbox (butuh download SWC) → Unknown.
- Lisensi dependency langsung permisif (MIT/ISC/Apache-2.0).
- Daftar bug per tool dan rekomendasi ada di laporan audit; ringkasannya di `docs/ROADMAP.md`.

---

## Templat entri berikutnya

```
## YYYY-MM-DD — <Task>
**Status:** <berjalan | selesai, menunggu review | disetujui>
### Tujuan
### Perubahan   (file dibuat/diubah)
### Verifikasi  (tabel: command | hasil | dijalankan di mana)
### Temuan baru
### Belum selesai / butuh tindakan
```
