import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Jika credentials kosong (belum diisi di .env.local), client tidak terbuat untuk menghindari crash saat build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : createClient('https://placeholder-url.supabase.co', 'placeholder-key');


export type MonevEntryData = {
  id?: string;
  namaSekolah: string;
  npsn: string;
  jenjang: string;
  kabKota: string;
  alamat: string;
  namaPetugas: string;
  tanggal: string; // Hari & tanggal Monev
  namaKepsek: string;
  jawabanUmum: Record<string, { jawaban?: boolean | string, catatan?: string }>;
  jawabanKhusus: Record<string, any>;
  catatanKritis: string;
  rekomendasi: string;
  statusOtomatis: string;
  statusFinal: string;
  alasanOverride: string;
  materiTes: {
    materiUtama: { rincian: string; waktu: string };
    materiPilihan: { rincian: string; waktu: string };
    rangkianTes: { rincian: string; waktu: string };
  };
  permasalahanSolusi: {
    perencanaan: { rincian: string; solusi: string };
    pelaksanaan: { rincian: string; solusi: string };
  };
  createdAt?: string;
};
