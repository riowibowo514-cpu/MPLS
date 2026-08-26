const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findBK() {
  console.log("Mencari kegiatan dengan nama 'BK'...");
  
  const { data: kegiatan, error: searchErr } = await supabase
    .from('kegiatan')
    .select('id, nama_kegiatan, kategori_program')
    .ilike('nama_kegiatan', '%BK%');

  if (searchErr) {
    console.error("Gagal mencari:", searchErr);
    return;
  }

  if (!kegiatan || kegiatan.length === 0) {
    console.log("Tidak ada kegiatan yang ditemukan.");
    return;
  }

  console.log(`Ditemukan ${kegiatan.length} kegiatan:`);
  for (const k of kegiatan) {
    console.log(`- ${k.nama_kegiatan} (${k.id}) [${k.kategori_program}]`);
    
    // Cari instrumen untuk kegiatan ini
    const { data: inst } = await supabase.from('instrumen').select('id').eq('kegiatan_id', k.id).single();
    if (inst) {
       // Hitung jumlah pengisian
       const { data: pengisian } = await supabase.from('pengisian').select('id').eq('instrumen_id', inst.id);
       console.log(`  -> Memiliki ${pengisian ? pengisian.length : 0} responden/pengisian.`);
    }
  }
}

findBK();
