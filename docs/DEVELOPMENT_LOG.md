# TOOLHUB — Development Log

Catatan kerja kronologis (terbaru di atas). Satu entri per pekerjaan yang ditinjau Product Owner.
Aturan: hanya mencatat command yang **benar-benar dijalankan** beserta hasilnya. Command yang tidak dijalankan ditulis "tidak dijalankan".

Label temuan: **Verified** · **Partially verified** · **Planned** · **Unknown**.

---

## 2026-11-22 — Task 2B Phase 1: Category icons & LocalStorage UX

**Status:** diimplementasikan; **revisi R1** (lihat bagian "Revisi R1") menunggu review Product Owner. Phase 2 belum dimulai.
**Baseline:** commit `8e866d2` (`main`, `origin/main`, working tree clean), dikonfirmasi Product Owner. Workspace sandbox bukan repositori Git dan tidak bisa membuktikan isi 8e866d2, sehingga patch dibuat terhadap salinan sandbox yang diharapkan identik dengan 8e866d2 (lihat "Koreksi inventori" dan "Patch").

### Tujuan
1. Ikon kategori Documents (`file`) dan Business (`briefcase`) tidak lagi jatuh ke Wrench; kategori Text & Writing punya warna ikon.
2. Penulisan LocalStorage tidak pernah melempar error ke UI; kegagalan ditangani dengan feedback yang jujur dan spesifik per jenis data.

### Perubahan (R1 final)
- **Ikon:** modul baru `src/lib/tool-icons.ts` (tanpa JSX) berisi peta ikon, `resolveToolIcon`, `hasToolIcon`, dan `categoryIconClass`. Menambahkan `File` dan `Briefcase` dari `lucide-react` yang sudah terpasang. `ToolIcon.tsx` mendelegasikan ke modul ini. `ToolCard.tsx` memakai `categoryIconClass` (perilaku sama). `globals.css`: `.icon-text-writing{background:#fdf0f6;color:#c3407b}`.
- **Storage:** `client-storage.ts` ditulis ulang. Status sekarang **per jenis data** (`favorites`, `recent`, `demo-user`):
  - `getStorageStatus(kind)` mengembalikan `"degraded"` bila pembacaan terakhir key itu gagal, atau nilainya hanya ada di memori.
  - `getStorageStatus()` tanpa argumen tetap tersedia (keseluruhan).
  - `getDegradedNotices()` mengembalikan notice untuk setiap jenis yang degraded, sehingga UI tidak menampilkan peringatan untuk jenis yang sehat.
  - Pembacaan key gagal hanya dihapus oleh pembacaan key itu sendiri yang berhasil, atau oleh penulisan berhasil untuk key itu. Pembacaan key lain tidak menghapusnya.
  - Penulisan yang gagal disimpan di memori untuk sesi halaman. Penulisan berhasil berikutnya untuk key itu menghapus salinan memori.
  - Signature dan return value fungsi publik lama tidak berubah.
- **Feedback:**
  - `FavoriteToggle.tsx` memeriksa **hanya** `getStorageStatus("favorites")`. Di workspace tampil "Session only"; di kartu, `title`/`aria-label` menyebut favorit.
  - `DashboardClient.tsx` menampilkan `getDegradedNotices()` di footnote. Bila tidak ada yang degraded, teks prototype normal.
- **Tidak diubah (sengaja):** `TopNav.tsx` (`getDemoUser` tidak pernah melempar), `ToolWorkspace.tsx` (`recordRecent` tidak pernah melempar), `login/page.tsx` (`setDemoUser` tidak pernah melempar; dashboard menjelaskan status), logika 12 tool, `tools.ts`, navbar, homepage, direktori, dan Percentage Calculator.

### Notice (teks UI, ditampilkan hanya bila jenis itu degraded)
- Favorites: "Favorites are kept for this session only: this browser could not save or read them."
- Recent tools: "Recent tools are kept for this session only: this browser could not save or read them."
- Demo name: "Your demo name is kept for this session only: this browser could not save or read it."

### Caller yang diaudit (dampak perubahan)
| Fungsi | Caller | Dampak |
|---|---|---|
| `toggleFavorite` | `FavoriteToggle` | Return value sama. Tidak melempar lagi. Status dicek per `favorites` |
| `recordRecent` | `ToolWorkspace` (useEffect) | Tidak melempar lagi, tidak crash |
| `setDemoUser` | `login/page.tsx` | Tidak melempar lagi, redirect tetap jalan |
| `clearDemoUser` | `DashboardClient` | Tidak melempar lagi |
| `getDemoUser` | `TopNav`, `DashboardClient` | Aman saat storage diblokir |
| `getFavorites`, `getRecent` | `FavoriteToggle`, `DashboardClient` | Sama |
| `getStorageStatus` | `FavoriteToggle` (baru), `DashboardClient` (baru) | Baru di Phase 1 |

