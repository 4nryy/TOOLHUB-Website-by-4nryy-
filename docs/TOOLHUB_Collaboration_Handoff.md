# TOOLHUB — Project Proposal & Collaboration Handoff

**Dokumen kerja untuk ChatGPT + Claude Code**  
**Tanggal:** 19 November 2026  
**Versi:** 1.0 — Draft Konsolidasi  
**Status:** Dokumen konteks dan arahan awal; bukan spesifikasi final seluruh fitur.

---

## 1. Tujuan dokumen

Dokumen ini menyatukan keputusan, ide, kondisi project saat ini, arah pengembangan, batas teknis, dan pembagian peran dalam pengembangan TOOLHUB. Dokumen ditujukan untuk diberikan kepada Claude Code agar ia memahami konteks proyek sebelum melakukan audit repository dan mengusulkan langkah teknis.

Dokumen ini merupakan **ringkasan keputusan dan rencana penting dari percakapan**, bukan transkrip kata demi kata seluruh chat. Apabila ada perbedaan antara dokumen ini dan source code yang benar-benar ada di repository, source code harus diperiksa dan kondisi aktual harus dilaporkan. Jangan menganggap seluruh rencana sudah diimplementasikan.

### Instruksi awal untuk Claude Code

1. Baca dokumen ini secara menyeluruh.
2. Audit repository TOOLHUB yang diberikan pengguna. Verifikasi stack, struktur folder, tools yang benar-benar berjalan, dependency, konfigurasi, dan status backend/database.
3. **Jangan langsung melakukan refactor besar atau mengubah banyak file.** Tahap pertama adalah menghasilkan laporan audit dan rekomendasi implementasi yang realistis.
4. Tandai setiap hal sebagai `Verified`, `Partially verified`, `Planned`, atau `Unknown`.
5. Jangan mengklaim fitur, API, database, autentikasi, atau pengujian sudah tersedia sebelum membuktikannya dari source code atau menjalankan tes.
6. Ajukan keputusan teknis yang berdampak besar kepada pengguna sebelum implementasi. Untuk detail kecil, gunakan pilihan paling sederhana, aman, dan mudah dirawat.

---

## 2. Ringkasan eksekutif

TOOLHUB adalah platform web utilitas digital modular yang bertujuan mengumpulkan berbagai tools bermanfaat dalam satu tempat. Audiensnya luas, tetapi fokus pengembangan awal yang dipilih pengguna adalah **mahasiswa dan pelajar bidang IT**. Setelah fondasi dan katalog IT cukup matang, platform dapat berkembang ke bidang Cybersecurity yang berorientasi defensif, Energi, dan bidang lainnya.

Prinsip produk utama:

- Tools harus benar-benar berfungsi; jumlah tools bukan satu-satunya ukuran kemajuan.
- Antarmuka harus sederhana, jelas, dan tidak padat. Jangan menghilangkan fungsi penting, tetapi tampilkan opsi lanjutan hanya ketika diperlukan (*progressive disclosure*).
- Utamakan pengalaman guest agar orang dapat mencoba tools tanpa wajib membuat akun. Akun nantinya membuka fitur personal.
- Gunakan pemrosesan di browser apabila cukup aman dan praktis; gunakan backend atau layanan pihak ketiga jika memang diperlukan.
- Platform harus modular agar tool baru dapat ditambahkan tanpa merusak tools yang sudah ada.
- Perhatikan privasi file pengguna, keamanan API, hak cipta, ketentuan platform, dan biaya infrastruktur.

### Arah produk yang diprioritaskan

1. Stabilkan dan audit 12 tools awal.
2. Evaluasi 10 kandidat tools yang sudah diinventarisasi.
3. Bangun Universal File Converter dengan cakupan format bertahap.
4. Perluas katalog menjadi IT Student Toolbox: programming, database, API, jaringan, dokumentasi, dan produktivitas akademik.
5. Rancang Social Media Content Assistant dengan dukungan yang sah dan realistis per platform.
6. Setelah fondasi matang, perluas ke Cybersecurity defensif, Energi, dan bidang lain.

Urutan ini adalah rekomendasi kerja. Urutan final dapat disesuaikan setelah audit teknis, penilaian manfaat, kompleksitas, biaya, dan risiko.

---

## 3. Identitas dan konsep produk

| Aspek | Keputusan / arah saat ini |
|---|---|
| Nama | TOOLHUB (nama sementara; dapat berubah) |
| Bentuk | Platform web responsif; PWA dapat dipertimbangkan kemudian |
| Akses | Guest dapat menggunakan tools; akun untuk fitur personal |
| Audiens | Pengguna umum, pelajar/mahasiswa, pekerja, developer, freelancer, dan usaha kecil |
| Fokus awal | Mahasiswa/pelajar bidang IT |
| Bahasa | Bahasa Indonesia dan English direncanakan |
| Desain | Modern, minimalis, profesional, mudah dipahami |
| Warna acuan | Indigo `#4F46E5`, putih/off-white, dan abu-abu netral |
| Arsitektur | Modular monolith sebagai titik awal; hindari microservices terlalu dini |
| Pemrosesan | Hybrid: browser-local, backend, atau API eksternal sesuai kebutuhan |

