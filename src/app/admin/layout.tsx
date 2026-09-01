import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        <Link href="/admin/kegiatan" className="btn btn-outline" style={{ border: 'none', borderBottom: '2px solid transparent' }}>
          Kelola Kegiatan
        </Link>
        <Link href="/admin/template" className="btn btn-outline" style={{ border: 'none', borderBottom: '2px solid transparent' }}>
          Master Template
        </Link>
        <Link href="/admin/pengguna" className="btn btn-outline" style={{ border: 'none', borderBottom: '2px solid transparent' }}>
          Kelola Pengguna
        </Link>
        <Link href="/admin/log-unduh" className="btn btn-outline" style={{ border: 'none', borderBottom: '2px solid transparent' }}>
          Log Unduh & Cetak
        </Link>
      </div>
      {children}
    </div>
  );
}
