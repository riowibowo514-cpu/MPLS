const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('kegiatan')
    .delete()
    .eq('kategori_program', 'EVALUASI_PANITIA');
    
  console.log("Deleted EVALUASI_PANITIA:", data, error);
}

run();
