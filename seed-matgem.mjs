import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seed() {
  console.log('Memulai seeder Matematika GEMBIRA...');

  // 1. Buat Kegiatan
  const { data: kegiatan, error: kError } = await supabase
    .from('kegiatan')
    .insert([{ nama_kegiatan: 'Monitoring dan Evaluasi Implementasi Matematika GEMBIRA', tahun: '2026', deskripsi: 'Evaluasi khusus Guru TK dan Guru SD Tahun 2026, Provinsi Sumatera Barat' }])
    .select().single();
  
  if (kError) return console.error('Error Kegiatan:', kError);

  // 2. Buat Instrumen
  const { data: instrumen, error: iError } = await supabase
    .from('instrumen')
    .insert([{ kegiatan_id: kegiatan.id, nama_instrumen: 'Instrumen Matgem 2026', deskripsi: 'Silakan isi instrumen ini dengan sebenar-benarnya.' }])
    .select().single();

  if (iError) return console.error('Error Instrumen:', iError);

  // 3. Metadata Fields
  await supabase.from('instrumen_metadata_field').insert([
    { instrumen_id: instrumen.id, label_field: 'Nama Petugas', tipe_field: 'text', urutan: 0, wajib_diisi: true },
    { instrumen_id: instrumen.id, label_field: 'Hari/Tanggal', tipe_field: 'date', urutan: 1, wajib_diisi: true },
    { instrumen_id: instrumen.id, label_field: 'Nama Sekolah', tipe_field: 'text', urutan: 2, wajib_diisi: true },
    { instrumen_id: instrumen.id, label_field: 'Kabupaten', tipe_field: 'text', urutan: 3, wajib_diisi: true },
    { instrumen_id: instrumen.id, label_field: 'Nama Responden', tipe_field: 'text', urutan: 4, wajib_diisi: true }
  ]);

  // 4. Sections
  const sections = [
    { nama_section: 'A. Perencanaan', urutan: 0 },
    { nama_section: 'B. Pelaksanaan', urutan: 1 },
    { nama_section: 'C. Evaluasi', urutan: 2 },
    { nama_section: 'D. Wawancara Refleksi', urutan: 3 }
  ];

  for (const s of sections) {
    const { data: secData } = await supabase.from('instrumen_section').insert([{ instrumen_id: instrumen.id, nama_section: s.nama_section, urutan: s.urutan }]).select().single();
    
    // Items
    const items = [];
    if (s.nama_section.includes('Perencanaan')) {
      for(let i=0; i<5; i++) items.push({ section_id: secData.id, teks_pertanyaan: `Pertanyaan Perencanaan ${i+1}: Guru menyiapkan RPP/modul ajar...`, tipe_jawaban: 'likert4', butuh_catatan_bukti: true, urutan: i });
    } else if (s.nama_section.includes('Pelaksanaan')) {
      for(let i=0; i<11; i++) items.push({ section_id: secData.id, teks_pertanyaan: `Pertanyaan Pelaksanaan ${i+1}: Guru mengkondisikan kelas...`, tipe_jawaban: 'likert4', butuh_catatan_bukti: true, urutan: i });
    } else if (s.nama_section.includes('Evaluasi')) {
      for(let i=0; i<5; i++) items.push({ section_id: secData.id, teks_pertanyaan: `Pertanyaan Evaluasi ${i+1}: Guru memahami konsep...`, tipe_jawaban: 'likert4', butuh_catatan_bukti: true, urutan: i });
    } else {
      for(let i=0; i<5; i++) items.push({ section_id: secData.id, teks_pertanyaan: `Pertanyaan Refleksi ${i+1}: Apa perubahan yang dirasakan...`, tipe_jawaban: 'esai', butuh_catatan_bukti: false, urutan: i });
    }

    await supabase.from('instrumen_item').insert(items);
  }

  console.log('Seeding selesai! Matgem telah berhasil ditambahkan ke database.');
}

seed();
