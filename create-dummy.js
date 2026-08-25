const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  // Find BK Hebat instrument
  const { data: instrumen, error: errInst } = await supabase
    .from('instrumen')
    .select('id')
    .ilike('nama_instrumen', '%BK Hebat%')
    .single();

  if (errInst || !instrumen) {
    console.error('Error finding instrument:', errInst);
    return;
  }

  const { data: metadataFields, error: errMeta } = await supabase
    .from('instrumen_metadata_field')
    .select('id, label_field')
    .eq('instrumen_id', instrumen.id);

  // Find all items
  const { data: sections, error: errSec } = await supabase
    .from('instrumen_section')
    .select('id, instrumen_item(id, tipe_jawaban)')
    .eq('instrumen_id', instrumen.id);

  if (errSec || !sections) {
    console.error('Error finding sections:', errSec);
    return;
  }

  // Create dummy metadata answers
  const metadataAnswers = {};
  metadataFields.forEach(field => {
    let dummyValue = 'Dummy';
    const label = field.label_field.toLowerCase();
    if (label.includes('sekolah')) dummyValue = 'SEKOLAH DUMMY UJI COBA PDF';
    else if (label.includes('petugas')) dummyValue = 'Budi Si Petugas Dummy';
    else if (label.includes('kabupaten')) dummyValue = 'Kota Padang';
    else if (label.includes('tanggal')) dummyValue = new Date().toISOString().split('T')[0];
    
    metadataAnswers[field.id] = dummyValue;
  });

  // Create pengisian
  const { data: pengisian, error: errPengisian } = await supabase
    .from('pengisian')
    .insert([{
      instrumen_id: instrumen.id,
      metadata_values: metadataAnswers
    }])
    .select()
    .single();

  if (errPengisian || !pengisian) {
    console.error('Error creating pengisian:', errPengisian);
    return;
  }

  // Create dummy answers for all items
  const answers = [];
  sections.forEach(sec => {
    sec.instrumen_item.forEach(item => {
      answers.push({
        pengisian_id: pengisian.id,
        item_id: item.id,
        nilai_teks: item.tipe_jawaban === 'pilihan_ganda' ? 'Ya' : 'Ini adalah jawaban teks otomatis untuk menguji format PDF yang baru.',
        catatan_bukti: 'Link bukti: https://example.com'
      });
    });
  });

  const { error: errAns } = await supabase
    .from('jawaban')
    .insert(answers);

  if (errAns) {
    console.error('Error creating answers:', errAns);
    return;
  }

  console.log('SUCCESS! Pengisian ID:', pengisian.id);
}

run();
