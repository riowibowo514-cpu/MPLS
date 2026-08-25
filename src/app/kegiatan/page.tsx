"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DaftarKegiatanPetugas() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const fetchKegiatan = async () => {
    setIsLoading(true);
    // Hanya ambil kegiatan yang berstatus aktif
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('status', 'aktif')
      .eq('kategori_program', 'MONEV') // Sembunyikan PKG
      .order('created_at', { ascending: false });
      
    if (data) setKegiatans(data);
    setIsLoading(false);
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Pilih Kegiatan Monev</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Silakan pilih instrumen kegiatan yang akan Anda isi.
        </p>
      </div>

      {isLoading ? (
        <p>Memuat data...</p>
      ) : (
        <>
          <div style={{ marginBottom: '2rem', maxWidth: '600px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Cari nama instrumen MONEV..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  outline: 'none',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              />
              <svg 
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            
            {/* Card untuk MPLS Lama */}
            {'Masa Pengenalan Lingkungan Sekolah (MPLS)'.toLowerCase().includes(searchQuery.toLowerCase()) && (
              <div className="card" style={{ borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0 }}>Masa Pengenalan Lingkungan Sekolah (MPLS)</h3>
                  <span style={{ fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>AKTIF</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                  Instrumen monitoring dan evaluasi Masa Pengenalan Lingkungan Sekolah.
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => router.push('/isi-form')}
                >
                  Mulai Mengisi
                </button>
              </div>
            )}

            {/* Render Kegiatan Dinamis */}
            {kegiatans
              .filter(k => k.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(k => (
              <div key={k.id} className="card" style={{ borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0 }}>{k.nama_kegiatan}</h3>
                  <span style={{ fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>AKTIF</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                  {k.deskripsi || 'Tidak ada deskripsi.'}
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => router.push(`/kegiatan/${k.id}/isi-form`)}
                >
                  Mulai Mengisi
                </button>
              </div>
            ))}
            
            {/* Pesan jika tidak ada hasil pencarian */}
            {!('Masa Pengenalan Lingkungan Sekolah (MPLS)'.toLowerCase().includes(searchQuery.toLowerCase())) && 
             kegiatans.filter(k => k.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Instrumen tidak ditemukan.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
