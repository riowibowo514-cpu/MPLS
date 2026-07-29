"use client";

import Link from 'next/link';

export default function PortalMonevPage() {
  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
          Portal Evaluasi BGTK Provinsi Sumatera Barat
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Sistem Terpadu Monitoring dan Evaluasi (Monev) Kegiatan Guru dan Tenaga Kependidikan. Silakan pilih akses masuk Anda:
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Card Petugas */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #10b981' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Saya Petugas Monev</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Akses untuk mengisi instrumen monev (seperti MPLS, Matgem) yang siap ditandatangani.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <Link href="/kegiatan" className="btn btn-primary" style={{ width: '100%' }}>
              Isi Instrumen Baru
            </Link>
          </div>
        </div>

        {/* Card Pimpinan */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #3b82f6' }}>
          <div style={{ width: '64px', height: '64px', background: '#dbeafe', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Saya Pimpinan</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Akses dashboard terbatas untuk memantau rekapitulasi data, grafik, dan statistik dari seluruh kegiatan Monev BGTK.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%', background: '#3b82f6' }}>
            Login Pimpinan
          </Link>
        </div>

        {/* Card Admin */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ width: '64px', height: '64px', background: '#ede9fe', color: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Saya Admin BGTK</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Area khusus untuk membuat kegiatan baru, menyusun form instrumen dinamis, dan mengekspor seluruh data mentah (Excel).
          </p>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6', color: 'white' }}>
            Login Admin
          </Link>
        </div>

      </div>
    </main>
  );
}
