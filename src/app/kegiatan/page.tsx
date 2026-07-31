"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DaftarKegiatanPetugas() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
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
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          
          {/* Render Kegiatan Dinamis */}
          {kegiatans.map(k => (
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
        </div>
      )}
    </div>
  );
}