Nama, warna, dan konsep tampilan merupakan keputusan awal, bukan batas permanen. Fokus pembahasan saat ini adalah fungsionalitas dan katalog tools; penyempurnaan UI/UX dilakukan bertahap setelah fitur inti berfungsi.

### Prinsip UX yang wajib dijaga

- Jangan membuat dashboard atau workspace terlalu padat.
- Setiap tool memiliki satu alur utama yang mudah ditemukan.
- Opsi lanjutan disembunyikan dalam bagian Advanced/More Options bila tidak selalu diperlukan.
- Gunakan label, validasi, contoh input, pesan error, dan hasil yang jelas.
- Pastikan layout responsif dan aksesibel.
- Jangan menambahkan fitur hanya karena terlihat canggih bila manfaatnya tidak sebanding dengan kompleksitas.

---

## 4. Kondisi project saat ini

### 4.1 Lingkungan dan teknologi yang telah digunakan

Konteks project awal menunjukkan penggunaan:

- Next.js versi `16.4.6`.
- React.
- TypeScript (`.ts` / `.tsx`) sebagai bahasa utama implementasi.
- CSS untuk styling.
- Next.js API routes/route handlers sebagai arah backend.
- Prisma schema sudah disiapkan dalam project awal.
- PostgreSQL direncanakan sebagai database, tetapi koneksi dan integrasi aktual harus diverifikasi.

Next.js adalah framework berbasis React, bukan bahasa pemrograman. TypeScript merupakan bahasa utama source code project; JavaScript tetap menjadi fondasi yang relevan.

### 4.2 Status lokal yang pernah dilaporkan pengguna

- Project ZIP awal berhasil diekstrak ke folder lokal `C:\PROJECT PRIBADI\Toolhub Project`.
- Pengguna menjalankan `npm install` dengan hasil instalasi berhasil (236 packages, 0 vulnerabilities pada saat itu).
- Pengguna menjalankan `npm run dev` dan membuka aplikasi pada `http://localhost:3000`.
- Pengguna menyampaikan bahwa beberapa tools dapat dicoba dan berfungsi.

Informasi tersebut merupakan status yang dilaporkan pada saat percakapan sebelumnya. Claude Code tetap harus memverifikasi repository dan menjalankan pemeriksaan terbaru. Jangan menganggap versi dependency atau hasil instalasi tersebut masih sama.

### 4.3 Batasan yang diketahui pada prototype awal

- Favorites dan Recently Used masih menggunakan `localStorage`.
- Autentikasi dan fitur akun sungguhan belum terintegrasi penuh.
- Prisma schema tersedia, tetapi belum dipastikan terhubung ke PostgreSQL.
- History, saved results, dan workspace personal masih perlu diverifikasi/diintegrasikan.
- Belum ada bukti bahwa seluruh 12 tools sudah melalui pengujian edge case secara menyeluruh.
- Produksi/build/deployment belum boleh dianggap siap sebelum diverifikasi.

### 4.4 Tugas audit pertama

Claude Code perlu memeriksa:

1. `package.json`, lockfile, versi Next.js/React/TypeScript dan dependency.
2. Struktur `app/`, `src/`, `components/`, `lib/`, `public/`, `prisma/`, dan folder lain yang benar-benar ada.
3. Registry/katalog tools dan cara setiap tool dihubungkan ke halaman.
4. Implementasi aktual seluruh 12 tools.
5. Cara file diproses, apakah proses lokal di browser atau server.
6. Pemakaian `localStorage`, state management, dan potensi kehilangan data.
7. API routes, validasi input, error handling, dan autentikasi.
8. Prisma schema, environment variables, dan status koneksi database.
9. Test yang tersedia, lint, typecheck, dan production build.
10. Risiko dependency, lisensi library, ukuran bundle, performa, dan aksesibilitas.

Output audit minimal: ringkasan kondisi, tabel `Verified/Partial/Planned/Unknown`, temuan risiko, daftar teknis yang perlu dibereskan, serta rekomendasi milestone berikutnya.

---

## 5. Inventaris tools: 22 item kerja sementara

**Catatan status:** pengguna menyetujui penggunaan angka 22 sebagai inventaris kerja sementara. Angka tersebut bukan bukti bahwa roadmap asli seluruh proyek hanya berisi 22 tools. Daftar 10 kandidat merupakan hasil inventarisasi tambahan yang berhasil dipulihkan dari konteks sebelumnya, bukan daftar historis lengkap yang sudah dikonfirmasi.

### 5.1 Dua belas tools pada prototype awal

