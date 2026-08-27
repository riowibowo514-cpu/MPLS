const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const sectionId = '2d5163c5-acde-4e4b-983f-3f21bf4bc87b'; // Evaluasi Tema Webinar
  
  // check if it exists
  const { data: existing } = await supabase.from('instrumen_item')
    .select('*')
    .eq('section_id', sectionId)
    .ilike('teks_pertanyaan', '%Apa informasi yang anda harapkan%');
    
  if (existing && existing.length > 0) {
    console.log("ALREADY EXISTS");
    return;
  }
  
  const newItem = {
    section_id: sectionId,
    teks_pertanyaan: 'Apa informasi yang anda harapkan dan ingin dapatkan mengenai tema webinar terkait?',
    tipe_jawaban: 'esai',
    urutan: 2
  };
  
  const { error } = await supabase.from('instrumen_item').insert(newItem);
  if (error) console.error(error);
  else console.log("INSERTED QUESTION 9");
}

run();
