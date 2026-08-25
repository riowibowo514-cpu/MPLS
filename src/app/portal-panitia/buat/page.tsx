"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BuatEvaluasi() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    namaKegiatan: '',
    deskripsi: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0],
    adaKonsumsi: true,
    adaPenginapan: true,
    pin: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successLink, setSuccessLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.pin.length < 6) {
      setError('PIN Akses minimal harus 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/panitia/buat-evaluasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat merakit instrumen.');
      }

      // Berhasil
      setSuccessLink(`${window.location.origin}/evaluasi/${data.kegiatan_id}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(successLink);
    alert('Link berhasil disalin!');
  };

  if (successLink) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ marginBottom: '1rem', color: '#065f46' }}>Formulir Berhasil Dirakit!</h2>
          <p style={{ marginBottom: '2rem', color: '#4b5563' }}>
            Instrumen evaluasi Anda telah siap. Silakan bagikan link di bawah ini kepada para peserta kegiatan Anda.
          </p>
          
          <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1.1rem', color: '#111827' }}>
            {successLink}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <button className="btn btn-primary" onClick={copyToClipboard} style={{ flex: 1 }}>
              Salin Link
            </button>
            <a href={successLink} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
              Buka Form
            </a>
          </div>

          <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '8px', borderLeft: '4px solid #f59e0b', textAlign: 'left' }}>
            <strong>Penting:</strong> Simpan PIN Rahasia Anda (<span style={{ letterSpacing: '2px', fontWeight: 'bold' }}>{formData.pin}</span>). Anda akan membutuhkannya untuk mengunduh rekapitulasi nilai Excel nanti.
          </div>
          
          <div style={{ marginTop: '3rem' }}>
            <Link href="/portal-panitia" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 'bold' }}>
              Kembali ke Portal Panitia
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/portal-panitia" style={{ color: 'var(--text-secondary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Rakit Form Evaluasi</h1>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <p style={{ marginBottom: '2rem', color: '#4b5563' }}>
          Sistem akan membuatkan instrumen evaluasi secara otomatis berdasarkan <strong>Master Template Evaluasi</strong>. Silakan isi detail acara dan sesuaikan aspek yang dinilai.
        </p>

        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nama Kegiatan (Judul Evaluasi)</label>
            <input 
              type="text" 
              required
              className="form-control"
              placeholder="Contoh: PKG Angkatan 1 BGTK Sumbar"
              value={formData.namaKegiatan}
              onChange={e => setFormData({...formData, namaKegiatan: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Deskripsi (Opsional)</label>
            <textarea 
              className="form-control"
              placeholder="Penjelasan singkat mengenai acara ini..."
              rows={3}
              value={formData.deskripsi}
              onChange={e => setFormData({...formData, deskripsi: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tanggal Mulai</label>
              <input 
                type="date" 
                required
                className="form-control"
                value={formData.tanggalMulai}
                onChange={e => setFormData({...formData, tanggalMulai: e.target.value})}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tanggal Selesai</label>
              <input 
                type="date" 
                required
                className="form-control"
                value={formData.tanggalSelesai}
                onChange={e => setFormData({...formData, tanggalSelesai: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Aspek Penilaian Ekstra</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Hilangkan centang jika acara Anda tidak memiliki aspek berikut. Sistem otomatis akan menghapus pertanyaan terkait dari form.
            </p>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.adaKonsumsi}
                onChange={e => setFormData({...formData, adaKonsumsi: e.target.checked})}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span style={{ fontWeight: 'bold' }}>Sertakan Evaluasi Konsumsi</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.adaPenginapan}
                onChange={e => setFormData({...formData, adaPenginapan: e.target.checked})}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span style={{ fontWeight: 'bold' }}>Sertakan Evaluasi Penginapan / Akomodasi</span>
            </label>
          </div>

          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#92400e' }}>PIN Akses Panitia (Penting!)</label>
            <p style={{ fontSize: '0.875rem', color: '#b45309', marginBottom: '1rem' }}>
              Buat PIN berupa angka/huruf rahasia (minimal 6 karakter). PIN ini akan ditanyakan saat Anda mengunduh hasil evaluasi.
            </p>
            <input 
              type="text" 
              required
              minLength={6}
              maxLength={15}
              className="form-control"
              placeholder="Contoh: JOSS123"
              value={formData.pin}
              onChange={e => setFormData({...formData, pin: e.target.value})}
              style={{ border: '2px solid #fbbf24' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#10b981', borderColor: '#10b981' }}
            disabled={isLoading}
          >
            {isLoading ? 'Sedang Merakit Sistem...' : 'Rakit Form Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
