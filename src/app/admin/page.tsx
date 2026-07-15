"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MonevEntryData } from '@/lib/supabase';
import { generateExcelSummary, generatePDFSummary } from '@/lib/exportGenerator';

export default function Home() {
  const [entries, setEntries] = useState<MonevEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/monev')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setEntries(data.data || []);
      })
      .catch(err => {
        console.error(err);
        setError('Gagal memuat data riwayat monev.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getBadgeClass = (status: string) => {
    if (status === 'SANGAT RAMAH') return 'badge-sangat-ramah';
    if (status === 'CUKUP RAMAH') return 'badge-cukup-ramah';
    if (status === 'KURANG') return 'badge-kurang';
    return 'badge-default';
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const res = await fetch('/api/monev?all=true');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const allEntries = data.data || [];
      if (allEntries.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
      }

      if (type === 'excel') {
        generateExcelSummary(allEntries);
      } else {
        generatePDFSummary(allEntries);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh rekap data');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      window.location.href = '/';
    }
  };

  return (
    <main className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Riwayat Monev
            <button className="btn btn-outline" onClick={handleLogout} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              Logout Admin
            </button>
          </h1>
          <p>Daftar seluruh hasil pemantauan MPLS Ramah 2026</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => handleExport('excel')}
            disabled={exporting || loading || entries.length === 0}
            style={{ backgroundColor: '#fff' }}
          >
            {exporting ? 'Memproses...' : 'Unduh Rekap Excel'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleExport('pdf')}
            disabled={exporting || loading || entries.length === 0}
          >
            {exporting ? 'Memproses...' : 'Unduh Rekap PDF'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Memuat data...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', marginBottom: '1rem', display: 'inline-block' }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          <h3>Belum ada data monev</h3>
          <p>Jadilah yang pertama untuk mengisi instrumen monev MPLS ini.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Isi Monev Sekarang
          </Link>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="history-list">
          {entries.map((entry) => (
            <Link href={`/${entry.id}`} key={entry.id} className="history-item">
              <div className="history-item-content">
                <h3>{entry.namaSekolah}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {entry.jenjang} &bull; Oleh: {entry.namaPetugas} &bull; {entry.tanggal}
                </p>
              </div>
              <div>
                <span className={`badge ${getBadgeClass(entry.statusFinal)}`}>
                  {entry.statusFinal}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
