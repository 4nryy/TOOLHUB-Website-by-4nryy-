# TOOLHUB — Development Log

Catatan kerja kronologis (terbaru di atas). Satu entri per pekerjaan yang ditinjau Product Owner.
Aturan: hanya mencatat command yang **benar-benar dijalankan** beserta hasilnya. Command yang tidak dijalankan ditulis "tidak dijalankan".

Label temuan: **Verified** · **Partially verified** · **Planned** · **Unknown**.

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
| `npm test` (memakai `tsx`) | **Gagal di sandbox**: binary `esbuild` di `node_modules` adalah `win32-x64`. Keterbatasan lingkungan, bukan bug kode. **Belum diverifikasi di mesin lokal** |
| `node --import <resolver sementara di luar repo> --test "src/**/*.test.ts"` (type-stripping bawaan Node, bukan tsx) | 173 test: **172 pass, 0 fail, 1 todo** |
| Sama seperti di atas, di 4 zona waktu (UTC, Asia/Jakarta, America/Los_Angeles, Pacific/Auckland) × 2 locale | 172 pass, 0 fail, 1 todo di semua kombinasi |
| Mutation check manual (12 mutan kode dimasukkan lalu dipulihkan, sha256 identik) | 11 tertangkap; 1 lolos adalah *equivalent mutant* (`atob` memang mengabaikan whitespace, jadi `.trim()` redundan) |
| Render awal asli vs modifikasi (`react-dom/server`, 12 tool + dashboard) | 13/13 HTML identik. **Hanya state awal**, interaksi tidak diuji |
| `npm run build` / `next build` | **Tidak dijalankan di Task 1** (Unknown; diuji di mesin lokal sesuai keputusan D-006) |
| ESLint | **Tidak ada** (menunggu persetujuan dependency, lihat D-008) |

### Temuan baru selama Task 1
- Kategori **Documents** (`file`) dan **Business** (`briefcase`) memakai ikon yang tidak ada di `ToolIcon.tsx`, sehingga tampil sebagai ikon wrench generik. Tercatat sebagai test `todo`. (Partially verified: dari source + test, belum dilihat di browser.)
- `client-storage.ts` tidak menangkap error saat **menulis** `localStorage` (quota/private mode): `toggleFavorite`/`recordRecent`/`setDemoUser` akan melempar error. Tercatat sebagai known-issue test.
- Mode "Trim each line" juga memadatkan spasi di dalam baris; Date Calculator menampilkan "1 days"; tanggal tidak valid menjadi "NaN days". Semua tercatat sebagai known-issue test.

### Belum selesai / butuh tindakan
1. Jalankan `npm install`, `npm test`, `npm run typecheck`, `npm run build` di mesin lokal dan laporkan hasilnya.
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
