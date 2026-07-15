-- Script untuk membuat tabel di Supabase SQL Editor

-- 1. Buat Tabel MonevEntry
CREATE TABLE IF NOT EXISTS monev_entry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "namaSekolah" TEXT NOT NULL,
  jenjang TEXT NOT NULL,
  alamat TEXT NOT NULL,
  "namaPetugas" TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  "namaKepsek" TEXT NOT NULL,
  "jawabanUmum" JSONB NOT NULL,
  "jawabanKhusus" JSONB NOT NULL,
  "catatanKritis" TEXT,
  rekomendasi TEXT,
  "statusOtomatis" TEXT NOT NULL,
  "statusFinal" TEXT NOT NULL,
  "alasanOverride" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Atur Policy (Jika Row Level Security diaktifkan)
-- Karena aplikasi ini bersifat open-access (public read/write), kita set RLS ke public allow
ALTER TABLE monev_entry ENABLE ROW LEVEL SECURITY;

-- Allow insert untuk semua (anon)
CREATE POLICY "Allow public insert" ON monev_entry
  FOR INSERT WITH CHECK (true);

-- Allow select untuk semua (anon)
CREATE POLICY "Allow public select" ON monev_entry
  FOR SELECT USING (true);
