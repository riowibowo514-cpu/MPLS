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

const METADATA_FIELDS = [
  { label: '[Profil Petugas Monev] Nama', type: 'text' },
  { label: '[Profil Petugas Monev] Instansi', type: 'text' },
  { label: '[Profil Petugas Monev] Nama Sekolah monev', type: 'text' },
  { label: '[Profil Petugas Monev] Kab/Kota monev', type: 'text' },
  { label: '[Profil Petugas Monev] Hari & Tanggal monev', type: 'date' },
  { label: '[Data Sasaran Monev] Nama Guru', type: 'text' },
  { label: '[Data Sasaran Monev] Guru Kelas/Mapel', type: 'text' },
  { label: '[Data Sasaran Monev] Jumlah Rombel', type: 'number' },
  { label: '[Data Sasaran Monev] Jumlah Murid', type: 'number' }
];

const TEMPLATE = {
  "instrumen": {
    "nama": "INSTRUMEN MONEV IMPLEMENTASI 7 JURUS BK HEBAT",
    "deskripsi": "Instrumen evaluasi dan monitoring untuk pelaksanaan program 7 Jurus BK Hebat."
  },
  "sections": [
    {
      "nama": "Implementasi",
      "urutan": 1,
      "items": [
        { "label": "Apakah 7 Jurus BK hebat disosialisasikan ke Pihak Sekolah?", "tipe_data": "pilihan_ganda", "wajib": true, "opsi": ["Ya", "Tidak"] },
        { "label": "Jika sudah, berapa persen guru yang hadir?", "tipe_data": "teks_singkat", "wajib": false },
        { "label": "Jurus berapa yang sudah di implementasikan di sekolah?", "tipe_data": "teks_singkat", "wajib": true }
      ]
    },
    {
      "nama": "Rincian Implementasi Jurus 1",
      "urutan": 2,
      "items": [
        { "label": "Instrumen apa yang digunakan untuk memetakan kompetensi murid?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana tidak lanjut hasil pemetaan kompetensi murid (terintegrasi dengan RPL dan Program Tahunan BK)?", "tipe_data": "esai", "wajib": true },
        { "label": "Siapa saja yang terlibat dalam implementasi Jurus 1?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana Dampak implementasi Jurus 1 terhadap lingkungan sekolah (Murid, Rekan Sejawat, Orang Tua, KS)?", "tipe_data": "esai", "wajib": true },
        { "label": "Refleksi Implementasi Jurus 1", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Jurus 2",
      "urutan": 3,
      "items": [
        { "label": "Apakah tersedia Instrumen PSE (Pembelajaran Sosial Emosional) di dalam kelas? Jika ada seperti apa bentuk dan penerapannya?", "tipe_data": "esai", "wajib": true },
        { "label": "Jika belum, bagaimana penerapan PSE di dalam kelas?", "tipe_data": "esai", "wajib": false },
        { "label": "Siapa saja yang terlibat dalam penyusunan dan penerapan PSE?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana Dampak implementasi Jurus 2 terhadap lingkungan sekolah (Murid, Rekan Sejawat, Orang Tua, KS)?", "tipe_data": "esai", "wajib": true },
        { "label": "Refleksi Implementasi Jurus 2", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Jurus 3",
      "urutan": 4,
      "items": [
        { "label": "Apakah ada program khusus untuk menumbuhkan resiliensi pada murid? Jika ada seperti apa programnya?", "tipe_data": "esai", "wajib": true },
        { "label": "Jika tidak, apa yang dilakukan untuk menumbuhkan resiliensi pada murid?", "tipe_data": "esai", "wajib": false },
        { "label": "Siapa saja yang terlibat dalam implementasi Jurus 3?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana Dampak implementasi Jurus 3 terhadap lingkungan sekolah (Murid, Rekan Sejawat, Orang Tua, KS)?", "tipe_data": "esai", "wajib": true },
        { "label": "Refleksi Implementasi Jurus 3", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Jurus 4",
      "urutan": 5,
      "items": [
        { "label": "Bagaimana menjaga konsistensi kebiasan positif yang muncul di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana meminimalisir kebiasaan negatif yang muncul di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Siapa saja yang terlibat dalam implementasi Jurus 4?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana Dampak implementasi Jurus 4 terhadap lingkungan sekolah (Murid, Rekan Sejawat, Orang Tua, KS)?", "tipe_data": "esai", "wajib": true },
        { "label": "Refleksi Implementasi Jurus 4", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Jurus 5",
      "urutan": 6,
      "items": [
        { "label": "Apakah ada ruangan khusus untuk konseling di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Teknik konseling apa yang biasanya digunakan?", "tipe_data": "esai", "wajib": true },
        { "label": "Topik apa saja yang sering disampaikan oleh murid?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana membangun koneksi dan rasa percaya dari murid?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana Dampak implementasi Jurus 5 terhadap lingkungan sekolah (Murid, Rekan Sejawat, Orang Tua, KS)?", "tipe_data": "esai", "wajib": true },
        { "label": "Refleksi Implementasi Jurus 5", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Jurus 6",
      "urutan": 7,
      "items": [
        { "label": "Bagaimana bentuk kolaborasi pihak sekolah dengan orang tua?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana bentuk kolaborasi penanganan masalah murid yang ada di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Apakah ada alur penyelesaian masalah murid yang digunakan di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana Dampak implementasi Jurus 6 terhadap lingkungan sekolah (Murid, Rekan Sejawat, Orang Tua, KS)?", "tipe_data": "esai", "wajib": true },
        { "label": "Refleksi Implementasi Jurus 6", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Jurus 7",
      "urutan": 8,
      "items": [
        { "label": "Seperti apa bentuk manajemen resiko yang ada di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Siapa saja yang terlibat dalam manajemen resiko di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana penerapan system thinking (5R) di sekolah?", "tipe_data": "esai", "wajib": true },
        { "label": "Bagaimana Dampak implementasi Jurus 7 terhadap lingkungan sekolah (Murid, Rekan Sejawat, Orang Tua, KS)?", "tipe_data": "esai", "wajib": true },
        { "label": "Refleksi Implementasi Jurus 7", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Kendala Implementasi",
      "urutan": 9,
      "items": [
        { "label": "Apa kendala pengimplemtasian setiap jurusnya?", "tipe_data": "esai", "wajib": true }
      ]
    },
    {
      "nama": "Harapan, Kritik dan Saran",
      "urutan": 10,
      "items": [
        { "label": "Harapan terkait program 7 Jurus BK Hebat", "tipe_data": "esai", "wajib": true },
        { "label": "Kritik dan Saran terkait pelatihan 7 Jurus BK Hebat", "tipe_data": "esai", "wajib": true }
      ]
    }
  ]
};

async function run() {
  console.log("Membentuk Kegiatan & Instrumen BK Hebat...");

  // 1. Insert Kegiatan
  const { data: kegData, error: kegErr } = await supabase
    .from('kegiatan')
    .insert([{
      nama_kegiatan: 'Monitoring 7 Jurus BK Hebat 2026',
      kategori_program: 'MONEV',
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
      nama_instrumen: TEMPLATE.instrumen.nama,
      deskripsi: TEMPLATE.instrumen.deskripsi
    }])
    .select()
    .single();

  if (instErr) { console.error("Error Instrumen:", instErr); return; }
  
  // 3. Insert Metadata Fields
  for (let i = 0; i < METADATA_FIELDS.length; i++) {
    await supabase.from('instrumen_metadata_field').insert([{
      instrumen_id: instData.id,
      label_field: METADATA_FIELDS[i].label,
      tipe_field: METADATA_FIELDS[i].type,
      urutan: i,
      wajib_diisi: true
    }]);
  }

  // 4. Insert Sections & Items
  for (const section of TEMPLATE.sections) {
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

  console.log("SUKSES! Silakan kunjungi: http://localhost:3000/isi-form/public/" + kegData.id);
}

run();
