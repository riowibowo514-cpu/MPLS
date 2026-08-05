import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const PKG_TEMPLATE = {
  "instrumen": {
    "nama": "Instrumen Evaluasi Kepuasan Peserta Pelatihan (PKG)",
    "deskripsi": "Template baku evaluasi kepuasan peserta untuk kegiatan Peningkatan Kompetensi Guru (PKG)."
  },
  "sections": [
    {
      "nama": "Identitas Kegiatan",
      "urutan": 1,
      "items": [
        { "label": "Nama Kegiatan", "tipe_data": "pilihan_ganda", "wajib": true, "opsi": ["Pelatihan Guru SD", "Pelatihan Guru SMP", "Pelatihan Kepala Sekolah"] }
      ]
    },
    {
      "nama": "Sarana dan Prasarana Kegiatan",
      "urutan": 2,
      "items": [
        { "label": "Kemudahan akses menuju tempat penyelenggaraan kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Kesiapan dan ketersediaan sarana kegiatan (audio visual, LCD/laptop, papan tulis, pelantang suara, spidol, dan perlengkapan lainnya)", "tipe_data": "likert4", "wajib": true },
        { "label": "Kenyamanan ruang kegiatan (ventilasi udara/AC dan pencahayaan)", "tipe_data": "likert4", "wajib": true },
        { "label": "Kebersihan ruang kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Kenyamanan kamar mandi/toilet", "tipe_data": "likert4", "wajib": true },
        { "label": "Ketersediaan perlengkapan medis sederhana (P3K)", "tipe_data": "likert4", "wajib": true },
        { "label": "Ketersediaan sarana ibadah", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Konsumsi dan Akomodasi",
      "urutan": 3,
      "items": [
        { "label": "Kualitas dan variasi konsumsi yang disediakan", "tipe_data": "likert4", "wajib": true },
        { "label": "Ketepatan waktu penyajian konsumsi", "tipe_data": "likert4", "wajib": true },
        { "label": "Kenyamanan kamar/akomodasi penginapan (jika menginap)", "tipe_data": "likert4", "wajib": false }
      ]
    },
    {
      "nama": "Pelaksanaan Kegiatan",
      "urutan": 4,
      "items": [
        { "label": "Kesesuaian alokasi waktu pelaksanaan kegiatan dengan tujuan dan sasaran kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Ketepatan alokasi waktu pelaksanaan setiap sesi kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Kejelasan alur/urutan sesi kegiatan dari awal hingga akhir", "tipe_data": "likert4", "wajib": true },
        { "label": "Ketersediaan kesempatan praktik langsung/simulasi mengajar", "tipe_data": "likert4", "wajib": true },
        { "label": "Interaktivitas metode pelatihan (tidak hanya ceramah satu arah)", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Materi dan Bahan Ajar",
      "urutan": 5,
      "items": [
        { "label": "Relevansi materi yang disampaikan dengan kebutuhan peserta", "tipe_data": "likert4", "wajib": true },
        { "label": "Manfaat materi yang disampaikan bagi pelaksanaan tugas peserta", "tipe_data": "likert4", "wajib": true },
        { "label": "Kelengkapan dan kualitas bahan ajar/modul yang dibagikan", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Narasumber/Fasilitator",
      "urutan": 6,
      "items": [
        { "label": "Kejelasan penyampaian materi oleh narasumber", "tipe_data": "likert4", "wajib": true },
        { "label": "Penguasaan materi oleh narasumber", "tipe_data": "likert4", "wajib": true },
        { "label": "Kemampuan narasumber menjawab pertanyaan peserta", "tipe_data": "likert4", "wajib": true },
        { "label": "Kesempatan yang diberikan kepada peserta untuk menyampaikan pertanyaan atau pendapat", "tipe_data": "likert4", "wajib": true },
        { "label": "Manfaat diskusi atau sesi tanya jawab dalam kegiatan", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Pelayanan Panitia Penyelenggara",
      "urutan": 7,
      "items": [
        { "label": "Keramahan dan kesigapan panitia dalam melayani peserta", "tipe_data": "likert4", "wajib": true },
        { "label": "Kejelasan informasi jadwal dan teknis kegiatan dari panitia", "tipe_data": "likert4", "wajib": true },
        { "label": "Responsivitas panitia terhadap kendala/kebutuhan peserta selama kegiatan", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Efektivitas dan Rencana Tindak Lanjut",
      "urutan": 8,
      "items": [
        { "label": "Saya merasa memahami metode/materi yang disampaikan dalam pelatihan ini", "tipe_data": "likert4", "wajib": true },
        { "label": "Saya merasa siap menerapkan hasil pelatihan ini dalam pembelajaran di kelas", "tipe_data": "likert4", "wajib": true },
        { "label": "Pelatihan ini meningkatkan kepercayaan diri saya dalam mengajar dengan metode yang diajarkan", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Kepuasan Keseluruhan",
      "urutan": 9,
      "items": [
        { "label": "Secara keseluruhan, seberapa puas Anda dengan penyelenggaraan kegiatan ini?", "tipe_data": "likert4", "wajib": true },
        { "label": "Apakah Anda akan merekomendasikan pelatihan ini kepada rekan sejawat?", "tipe_data": "pilihan_ganda", "opsi": ["Ya", "Tidak", "Ragu-ragu"], "wajib": true }
      ]
    },
    {
      "nama": "Catatan dan Saran",
      "urutan": 10,
      "items": [
        { "label": "Masukan atau saran terhadap penyelenggaraan kegiatan", "tipe_data": "esai", "wajib": true }
      ]
    }
  ]
};

export async function POST(request: Request) {
  try {
    const { kegiatan_id } = await request.json();
    
    if (!kegiatan_id) {
      return NextResponse.json({ error: 'kegiatan_id dibutuhkan' }, { status: 400 });
    }

    // 1. Buat instrumen induk
    const { data: instrumenData, error: instrumenError } = await supabase
      .from('instrumen')
      .insert([{
        kegiatan_id: kegiatan_id,
        nama_instrumen: PKG_TEMPLATE.instrumen.nama,
        deskripsi: PKG_TEMPLATE.instrumen.deskripsi
      }])
      .select()
      .single();

    if (instrumenError) throw instrumenError;
    const instrumen_id = instrumenData.id;

    // 2. Loop & buat sections
    for (const section of PKG_TEMPLATE.sections) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('instrumen_section')
        .insert([{
          instrumen_id: instrumen_id,
          nama_section: section.nama,
          urutan: section.urutan
        }])
        .select()
        .single();
        
      if (sectionError) throw sectionError;
      const section_id = sectionData.id;

      // 3. Loop & buat items dalam section
      let itemUrutan = 1;
      for (const item of section.items) {
        const { error: itemError } = await supabase
          .from('instrumen_item')
          .insert([{
            section_id: section_id,
            teks_pertanyaan: item.label,
            tipe_jawaban: item.tipe_data,
            opsi_jawaban: item.opsi || null,
            butuh_catatan_bukti: false, // Default tidak butuh bukti dokumen untuk PKG
            urutan: itemUrutan++
          }]);
          
        if (itemError) throw itemError;
      }
    }

    return NextResponse.json({ success: true, instrumen_id }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to generate PKG instrument:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
