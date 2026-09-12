"use client";

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RekapAbsensiPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const kegiatanId = params.id as string;
  const sesiId = searchParams.get('sesi_id');

  const [sesi, setSesi] = useState<any>(null);
  const [absensiList, setAbsensiList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (kegiatanId && sesiId) fetchData();
  }, [kegiatanId, sesiId]);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch Sesi info
    const { data: s } = await supabase.from('sesi_kegiatan').select('*, kegiatan(*)').eq('id', sesiId).single();
    if (s) setSesi(s);

    // Fetch Absensi with Participant info
    const { data: a } = await supabase
      .from('absensi')
      .select('*, peserta:daftar_peserta(*)')
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: true });
    
    if (a) setAbsensiList(a);

    setIsLoading(false);
  };

  const handleTutupSesi = async () => {
    if (!confirm('Anda yakin ingin MENUTUP sesi absensi ini? Peserta tidak akan bisa lagi scan QR code ini.')) return;
    
    const { error } = await supabase.from('sesi_kegiatan').update({ status: 'ditutup' }).eq('id', sesiId);
    if (error) {
      alert('Gagal menutup sesi: ' + error.message);
    } else {
      setSesi({ ...sesi, status: 'ditutup' });
    }
  };

  const printRekap = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      // We dynamically import xlsx to keep initial bundle size small
      const XLSX = await import('xlsx');
      
      const worksheetData = [
        ['No', 'Nama Lengkap', 'Instansi Asal', 'Waktu Hadir', 'Status', 'Tanda Tangan']
      ];

      absensiList.forEach((absen, idx) => {
        const dateWib = new Date(new Date(absen.waktu_absen).getTime() + 7 * 60 * 60 * 1000);
        const timeStr = `${dateWib.getUTCHours().toString().padStart(2, '0')}:${dateWib.getUTCMinutes().toString().padStart(2, '0')} WIB`;
        
        let statusStr = absen.status_kehadiran;
        if (absen.menit_keterlambatan > 0) statusStr += ` (+${absen.menit_keterlambatan}m)`;

        worksheetData.push([
          (idx + 1).toString(),
          absen.nama_snapshot,
          absen.peserta?.instansi_asal || '-',
          timeStr,
          statusStr,
          absen.ttd_digital ? 'Ditandatangani' : 'Kosong'
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Auto-size columns
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');
      
      const fileName = `Rekap_Absen_${sesi.nama_sesi.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      alert('Gagal mengekspor Excel.');
      console.error(err);
    }
  };

  if (isLoading) return <div className="container" style={{ padding: '4rem 1rem' }}>Memuat data rekap absensi...</div>;
  if (!sesi) return <div className="container" style={{ padding: '4rem 1rem' }}>Sesi tidak ditemukan.</div>;

  const totalHadir = absensiList.length;
  const totalTepatWaktu = absensiList.filter(a => a.status_kehadiran === 'Tepat Waktu').length;
  const totalTerlambat = totalHadir - totalTepatWaktu;

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href={`/admin/kegiatan/${kegiatanId}/kelola-absen`} className="btn btn-outline">← Kembali ke Kelola</Link>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Rekap Absensi</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {sesi.status === 'aktif' && (
            <button className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleTutupSesi}>
              Tutup Sesi (Kunci QR)
            </button>
          )}
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleExportExcel}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             Unduh Excel
          </button>
          <button className="btn btn-primary" onClick={printRekap}>Cetak PDF / Print</button>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Daftar Hadir Peserta</h2>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 500 }}>{sesi.kegiatan.nama_kegiatan}</h3>
          <p style={{ margin: 0, fontWeight: 600 }}>{sesi.nama_sesi} — {sesi.tanggal}</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Total Kehadiran</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>{totalHadir}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Tepat Waktu</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#10b981' }}>{totalTepatWaktu}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Terlambat</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>{totalTerlambat}</p>
          </div>
        </div>

        {absensiList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Belum ada peserta yang memindai QR code ini.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '5%' }}>No</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '30%' }}>Nama Lengkap</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '25%' }}>Instansi Asal</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '15%' }}>Waktu Hadir</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '15%' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', width: '10%' }}>Tanda Tangan</th>
              </tr>
            </thead>
            <tbody>
              {absensiList.map((absen, idx) => {
                const dateWib = new Date(new Date(absen.waktu_absen).getTime() + 7 * 60 * 60 * 1000);
                const timeStr = `${dateWib.getUTCHours().toString().padStart(2, '0')}:${dateWib.getUTCMinutes().toString().padStart(2, '0')}`;
                
                return (
                  <tr key={absen.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{idx + 1}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{absen.nama_snapshot}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{absen.peserta?.instansi_asal || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{timeStr} WIB</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        background: absen.status_kehadiran === 'Tepat Waktu' ? '#dcfce7' : '#fee2e2',
                        color: absen.status_kehadiran === 'Tepat Waktu' ? '#166534' : '#991b1b'
                      }}>
                        {absen.status_kehadiran}
                        {absen.menit_keterlambatan > 0 && ` (+${absen.menit_keterlambatan}m)`}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <img src={absen.ttd_digital} alt="TTD" style={{ maxHeight: '40px', maxWidth: '80px', filter: 'contrast(1.5)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="print-only" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end', paddingRight: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4rem 0' }}>Panitia Kegiatan,</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>____________________</p>
          </div>
        </div>

      </div>
    </main>
  );
}
