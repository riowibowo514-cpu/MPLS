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

async function seedDummyData() {
  console.log("Mencari kegiatan PKG terbaru...");
  
  const { data: kegiatans, error: kegError } = await supabase
    .from('kegiatan')
    .select('*')
    .eq('kategori_program', 'PKG')
    .order('created_at', { ascending: false })
    .limit(1);

  if (kegError || !kegiatans || kegiatans.length === 0) return;
  const kegiatan = kegiatans[0];
  console.log(`Kegiatan ditemukan: ${kegiatan.nama_kegiatan} (${kegiatan.id})`);

  const { data: instrumen, error: instError } = await supabase
    .from('instrumen')
    .select('id')
    .eq('kegiatan_id', kegiatan.id)
    .single();

  if (instError || !instrumen) return;

  // Dapatkan sections
  const { data: sections, error: secError } = await supabase
    .from('instrumen_section')
    .select('id')
    .eq('instrumen_id', instrumen.id);
    
  if (secError || !sections) return;
  const sectionIds = sections.map(s => s.id);

  // Dapatkan semua item
  const { data: items, error: itemError } = await supabase
    .from('instrumen_item')
    .select('*')
    .in('section_id', sectionIds);

  if (itemError || !items) return;
  console.log(`Ditemukan ${items.length} pertanyaan.`);

  console.log("Memasukkan 4 data responden dummy...");
  
  for (let i = 1; i <= 4; i++) {
    const baseScore = i === 1 ? 4 : i === 2 ? 3 : i === 3 ? 3 : 2;
    
    const { data: pengisianData, error: pError } = await supabase
      .from('pengisian')
      .insert([{
        instrumen_id: instrumen.id,
        metadata_values: {},
        tanggal_pengisian: new Date(Date.now() - (i * 3600000)).toISOString()
      }])
      .select();

    if (pError || !pengisianData) continue;

    const pengisianId = pengisianData[0].id;
    const jawabanToInsert = [];

    for (const item of items) {
      let val = null;
      let text = null;

      if (item.tipe_jawaban.includes('likert')) {
        let randOffset = Math.floor(Math.random() * 3) - 1; 
        val = baseScore + randOffset;
        if (val > 4) val = 4;
        if (val < 1) val = 1;
      } else if (item.tipe_jawaban === 'pilihan_ganda') {
        const opsi = item.opsi_jawaban || ["Ya", "Tidak", "Ragu-ragu"];
        if (baseScore >= 3) {
          text = opsi[0];
        } else {
          text = opsi[Math.floor(Math.random() * opsi.length)];
        }
      } else if (item.tipe_jawaban === 'esai') {
        text = `Saran dari responden dummy ${i}. Kegiatan ini secara umum ${baseScore >= 3 ? 'baik' : 'perlu ditingkatkan'}.`;
      }

      jawabanToInsert.push({
        pengisian_id: pengisianId,
        item_id: item.id,
        nilai_teks: text,
        nilai_skor: val
      });
    }

    const { error: jError } = await supabase.from('jawaban').insert(jawabanToInsert);
    if (!jError) console.log(`Berhasil memasukkan Responden Dummy ${i}`);
  }
  console.log("Proses pembuatan data dummy selesai!");
}

seedDummyData();
