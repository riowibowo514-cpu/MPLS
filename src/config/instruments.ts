export type Jenjang = 'TK' | 'SD' | 'SMP' | 'SMA/K';
export type TipeJawaban = 'ya-tidak' | 'skala-4';

export interface InstrumenItem {
  id: string;
  pertanyaan: string;
  jenjangTarget?: Jenjang[];
}

export interface KategoriInstrumen {
  id: string;
  judul: string;
  tipeJawaban: TipeJawaban;
  items: InstrumenItem[];
}

export const INSTRUMEN_BARU: KategoriInstrumen[] = [
  {
    id: 'perencanaan',
    judul: 'A. Perencanaan Kegiatan',
    tipeJawaban: 'ya-tidak',
    items: [
      { id: 'a1', pertanyaan: 'Membentuk kepanitiaan yang dibuktikan dari SK Panitia MPLS' },
      { id: 'a2', pertanyaan: 'Panitia terdiri dari kepala sekolah, guru, tenaga kependidikan, dan unsur terkait' },
      { id: 'a3', pertanyaan: 'Sekolah menyusun program dan jadwal MPLS selama 5 hari' },
      { id: 'a4', pertanyaan: 'Program MPLS mengacu pada Permendikdasmen No.12 Tahun 2026' },
      { id: 'a5', pertanyaan: 'Materi MPLS Ramah mengacu Kepmendikdasmen No.198 Tahun 2026' },
      { id: 'a6', pertanyaan: 'Sekolah melaksanakan sosialisasi kepada orang tua sebelum MPLS' },
      { id: 'a7', pertanyaan: 'Sekolah menyiapkan narasumber dan fasilitator' },
      { id: 'a8', pertanyaan: 'Sekolah menyiapkan mekanisme pengaduan apabila terjadi pelanggaran' }
    ]
  },
  {
    id: 'pelaksanaan',
    judul: 'B. Pelaksanaan Kegiatan',
    tipeJawaban: 'skala-4',
    items: [
      { id: 'b9', pertanyaan: 'Kegiatan MPLS berjalan tertib' },
      { id: 'b10', pertanyaan: 'Peserta didik memperoleh sambutan yang ramah' },
      { id: 'b11', pertanyaan: 'Seluruh kegiatan berlangsung aman dan nyaman' },
      { id: 'b12', pertanyaan: 'Guru menjadi pendamping utama selama MPLS' },
      { id: 'b13', pertanyaan: 'Peserta aktif mengikuti kegiatan' },
      { id: 'b14', pertanyaan: 'Pembelajaran berlangsung menyenangkan' },
      { id: 'b15', pertanyaan: 'Tidak terdapat diskriminasi terhadap peserta didik' },
      { id: 'b16', pertanyaan: 'Seluruh kegiatan sesuai jadwal' },
      { id: 'b17', pertanyaan: 'Kegiatan mencerminkan budaya sekolah yang positif' },
      { id: 'b18', pertanyaan: 'Dilaksanakan refleksi kegiatan MPLS harian' },
      { id: 'b19', pertanyaan: 'Pelaksanaan MPLS selama 5 hari' },
      { id: 'b20', pertanyaan: 'Lokasi seluruh kegiatan MPLS berada di lingkungan Sekolah' },
      { id: 'b21', pertanyaan: 'Sekolah menentukan seragam dan atribut yang digunakan oleh Murid baru dalam pelaksanaan MPLS' },
      { id: 'b22', pertanyaan: 'Seragam dan atribut tidak memberatkan Murid atau orang tua/wali Murid' }
    ]
  }
];

export function getItemsForJenjang(kategori: KategoriInstrumen, jenjang: Jenjang): InstrumenItem[] {
  return kategori.items.filter(item => !item.jenjangTarget || item.jenjangTarget.includes(jenjang));
}

// Menghitung status berdasarkan skor
// Ya = 4, Tidak = 0
// SS = 4, S = 3, TS = 2, STS = 1
export function calculateStatus(
  jawabanUmum: Record<string, { jawaban?: boolean | string, catatan?: string }>,
  jenjang: Jenjang
): { status: 'SANGAT RAMAH' | 'CUKUP RAMAH' | 'KURANG', percentageUmum: number, label: string } {
  let totalSkor = 0;
  let maksimalSkor = 0;
  let terjawab = 0;
  let totalSoal = 0;

  INSTRUMEN_BARU.forEach(kategori => {
    const validItems = getItemsForJenjang(kategori, jenjang);
    validItems.forEach(item => {
      totalSoal++;
      const ans = jawabanUmum[item.id]?.jawaban;
      
      if (ans !== undefined) {
        terjawab++;
      }
      
      if (kategori.tipeJawaban === 'ya-tidak') {
        maksimalSkor += 4;
        if (ans === true) totalSkor += 4;
      } else if (kategori.tipeJawaban === 'skala-4') {
        maksimalSkor += 4;
        if (ans === 'SS') totalSkor += 4;
        else if (ans === 'S') totalSkor += 3;
        else if (ans === 'TS') totalSkor += 2;
        else if (ans === 'STS') totalSkor += 1;
      }
    });
  });
  
  const percentageUmum = maksimalSkor === 0 ? 0 : Math.round((totalSkor / maksimalSkor) * 100);

  // Kriteria Penilaian Berdasarkan Persentase:
  // >= 90% = SANGAT RAMAH
  // 70% - 89% = CUKUP RAMAH
  // < 70% = KURANG
  
  if (percentageUmum >= 90) {
    return {
      status: 'SANGAT RAMAH',
      percentageUmum,
      label: `Skor ${totalSkor}/${maksimalSkor} (${percentageUmum}%)`
    };
  } else if (percentageUmum >= 70) {
    return {
      status: 'CUKUP RAMAH',
      percentageUmum,
      label: `Skor ${totalSkor}/${maksimalSkor} (${percentageUmum}%)`
    };
  } else {
    return {
      status: 'KURANG',
      percentageUmum,
      label: `Skor ${totalSkor}/${maksimalSkor} (${percentageUmum}%)`
    };
  }
}
