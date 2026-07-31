const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDummyData() {
  console.log('Menghapus data pengisian dummy MPLS (monev)...');
  const { error: err1 } = await supabase.from('monev').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error('Error hapus monev:', err1.message);
  else console.log('Berhasil membersihkan monev.');

  console.log('Menghapus data jawaban dinamis (jawaban)...');
  const { error: err2 } = await supabase.from('jawaban').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err2) console.error('Error hapus jawaban:', err2.message);
  else console.log('Berhasil membersihkan jawaban dinamis.');

  console.log('Menghapus data pengisian dinamis (pengisian)...');
  const { error: err3 } = await supabase.from('pengisian').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err3) console.error('Error hapus pengisian:', err3.message);
  else console.log('Berhasil membersihkan pengisian dinamis.');

  console.log('Database berhasil dibersihkan dari data uji coba! Siap untuk produksi.');
}

clearDummyData();
