const fs = require('fs');
let code = fs.readFileSync('src/app/api/panitia/buat-evaluasi/route.ts', 'utf-8');

// Replace body destructuring
code = code.replace(
  'const { namaKegiatan, deskripsi, tanggalMulai, tanggalSelesai, adaKonsumsi, adaPenginapan, pin, tipeKuesioner, tarikBiodata, isRakor, tempatPelaksanaan } = body;',
  'const { namaKegiatan, deskripsi, tanggalMulai, tanggalSelesai, adaKonsumsi, adaPenginapan, pin, tipeKuesioner, tarikBiodata, isRakor, tempatPelaksanaan, jamMulaiSesi, daftarKelas } = body;'
);

// Add session generator before Sukses
const generatorLogic = 
    // --- GENERATOR SESI ABSEN OTOMATIS ---
    if (jamMulaiSesi) {
      const start = new Date(tanggalMulai);
      const end = new Date(tanggalSelesai);
      const dateList = [];
      let current = new Date(start);
      while (current <= end) {
        dateList.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      let classList = [''];
      if (daftarKelas && daftarKelas.trim() !== '') {
        classList = daftarKelas.split(',').map(c => c.trim()).filter(c => c !== '');
      }

      const sesiToInsert = [];
      dateList.forEach((tgl, i) => {
        const hariKe = i + 1;
        classList.forEach((cls) => {
          let namaSesi = \Hari \\;
          if (cls) {
            namaSesi += \ - \\;
          }
          if (tempatPelaksanaan) {
            namaSesi += \ (\)\;
          }
          sesiToInsert.push({
            kegiatan_id: newKegiatanId,
            nama_sesi: namaSesi,
            tanggal: tgl,
            jam_mulai: jamMulaiSesi,
            toleransi_menit: 15,
            status: 'dibuka'
          });
        });
      });

      if (sesiToInsert.length > 0) {
        await supabase.from('sesi_kegiatan').insert(sesiToInsert);
      }
    }
    // -------------------------------------

    // Sukses;

code = code.replace('// Sukses', generatorLogic);
fs.writeFileSync('src/app/api/panitia/buat-evaluasi/route.ts', code);
console.log('Done replacing API');
