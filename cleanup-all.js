const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Fetching all kegiatan...");
  const { data, error } = await supabase
    .from('kegiatan')
    .select('id, nama_kegiatan, kategori_program');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const toDelete = data.filter(k => 
    !k.nama_kegiatan.toLowerCase().includes('matematika gembira') && 
    !k.nama_kegiatan.toLowerCase().includes('mpls')
  );
  
  console.log(`Found ${toDelete.length} activities to delete:`);
  toDelete.forEach(k => console.log(`- ${k.nama_kegiatan} [${k.kategori_program || 'NULL'}]`));
  
  if (toDelete.length > 0) {
    const ids = toDelete.map(k => k.id);
    const { error: delError } = await supabase.from('kegiatan').delete().in('id', ids);
    if (delError) {
      console.error("Failed to delete:", delError);
    } else {
      console.log("Successfully deleted!");
    }
  }
}

run();
