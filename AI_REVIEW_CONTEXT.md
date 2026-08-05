# BGP Sumbar - Sistem Evaluasi Kegiatan (MPLS & PKG)
# Konteks Proyek untuk Evaluasi AI (AI Review Context)

Dokumen ini berisi rangkuman arsitektur, skema *database*, dan fitur utama dari aplikasi Sistem Evaluasi Kegiatan berbasis web. Dokumen ini dirancang agar ringan dan mudah dibaca oleh AI lain (LLM) untuk memberikan masukan, kritik, atau saran pengembangan.

## 1. Ringkasan Proyek (Project Overview)
- **Tujuan**: Membangun sistem yang memungkinkan admin membuat instrumen survei/evaluasi yang sangat dinamis (seperti Google Forms) khusus untuk berbagai kegiatan (misal: MPLS, PKG), lalu membagikan tautan publik untuk diisi responden, dan secara otomatis menghasilkan *Executive Summary* dalam bentuk grafik (Radar, Bar, Pie) serta mengekspor data mentahnya ke Excel/PDF.
- **Tech Stack**:
  - Frontend: Next.js (App Router), React, Tailwind CSS
  - Backend/Database: Supabase (PostgreSQL), Prisma/Supabase-JS
  - Charts: Chart.js (react-chartjs-2)
  - Exports: xlsx (Excel), jspdf & jspdf-autotable (PDF)
  - Deployment: Vercel

## 2. Fitur Utama (Core Features)
1. **Dynamic Form Builder**: Admin dapat membuat *Section* dan *Item Pertanyaan* dengan berbagai tipe jawaban (Likert Skala 4, Pilihan Ganda, Esai/Teks). Fitur drag-and-drop/urutan (order) diterapkan.
2. **Public Form**: Responden dapat mengisi survei melalui sistem *Multi-step form* (satu *section* per halaman) dengan validasi wajib isi.
3. **Analytics Dashboard**: 
   - Lapis 1: *Radar Chart* merangkum rata-rata nilai per-bagian survei (Kinerja Keseluruhan).
   - Lapis 2: *Top & Bottom Insights* (Otomatis mendeteksi 3 kekuatan utama dan 3 area kelemahan berdasarkan rata-rata skor Likert).
   - Lapis 3: *Mini Progress Bars* untuk setiap rincian skor pertanyaan.
4. **Data Export**: Kemampuan *export* otomatis ke .xlsx (menyusun baris dan kolom dinamis berdasarkan instrumen yang dibuat) dan .pdf (*Executive Summary*).

## 3. Skema Database (Database Schema) - Supabase PostgreSQL
Berikut adalah tabel-tabel utama yang berelasi:
- `kegiatan`: Menyimpan data kegiatan (id, nama_kegiatan, kategori_program [MPLS/PKG], created_at).
- `instrumen`: Berelasi dengan *kegiatan*. Mewakili 1 form survei utuh.
- `instrumen_metadata_field`: Field identitas kustom untuk responden (contoh: Nama, NPSN, Jenjang).
- `instrumen_section`: Bagian dari form survei (contoh: 1. Sarana, 2. Konsumsi).
- `instrumen_item`: Pertanyaan individu di dalam *section*. Memiliki `tipe_jawaban` ('likert4', 'pilihan_ganda', 'esai').
- `pengisian`: Menyimpan sesi responden saat *submit* survei beserta nilai dari *metadata_field*.
- `jawaban`: Berelasi dengan *pengisian* dan *instrumen_item*. Menyimpan `nilai_skor` (1-4) atau `nilai_teks`.

## 4. Keamanan & Performa (Security & Performance)
- **RLS (Row Level Security)**: Diterapkan di Supabase. Rute admin dilindungi oleh JWT/Session, sedangkan rute publik (mengisi form) dapat melakukan INSERT ke tabel `pengisian` dan `jawaban` tetapi tidak dapat melihat data responden lain.
- **Rendering**: Menggunakan Server Components dan Client Components dari Next.js 15. Form *wizard* di-render di sisi *client* untuk transisi yang cepat.

## 5. Permintaan Masukan (Request for Feedback)
Mohon berikan evaluasi, kritik, atau saran untuk aplikasi ini dari segi:
1. **User Experience (UX) & UI Design**: Apakah struktur *multi-step form* dan Dasbor 3 Lapis (*Radar + Top/Bottom*) sudah optimal untuk *executive summary*?
2. **Architecture**: Apakah skema relasional EAV (Entity-Attribute-Value) yang dimodifikasi ini sudah efisien untuk sistem *dynamic form builder* skala menengah?
3. **Scalability**: Apa yang harus diantisipasi jika dalam satu hari ada 5.000 responden yang *submit* survei secara bersamaan ke Supabase?
4. **Saran Fitur Lanjutan**: Fitur analitik atau AI apa lagi yang relevan ditambahkan untuk memudahkan pimpinan mengambil keputusan dari data kuesioner?
