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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function clean() {
  // Hanya hapus pengisian (jawaban otomatis terhapus karena CASCADE)
  const { data, error } = await supabase
    .from('pengisian')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Hapus semua pengisian
    
  if (error) {
    console.error(error);
  } else {
    console.log("Semua data responden (dummy) berhasil dibersihkan! Instrumen dan Kegiatan tetap aman.");
  }
}
clean();
