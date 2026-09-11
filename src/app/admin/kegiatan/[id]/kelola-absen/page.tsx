"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function KelolaAbsenPage() {
  const params = useParams();
  const router = useRouter();
  const kegiatanId = params.id as string;

  const [kegiatan, setKegiatan] = useState<any>(null);
  const [sesiList, setSesiList] = useState<any[]>([]);
  const [pesertaList, setPesertaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [namaSesi, setNamaSesi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [toleransi, setToleransi] = useState('15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal QR
  const [showQrModal, setShowQrModal] = useState<any>(null);

  useEffect(() => {
    if (kegiatanId) {
      fetchData();
    }
  }, [kegiatanId]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Fetch Kegiatan
    const { data: keg } = await supabase.from('kegiatan').select('*').eq('id', kegiatanId).single();
    if (keg) setKegiatan(keg);

    // 2. Fetch Sesi
    const { data: sesi } = await supabase.from('sesi_kegiatan').select('*').eq('kegiatan_id', kegiatanId).order('tanggal', { ascending: true }).order('jam_mulai', { ascending: true });
    if (sesi) setSesiList(sesi);

    // 3. Fetch Peserta
    const { data: peserta } = await supabase.from('daftar_peserta').select('*').eq('kegiatan_id', kegiatanId).order('nama', { ascending: true });
    if (peserta) setPesertaList(peserta);

    setIsLoading(false);
  };

  const handleCreateSesi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = crypto.randomUUID(); // Auto generate QR token

    const { error } = await supabase.from('sesi_kegiatan').insert([{
      kegiatan_id: kegiatanId,
      nama_sesi: namaSesi,
      tanggal: tanggal,
      jamMulai: jamMulai, // Wait! the DB column is jam_mulai!
      // Let me fix the payload
      jam_mulai: jamMulai,
      toleransi_menit: parseInt(toleransi),
      qr_token: token,
      status: 'aktif'
    }]);

    if (error) {
      alert('Gagal membuat sesi: ' + error.message);
    } else {
      setNamaSesi('');
      setTanggal('');
      setJamMulai('');
      fetchData();
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="container" style={{ padding: '4rem 1rem' }}>Memuat data ruang rahasia...</div>;
  if (!kegiatan) return <div className="container" style={{ padding: '4rem 1rem' }}>Kegiatan tidak ditemukan.</div>;

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/kegiatan" className="btn btn-outline">← Kembali</Link>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Kelola Absensi (DEV)</h1>
      </div>

      <div style={{ background: '#fef3c7', color: '#b45309', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #fde68a' }}>
        <strong>Halaman Rahasia (Shadow Development)</strong>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Halaman ini tidak dapat diakses oleh Panitia karena tombolnya disembunyikan. Segala perubahan yang Anda buat di sini aman untuk diuji coba.</p>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{kegiatan.nama_kegiatan}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Peserta Terdaftar: <strong>{pesertaList.length}</strong> orang</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Form Buat Sesi Baru */}
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Buat Sesi Absen Baru</h3>
          <form onSubmit={handleCreateSesi}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Nama Sesi (Misal: Hari 1 - Pagi)</label>
              <input type="text" className="input-text" required value={namaSesi} onChange={e => setNamaSesi(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Tanggal Sesi</label>
              <input type="date" className="input-text" required value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Jam Mulai (WIB)</label>
              <input type="time" className="input-text" required value={jamMulai} onChange={e => setJamMulai(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Toleransi Keterlambatan (Menit)</label>
              <input type="number" className="input-text" required value={toleransi} onChange={e => setToleransi(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Buat Sesi & Hasilkan QR'}
            </button>
          </form>
        </div>

        {/* Daftar Sesi */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Daftar Sesi Kegiatan</h3>
          {sesiList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
              Belum ada sesi yang dibuat. Silakan buat sesi pertama di sebelah kiri.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sesiList.map(sesi => (
                <div key={sesi.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{sesi.nama_sesi}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      {sesi.tanggal} • {sesi.jam_mulai} WIB • Toleransi {sesi.toleransi_menit}m
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowQrModal(sesi)}>
                      Lihat QR Code
                    </button>
                    <Link href={`/admin/kegiatan/${kegiatanId}/kelola-absen/rekap?sesi_id=${sesi.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      Rekap Kehadiran
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal QR Code */}
      {showQrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>QR Code Absensi</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{showQrModal.nama_sesi}</p>
            
            {/* Generate QR using external API for simplicity during DEV */}
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '1.5rem' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/absen/${showQrModal.qr_token}` : '')}`} 
                alt="QR Code"
                style={{ width: '250px', height: '250px' }}
              />
            </div>
            
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: '1.5rem', color: '#64748b' }}>
              Link: {typeof window !== 'undefined' ? `${window.location.origin}/absen/${showQrModal.qr_token}` : `/absen/${showQrModal.qr_token}`}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowQrModal(null)}>Tutup</button>
          </div>
        </div>
      )}
    </main>
  );
}
