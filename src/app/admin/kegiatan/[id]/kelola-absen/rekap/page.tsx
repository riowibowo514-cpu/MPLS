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
  const [ketua, setKetua] = useState({ nama: 'Arman, S. Pd., MM', nip: '197006301998031006' });

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
    const nama = window.prompt("Masukkan Nama Ketua Pelaksana:", ketua.nama);
    if (nama === null) return;
    
    const nip = window.prompt("Masukkan NIP Ketua Pelaksana:", ketua.nip);
    if (nip === null) return;

    setKetua({ nama, nip });
    setTimeout(() => {
      window.print();
    }, 300);
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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
          .no-print { display: none !important; }
          .card { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; }
          
          /* Letterhead */
          .letterhead { display: flex !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .letterhead h2 { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .divider { border-bottom: 1pt solid black; margin-top: 2mm; margin-bottom: 4mm; }
          
          .print-title { text-align: center; font-weight: bold; font-size: 12pt; text-decoration: underline; margin-bottom: 4mm; }
          
          .print-meta { width: 100%; margin-bottom: 6mm; border-collapse: collapse; font-size: 11pt; }
          .print-meta td { padding: 1mm; vertical-align: top; }
          .print-meta td:first-child { width: 40mm; }
          
          .print-table { width: 170mm; border-collapse: collapse; font-size: 10pt; margin-bottom: 0; }
          .print-table th, .print-table td { border: 1pt solid black; padding: 2mm; vertical-align: middle; }
          .print-table tr { min-height: 9mm; }
          
          .print-table th { background-color: #BDE3F0 !important; -webkit-print-color-adjust: exact; font-weight: bold; text-align: center; }
          .print-table .row-sesi { background-color: #F2A45E !important; -webkit-print-color-adjust: exact; font-weight: bold; text-align: center; }
          
          .col-no { width: 12mm; text-align: center; }
          .col-nama { width: 45mm; }
          .col-instansi { width: 48mm; }
          .col-kab { width: 35mm; }
          .col-ttd { width: 15mm; }
          
          .print-table .ttd-cell { position: relative; height: 10mm; padding: 0; }
          .print-table .ttd-num { font-size: 10pt; position: absolute; top: 1mm; left: 1mm; }
          .print-table .ttd-img { max-height: 9mm; max-width: 14mm; position: absolute; top: 1mm; left: 4mm; filter: contrast(1.5); }
          .print-only { display: block !important; }
          
          .page-break { page-break-before: always; }
          
          @page { size: A4 portrait; margin: 20mm; }
        }
        .print-only { display: none; }
        .letterhead { display: none; }
        .divider { display: none; }
      `}} />

      <main className="container" style={{ padding: '2rem 1rem' }}>
        {/* Kontrol Web (Tidak Dicetak) */}
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
          
          {/* ==================================================== */}
          {/* TAMPILAN WEB SAJA */}
          {/* ==================================================== */}
          <div className="no-print">
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
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '5%' }}>NO</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', width: '25%' }}>NAMA LENGKAP</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', width: '20%' }}>INSTANSI</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', width: '15%' }}>KAB/KOTA</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', width: '15%' }}>WAKTU & STATUS</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '20%' }} colSpan={2}>TANDA TANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  {absensiList.map((absen, idx) => {
                    const dateWib = new Date(new Date(absen.waktu_absen).getTime() + 7 * 60 * 60 * 1000);
                    const timeStr = `${dateWib.getUTCHours().toString().padStart(2, '0')}:${dateWib.getUTCMinutes().toString().padStart(2, '0')}`;
                    return (
                      <tr key={absen.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{absen.nama_snapshot}</td>
                        <td style={{ padding: '0.75rem', color: '#64748b' }}>{absen.peserta?.instansi_asal || '-'}</td>
                        <td style={{ padding: '0.75rem', color: '#64748b' }}>{absen.peserta?.kab_kota || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div>{timeStr} WIB</div>
                          <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', background: absen.status_kehadiran === 'Tepat Waktu' ? '#dcfce7' : '#fee2e2', color: absen.status_kehadiran === 'Tepat Waktu' ? '#166534' : '#991b1b' }}>
                            {absen.status_kehadiran}
                            {absen.menit_keterlambatan > 0 && ` (+${absen.menit_keterlambatan}m)`}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }} colSpan={2}>
                          <img src={absen.ttd_digital} alt="TTD" style={{ maxHeight: '40px', maxWidth: '80px', filter: 'contrast(1.5)' }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ==================================================== */}
          {/* TAMPILAN PRINT PDF (JSON SPECIFIC) */}
          {/* ==================================================== */}
          <div className="print-only">
            {(() => {
              if (absensiList.length === 0) return <p>Tidak ada data.</p>;

              const FIRST_PAGE_ROWS = 13;
              const NEXT_PAGE_ROWS = 17;
              
              const pages = [];
              let currentIdx = 0;
              
              if (absensiList.length > 0) {
                pages.push(absensiList.slice(currentIdx, currentIdx + FIRST_PAGE_ROWS));
                currentIdx += FIRST_PAGE_ROWS;
              }
              while (currentIdx < absensiList.length) {
                pages.push(absensiList.slice(currentIdx, currentIdx + NEXT_PAGE_ROWS));
                currentIdx += NEXT_PAGE_ROWS;
              }

              return pages.map((pageRows, pageIdx) => {
                const isFirstPage = pageIdx === 0;
                let startNo = isFirstPage ? 1 : FIRST_PAGE_ROWS + (pageIdx - 1) * NEXT_PAGE_ROWS + 1;

                return (
                  <div key={pageIdx} className={isFirstPage ? '' : 'page-break'} style={{ width: '170mm', margin: '0 auto' }}>
                    
                    {isFirstPage && (
                      <>
                        <div className="letterhead" style={{ display: 'flex', alignItems: 'center', marginBottom: '4mm' }}>
                          {/* Logo Kiri (Tut Wuri + Teks) */}
                          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '2mm' }}>
                            <img src="/tut-wuri.svg" alt="Tut Wuri Handayani" style={{ height: '18mm', objectFit: 'contain' }} />
                            <div style={{ fontSize: '19pt', fontWeight: '900', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '-0.5px' }}>
                              <span style={{ color: '#0077c0' }}>Kemen</span><span style={{ color: '#f4a41d' }}>dikdasmen</span>
                            </div>
                          </div>
                          
                          {/* Garis Vertikal Pemisah */}
                          <div style={{ borderLeft: '1.5mm solid #0077c0', height: '18mm', margin: '0 5mm' }}></div>
                          <div className="letterhead-text" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1mm' }}>
                            <h2 style={{ color: '#0077c0', margin: 0, fontSize: '15pt', fontWeight: 'bold' }}>Kementerian Pendidikan Dasar dan Menengah</h2>
                            <h3 style={{ color: '#333', margin: 0, fontSize: '10pt', fontWeight: 'bold' }}>Balai Guru dan Tenaga Kependidikan Provinsi Sumatera Barat</h3>
                            <p style={{ color: '#555', margin: 0, fontSize: '9pt' }}>Jalan Dewi Sartika, Rawang, Pariaman, 25511</p>
                            <div style={{ color: '#555', fontSize: '9pt', display: 'flex', alignItems: 'center', gap: '2mm' }}>
                              <span style={{ fontSize: '10pt' }}>🌐</span> www.kemendikdasmen.go.id
                            </div>
                            <div style={{ color: '#555', fontSize: '9pt', display: 'flex', alignItems: 'center', gap: '4mm' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                <span style={{ fontSize: '10pt' }}>📱</span> 081364642333
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                <span style={{ fontSize: '10pt' }}>🎧</span> 177
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="divider"></div>

                        <div className="print-title">DAFTAR HADIR PESERTA</div>

                        <table className="print-meta">
                          <tbody>
                            <tr>
                              <td>Nama Kegiatan</td>
                              <td>: {sesi.kegiatan.nama_kegiatan}</td>
                            </tr>
                            <tr>
                              <td>Hari/Tanggal</td>
                              <td>: {sesi.tanggal}</td>
                            </tr>
                            <tr>
                              <td>Lokasi Kegiatan</td>
                              <td>: {sesi.nama_sesi}</td>
                            </tr>
                          </tbody>
                        </table>
                      </>
                    )}

                    <table className="print-table">
                      <thead>
                        <tr>
                          <th className="col-no">NO</th>
                          <th className="col-nama">NAMA LENGKAP</th>
                          <th className="col-instansi">INSTANSI</th>
                          <th className="col-kab">KAB/KOTA</th>
                          <th className="col-ttd" colSpan={2}>TANDA TANGAN</th>
                        </tr>
                        {isFirstPage && (
                          <tr>
                            <td colSpan={6} className="row-sesi">{sesi.nama_sesi}</td>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {pageRows.map((absen, rowIdx) => {
                          const currentNo = startNo + rowIdx;
                          const isOdd = currentNo % 2 !== 0;

                          return (
                            <tr key={absen.id}>
                              <td className="col-no">{currentNo}</td>
                              <td className="col-nama">{absen.nama_snapshot}</td>
                              <td className="col-instansi">{absen.peserta?.instansi_asal || '-'}</td>
                              <td className="col-kab">{absen.peserta?.kab_kota || '-'}</td>
                              
                              {isOdd ? (
                                <>
                                  <td className="col-ttd ttd-cell">
                                    <span className="ttd-num">{currentNo}</span>
                                    {absen.ttd_digital && <img className="ttd-img" src={absen.ttd_digital} alt="TTD" />}
                                  </td>
                                  <td className="col-ttd ttd-cell"></td>
                                </>
                              ) : (
                                <>
                                  <td className="col-ttd ttd-cell"></td>
                                  <td className="col-ttd ttd-cell">
                                    <span className="ttd-num">{currentNo}</span>
                                    {absen.ttd_digital && <img className="ttd-img" src={absen.ttd_digital} alt="TTD" />}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {pageIdx === pages.length - 1 && (
                      <div style={{ marginTop: '8mm', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ textAlign: 'left', width: '60mm' }}>
                          <p style={{ margin: '0 0 5mm 0' }}>Padang, {sesi.tanggal}</p>
                          <p style={{ margin: '0 0 20mm 0' }}>Ketua Pelaksana,</p>
                          <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline' }}>{ketua.nama}</p>
                          <p style={{ margin: 0 }}>NIP {ketua.nip}</p>
                        </div>
                      </div>
                    )}

                  </div>
                );
              });
            })()}
          </div>

        </div>
      </main>
    </>
  );
}
