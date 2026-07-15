import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonevEntryData } from './supabase';
import { INSTRUMEN_BARU, getItemsForJenjang, Jenjang } from '@/config/instruments';

export function generatePDF(data: MonevEntryData) {
  const doc = new jsPDF();
  
  // Halaman 1: Identitas dan Kop
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTRUMEN MONITORING DAN EVALUASI (MONEV)', 105, 20, { align: 'center' });
  doc.text('MPLS RAMAH 2026', 105, 26, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Identitas Sekolah', 20, 38);
  doc.text(`Nama Sekolah : ${data.namaSekolah}`, 20, 44);
  doc.text(`NPSN         : ${data.npsn || '-'}`, 20, 50);
  doc.text(`Kabupaten/Kota: ${data.kabKota || '-'}`, 20, 56);
  doc.text(`Jenjang      : ${data.jenjang}`, 20, 62);
  doc.text(`Tanggal      : ${data.tanggal}`, 20, 68);
  doc.text(`Petugas Monev: ${data.namaPetugas}`, 20, 74);

  let currentY = 82;

  // Render semua kategori instrumen
  INSTRUMEN_BARU.forEach((kategori) => {
    const validItems = getItemsForJenjang(kategori, data.jenjang as Jenjang);
    if (validItems.length === 0) return;

    // Jika sisa ruang terlalu kecil, buat halaman baru
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246); // Warna biru ala header lama (sesuaikan jika perlu, misal hitam)
    doc.text(kategori.judul, 20, currentY);
    
    let head: string[][] = [];
    let rows: any[][] = [];
    let colStyles: any = {};

    if (kategori.tipeJawaban === 'ya-tidak') {
      head = [['No', 'Pernyataan', 'Ya', 'Tidak', 'Catatan/Keterangan']];
      colStyles = { 
        0: { cellWidth: 10 }, 
        2: { cellWidth: 15, halign: 'center' }, 
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 40 }
      };
      rows = validItems.map((item, index) => {
        const ans = data.jawabanUmum[item.id] || {};
        return [
          index + 1,
          item.pertanyaan,
          ans.jawaban === true ? 'V' : '',
          ans.jawaban === false ? 'V' : '',
          ans.catatan || ''
        ];
      });
    } else {
      head = [['No', 'Pernyataan', 'SS', 'S', 'TS', 'STS', 'Catatan/Keterangan']];
      colStyles = { 
        0: { cellWidth: 10 }, 
        2: { cellWidth: 10, halign: 'center' }, 
        3: { cellWidth: 10, halign: 'center' },
        4: { cellWidth: 10, halign: 'center' },
        5: { cellWidth: 10, halign: 'center' },
        6: { cellWidth: 35 }
      };
      rows = validItems.map((item, index) => {
        const ans = data.jawabanUmum[item.id] || {};
        return [
          index + 1,
          item.pertanyaan,
          ans.jawaban === 'SS' ? 'V' : '',
          ans.jawaban === 'S' ? 'V' : '',
          ans.jawaban === 'TS' ? 'V' : '',
          ans.jawaban === 'STS' ? 'V' : '',
          ans.catatan || ''
        ];
      });
    }

    autoTable(doc, {
      startY: currentY + 3,
      head: head,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], halign: 'center' },
      columnStyles: colStyles,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 2 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

  // Materi & Rangkaian Tes MPLS Table
  if (data.materiTes) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('MATERI & RANGKAIAN TES MPLS', 20, currentY);
    
    const materiRows = [
      ['1. Materi Utama', data.materiTes.materiUtama?.rincian || '-', data.materiTes.materiUtama?.waktu || '-'],
      ['2. Materi Pilihan', data.materiTes.materiPilihan?.rincian || '-', data.materiTes.materiPilihan?.waktu || '-'],
      ['3. Rangkaian Tes', data.materiTes.rangkianTes?.rincian || '-', data.materiTes.rangkianTes?.waktu || '-']
    ];
    
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Kategori', 'Rincian Kegiatan', 'Waktu Pelaksanaan']],
      body: materiRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      columnStyles: { 
        0: { cellWidth: 40, fontStyle: 'bold' }, 
        1: { cellWidth: 85 }, 
        2: { cellWidth: 45 }
      },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 2.5 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Permasalahan & Solusi Table
  if (data.permasalahanSolusi) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('PERMASALAHAN & SOLUSI', 20, currentY);
    
    const masalahRows = [
      ['Tahap Perencanaan', data.permasalahanSolusi.perencanaan?.rincian || '-', data.permasalahanSolusi.perencanaan?.solusi || '-'],
      ['Tahap Pelaksanaan', data.permasalahanSolusi.pelaksanaan?.rincian || '-', data.permasalahanSolusi.pelaksanaan?.solusi || '-']
    ];
    
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Tahap', 'Permasalahan / Kendala', 'Solusi Penyelesaian']],
      body: masalahRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      columnStyles: { 
        0: { cellWidth: 40, fontStyle: 'bold' }, 
        1: { cellWidth: 65 }, 
        2: { cellWidth: 65 }
      },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 2.5 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Cek ruang untuk kesimpulan
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }

  // Kesimpulan & Rekomendasi
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('KESIMPULAN', 20, currentY);
  currentY += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Tampilkan status final jika diperlukan
  doc.text(`Status Penilaian: ${data.statusFinal} (${data.statusOtomatis})`, 20, currentY);
  currentY += 6;

  const splitCatatan = doc.splitTextToSize(data.catatanKritis || '........................................................................', 170);
  doc.text(splitCatatan, 20, currentY);
  currentY += (splitCatatan.length * 5) + 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('REKOMENDASI', 20, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const splitRekomendasi = doc.splitTextToSize(data.rekomendasi || '........................................................................', 170);
  doc.text(splitRekomendasi, 20, currentY);
  
  currentY += (splitRekomendasi.length * 5) + 25;

  // Tanda Tangan
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.text('Mengetahui,', 40, currentY, { align: 'center' });
  doc.text('Kepala Sekolah', 40, currentY + 6, { align: 'center' });
  
  doc.text(`${data.namaPetugas}, ${data.tanggal}`, 160, currentY, { align: 'center' });
  doc.text('Petugas Monev', 160, currentY + 6, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(data.namaKepsek, 40, currentY + 30, { align: 'center' });
  doc.text(data.namaPetugas, 160, currentY + 30, { align: 'center' });

  // Simpan
  doc.save(`Monev_MPLS_${data.namaSekolah.replace(/\s+/g, '_')}_${data.tanggal}.pdf`);
}
