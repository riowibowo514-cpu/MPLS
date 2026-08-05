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

// JSON Template persis seperti di API route
const PKG_TEMPLATE = {
  "instrumen": {
    "nama": "Instrumen Evaluasi Kepuasan Peserta Pelatihan (PKG)",
    "deskripsi": "Instrumen resmi evaluasi kepuasan peserta untuk kegiatan Peningkatan Kompetensi Guru (PKG)."
  },
  "sections": [
    {
      "nama": "Identitas Kegiatan",
      "urutan": 1,
      "items": [
        { "label": "Nama Kegiatan", "tipe_data": "pilihan_ganda", "wajib": true, "opsi": ["Pelatihan Guru SD", "Pelatihan Guru SMP", "Pelatihan Kepala Sekolah"] }
      ]
    },
    {
      "nama": "Sarana dan Prasarana Kegiatan",
      "urutan": 2,
      "items": [
        { "label": "Kemudahan akses menuju tempat penyelenggaraan kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Kesiapan sarana kegiatan (audio visual, LCD/laptop, dll)", "tipe_data": "likert4", "wajib": true },
        { "label": "Kenyamanan ruang kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Kebersihan ruang kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Kenyamanan toilet", "tipe_data": "likert4", "wajib": true },
        { "label": "Ketersediaan sarana ibadah", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Konsumsi dan Akomodasi",
      "urutan": 3,
      "items": [
        { "label": "Kualitas konsumsi yang disediakan", "tipe_data": "likert4", "wajib": true },
        { "label": "Ketepatan waktu penyajian konsumsi", "tipe_data": "likert4", "wajib": true },
        { "label": "Kenyamanan penginapan (jika menginap)", "tipe_data": "likert4", "wajib": false }
      ]
    },
    {
      "nama": "Pelaksanaan Kegiatan",
      "urutan": 4,
      "items": [
        { "label": "Kesesuaian alokasi waktu pelaksanaan kegiatan", "tipe_data": "likert4", "wajib": true },
        { "label": "Kejelasan alur sesi kegiatan dari awal hingga akhir", "tipe_data": "likert4", "wajib": true },
        { "label": "Interaktivitas metode pelatihan", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Materi dan Bahan Ajar",
      "urutan": 5,
      "items": [
        { "label": "Relevansi materi dengan kebutuhan peserta", "tipe_data": "likert4", "wajib": true },
        { "label": "Kelengkapan bahan ajar/modul", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Narasumber/Fasilitator",
      "urutan": 6,
      "items": [
        { "label": "Kejelasan penyampaian materi oleh narasumber", "tipe_data": "likert4", "wajib": true },
        { "label": "Penguasaan materi oleh narasumber", "tipe_data": "likert4", "wajib": true },
        { "label": "Kemampuan menjawab pertanyaan peserta", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Pelayanan Panitia",
      "urutan": 7,
      "items": [
        { "label": "Keramahan panitia dalam melayani peserta", "tipe_data": "likert4", "wajib": true },
        { "label": "Responsivitas panitia terhadap kendala peserta", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Efektivitas Pelatihan",
      "urutan": 8,
      "items": [
        { "label": "Saya merasa siap menerapkan hasil pelatihan ini", "tipe_data": "likert4", "wajib": true },
        { "label": "Pelatihan ini meningkatkan kepercayaan diri saya", "tipe_data": "likert4", "wajib": true }
      ]
    },
    {
      "nama": "Kepuasan Keseluruhan",
      "urutan": 9,
      "items": [
        { "label": "Secara keseluruhan, seberapa puas Anda dengan kegiatan ini?", "tipe_data": "likert4", "wajib": true },
        { "label": "Apakah Anda akan merekomendasikan pelatihan ini?", "tipe_data": "pilihan_ganda", "opsi": ["Ya", "Tidak", "Ragu-ragu"], "wajib": true }
      ]
    },
    {
      "nama": "Saran",
      "urutan": 10,
      "items": [
        { "label": "Saran terhadap penyelenggaraan kegiatan", "tipe_data": "esai", "wajib": true }
      ]
    }
  ]
};

async function run() {
  console.log("Membentuk Kegiatan PKG Resmi (Final)...");

  // 1. Insert Kegiatan
  const { data: kegData, error: kegErr } = await supabase
    .from('kegiatan')
    .insert([{
      nama_kegiatan: 'Evaluasi PKG Resmi (Gelombang 1)',
      kategori_program: 'PKG',
      status: 'aktif',
      tahun: new Date().getFullYear()
    }])
    .select()
    .single();

  if (kegErr) { console.error("Error Kegiatan:", kegErr); return; }
  console.log("Kegiatan ID:", kegData.id);

  // 2. Insert Instrumen
  const { data: instData, error: instErr } = await supabase
    .from('instrumen')
    .insert([{
      kegiatan_id: kegData.id,
      nama_instrumen: PKG_TEMPLATE.instrumen.nama,
      deskripsi: PKG_TEMPLATE.instrumen.deskripsi
    }])
    .select()
    .single();

  if (instErr) { console.error("Error Instrumen:", instErr); return; }

  // 3. Insert Sections & Items
  for (const section of PKG_TEMPLATE.sections) {
    const { data: secData, error: secErr } = await supabase
      .from('instrumen_section')
      .insert([{
        instrumen_id: instData.id,
        nama_section: section.nama,
        urutan: section.urutan
      }])
      .select()
      .single();

    let urutanItem = 1;
    for (const item of section.items) {
      await supabase.from('instrumen_item').insert([{
        section_id: secData.id,
        teks_pertanyaan: item.label,
        tipe_jawaban: item.tipe_data,
        opsi_jawaban: item.opsi || null,
        urutan: urutanItem++
      }]);
    }
  }

  console.log("SUKSES! Silakan kunjungi: https://mpls-ten.vercel.app/isi-form/public/" + kegData.id);
}

run();