### Perilaku saat localStorage gagal
- Halaman tetap render; tidak ada error boundary yang terpicu oleh storage.
- Favorit, recent, dan nama demo tetap berfungsi untuk **sesi halaman itu** dari memori.
- Hanya jenis data yang gagal yang diberi notice. Tidak ada peringatan palsu untuk jenis yang berhasil.
- Tidak ada alert browser. Tidak ada klaim bahwa data tersimpan permanen.
- Setelah penulisan key itu berhasil lagi, status jenis tersebut kembali `ok`. Data yang masih hanya di memori tetap ditandai sampai ditulis ulang (tidak disalin otomatis ke storage, supaya tidak menimpa data dari tab lain).

### Perubahan test yang sudah ada (transparan)
- `client-storage.test.ts`, blok `KNOWN ISSUES` (Task 2A): test "write errors ... are NOT caught and propagate" **dibalik** ke perilaku baru. Blok itu dihapus karena tidak ada known issue lagi di modul ini. Assertion lama gagal pada kode lama dan lulus pada kode baru.
- `client-storage.test.ts`: `installWindow` memanggil `resetClientStorageState()` agar state memori tidak bocor antar test (perubahan harness).
- `ui-wiring.test.ts`: assertion "ToolIcon knows the icon…" memeriksa registry (`tool-icons.ts`) karena `ToolIcon` mendelegasikan ke sana. Test `todo` ikon kategori **diganti** dengan 12 test nyata (satu per kategori).
- Tidak ada test yang dihapus tanpa pengganti.

### Test baru
- `tool-icons.test.ts` (34 test): semua ikon kategori dan tool terdaftar; Documents→`File` dan Business→`Briefcase`, keduanya bukan Wrench; nama data tetap `file`/`briefcase`; fallback untuk nama tak dikenal; nama bawaan prototype (`constructor`, `__proto__`) bukan ikon; kelas warna kategori unik; setiap kelas punya aturan CSS dengan `background` dan `color`.
- `client-storage.test.ts`: tulis gagal (toggle, recordRecent, setDemoUser, clearDemoUser); event tetap terkirim sekali per tulis; pemulihan; storage diblokir (getter melempar); `window` tanpa `localStorage`; status normal.
- **Revisi R1 — status per jenis data** (`client-storage.test.ts`, blok "status per data kind"):
  1. Favorites gagal, Recent berhasil (status favorites degraded, recent dan demo-user ok, notice hanya favorites).
  2. Recent gagal, Favorites berhasil (kebalikan skenario 1).
  3. Demo user gagal, Favorites dan Recent berhasil.
  4a. Semua jenis gagal menulis (tiga notice, urutan tetap).
  4b. Storage diblokir total (ketiganya degraded, pembacaan kosong, tidak melempar).
  5. Pemulihan: setiap jenis diperbarui sesuai key-nya; favorites yang masih hanya di memori tetap degraded sampai ditulis.
  - Tambahan: pembacaan gagal satu key tidak dihapus oleh pembacaan key lain yang berhasil; penulisan berhasil membersihkan kegagalan baca key yang sama tanpa membaca ulang; tidak ada notice bila semua sehat.

### Revisi R1: koreksi dari review Product Owner
1. Status penyimpanan per jenis data (lihat di atas). Sebelumnya satu status global membuat FavoriteToggle menampilkan "Session only" walau yang gagal hanya demo user.
2. Dokumentasi disinkronkan: Task 2A dicatat sebagai di-commit dan di-push (`8e866d2`).
3. Inventori diperiksa ulang (lihat di bawah).
4. Validasi diulang; hasil dipisah per sumber.

### Koreksi inventori
Laporan awal Phase 1 menulis "Diubah (7)" untuk file sumber, tetapi daftarnya berisi **8** file. Jumlah yang benar (relatif terhadap baseline sandbox):
- **Baru (2):** `src/lib/tool-icons.ts`, `src/lib/tool-icons.test.ts`
- **Diubah sumber (8):** `src/app/globals.css`, `src/components/ToolIcon.tsx`, `src/components/ToolCard.tsx`, `src/components/FavoriteToggle.tsx`, `src/components/DashboardClient.tsx`, `src/lib/client-storage.ts`, `src/lib/client-storage.test.ts`, `src/lib/ui-wiring.test.ts`
- **Dokumen (4):** `docs/DEVELOPMENT_LOG.md`, `docs/ROADMAP.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/TESTING_GUIDE.md`
- **Total: 14 file.** Tidak ada file lain yang berubah. `package.json` tidak berubah (tidak ada dependency baru). `package-lock.json` identik dengan ZIP asli (diverifikasi `cmp` dan sha256).

