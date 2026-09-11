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

  // Modal QR & Edit
  const [showQrModal, setShowQrModal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);
  
  // Edit form states
  const [editNamaSesi, setEditNamaSesi] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editJamMulai, setEditJamMulai] = useState('');
  const [editToleransi, setEditToleransi] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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

  const handleDeleteSesi = async (sesiId: string, namaSesi: string) => {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS sesi "${namaSesi}"?\n\nPERINGATAN: Semua data kehadiran peserta di sesi ini akan ikut terhapus selamanya!`)) return;

    const { error } = await supabase.from('sesi_kegiatan').delete().eq('id', sesiId);
    if (error) {
      alert('Gagal menghapus sesi: ' + error.message);
    } else {
      fetchData(); // Refresh data
    }
  };

  const openEditModal = (sesi: any) => {
    setEditNamaSesi(sesi.nama_sesi);
    setEditTanggal(sesi.tanggal);
    setEditJamMulai(sesi.jam_mulai);
    setEditToleransi(sesi.toleransi_menit.toString());
    setShowEditModal(sesi);
  };

  const handleUpdateSesi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    const { error } = await supabase.from('sesi_kegiatan').update({
      nama_sesi: editNamaSesi,
      tanggal: editTanggal,
      jam_mulai: editJamMulai,
      toleransi_menit: parseInt(editToleransi)
    }).eq('id', showEditModal.id);

    if (error) {
      alert('Gagal mengubah sesi: ' + error.message);
    } else {
      setShowEditModal(null);
      fetchData();
    }
    setIsEditing(false);
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
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowQrModal(sesi)}>
                      Lihat QR Code
                    </button>
                    <Link href={`/admin/kegiatan/${kegiatanId}/kelola-absen/rekap?sesi_id=${sesi.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      Rekap Kehadiran
                    </Link>
                    <div style={{ borderLeft: '1px solid #e2e8f0', height: '24px', margin: '0 0.25rem' }}></div>
                    <button 
                      onClick={() => openEditModal(sesi)}
                      style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }} 
                      title="Edit Sesi"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteSesi(sesi.id, sesi.nama_sesi)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }} 
                      title="Hapus Sesi"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Sesi */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Sesi Absensi</h3>
            <form onSubmit={handleUpdateSesi}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Nama Sesi</label>
                <input type="text" className="input-text" required value={editNamaSesi} onChange={e => setEditNamaSesi(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Tanggal Sesi</label>
                <input type="date" className="input-text" required value={editTanggal} onChange={e => setEditTanggal(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Jam Mulai (WIB)</label>
                <input type="time" className="input-text" required value={editJamMulai} onChange={e => setEditJamMulai(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Toleransi (Menit)</label>
                <input type="number" className="input-text" required value={editToleransi} onChange={e => setEditToleransi(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditModal(null)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isEditing}>
                  {isEditing ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
