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
      
    if (!error) {
      setIsModalOpen(false);
      setForm({ nama_kegiatan: '', deskripsi: '', tahun: new Date().getFullYear().toString(), kategori_program: 'MONEV' });
      
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
          {/* Card untuk MPLS Lama */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0 }}>Masa Pengenalan Lingkungan Sekolah (MPLS)</h3>
              <span style={{ fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>AKTIF</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
              Instrumen monitoring dan evaluasi MPLS bagi Sekolah Dasar dan SMP (2026).
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  disabled
                >
                  Kelola Instrumen
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => router.push('/dashboard/mpls-lama')}
                >
                  Lihat Dashboard
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a 
                  href="/dashboard/mpls-lama"
                  className="btn btn-outline"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none', lineHeight: '2.5' }}
                >
                  Unduh Excel
                </a>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '0 0.5rem' }}
                  onClick={() => alert('Gunakan tombol Unduh PDF di dalam Dashboard MPLS')}
                >
                  Unduh PDF
                </button>
              </div>
            </div>
          </div>

          {/* Render Kegiatan Dinamis */}
          {kegiatans.map(k => (
            <div key={k.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{k.nama_kegiatan}</h3>
                <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', background: k.status === 'aktif' ? '#10b981' : 'var(--text-secondary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>
                    {k.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', background: k.kategori_program === 'PKG' ? '#8b5cf6' : '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>
                    {k.kategori_program || 'MONEV'}
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
                {k.deskripsi} ({k.tahun})
              </p>
              
              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {k.kategori_program === 'PKG' ? (
                  // Tombol Khusus PKG
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ flex: 1 }}
                        onClick={() => router.push(`/admin/instrumen/builder?kegiatan_id=${k.id}`)}
                      >
                        Kelola Kuesioner (Baku)
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1 }}
                        onClick={() => {
                          const url = `${window.location.origin}/isi-form/public/${k.id}`;
                          navigator.clipboard.writeText(url);
                          alert('Tautan publik form PKG berhasil disalin!\n' + url);
                        }}
                      >
                        Salin Tautan Publik
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ flex: 1 }}
                        onClick={() => router.push(`/dashboard/${k.id}`)}
                      >
                        Lihat Dasbor Analitik
                      </button>
                    </div>
                  </>
                ) : (
                  // Tombol Standar MONEV
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ flex: 1 }}
                        onClick={() => router.push(`/admin/instrumen/builder?kegiatan_id=${k.id}`)}
                      >
                        Kelola Instrumen
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ flex: 1 }}
                        onClick={() => router.push(`/dashboard/${k.id}`)}
                      >
                        Lihat Dashboard
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a 
                        href={`/api/admin/export-excel?kegiatan_id=${k.id}`}
                        className="btn btn-outline"
                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none', lineHeight: '2.5' }}
                      >
                        Unduh Excel
                      </a>
                      <button 
                        className="btn btn-outline" 
                        style={{ flex: 1, padding: '0 0.5rem' }}
                        onClick={() => alert('Fitur Unduh Rekap PDF sedang dikembangkan (AI-Generated PDF)')}
                      >
                        Unduh PDF
                      </button>
                    </div>
                  </>
                )}
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
              <div className="form-group">
                <label>Kategori Program</label>
                <select 
                  required 
                  value={form.kategori_program} 
                  onChange={e => setForm({...form, kategori_program: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  <option value="MONEV">Monitoring & Evaluasi (MONEV)</option>
                  <option value="PKG">Peningkatan Kompetensi Guru (PKG)</option>
                </select>
                {form.kategori_program === 'PKG' && (
                  <p style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '0.5rem' }}>
                    * Instrumen Evaluasi Baku (IKP & Panitia) akan di-generate otomatis untuk kegiatan PKG ini.
                  </p>
                )}
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
