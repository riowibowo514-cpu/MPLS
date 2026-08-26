const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearBKResponses() {
  const kegiatanId = '4cc7b7b7-7961-4631-b7aa-2b41861cba77';
  
  // 1. Dapatkan Instrumen ID
  const { data: inst } = await supabase.from('instrumen').select('id').eq('kegiatan_id', kegiatanId).single();
  if (!inst) {
    console.log("Instrumen tidak ditemukan untuk kegiatan ini.");
    return;
  }
  
  console.log(`Instrumen ID: ${inst.id}. Menghapus data pengisian dummy...`);
  
  // 2. Hapus pengisian (Jawaban akan ikut terhapus jika ada constraint CASCADE)
  // Tapi untuk aman, kita tidak usah hapus manual jawaban jika RLS tidak memperbolehkan anon hapus pengisian.
  // Wait, the anon key might not have permission to delete pengisian directly unless allowed.
  // Let's try deleting them anyway.
  
  const { data: pengisian, error: pErr } = await supabase
    .from('pengisian')
    .select('id')
    .eq('instrumen_id', inst.id);
    
  if (pErr || !pengisian) {
    console.log("Gagal mencari pengisian", pErr);
    return;
  }
  
  for (const p of pengisian) {
     const { error: delErr } = await supabase.from('pengisian').delete().eq('id', p.id);
     if (delErr) {
        console.log(`Gagal menghapus ${p.id}: ${delErr.message}`);
     } else {
        console.log(`Berhasil menghapus ${p.id}`);
     }
  }
  console.log("Pembersihan selesai.");
}

clearBKResponses();
