"use client";

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/') return null;

  const handleBack = () => {
    // Jika berada di halaman utama masing-masing role, kembali langsung ke Beranda (root)
    if (
      pathname === '/admin/kegiatan' || 
      pathname === '/dashboard' || 
      pathname === '/portal-panitia' || 
      pathname === '/kegiatan'
    ) {
      router.push('/');
    } else {
      // Deteksi jika halaman ini dibuka di tab baru (history length sangat pendek)
      // Ini biasa terjadi pada fitur Cetak PDF yang menggunakan target="_blank"
      if (typeof window !== 'undefined' && window.history.length <= 2) {
        // Coba tutup tab
        window.close();
        
        // Sebagai fallback jika browser menolak menutup tab (karena strict policy),
        // paksa pindah ke halaman sebelumnya secara logis.
        setTimeout(() => {
          if (pathname.includes('/portal-panitia/hasil/')) {
            router.push('/portal-panitia/hasil');
          } else {
            router.push('/');
          }
        }, 100);
      } else {
        router.back();
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '3rem auto 2rem' }} className="container">
      <button 
        onClick={handleBack} 
        className="btn btn-outline"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Kembali
      </button>
    </div>
  );
}