### Verifikasi yang dijalankan (sandbox: Linux, Node 22.23.5, tanpa network, tanpa browser)

Riwayat dibagi menurut run. Angka awal Phase 1 tetap dicatat apa adanya.

**Run awal Phase 1 (sebelum revisi R1):** 346 test, 346 pass, 0 fail, 0 todo. Sudah digantikan oleh run R1.

**Run R1 (sandbox):**

| Command | Hasil |
|---|---|
| `npm run typecheck` (`tsc --noEmit`) | exit 0 |
| `tsc --noEmit --noUnusedLocals --noUnusedParameters` | exit 0 |
| Suite lengkap (runner Node bawaan + resolver sementara di luar repo) | exit 0. **355 test: 355 pass, 0 fail, 0 todo** |
| Sama, 4 zona waktu × 2 locale | 355 pass, 0 fail, 0 todo di semua kombinasi |
| `npm test` (tsx) | **exit 1 di sandbox**: `esbuild` terpasang untuk `win32-x64` (keterbatasan lingkungan, bukan kegagalan kode) |
| `npm run check` | exit 1 (typecheck lulus; `npm test` gagal alasan sama) |
| `npm run build` | **exit 127 di sandbox**: `next: Permission denied`. **Belum diverifikasi** |
| `git diff --check` | exit 0 di repo Git sementara yang dibangun dari baseline sandbox. Sebelumnya gagal karena satu baris kosong di akhir `TECHNICAL_DECISIONS.md`; sudah dibersihkan |
| Mutation check status per jenis (5 mutan) | **5 tertangkap**: status mengabaikan jenis; baca sukses menghapus kegagalan key lain; notice untuk semua jenis; tulis sukses tidak membersihkan kegagalan baca key-nya; kegagalan baca diabaikan |
| Mutation check ikon & storage run awal (10 mutan) | 9 tertangkap; 1 ekuivalen (melempar ulang di `getStorage()` yang hanya dipanggil dari blok `try`) |
| Tool logic (`src/lib/tool-logic/`) | identik dengan baseline sandbox |

**Validasi lokal Product Owner (Phase 1):** **belum dijalankan.** Menunggu tree R1.
**Uji browser manual:** **belum dilakukan.** Langkahnya ada di `TESTING_GUIDE.md`.

### Patch
Patch dibuat terhadap salinan sandbox yang diharapkan identik dengan `8e866d2`. Sandbox tidak bisa membuktikan itu, sehingga patch **tidak** diklaim sebagai "terverifikasi terhadap 8e866d2". Verifikasi yang benar: terapkan patch ke `8e866d2` di mesin Product Owner (`git apply --check`), lalu jalankan validasi lokal.

### Belum selesai / butuh tindakan
1. **Validasi lokal Product Owner** pada tree R1: `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`.
2. **Uji browser manual** (blokir storage, lalu periksa homepage, tool, favorit, dashboard, login) sesuai `TESTING_GUIDE.md`.
3. Kartu favorit ikon-saja hanya memberi feedback lewat `title` dan `aria-label` (tidak terlihat). Keterbatasan UI yang disengaja pada fase ini.
4. Tidak ada sinkronisasi antar-tab (listener `storage`). Di luar scope.
5. Dashboard menampilkan "N saved" berdasarkan total favorit, tetapi hanya 4 yang ditampilkan. Dicatat untuk Phase 2 (dashboard).
6. Data yang hanya di memori tidak disalin otomatis ke storage saat storage pulih. Tetap ditandai sampai ditulis ulang oleh tindakan pengguna.

---

## 2026-11-21 — Task 2A: Logic & validation fixes

**Status:** selesai; **di-commit dan di-push ke `main` sebagai `8e866d2`** (`origin/main`). Validasi lokal PO yang tercatat di bawah (typecheck PASS, build PASS, test 293 pass) dijalankan pada tree **sebelum** perbaikan self-review; hasil lokal untuk commit `8e866d2` tidak tercatat di dokumen ini. Phase 2 belum dimulai.
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

**Status:** selesai, di-commit (`afea53b`). Task 2 dan Task 3 belum dimulai pada saat entri ini ditulis.

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
