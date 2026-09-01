import Link from 'next/link';

export default function PortalPanitiaHub() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111827' }}>Portal Panitia Kegiatan</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Layanan mandiri (Self-Service) khusus Panitia BGTK. Rakit form evaluasi kegiatan Anda dengan cepat atau unduh hasil data responden yang telah terekam.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        
        {/* Card Buat Instrumen */}
        <div className="card" style={{ flex: '1 1 350px', maxWidth: '400px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #10b981' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Buat Instrumen Evaluasi</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Rakit formulir evaluasi PKG baru secara otomatis berdasarkan spesifikasi acara (misal: konsumsi & penginapan).
          </p>
          <Link href="/portal-panitia/buat" className="btn btn-primary" style={{ width: '100%', background: '#10b981', borderColor: '#10b981', color: 'white' }}>
            Rakit Form Baru
          </Link>
        </div>

        {/* Card Unduh Hasil */}
        <div className="card" style={{ flex: '1 1 350px', maxWidth: '400px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #f59e0b' }}>
          <div style={{ width: '64px', height: '64px', background: '#fef3c7', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Cek & Unduh Hasil</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Unduh rekapitulasi data Excel dari responden. Membutuhkan PIN Rahasia yang Anda buat saat merakit instrumen.
          </p>
          <Link href="/portal-panitia/hasil" className="btn btn-primary" style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b', color: 'white' }}>
            Cek Hasil
          </Link>
        </div>

      </div>
      
    </main>
  );
}
