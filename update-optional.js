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
  const { data, error } = await supabase
    .from('instrumen_item')
    .update({ opsi_jawaban: null })
    .in('teks_pertanyaan', [
      'Jika sudah, berapa persen guru yang hadir?',
      'Jika belum, bagaimana penerapan PSE di dalam kelas?',
      'Jika tidak, apa yang dilakukan untuk menumbuhkan resiliensi pada murid?',
      'Jika belum, apa tantangannya?',
      'Jika sudah, apakah sudah ditindaklanjuti untuk ditangani oleh Tim TPPK?',
      'Jika sudah, lampirkan link buktinya'
    ]);
    
  if (error) {
    console.error('Error updating items:', error);
  } else {
    console.log('Successfully reverted conditional items to be mandatory!');
  }
}

run();
