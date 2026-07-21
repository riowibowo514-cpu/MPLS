"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardCharts from '@/components/DashboardCharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/statistik')
      .then(res => res.json())
      .then(resData => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch(err => {
        console.error(err);
        setError('Gagal memuat data statistik.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
          Dashboard Monev MPLS Ramah 2026
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Pantauan interaktif hasil sampling instrumen Masa Pengenalan Lingkungan Sekolah (MPLS) Ramah Anak tingkat Provinsi Sumatera Barat.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Memuat data statistik...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)', textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
        </div>
      ) : data ? (
        <>
          {/* Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>Total Sampel Sekolah</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0' }}>
                {data.totalSampel}
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>sekolah telah dimonitor</p>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>Keterwakilan Daerah</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0' }}>
                {data.totalKabKota}
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kabupaten / Kota</p>
            </div>
          </div>

          {/* Charts Component */}
          <DashboardCharts 
            statusData={data.statusChartData} 
            jenjangData={data.jenjangChartData} 
          />

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/isi-form" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Isi Instrumen Baru
            </Link>
          </div>
        </>
      ) : null}
    </main>
  );
}