| No. | Kategori | Tool | Fungsi yang direncanakan/diimplementasikan pada prototype | Status |
|---:|---|---|---|---|
| 1 | Text & Writing | Word Counter | Menghitung kata, karakter dengan/tanpa spasi, kalimat, dan estimasi waktu baca | Prototype implemented; perlu QA |
| 2 | Text & Writing | Text Formatter | Uppercase, lowercase, title case, sentence case, trim spasi/baris | Prototype implemented; perlu QA |
| 3 | Developer Tools | JSON Formatter | Pretty print, indent 2/4, minify, validasi JSON | Prototype implemented; perlu QA |
| 4 | Developer Tools | Base64 Encoder / Decoder | Encode dan decode Base64 | Prototype implemented; perlu QA |
| 5 | Developer Tools | UUID Generator | Generate beberapa jumlah UUID, copy/download | Prototype implemented; perlu QA |
| 6 | Image & Media | QR Code Generator | Membuat QR dari teks/URL, preview, unduh PNG | Prototype implemented; perlu QA |
| 7 | Image & Media | Image Compressor | Kompresi gambar di browser, keluaran JPEG, dimensi maksimum awal 2400 px | Prototype implemented; perlu QA |
| 8 | Documents | PDF Merger | Menggabungkan minimal dua PDF sesuai urutan pilihan | Prototype implemented; perlu QA |
| 9 | Calculator | Percentage Calculator | Menghitung persentase dari suatu nilai | Prototype implemented; perlu QA |
| 10 | Calculator | Date Calculator | Menghitung selisih tanggal/hari | Prototype implemented; perlu QA |
| 11 | Student & Work | Pomodoro Timer | Fokus 25 menit, istirahat singkat 5 menit, start/pause/reset | Prototype implemented; perlu QA |
| 12 | Business | Invoice Generator | Input pelanggan/item/jumlah/harga, total otomatis, print/save PDF melalui browser | Prototype implemented; perlu QA |

Keterangan penting:
- Image Compressor prototype awal menghasilkan JPEG sehingga transparansi dapat hilang; perlu opsi/penjelasan format output yang tepat.
- Invoice Generator menggunakan print dialog/browser untuk menyimpan PDF, bukan engine PDF khusus.
- Date Calculator prototype awal mungkin hanya mendukung hitungan dasar.
- Catatan ini harus dibandingkan dengan code aktual, bukan dianggap spesifikasi final.

### 5.2 Sepuluh kandidat tools berikutnya

| No. | Kategori | Tool | Status |
|---:|---|---|---|
| 13 | Text & Writing | Text Diff | Candidate |
| 14 | Developer Tools | Regex Tester | Candidate |
| 15 | Image & Media | Image Resizer | Candidate |
| 16 | Documents | PDF Splitter | Candidate |
| 17 | Documents | PDF Compressor | Candidate |
| 18 | Calculator | Unit Converter | Candidate |
| 19 | Student & Work | Citation Generator | Candidate |
| 20 | Student & Work | Study Planner | Candidate |
| 21 | Business | Profit Margin Calculator | Candidate |
| 22 | Business | Quotation Generator | Candidate |

---

## 6. Inisiatif baru: Social Media Content Assistant

### 6.1 Tujuan

Pengguna ingin menambahkan tools pada kategori Image & Media untuk membantu mengelola atau mengimpor konten dari berbagai platform, antara lain Instagram, Facebook, TikTok, SnackVideo, X, Threads, Telegram, Pinterest, dan platform lain di masa depan. Jenis konten yang menjadi perhatian: video, foto, teks artikel, dan tautan/metadata konten.

### 6.2 Prinsip desain kemampuan

Jangan menjanjikan “download semua konten dari semua platform”. Kemampuan berbeda untuk setiap platform, jenis konten, status privasi, hak pengguna, API resmi, serta kebijakan yang dapat berubah.

Rancang satu pengalaman terpadu dengan beberapa mode:

| Mode | Fungsi |
|---|---|
| Social Link Saver | Menyimpan dan mengelola tautan konten, judul/catatan, kategori, dan metadata yang memang tersedia |
| Content Preview | Preview/embed konten bila platform menyediakan cara embed yang resmi dan diperbolehkan |
| Official Account Access | Mengakses data melalui API resmi setelah autentikasi, izin, dan scope yang diperlukan |
| Media Import | Mengimpor file yang diunggah pengguna atau konten yang pengguna berhak mengunduh/ekspor |
| Article/Caption Saver | Menyimpan teks, caption, atau artikel yang diberikan langsung oleh pengguna atau disediakan melalui akses resmi |

### 6.3 Batas teknis, privasi, dan kebijakan

