const sampleData = [
  { no: 1,  nama_lengkap: 'Yori Firmansyah',           instansi: 'SMPN 2 X KOTO DIATAS',                       kab_kota: 'Kab. Solok' },
  { no: 2,  nama_lengkap: 'Nelfa Yanti, S.Pd. AUD',    instansi: 'TK Hidup Bersama',                           kab_kota: 'Kab. Tanah Datar' },
  { no: 3,  nama_lengkap: 'Resti Fauziah',             instansi: 'SD Negeri 09 Pauh',                          kab_kota: 'Kab. Pasaman' },
  { no: 4,  nama_lengkap: 'Yosi Elfiandra, M.Pd.',     instansi: 'SMP NEGERI 5 SUNGAI AUR',                    kab_kota: 'Kab. Pasaman Barat' },
  { no: 5,  nama_lengkap: 'Fadhila Yuli Zalmi',        instansi: 'UPT SMPN 1 BATANG KAPAS',                    kab_kota: 'Kab. Pesisir Selatan' },
  { no: 6,  nama_lengkap: 'Yusnita',                   instansi: 'TK NEGERI 1 GUNUNG TALANG KAB.SOLOK',        kab_kota: 'Kab. Solok' },
  { no: 7,  nama_lengkap: 'Harzimar Septi',            instansi: 'SDN 02 Talamau',                             kab_kota: 'Kab. Pasaman Barat' },
  { no: 8,  nama_lengkap: 'Meri Anggraini',            instansi: 'TK Unggul Terpadu',                          kab_kota: 'Kab. Padang Pariaman' },
  { no: 9,  nama_lengkap: 'Riva Zeodora',              instansi: 'TK Pembina Kecamatan',                       kab_kota: 'Kab. Padang Pariaman' },
  { no: 10, nama_lengkap: 'Ramadis',                   instansi: 'SMPN 1 Bukit Sundi',                         kab_kota: 'Kab. Solok' },
  { no: 11, nama_lengkap: 'Rahmat Hidayat',            instansi: 'SDN 14 Padang panjang barat',                kab_kota: 'Kota Padang Panjang' },
  { no: 12, nama_lengkap: 'Jon Efri',                  instansi: 'SMP NEGERI 1 BUKITTINGGI',                   kab_kota: 'Kota Bukittinggi' },
  { no: 13, nama_lengkap: 'Yopirizal',                 instansi: 'SMPN 3 RANAH AMPEK HULU TAPAN',              kab_kota: 'Kab. Pesisir Selatan' },
  { no: 14, nama_lengkap: 'Musnida, M.Pd',             instansi: 'UPT SDN 12 BATIPUAH BARUAH',                 kab_kota: 'Kab. Tanah Datar' },
  { no: 15, nama_lengkap: 'Rahma Yuni',                instansi: 'SDN 27 VII Koto Sungai Sarik',               kab_kota: 'Kab. Padang Pariaman' },
  { no: 16, nama_lengkap: 'Hapisuddin',                instansi: 'SMP Negeri 2 Mapat Tunggul',                 kab_kota: 'Kab. Pasaman' },
  { no: 17, nama_lengkap: 'Mahatia Kurnia Sari, S.Pd', instansi: 'UPTD SMP Negeri 2 Kec. Situjuah Limo Nagari',kab_kota: 'Kab. Lima Puluh Kota' },
  { no: 18, nama_lengkap: 'Riza Susanti',              instansi: 'SMP N 18 Padang',                            kab_kota: 'Kota Padang' },
  { no: 19, nama_lengkap: 'Mhd Uswah',                 instansi: 'SMPN 23 Padang',                             kab_kota: 'Kota Padang' },
  { no: 20, nama_lengkap: 'Nurpinda Syah Putri',       instansi: 'TK Ceria Maligi',                            kab_kota: 'Kab. Pasaman Barat' },
  { no: 21, nama_lengkap: 'Oktaviani',                 instansi: 'SMPN 1 Junjung Sirih',                       kab_kota: 'Kab. Solok' },
  { no: 22, nama_lengkap: 'Yelvi Monasari',            instansi: 'SMPN 4 BAYANG',                              kab_kota: 'Kab. Pesisir Selatan' },
  { no: 23, nama_lengkap: 'Amalia Wahyuni',            instansi: 'SDN 04 KOTO BALINGKA',                       kab_kota: 'Kab. Pasaman Barat' },
  { no: 24, nama_lengkap: 'Feni Herlina, M.Pd',        instansi: 'SDN 01 V Koto Timur',                        kab_kota: 'Kab. Padang Pariaman' },
  { no: 25, nama_lengkap: 'Novi Edmawita, M.Pd.',      instansi: 'Dinas Pendidikan dan Kebudayaan',            kab_kota: 'Kab. Sijunjung' },
  { no: 26, nama_lengkap: 'SRI WAHYUNI',               instansi: 'SDN 01 BATANG ANAI',                         kab_kota: 'Kab. Padang Pariaman' },
  { no: 27, nama_lengkap: 'Reni Srianti',              instansi: 'UPT SMPN 2 Bayang',                          kab_kota: 'Kab. Pesisir Selatan' },
  { no: 28, nama_lengkap: 'Gusmardiani, M.Pd',         instansi: 'Dinas Pendidikan & Kebudayaan',              kab_kota: 'Kab. Pesisir Selatan' },
  { no: 29, nama_lengkap: 'Alia Oktavia',              instansi: 'SDN 01 Durian Gadang',                       kab_kota: 'Kab. Limapuluh Kota' },
  { no: 30, nama_lengkap: 'Sonia Dwi Helfira',         instansi: 'SMPN 1 Painian',                             kab_kota: 'Kab. Pesisir Selatan' }
];

const updateDummies = async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient("https://ebblvqnxrplgoztyaxrn.supabase.co", "sb_publishable_S5-b2fpkInt0a_A8Bjpw6Q_znETmpzG");
  
  const sesiId = "18fbcffb-331d-47b9-8ca5-ba71ffb2e45e";
  const kegiatanId = "8bf47bc1-3496-4b81-988c-7aaa1cc85934";
  
  console.log("Clearing old absensi...");
  await supabase.from("absensi").delete().eq("sesi_id", sesiId);
  
  const dummySig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  console.log("Injecting exact 30 JSON participants...");
  for (const p of sampleData) {
    const { data: peserta, error: pErr } = await supabase.from("daftar_peserta").insert({
      kegiatan_id: kegiatanId,
      nama: p.nama_lengkap,
      instansi_asal: p.instansi,
      kab_kota: p.kab_kota
    }).select("id").single();
    
    if (peserta) {
      const scanDate = new Date();
      scanDate.setHours(7, 30 + Math.floor(Math.random() * 60), 0);
      
      await supabase.from("absensi").insert({
        sesi_id: sesiId,
        peserta_id: peserta.id,
        waktu_absen: scanDate.toISOString(),
        nama_snapshot: p.nama_lengkap,
        status_kehadiran: "Tepat Waktu",
        menit_keterlambatan: 0,
        ttd_digital: dummySig
      });
    }
  }
  console.log("Done injecting 30 participants!");
};
updateDummies();
