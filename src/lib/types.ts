export type Role = 'admin' | 'petugas' | 'pimpinan';

export interface User {
  id: string;
  username: string;
  nama_lengkap: string;
  role: Role;
  instansi_wilayah?: string;
  created_at: string;
}

export interface Kegiatan {
  id: string;
  nama_kegiatan: string;
  deskripsi?: string;
  tahun: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
}

export interface Instrumen {
  id: string;
  kegiatan_id: string;
  nama_instrumen: string;
  deskripsi?: string;
  created_at: string;
}

export type TipeFieldMetadata = 'text' | 'date' | 'dropdown' | 'number';

export interface InstrumenMetadataField {
  id: string;
  instrumen_id: string;
  label_field: string;
  tipe_field: TipeFieldMetadata;
  opsi_dropdown?: string[];
  urutan: number;
  wajib_diisi: boolean;
}

export interface InstrumenSection {
  id: string;
  instrumen_id: string;
  nama_section: string;
  urutan: number;
}

export type TipeJawabanItem = 'likert4' | 'likert5' | 'esai' | 'pilihan_ganda';

export interface InstrumenItem {
  id: string;
  section_id: string;
  teks_pertanyaan: string;
  tipe_jawaban: TipeJawabanItem;
  opsi_jawaban?: string[];
  butuh_catatan_bukti: boolean;
  urutan: number;
}

export interface Pengisian {
  id: string;
  instrumen_id: string;
  petugas_id: string | null;
  tanggal_pengisian: string;
  metadata_values: Record<string, string>;
}

export interface Jawaban {
  id: string;
  pengisian_id: string;
  item_id: string;
  nilai_skor?: number;
  nilai_teks?: string;
  catatan_bukti?: string;
}

// Komposit tipe untuk Frontend
export interface InstrumenFull extends Instrumen {
  metadata_fields: InstrumenMetadataField[];
  sections: (InstrumenSection & {
    items: InstrumenItem[];
  })[];
}
