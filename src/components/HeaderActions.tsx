"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderActions() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      window.location.href = '/';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Link href="/" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
        Beranda
      </Link>
      <Link href="/isi-form" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
        Isi Instrumen
      </Link>
      <Link href="/cari" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
        Cari Hasil
      </Link>
      {isAdmin ? (
        <button 
          className="btn" 
          onClick={handleLogout} 
          style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.875rem', 
            backgroundColor: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            border: '1px solid var(--danger)' 
          }}
        >
          Logout Admin
        </button>
      ) : (
        <Link href="/admin" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          Admin
        </Link>
      )}
    </div>
  );
}
