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

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fetchInstrumen() {
  const kegiatan_id = '9fd8e894-7322-4a9f-bf7e-bdd41f88543f';

  const { data: instData } = await supabase
    .from('instrumen')
    .select('*')
    .eq('kegiatan_id', kegiatan_id)
    .single();

  const { data: sectionsData } = await supabase
    .from('instrumen_section')
    .select(`
      *,
      items:instrumen_item(*)
    `)
    .eq('instrumen_id', instData.id)
    .order('urutan');

  const sortedSections = (sectionsData || []).map(sec => ({
    ...sec,
    items: (sec.items || []).sort((a, b) => a.urutan - b.urutan)
  }));

  console.log(`Total sections: ${sortedSections.length}`);
  const section9 = sortedSections[8]; // currentStep = 8 (Section 9)
  console.log(`\nSection 9: ${section9.nama_section}`);
  section9.items.forEach(item => {
    console.log(`- ${item.teks_pertanyaan}`);
  });
  
  const section10 = sortedSections[9];
  console.log(`\nSection 10: ${section10.nama_section}`);
  section10.items.forEach(item => {
    console.log(`- ${item.teks_pertanyaan}`);
  });
}

fetchInstrumen();
