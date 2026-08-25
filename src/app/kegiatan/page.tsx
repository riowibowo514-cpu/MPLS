"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DaftarKegiatanPetugas() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchKegiatan();
    
    // Klik di luar dropdown untuk menutupnya
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchKegiatan = async () => {
    setIsLoading(true);
    
    // Ambil kegiatan dinamis dari database
    const { data } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('status', 'aktif')
      .eq('kategori_program', 'MONEV')
      .order('created_at', { ascending: false });
      
    // Siapkan MPLS Lama sebagai opsi default terdepan
    const mplsLama: Kegiatan = {
      id: 'mpls-lama',
      nama_kegiatan: 'Masa Pengenalan Lingkungan Sekolah (MPLS)',
      deskripsi: 'Instrumen monitoring dan evaluasi Masa Pengenalan Lingkungan Sekolah.',
      status: 'aktif',
      kategori_program: 'MONEV',
      tahun: '2026',
      created_at: new Date().toISOString()
    };

    if (data) {
      setKegiatans([mplsLama, ...data]);
    } else {
      setKegiatans([mplsLama]);
    }
    setIsLoading(false);
  };

  const filteredKegiatans = kegiatans.filter(k => 
    k.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (k: Kegiatan) => {
    setSelectedKegiatan(k);
    setSearchQuery(k.nama_kegiatan);
    setIsDropdownOpen(false);
  };

  const handleMulai = () => {
    if (!selectedKegiatan) return;
    if (selectedKegiatan.id === 'mpls-lama') {
      router.push('/isi-form');
    } else {
      router.push(`/kegiatan/${selectedKegiatan.id}/isi-form`);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderTop: '4px solid #10b981' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Pilih Instrumen Monitoring</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Silakan ketik atau pilih kegiatan Monev yang akan Anda isi.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat data instrumen...</div>
        ) : (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Cari / Pilih Kegiatan:
            </label>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Ketik kata kunci (cth: mpls, matematika, bk)..." 
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (selectedKegiatan && e.target.value !== selectedKegiatan.nama_kegiatan) {
                    setSelectedKegiatan(null);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '8px',
                  border: '2px solid ' + (isDropdownOpen ? '#10b981' : '#e5e7eb'),
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: isDropdownOpen ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none'
                }}
              />
              <svg 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: isDropdownOpen ? '#10b981' : '#9ca3af', transition: 'color 0.2s' }}
                xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>

              {/* Panah bawah indikator dropdown */}
              <svg 
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', cursor: 'pointer' }}
                xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                maxHeight: '280px',
                overflowY: 'auto',
                zIndex: 50
              }}>
                {filteredKegiatans.length > 0 ? (
                  filteredKegiatans.map(k => (
                    <div 
                      key={k.id}
                      onClick={() => handleSelect(k)}
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        background: selectedKegiatan?.id === k.id ? '#ecfdf5' : 'white',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = selectedKegiatan?.id === k.id ? '#ecfdf5' : 'white')}
                    >
                      <div style={{ fontWeight: 'bold', color: selectedKegiatan?.id === k.id ? '#065f46' : '#111827' }}>{k.nama_kegiatan}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {k.deskripsi || 'Tidak ada deskripsi'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#6b7280' }}>
                    <svg style={{ margin: '0 auto 0.5rem auto', color: '#d1d5db' }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Instrumen tidak ditemukan.
                  </div>
                )}
              </div>
            )}

            {/* Detail Instrumen Terpilih */}
            {selectedKegiatan && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <svg style={{ color: '#10b981', marginRight: '0.5rem' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <h3 style={{ margin: 0, color: '#065f46', fontSize: '1.1rem' }}>Terpilih</h3>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>{selectedKegiatan.nama_kegiatan}</h4>
                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {selectedKegiatan.deskripsi || 'Tidak ada deskripsi tersedia untuk instrumen ini.'}
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', fontWeight: 'bold' }}
                  onClick={handleMulai}
                >
                  Mulai Mengisi Instrumen
                </button>
              </div>
            )}
            
            {!selectedKegiatan && !isDropdownOpen && (
              <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', padding: '2rem', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
                Silakan ketik atau klik pada kotak pencarian di atas untuk memunculkan daftar instrumen.
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
