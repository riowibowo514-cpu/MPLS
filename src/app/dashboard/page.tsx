"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchKegiatan = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('kegiatan')
      .select('*')
      .neq('status', 'arsip') // FILTER SOFT DELETE
      .order('created_at', { ascending: false });
    
    if (data) setKegiatans(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const handleArchive = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin mengarsipkan kegiatan "${nama}"? Data tidak akan dihapus permanen, tetapi disembunyikan dari Dasbor.`)) {
      await supabase.from('kegiatan').update({ status: 'arsip' }).eq('id', id);
      fetchKegiatan();
    }
  };

  return (
    <main className="container animate-fade-in" style={{ padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Dashboard Pimpinan BGTK</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Silakan pilih kegiatan untuk melihat grafik analitik dan mengunduh rekapitulasi data.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center' }}>Memuat data kegiatan...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Card Khusus MPLS Lama */}
          <div className="card" style={{ borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>MPLS 2026 (Sistem Lama)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
              Dashboard analitik untuk program Masa Pengenalan Lingkungan Sekolah (data lama).
            </p>
            <Link href="/dashboard/mpls-lama" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Lihat Analitik
            </Link>
          </div>

          {/* Render Kegiatan Baru */}
          {kegiatans.map(k => (
            <div key={k.id} className="card" style={{ borderTop: '4px solid #3b82f6', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{k.nama_kegiatan}</h3>
                <span style={{ fontSize: '0.75rem', background: k.status === 'aktif' ? '#10b981' : 'gray', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {k.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                {k.deskripsi || 'Tidak ada deskripsi'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Link href={`/dashboard/${k.id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                  Lihat Analitik
                </Link>
                <button onClick={() => handleArchive(k.id, k.nama_kegiatan)} className="btn btn-outline" style={{ padding: '0.5rem', color: '#ef4444', borderColor: '#fca5a5' }} title="Arsipkan (Soft Delete)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}

        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/" className="btn btn-outline" style={{ border: 'none' }}>&larr; Kembali ke Portal</Link>
      </div>
    </main>
  );
}
