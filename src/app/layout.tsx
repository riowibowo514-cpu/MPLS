import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Monev MPLS Ramah 2026",
  description: "Aplikasi Monitoring dan Evaluasi MPLS Ramah 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <header className="app-header">
          <div className="container" style={{ paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" className="app-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              Monev MPLS 2026
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/cari" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Cari Hasil
              </Link>
              <Link href="/admin" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Admin
              </Link>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
