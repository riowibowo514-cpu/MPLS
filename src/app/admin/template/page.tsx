"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function KelolaTemplate() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    nama_kegiatan: '',
    deskripsi: '',
    tahun: new Date().getFullYear().toString(),
    kategori_program: 'TEMPLATE_EVALUASI',
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
      
    if (!error) {
      setIsModalOpen(false);
      setForm({ nama_kegiatan: '', deskripsi: '', tahun: new Date().getFullYear().toString(), kategori_program: 'TEMPLATE_EVALUASI' });
      
      // Auto-generate PKG Instrument if category is PKG
      if (form.kategori_program === 'PKG' && data && data[0]) {
        try {
          await fetch('/api/admin/generate-pkg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kegiatan_id: data[0].id })
          });
        } catch (err) {
          console.error("Gagal auto-generate PKG", err);
        }
      }

      fetchKegiatan();
    } else {
      alert('Gagal membuat kegiatan');
    }
  };

  const templateData = kegiatans.filter(k => k.kategori_program === 'TEMPLATE_EVALUASI' || k.kategori_program === 'TEMPLATE_MONEV');

  // 3. Filter berdasarkan Pencarian
  const finalData = templateData.filter(k => 
    k.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (k.deskripsi && k.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & Tombol Buat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Master Template Instrumen</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Kelola template master untuk form PKG dan Daring</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ background: '#1d4ed8', border: 'none', boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.4)' }}>
          + Tambah Template Baru
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
                          background: k.kategori_program === 'TEMPLATE_EVALUASI' ? '#ffedd5' : '#dbeafe', 
                          color: k.kategori_program === 'TEMPLATE_EVALUASI' ? '#c2410c' : '#1d4ed8', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}>
                          {k.kategori_program === 'TEMPLATE_EVALUASI' ? 'Evaluasi Kegiatan BGTK' : 'Monev BGTK'}
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
                        
                        {/* Tombol Kelola Instrumen */}
                        {k.id !== 'mpls-lama' && (
                          <button 
                            title="Edit Template (Builder)"
                            onClick={() => router.push(`/admin/instrumen/builder?kegiatan_id=${k.id}`)}
                            style={{ background: 'white', border: '1px solid #d1d5db', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#4b5563' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                        )}
                        
                        {/* Tombol Preview Instrumen */}
                        <button 
                          title="Preview Template"
                          onClick={() => window.open(`/kegiatan/${k.id}/isi-form`, '_blank')}
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#1d4ed8' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        
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
                  <option value="TEMPLATE_MONEV">Program Monev BGTK</option>
                  <option value="TEMPLATE_EVALUASI">Program Evaluasi Kegiatan BGTK</option>
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
