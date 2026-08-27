"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';

export default function CekHasilPanitia() {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchKegiatanPanitia();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    setSearchQuery(k.nama_kegiatan);
    setPinInput('');
    setPinError('');
    setIsVerified(false);
    setIsDropdownOpen(false);
    
    setTimeout(() => {
      document.getElementById('password-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      passInputRef.current?.focus();
    }, 150);
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

  const handleToggleStatus = async () => {
    if (!selectedKegiatan) return;
    const newStatus = selectedKegiatan.status === 'aktif' ? 'ditutup' : 'aktif';
    const confirmMsg = newStatus === 'ditutup' 
      ? 'Apakah Anda yakin ingin MENUTUP form ini? Peserta tidak akan bisa lagi mengisi form.' 
      : 'Apakah Anda yakin ingin MEMBUKA KEMBALI form ini?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from('kegiatan')
        .update({ status: newStatus })
        .eq('id', selectedKegiatan.id);
        
      if (error) throw error;
      setSelectedKegiatan({ ...selectedKegiatan, status: newStatus });
      alert(`Status form berhasil diubah menjadi: ${newStatus.toUpperCase()}`);
      
      // Update in the list as well
      setDaftarKegiatan(prev => prev.map(k => k.id === selectedKegiatan.id ? { ...k, status: newStatus } : k));
    } catch (err: any) {
      alert("Gagal mengubah status: " + err.message);
    }
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
        <div className="card" style={{ padding: '1.5rem', flex: 1, position: 'relative' }} ref={dropdownRef}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Pilih Kegiatan Anda</h2>
          
          <input 
            type="text" 
            placeholder="🔍 Cari nama kegiatan evaluasi..."
            className="form-control"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onClick={() => setIsDropdownOpen(true)}
            style={{ marginBottom: '1rem' }}
          />

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '110px',
              left: '1.5rem',
              right: '1.5rem',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 50,
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Memuat daftar kegiatan...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
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
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: 'none',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = selectedKegiatan?.id === kegiatan.id ? '#fef3c7' : '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = selectedKegiatan?.id === kegiatan.id ? '#fef3c7' : 'white'}
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
          )}
        </div>

        {/* Kolom Kanan / Bawah: Verifikasi PIN & Unduh */}
        {selectedKegiatan && (
          <div id="password-section" className="card animate-fade-in" style={{ padding: '1.5rem', flex: 1, borderTop: '4px solid #f59e0b' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Akses Data:</h2>
            <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>{selectedKegiatan.nama_kegiatan}</p>

            {!isVerified ? (
              <form onSubmit={handleVerifyPIN}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#92400e' }}>Masukkan PIN Rahasia</label>
                  <input 
                    type="password" 
                    required
                    ref={passInputRef}
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
                
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <a 
                    href={`/api/admin/export-excel?kegiatan_id=${selectedKegiatan.id}`}
                    className="btn btn-outline" 
                    target="_blank"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Unduh Rekapitulasi (Excel)
                  </a>

                  <a 
                    href={`/portal-panitia/hasil/${selectedKegiatan.id}?pin=${pinInput}`}
                    className="btn btn-primary" 
                    target="_blank"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Lihat Laporan Analisis (PDF)
                  </a>

                  <button 
                    onClick={handleToggleStatus}
                    className="btn btn-outline"
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.5rem',
                      background: selectedKegiatan.status === 'aktif' ? '#fee2e2' : '#d1fae5',
                      borderColor: selectedKegiatan.status === 'aktif' ? '#ef4444' : '#10b981',
                      color: selectedKegiatan.status === 'aktif' ? '#dc2626' : '#059669',
                      marginTop: '0.5rem'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                    {selectedKegiatan.status === 'aktif' ? 'Tutup Akses Form (Non-aktifkan)' : 'Buka Kembali Form (Aktifkan)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