- Tidak melakukan scraping yang melanggar ketentuan platform.
- Tidak mengakses akun privat tanpa izin atau melewati autentikasi.
- Tidak melewati DRM, paywall, token akses, rate limit, atau perlindungan teknis.
- Tidak menghapus watermark/atribusi untuk mengelabui kepemilikan konten.
- Tidak mengunduh ulang atau mendistribusikan konten yang pengguna tidak berhak gunakan.
- Jangan meminta pengguna menyerahkan password akun media sosial ke TOOLHUB. Gunakan OAuth/API resmi jika tersedia.
- Setiap integrasi harus punya matriks platform: API resmi, cakupan izin, tipe konten, preview, ekspor, batas penggunaan, dan status legal/operasional.
- Jika akses langsung tidak didukung, sediakan alternatif yang jujur: simpan tautan, embed resmi, atau impor file dari perangkat pengguna.

### 6.4 Arsitektur rekomendasi

Gunakan adapter per platform agar keterbatasan satu provider tidak merusak modul lainnya. Bentuk umum:

- `PlatformAdapter`: interface standar.
- `ProviderCapabilities`: deklarasi fitur tiap platform.
- `LinkParser`: validasi URL dan identifikasi domain/platform; jangan menjadikan parser sebagai scraper.
- `OfficialApiClient`: integrasi API resmi dengan OAuth/token yang dikelola aman.
- `MediaImport`: menerima upload file lokal yang diizinkan.
- `ContentRecord`: metadata dan tautan yang boleh disimpan.

Jangan mulai dengan seluruh platform sekaligus. Lakukan feasibility review per platform dan bangun integrasi pertama yang memiliki dokumentasi serta izin paling jelas.

---

## 7. Inisiatif baru: Universal File Converter

### 7.1 Tujuan

Pengguna menginginkan kategori Documents yang mencakup konversi berbagai tipe file, dengan CloudConvert sebagai referensi cakupan dan pengalaman. Contoh utama: JPG/JPEG/PNG/WEBP ke PDF dan PDF ke format gambar, serta konversi dokumen, spreadsheet, presentasi, audio, video, arsip, ebook, dan format khusus.

CloudConvert menyatakan pada halaman resminya bahwa layanannya menangani lebih dari 200 format file. Angka ini menjadi referensi keluasan, bukan janji bahwa TOOLHUB harus langsung mendukung 200+ format atau seluruh kombinasi konversi.

### 7.2 Kelompok format sasaran

| Kelompok | Contoh format |
|---|---|
| Image | JPG, JPEG, PNG, WEBP, GIF, BMP, TIFF, SVG, ICO |
| Document | PDF, DOCX, DOC, TXT, RTF, ODT, HTML, EPUB |
| Spreadsheet | XLSX, XLS, CSV, ODS |
| Presentation | PPTX, PPT, ODP |
| Audio | MP3, WAV, FLAC, AAC, OGG |
| Video | MP4, MOV, MKV, AVI, WEBM |
| Archive | ZIP, 7Z, TAR, GZ |
| Ebook / CAD / other | EPUB dan format CAD seperti STL, OBJ, DXF sebagai kandidat lanjutan |

Daftar ini adalah contoh format yang ditargetkan untuk evaluasi; bukan klaim bahwa seluruh input-output pasangan sudah didukung.

### 7.3 Pendekatan implementasi hybrid

1. **Browser-local:** konversi sederhana yang dapat dilakukan dengan aman di perangkat pengguna, terutama gambar dan beberapa format ringan.
2. **Backend internal:** pekerjaan yang memerlukan library/server, file besar, antrean, atau hasil konsisten.
3. **External conversion API:** gunakan layanan seperti CloudConvert hanya untuk format yang belum layak ditangani sendiri atau ketika biaya/manfaatnya masuk akal.

### 7.4 Prinsip penting

- Bangun matriks konversi `input format -> output format`; jangan mengasumsikan semua pasangan bisa dilakukan.
- Beri tahu pengguna jika kualitas, metadata, font, layout, animasi, transparansi, atau hyperlink dapat berubah.
- Validasi ekstensi, MIME type, dan signature file; jangan percaya nama file saja.
- Batasi ukuran file, jumlah file, durasi proses, dan penggunaan memori.
- Proses file dalam temporary storage; hapus otomatis sesuai kebijakan retensi yang jelas.
- Jangan mengirim file ke provider eksternal tanpa penjelasan dan persetujuan yang sesuai.
- Jaga API key provider di server, bukan di browser.
- Sediakan status proses, error yang bisa dipahami, dan download output yang aman.
- Uji file rusak, file besar, format yang tidak didukung, file terenkripsi/password-protected, serta konversi multi-file.

### 7.5 Tahap rilis yang disarankan

- Tahap A: image-to-image dan image-to-PDF / PDF-to-image.
- Tahap B: dokumen dan spreadsheet umum.
- Tahap C: PDF tools lanjutan dan presentasi.
- Tahap D: audio/video dan batch conversion.
- Tahap E: arsip, ebook, CAD, serta integrasi provider eksternal untuk format khusus.

Urutan dapat diubah berdasarkan audit library, lisensi, ukuran dependency, kemampuan hosting, dan biaya operasional.

