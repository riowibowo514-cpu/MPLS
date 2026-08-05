require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log("Fixing empty options in DB...");
  const { data, error } = await supabase
    .from('instrumen_item')
    .update({ opsi_jawaban: ['Pelatihan A', 'Pelatihan B', 'Pelatihan C'] })
    .eq('tipe_jawaban', 'pilihan_ganda')
    .is('opsi_jawaban', null);
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Updated rows.");
  }
}

run();
