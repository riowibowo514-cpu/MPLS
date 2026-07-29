const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding MATGEM...');
  
  // 1. Insert Kegiatan
  const { data: kegiatan, error: errK } = await supabase.from('kegiatan').insert({
    nama_kegiatan: 'Monitoring dan Evaluasi Implementasi Matematika GEMBIRA',
    deskripsi: 'Instrumen monitoring dan evaluasi implementasi Matematika Gembira bagi Guru TK dan Guru SD Provinsi Sumatera Barat',
    tahun: '2026',
    status: 'aktif'
  }).select().single();
  
  if (errK) {
    console.error('Error insert kegiatan:', errK);
    return;
  }
  console.log('Created Kegiatan:', kegiatan.id);

  // 2. Insert Instrumen
  const { data: instrumen, error: errI } = await supabase.from('instrumen').insert({
    kegiatan_id: kegiatan.id,
    nama_instrumen: 'Instrumen MONEV MATGEM 2026',
    deskripsi: 'Berilah tanda ceklist (v) pada alternatif pilihan jawaban yang tersedia, dan lengkapi Bukti Pembelajaran/Catatan.'
  }).select().single();

  if (errI) {
    console.error('Error insert instrumen:', errI);
    return;
  }
  console.log('Created Instrumen:', instrumen.id);

  // 3. Insert Metadata Fields
  const identitas = [
    { label_field: 'Nama Petugas', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'NIP', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'Hari / Tanggal', tipe_field: 'date', wajib_diisi: true },
    { label_field: 'Nama Sekolah', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'NPSN Sekolah', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'Kabupaten/Kota', tipe_field: 'dropdown', wajib_diisi: true },
    { label_field: 'Nama Responden (Guru)', tipe_field: 'text', wajib_diisi: true }
  ];

  for (let i = 0; i < identitas.length; i++) {
    await supabase.from('instrumen_metadata_field').insert({
      instrumen_id: instrumen.id,
      label_field: identitas[i].label_field,
      tipe_field: identitas[i].tipe_field,
      urutan: i + 1,
      wajib_diisi: identitas[i].wajib_diisi
    });
  }

  // 4. Insert Sections & Items
  const sectionsData = [
    {
      title: 'Perencanaan',
      questions: [
        'Guru menyiapkan RPP atau modul ajar yang telah menggunakan alur pembelajaran Matematika GEMBIRA',
        'Tujuan pembelajaran dikembangkan dari capaian pembelajaran pada fase pondasi (untuk TK) atau fase A (untuk SD)',
        'Aktivitas belajar yang direncanakan telah mengakomodir pembelajaran matematika GEMBIRA',
        'Asesmen dirancang sesuai dengan tujuan pembelajaran',
        'Asesmen yang dibuat berbasis proses, bukan sekedar menilai benar atau salah'
      ]
    },
    {
      title: 'Pelaksanaan',
      questions: [
        'Guru mengkondisikan kelas sebelum memulai kegiatan pembelajaran',
        'Guru melakukan gali eksplorasi pemahaman awal murid terhadap konteks yang digunakan',
        'Guru mengajak murid memahami konten materi melalui objek nyata, lingkungan sekitar, dan/atau permainan',
        'Guru membuat aktivitas belajar yang relevan dengan kehidupan sehari-hari yang dekat dengan murid',
        'Aktivitas belajar berfokus pada kegiatan numerasi',
        'Aktivitas belajar mendorong kegiatan eksplorasi, diskusi serta kolaborasi',
        'Guru mendorong dialog interaktif dan mengajukan pertanyaan pemantik selama aktivitas pembelajaran',
        'Guru mengidentifikasi miskonsepsi yang terjadi',
        'Guru memberikan umpan balik ketika aktivitas pembelajaran berlangsung',
        'Guru melakukan refleksi diakhir pembelajaran',
        'Guru memberikan apresiasi terhadap usaha dan kemajuan murid'
      ]
    },
    {
      title: 'Evaluasi',
      questions: [
        'Guru memahami konsep Matematika GEMBIRA',
        'Guru mampu membuat aktivitas pembelajaran yang menyenangkan dan berpusat pada murid',
        'Kepala sekolah mendukung program pembelajaran matematika GEMBIRA untuk diimplementasikan di kelas',
        'Tersedianya media pembelajaran yang dibutuhkan dalam mengimplementasikan Matematika GEMBIRA di kelas',
        'Adanya pojok numerasi di kelas/sekolah'
      ]
    },
    {
      title: 'Wawancara Refleksi',
      questions: [
        'Apa perubahan yang dirasakan setelah menerapkan Matematika GEMBIRA?',
        'Aktivitas apa yang paling disukai murid dalam alur GEMBIRA?',
        'Kendala apa yang dihadapi dalam mengimplementasikan pembelajaran dengan alur GEMBIRA?',
        'Dukungan apa yang dibutuhkan guru dalam mengimplementasikan pembelajaran dengan alur GEMBIRA?',
        'Apa inovasi yang telah dilakukan dalam menerapkan pembelajaran Matematika GEMBIRA?'
      ]
    }
  ];

  let itemUrutan = 1;
  for (let i = 0; i < sectionsData.length; i++) {
    const sData = sectionsData[i];
    const { data: section } = await supabase.from('instrumen_section').insert({
      instrumen_id: instrumen.id,
      nama_section: sData.title,
      urutan: i + 1
    }).select().single();

    for (let j = 0; j < sData.questions.length; j++) {
      const q = sData.questions[j];
      const isRefleksi = sData.title === 'Wawancara Refleksi';
      await supabase.from('instrumen_item').insert({
        section_id: section.id,
        teks_pertanyaan: q,
        tipe_jawaban: isRefleksi ? 'esai' : 'likert4',
        butuh_catatan_bukti: !isRefleksi, // Wawancara gak butuh bukti file/tambahan krn itu esai
        urutan: itemUrutan++
      });
    }
  }

  console.log('Seeding Complete! MATGEM ready.');
}

seed();
