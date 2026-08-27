const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: item } = await supabase.from('instrumen_item').select('*').ilike('teks_pertanyaan', '%gambaran yang jelas%').eq('section_id', '2d5163c5-acde-4e4b-983f-3f21bf4bc87b').single();
  
  if (item) {
    await supabase.from('instrumen_item').update({
      tipe_jawaban: 'pilihan_ganda',
      opsi_jawaban: ['Sudah Jelas', 'Sebagian besar sudah tergambarkan', 'Masih perlu ditingkatkan untuk sosialisasinya', 'Belum jelas']
    }).eq('id', item.id);
    console.log("UPDATED TEMA");
  }
}
run();
