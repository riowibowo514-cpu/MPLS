import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonevEntryData } from './supabase';
import { INSTRUMEN_BARU } from '@/config/instruments';

export function generateExcelSummary(dataList: MonevEntryData[]) {
  const questionMap: Record<string, string> = {};
  
  INSTRUMEN_BARU.forEach(kategori => {
    kategori.items.forEach((item, idx) => {
      const qCode = `${kategori.id === 'perencanaan' ? 'A' : 'B'}${idx + 1}`;
      questionMap[item.id] = `${qCode}. ${item.pertanyaan}`;
      // Simpan qCode ke properti item khusus buat excel (karena ts tidak bisa, kita pakai trik di bawah)
    });
  });

  const rows = dataList.map((data, index) => {
    const row: any = {
      'No': index + 1,
      'Nama Sekolah': data.namaSekolah,
      'NPSN': data.npsn || '-',
      'Jenjang': data.jenjang,
      'Kabupaten/Kota': data.kabKota || '-',
      'Kepala Sekolah': data.namaKepsek,
      'Petugas Monev': data.namaPetugas,
      'Tanggal Monev': data.tanggal,
      'Status Sistem': data.statusOtomatis,
      'Status Final': data.statusFinal,
      'Catatan Kritis': data.catatanKritis || '-',
      'Rekomendasi': data.rekomendasi || '-'
    };

    INSTRUMEN_BARU.forEach(kategori => {
      kategori.items.forEach((item, idx) => {
        const qTitle = questionMap[item.id];
        const qCode = `${kategori.id === 'perencanaan' ? 'A' : 'B'}${idx + 1}`;
        const cTitle = `Catatan ${qCode}`;
        const ansObj = data.jawabanUmum?.[item.id];
        let val = '-';
        let cat = '-';
        if (ansObj) {
          if (ansObj.jawaban === true) val = 'Ya';
          else if (ansObj.jawaban === false) val = 'Tidak';
          else if (typeof ansObj.jawaban === 'string') val = ansObj.jawaban;
          
          if (ansObj.catatan) cat = ansObj.catatan;
        }
        row[qTitle] = val;
        row[cTitle] = cat;
      });
    });

    // Menambahkan data Bagian 4 (Materi Tes & Permasalahan Solusi)
    row['Materi Utama (Rincian)'] = data.materiTes?.materiUtama?.rincian || '-';
    row['Materi Utama (Waktu)'] = data.materiTes?.materiUtama?.waktu || '-';
    row['Materi Pilihan (Rincian)'] = data.materiTes?.materiPilihan?.rincian || '-';
    row['Materi Pilihan (Waktu)'] = data.materiTes?.materiPilihan?.waktu || '-';
    row['Rangkaian Tes (Rincian)'] = data.materiTes?.rangkianTes?.rincian || '-';
    row['Rangkaian Tes (Waktu)'] = data.materiTes?.rangkianTes?.waktu || '-';
    
    row['Masalah Perencanaan'] = data.permasalahanSolusi?.perencanaan?.rincian || '-';
    row['Solusi Perencanaan'] = data.permasalahanSolusi?.perencanaan?.solusi || '-';
    row['Masalah Pelaksanaan'] = data.permasalahanSolusi?.pelaksanaan?.rincian || '-';
    row['Solusi Pelaksanaan'] = data.permasalahanSolusi?.pelaksanaan?.solusi || '-';

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Monev');
  
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Rekap_Monev_MPLS_${today}.xlsx`);
}

export function generatePDFSummary(dataList: MonevEntryData[]) {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAPITULASI HASIL MONITORING DAN EVALUASI (MONEV)', 148, 15, { align: 'center' });
  doc.text('MPLS RAMAH 2026', 148, 22, { align: 'center' });
  
  const headers = [['No', 'NPSN', 'Nama Sekolah', 'Jenjang', 'Kab/Kota', 'Petugas', 'Tanggal', 'Status Final']];
  const rows = dataList.map((data, index) => [
    index + 1,
    data.npsn || '-',
    data.namaSekolah,
    data.jenjang,
    data.kabKota || '-',
    data.namaPetugas,
    data.tanggal,
    data.statusFinal
  ]);

  autoTable(doc, {
    startY: 30,
    head: headers,
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], halign: 'center' },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 20 },
      4: { cellWidth: 40 },
      5: { cellWidth: 40 },
      6: { cellWidth: 25 },
      7: { halign: 'center', fontStyle: 'bold' }
    },
  });

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Rekap_Monev_MPLS_${today}.pdf`);
}
