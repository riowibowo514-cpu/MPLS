import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qrToken, pesertaId, nama, instansi, ttdDigital } = body;

    if (!qrToken || !nama || !ttdDigital) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    // 1. Validasi Sesi
    const { data: sesi, error: sesiErr } = await supabase
      .from('sesi_kegiatan')
      .select('*')
      .eq('qr_token', qrToken)
      .single();

    if (sesiErr || !sesi) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 404 });
    }

    if (sesi.status !== 'aktif') {
      return NextResponse.json({ error: 'Sesi absensi ini telah ditutup.' }, { status: 403 });
    }

    // 2. Kalkulasi Terlambat / Tepat Waktu (Zona Waktu WIB / Asia/Jakarta)
    // Server Vercel menggunakan UTC. Kita pastikan waktu_absen diukur secara adil.
    const nowUtc = new Date();
    // Offset WIB adalah +7 jam dari UTC
    const nowWib = new Date(nowUtc.getTime() + 7 * 60 * 60 * 1000);
    
    // Parse jam mulai sesi (asumsi format HH:mm:ss atau HH:mm)
    const [jam, menit] = sesi.jam_mulai.split(':').map(Number);
    
    // Buat objek Date batas waktu hari ini (WIB)
    const batasWaktuWib = new Date(nowWib);
    batasWaktuWib.setUTCHours(jam, menit + sesi.toleransi_menit, 0, 0);

    let statusKehadiran = 'Tepat Waktu';
    let menitKeterlambatan = 0;

    if (nowWib > batasWaktuWib) {
      statusKehadiran = 'Terlambat';
      menitKeterlambatan = Math.floor((nowWib.getTime() - batasWaktuWib.getTime()) / 60000);
    }

    // 3. Tangani Peserta (Cari atau Buat Baru)
    let finalPesertaId = pesertaId;

    if (!finalPesertaId) {
      // Coba cari apakah nama ini sudah terdaftar di kegiatan ini (menghindari duplikasi jika HP reset)
      const { data: existingPeserta } = await supabase
        .from('daftar_peserta')
        .select('id')
        .eq('kegiatan_id', sesi.kegiatan_id)
        .ilike('nama', nama.trim())
        .limit(1)
        .single();

      if (existingPeserta) {
        finalPesertaId = existingPeserta.id;
      } else {
        // Buat peserta baru
        const { data: newPeserta, error: newPesertaErr } = await supabase
          .from('daftar_peserta')
          .insert([{
            kegiatan_id: sesi.kegiatan_id,
            nama: nama.trim(),
            instansi_asal: instansi ? instansi.trim() : null
          }])
          .select('id')
          .single();

        if (newPesertaErr || !newPeserta) {
          throw new Error('Gagal mendaftarkan peserta baru: ' + newPesertaErr?.message);
        }
        finalPesertaId = newPeserta.id;
      }
    }

    // 4. Cek apakah sudah absen di sesi ini
    const { data: cekAbsen } = await supabase
      .from('absensi')
      .select('id')
      .eq('sesi_id', sesi.id)
      .eq('peserta_id', finalPesertaId)
      .single();

    if (cekAbsen) {
      // Jika sudah absen, kembalikan data sukses tanpa error agar UI ramah, 
      // namun kita tidak menimpa data yang sudah ada.
      return NextResponse.json({ 
        success: true, 
        peserta_id: finalPesertaId,
        nama: nama,
        message: 'Sudah absen sebelumnya.'
      });
    }

    // 5. Simpan Absensi
    const { error: absenErr } = await supabase
      .from('absensi')
      .insert([{
        sesi_id: sesi.id,
        peserta_id: finalPesertaId,
        nama_snapshot: nama.trim(),
        status_kehadiran: statusKehadiran,
        menit_keterlambatan: menitKeterlambatan,
        ttd_digital: ttdDigital
      }]);

    if (absenErr) {
      throw new Error('Gagal menyimpan kehadiran: ' + absenErr.message);
    }

    return NextResponse.json({ 
      success: true,
      peserta_id: finalPesertaId,
      nama: nama.trim()
    });

  } catch (error: any) {
    console.error('Submit Absen Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal.' }, { status: 500 });
  }
}
