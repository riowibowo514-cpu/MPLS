const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supabase = createClient(env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1], env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1]);
(async () => {
  const { data: keg } = await supabase.from('kegiatan').select('*').ilike('nama_kegiatan', '%bk hebat%').single();
  const { data: inst } = await supabase.from('instrumen').select('*').eq('kegiatan_id', keg.id).single();
  
  const { data: pengisian } = await supabase.from('pengisian').select('id').eq('instrumen_id', inst.id);
  if (!pengisian || pengisian.length === 0) {
    console.log('Tidak ada data uji coba.');
    return;
  }
  const pengisianIds = pengisian.map(p => p.id);
  
  console.log('Deleting pengisian IDs:', pengisianIds);
  
  // Hapus jawaban dulu
  for (const id of pengisianIds) {
    await supabase.from('jawaban').delete().eq('pengisian_id', id);
  }
  
  // Hapus pengisian
  for (const id of pengisianIds) {
    const { error } = await supabase.from('pengisian').delete().eq('id', id);
    console.log('Deleted pengisian', id, error || 'Success');
  }
})();