---

## 8. Fokus katalog: IT Student Toolbox

TOOLHUB perlu menjadi platform yang membantu mahasiswa IT dalam kegiatan belajar, praktikum, tugas, dan proyek. Berikut domain yang perlu diteliti dan diprioritaskan.

### 8.1 Programming & Web Development

Kandidat: HTML/CSS/JS Playground, Markdown Previewer, Regex Tester, Code Formatter, Text Diff, URL Encoder/Decoder, HTML Entity Encoder/Decoder, JSON/YAML/TOML tools, dan diagram previewer.

Catatan: menjalankan kode pengguna memerlukan isolasi yang benar. Jangan menjalankan kode tak tepercaya pada server aplikasi utama. Pertimbangkan browser sandbox/Web Worker atau lingkungan eksekusi terisolasi dengan batas resource. Fitur playground tidak boleh diperkenalkan sebelum model isolasi dan risiko diperiksa.

### 8.2 Database & Data Management

Kandidat: SQL Formatter, SQL Playground untuk database latihan yang terisolasi, CSV-to-JSON, JSON-to-CSV, CSV viewer, SQL INSERT generator, schema visualizer, ERD designer, dan mock data generator.

Catatan: database playground sebaiknya memakai dataset contoh atau database sementara yang terisolasi. Jangan membuka koneksi ke database produksi pengguna tanpa mekanisme autentikasi, scope, dan perlindungan yang memadai.

### 8.3 API & Networking Fundamentals

Kandidat: API Request Tester, IP/Subnet Calculator, URL Parser, HTTP Status/Headers Inspector, DNS Lookup, Timestamp Converter, dan JSON response viewer.

Catatan: API tester dan networking tools memerlukan kontrol untuk mencegah penyalahgunaan server sebagai proxy/SSRF scanner. Batasi target jaringan, validasi URL/IP, dan pertimbangkan menjalankan request dari browser ketika memungkinkan. Hindari fitur yang memindai target pihak lain tanpa otorisasi.

### 8.4 Documentation, Software Engineering & Academic Work

Kandidat: Markdown Editor/Previewer, README Generator, Mermaid Diagram Previewer, UML/Flowchart Designer, SRS Template Helper, User Story/Acceptance Criteria Builder, Citation Generator, Study Planner, Assignment Tracker, dan Flashcard Maker.

### 8.5 Tools lintas kategori

Kandidat dapat berkembang berdasarkan kebutuhan nyata pengguna: file metadata viewer, checksum/hash calculator, image dimension inspector, color converter/picker, data format converter, dan batch renamer.

### 8.6 Ekspansi bidang berikutnya

- **Cybersecurity:** fokus pada edukasi dan pertahanan yang sah, misalnya hash utility, decoder/inspector edukatif, pemeriksa konfigurasi keamanan, security header checker, serta pemeriksaan aset milik sendiri dengan batas yang jelas.
- **Energy:** energy consumption calculator, power/voltage/current calculator, electricity cost estimator, dan tools edukasi energi.
- **Bidang lain:** ditentukan setelah kebutuhan pengguna dan kelayakan teknis diteliti.

---

## 9. Arsitektur dan fondasi teknis yang disarankan

### 9.1 Prinsip arsitektur

Gunakan **modular monolith** terlebih dahulu. Pisahkan domain dan modul secara jelas, tetapi hindari memecah layanan menjadi microservices sebelum ada kebutuhan beban, tim, atau deployment yang membenarkannya.

### 9.2 Stack awal

| Lapisan | Teknologi / arah |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Styling | CSS / pendekatan styling yang sudah ada di repository; jangan ganti tanpa alasan |
| Backend | Next.js route handlers/API |
| Database | PostgreSQL (rencana; verifikasi integrasi aktual) |
| ORM | Prisma (schema tersedia menurut konteks awal; verifikasi) |
| Client state | Mekanisme yang ada; jangan tambah library tanpa kebutuhan |
| File processing | Browser API / library lokal / backend worker / provider eksternal sesuai jenis file |
| Testing | Unit, integration, component/e2e sesuai kemampuan project |

### 9.3 Modul tingkat aplikasi

- `tool-catalog`: metadata tools, kategori, status, persyaratan, dan capability.
- `tool-runtime`: kontrak input/output dan eksekusi tool.
- `tools/*`: implementasi terisolasi per tool atau kelompok domain.
- `file-processing`: validasi, transformasi, temporary storage, antrean, cleanup.
- `platform-integrations`: adapter API resmi per provider.
- `auth`: akun, sesi, OAuth bila dibutuhkan.
- `user-data`: favorite, history, workspace, saved results.
- `shared`: validasi, logging, error handling, utilitas bersama.

Nama folder hanya saran; Claude Code harus menyesuaikan dengan struktur yang sudah ada dan menghindari reorganisasi besar tanpa alasan.

