-- Script untuk merancang tabel-tabel Platform Monev BGTK Dinamis
-- CATATAN PENTING: TIdak ada perintah DROP atau ALTER untuk tabel 'monev_entry' (MPLS lama).

-- 1. Tabel User (Untuk Autentikasi Custom & Role Management)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'petugas', 'pimpinan')),
  instansi_wilayah TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Kegiatan (Program Monev)
CREATE TABLE IF NOT EXISTS kegiatan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_kegiatan TEXT NOT NULL,
  deskripsi TEXT,
  tahun TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Instrumen (Form Utama)
CREATE TABLE IF NOT EXISTS instrumen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kegiatan_id UUID REFERENCES kegiatan(id) ON DELETE CASCADE,
  nama_instrumen TEXT NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Metadata Field (Header dinamis seperti Nama Sekolah, Nama Petugas, Tanggal)
CREATE TABLE IF NOT EXISTS instrumen_metadata_field (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrumen_id UUID REFERENCES instrumen(id) ON DELETE CASCADE,
  label_field TEXT NOT NULL,
  tipe_field TEXT NOT NULL CHECK (tipe_field IN ('text', 'date', 'dropdown', 'number')),
  opsi_dropdown JSONB,
  urutan INTEGER NOT NULL DEFAULT 0,
  wajib_diisi BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabel Section (Pengelompokan Pertanyaan)
CREATE TABLE IF NOT EXISTS instrumen_section (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrumen_id UUID REFERENCES instrumen(id) ON DELETE CASCADE,
  nama_section TEXT NOT NULL,
  urutan INTEGER NOT NULL DEFAULT 0
);

-- 6. Tabel Item (Pertanyaan/Aspek yang dinilai)
CREATE TABLE IF NOT EXISTS instrumen_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES instrumen_section(id) ON DELETE CASCADE,
  teks_pertanyaan TEXT NOT NULL,
  tipe_jawaban TEXT NOT NULL CHECK (tipe_jawaban IN ('likert4', 'likert5', 'esai', 'pilihan_ganda')),
  opsi_jawaban JSONB,
  butuh_catatan_bukti BOOLEAN NOT NULL DEFAULT false,
  urutan INTEGER NOT NULL DEFAULT 0
);

-- 7. Tabel Pengisian (Header transaksi saat petugas mensubmit form)
CREATE TABLE IF NOT EXISTS pengisian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrumen_id UUID REFERENCES instrumen(id) ON DELETE CASCADE,
  petugas_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tanggal_pengisian TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata_values JSONB NOT NULL
);

-- 8. Tabel Jawaban (Detail transaksi per item)
CREATE TABLE IF NOT EXISTS jawaban (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengisian_id UUID REFERENCES pengisian(id) ON DELETE CASCADE,
  item_id UUID REFERENCES instrumen_item(id) ON DELETE CASCADE,
  nilai_skor INTEGER,
  nilai_teks TEXT,
  catatan_bukti TEXT
);

-- 9. (Opsional) Mengaktifkan Row Level Security (RLS) jika dibutuhkan nanti.
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen_metadata_field ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengisian ENABLE ROW LEVEL SECURITY;
ALTER TABLE jawaban ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on kegiatan" ON kegiatan FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen" ON instrumen FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen_metadata_field" ON instrumen_metadata_field FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen_section" ON instrumen_section FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen_item" ON instrumen_item FOR ALL USING (true);
CREATE POLICY "Allow public all on pengisian" ON pengisian FOR ALL USING (true);
CREATE POLICY "Allow public all on jawaban" ON jawaban FOR ALL USING (true);
CREATE POLICY "Allow public all on users" ON users FOR ALL USING (true);
