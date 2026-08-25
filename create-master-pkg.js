const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectMasterTemplate() {
  console.log("Memulai injeksi Master Template Evaluasi PKG...");

  // Cek apakah sudah ada
  const { data: existing } = await supabase
    .from('kegiatan')
    .select('id')
    .eq('kategori_program', 'TEMPLATE_EVALUASI')
    .limit(1)
    .single();

  if (existing) {
    console.log("Template evaluasi sudah ada. Menghapus yang lama...");
    await supabase.from('kegiatan').delete().eq('id', existing.id);
  }

  const kegiatanId = crypto.randomUUID();
  const instrumenId = crypto.randomUUID();
  const now = new Date().toISOString();

  // 1. Insert Kegiatan
  console.log("Menambahkan Kegiatan Master...");
  const { error: errKegiatan } = await supabase.from('kegiatan').insert({
    id: kegiatanId,
    nama_kegiatan: 'MASTER TEMPLATE PKG (JANGAN DIHAPUS)',
    deskripsi: 'Template Standar — Kegiatan Peningkatan Kompetensi Guru (PKG) | Versi 1.0 | BGTK Provinsi Sumatera Barat',
    status: 'aktif',
    tahun: new Date().getFullYear().toString(),
    kategori_program: 'TEMPLATE_EVALUASI',
    created_at: now
  });
  if (errKegiatan) throw errKegiatan;

  // 2. Insert Instrumen
  console.log("Menambahkan Instrumen Master...");
  const { error: errInst } = await supabase.from('instrumen').insert({
    id: instrumenId,
    kegiatan_id: kegiatanId,
    nama_instrumen: 'Instrumen Evaluasi Kepuasan Peserta Pelatihan',
    deskripsi: 'Formulir ini digunakan untuk memperoleh masukan dari peserta terkait kualitas penyelenggaraan kegiatan yang telah diikuti.',
    created_at: now
  });
  if (errInst) throw errInst;

  // 3. Insert Metadata Fields (Tidak meminta identitas, tapi butuh basic info)
  console.log("Menambahkan Metadata Fields...");
  const metadataFields = [
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'jenjang_peserta', label_field: '[Data Peserta] Jenjang Mengajar', tipe_field: 'text', wajib: false, urutan: 1 },
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'mata_pelajaran', label_field: '[Data Peserta] Mata Pelajaran yang Diampu', tipe_field: 'text', wajib: false, urutan: 2 }
  ];
  await supabase.from('instrumen_metadata_field').insert(metadataFields);

  // 4. Insert Sections
  const sectionsData = [
    { nama_section: 'Sarana dan Prasarana Kegiatan', items: [
      { pertanyaan: 'Kemudahan akses menuju tempat penyelenggaraan kegiatan', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kesiapan dan ketersediaan sarana kegiatan (audio visual, LCD/laptop, papan tulis, pelantang suara, spidol, dan perlengkapan lainnya)', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kenyamanan ruang kegiatan (ventilasi udara/AC dan pencahayaan)', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kebersihan ruang kegiatan', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kenyamanan kamar mandi/toilet', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Ketersediaan perlengkapan medis sederhana (P3K)', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Ketersediaan sarana ibadah', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Konsumsi dan Akomodasi', items: [
      { pertanyaan: 'Kualitas dan variasi konsumsi yang disediakan', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Ketepatan waktu penyajian konsumsi', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kenyamanan kamar/akomodasi penginapan (jika menginap)', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Pelaksanaan Kegiatan', items: [
      { pertanyaan: 'Kesesuaian alokasi waktu pelaksanaan kegiatan dengan tujuan dan sasaran kegiatan', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Ketepatan alokasi waktu pelaksanaan setiap sesi kegiatan', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kejelasan alur/urutan sesi kegiatan dari awal hingga akhir', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Ketersediaan kesempatan praktik langsung/simulasi mengajar', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Interaktivitas metode pelatihan (tidak hanya ceramah satu arah)', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Materi dan Bahan Ajar', items: [
      { pertanyaan: 'Relevansi materi yang disampaikan dengan kebutuhan peserta', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Manfaat materi yang disampaikan bagi pelaksanaan tugas peserta', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kelengkapan dan kualitas bahan ajar/modul yang dibagikan', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Narasumber / Fasilitator', items: [
      { pertanyaan: 'Kejelasan penyampaian materi oleh narasumber', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Penguasaan materi oleh narasumber', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kemampuan narasumber menjawab pertanyaan peserta', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kesempatan yang diberikan kepada peserta untuk menyampaikan pertanyaan atau pendapat', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Manfaat diskusi atau sesi tanya jawab dalam kegiatan', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Pelayanan Panitia Penyelenggara', items: [
      { pertanyaan: 'Keramahan dan kesigapan panitia dalam melayani peserta', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Kejelasan informasi jadwal dan teknis kegiatan dari panitia', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Responsivitas panitia terhadap kendala/kebutuhan peserta selama kegiatan', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Efektivitas dan Rencana Tindak Lanjut', items: [
      { pertanyaan: 'Saya merasa memahami metode/materi yang disampaikan dalam pelatihan ini', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Saya merasa siap menerapkan hasil pelatihan ini dalam pembelajaran di kelas', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Pelatihan ini meningkatkan kepercayaan diri saya dalam mengajar dengan metode yang diajarkan', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Kepuasan Keseluruhan', items: [
      { pertanyaan: 'Secara keseluruhan, seberapa puas Anda dengan penyelenggaraan kegiatan ini?', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Apakah Anda akan merekomendasikan pelatihan ini kepada rekan sejawat? (1=Tidak, 2=Ragu-ragu, 4=Ya)', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Catatan dan Saran', items: [
      { pertanyaan: 'Masukan atau saran terhadap penyelenggaraan kegiatan (sarana, pelaksanaan, materi, narasumber, konsumsi, atau hal lain):', tipe_jawaban: 'esai', max_skor: 0 }
    ]}
  ];

  console.log("Menambahkan Sections dan Items...");
  for (let i = 0; i < sectionsData.length; i++) {
    const section = sectionsData[i];
    const sectionId = crypto.randomUUID();
    
    await supabase.from('instrumen_section').insert({
      id: sectionId,
      instrumen_id: instrumenId,
      nama_section: section.nama_section,
      urutan: i + 1
    });

    const itemsToInsert = section.items.map((item, index) => ({
      id: crypto.randomUUID(),
      section_id: sectionId,
      teks_pertanyaan: item.pertanyaan,
      tipe_jawaban: item.tipe_jawaban,
      butuh_catatan_bukti: false,
      urutan: index + 1
    }));

    const { error: insertErr } = await supabase.from('instrumen_item').insert(itemsToInsert);
    if (insertErr) {
      console.error("Gagal insert item:", insertErr);
    }
  }

  console.log("Injeksi Selesai! 🎉 Master Template telah dibuat di Database.");
}

injectMasterTemplate().catch(console.error);
