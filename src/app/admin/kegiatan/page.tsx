"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function KelolaKegiatan() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'MONEV' | 'EVALUASI'>('MONEV');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [form, setForm] = useState({
    nama_kegiatan: '',
    deskripsi: '',
    tahun: new Date().getFullYear().toString(),
    kategori_program: 'MONEV',
  });

  const router = useRouter();

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const fetchKegiatan = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setKegiatans(data);
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('kegiatan')
      .insert([form])
      .select();
      
    if (!error && data && data.length > 0) {
      setIsModalOpen(false);
      setForm({ nama_kegiatan: '', deskripsi: '', tahun: new Date().getFullYear().toString(), kategori_program: 'MONEV' });
      
      // Langsung arahkan ke halaman form builder
      router.push(`/admin/instrumen/builder?kegiatan_id=${data[0].id}`);
    } else {
      console.error(error);
      alert('Gagal membuat kegiatan: ' + (error?.message || 'Error tidak diketahui'));
    }
  };

  // MPLS Lama (Hardcoded legacy)
  const mplsLama: Kegiatan = {
    id: 'mpls-lama',
    nama_kegiatan: 'Masa Pengenalan Lingkungan Sekolah (MPLS)',
    deskripsi: 'Instrumen monitoring dan evaluasi MPLS bagi Sekolah Dasar dan SMP.',
    status: 'aktif',
    kategori_program: 'MONEV',
    tahun: '2026',
    created_at: new Date().toISOString()
  };

  // 1. Gabungkan MPLS lama dengan data dari database
  const allData = [mplsLama, ...kegiatans];

  // 2. Filter berdasarkan Tab (MONEV vs EVALUASI KEGIATAN BGTK)
  const tabFilteredData = allData.filter(k => {
    // MONEV = MONEV atau null/empty
    const isMonev = k.kategori_program === 'MONEV' || !k.kategori_program;
    
    if (activeTab === 'MONEV') return isMonev;
    if (activeTab === 'EVALUASI') return !isMonev && k.kategori_program !== 'TEMPLATE_EVALUASI'; // PKG, EVALUASI_PANITIA, dll.
    return true;
  });

  // 3. Filter berdasarkan Pencarian
  const finalData = tabFilteredData.filter(k => 
    k.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (k.deskripsi && k.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & Tombol Buat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Dasbor Kegiatan</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Kelola dan pantau seluruh instrumen aplikasi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ background: '#1d4ed8', border: 'none', boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.4)' }}>
          + Tambah Kegiatan Baru
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('MONEV')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'MONEV' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'MONEV' ? '#1e40af' : '#6b7280',
            fontWeight: activeTab === 'MONEV' ? 'bold' : 'normal',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          MONEV BGTK
        </button>
        <button
          onClick={() => setActiveTab('EVALUASI')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'EVALUASI' ? '3px solid #8b5cf6' : '3px solid transparent',
            color: activeTab === 'EVALUASI' ? '#6d28d9' : '#6b7280',
            fontWeight: activeTab === 'EVALUASI' ? 'bold' : 'normal',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Evaluasi Kegiatan BGTK
        </button>
      </div>

      {/* TOOLBAR: SEARCH */}
      <div style={{ marginBottom: '1.5rem', display: 'flex' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Cari nama atau deskripsi kegiatan..."
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', borderRadius: '99px' }}
          />
        </div>
      </div>

      {/* TABLE VIEW */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Memuat data kegiatan...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#374151', width: '50px' }}>No</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Informasi Kegiatan</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#374151', width: '100px' }}>Tahun</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#374151', width: '150px' }}>Kategori</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#374151', width: '100px' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#374151', textAlign: 'center', width: '220px' }}>Aksi / Pintasan</th>
                </tr>
              </thead>
              <tbody>
                {finalData.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                      Tidak ada data kegiatan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  finalData.map((k, idx) => (
                    <tr key={k.id} style={{ borderBottom: '1px solid #e5e7eb', background: 'white', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{idx + 1}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{k.nama_kegiatan}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>{k.deskripsi || '-'}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>{k.tahun}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: (k.kategori_program && k.kategori_program !== 'MONEV') ? '#ffedd5' : '#dbeafe', 
                          color: (k.kategori_program && k.kategori_program !== 'MONEV') ? '#c2410c' : '#1d4ed8', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}>
                          {(k.kategori_program && k.kategori_program !== 'MONEV') ? 'Evaluasi Kegiatan BGTK' : 'Monev BGTK'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: k.status === 'aktif' ? '#dcfce7' : '#f3f4f6', 
                          color: k.status === 'aktif' ? '#15803d' : '#4b5563', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '99px',
                          fontWeight: 'bold'
                        }}>
                          {k.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        
                        {/* Tombol Kelola Instrumen dihapus sesuai permintaan UX */}
                        {/* Tombol Dasbor */}
                        <button 
                          title="Lihat Dasbor Analitik"
                          onClick={() => router.push(`/dashboard/${k.id}`)}
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#1d4ed8' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                        </button>
                        
                        {/* Tombol Excel */}
                        {k.id !== 'mpls-lama' && (
                          <button 
                            title="Unduh Laporan Excel"
                            onClick={() => {
                              alert('Mempersiapkan unduhan Excel... Tunggu sebentar ya!');
                              window.location.href = `/api/admin/export-excel?kegiatan_id=${k.id}&t=${Date.now()}`;
                            }}
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#15803d' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                          </button>
                        )}

                        {/* Tombol Tautan Publik (Hanya PKG/Evaluasi Publik) */}
                        {k.kategori_program === 'PKG' && (
                          <button 
                            title="Salin Tautan Publik"
                            onClick={() => {
                              const url = `${window.location.origin}/isi-form/public/${k.id}`;
                              navigator.clipboard.writeText(url);
                              alert('Tautan publik form berhasil disalin!\n' + url);
                            }}
                            style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#7e22ce' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          </button>
                        )}
                        
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL BUAT KEGIATAN */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(2px)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Buat Kegiatan Baru</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nama Kegiatan</label>
                <input required type="text" className="form-control" value={form.nama_kegiatan} onChange={e => setForm({...form, nama_kegiatan: e.target.value})} placeholder="Contoh: Monev Matgem 2026" />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deskripsi (Opsional)</label>
                <textarea rows={3} className="form-control" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} placeholder="Penjelasan singkat tentang kegiatan..." />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tahun Pelaksanaan</label>
                <input required type="number" className="form-control" value={form.tahun} onChange={e => setForm({...form, tahun: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kategori Program</label>
                <select 
                  required 
                  className="form-control"
                  value={form.kategori_program} 
                  onChange={e => setForm({...form, kategori_program: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="MONEV">Program Monev BGTK</option>
                  <option value="EVALUASI_PANITIA">Program Evaluasi Kegiatan BGTK</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Kegiatan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
