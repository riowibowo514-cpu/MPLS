const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestData() {
  console.log("Mencari kegiatan uji coba EVALUASI_PANITIA...");
  
  const { data: kegiatan, error: searchErr } = await supabase
    .from('kegiatan')
    .select('id, nama_kegiatan')
    .eq('kategori_program', 'EVALUASI_PANITIA');

  if (searchErr) {
    console.error("Gagal mencari:", searchErr);
    return;
  }

  if (!kegiatan || kegiatan.length === 0) {
    console.log("Tidak ada kegiatan uji coba yang ditemukan.");
    return;
  }

  console.log(`Ditemukan ${kegiatan.length} kegiatan uji coba:`);
  kegiatan.forEach(k => console.log(`- ${k.nama_kegiatan} (${k.id})`));

  for (const k of kegiatan) {
    console.log(`Menghapus ${k.nama_kegiatan}...`);
    // Delete kegiatan (cascade will handle the rest if configured, otherwise we might need to delete instrumen first)
    const { error: delErr } = await supabase
      .from('kegiatan')
      .delete()
      .eq('id', k.id);
      
    if (delErr) {
      console.error(`Gagal menghapus ${k.id}:`, delErr);
    } else {
      console.log(`Berhasil menghapus ${k.nama_kegiatan}`);
    }
  }
}

deleteTestData();
