const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const kegiatan_id = '23fdbb99-646c-4350-9e34-a026e3f58030';
  const { data, error } = await supabase.from('kegiatan').select('status').eq('id', kegiatan_id).single();
  console.log("STATUS:", data, error);
}
run();
