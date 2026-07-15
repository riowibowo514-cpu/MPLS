import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Jika credentials kosong (belum diisi di .env.local), client tetap terbuat tapi akan error saat dipakai
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MonevEntryData = {
  id?: string;
  namaSekolah: string;
  jenjang: string;
  alamat: string;
  namaPetugas: string;
  tanggal: string;
  namaKepsek: string;
  jawabanUmum: Record<string, { jawaban?: boolean, catatan?: string }>;
  jawabanKhusus: Record<string, any>;
  catatanKritis: string;
  rekomendasi: string;
  statusOtomatis: string;
  statusFinal: string;
  alasanOverride: string;
  createdAt?: string;
};