### 9.4 Registry tools

Gunakan registry internal dengan metadata eksplisit, misalnya:

- `id`, `slug`, `name`, `description`, `category`.
- `status`: implemented, beta, planned, deprecated.
- `executionMode`: browser, server, external-api, hybrid.
- `inputSchema`, `outputSchema` atau kontrak tipe yang sepadan.
- `supportsBatch`, `supportsGuest`, `requiresAuth`, `privacyNotes`.

Jangan memilih handler berdasarkan kode arbitrary yang berasal dari input pengguna. Slug harus dipetakan ke handler yang sudah terdaftar dan tervalidasi.

### 9.5 Database dan fitur akun

Entitas yang pernah direncanakan untuk dievaluasi:

- `users`
- `sessions` (jika sistem autentikasi memerlukannya)
- `categories`
- `tools`
- `favorites`
- `workspaces`
- `workspace_tools`
- `tool_runs` / `history`
- `saved_results`

Tabel subscription, payment, workflow builder, reviews, notifications, analytics, dan tool versions adalah kebutuhan fase lebih lanjut, bukan kewajiban MVP. Jangan menambahkan semua tabel sekaligus tanpa use case.

### 9.6 API awal yang pernah diusulkan

Contoh kontrak awal untuk dievaluasi, bukan endpoint yang dijamin sudah ada:

