import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { INSTRUMEN_BARU } from '@/config/instruments';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Ambil data dari monev_entry (Tabel MPLS lama)
    let allData: any[] = [];
    let pFetchMore = true;
    let pOffset = 0;
    const pLimit = 1000;
    
    while (pFetchMore) {
      const { data, error } = await supabase
        .from('monev_entry')
        .select('*')
        .order('createdAt', { ascending: true })
        .range(pOffset, pOffset + pLimit - 1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        allData = [...allData, ...data];
        if (data.length < pLimit) pFetchMore = false;
        else pOffset += pLimit;
      } else {
        pFetchMore = false;
      }
    }

    if (allData.length === 0) {
      return NextResponse.json({ error: 'Data MPLS masih kosong' }, { status: 404 });
    }

    // --- MERANGKAI EXCEL --- //
    const rows: any[] = [];
    const headers = [
      'ID Pengisian',
      'Tanggal Submit Sistem',
      'Tanggal Monev (Isian Form)',
      'Nama Petugas',
      'Nama Sekolah',
      'NPSN',
      'Jenjang',
      'Kabupaten/Kota',
      'Nama Kepala Sekolah',
      'Status Otomatis (Sistem)',
      'Status Final (Subjektif)',
      'Alasan Mengubah Status',
      'Catatan Kritis',
      'Rekomendasi',
      // Materi Tes
      'Materi Utama (Rincian)', 'Materi Utama (Waktu)',
      'Materi Pilihan (Rincian)', 'Materi Pilihan (Waktu)',
      'Rangkaian Tes (Rincian)', 'Rangkaian Tes (Waktu)',
      // Permasalahan & Solusi
      'Permasalahan Perencanaan', 'Solusi Perencanaan',
      'Permasalahan Pelaksanaan', 'Solusi Pelaksanaan'
    ];

    // Mengumpulkan ID Soal untuk memastikan urutannya statis saat mapping
    const soalList: Array<{ id: string, label: string }> = [];
    INSTRUMEN_BARU.forEach(kategori => {
      kategori.items.forEach(item => {
        const title = `[${kategori.judul}] ${item.pertanyaan}`;
        soalList.push({ id: item.id, label: title });
        headers.push(`${title} (Jawaban)`);
        headers.push(`${title} (Catatan/Bukti)`);
      });
    });

    rows.push(headers);

    // Isi Data Baris
    allData.forEach(p => {
      const row = [];
      
      // Identitas
      row.push(p.id);
      
      // Tanggal Submit
      let formattedDate = '-';
      if (p.createdAt) {
        const d = new Date(p.createdAt);
        const dJakarta = new Date(d.getTime() + 7 * 60 * 60 * 1000);
        formattedDate = `${dJakarta.getUTCDate().toString().padStart(2, '0')}/${(dJakarta.getUTCMonth()+1).toString().padStart(2, '0')}/${dJakarta.getUTCFullYear()} ${dJakarta.getUTCHours().toString().padStart(2, '0')}:${dJakarta.getUTCMinutes().toString().padStart(2, '0')}:${dJakarta.getUTCSeconds().toString().padStart(2, '0')}`;
      }
      row.push(formattedDate);
      
      row.push(p.tanggal || '-');
      row.push(p.namaPetugas || '-');
      row.push(p.namaSekolah || '-');
      row.push(p.npsn || '-');
      row.push(p.jenjang || '-');
      row.push(p.kabKota || '-');
      row.push(p.namaKepsek || '-');
      
      // Skoring & Kesimpulan
      row.push(p.statusOtomatis || '-');
      row.push(p.statusFinal || '-');
      row.push(p.alasanOverride || '-');
      row.push(p.catatanKritis || '-');
      row.push(p.rekomendasi || '-');

      // Materi Tes
      row.push(p.materiTes?.materiUtama?.rincian || '-');
      row.push(p.materiTes?.materiUtama?.waktu || '-');
      row.push(p.materiTes?.materiPilihan?.rincian || '-');
      row.push(p.materiTes?.materiPilihan?.waktu || '-');
      row.push(p.materiTes?.rangkianTes?.rincian || '-');
      row.push(p.materiTes?.rangkianTes?.waktu || '-');

      // Permasalahan
      row.push(p.permasalahanSolusi?.perencanaan?.rincian || '-');
      row.push(p.permasalahanSolusi?.perencanaan?.solusi || '-');
      row.push(p.permasalahanSolusi?.pelaksanaan?.rincian || '-');
      row.push(p.permasalahanSolusi?.pelaksanaan?.solusi || '-');

      // Jawaban Soal
      const jawabanUmum = p.jawabanUmum || {};
      soalList.forEach(soal => {
        const j = jawabanUmum[soal.id] || {};
        
        // Konversi Boolean ke Teks Ya/Tidak jika perlu
        let teksJawaban = j.jawaban !== undefined ? String(j.jawaban) : '-';
        if (teksJawaban === 'true') teksJawaban = 'Ya';
        if (teksJawaban === 'false') teksJawaban = 'Tidak';

        row.push(teksJawaban);
        row.push(j.catatan || '-');
      });

      rows.push(row);
    });

    // Buat Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    
    // Set Column Widths based on header length (max 50 chars)
    const colWidths = headers.map(header => {
      return { wch: Math.min(50, Math.max(15, String(header).length + 2)) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data MPLS');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Data_MPLS_Lama.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error('Excel Export MPLS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
