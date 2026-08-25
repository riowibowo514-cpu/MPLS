"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';

export default function CekHasilPanitia() {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchKegiatanPanitia();
  }, []);

  const fetchKegiatanPanitia = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('kategori_program', 'EVALUASI_PANITIA')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setKegiatanList(data as Kegiatan[]);
    }
    setIsLoading(false);
  };

  const filteredKegiatan = kegiatanList.filter(k => 
    k.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectKegiatan = (k: Kegiatan) => {
    setSelectedKegiatan(k);
    setPinInput('');
    setPinError('');
    setIsVerified(false);
  };

  const handleVerifyPIN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKegiatan) return;

    setIsVerifying(true);
    setPinError('');

    // Verifikasi PIN dengan mengambil record dari database
    const { data, error } = await supabase
      .from('kegiatan')
      .select('pin_akses')
      .eq('id', selectedKegiatan.id)
      .single();

    if (error || !data) {
      setPinError('Terjadi kesalahan jaringan.');
      setIsVerifying(false);
      return;
    }

    if (data.pin_akses === pinInput) {
      setIsVerified(true);
    } else {
      setPinError('PIN Rahasia yang Anda masukkan salah.');
    }
    
    setIsVerifying(false);
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/portal-panitia" style={{ color: 'var(--text-secondary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Unduh Hasil Evaluasi</h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        
        {/* Kolom Kiri / Atas: Daftar Kegiatan */}
        <div className="card" style={{ padding: '1.5rem', flex: 1 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Pilih Kegiatan Anda</h2>
          
          <input 
            type="text" 
            placeholder="🔍 Cari nama kegiatan evaluasi..."
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Memuat daftar kegiatan...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {filteredKegiatan.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>Tidak ada kegiatan evaluasi panitia yang ditemukan.</p>
              ) : (
                filteredKegiatan.map(kegiatan => (
                  <button
                    key={kegiatan.id}
                    onClick={() => handleSelectKegiatan(kegiatan)}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      background: selectedKegiatan?.id === kegiatan.id ? '#fef3c7' : 'white',
                      border: `1px solid ${selectedKegiatan?.id === kegiatan.id ? '#f59e0b' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>{kegiatan.nama_kegiatan}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Dibuat: {new Date(kegiatan.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Kolom Kanan / Bawah: Verifikasi PIN & Unduh */}
        {selectedKegiatan && (
          <div className="card" style={{ padding: '1.5rem', flex: 1, borderTop: '4px solid #f59e0b' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Akses Data:</h2>
            <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>{selectedKegiatan.nama_kegiatan}</p>

            {!isVerified ? (
              <form onSubmit={handleVerifyPIN}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#92400e' }}>Masukkan PIN Rahasia</label>
                  <input 
                    type="password" 
                    required
                    className="form-control"
                    placeholder="Ketik PIN yang Anda buat..."
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    style={{ border: '2px solid #fbbf24' }}
                  />
                </div>
                {pinError && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 'bold' }}>{pinError}</p>
                )}
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b' }}
                  disabled={isVerifying || !pinInput}
                >
                  {isVerifying ? 'Memverifikasi...' : 'Buka Brankas Data'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ width: '48px', height: '48px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Akses Diberikan</h3>
                <p style={{ color: '#047857', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Anda berhak melihat dan mengunduh data responden untuk kegiatan ini.</p>
                
                <a 
                  href={`/api/admin/export-excel?kegiatan_id=${selectedKegiatan.id}`}
                  className="btn btn-primary" 
                  target="_blank"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Unduh Rekapitulasi (Excel)
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
