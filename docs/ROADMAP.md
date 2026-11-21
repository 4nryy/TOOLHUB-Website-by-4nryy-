# TOOLHUB — Roadmap

Roadmap adaptif. Ukuran kemajuan: kualitas dan stabilitas, bukan jumlah tools. Selaras dengan tahap 0–7 pada dokumen handoff.
Legenda: ✅ selesai · 🔄 berjalan/menunggu review · ⏳ disetujui, belum mulai · 💡 usulan · ⛔ ditunda.

## Posisi saat ini
Tahap 0 (audit) ✅ → Tahap 1 (stabilitas core) 🔄: Task 1 ✅ (di-commit `afea53b`), **Task 2A 🔄 menunggu persetujuan commit**.

## Tahap 1 — Stabilitas core (tiga task berurutan)

| Task | Isi | Status |
|---|---|---|
| **Task 1** | Test & quality baseline: ekstraksi logika murni, 173 test, `typecheck`/`test`/`check`, 4 dokumen, bersih-bersih impor, warning scroll-behavior | ✅ Selesai (`afea53b`) |
| **Task 2A** | Perbaikan logika & validasi: Base64, JSON, Percentage (validasi), Date (validasi), Text Formatter, Word Counter | 🔄 Selesai; validasi lokal PASS (typecheck, build, test); menunggu persetujuan commit |
| **Task 2B / 2C** | Sisa backlog Task 2 di bawah. Pembagian dan isinya ditentukan Product Owner | ⏳ Belum dimulai |
| **Task 3** | Registry bermetadata + pecah `ToolWorkspace` per tool + `next/dynamic` | ⏳ Setelah Task 2; butuh persetujuan karena refactor menengah |

### Backlog Task 2 (dari audit): status setelah Task 2A

Selesai di Task 2A (menunggu persetujuan commit): JSON big-int/literal angka · Percentage field kosong ditolak · Date validasi, "1 day" · Base64 URL-safe · Text Formatter (trim, Unicode, singkatan) · Word Counter (singkatan).

Belum dikerjakan, kandidat untuk 2B/2C (urutan usulan, bukan komitmen):
1. **Percentage:** mode perubahan persentase (D-002).
2. **Image Compressor:** JPEG/PNG/WebP, transparansi terjaga (D-003); pesan jika output ≥ input; revoke blob URL; batas ukuran.
3. **Date Calculator:** tanggal default memakai tanggal lokal (saat ini UTC, salah pukul 00:00–07:00 WIB).
4. **Pomodoro:** Start di 00:00 tidak boleh langsung "complete"; pertimbangkan timer berbasis timestamp.
5. **PDF Merger:** UI urutan file; pesan error PDF terenkripsi.
6. **Ikon kategori** Documents dan Business hilang di `ToolIcon` (test `todo`).
7. **`client-storage`:** tangani error saat menulis `localStorage`.
8. **Self-host Google Fonts** (D-004).

Keputusan produk yang muncul dari 2A (belum diputuskan):
- JSON: kunci duplikat dipertahankan atau dilaporkan, bukan dipadatkan.
- Word Counter: kalimat terakhir tanpa tanda baca dihitung atau tidak.
- Text Formatter: isi daftar singkatan; apakah perlu opsi "pertahankan huruf kapital".
- Base64: perlu opsi encode URL-safe? (saat ini hanya decode yang menerimanya).

## Tahap berikutnya (usulan, belum disetujui)

| Tahap | Fokus | Catatan |
|---|---|---|
| 2 | 10 tools kandidat | Prioritaskan yang memakai ulang logika/library yang ada |
| 3 | Universal Converter v1 | Mulai satu vertical slice (image→PDF / PDF→image); validasi file, batas ukuran |
| 4 | IT Student Toolbox | Playground/eksekusi kode hanya setelah model isolasi dikaji |
| 5 | Social Media Assistant | Matriks kapabilitas per platform lebih dulu; tanpa downloader universal |
| 6 | Akun & workspace | Auth + Prisma/PostgreSQL; **bisa dimajukan** bila personalisasi mendesak |
| 7 | Vertikal baru | Cybersecurity defensif, Energi |

## Infrastruktur kualitas

| Item | Status |
|---|---|
| Typecheck (`npm run typecheck`) | ✅ |
| Production build (`npm run build`) | ✅ lokal (validasi Task 2A) |
| Unit test logika murni (`npm test`) | ✅ (lokal: 293 pass pada validasi Task 2A; sandbox: 294 pass setelah perbaikan self-review; ulangi pada tree final) |
| Lint sungguhan (ESLint) | 💡 Menunggu persetujuan (D-008) |
| Test komponen/DOM atau e2e (mis. Playwright) | 💡 Belum diputuskan |
| CI (typecheck + test + build) | 💡 Setelah Git dipastikan |
| Aksesibilitas | ❓ Belum diuji |

## Keputusan terbuka
- D-005 Git; D-008 ESLint; jadwal D-004 (self-host fonts) apakah Task 2 atau task tersendiri.
- Apakah tool diberi `status` (implemented/beta) di registry pada Task 3.
- Bahasa ID + EN: kapan dimulai (saat ini hanya EN, tombol "EN" belum berfungsi).
