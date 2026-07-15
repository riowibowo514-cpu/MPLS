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
  doc.text(`Nama Sekolah : ${data.namaSekolah}`, 20, 45);
  doc.text(`Jenjang      : ${data.jenjang}`, 20, 52);
  doc.text(`Tanggal      : ${data.tanggal}`, 20, 59);
  doc.text(`Petugas Monev: ${data.namaPetugas}`, 20, 66);

  let currentY = 75;

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
    
    const rows = validItems.map((item, index) => {
      const ans = data.jawabanUmum[item.id] || {};
      return [
        index + 1,
        item.pertanyaan,
        ans.jawaban === true ? 'Ya' : '',
        ans.jawaban === false ? 'Tidak' : '',
        ans.catatan || ''
      ];
    });

    autoTable(doc, {
      startY: currentY + 3,
      head: [['No', 'Indikator', 'Ya', 'Tidak', 'Catatan/Bukti Fisik']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      columnStyles: { 
        0: { cellWidth: 10 }, 
        2: { cellWidth: 15, halign: 'center' }, 
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 40 }
      },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10, cellPadding: 2 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

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
