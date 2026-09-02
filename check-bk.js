const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const supabaseKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: kegiatan } = await supabase.from('kegiatan').select('*').ilike('nama_kegiatan', '%bk hebat%');
  console.log("Kegiatan:", kegiatan?.map(k => k.nama_kegiatan).join(', '));
  if (kegiatan && kegiatan.length > 0) {
    for (const keg of kegiatan) {
      const { data: inst } = await supabase.from('instrumen').select('*').eq('kegiatan_id', keg.id).single();
      if (inst) {
        console.log(`Instrumen found for ${keg.nama_kegiatan}: ${inst.id}`);
        const { count } = await supabase.from('jawaban').select('*', { count: 'exact', head: true }).eq('instrumen_id', inst.id);
        console.log(`Jumlah jawaban (responden): ${count}`);
        
        // Cek data sampel pertama
        const { data: sample } = await supabase.from('jawaban').select('*').eq('instrumen_id', inst.id).limit(1);
        if (sample && sample.length > 0) {
          console.log("Contoh responden: ", sample[0].responden_nama || sample[0].responden_email || sample[0].id);
        }
      } else {
        console.log(`No instrumen found for ${keg.nama_kegiatan}`);
      }
    }
  } else {
    console.log("Kegiatan tidak ditemukan");
  }
}
check();
