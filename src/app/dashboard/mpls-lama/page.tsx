"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MonevEntryData } from '@/lib/supabase';
import { generateExcelSummary, generatePDFSummary } from '@/lib/exportGenerator';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Home() {
  const [entries, setEntries] = useState<MonevEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/monev?all=true')
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
      if (entries.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
      }
      if (type === 'excel') {
        generateExcelSummary(entries);
      } else {
        generatePDFSummary(entries);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh rekap data');
    } finally {
      setExporting(false);
    }
  };

  // Kalkulasi Statistik
  const statusCounts = entries.reduce((acc, entry) => {
    acc[entry.statusFinal] = (acc[entry.statusFinal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jenjangCounts = entries.reduce((acc, entry) => {
    acc[entry.jenjang] = (acc[entry.jenjang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: ['Sangat Ramah', 'Cukup Ramah', 'Kurang'],
    datasets: [{
      data: [
        statusCounts['SANGAT RAMAH'] || 0, 
        statusCounts['CUKUP RAMAH'] || 0, 
        statusCounts['KURANG'] || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: ['TK', 'SD', 'SMP', 'SMA/K', 'SLB'],
    datasets: [{
      label: 'Jumlah Sekolah',
      data: [
        jenjangCounts['TK'] || 0,
        jenjangCounts['SD'] || 0,
        jenjangCounts['SMP'] || 0,
        jenjangCounts['SMA/K'] || 0,
        jenjangCounts['SLB'] || 0
      ],
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  };

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Riwayat Monev MPLS 2026
          </h1>
          <p>Dashboard analitik dan daftar seluruh hasil pemantauan.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => handleExport('excel')}
            disabled={exporting || loading || entries.length === 0}
            style={{ backgroundColor: '#fff' }}
          >
            {exporting ? 'Memproses...' : 'Unduh Excel'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleExport('pdf')}
            disabled={exporting || loading || entries.length === 0}
          >
            {exporting ? 'Memproses...' : 'Unduh PDF'}
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
          <h3>Belum ada data monev</h3>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ marginBottom: '1rem' }}>Persentase Status</h3>
              <div style={{ width: '100%', maxWidth: '250px' }}>
                <Pie data={pieData} />
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Sebaran Jenjang</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '1rem' }}>Data Terbaru</h3>
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
        </>
      )}
    </main>
  );
}
