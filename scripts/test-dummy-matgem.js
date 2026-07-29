const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDummy() {
  console.log('Fetching Matgem instrument...');
  const { data: instrumen } = await supabase.from('instrumen')
    .select('id, nama_instrumen')
    .eq('nama_instrumen', 'Instrumen MONEV MATGEM 2026')
    .single();

  if (!instrumen) {
    console.error('Instrumen Matgem not found.');
    return;
  }

  // Get metadata fields
  const { data: metaFields } = await supabase.from('instrumen_metadata_field')
    .select('id, label_field')
    .eq('instrumen_id', instrumen.id);

  // Get sections & items
  const { data: sections } = await supabase.from('instrumen_section')
    .select('id, nama_section, instrumen_item(id, tipe_jawaban, teks_pertanyaan)')
    .eq('instrumen_id', instrumen.id);

  // We will simulate almost perfect scores, but with one or two flaws.
  const jawabanValues = {};
  
  // Weights configuration (Simulating the frontend logic)
  const config = {
    weights: { 'Perencanaan': 0.3, 'Pelaksanaan': 0.5, 'Evaluasi': 0.2 },
    max_value: 4,
    thresholds: [
      { min: 85, status: 'SANGAT SESUAI' },
      { min: 70, status: 'SESUAI' },
      { min: 50, status: 'KURANG SESUAI' },
      { min: 0, status: 'TIDAK SESUAI' }
    ]
  };

  let sectionScores = { 'Perencanaan': 0, 'Pelaksanaan': 0, 'Evaluasi': 0 };
  let sectionMax = { 'Perencanaan': 0, 'Pelaksanaan': 0, 'Evaluasi': 0 };

  const listJawabanInsert = [];

  sections.forEach(sec => {
    sec.instrumen_item.forEach(item => {
      let skor = null;
      let teks = null;
      let catatan = null;

      if (item.tipe_jawaban === 'likert4') {
        // give 4s mostly, some 3s
        skor = Math.random() > 0.2 ? 4 : 3;
        catatan = 'Bukti observasi terlihat jelas di RPP dan kelas.';
        
        if (config.weights[sec.nama_section] !== undefined) {
          sectionScores[sec.nama_section] += skor;
          sectionMax[sec.nama_section] += config.max_value;
        }
      } else if (item.tipe_jawaban === 'esai') {
        teks = 'Guru sangat antusias, murid terlihat aktif berkolaborasi memecahkan masalah matematika menggunakan alat peraga.';
      }

      listJawabanInsert.push({
        item_id: item.id,
        nilai_skor: skor,
        nilai_teks: teks,
        catatan_bukti: catatan
      });
    });
  });

  // Calculate score
  let totalScorePercentage = 0;
  Object.keys(config.weights).forEach(secName => {
    const p = (sectionScores[secName] / sectionMax[secName]) * 100;
    totalScorePercentage += p * config.weights[secName];
  });

  let finalStatus = 'TIDAK SESUAI';
  for (const t of config.thresholds) {
    if (totalScorePercentage >= t.min) {
      finalStatus = t.status;
      break;
    }
  }

  // Create Metadata Values
  const metadataValues = {};
  metaFields.forEach(mf => {
    if (mf.label_field === 'Nama Sekolah') metadataValues[mf.id] = 'SD NEGERI 99 DUMMY MATGEM';
    else if (mf.label_field === 'NPSN Sekolah') metadataValues[mf.id] = '99999999';
    else if (mf.label_field === 'Kabupaten/Kota') metadataValues[mf.id] = 'Kota Padang';
    else if (mf.label_field === 'Hari / Tanggal') metadataValues[mf.id] = new Date().toISOString().split('T')[0];
    else if (mf.label_field === 'Nama Petugas') metadataValues[mf.id] = 'Petugas Dummy AI';
    else if (mf.label_field === 'NIP') metadataValues[mf.id] = '123456789';
    else metadataValues[mf.id] = 'Responden Contoh';
  });

  // Add calculated kesimpulan
  metadataValues['_statusOtomatis'] = finalStatus;
  metadataValues['_skorTotal'] = totalScorePercentage.toFixed(2);
  metadataValues['_statusFinal'] = finalStatus; // Petugas setuju dgn sistem
  metadataValues['_catatanKritis'] = 'Proses pembelajaran Matematika GEMBIRA sudah berjalan dengan sangat baik, namun beberapa guru perlu penyesuaian durasi waktu alat peraga.';
  metadataValues['_rekomendasi'] = 'Perlu diadakan lokakarya penyegaran pembuatan alat peraga dari barang bekas untuk memperkaya variasi eksplorasi.';

  // Find a valid petugas id
  const { data: user } = await supabase.from('users').select('id').eq('role', 'petugas').limit(1).single();

  console.log('Inserting Pengisian...');
  const { data: pengisian, error: pErr } = await supabase.from('pengisian').insert({
    instrumen_id: instrumen.id,
    petugas_id: user ? user.id : null,
    metadata_values: metadataValues
  }).select().single();

  if (pErr) {
    console.error('Error insert pengisian:', pErr);
    return;
  }

  console.log('Pengisian Created ID:', pengisian.id);

  // Map pengisian ID to list jawaban
  listJawabanInsert.forEach(ans => ans.pengisian_id = pengisian.id);

  console.log('Inserting Jawaban...');
  const { error: jErr } = await supabase.from('jawaban').insert(listJawabanInsert);
  if (jErr) {
    console.error('Error insert jawaban:', jErr);
  } else {
    console.log('SUCCESS! Dummy data inserted.');
    console.log(`Skor Total: ${totalScorePercentage.toFixed(2)}% | Status: ${finalStatus}`);
  }
}

createDummy();
