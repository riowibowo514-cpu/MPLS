export type Jenjang = 'TK' | 'SD' | 'SMP' | 'SMA/K';

export interface InstrumenItem {
  id: string;
  pertanyaan: string;
  jenjangTarget?: Jenjang[];
}

export interface KategoriInstrumen {
  id: string;
  judul: string;
  items: InstrumenItem[];
}

export const INSTRUMEN_BARU: KategoriInstrumen[] = [
  {
    id: 'perencanaan',
    judul: 'I. PERENCANAAN',
    items: [
      { id: 'p1', pertanyaan: 'SK Panitia MPLS ditetapkan Kepala Sekolah.' },
      { id: 'p2', pertanyaan: 'Program MPLS disusun dan disahkan.' },
      { id: 'p3', pertanyaan: 'Sosialisasi kepada orang tua dilaksanakan minimal H-5.' },
      { id: 'p4', pertanyaan: 'Jadwal, materi, narasumber dan metode tersedia.' },
      { id: 'p5', pertanyaan: 'Anggaran MPLS tersedia.' },
    ]
  },
  {
    id: 'pelaksanaan',
    judul: 'II. PELAKSANAAN MATERI',
    items: [
      { id: 'pm1', pertanyaan: 'Potensi murid dikenali.' },
      { id: 'pm2', pertanyaan: 'Kurikulum diperkenalkan.' },
      { id: 'pm3', pertanyaan: 'Warga sekolah diperkenalkan.' },
      { id: 'pm4', pertanyaan: 'Lingkungan sekolah diperkenalkan.' },
      { id: 'pm5', pertanyaan: 'G7KAIH dilaksanakan.' },
      { id: 'pm6', pertanyaan: 'Pagi Ceria dilaksanakan.' },
      { id: 'pm7', pertanyaan: 'Sopan Santun Bermedia Sosial disampaikan.' },
      { id: 'pm8', pertanyaan: 'Budaya 5S diterapkan.' },
      { id: 'pm9', pertanyaan: 'Gerakan ASRI dilaksanakan.' },
      { id: 'pm10', pertanyaan: 'Gerakan Rukun Sama Teman dilaksanakan.' },
      { id: 'pm11', pertanyaan: 'Materi pilihan sesuai jenjang.' },
    ]
  },
  {
    id: 'asesmen',
    judul: 'III. ASESMEN AWAL',
    items: [
      { id: 'a1', pertanyaan: 'Asesmen profil murid.' },
      { id: 'a2', pertanyaan: 'Asesmen sosial emosional.' },
      { id: 'a3', pertanyaan: 'Asesmen literasi.' },
      { id: 'a4', pertanyaan: 'Asesmen numerasi.' },
      { id: 'a5', pertanyaan: 'Identifikasi bakat dan minat.' },
      { id: 'a6', pertanyaan: 'Tes kebugaran/IMT/Fleksibilitas sesuai ketentuan.' },
    ]
  },
  {
    id: 'kepatuhan',
    judul: 'IV. KEPATUHAN',
    items: [
      { id: 'k1', pertanyaan: 'Tidak ada perpeloncoan.' },
      { id: 'k2', pertanyaan: 'Tidak ada pungutan.' },
      { id: 'k3', pertanyaan: 'Tidak ada atribut memberatkan.' },
      { id: 'k4', pertanyaan: 'Tidak melibatkan alumni.' },
      { id: 'k5', pertanyaan: 'OSIS hanya sebagai pendamping.', jenjangTarget: ['SMP', 'SMA/K'] },
    ]
  },
  {
    id: 'outcome',
    judul: 'V. OUTCOME',
    items: [
      { id: 'o1', pertanyaan: 'Murid merasa aman dan nyaman.' },
      { id: 'o2', pertanyaan: 'Murid mengenal guru dan teman.' },
      { id: 'o3', pertanyaan: 'Murid mengenal tata tertib.' },
      { id: 'o4', pertanyaan: 'Murid siap mengikuti pembelajaran.' },
      { id: 'o5', pertanyaan: 'Sekolah menyusun laporan dan evaluasi.' },
    ]
  }
];

export function getItemsForJenjang(kategori: KategoriInstrumen, jenjang: Jenjang): InstrumenItem[] {
  return kategori.items.filter(item => !item.jenjangTarget || item.jenjangTarget.includes(jenjang));
}

export function calculateStatus(
  jawabanUmum: Record<string, { jawaban?: boolean, catatan?: string }>,
  jenjang: Jenjang
): { status: 'SANGAT RAMAH' | 'CUKUP RAMAH' | 'KURANG', percentageUmum: number, label: string } {
  let countYa = 0;
  let totalSoal = 0;

  INSTRUMEN_BARU.forEach(kategori => {
    const validItems = getItemsForJenjang(kategori, jenjang);
    validItems.forEach(item => {
      totalSoal++;
      if (jawabanUmum[item.id]?.jawaban === true) countYa++;
    });
  });
  
  const percentageUmum = totalSoal === 0 ? 0 : Math.round((countYa / totalSoal) * 100);

  // Aturan penilaian 32 soal (berdasarkan instruksi: sistem hitung tetap)
  // SANGAT RAMAH = 100% (32/32)
  // CUKUP RAMAH = >= 70%
  // KURANG = < 70%

  if (percentageUmum < 70) {
    return {
      status: 'KURANG',
      percentageUmum,
      label: `${countYa}/${totalSoal} (${percentageUmum}%)`
    };
  }

  const isSangatRamah = countYa === totalSoal;

  if (isSangatRamah) {
    return {
      status: 'SANGAT RAMAH',
      percentageUmum,
      label: `${countYa}/${totalSoal} (${percentageUmum}%)`
    };
  }

  return {
    status: 'CUKUP RAMAH',
    percentageUmum,
    label: `${countYa}/${totalSoal} (${percentageUmum}%)`
  };
}
