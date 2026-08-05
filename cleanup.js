const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manual dotenv parsing to avoid module errors
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

async function cleanupData() {
  console.log("Memulai proses pembersihan data...");

  // Kita akan menghapus semua kegiatan yang Kategori Program-nya adalah 'PKG'
  // atau yang namanya mengandung kata 'Uji Coba PKG'.
  // Kita abaikan 'Matematika Gembira' dan 'MPLS' sesuai instruksi.

  const { data: kegiatanToClean, error: fetchError } = await supabase
    .from('kegiatan')
    .select('id, nama_kegiatan, kategori_program')
    .eq('kategori_program', 'PKG');

  if (fetchError) {
    console.error("Gagal mengambil data kegiatan:", fetchError);
    return;
  }

  if (!kegiatanToClean || kegiatanToClean.length === 0) {
    console.log("Tidak ada data PKG yang perlu dibersihkan. Semua sudah bersih!");
    return;
  }

  console.log(`Ditemukan ${kegiatanToClean.length} kegiatan PKG yang akan dihapus:`);
  kegiatanToClean.forEach(k => console.log(`- ${k.nama_kegiatan} (${k.id})`));

  // Menghapus kegiatan (Cascade akan otomatis menghapus instrumen, item, pengisian, dan jawaban)
  const idsToDelete = kegiatanToClean.map(k => k.id);
  
  const { error: deleteError } = await supabase
    .from('kegiatan')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error("Gagal menghapus data:", deleteError);
  } else {
    console.log("Beres! Seluruh data PKG uji coba beserta instrumen dan jawabannya telah dihapus bersih.");
  }
}

cleanupData();
