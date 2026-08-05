import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonevEntryData } from './supabase';
import { INSTRUMEN_BARU } from '@/config/instruments';
import { InstrumenFull } from '@/lib/types';

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

export function generateDynamicPDFSummary(schema: InstrumenFull, pengisians: any[]) {
  const doc = new jsPDF('portrait');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(schema.nama_instrumen.toUpperCase(), 105, 22, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Responden: ${pengisians.length} orang`, 105, 29, { align: 'center' });

  if (pengisians.length === 0) {
    doc.text('Belum ada data.', 105, 50, { align: 'center' });
    doc.save(`Rekap_${schema.nama_instrumen}_Kosong.pdf`);
    return;
  }

  // --- PRE-CALCULATE AGGREGATIONS ---
  const sectionAverages: { nama: string, avg: number }[] = [];
  const itemStats: { id: string, teks: string, section: string, avg: number }[] = [];

  schema.sections.forEach(sec => {
    let secTotalScore = 0;
    let secTotalAnswers = 0;

    sec.items.forEach(item => {
      if (item.tipe_jawaban.includes('likert')) {
        let itemTotalScore = 0;
        let itemAnswersCount = 0;

        pengisians.forEach(p => {
          const ans = p.jawaban.find((j: any) => j.item_id === item.id);
          if (ans && ans.nilai_skor) {
            itemTotalScore += ans.nilai_skor;
            itemAnswersCount++;
            secTotalScore += ans.nilai_skor;
            secTotalAnswers++;
          }
        });

        if (itemAnswersCount > 0) {
          itemStats.push({
            id: item.id,
            teks: item.teks_pertanyaan,
            section: sec.nama_section,
            avg: itemTotalScore / itemAnswersCount
          });
        }
      }
    });

    if (secTotalAnswers > 0 && !sec.nama_section.toLowerCase().includes('identitas') && !sec.nama_section.toLowerCase().includes('saran')) {
      sectionAverages.push({
        nama: sec.nama_section,
        avg: secTotalScore / secTotalAnswers
      });
    }
  });

  let currentY = 40;

  // 1. KINERJA PER ASPEK (Tabel)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Kinerja Keseluruhan per Aspek (IKP / SKM)', 14, currentY);
  
  const getMutu = (nik: number) => {
    if (nik >= 88.31) return 'Sangat Baik (A)';
    if (nik >= 76.61) return 'Baik (B)';
    if (nik >= 65.00) return 'Kurang Baik (C)';
    return 'Tidak Baik (D)';
  };

  const aspectRows = sectionAverages.map((s, idx) => {
    const nik = (s.avg / 4) * 100;
    return [
      idx + 1,
      s.nama,
      s.avg.toFixed(2),
      nik.toFixed(2),
      getMutu(nik)
    ];
  });

  // Calculate Overall Averages for Footer
  let totalScore = 0;
  sectionAverages.forEach(s => totalScore += s.avg);
  const overallAvg = sectionAverages.length > 0 ? totalScore / sectionAverages.length : 0;
  const overallNik = (overallAvg / 4) * 100;

  aspectRows.push([
    '',
    'RATA-RATA KESELURUHAN',
    overallAvg.toFixed(2),
    overallNik.toFixed(2),
    getMutu(overallNik)
  ] as any);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['No', 'Aspek / Bagian', 'Skala Asli (1-4)', 'Konversi SKM (25-100)', 'Kategori Mutu']],
    body: aspectRows,
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] }, // Purple
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 
      0: { cellWidth: 10, halign: 'center' }, 
      2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 35, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
      4: { cellWidth: 35, halign: 'center' }
    },
    didParseCell: function (data) {
      if (data.row.index === aspectRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    }
  });

  // @ts-ignore (doc.lastAutoTable exists)
  currentY = doc.lastAutoTable.finalY + 15;

  // 2. KEKUATAN & KELEMAHAN
  const sortedItems = [...itemStats].sort((a, b) => b.avg - a.avg);
  const top3 = sortedItems.slice(0, 3);
  const bottom3 = sortedItems.length > 3 ? [...sortedItems].reverse().slice(0, 3) : [];

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Wawasan Instan (Kekuatan & Area Perbaikan)', 14, currentY);
  
  currentY += 10;
  
  // Top 3
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Green
  doc.text('Kekuatan Utama (3 Tertinggi):', 14, currentY);
  doc.setTextColor(0, 0, 0);
  currentY += 6;
  
  top3.forEach((item, idx) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const textLines = doc.splitTextToSize(`${idx + 1}. ${item.teks} (${item.section})`, 160);
    doc.text(textLines, 14, currentY);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(item.avg.toFixed(2), 180, currentY);
    doc.setTextColor(0, 0, 0);
    
    currentY += (textLines.length * 5) + 2;
  });

  currentY += 5;

  // Bottom 3
  if (bottom3.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68); // Red
    doc.text('Area Perbaikan (3 Terendah):', 14, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 6;
    
    bottom3.forEach((item, idx) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const textLines = doc.splitTextToSize(`${idx + 1}. ${item.teks} (${item.section})`, 160);
      doc.text(textLines, 14, currentY);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text(item.avg.toFixed(2), 180, currentY);
      doc.setTextColor(0, 0, 0);
      
      currentY += (textLines.length * 5) + 2;
    });
  }

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Ringkasan_Eksekutif_${schema.nama_instrumen.replace(/[^a-zA-Z0-9]/g, '_')}_${today}.pdf`);
}
