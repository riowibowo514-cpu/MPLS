"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AbsenPesertaPage() {
  const params = useParams();
  const qrToken = params.qr_token as string;

  const [sesi, setSesi] = useState<any>(null);
  const [kegiatan, setKegiatan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Participant Data
  const [savedPesertaId, setSavedPesertaId] = useState<string | null>(null);
  const [savedPesertaName, setSavedPesertaName] = useState<string | null>(null);
  const [namaBaru, setNamaBaru] = useState('');
  const [instansiBaru, setInstansiBaru] = useState('');
  const [kabKotaBaru, setKabKotaBaru] = useState('');

  // Signature Pad
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (qrToken) fetchSesi();
    
    // Check local storage for memory
    const pid = localStorage.getItem('bgtk_peserta_id');
    const pname = localStorage.getItem('bgtk_peserta_name');
    if (pid && pname) {
      setSavedPesertaId(pid);
      setSavedPesertaName(pname);
    }
  }, [qrToken]);

  const fetchSesi = async () => {
    setIsLoading(true);
    const { data: sesiData, error: sesiErr } = await supabase
      .from('sesi_kegiatan')
      .select('*, kegiatan(*)')
      .eq('qr_token', qrToken)
      .single();

    if (sesiErr || !sesiData) {
      setErrorMsg('Sesi absensi tidak ditemukan atau tidak valid.');
      setIsLoading(false);
      return;
    }

    if (sesiData.status !== 'aktif') {
      setErrorMsg('Mohon maaf, sesi absensi ini telah ditutup oleh panitia.');
      setIsLoading(false);
      return;
    }

    setSesi(sesiData);
    setKegiatan(sesiData.kegiatan);
    setIsLoading(false);
  };

  // --- Signature Pad Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while drawing on mobile
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while drawing on mobile
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // --- Submit Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSignature) {
      alert('Mohon bubuhkan tanda tangan Anda terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureImage = canvasRef.current?.toDataURL('image/png') || '';
      
      const payload = {
        qrToken,
        pesertaId: savedPesertaId, // Could be null if new
        nama: savedPesertaId ? savedPesertaName : namaBaru,
        instansi: instansiBaru,
        kabKota: kabKotaBaru,
        ttdDigital: signatureImage
      };

      const res = await fetch('/api/absensi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');

      // Save to device memory for next session
      if (data.peserta_id && data.nama) {
        localStorage.setItem('bgtk_peserta_id', data.peserta_id);
        localStorage.setItem('bgtk_peserta_name', data.nama);
      }

      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetMemory = () => {
    localStorage.removeItem('bgtk_peserta_id');
    localStorage.removeItem('bgtk_peserta_name');
    setSavedPesertaId(null);
    setSavedPesertaName(null);
  };

  if (isLoading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Memuat informasi sesi...</div>;
  if (errorMsg) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: '#dc2626' }}>{errorMsg}</div>;

  if (isSuccess) {
    return (
      <main className="container animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Kehadiran Tercatat!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Terima kasih <strong>{savedPesertaName || namaBaru}</strong>. Kehadiran Anda pada sesi <strong>{sesi.nama_sesi}</strong> telah berhasil direkam oleh sistem.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>{kegiatan.nama_kegiatan}</h1>
          <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600 }}>
            {sesi.nama_sesi} • {sesi.tanggal}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {savedPesertaId ? (
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Selamat datang kembali,</p>
              <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{savedPesertaName}</h3>
              <button type="button" onClick={handleResetMemory} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}>
                Bukan saya? Ganti identitas
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Sistem tidak mendeteksi memori kehadiran Anda. Silakan isi identitas untuk sesi pertama ini.</p>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Nama Lengkap (Gelar)</label>
                <input type="text" className="input-text" required value={namaBaru} onChange={e => setNamaBaru(e.target.value)} placeholder="Contoh: Budi Setiawan, M.Pd" />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Instansi / Asal Sekolah</label>
                <input type="text" className="input-text" required value={instansiBaru} onChange={e => setInstansiBaru(e.target.value)} placeholder="Contoh: SMAN 1 Padang" />
              </div>
              <div className="form-group">
                <label>Kabupaten / Kota</label>
                <input type="text" className="input-text" required value={kabKotaBaru} onChange={e => setKabKotaBaru(e.target.value)} placeholder="Contoh: Kab. Padang Pariaman" />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span>Tanda Tangan Digital <span style={{ color: 'red' }}>*</span></span>
            </label>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', position: 'relative', overflow: 'hidden', marginBottom: '0.5rem' }}>
              {!hasSignature && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Goreskan tanda tangan Anda di sini
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                style={{ width: '100%', height: '200px', cursor: 'crosshair', touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            
            {/* Tombol Hapus/Bersihkan yang lebih menonjol */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button 
                  type="button" 
                  onClick={clearSignature} 
                  disabled={!hasSignature}
                  style={{ 
                    background: hasSignature ? '#fee2e2' : '#f1f5f9', 
                    border: 'none', 
                    color: hasSignature ? '#ef4444' : '#94a3b8', 
                    fontSize: '0.85rem', 
                    padding: '0.4rem 1rem', 
                    borderRadius: '4px',
                    cursor: hasSignature ? 'pointer' : 'not-allowed',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  Hapus Tanda Tangan
                </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1.1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Merekam Kehadiran...' : 'Konfirmasi Kehadiran'}
          </button>
        </form>
      </div>
    </main>
  );
}
