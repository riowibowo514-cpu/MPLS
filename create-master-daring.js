const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectMasterTemplate() {
  console.log("Memulai injeksi Master Template Daring PKG...");

  // 1. Hapus & Buat Kegiatan Master
  console.log("Template evaluasi daring sudah ada. Menghapus yang lama...");
  await supabase.from('kegiatan').delete().eq('nama_kegiatan', 'MASTER TEMPLATE EVALUASI DARING');

  const kegiatanId = crypto.randomUUID();
  const instrumenId = crypto.randomUUID();
  const now = new Date().toISOString();

  console.log("Menambahkan Kegiatan Master Daring...");
  const { error: errKegiatan } = await supabase.from('kegiatan').insert({
    id: kegiatanId,
    nama_kegiatan: 'MASTER TEMPLATE EVALUASI DARING',
    deskripsi: 'JANGAN DIHAPUS - Ini adalah template utama untuk kloning evaluasi khusus daring (Webinar)',
    tahun: new Date().getFullYear().toString(),
    status: 'aktif',
    kategori_program: 'TEMPLATE_EVALUASI',
    created_at: now
  });
  if (errKegiatan) throw errKegiatan;

  // 2. Insert Instrumen
  console.log("Menambahkan Instrumen Master Daring...");
  const { error: errInst } = await supabase.from('instrumen').insert({
    id: instrumenId,
    kegiatan_id: kegiatanId,
    nama_instrumen: 'Instrumen Evaluasi Kepuasan Peserta Webinar (Daring)',
    deskripsi: 'Formulir ini digunakan untuk memperoleh masukan dari peserta terkait kualitas penyelenggaraan kegiatan webinar yang telah diikuti.',
    created_at: now
  });
  if (errInst) throw errInst;

  // 3. Insert Metadata Fields (Biodata Diri - Standar BGTK)
  console.log("Menambahkan Metadata Fields Daring...");
  const metadataFields = [
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'Nama Lengkap', tipe_field: 'text', wajib: true, urutan: 1 },
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'Pekerjaan (Guru/Kepala Sekolah/Pengawas/Tenaga Kependidikan/Lainnya)', tipe_field: 'text', wajib: true, urutan: 2 },
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'Asal Instansi', tipe_field: 'text', wajib: true, urutan: 3 },
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'Kabupaten/Kota', tipe_field: 'text', wajib: true, urutan: 4 },
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'No WhatsApp', tipe_field: 'text', wajib: true, urutan: 5 },
    { id: crypto.randomUUID(), instrumen_id: instrumenId, nama_field: 'Email Aktif', tipe_field: 'text', wajib: true, urutan: 6 }
  ];
  await supabase.from('instrumen_metadata_field').insert(metadataFields);

  // 4. Insert Sections
  const sectionsData = [
    { nama_section: 'Evaluasi Tema Webinar', items: [
      { pertanyaan: 'Apakah webinar kali ini sudah memberikan gambaran yang jelas tentang tema webinar terkait? (Sudah Jelas / Sebagian besar sudah tergambarkan / Masih perlu ditingkatkan untuk sosialisasinya / Belum jelas)', tipe_jawaban: 'esai', max_skor: 0 }
    ]},
    { nama_section: 'Penilaian Narasumber / Fasilitator', items: [
      { pertanyaan: 'Apakah Narasumber dapat menyajikan materi sesuai dengan kebutuhan peserta?', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Apakah media yang dipakai narasumber dalam menyajikan materi dapat membantu peserta dalam memahami materi?', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Apakah cara komunikasi narasumber dalam menyajikan materi menyenangkan dan mudah dipahami?', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Apakah narasumber dapat dengan baik memberikan motivasi kepada peserta kegiatan?', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Menurut Anda, apa yang perlu diperbaiki dari penyampaian materi oleh narasumber? (Kecepatan penyampaian, Interaksi, Teks slide, dll)', tipe_jawaban: 'esai', max_skor: 0 },
      { pertanyaan: 'Menurut Anda, apa yang sudah baik dari narasumber?', tipe_jawaban: 'esai', max_skor: 0 }
    ]},
    { nama_section: 'Tema Webinar Selanjutnya', items: [
      { pertanyaan: 'Apakah anda tertarik untuk mengikuti kegiatan kami selanjutnya? (Ya / Tidak / Mungkin)', tipe_jawaban: 'esai', max_skor: 0 },
      { pertanyaan: 'Apa rekomendasi tema webinar kami selanjutnya?', tipe_jawaban: 'esai', max_skor: 0 }
    ]},
    { nama_section: 'Media Sosial', items: [
      { pertanyaan: 'Apakah akses komunikasi untuk menyampaikan keluhan/komplain telah tersedia dan mudah diperoleh? (Ya / Tidak)', tipe_jawaban: 'esai', max_skor: 0 },
      { pertanyaan: 'Apa media sosial BGTK Provinsi Sumbar yang telah anda ketahui?', tipe_jawaban: 'esai', max_skor: 0 },
      { pertanyaan: 'Apa media informasi atau media sosial yang anda harapkan untuk mendapatkan berita-berita terbaru mengenai BGTK Provinsi Sumbar?', tipe_jawaban: 'esai', max_skor: 0 }
    ]},
    { nama_section: 'Indeks Persepsi Anti Korupsi (IPAK)', items: [
      { pertanyaan: 'Petugas/panitia memberikan pelayanan kepada peserta secara jujur, transparan, dan berintegritas.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Selama mengikuti kegiatan, saya tidak pernah diminta memberikan uang, hadiah, atau imbalan dalam bentuk apa pun untuk memperoleh pelayanan.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Petugas/panitia tidak melakukan pungutan di luar ketentuan yang telah diinformasikan kepada peserta.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Petugas/panitia memberikan pelayanan kepada seluruh peserta secara adil dan tidak diskriminatif.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Informasi mengenai hak, kewajiban, ketentuan, dan biaya (jika ada) disampaikan secara jelas dan transparan.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Saya mengetahui bahwa BGTK Provinsi Sumatera Barat menolak segala bentuk gratifikasi, suap, pungutan liar, dan praktik korupsi lainnya dalam penyelenggaraan kegiatan.', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Indeks Persepsi Kualitas Pelayanan (IPKP)', items: [
      { pertanyaan: 'Informasi mengenai pelaksanaan kegiatan, jadwal, persyaratan, dan ketentuan disampaikan dengan jelas dan mudah dipahami.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Proses pendaftaran dan administrasi kegiatan mudah, sederhana, dan tidak berbelit-belit.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Petugas/panitia memberikan pelayanan dengan ramah, sopan, responsif, dan profesional.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Petugas/panitia memberikan pelayanan dan informasi sesuai dengan kebutuhan peserta.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Pelaksanaan kegiatan berlangsung tepat waktu dan sesuai dengan jadwal/informasi yang telah disampaikan.', tipe_jawaban: 'likert4', max_skor: 4 },
      { pertanyaan: 'Sarana, prasarana, fasilitas, dan layanan pendukung selama kegiatan telah memadai dan mendukung kenyamanan peserta.', tipe_jawaban: 'likert4', max_skor: 4 }
    ]},
    { nama_section: 'Kritik dan Saran', items: [
      { pertanyaan: 'Mohon berikan kami kritik dan saran secara umum untuk peningkatan penyelenggaraan kegiatan kami kedepannya.', tipe_jawaban: 'esai', max_skor: 0 },
      { pertanyaan: 'PERNYATAAN: Dengan ini saya menyatakan dengan sadar bahwa informasi data diri yang saya inputkan pada formulir ini sudah sesuai dengan data yang sebenarnya dan menjadi dasar untuk pencantuman nama pada sertifikat kegiatan. (Ketik SETUJU jika Anda setuju)', tipe_jawaban: 'esai', max_skor: 0 }
    ]}
  ];

  console.log("Menambahkan Sections dan Items Daring...");
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

  console.log("Injeksi Selesai! 🎉 Master Template Daring telah dibuat di Database.");
}

injectMasterTemplate().catch(console.error);
