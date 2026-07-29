"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function KelolaKegiatan() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    nama_kegiatan: '',
    deskripsi: '',
    tahun: new Date().getFullYear().toString(),
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
    const { error } = await supabase
      .from('kegiatan')
      .insert([form]);
      
    if (!error) {
      setIsModalOpen(false);
      setForm({ nama_kegiatan: '', deskripsi: '', tahun: new Date().getFullYear().toString() });
      fetchKegiatan();
    } else {
      alert('Gagal membuat kegiatan');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Kelola Kegiatan Monev</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Tambah Kegiatan Baru
        </button>
      </div>

      {isLoading ? (
        <p>Memuat data...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {/* Card untuk MPLS Lama (Read Only Placeholder) */}
          <div className="card" style={{ border: '2px dashed var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0 }}>MPLS (Sistem Lama)</h3>
              <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>Read Only</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Data monev MPLS lama yang tidak dapat diedit strukturnya.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => router.push('/dashboard?kegiatan=mpls_lama')}>Lihat Dashboard</button>
            </div>
          </div>

          {/* Render Kegiatan Dinamis */}
          {kegiatans.map(k => (
            <div key={k.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{k.nama_kegiatan}</h3>
                <span style={{ fontSize: '0.75rem', background: k.status === 'aktif' ? '#10b981' : 'var(--text-secondary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>
                  {k.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {k.deskripsi} ({k.tahun})
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => router.push(`/admin/instrumen/builder?kegiatan_id=${k.id}`)}
                >
                  Kelola Instrumen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Buat Kegiatan Baru</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nama Kegiatan</label>
                <input required type="text" value={form.nama_kegiatan} onChange={e => setForm({...form, nama_kegiatan: e.target.value})} placeholder="Contoh: Monev Matgem 2026" />
              </div>
              <div className="form-group">
                <label>Deskripsi (Opsional)</label>
                <textarea rows={3} value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} placeholder="Penjelasan singkat tentang kegiatan..." />
              </div>
              <div className="form-group">
                <label>Tahun Pelaksanaan</label>
                <input required type="number" value={form.tahun} onChange={e => setForm({...form, tahun: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
