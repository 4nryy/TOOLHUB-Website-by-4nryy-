# TOOLHUB — Roadmap

Roadmap adaptif. Ukuran kemajuan: kualitas dan stabilitas, bukan jumlah tools. Selaras dengan tahap 0–7 pada dokumen handoff.
Legenda: ✅ selesai · 🔄 berjalan/menunggu review · ⏳ disetujui, belum mulai · 💡 usulan · ⛔ ditunda.

## Posisi saat ini
Tahap 0 (audit) ✅ → Tahap 1 (stabilitas core) 🔄, sedang di **Task 1 (menunggu review)**.

## Tahap 1 — Stabilitas core (tiga task berurutan)

| Task | Isi | Status |
|---|---|---|
| **Task 1** | Test & quality baseline: ekstraksi logika murni, 173 test, `typecheck`/`test`/`check`, 4 dokumen, bersih-bersih impor, warning scroll-behavior | 🔄 Menunggu review |
| **Task 2** | Perbaikan bug tools (daftar di bawah) memakai test Task 1 | ⏳ Setelah Task 1 direview |
| **Task 3** | Registry bermetadata + pecah `ToolWorkspace` per tool + `next/dynamic` | ⏳ Setelah Task 2; butuh persetujuan karena refactor menengah |

### Backlog Task 2 (dari audit, urutan usulan)
1. **JSON Formatter:** integer besar kehilangan presisi tanpa peringatan.
2. **Percentage Calculator:** tambah mode perubahan persentase (D-002); field kosong ditolak.
3. **Image Compressor:** JPEG/PNG/WebP, transparansi terjaga (D-003); pesan jika output ≥ input; revoke blob URL; batas ukuran.
4. **Date Calculator:** tanggal default memakai tanggal lokal (saat ini UTC, salah pukul 00:00–07:00 WIB); tanggal tidak valid → error; "1 day".
5. **Pomodoro:** Start di 00:00 tidak boleh langsung "complete"; pertimbangkan timer berbasis timestamp.
6. **Base64:** dukung URL-safe.
7. **Text Formatter:** label/perilaku "Trim each line" konsisten; akronim; huruf non-ASCII.
8. **Word Counter:** akurasi kalimat (singkatan) — opsional.
9. **PDF Merger:** UI urutan file; pesan error PDF terenkripsi.
10. **Ikon kategori** Documents dan Business hilang di `ToolIcon` (test `todo`).
11. **`client-storage`:** tangani error saat menulis `localStorage`.
12. **Self-host Google Fonts** (D-004).

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
| Unit test logika murni (`npm test`) | ✅ (menunggu verifikasi di mesin lokal) |
| Lint sungguhan (ESLint) | 💡 Menunggu persetujuan (D-008) |
| Test komponen/DOM atau e2e (mis. Playwright) | 💡 Belum diputuskan |
| CI (typecheck + test + build) | 💡 Setelah Git dipastikan |
| Aksesibilitas | ❓ Belum diuji |

## Keputusan terbuka
- D-005 Git; D-008 ESLint; jadwal D-004 (self-host fonts) apakah Task 2 atau task tersendiri.
- Apakah tool diberi `status` (implemented/beta) di registry pada Task 3.
- Bahasa ID + EN: kapan dimulai (saat ini hanya EN, tombol "EN" belum berfungsi).
