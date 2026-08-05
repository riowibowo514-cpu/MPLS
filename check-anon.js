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

// PENTING: Gunakan ANON KEY untuk mensimulasikan user publik!
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const kegId = '9fd8e894-7322-4a9f-bf7e-bdd41f88543f';
  
  const { data: instData } = await supabase.from('instrumen').select('*').eq('kegiatan_id', kegId).single();
  
  const { data: sectionsData } = await supabase
    .from('instrumen_section')
    .select('id, urutan, nama_section')
    .eq('instrumen_id', instData.id)
    .order('urutan');
    
  console.log(`ANON KEY fetched ${sectionsData ? sectionsData.length : 0} sections:`);
  if (sectionsData) {
    sectionsData.forEach((sec, i) => {
      console.log(`Index ${i}: ${sec.nama_section}`);
    });
  }
}

run();