- `GET /tools`
- `GET /tools/:slug`
- `GET /categories`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /favorites`
- `POST /favorites`
- `DELETE /favorites/:toolId`
- `GET /workspaces`
- `POST /workspaces`
- `PATCH /workspaces/:id`
- `POST /workspaces/:id/tools`
- `DELETE /workspaces/:id/tools/:toolId`
- `GET /history`
- `GET /saved-results`
- `POST /saved-results`

Rute final wajib mengikuti desain resource, validasi, autentikasi, dan konvensi yang dipilih setelah audit.

---

## 10. Keamanan, privasi, dan kualitas

Persyaratan lintas tools:

1. Validasi input di client dan server; server tidak boleh mempercayai validasi client.
2. Jangan menyimpan password atau API key provider secara plaintext.
3. Gunakan environment variables untuk secret; jangan commit `.env`.
4. Batasi ukuran dan jenis file; cek MIME dan signature/magic bytes.
5. Terapkan rate limit dan batas resource untuk endpoint yang mahal.
6. Gunakan temporary storage dengan masa retensi sesingkat yang dibutuhkan dan cleanup otomatis.
7. Jelaskan pemrosesan lokal vs server vs pihak ketiga kepada pengguna.
8. Hindari pengiriman file pribadi ke API eksternal tanpa consent yang jelas.
9. Jangan log isi file, token, password, atau data sensitif.
10. Pastikan error tidak membocorkan stack trace, credential, atau path internal.
11. Periksa lisensi library dan ketentuan provider sebelum digunakan.
12. Tambahkan test untuk file rusak, input kosong, input ekstrem, dan kegagalan provider.
13. Untuk integrasi sosial, ikuti dokumentasi, izin, kebijakan, dan ketentuan terbaru tiap platform.
14. Untuk tools IT/networking, cegah pemakaian server TOOLHUB sebagai proxy untuk mengakses target internal atau pihak ketiga tanpa otorisasi.

---

## 11. Pembagian peran kolaborasi

Kolaborasi ini bukan berarti dua AI mengedit repository bersamaan tanpa koordinasi. Pengguna tetap menjadi pemilik keputusan dan pengendali repository.

### 11.1 ChatGPT — Product/Architecture/Review Partner

Tanggung jawab utama:

- Menjaga konteks visi, kebutuhan pengguna, keputusan produk, dan prioritas.
- Mengubah ide menjadi requirement, acceptance criteria, dan rencana implementasi.
- Membantu desain arsitektur, kontrak modul, model data, API, dan alur data.
- Menulis atau mengusulkan kode dan perubahan yang dapat ditinjau.
- Membantu debugging berdasarkan source code, log, screenshot, dan hasil test yang diberikan.
- Melakukan review logika, keamanan, UX, konsistensi, dan potensi regresi.
- Menyusun dokumentasi, changelog, test checklist, dan handoff task.

Batasan:

- ChatGPT tidak otomatis memiliki akses ke folder lokal pengguna atau terminal VS Code.
- Perubahan lokal perlu dilakukan melalui file yang diunggah, patch yang diterapkan pengguna, atau tool integrasi yang memang tersedia.
- ChatGPT tidak boleh mengklaim telah menjalankan tes di mesin pengguna jika belum menerima bukti hasilnya.

### 11.2 Claude Code — Repository/Implementation Agent

Tanggung jawab yang diharapkan ketika dijalankan oleh pengguna di repository:

- Membaca dan menelusuri keseluruhan source code aktual.
- Menjalankan perintah lokal seperti lint, typecheck, test, dan build sesuai script yang tersedia.
- Mengimplementasikan perubahan langsung pada file repository.
- Mengidentifikasi file terkait, dependency, efek samping, dan regresi.
- Menjalankan test dan melaporkan hasil serta command yang digunakan.
- Memperbarui dokumentasi teknis dan menyampaikan daftar file yang diubah.

Claude Code harus mematuhi batasan scope dan meminta persetujuan untuk keputusan berdampak besar, penambahan layanan berbayar, migrasi database destruktif, perubahan arsitektur besar, atau perubahan yang berisiko menghapus data.

### 11.3 Pengguna — Product Owner / Final Decision Maker

Tanggung jawab:

- Menentukan kebutuhan, prioritas, dan batas biaya.
- Menjalankan project lokal dan menyediakan source terbaru/log/screenshot bila diperlukan.
- Meninjau hasil fitur dan memastikan alur sesuai harapan.
- Menyetujui penggunaan API eksternal, biaya, kebijakan data, dan perubahan penting.
- Menjadi satu-satunya pihak yang menetapkan keputusan final produk.

### 11.4 Aturan sinkronisasi

- Satu sumber kebenaran: repository Git.
- Jangan biarkan ChatGPT dan Claude Code mengubah file yang sama pada saat bersamaan.
- Claude Code mengerjakan branch/task yang jelas; ChatGPT melakukan review dari diff atau file terbaru yang dibagikan.
- Setiap perubahan harus memiliki tujuan, daftar file, test, dan hasil.
- Gunakan commit kecil dan pesan commit deskriptif.
- Simpan keputusan penting di `docs/decisions/` atau dokumen project yang disepakati.
- Jangan melakukan force push, reset destruktif, atau migrasi data tanpa persetujuan pengguna.

---

## 12. Workflow kerja per fitur

Setiap fitur mengikuti siklus berikut:

1. **Discovery:** jelaskan masalah pengguna dan target hasil.
2. **Requirement:** definisikan input, output, batasan, error state, privacy, dan acceptance criteria.
3. **Feasibility:** periksa library, API, lisensi, ketentuan, biaya, dan kompleksitas.
4. **Design:** tentukan alur minimal, kontrak tipe/API, dan lokasi integrasi.
5. **Implementation:** implementasi dalam scope kecil, tanpa refactor tidak terkait.
6. **Verification:** jalankan lint, typecheck, test, build, dan uji manual yang relevan.
7. **Review:** ChatGPT/Claude Code memeriksa diff, keamanan, edge cases, dan regresi.
8. **Documentation:** update katalog, README, changelog, dan catatan keputusan.
9. **Release:** pengguna menyetujui hasil sebelum dianggap selesai.

### Definisi selesai (Definition of Done)

Sebuah tool tidak boleh diberi status `Implemented` hanya karena halaman atau tombolnya sudah muncul. Minimal:

- Fungsi inti berjalan untuk kasus normal.
- Input tidak valid ditangani dengan pesan yang jelas.
- Loading, success, empty, dan error states tersedia sesuai kebutuhan.
- File/hasil dapat diunduh atau disimpan sesuai spesifikasi.
- Tidak ada secret atau data sensitif yang terekspos.
- Test yang sesuai lulus.
- Responsif dan dapat digunakan dengan keyboard dasar.
- Dokumentasi penggunaan singkat tersedia.
- Batasan yang belum diselesaikan ditulis jelas.

---

## 13. Roadmap kerja yang diusulkan

Roadmap ini bersifat adaptif. Milestone bukan sekadar target jumlah tools; kualitas, stabilitas, biaya, dan penggunaan nyata harus menjadi ukuran.

| Tahap | Fokus | Hasil yang diharapkan |
|---|---|---|
| 0 | Audit prototype | Peta source, status 12 tools, test baseline, risiko, dan prioritas teknis |
| 1 | Stabilitas core | Perbaikan bug dan QA untuk 12 tools awal; registry/kontrak yang konsisten |
| 2 | Kandidat 10 tools | Prioritas kandidat berdasarkan manfaat, reuse library, kompleksitas dan QA |
| 3 | Universal Converter v1 | Image-to-image, image-to-PDF, PDF-to-image, validasi dan lifecycle file |
| 4 | IT Student Toolbox | Programming, database, API/networking fundamentals, diagram dan academic utilities |
| 5 | Social Media Assistant feasibility + v1 | Matriks kapabilitas per platform; link saver/preview/official API/import yang sah |
| 6 | Account & workspace foundation | Auth, favorites tersinkron, history, saved results, workspace, jika kebutuhan sudah jelas |
| 7 | Future verticals | Defensive cybersecurity, energy, dan kategori lain setelah riset kebutuhan |

Tahap 6 dapat maju lebih awal bila kebutuhan personalisasi/penyimpanan mengharuskannya. Urutan akhir diputuskan setelah audit dan estimasi.

---

## 14. Prioritas teknis pertama setelah audit

Claude Code diminta membuat rekomendasi berperingkat, tetapi area berikut layak diperiksa terlebih dahulu:

**P0 — Keandalan baseline**
- Pastikan `npm run dev`, lint, typecheck, test, dan build berjalan.
- Catat error yang ada sebelum perubahan.
- Audit 12 tool awal dan pastikan tidak ada tombol palsu atau alur yang hanya mock.

**P1 — Fondasi tool modular**
- Periksa registry/katalog dan standardisasi tipe input/output.
- Pastikan penambahan tool baru tidak memerlukan perubahan tersebar di banyak file.
- Definisikan status tool dan metadata execution mode.

**P2 — File-processing foundation**
- Audit dependency PDF/image saat ini.
- Rancang validasi file, batas ukuran, error handling, dan cleanup.
- Implementasikan satu vertical slice converter kecil sebelum membangun semua kategori.

**P3 — IT Student Toolbox backlog**
- Susun daftar kandidat berdasarkan mata kuliah/kebutuhan mahasiswa IT.
- Hindari duplikasi dengan tools yang sudah ada.
- Identifikasi mana yang benar-benar unik dan bernilai.

**P4 — Social integrations research**
- Buat platform capability matrix.
- Verifikasi API, OAuth, izin, rate limits, dan kebijakan secara langsung dari dokumentasi resmi saat implementasi.
- Jangan menulis downloader universal lebih dulu.

---

## 15. Prompt awal yang dapat diberikan kepada Claude Code

> Kamu adalah implementation and repository audit partner untuk proyek TOOLHUB. Baca dokumen `TOOLHUB_Collaboration_Handoff.md` secara menyeluruh dan gunakan itu sebagai konteks produk, bukan sebagai bukti bahwa semua rencana sudah diterapkan.
>
> Tahap pertama hanya audit dan analisis. Periksa repository yang sedang terbuka, verifikasi stack dan struktur, identifikasi implementasi aktual 12 tools, status API/auth/database/Prisma, penyimpanan lokal, file-processing, dependency, test, lint, typecheck, dan production build. Jangan mengubah source code pada tahap pertama kecuali pengguna secara eksplisit meminta.
>
> Berikan laporan dengan bagian: (1) ringkasan kondisi, (2) arsitektur aktual, (3) status tiap 12 tools, (4) status backend/database/auth, (5) kualitas dan test baseline, (6) risiko keamanan/privasi/performa/lisensi, (7) gap terhadap proposal, (8) rekomendasi prioritas, (9) rencana implementasi 2-3 task pertama beserta file yang kemungkinan disentuh, (10) pertanyaan keputusan yang benar-benar memerlukan pengguna.
>
> Labeli temuan sebagai Verified, Partially verified, Planned, atau Unknown. Sertakan command dan hasil test yang benar-benar dijalankan. Jangan mengklaim lulus bila command tidak dijalankan. Hindari refactor besar, dependency baru, API berbayar, migrasi destruktif, atau perubahan UI besar tanpa alasan dan persetujuan.
>
> Setelah audit selesai, tunggu keputusan Product Owner sebelum mulai implementasi.

---

## 16. Referensi teknis awal

Sumber berikut digunakan sebagai titik awal riset. Ketentuan dan dokumentasi dapat berubah; verifikasi ulang saat fitur akan diimplementasikan.

- CloudConvert — File Conversion API: https://cloudconvert.com/apis/file-conversion
- CloudConvert — API documentation: https://cloudconvert.com/api/v2
- Meta — Automated Data Collection Terms: https://www.facebook.com/legal/automated_data_collection_terms
- TikTok — Developer Terms of Service: https://t.tiktok.com/legal/page/global/tik-tok-developer-terms-of-service/en
- Telegram — API Terms of Service: https://core.telegram.org/api/terms
- Telegram — Terms of Service for Content Licensing: https://telegram.org/tos/content-licensing

Catatan riset: CloudConvert menyatakan dukungan lebih dari 200 format pada halaman API resminya. Meta secara eksplisit mensyaratkan izin tertulis untuk automated data collection dalam ketentuannya. Telegram membatasi penggunaan data platform dan mengharuskan aplikasi pihak ketiga mematuhi ketentuan API/privasi. Setiap provider lain harus diperiksa secara terpisah; jangan menggeneralisasi kebijakan satu platform ke semua platform.

---

## 17. Penutup dan prinsip keputusan

TOOLHUB dikembangkan sebagai produk jangka panjang: katalog tools yang berguna, dapat dipercaya, mudah digunakan, aman, dan mudah dikembangkan.

**Prioritas utama:** fungsionalitas nyata, fondasi yang dapat dirawat, keamanan dan privasi, lalu ekspansi katalog secara terukur. ChatGPT menjaga arah produk dan review; Claude Code mengaudit serta mengimplementasikan repository; pengguna tetap menjadi Product Owner dan pengambil keputusan akhir.
