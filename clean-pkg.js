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

async function cleanup() {
  console.log("Memulai proses pembersihan data uji coba PKG...");

  // 1. Ambil semua kegiatan yang berkategori PKG
  const { data: kegiatans, error: kegError } = await supabase
    .from('kegiatan')
    .select('id, nama_kegiatan, kategori_program')
    .eq('kategori_program', 'PKG');

  if (kegError) {
    console.error("Gagal mengambil data kegiatan PKG:", kegError);
    return;
  }

  if (!kegiatans || kegiatans.length === 0) {
    console.log("Tidak ada data PKG uji coba yang perlu dihapus.");
    return;
  }

  console.log(`Ditemukan ${kegiatans.length} kegiatan PKG uji coba.`);

  // 2. Hapus kegiatan (karena ON DELETE CASCADE aktif di database, ini akan otomatis menghapus instrumen, instrumen_section, instrumen_item, pengisian, dan jawaban)
  let deletedCount = 0;
  for (const keg of kegiatans) {
    // Pastikan tidak menghapus MPLS atau Matgem
    if (!keg.nama_kegiatan.toLowerCase().includes('mpls') && !keg.nama_kegiatan.toLowerCase().includes('matgem')) {
      console.log(`Menghapus kegiatan: ${keg.nama_kegiatan} (${keg.id})...`);
      const { error: delError } = await supabase
        .from('kegiatan')
        .delete()
        .eq('id', keg.id);
        
      if (delError) {
        console.error(`Gagal menghapus ${keg.nama_kegiatan}:`, delError);
      } else {
        deletedCount++;
      }
    }
  }

  console.log(`Pembersihan selesai. Total ${deletedCount} kegiatan PKG berhasil dihapus beserta seluruh data terkaitnya.`);
}

cleanup();
